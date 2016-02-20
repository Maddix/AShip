
function createContent(DATA) {
	// Define common layers from the layerController
	var backgroundLayer = DATA.layerController.getLayer("backgroundLayer");
	var particleLayer = DATA.layerController.getLayer("particleLayer");
	var objectLayer = DATA.layerController.getLayer("objectLayer");
	var hud = DATA.layerController.getLayer("hud");
	var menu = DATA.layerController.getLayer("menu");
	var devOverlay = DATA.layerController.getLayer("devOverlay");
	var logic = DATA.logicController;
	var frage = DATA.toFrage;


	/* ====================== *
	   Background setup stuff
	*  ====================== */

	// Background rect, to be the bottom layer
	var background = frage.Graphics.getRectangle({
		pos:[0, 0],
		ratio:[DATA.screenRatio[0], DATA.screenRatio[1]],
		color:"black"
	});
	backgroundLayer.add(background);


	// *  ===== *
	//    Input
	// *  ===== *

	var mouseEvent = frage.Events.stateEvent({
		triggers: ["mouseMove"],
		returnOnSuccess: ["mouseMove"]
	});
	DATA.inputEventContext.add("mouseContext", mouseEvent);

	// * ============ *
	//   Mouse Cursor
	// * ============ *

	var cursor = frage.Graphics.getAtomImage({
		image:DATA.images["cursor"],
		pos:[DATA.screenRatio[0]/2, DATA.screenRatio[1]/2],
		offset:[DATA.images["cursor"].width/2, DATA.images["cursor"].height/2]
	});
	cursor.updateLogic = function(frame) {
		this.rotation += Math.PI/1.6*frame.delta;
	};
	mouseEvent.add("cursorMove", function(input) {
		var move = input["mouseMove"]
		cursor.pos = [move[0], move[1]];
	});
	devOverlay.add(cursor);
	logic.add("cursor", cursor);

	// -------
	// Windows
	// -------

	var containerController = frage.WindowLib.container({
		pos: [0, 0],
		ratio: DATA.screenRatio
	});

	console.log("Adding containerController to menu layer status:", menu.add(containerController));
	console.log("Adding containerController to logic layer status:", logic.add("windowController", containerController));

	// FPS and Delta display
	// ---------------------

	var displayFPS = frage.WindowLib.text({
		text: "FPS:",
		arrangePos: [.1, .5],
		arrangeRatio: [0, 0],
		baseline: "middle"
	}, 15);
	displayFPS.updateLogic = function(frame) {
		this.text = "FPS: " + frame.rate;
	};
	//menuProfile.add("displayFPS", displayFPS);

	var displayDelta = frage.WindowLib.text({
		text: "Delta:",
		arrangePos: [.6, .5],
		arrangeRatio: [0, 0],
		baseline: "middle"
	}, 15);
	displayDelta.updateLogic = function(frame) {
		this.text = "Delta: " + frame.delta;
	};
	//menuProfile.add("displayDelta", displayDelta);

	var displayBackground = frage.WindowLib.touchSquare({
		color: "orange",
		borderWidth: 2,
		borderColor: "white",
		arrangePos: [0, 0],
		arrangeRatio: [1, 1]
	});
	//menuProfile.add("displayBackground", displayBackground);

	var displayContainer = frage.WindowLib.container({
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
