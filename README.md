# AShip
A very simple HTML5 Javascipt game engine.

This is my attempt at building a game engine. I originally started out using 
<a href="https://github.com/ericdrowell/KineticJS/">KineticJS</a> for rendering with canvas, but due to a number of factors I decided to write my own rendering code. The project was started back in October 2013 and is still ongoing.

# Libraries Used

- <a href="https://github.com/bottlepy/bottle">Bottle.py</a> - Used to host a small server
- <a href="http://jquery.com">Jquery</a> - Cross-browser support
- <a href="https://github.com/jquery/jquery-mousewheel/">Jquery-mousewheel</a> - Used to get mousewheel input

Everything else is made from scratch on top of canvas.

# Features

(Add list here)

# Examples

(Add comments here)

```javascript
// main({imageName:image, ..}) ~ takes a object of images
function main(images) {
  
  // create the main library
  var easy = easyFrame();

  // Create the layerController, which manages canvases
	var layerController = easy.base.getLayerController({
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
	  pos:[DATA.screenRatio[0]/2, 50], // Position x = center of the canvas, y = 50
	  ratio:[150, 50], // Width, Height
	  color:"green" // Fill color
	  // Pass anything else you want rectangle to remember
	});
	
	// add our rectangle to the mainLayer
	layerController.getLayer("mainLayer").add(rectangle);
	
	var mainLoop = easy.base.loop({
	  func:function(frame) {
	    
	  }, 
	  fps:60, // if your browser is reporting less than 60 fps then set fps to 80 (Such is the case with opera)
	  useRAF:true // request animation frame
	});
	
	// Start the loop
	mainLoop.start();
	
	DATA.mainLoop = mainLoop;
}
```
