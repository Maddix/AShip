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

		// This will copy the object "from" to "to". If "to" isn't given, "to" will be set to a new object
		localContainer.newObject = function(from, to) {
			to = to ? to : {}; // to = if 'to' is false, replace 'to' with {}, else return 'to'
			for (var key in from) to[key] = from[key];
			return to;
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
				objects: [],
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
		localContainer.getLayerController = function(config) {
			var local = {
				layerIds: 0,
				incerLayerIds: function() {this.layerIds++;},
				container: undefined,
				ratio: [640, 480],
				div: null,
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
			size: 10,
			density: 2,
			mass: 0, // size*density, How this differs from inertia, I'm not sure
			inertia: 20, // Shape*density ?
			velocity: [0, 0],
			angularVelocity: 0,
			calcMass: function() {this.mass = this.size*this.density;},
			calcInertia: function(scaler) {if (!this.mass) {this.calcMass();} this.inertia = this.mass*scaler}
		};
		
		localContainer.drawSimpleImage = function(context, image, pos, offpos, rotation) {
			context.translate(pos[0], pos[1]); // Why translate? Because you rotate around [0, 0]. Translating changes your [0, 0]
			context.rotate(rotation);
			context.drawImage(image, -offpos[0], -offpos[1]);
			localContainer.reset(context);
		};

		localContainer.drawComplexImage = function(context, image, pos, rotation, clipPos, clipRatio, offset, sizeRatio) {
			context.translate(pos[0], pos[1]);
			context.rotate(rotation);
			context.drawImage(image, clipPos[0], clipPos[1], clipRatio[0], clipRatio[1], -offset[0], -offset[1], sizeRatio[0], sizeRatio[1]);
			localContainer.reset(context);
		};
		
		localContainer.getAtomAnimationManual = function(config) {
			var local = {
				animationKeyFrames:{}, // {"AnimationName":[x, y, width, height, ..], "Idle":[0, 0, 32, 32], ..}
				currentAnimation:"",
				currentFrame:0,
				imageSize:[32, 32] // set to 0?
			};
			this.newObject(this.getAtomImage(config), local);
			
			local.getCurrentAnimationLength = function() {
				return this.animationKeyFrames[this.currentAnimation].length;
			};
			
			local.update = function() {
				var keyFrames = this.animationKeyFrames[this.currentAnimation];
				var frame = this.currentFrame;
				if (this.currentFrame >= keyFrames.length) console.log("Warning!!! -> Animation keyFrame is out of range");
				this.context.globalAlpha = this.alpha;
				localContainer.drawComplexImage(
					this.context,
					this.image, 
					this.pos,
					this.rotation,
					keyFrames[frame].slice(0, 2), // ImageCut [x, y]
					keyFrames[frame].slice(2, 4), // ImageCut [width, height]
					this.offset, // Image offset
					this.imageSize // Image size, used to stretch or reduce
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
				if (this.currentAnimation != "") {
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
				image:null,
				rotation:0,
				offset:[0,0]
			};
			this.newObject(this.atom, local);
			this.newObject(config, local);
			local.update = function() {
				this.context.globalAlpha = this.alpha;
				localContainer.drawSimpleImage(this.context, this.image, this.pos, this.offset, this.rotation);
			};
			return local;
		};

		localContainer.getAtomText = function(config) {
			var local = {
				text: "null",
				ratio: [0, 20], // text width, text height
				font:"Arial", 
				color:"white",
				aline: "start",
				baseline: "alphabetic",
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
				this.context.textAline = this.aline;
				this.context.textBaseline = this.baseline;
				this.context.font = this.ratio[1] + "px " + this.font;
				this.context.fillText(this.text, this.pos[0], this.pos[1]);
			};
			return local;
		};

		localContainer.getAtomShape = function() {
			var local = {
				ratio:[100, 100],
				color:"white",
				borderWidth:1,
				borderColor:"black",
				borderStyle:"round", // bevel, round, miter
				borderAlpha: 1
			};
			this.newObject(this.atom, local);
			return local;
		};
		
		
		// Note, this is slower due to the fact that context.rect was slower than just drawing a rect
		localContainer.getAtomRectangle = function(config) {
			var local = this.getAtomShape();
			this.newObject(config, local);
			local.update = function() {
				// Rect
				this.context.beginPath();
				this.context.moveTo(this.pos[0], this.pos[1]);
				this.context.lineTo(this.pos[0] + this.ratio[0], this.pos[1]);
				this.context.lineTo(this.pos[0] + this.ratio[0], this.pos[1] + this.ratio[1]);
				this.context.lineTo(this.pos[0], this.pos[1] + this.ratio[1]);
				this.context.closePath();
				// Fill Rect
				
				// TEST shadow
				//this.context.shadowColor = "gray";
				//this.context.shadowBlur = 1;
				//this.context.shadowOffsetX = 10;
				//this.context.shadowOffsetY = 10;
				
				this.context.globalAlpha = this.alpha;
				this.context.fillStyle = this.color;
				this.context.fill();
				// Rect Border
				this.context.globalAlpha = this.borderAlpha;
				this.context.lineJoin = this.borderStyle;
				this.context.lineWidth = this.borderWidth;
				this.context.strokeStyle = this.borderColor;
				this.context.stroke();
				
			};
			return local;
		};
		
		// About the same speed as the non simple function..
		localContainer.getAtomRectangleSimple = function(config) {
			var local = this.getAtomShape();
			this.newObject(config, local);
			local.update = function() {
				// Rect
				this.context.beginPath(); // This really made a difference
				this.context.rect(this.pos[0], this.pos[1], this.ratio[0], this.ratio[1]);
				this.context.globalAlpha = this.alpha;
				this.context.fillStyle = this.color;
				this.context.fill();
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
			this.newObject(this.getAtomShape(), local);
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
			this.newObject(this.getAtomShape(), local);
			this.newObject(config, local);
			
			local.update = function() {
				this.context.globalAlpha = this.alpha;
				this.context.beginPath();
				for (var lineIndex in this.shape) {
					for (var pointIndex=0; pointIndex < this.shape[lineIndex].length; pointIndex+=2) {
						var line = this.shape[lineIndex];
						if (pointIndex === 0) this.context.moveTo(this.pos[0] + line[pointIndex], this.pos[1] + line[pointIndex+1]);
						else this.context.lineTo(this.pos[0] + line[pointIndex], this.pos[1] + line[pointIndex+1]);
					}
					//this.context.closePath();
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
			local.getCallbackFunction(); // Calling the function from 'local' insures that 'this' will be the window
			
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
					this.tick += timeDifference;
					
					if (currentTime - this.lastTickTime >= 1000) { // Once per second
						this.lastTickTime = currentTime;
					}
					
					if (this.elapsedTime >= this.fps) {
						var frame = {
							rate: parseFloat((1000/this.elapsedTime).toFixed(1)),
							updateTime: timeDifference*this.modifier, // Should I tie this in with this.modifier?
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
	easy.ai = ai(easy.base);
	easy.inputHandler = inputHandler(easy.base);
	
	easy.particles = particles(easy);
	//easy.math = // Add math into this and update all the code to use it :S 
	
	return easy;
	
};
