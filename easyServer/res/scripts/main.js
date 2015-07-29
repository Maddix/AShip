// Still needs updating

function setup(images) {
	
	var easy = EasyFrame(); // This shouldn't be added to DATA should be added to this
	
	// Create the layerController (AKA - Graphic controller)
	var layerController = easy.graphics.getLayerController({
		container:"container",
		ratio:[1080, 720] // 720, 640
	});
	layerController.createDiv();
	
	// Create Logic controller
	var logicController = easy.base.getLogicController({
		offset: [layerController.ratio[0]/2, layerController.ratio[1]/2]
	});
	
	// Create all the layers we are going to use, order matters
	layerController.addLayer("backgroundLayer", easy.graphics.getLayer());
	var temp = easy.graphics.getLayer();
	layerController.addLayer("particleLayer", temp);
	layerController.addLayer("objectLayer", easy.graphics.getLayerCollision());	
	layerController.addLayer("hud", easy.graphics.getLayer());
	layerController.addLayer("menu", easy.graphics.getLayer());
	layerController.addLayer("devOverlay", easy.graphics.getLayer());
	
	// Create KeyboardMouseController & InputController
	var keyMouseController = easy.inputHandler.getKeyboardMouseController({
		blacklistKeys: ["upArrow", "leftArrow", "rightArrow", "tab", "escape", "alt", "f5"]
	});
	var inputController = easy.inputHandler.getProfileManager();
	// mousePosition is pre populated because functions depend on it at start
	keyMouseController.mouseEvent = {mousePosition:[layerController.ratio[0]/2, layerController.ratio[1]/2]};
	
	// Create global static Data Object, it shouldn't be global should it. :/ "easyFrame.DATA" ?
	// Get away from global values!
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
		layerController:layerController,
		logicController:logicController,
		screenRatio:layerController.ratio,
		keyMouseController:keyMouseController,
		inputController:inputController,
		mainLoop:undefined,
		easyFrame:easy,
		debug:true
	};

	// Start main
	main(DATA);
}

function main(DATA) {
	
	// Create all the content
	createContent(DATA);
	
	// Make the loop
	mainLoop = DATA.easyFrame.base.loop({func:function(frame) {
		// update keys
		DATA.inputController.update(DATA.keyMouseController.update());
		// Add project/collision layer
		// update logic
		DATA.logicController.update(frame);
		// Update all the layers in the layerController
		DATA.layerController.updateGraphics();
		
	}, fps:80, useRAF:true, modifier:1}); // opera won't do 60 FPS (canvas max) if set to 60, to get around that set it to 80.
	
	// Kick off the loop
	mainLoop.start();
	
	// Put a handle on the loop
	DATA.mainLoop = mainLoop;
}