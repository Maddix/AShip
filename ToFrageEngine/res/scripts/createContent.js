
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
	//var up = easy.Graphics.getText({text:"'W' to move forward", color:"white", pos:[10, 100]}, 15);
	//devOverlay.add(up);
	//var side = easy.Graphics.getText({text:"'A' & 'D' to move left and right", color:"white", pos:[10, 130]}, 15);
	//devOverlay.add(side);
	//var back = easy.Graphics.getText({text:"'S' to move backward", color:"white", pos:[10, 160]}, 15);
	//devOverlay.add(back);
	//var space = easy.Graphics.getText({text:"'Space' to reset position and velocity", color:"white", pos:[10, 190]}, 15);
	//devOverlay.add(space);

	// *  ============= *
	//    Input profile
	// *  ============= *

	//var profile = easy.InputHandler.Profile();
	//DATA.inputController.add("profile", profile);
	//var menuProfile = easy.InputHandler.Profile();
	//DATA.inputController.add("menu", menuProfile);


	// *  ===== *
	//    Input
	// *  ===== *

	var key = easy.Input.getKeyInput();
	key.addListeners();

	var pressedkeys = easy.Graphics.getText({text:"Keys:", color:"white", pos:[10, 20]}, 15);
	pressedkeys.updateGraphicsOld = pressedkeys.updateGraphics;
	pressedkeys.updateGraphics = function(){
		this.text = "Keys: " + key.getInput()["inputOrder"];
		this.updateGraphicsOld();
	};
	devOverlay.add(pressedkeys);

	var mouse = easy.Input.getMouseInput();
	mouse.addListeners();

	var pressedMouseEvents = easy.Graphics.getText({text:"Mouse:", color:"white", pos:[10, 40]}, 15);
	pressedMouseEvents.updateGraphicsOld = pressedMouseEvents.updateGraphics;
	pressedMouseEvents.updateGraphics = function(){
		this.text = "Mouse: " + mouse.getInput()["input"]["mousemove"];
		this.updateGraphicsOld();
	};
	devOverlay.add(pressedMouseEvents);

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
	//profile.add("mouse", cursor);

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
	//menuProfile.add("displayFPS", displayFPS);

	var displayDelta = easy.WindowLib.text({
		text: "Delta:",
		arrangePos: [.6, .5],
		arrangeRatio: [0, 0],
		baseline: "middle"
	}, 15);
	displayDelta.updateLogic = function(frame) {
		this.text = "Delta: " + frame.delta;
	};
	//menuProfile.add("displayDelta", displayDelta);

	var displayBackground = easy.WindowLib.touchSquare({
		color: "orange",
		borderWidth: 2,
		borderColor: "white",
		arrangePos: [0, 0],
		arrangeRatio: [1, 1]
	});
	//menuProfile.add("displayBackground", displayBackground);

	var displayContainer = easy.WindowLib.container({
		arrangePos: [.6, .05],
		arrangeRatio: [.35, .05]
	});
	//menuProfile.add("displayContainer", displayContainer);

	displayContainer.add("background", displayBackground);
	displayContainer.add("fps", displayFPS);
	displayContainer.add("delta", displayDelta);

	containerController.add("display", displayContainer);
	menu.add(containerController);

}
