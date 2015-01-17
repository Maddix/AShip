
function setup(images) {
	
	var easy = easyFrame(); // This shouldn't be added to DATA should be added to this
	
	// Create the layerController	
	var layerController = easy.base.getLayerController({
			container:"container",
			width:1080, // 720
			height:720, // 640
	});
	layerController.createDiv();
	
	// Create all the layers we are going to use, order matters
	layerController.addLayer("backgroundLayer", easy.base.getLayer());
	layerController.addLayer("particleLayer", easy.base.getLayer());
	layerController.addLayer("objectLayer", easy.base.getLayerCollision());
	layerController.addLayer("hud", easy.base.getLayer());
	layerController.addLayer("menu", easy.base.getLayer());
	layerController.addLayer("devOverlay", easy.base.getLayer());
	
	// Create KeyboardMouseController & InputController
	var keyMouseController = easy.inputHandler.getKeyboardMouseController({
		knownKeys: ["LMB", "MMB", "RMB", "w", "a", "s", "d", "q", "e", "r", "space", "enter"]
	});
	var inputController = easy.inputHandler.getInputController();
	
	// Create global static Data Object, it shouldn't be global should it. :/ "easyFrame.DATA" ?
	DATA = {
		images: images,
		imageFrames:{
			"spritePlayer":{
				"idle":[[0, 0, 52, 64], [52, 0, 52, 64], [104, 0, 52, 64]],
				"forward":[[156, 0, 52, 64], [208, 0, 52, 64], [260, 0, 52, 64]],
				"left":[[312, 0, 52, 64]],
				"right":[[364, 0, 52, 64]]
				}
			},
		layerController:layerController,
		screenRatio:[layerController.width, layerController.height],
		keyMouseController:keyMouseController,
		inputController:inputController,
		mainLoop:undefined,
		easyFrame:easy,
		debug:true
	};

	// Start main
	main();
}

function main() {
	
	// Create all the content
	createContent();
	
	// Make the loop
	var mainLoop = DATA.easyFrame.base.loop({func:function(frame) {
		
		// update keys
		DATA.inputController.update(DATA.keyMouseController.update());
		// update physics
		// TODO: add in a physics controller ~ same thing for projectiles
		// Update all the layers in the layerController
		DATA.layerController.update(frame);
		
	}, fps:80, useRAF:true}); // opera won't do 60 FPS (canvas max) if set to 60, to get around that set it to 80.
	
	// Kick off the loop
	mainLoop.start();
	
	// Put a handle on the loop
	DATA.mainLoop = mainLoop;
}