// Maddix 2/1/2014 (MM/DD/YYYY)

// /////////////////////////////////////////////
// General Notes for understanding this micro-framework(?)
// - Rotations are in radians.
// - ratio = [width, height]
// - pos = [x, y]
// - inputContext is just a function that checks a input object for keys to react to
// - context is a Canvas.context("2d") object

// I think I might need name-spaces.
// Overhauling object inheritance with early and late code merging. I need to overhaul the way 
// objects update too. I also need to fix the window system and start using that. I have one to 
// many layers. (WindowController -> Window -> Block -> Widget) Window and Block serve the same 
// purpose and as such makes things more confusing and error prone.

// Objects need a way to communicate. Different systems need it too. I then need to handle world-space 
// and object-space which will tie into collision detection and objects interacting.

// Split Objects from functions?

// This is a Micro-framework (I hope.)
function EasyFrame() {

	'use strict'; // Not sure if this does anything any more.

	function layers() {
		var localContainer = {
			version:"1"
		};
	
		return localContainer;
	};
	
	function graphics(base) {
		var localContainer = {
			version:"1"
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
				if (!object.updateGraphics && !object.setup) return false;
				obj.setup(this.context);
				this.objects.push(obj);
				return true;
			};

			local.updateGraphics = function() {
				localContainer.clearScreen(this.context, this.canvas.width, this.canvas.height);
				for (var objectIndex in this.objects) {
					this.objects[objectIndex].updateGraphics();
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
			base.inherit(config, local);

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
			
			local.update = function() {
				for (var layer in this.layers) this.layers[layer].updateGraphics();
			};

			return local;
		};
		
		// ////////////////////
		// Basic object - Atom
		localContainer.atom = function() {
			return {
				pos: [0, 0],
				alpha: 1,
				context: null,
				setup: function(context) {this.context = context;} 
			}
		};
		
		localContainer.clearScreen = function(context, width, height) {
			context.clearRect(0, 0, width, height);
		};

		localContainer.reset = function(context) {
			// Reset blur?
			//context.setTransform(1, 0, 0, 1, 0, 0); // Only needed if we change setTransform
			context.restore();
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
			context.drawImage(image, clipPosition[0], clipPosition[1], clipRatio[0], clipRatio[1], (-imageOffset[0]/2)*scale, (-imageOffset[1]/2)*scale, imageOffset[0]*scale, imageOffset[1]*scale);
			this.reset(context);
		};

		// Matrix for the canvas
		// context.transform(
		// 		Sc-X, Sk-Y, D-x,
		//		Sk-x, Sc-Y, D-y
		// )
		// Scale X | Skew Y  | Displace X
		// Skew X  | Scale Y | Displace Y
		// 0	   | 0		 | 1
		
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
			this.inherit(this.getAtomImage(config), local);

			local.getCurrentAnimationLength = function() {
				return this.animationKeyFrames[this.currentAnimation].length;
			};

			local.updateGraphics = function() {
				var keyFrames = this.animationKeyFrames[this.currentAnimation];
				var frame = this.currentFrame;
				if (this.currentFrame >= keyFrames.length) console.warn("Warning!!! -> Animation keyFrame is out of range");
				this.context.globalAlpha = this.alpha;
				localContainer.drawImageClip(
					this.context,
					this.image,
					this.offset, // Image offset
					this.pos,
					this.rotation,
					keyFrames[frame].slice(0, 2), // ImageCut [x, y]
					keyFrames[frame].slice(2, 4), // ImageCut [width, height]
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
				localContainer.inherit(config, local);
				if (this.currentAnimation !== "") {
					this.currentLength = this.animationKeyFrames[this.currentAnimation].length-1;
				}
			};
			local.changeAnimation(this.getAtomAnimationManual(config));
			local.updateImage = local.updateGraphics;

			local.updateGraphics = function(frame) {
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
			this.inherit(this.atom, local);
			this.inherit(config, local);
			local.updateGraphics = function() {
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
			this.inherit(config, local);

			local.setScale = function(newScale, imageSmoothing) {
				this.scale = newScale;
				if (imageSmoothing != undefined) {
					if (imageSmoothing) this.imageSmoothing = true;
					else this.imageSmoothing = false;
				}
				if (!this.originalOffset) this.originalOffset = this.offset;
				this.offset = [this.originalOffset[0]*newScale, this.originalOffset[1]*newScale];
			};

			local.updateGraphics = function() {
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
			this.inherit(this.atom, local);
			this.inherit(config, local);

			local.setTextWidth = function() {
				this.context.font = this.ratio[1] + "px " + this.font;
				this.ratio[0] = this.context.measureText(this.text).width;
				//console.log(this.text + " is " + this.ratio[0] + "px big!");
			};

			local.updateGraphics = function() {
				this.context.globalAlpha = this.alpha;
				this.context.fillStyle = this.color;
				this.context.textAlign = this.align;
				this.context.textBaseline = this.baseline;
				this.context.font = this.ratio[1] + "px " + this.font;
				this.context.fillText(this.text, this.pos[0], this.pos[1]);
			};
			return local;
		};

		
		localContainer.getBaseShape = function() {
			return this.inherit(this.atom, {
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
			this.inherit(config, local);

			local.updateGraphics = function() {
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
			this.inherit(this.getAtomRectangleSimple(config), local);
			// This system isn't fool proof, I might need another.
			local.updateRectangleColor = local.updateGraphics;

			local.updateGraphics = function() {
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
			this.inherit(this.getBaseShape(), local);
			this.inherit(config, local);
			local.updateGraphics = function() {
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
			this.inherit(this.getBaseShape(), local);
			this.inherit(config, local);

			local.updateGraphics = function() {
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
		
		return localContainer;
	};
	
	function base() {
		var localContainer = {
			version:"1" // Not really used. Heh
		};
		
		// heir will inherit from inheritance. If generous is true then heir won't take items he already has.
		localContainer.inherit = function(inheritance, heir, generous) {
			heir = heir ? heir : {};
			if (inheritance) for (var item in inheritance) if (!heir[item] || !generous) heir[item] = inheritance[item];
			return heir;
		};
		
		localContainer.deepCopy = function(item) {
			var itemProto = Object.prototype.toString.call(item);
			var newItem = item;
			var getItem = function(child) { return localContainer.copyItem(child); };
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
		
		localContainer.copyList = function(from, to) {
			for (var index in from) to.push(from[index]);
			return to;
		};

		localContainer.orderedObject = function(config) {
			var local = {
				objects: {},
				objectNames: [],
				// validate is a function that takes a object and returns a bool depending if the object has what you want.
				validate: undefined 
			};
			this.inherit(config, local);
			
			local.add = function(objectName, object) {
				if (this.validate && !this.validate(object)) return false;
				this.objects[objectName] = object;
				this.objectNames.push(objectName);
				return true;
			};
			
			local.remove = function(objectName) {
				var index = this.objectNames.indexOf(objectName);
				if (index != -1) {
					delete this.objects[objectName];
					this.objectNames.splice(index, 1);
					return true;
				}
			};

			// Leave newIndex blank if you want to move the object to the end
			local.changePosition = function(objectName, newIndex) {
				var index = this.objectNames.indexOf(objectName);
				if (index != -1) {
					this.objectNames.splice(index, 1);
					if (newIndex >= 0 && newIndex < this.objectNames.length) {
						this.objectNames.splice(newIndex, 0, objectName);
					} else {
						this.objectNames.push(objectName);
					}
					return true;
				}
			};

			return local;
		};

		localContainer.eventController = function() {
			var local = {
				newEvents: [],
				events: [],
				validate: function(object) {
					if (object.updateEvents) return true;
				}
			};
			this.inherit(this.orderedObject(), local, true);
			
			// Should I call it event?
			local.newEvent = function(senderName, eventName, event) {
				this.newMessages.push({
					"senderName": senderName,
					"eventName": eventname,
					"event": event
				});
			};
			
			local.updateLogic = function() {
				this.events = this.newEvents;
				this.newEvents = [];
				for (var nameIndex in this.objectNames) {
					this.objects[nameIndex].getMessage(this.events);
				}
			};
			
			return local;
		};

		localContainer.loadImages = function(loadObject, callWhenComplete) {
			var imageObjects = {};
			var loadCount = 0;
			var loaded = 0;
			
			function loaded() {
				loaded++;
				if (loaded == loadCount) {
					callwhenComplete(imageObjects);
				}
			};
			
			for (imageName in loadObject) {
				loadCount++;
				var image = new Image();
				image.src = imageList[imageName];
				image.onload = function() { loaded(); }
				imageObjects[imageName] = image;
			}
		};
		
		localContainer.getLogicController = function(config) {
			var local = {
				focusOnObject: undefined, // Will be a name to objects
				validate: function(object) {
					if (object.updateLogic) return true;
				},
				camera: [0, 0],
				offset: [0, 0], // set when created
				maxDistanceFromOffset: [10, 10]
			};
			local = this.inherit(local, this.orderedObject());
			local.orderedObject_remove = local.remove;
			this.inherit(config, local);
			
			local.setFocusOnObject = function(objectName) {
				if (this.objects[objectName]) {
					focusOnObject = objectName;
				}
			};
			
			local.remove = function(objectName) {
				if (local.orderedObject_remove(objectName)) {
					this.focusOnObject = undefined;
					return true;
				}
				return false;
			};
			
			local.update = function(frame) {
				if (this.focusOnObject) {
					this.camera[0] = this.focusOnObject.pos[0] - this.offset[0];
					this.camera[0] = this.focusOnObject.pos[1] - this.offset[1];
				}
				
				var world = {
					camera: this.camera
				}
				
				for (object in this.objects) {
					this.objects[object].updateLogic(frame, world);
				}
			};
			
			return local;
		}

		// TODO: Start here
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
			this.inherit(config, local);
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
					this.tick += timeDifference;

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
	easy.windowLib = WindowLib(easy);
	easy.inputHandler = InputHandler(easy);
	easy.particles = Particles(easy);
	easy.math = GameMath()// Add math into this and update all the code to use it :S

	return easy;

};
