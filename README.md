# About
AShip is a HTML5 Javascipt game thats being created beside the ToFrage engine.

ToFrage is my attempt at building a game engine. I originally started out using
<a href="https://github.com/ericdrowell/KineticJS/">KineticJS</a> for rendering with canvas, but due to a number of factors I decided to write my own rendering code. The project was started back in October 2013 and is still ongoing.

Here is a <a href="http://maddix.github.io/AShip/">live demo</a>.

# Libraries Used

- <a href="http://jquery.com">Jquery</a> - Cross-browser support
- <a href="https://github.com/jquery/jquery-mousewheel/">Jquery-mousewheel</a> - Mousewheel input

# Features
- Animations
- Particles
- Input management

# Examples

The example below creates a canvas with a green rectangle that moves to the lower right of the screen by 5px a second.

```javascript
function main() {

  	/*==========
	  Main setup
	  ==========*/

	// create the main library
	var easy = easyFrame();

	// Create the layerController, which manages canvases
	var layerController = easy.base.getLayerController({
		// Place our layerContoller-created-div that holds all the layers into a div called 'container'
		container:"container",
		ratio:[1080, 720] // The width and height of the canvas
	});
	layerController.createDiv();

	// Create a canvas to draw images on and add it to the layerController
	var mainLayer = easy.Base.getLayer();
	// Note that it doesn't matter when you add the layer to the layer controller
	layerController.addLayer("mainLayer", mainLayer);

	// Create a logic controller, this just calls 'updateLogic' on objects you give it and passes in frame
	var logicController = easy.Base.getLogicController();

	/*==============
	  Create content
	  ==============*/

	var rectangle = easy.Base.getAtomRectangle({
		pos: [50, 50], // Set the rectangles position to x = 50, y = 50
		ratio: [150, 50], // Set the width and height of the rectangle
		color: "green", // Fill color
		velocity: [5, -5] // Displacement in pixels per second
	});

	// Add a updateLogic() function to rectangle
	rectangle.updateLogic = function(frame) {
		// Change the rectangles position by velocity per second, frame.delta makes sure that the movement is smooth
		this.pos[0] += this.velocity[0]*frame.delta;
		this.pos[1] += this.velocity[1]*frame.delta;
	};

	// Add our rectangle to the mainLayer
	mainLayer.add(rectangle);
	// Now add it to the logicController
	logicController.add("rectangle", rectangle);

	/*===========
	  Engine loop
	  ===========*/

	var mainLoop = easy.Base.loop({
		func:function(frame) {
			// Call update on the layerController and pass in the frame object
			logicController.update(frame);
			// Now update the layerController
			layerController.updateGraphics();
		},
		fps:60, // If your browser is reporting less than 60 fps then set fps to 80 (Such is the case with opera)
		useRAF:true // Request animation frame (This makes updates slower, but more consistent)
	});

	// Start the loop
	mainLoop.start();
}
```
