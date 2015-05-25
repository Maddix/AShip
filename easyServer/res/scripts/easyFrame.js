// Maddix 2/1/2014 (MM/DD/YYYY)

// ///////////////
// General Issues
//	- Rectangle doesn't play well with alpha
//  - If setting globalAlpha fails when trying to draw, you are passing the wrong "this" to the function. 
//		That or you're missing the "context". 


// /////////////////////////////////////////////
// General Notes for understanding this micro-framework(?)
// - Rotations are in radians.
// - ratio = [width, height] 
// - pos = [x, y]

// This is a Micro-framework
function easyFrame() {

	function base() {
		var localContainer = {
			version:"1.0"
		};

		// Create console logging functions?
		
		// This will copy the object "from" to "to". If "to" isn't given, "to" will be set to a new object
		// rename to shallowCopyObject or something if this is still used later on
		// rename to copyItem
		// Have one function to copy items? 
		localContainer.newObject = function(from, to) {
			to = to ? to : {}; // to = if 'to' is false, replace 'to' with {}, else return 'to'
			if (from) for (var key in from) to[key] = from[key];
			return to;
		};
		
		// Switch the names newObject should be copy and copy should be new
		
		// remove shallow?
		localContainer.copyItem = function(item, shallow) {
			var itemProto = Object.prototype.toString.call(item);
			var newItem = item;
			var getItem = function(child) { return !shallow ? localContainer.copyItem(child) : child; };
			if (itemProto === Object.prototype.toString.call([])) {
				newItem = [];
				for (var itemIndex=0, len=item.length; itemIndex < len; itemIndex++) newItem.push(getItem(item[itemIndex]));
			}
			if (itemProto === Object.prototype.toString.call({})) {
				newItem = {};
				for (var itemIndex in item) newItem[itemIndex] = getItem(item[itemIndex])
			}
			return newItem;
		};
		
		// Why not just use an Array?
		localContainer.orderedObject = function() {
			var local = {
				objects: {},
				objectNames: []
			};
			
			local.add = function(objectName, object) {
				this.objects[objectName] = object;
				this.objectNames.push(objectName);
			};
			
			local.remove = function(objectName) {
				var index = this.objectNames.indexOf(objectName);
				if (index != -1) {
					delete this.objects[objectName];
					this.objectNames.splice(index, 1);
				}
			};
			
			// Leave newIndex blank if you want to move the object to the end
			local.changePosition = function(objectName, newIndex) {
				var index = this.objectNames.indexOf(objectName);
				if (index != -1) {
					this.objectNames.splice(index, 1);
					if (newIndex >= 0 && newIndex < this.objectNames.length) {
						console.log('called');
						this.objectNames.splice(newIndex, 0, objectName);
					} else {
						this.objectNames.push(objectName);
					}
				}
			};
			
			return local;
		};
		
		localContainer.clearScreen = function(context, width, height) {
			context.clearRect(0, 0, width, height);
		};

		localContainer.reset = function(context) {
			// Reset blur?
			context.setTransform(1, 0, 0, 1, 0, 0);
			context.restore();
		};

		// This might not get used as I am revamping ships
		// Ships don't collide with themselves, same for projectiles, but projectiles collide with ships and vis versa
		// Causing projectile slow down when one collides with an object, not good! fixed?
		localContainer.getLayerCollision = function() {
			var local = {
				projectiles: [],
			};
			this.newObject(this.getLayer(), local);
			
			local.addProjectile = function(projectile) {
				projectile.context = this.context;
				this.projectiles.push(projectile);
			};
			
			local.update = function(frame) {
				
				// Clear the screen
				localContainer.clearScreen(this.context, this.canvas.width, this.canvas.height);
			
				for (var objectIndex in this.objects) {
					var object = this.objects[objectIndex];
					
					// If the ship is alive
					if (object.alive) {
						for (var projectileIndex in this.projectiles) {
							var projectile = this.projectiles[projectileIndex];
							
							// If the projectile is alive
							if (projectile.alive) {
								if (checkCircleCollision(object.pos, object.collisionRadius, projectile.pos, projectile.collisionRadius)){
									object.collision(projectile);
									projectile.collision(); 
								}
							}
						}
					}
				}
				
				// Note: Removing dead ships and updating live ones in the same loop causes issues that are due to the use of splice.
				
				// Clear ships that are dead
				for (var objectIndex in this.objects) {
					if (!this.objects[objectIndex].alive) this.objects.splice(objectIndex, 1);
				}
				
				// Update the remaining ships
				for (var objectIndex in this.objects) {
					this.objects[objectIndex].update(frame);
				}
				
				// Clear dead projectiles
				for (var projectileIndex in this.projectiles) {
					if (!this.projectiles[projectileIndex].alive) this.projectiles.splice(projectileIndex, 1);
				}
				
				// Update remaining projectiles
				for (var projectileIndex in this.projectiles) {
					this.projectiles[projectileIndex].update(frame);
				}
				
				
			};
			return local;
		};

		localContainer.getLayer = function() {
			var local = {
				canvas: undefined,
				context: undefined,
				objects: []
			};
			
			local.setup = function(container, id, ratio) {
				this.createCanvas(container, id, ratio);
				this.context = this.canvas.getContext("2d");
			};
			
			local.createCanvas = function(container, id, ratio) {
				var newCanvas = document.createElement("canvas");
				newCanvas.setAttribute("id", id);
				newCanvas.setAttribute("width", ratio[0] + "px");
				newCanvas.setAttribute("height", ratio[1] + "px");
				newCanvas.setAttribute("style", "position: absolute; background-color: transparent;");
				container.appendChild(newCanvas);
				this.canvas = newCanvas;
			};
			
			local.add = function(obj) {
				obj.setup(this.context);
				this.objects.push(obj);
			};
			
			local.update = function(frame) {
				localContainer.clearScreen(this.context, this.canvas.width, this.canvas.height);
				for (var objectIndex in this.objects) {
					this.objects[objectIndex].update(frame);
				}
			};

			return local;
		};

		// /////////////////
		// Layer Controller
		// config {container:"div_id_name", width:720, height:640}
		
		// I need to revamp this
		localContainer.getLayerController = function(config) {
			var local = {
				layerIds: 0,
				incerLayerIds: function() {this.layerIds++;},
				container: undefined, // set the container too?
				ratio: [640, 480],
				div: null, // Pass in a div if your not planning on creating one
				layers: [],
				layerNames: []
			};
			this.newObject(config, local);

			// Set the container
			local.container = document.getElementById(local.container);

			local.addLayer = function(name, newLayer) {
				var layerId = "Layer" + this.layerIds + "_" + name;
				newLayer.setup(this.div, layerId, this.ratio);
				this.incerLayerIds();
				this.layers.push(newLayer);
				this.layerNames.push(name);
			};
			
			local.getLayer = function(name) {
				for (var key in this.layerNames) {
					if (name == this.layerNames[key]) return this.layers[key];
				}
			};
			
			local.createDiv = function() {
				var div = document.createElement("div");
				div.setAttribute("id", "easyFrame");
				div.setAttribute("oncontextmenu", "return false;"); // Stops right-clicking bringing up a context menu
				div.setAttribute("style", "position: relative; width: " + this.ratio[0] + "px; height: " + this.ratio[1] + "px;");
				if (this.container) this.container.appendChild(div);
				this.div = div;
			};
			
			local.update = function(frame) {
				for (var layer in this.layers) this.layers[layer].update(frame);
			};
			
			return local;
		};

		// ////////////////////
		// Basic object - Atom
		localContainer.atom = {
			pos: [0, 0],
			alpha: 1,
			context: null,
			setup: function(context) {this.context = context;}
		};
		
		localContainer.atomPhysics = {
			shape: 2,
			size: 10,
			density: 2,
			mass: 0, // size*density, How this differs from inertia, I'm not sure
			inertia: 20, // Shape*density ? (*shape?)
			velocity: [0, 0],
			angularVelocity: 0,
			calcMass: function(scale) {
				this.mass = this.size*this.density;
				if (scale) this.mass = this.mass*scale;
			},
			calcInertia: function(scale) {
				if (!this.mass) {this.calcMass(scale);} 
				this.inertia = this.mass*this.shape
				if (scale) this.inertia = this.inertia*scale;
			}
		};
		
		localContainer.drawImage = function(context, image, imageOffset, position, rotation) {
			this.translateRotate(context, position, rotation);
			context.drawImage(image, -imageOffset[0], -imageOffset[1]);
			this.reset(context);
		};
		
		localContainer.drawImageScale = function(context, image, imageOffset, position, rotation, scale) {
			this.translateRotate(context, position, rotation);
			context.drawImage(image, -imageOffset[0]*scale, -imageOffset[1]*scale, image.width*scale, image.height*scale);
			this.reset(context);
		};
		
		localContainer.drawImageClip = function(context, image, imageOffset, position, rotation, clipPosition, clipRatio, scale) {
			this.translateRotate(context, position, rotation);
			context.drawImage(image, clipPosition[0], clipPosition[1], clipRatio[0], clipRatio[1], -imageOffset[0]*scale, -imageOffset[1]*scale, image.width*scale, image.height*scale);
			this.reset(context);
		};
		
		localContainer.translateRotate = function(context, position, rotation) {
			context.translate(position[0], position[1]);
			context.rotate(rotation);
		};
		
		localContainer.getAtomAnimationManual = function(config) {
			var local = {
				animationKeyFrames:{}, // {"AnimationName":[x, y, width, height, ..], "Idle":[0, 0, 32, 32], ..}
				currentAnimation:"",
				currentFrame:0,
				imageScale:1 // set to 0?
			};
			this.newObject(this.getAtomImage(config), local);
			
			local.getCurrentAnimationLength = function() {
				return this.animationKeyFrames[this.currentAnimation].length;
			};
			
			local.update = function() {
				var keyFrames = this.animationKeyFrames[this.currentAnimation];
				var frame = this.currentFrame;
				if (this.currentFrame >= keyFrames.length) console.warn("Warning!!! -> Animation keyFrame is out of range");
				this.context.globalAlpha = this.alpha;
				localContainer.drawComplexImage(
					this.context,
					this.image, 
					this.pos,
					this.rotation,
					keyFrames[frame].slice(0, 2), // ImageCut [x, y]
					keyFrames[frame].slice(2, 4), // ImageCut [width, height]
					this.offset, // Image offset
					this.imageScale // Image size, used to stretch or reduce
				);
			};
			return local;
		};
		
		localContainer.getAtomAnimation = function(config) {
			var local = {
				animationSpeed:1, // Per second
				animate:false, // start/continue the animation
				repeatAnimation:true, // Repeat the animation
				elapsedTime:0,	// total time since last update
				lastTime:Date.now(),
				currentLength:0 // Length of animation
			};
			
			// is this the right way of doing things? What does this really do?
			local.changeAnimation = function(config) {
				localContainer.newObject(config, local);
				if (this.currentAnimation !== "") {
					this.currentLength = this.animationKeyFrames[this.currentAnimation].length-1;
				}
			};
			local.changeAnimation(this.getAtomAnimationManual(config));
			local.updateImage = local.update;
			
			local.update = function(frame) {
				var currentTime = Date.now();
				// auto-Animation is independent of the main-loop.
				// Not sure if thats a good thing; if the game slows down the animations won't
				// Its a bad thing I would think, fix this when I start to mess with it again
				if (this.animate) {
					if (this.elapsedTime >= 1000/this.animationSpeed) {
						if (this.currentFrame < this.currentLength) {
							this.currentFrame += 1;
						} else {
							this.currentFrame = 0;
							if (!this.repeatAnimation) {
								this.animate = false;
							}
						}
						this.elapsedTime = 0;
					}
					this.elapsedTime += currentTime - this.lastTime;
					this.lastTime = currentTime;
				}
				// Normal draw stuff
				this.updateImage();
			};
		
			return local;
		};
		
		localContainer.getAtomImage = function(config) {
			var local = {
				image: null,
				rotation: 0,
				offset: [0, 0]
			};
			this.newObject(this.atom, local);
			this.newObject(config, local);
			local.update = function() {
				this.context.globalAlpha = this.alpha;
				localContainer.drawImage(this.context, this.image, this.offset, this.pos, this.rotation);
			};
			return local;
		};

		localContainer.getImageResize = function(config) {
			var local = {
				scale: 1,
				originalOffset: config.offset,
				imageSmoothing: true
			};
			this.newObject(config, local);
			
			local.setScale = function(newScale, imageSmoothing) {
				this.scale = newScale;
				if (imageSmoothing != undefined) {
					if (imageSmoothing) this.imageSmoothing = true;
					else this.imageSmoothing = false;
				}
				if (!this.originalOffset) this.originalOffset = this.offset;
				this.offset = [this.originalOffset[0]*newScale, this.originalOffset[1]*newScale];
			};
			
			local.update = function() {
				this.context.globalAlpha = this.alpha;
				this.context.imageSmoothingEnabled = this.imageSmoothing;
				localContainer.drawImageScale(this.context, this.image, this.offset, this.pos, this.rotation, this.scale);
			};
			
			return local;
		};
		
		localContainer.getAtomText = function(config) {
			var local = {
				text: "null",
				ratio: [0, 20], // text width, text height
				font:"Arial", 
				color:"white",
				align: "start",
				baseline: "alphabetic"
			};
			this.newObject(this.atom, local);
			this.newObject(config, local);
			
			local.setTextWidth = function() {
				this.context.font = this.ratio[1] + "px " + this.font;
				this.ratio[0] = this.context.measureText(this.text).width;
				//console.log(this.text + " is " + this.ratio[0] + "px big!");
			};
			
			local.update = function() {
				this.context.globalAlpha = this.alpha;
				this.context.fillStyle = this.color;
				this.context.textAlign = this.align;
				this.context.textBaseline = this.baseline;
				this.context.font = this.ratio[1] + "px " + this.font;
				this.context.fillText(this.text, this.pos[0], this.pos[1]);
			};
			return local;
		};

		/*
			var antiBlur = 0;
			if (lineThickness % 2) antiBlur = .5;
			pos + antiBlur;
		*/
		
		// What should this be called?
		localContainer.getBaseShape = function() {
			return this.newObject(this.atom, {
				ratio:[100, 100],
				color:"white"
			});
		};
		
		localContainer.getBaseBorder = function() {
			return {
				borderWidth:1,
				borderColor:"black",
				borderStyle:"round", // bevel, round, miter
				borderAlpha:1
			};
		};

		// No border FYI
		localContainer.getAtomRectangleSimple = function(config) {
			var local = this.getBaseShape();
			this.newObject(config, local);
			
			local.update = function() {
				// Blur, its really slow. Cash the object with the blur when in use.
				//this.context.shadowBlur = 1;
				//this.context.shadowColor = "black";
				
				this.context.beginPath();
				this.context.rect(this.pos[0], this.pos[1], this.ratio[0], this.ratio[1]);
				this.context.globalAlpha = this.alpha;
				this.context.fillStyle = this.color;
				this.context.fill();
			};
			return local;
		};
		
		// About the same speed as the non simple function..
		localContainer.getAtomRectangle = function(config) {
			var local = this.getBaseBorder();
			this.newObject(this.getAtomRectangleSimple(config), local);
			// This system isn't fool proof, I might need another.
			local.updateRectangleColor = local.update;
			
			local.update = function() {
				this.updateRectangleColor();
				
				// Rect border
				this.context.globalAlpha = this.borderAlpha;
				this.context.lineJoin = this.borderStyle;
				this.context.lineWidth = this.borderWidth;
				this.context.strokeStyle = this.borderColor;
				this.context.stroke();
			};
			return local;
		};
		
		localContainer.getAtomLine = function(config) {
			var local = {
				style:"round",
				lineWidth: 1
			};
			this.newObject(this.getBaseShape(), local);
			this.newObject(config, local);
			local.update = function() {
				this.context.globalAlpha = this.alpha;
				this.context.beginPath(); // ?
				this.context.moveTo(this.pos[0], this.pos[1]);
				this.context.lineTo(this.pos[0] + this.ratio[0], this.pos[1] + this.ratio[1]);
				this.context.closePath(); // ?
				this.context.lineJoin = this.style;
				this.context.lineWidth = this.lineWidth;
				this.context.strokeStyle = this.color;
				this.context.stroke();
			};
			return local;
		};

		localContainer.getAtomCustomLines = function(config) {
			var local = {
				style:"round",
				lineWidth:1,
				shape: [] // Holds lists of points, each new list is a new line -> [[startX,startY, x,y, ..], [startX,startY, x,y]]
			};
			this.newObject(this.getBaseShape(), local);
			this.newObject(config, local);
			
			local.update = function() {
				this.context.globalAlpha = this.alpha;
				this.context.beginPath();
				for (var lineIndex=0; lineIndex < this.shape.length; lineIndex++) {
				//for (var lineIndex in this.shape) { // Shouldn't use for-in with arrays
					for (var pointIndex=0; pointIndex < this.shape[lineIndex].length; pointIndex+=2) {
						var line = this.shape[lineIndex];
						if (pointIndex === 0) this.context.moveTo(this.pos[0] + line[pointIndex], this.pos[1] + line[pointIndex+1]);
						else this.context.lineTo(this.pos[0] + line[pointIndex], this.pos[1] + line[pointIndex+1]);
					}
				}
				this.context.lineJoin = this.style;
				this.context.lineWidth = this.lineWidth;
				this.context.strokeStyle = this.color;
				this.context.stroke();
				
			};
			return local;
		};

		localContainer.loop = function(config) {
			var local = {
				fps: 60,
				func: undefined,
				elapsedTime: 0,
				lastTime: Date.now(), // used to be 'new Date().getTime();'
				running: false,
				tick: 0, // keeps track of the time since the loop was started in milliseconds (Note, modifier modifies this >:D)
				lastTickTime: Date.now(),
				modifier: 1, // simulation speed, 1 is normal, 0 is paused, 2 is 2x time normal speed.
				pausedModifier: 0, // for keeping track of what the modifier was before pausing
				useRAF:true, // Normally slower than setTimeout, though smoother
				rAF: (function(){ // requestAnimationFrame
					return window.requestAnimationFrame
					|| window.webkitRequestAnimationFrame
					|| window.mozRequestAnimationFrame
					|| window.oRequestAnimationFrame
					|| window.msRequestAnimationFrame;}()),
				requestFunction: undefined
			};
			this.newObject(config, local);
			local.fps = 1000/local.fps;
			
			local.getCallbackFunction = function() {
				this.requestFunction = function(callback) {
					setTimeout(callback, this.fps);
				};
				if (this.useRAF && this.rAF) {
					this.requestFunction = this.rAF;
				}

			}; // Calling the function right after creating it (func{}();) will set the 'this' to the window
			local.getCallbackFunction(); // Calling the function from 'local' insures that 'this' will be the window // what? don't I mean will be the 'local' object?
			
			local.togglePause = function() {
				this.pausedModifier = this.modifier;
				if (this.modifier > 0) {
					this.modifier = 0;
				} else {
					this.modifier = this.pausedModifier;
				}
			};
			
			local.start = function() {
				this.running = true;
				this.update();
			};
			
			local.stop = function() {
				this.running = false;
			};
			
			local.update = function() {
				if (this.running) {
					
					var currentTime = Date.now();
					var timeDifference = currentTime - this.lastTime;
					this.lastTime = currentTime;		
					this.elapsedTime += timeDifference;
					this.tick += timeDifference; // If this grows to large will it cause problems?
					
					if (currentTime - this.lastTickTime >= 1000) { // Once per second
						this.lastTickTime = currentTime;
					}
					
					if (this.elapsedTime >= this.fps) {
						var frame = {
							rate: parseFloat((1000/this.elapsedTime).toFixed(1)),
							// Remove this?
							updateTime: this.elapsedTime*this.modifier, // Should I tie this in with this.modifier?
							delta: (this.elapsedTime/1000)*this.modifier,
							time: this.tick*this.modifier
						};
						
						this.elapsedTime = 0;
						this.func(frame);
					}

					var that = this;
					var requestFunction = this.requestFunction;
					requestFunction(function(){
						that.update();
					});
				}
			};
			
			local.runRequestFunction = function(callback) {
				var temp = this.requestFunction;
				temp(callback);
			};

			return local;
		};
		
		return localContainer;
	};

	var easy = {};
	easy.auther = "Maddix";
	easy.base = base();
	easy.components = components(easy);
	easy.windowLib = windowLib(easy);
	//easy.ai = ai(easy.base); // Not used atm
	easy.inputHandler = inputHandler(easy);
	
	easy.particles = particles(easy);
	//easy.math = // Add math into this and update all the code to use it :S 
	
	return easy;
	
};
