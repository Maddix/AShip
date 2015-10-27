
function createContent(DATA) {
// Define common layers from the layerController
	var backgroundLayer = DATA.layerController.getLayer("backgroundLayer");
	var particleLayer = DATA.layerController.getLayer("particleLayer");
	var objectLayer = DATA.layerController.getLayer("objectLayer");
	var hud = DATA.layerController.getLayer("hud");
	var menu = DATA.layerController.getLayer("menu");
	var devOverlay = DATA.layerController.getLayer("devOverlay");
	var logic = DATA.logicController;
	var easy = DATA.easyFrame;

	/* ====================== *
	   Background setup stuff
	*  ====================== */

	// Background rect, to be the bottom layer
	var background = easy.Graphics.getRectangle({
		pos:[0, 0],
		ratio:[DATA.screenRatio[0], DATA.screenRatio[1]],
		color:"black"
	});
	backgroundLayer.add(background);

	// Directions
	var up = easy.Graphics.getText({text:"'W' to move forward", color:"white", pos:[10, 100]}, 15);
	devOverlay.add(up);
	var side = easy.Graphics.getText({text:"'A' & 'D' to move left and right", color:"white", pos:[10, 130]}, 15);
	devOverlay.add(side);
	var back = easy.Graphics.getText({text:"'S' to move backward", color:"white", pos:[10, 160]}, 15);
	devOverlay.add(back);
	var space = easy.Graphics.getText({text:"'Space' to reset position and velocity", color:"white", pos:[10, 190]}, 15);
	devOverlay.add(space);

	// *  ============= *
	//    Input profile
	// *  ============= *

	var profile = easy.InputHandler.Profile();
	DATA.inputController.add("profile", profile);
	var menuProfile = easy.InputHandler.Profile();
	DATA.inputController.add("menu", menuProfile);


	// * ============ *
	//   Mouse Cursor
	// * ============ *

	var cursor = easy.Graphics.getAtomImage({
		image:DATA.images["cursor"],
		pos:[DATA.screenRatio[0]/2, DATA.screenRatio[1]/2],
		offset:[DATA.images["cursor"].width/2, DATA.images["cursor"].height/2]
	});
	cursor.updateLogic = function(frame) {
		this.rotation += Math.PI/1.6*frame.delta;
	};
	cursor.inputContext = function(input) {
		if (input.mouse["mousePosition"]) {
			this.pos = input.mouse["mousePosition"];
		}
		return input;
	}
	devOverlay.add(cursor);
	logic.add("cursor", cursor);
	profile.add("mouse", cursor);

	// -------
	// Windows
	// -------

	var containerController = easy.WindowLib.container({
		pos: [0, 0],
		ratio: DATA.screenRatio
	});

	console.log("Adding containerController to menu layer status:", menu.add(containerController));
	console.log("Adding containerController to logic layer status:", logic.add("windowController", containerController));

	// FPS and Delta display
	// ---------------------

	var displayFPS = easy.WindowLib.text({
		text: "FPS:",
		arrangePos: [.1, .5],
		arrangeRatio: [0, 0],
		baseline: "middle"
	}, 15);
	displayFPS.updateLogic = function(frame) {
		this.text = "FPS: " + frame.rate;
	};
	menuProfile.add("displayFPS", displayFPS);

	var displayDelta = easy.WindowLib.text({
		text: "Delta:",
		arrangePos: [.6, .5],
		arrangeRatio: [0, 0],
		baseline: "middle"
	}, 15);
	displayDelta.updateLogic = function(frame) {
		this.text = "Delta: " + frame.delta;
	};
	menuProfile.add("displayDelta", displayDelta);

	var displayBackground = easy.WindowLib.touchSquare({
		color: "orange",
		borderWidth: 2,
		borderColor: "white",
		arrangePos: [0, 0],
		arrangeRatio: [1, 1]
	});

	var displayContainer = easy.WindowLib.container({
		arrangePos: [.6, .05],
		arrangeRatio: [.35, .05]
	});

	//displayContainer.add("background", displayBackground, true);
	//displayContainer.add("fps", displayFPS, true);
	//displayContainer.add("delta", displayDelta, true);

	containerController.add("display", displayContainer, true);

	menu.add("container", containerController);

	//menuProfile.add("containerController", containerController);

	/*

	var windowManager = easy.WindowLib.getMenuManager();
	DATA.windowManager = windowManager;

	var statsWindow = easy.WindowLib.getMenuWindow({
		pos: [150, 10],
		ratio: [170, 60],
		arrangeStyle: "free",
		name: "statsWindow"
	});
	windowManager.add("stats", statsWindow);

	var backgroundWidget = easy.WindowLib.getBackgroundRectangleWidget({
		localPos: [0, 0],
		localRatio: [100, 100],
		color: "gray",
		// Good blue color: #4589d3
		borderColor: "#e0952e",
		borderWidth: 2,
		inputContext: function(input) {
			return input;
		}
	});
	backgroundWidget.updateEvents = function(events) {
	};

	if (!statsWindow.add("background", backgroundWidget)) console.log("Failed to add background");

	var fpsWidget = easy.WindowLib.getLabelWidget({
		localPos: [5, 60],
		text: "FPS:",
		color: "#3efa1d",
		font: "Arial Bold",
		ratio: [0, 12]
	});
	fpsWidget.updateLogic = function(frame) {
		this.text = "FPS: " + frame.rate;
	};
	fpsWidget.updateEvents = function(events) {
	};
	statsWindow.add("fps_display", fpsWidget);


	var deltaWidget = easy.Base.extend(easy.Base.deepCopy(fpsWidget), {
		localPos: [60, 60],
		text: "DELTA:",
		color: "#60e6f4"
	}, true);
	deltaWidget.updateLogic = function(frame) {
		this.text = "DELTA: " + frame.delta;
	};
	statsWindow.add("delta_display", deltaWidget);

	var dragWidget = easy.WindowLib.widgetDrag({
		localPos: [0, 0],
		localRatio: [100, 100],
		targetWindow: "statsWindow"
	});
	statsWindow.add("dragWidget", dragWidget);


	menu.add(windowManager);
	logic.add("windowManager", windowManager);
	profile.add("windowManager",

	*/

	/*

	* ======= *
	   Windows
	*  ======= *

	var windowManager = easy.windowLib.getMenuManager();
	DATA.windowManager = windowManager;

	menu.add(windowManager);

	// Add the windowManager to the profile
	profile.add("window", windowManager);

	// Create editWindow
	var editWindow = createEditWindow(windowManager, DATA);



	* ==== *
	   buoy
	*  ==== *
	console.log(DATA.imageFrames);
	var buoy = easy.Base.getAtomAnimation({
		alive: true,
		animationSpeed: 5,
		currentFrame: 6,
		animate: true,
		image: DATA.images["buoy_sprite"],
		offset: [11, 11],
		currentAnimation: "idle",
		animationKeyFrames: DATA.imageFrames["buoy"],
		pos: [400, 600],
		worldPos: [400, 600]
	});

	buoy.updateAnimation = buoy.updateGraphics;

	buoy.updateGraphics = function(frame, world) {
		this.pos[0] = this.worldPos[0] - world.screenPosition[0];
		this.pos[1] = this.worldPos[1] - world.screenPosition[1];
		this.updateAnimation(frame);
	};

	//objectLayer.add(buoy);

	* ===== *
	   Ships
	*  ===== *

	var engineDefault = easy.components.engineNew({
		image:DATA.images["engine"],
		offset:[DATA.images["engine"].width/2, DATA.images["engine"].height/2],
		power: 10
	});

	var engineBackRightNew = easy.Base.newObject({
		//localRotation:Math.PI/8
	}, easy.Base.newObject(engineDefault));

	var engineBackLeftNew = easy.Base.newObject({
		//localRotation:-Math.PI/8
	}, easy.Base.newObject(engineDefault));

	var engineFrontRightNew = easy.Base.newObject({
		localRotation:Math.PI
	}, easy.Base.newObject(engineDefault));

	var engineFrontLeftNew = easy.Base.newObject({
		localRotation:Math.PI
	}, easy.Base.newObject(engineDefault));

	var engineBackNew = easy.Base.newObject({
		power: 10
	}, easy.Base.newObject(engineDefault));

	var engineFrontSideRight = easy.Base.newObject({
		localRotation: Math.PI/2
	}, easy.Base.newObject(engineDefault));

	var engineFrontSideLeft = easy.Base.newObject({
		localRotation: Math.PI*3/2
	}, easy.Base.newObject(engineDefault));

	var ship = easy.components.ship({
		image:DATA.images["playera"],
		offset:[DATA.images["playera"].width/2, DATA.images["playera"].height/2],
		pos:[0, 0],
		alive:true,
		scale: 1,
		worldPos: [500, 500],//[DATA.screenRatio[0]/2, DATA.screenRatio[1] - DATA.screenRatio[1]/10],
		imageSmoothing: true,
		inputContext:function(input) {
			if (input.keys["w"]) {
				this.activate("engine", "forward");
			}
			if (input.keys["a"]) {
				this.activate("engine", "turnLeft");
			}
			if (input.keys["d"]) {
				this.activate("engine", "turnRight");
			}
			if (input.keys["s"]) {
				this.activate("engine", "backward");
			}
			if (input.keys["e"]) {
				this.activate("engine", "strafeLeft");
			}
			if (input.keys["q"]) {
				this.activate("engine", "strafeRight");
			}
			if (input.keys["space"]) {
				this.velocity = [0, 0];
				this.angularVelocity = 0;
				//this.worldPos = [500, 500];
				this.rotation = 0;
			};

			return input;
		}
	});
	//if (!logic.add("ship", ship)) console.log("Ship failed to join the logic layer");
	//objectLayer.add(ship);

	ship.addSlot("engineBackRight", [-10, 10]);
	ship.addSlot("engineBackLeft", [10, 10]);
	ship.addSlot("engineFrontRight", [-10, -10]);
	ship.addSlot("engineFrontLeft", [10, -10]);
	ship.addSlot("engineBack", [0, 10]);
	ship.addSlot("engineFrontSideRight", [-13, 0]);
	ship.addSlot("engineFrontSideLeft", [13, 0]);

	ship.addObject("engineBackRight", engineBackRightNew);
	ship.addObject("engineBackLeft", engineBackLeftNew);
	ship.addObject("engineFrontRight", engineFrontRightNew);
	ship.addObject("engineFrontLeft", engineFrontLeftNew);
	ship.addObject("engineBack", engineBackNew);
	ship.addObject("engineFrontSideRight", engineFrontSideRight);
	ship.addObject("engineFrontSideLeft", engineFrontSideLeft);

	//windowManager.objects["editWindow"].objects["display"].objects["view"].setObject(ship);
	//profile.add("newShip", ship);

	*/

}
