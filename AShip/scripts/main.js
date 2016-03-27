function setup(images, toFrage) {
	var frage = toFrage;

	// Create the layerController (AKA - Graphic controller)
	var layerController = frage.Graphics.getLayerController({
		ratio: [720, 640]
	});
	layerController.setup(document.getElementById("container"));

	// Create Logic controller
	var logicController = frage.Base.getLogicController();

	// Create all the layers we are going to use, order matters
	layerController.add("backgroundLayer", frage.Graphics.getLayer());
	layerController.add("particleLayer", frage.Graphics.getLayer());
	layerController.add("objectLayer", frage.Graphics.getLayer());
	layerController.add("hud", frage.Graphics.getLayer());
	layerController.add("menu", frage.Graphics.getLayer());
	layerController.add("devOverlay", frage.Graphics.getLayer());

	// Create an eventContext to handle input.
	var inputEventContext = frage.Events.getEventContext();

	// Data object
	var DATA = {
		images: images,
		imageFrames:{
			"spritePlayer":{
				"idle":[[0, 0, 52, 64], [52, 0, 52, 64], [104, 0, 52, 64]],
				"forward":[[156, 0, 52, 64], [208, 0, 52, 64], [260, 0, 52, 64]],
				"left":[[312, 0, 52, 64]],
				"right":[[364, 0, 52, 64]]
			},
			// Ping_sprite_small.png
			"buoy": {
				"idle":[
					[0, 0, 11, 11], [11, 0, 11, 11], [11*2, 0, 11, 11], [11*3, 0, 11, 11],
					[11*4, 0, 11, 11], [11*5, 0, 11, 11], [11*6, 0, 11, 11],
					[11*7, 0, 11, 11], [11*8, 0, 11, 11], [11*9, 0, 11, 11],
					[11*10, 0, 11, 11], [11*11, 0, 11, 11], [11*12, 0, 11, 11]
				]
			}
		},
		layerController: layerController,
		logicController: logicController,
		screenRatio: layerController.ratio,
		inputEventContext: inputEventContext,
		mainLoop: undefined,
		toFrage: frage,
		debug: true
	};

	// Start main
	main(DATA);
}

function main(DATA) {

	// Setup listeners for key and mouse input. It shouldn't be here but I'm moving things around.
	var input = DATA.toFrage.Input.getInput();
	input.addListeners();

	// Create all the content
	createContent(DATA);

	// Make the loop
	mainLoop = DATA.toFrage.Base.loop({func:function(frame) {
		// update keys
		//var gatheredData = DATA.toFrage.Base.extend(mouse.getInput(), key.getInput());
		//console.log(gatheredData["input"]);
		DATA.inputEventContext.update(input.getInput()["input"]);

		//DATA.inputController.inputContext(DATA.keyMouseController.update());
		// Add project/collision layer
		// update logic
		DATA.logicController.update(frame);
		// Update all the layers in the layerController
		DATA.layerController.update();

	}, fps:60, useRAF:true, modifier:1}); // opera won't do 60 FPS (canvas max) if set to 60, to get around that set it to 80.

	// Kick off the loop
	mainLoop.start();

	// Put a handle on the loop
	DATA.mainLoop = mainLoop;
}
