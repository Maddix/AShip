# AShip
A very simple HTML5 Javascipt game engine.

This is my attempt at building a game engine. I originally started out using 
<a href="https://github.com/ericdrowell/KineticJS/">KineticJS</a> for rendering with canvas, but due to a number of factors I decided to write my own rendering code. The project was started back in October 2013 and is still ongoing.

Here is a <a href="http://maddix.github.io/AShip/">live demo</a> of the engine.

# Libraries Used

- <a href="https://github.com/bottlepy/bottle">Bottle.py</a> - Used to host a small server
- <a href="http://jquery.com">Jquery</a> - Cross-browser support
- <a href="https://github.com/jquery/jquery-mousewheel/">Jquery-mousewheel</a> - Used to get mousewheel input

Everything else is made from scratch on top of canvas.

# Features

(Add list here)

# Examples

The example below creates a canvas with a green rectangle that moves to the lower right of the screen by 5px a second.

```javascript
// main({imageName:image, ..}) ~ Takes a object of images
function main(images) {
  
  	/*==========
	  Main setup
	  ==========*/
  
	// create the main library
	var easy = easyFrame();

	// Create the layerController, which manages canvases
	var layerController = easy.base.getLayerController({
		// Place our layerContoller-created-div that holds all the layers into a div called 'container'
		container:"container",
		width:1080, // 720
		height:720, // 640
	});
	layerController.createDiv();
	
	// Create a canvas to draw images on and add it to the layerController
	layerController.addLayer("mainLayer", easy.base.getLayer());
	
	// Create a global object that holds static data and references to other important objects
	DATA = {
		images:images,
		layerController:layerController,
		screenRatio: [layerController.width, layerController.height],
		mainLoop:undefined,
		easyFrame:easy
	};
	
	/*==============
	  Create content
	  ==============*/
	
	var rectangle = easy.base.getAtomRectangle({
		pos:[50, 50], // Set the rectangles position to x = 50, y = 50
		ratio:[150, 50], // Width, Height
		color:"green", // Fill color
		velocity:[5, -5] // displacement in pixels per second
	});
	
	// getAtomRectangle has a update() function already, so we need to preserve it
	rectangle.updateRect = rectangle.update;
	
	// Give rectangle a new update function
	rectangle.update = function(frame) {
		// Change the rectangles position by velocity per second, frame.delta makes sure that the movement is smooth 
		this.pos[0] += this.velocity[0]*frame.delta;
		this.pos[1] += this.velocity[1]*frame.delta;
		// Call the original update function (It doesn't take a frame object)
		this.updateRect();
	};
	
	// Add our rectangle to the mainLayer
	layerController.getLayer("mainLayer").add(rectangle);
	
	/*===========
	  Engine loop
	  ===========*/
	
	var mainLoop = easy.base.loop({
		func:function(frame) {
			// Call update on the layerController and pass in the frame object
			layerController.update(frame); // layerController will update everything in its object list and so on
		}, 
		fps:60, // If your browser is reporting less than 60 fps then set fps to 80 (Such is the case with opera)
		useRAF:true // Request animation frame
	});
	
	// Start the loop
	mainLoop.start();
	
	DATA.mainLoop = mainLoop;
}
```
