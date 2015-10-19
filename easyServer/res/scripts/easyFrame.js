// Maddix - Started 2/1/2014 (MM/DD/YYYY)

// /////////////////////////////////////////////
// General Notes for understanding this micro-framework(?)
// - Rotations are in radians.
// - ratio = [width, height]
// - pos = [x, y]
// - inputContext is just a function that checks a input object for keys to react to
// - context is a Canvas.context("2d") object

// I think I might need name-spaces.

// Objects need a way to communicate. Different systems need it too. I then need to handle world-space
// and object-space which will tie into collision detection and objects interacting.

// This is a Micro-framework (I hope.)
function EasyFrame() {

	'use strict'; // Try putting 'var private = {};' somewhere. It should throw an error.

	// Not sure I need this.
	function Layers() {
		var localContainer = {
			version:"1"
		};

		return localContainer;
	};

	function Graphics(Base) {
		var localContainer = {
			version:"1"
		};


		// Should this have orderedObject? I think so.. (edit: HA I should add it!)
		// TODO: Should this be a orderedObject? I at the very least should change
		// 		 add to take a name and let you remove objects.
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

			local.add = function(object) {
				if (!object.updateGraphics && !object.setup) return false;
				object.setup(this.context);
				this.objects.push(object);
				return true;
			};

			local.updateGraphics = function() {
				localContainer.clearScreen(this.context, this.canvas.width, this.canvas.height);
				for (var objectIndex=0; objectIndex < this.objects.length; objectIndex++) {
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
			Base.extend(config, local);

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
				for (var layer=0; layer < this.layers.length; layer++) this.layers[layer].updateGraphics();
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
			context.setTransform(1, 0, 0, 1, 0, 0); // Only needed if we change setTransform
			context.restore();
		};

		// Condense this into one function? Isn't dry.
		localContainer.drawImage = function(context, image, imageOffset, position, rotation) {
			this.translateRotate(context, position, rotation);
			context.drawImage(image, -imageOffset[0], -imageOffset[1]);
			this.reset(context);
		};

		localContainer.drawImageScale = function(context, image, imageOffset, position, rotation, scale) {
			this.translateRotate(context, position, rotation);
			context.drawImage(image, position[0] - imageOffset[0]*scale, position[1] - imageOffset[1]*scale, image.width*scale, image.height*scale);
			this.reset(context);
		};

		localContainer.drawImageClip = function(context, image, imageOffset, position, rotation, scale, clipPosition, clipRatio) {
			this.translateRotate(context, position, rotation);
			context.drawImage(image, clipPosition[0], clipPosition[1], clipRatio[0], clipRatio[1], (position[0] - imageOffset[0]/2)*scale, (position[1] - imageOffset[1]/2)*scale, imageOffset[0]*scale, imageOffset[1]*scale);
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
			Base(this.getAtomImage(config), local);

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

		// Integrate with get getImageResize
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
				localContainer.extend(config, local);
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
			Base.extend(this.atom(), local);
			Base.extend(config, local);
			local.updateGraphics = function() {
				this.context.globalAlpha = this.alpha;
				localContainer.drawImage(this.context, this.image, this.offset, this.pos, this.rotation);
			};
			return local;
		};

		// This should be extended after getAtomImage, otherwise updateGraphics won't be set to the correct one.
		localContainer.getImageResize = function(config) {
			var local = {
				scale: 1,
				imageScaledOffset: [0, 0],
				imageSmoothing: true
			};
			Base(this.getAtomImage(config), local);

			// This should be called at start in setup. Or should I just call it here so that it sets immediately?
			local.setScale = function(newScale, imageSmoothing) {
				this.scale = newScale;
				this.imageSmoothing = imageSmoothing ? true : false;
				this.imageScaledOffset = [this.offset[0]*newScale, this.offset[1]*newScale];
			};

			local.updateGraphics = function() {
				console.log("Updating");
				this.context.globalAlpha = this.alpha;
				this.context.imageSmoothingEnabled = this.imageSmoothing;
				localContainer.drawImageScale(this.context, this.image, this.imageScaledOffset, this.pos, this.rotation, this.scale);
			};

			return local;
		};

		localContainer.getText = function(config, fontWidth) {
			// Can't be touched from outside the constructor. (^'u')^ - {yey}
			var privateLocal = {
				width: 0, // This is determined by the height and length of local.text
				height: fontWidth ? fontWidth : 12
			};
			var local = {
				text: "null",
				font:"Arial",
				color:"white",
				align: "start", // start, end, left, center, right
				baseline: "alphabetic" // top, bottom, middle, alphabetic, hanging
			};
			Base.extend(this.atom(), local);
			Base.extend(config, local);

			local.setSize = function(height) {
				privateLocal.height = height;
			};

			local.getSize = function() {
				return [privateLocal.width, privateLocal.height];
			};

			local.setFont = function() {
				this.context.font = privateLocal.height + "px " + this.font;
			};

			local.getTextWidth = function() {
				this.setFont();
				privateLocal.width = this.context.measureText(this.text).width;
			};

			local.updateGraphics = function() {
				this.context.globalAlpha = this.alpha;
				this.context.fillStyle = this.color;
				this.context.textAlign = this.align;
				this.context.textBaseline = this.baseline;
				this.setFont();
				this.context.fillText(this.text, this.pos[0], this.pos[1]);
			};

			return local;
		};

		localContainer.getBaseShape = function() {
			return Base.extend(this.atom(), {
				ratio:[100, 100],
				color:"white" // Should be black?
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

		// Should I move includeBorder into the config?
		localContainer.getRectangle = function(config, includeBorder) {
			var local = {};
			Base.extend(this.getBaseShape(), local);
			if (includeBorder) Base.extend(this.getBaseBorder(), local);
			Base.extend(config, local);

			if (includeBorder) {
				local.updateGraphics = function() {
					this.context.beginPath();
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
			} else {
				local.updateGraphics = this.updateGraphics = function() {
					this.context.beginPath();
					this.context.rect(this.pos[0], this.pos[1], this.ratio[0], this.ratio[1]);
					this.context.globalAlpha = this.alpha;
					this.context.fillStyle = this.color;
					this.context.fill();
				};
			}

			return local;
		};

		localContainer.getAtomLine = function(config) {
			var local = {
				style:"round",
				lineWidth: 1
			};
			Base(this.getBaseShape(), local);
			Base(config, local);
			local.updateGraphics = function() {
				this.context.globalAlpha = this.alpha;
				this.context.beginPath(); // Needed. Major lag if removed.
				this.context.moveTo(this.pos[0], this.pos[1]);
				this.context.lineTo(this.pos[0] + this.ratio[0], this.pos[1] + this.ratio[1]);
				this.context.closePath(); // ? Not so sure if needed.
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
				shape: [] // Holds lists of points, each new list is a new line -> [[startX,startY, x,y, ..], [startX,startY, x,y], ..]
			};
			Base(this.getBaseShape(), local);
			Base(config, local);

			local.updateGraphics = function() {
				this.context.globalAlpha = this.alpha;
				this.context.beginPath();
				for (var lineIndex=0; lineIndex < this.shape.length; lineIndex++) {
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

	function Base() {
		var localContainer = {
			version:"1" // Not really used. Heh
		};

		// Only works with objects. Set overwrite to true to only copy undefined keys.
		localContainer.extend = function(piece, object, overwrite) {
			object = object ? object : {};
			if (piece) for (var item in piece) if (!object[item] || !overwrite) object[item] = piece[item];
			return object;
		}

		localContainer.deepCopy = function(item) {
			var itemProto = Object.prototype.toString.call(item);
			var newItem = item;
			var getItem = function(child) { return localContainer.deepCopy(child); };
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


		// Should I add hasObject, getObjectNames functions?
		localContainer.orderedObject = function(config) {
			var local = {
				objects: {},
				objectNames: [],
				// validate is a function that takes a object and returns a bool depending if the object has what you want.
				validate: function(object) {
					return true;
				}
			};
			this.extend(config, local);

			local.add = function(objectName, object) {
				if (this.validate && this.validate(object)) {
					this.objects[objectName] = object;
					this.objectNames.push(objectName);
					return true;
				}
			};

			local.remove = function(objectName) {
				var index = this.objectNames.indexOf(objectName);
				if (index != -1) {
					var object = this.objects[objectName];
					delete this.objects[objectName];
					this.objectNames.splice(index, 1);
					return object;
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

			// 'func' is a function that takes a object and its name. 'objectNames' is a list of strings. Not required.
			// 'objects' is a list of objects. Not required.
			local.iterateOverObjects = function(func, objectNames, objects) {
				objectNames = objectNames ? objectNames : this.objectNames;
				objects = objects ? objects : this.objects;
				for (var nameIndex=0; nameIndex < objectNames.length; nameIndex++) {
					// Might not be completely clear. If you return true then we break. Return false to continue.
					if (func(objects[objectNames[nameIndex]], objectNames[nameIndex])) break;
				}
			}

			return local;
		};

		localContainer.getEventController = function() {
			var local = {
				newEvents: [],
				events: [],
				validate: function(object) {
					if (object.updateEvents) return true;
				}
			};
			this.extend(this.orderedObject(), local, true);

			local.updateLogic = function() {
				this.events = this.newEvents;
				this.newEvents = [];

				this.iterateOverObjects(function(object) {
					var newEvent = object.updateEvents(local.events);
					if (newEvent) local.newEvents.push(newEvent);
				});
			};

			return local;
		};

		localContainer.manageEvents = function(config) {
			var local = this.extend(config, local);

			local.createEvent = function(title, message) {
				return {title: title, message: message};
			};

			local.searchEvents = function(searchFor, events) {
				var matchingEvents = [];
				for (var eventIndex=0; eventIndex < events.length; eventIndex++) {
					var event = events[eventIndex];
					if (event.title == searchFor) {
						matchingEvents.push(event);
					};
				}
				return matchingEvents;
			};

			local.iterateOverEvents = function(events, func) {
				for (var eventIndex=0; eventIndex < events.length; eventIndex++) {
					if (func(events[eventIndex])) break;
				}
			};

			return local;
		}

		localContainer.loadImages = function(loadObject, callWhenComplete, folder) {
			folder = folder ? folder : "";
			var imageObjects = {};
			var loadCount = 0;
			var loaded = 0;

			function loadedCallback() {
				loaded++;
				if (loaded == loadCount) {
					callWhenComplete(imageObjects);
				}
			};

			for (var imageName in loadObject) {
				loadCount++;
				var image = new Image();
				image.src = folder + loadObject[imageName];
				image.onload = function() { loadedCallback(); }
				imageObjects[imageName] = image;
			}
		};

		localContainer.getLogicController = function(config) {
			var local = {
				validate: function(object) {
					if (object.updateLogic) return true;
				}
			};
			local = this.extend(this.orderedObject(config), local, true);

			local.update = function(frame) {
				this.iterateOverObjects(function(object) {
					object.updateLogic(frame);
				});
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
			this.extend(config, local);
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
	easy.author = "Maddix";
	easy.Base = Base();
	easy.Graphics = Graphics(easy.Base);
	easy.Components = Components(easy);
	easy.WindowLib = WindowLib(easy);
	easy.InputHandler = InputHandler(easy);
	easy.Particles = Particles(easy);
	easy.Math = GameMath() // Add math into this and update all the code to use it :S

	return easy;

};
