
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
	
	var screenSpace = [0, 0];
	
	// This tells canvas to draw with image smoothing (Its on by default)
	//objectLayer.context.imageSmoothingEnabled = true;
	
	
	/* ====================== *
	   Background setup stuff
	*  ====================== */
	
	// Background rect, to be the bottom layer
	var background = easy.base.getAtomRectangle({
		pos:[0, 0],
		ratio:[DATA.screenRatio[0], DATA.screenRatio[1]],
		color:"black"
	});
	backgroundLayer.add(background);
	
	// Create text objects - Not sure if I need to create them here
	var fps = easy.base.getAtomText({text:"FPS", color:"white", ratio:[0, 12], pos:[0, 10]});
	fps.updateText = fps.updateGraphics;
	fps.updateGraphics = function(frame) {
		this.text = "FPS: " + frame.rate;
		this.updateText();
	}
	
	var delta = easy.base.getAtomText({text:"Delta Time", color:"white", ratio:[0, 12], pos:[0, 20]});
	delta.updateText = delta.updateGraphics;
	delta.updateGraphics = function(frame) {
		this.text = "Delta Time: " + frame.delta;
		this.updateText();
	}
	
	// Directions
	var up = easy.base.getAtomText({text:"'W' to move forward", color:"white", ratio:[0, 15], pos:[10, 100]});
	devOverlay.add(up);
	var side = easy.base.getAtomText({text:"'A' & 'D' to move left and right", color:"white", ratio:[0, 15], pos:[10, 130]});
	devOverlay.add(side);
	var back = easy.base.getAtomText({text:"'S' to move backward", color:"white", ratio:[0, 15], pos:[10, 160]});
	devOverlay.add(back);
	var space = easy.base.getAtomText({text:"'Space' to reset position and velocity", color:"white", ratio:[0, 15], pos:[10, 190]});
	devOverlay.add(space);
	
	if (DATA.debug) {
		devOverlay.add(fps);
		devOverlay.add(delta);
	}
	
	/* ============= *
	   Input profile
	*  ============= */
	
	var profile = easy.inputHandler.profile({
		// Broken I think
		userKeyMapping: {"w":"upArrow", "a":"leftArrow", "s":"downArrow", "d":"rightArrow"}
	});
	
	DATA.inputController.add("main", profile);
	
	/* ============ *
	   Mouse Cursor
	*  ============ */
	
	var cursor = easy.base.getAtomImage({
		image:DATA.images["cursor"], 
		pos:[DATA.screenRatio[0]/2, DATA.screenRatio[1]/2],
		offset:[DATA.images["cursor"].width/2, DATA.images["cursor"].height/2],
		imageScale: 4,
		imageSmoothing: true
	});
	cursor.updateImage = cursor.updateGraphics;
	cursor.updateGraphics = function(frame) {
		this.rotation += Math.PI/1.6*frame.delta;
		cursor.updateImage();
	};
	cursor.inputContext = function(input) {
		if (input.mouse["mousePosition"]) {
			this.pos = input.mouse["mousePosition"];
		}
		return input;
	}
	devOverlay.add(cursor);
	
	// add the mouse context
	profile.add("mouse", cursor);
	
	/* ======= *
	   Windows
	*  ======= */

	// Window manager
	// ==============
	
	
	/*
	var windowManager = easy.windowLib.getMenuManager();
	DATA.windowManager = windowManager;
	
	menu.add(windowManager);
	
	// Add the windowManager to the profile
	profile.add("window", windowManager);
	
	// Create editWindow
	var editWindow = createEditWindow(windowManager, DATA);
	*/
	
	
	/* ==== *
	   buoy
	*  ==== */
	console.log(DATA.imageFrames);
	var buoy = easy.base.getAtomAnimation({
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
	
	/* ===== *
	   Ships
	*  ===== */
	
	var engineDefault = easy.components.engineNew({
		image:DATA.images["engine"],
		offset:[DATA.images["engine"].width/2, DATA.images["engine"].height/2],
		power: 10
	});
	
	var engineBackRightNew = easy.base.newObject({
		//localRotation:Math.PI/8
	}, easy.base.newObject(engineDefault));
	
	var engineBackLeftNew = easy.base.newObject({
		//localRotation:-Math.PI/8
	}, easy.base.newObject(engineDefault));
	
	var engineFrontRightNew = easy.base.newObject({
		localRotation:Math.PI
	}, easy.base.newObject(engineDefault));

	var engineFrontLeftNew = easy.base.newObject({
		localRotation:Math.PI
	}, easy.base.newObject(engineDefault));
	
	var engineBackNew = easy.base.newObject({
		power: 10
	}, easy.base.newObject(engineDefault));
	
	var engineFrontSideRight = easy.base.newObject({
		localRotation: Math.PI/2
	}, easy.base.newObject(engineDefault));

	var engineFrontSideLeft = easy.base.newObject({
		localRotation: Math.PI*3/2
	}, easy.base.newObject(engineDefault));
	
	// Make the world move
	var tempWorld = {
		setup: function(context){},
		alive: true,
		updateGraphics: function(frame, world) {
			console.log("Running..");
		}
	}
	//objectLayer.add(tempWorld);
	
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
	
}