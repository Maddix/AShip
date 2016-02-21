function Graphics(Base) {
	var localContainer = {
		version: "1"
	};

	// Should this have orderedObject? I think so.. (edit: HA I should add it!)
	// TODO: Should this be a orderedObject? I at the very least should change
	// 		 add to take a name and let you remove objects.
	localContainer.getLayer = function() {
		var local = {
			canvas: undefined,
			context: undefined,
			objectCount: 0,
			validate: function(object) {
				if (object.updateGraphics && object.setup) return true;
			}
		};
		Base.extend(Base.orderedObject(), local, true);

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

		local.add_ordered = local.add;

		//ldp.p objectName GraphicsConplient
		//ldp.r string?true
		//ldp If objectName is false or undefined (and all other validation checks out) then a number will be assigned and returned as a string instead of true.
		local.add = function(objectName, object) {
			var objectName = objectName || (this.objectCount++).toString();
			if (this.add_ordered(objectName, object)) {
				object.setup(this.context);
				return this.objectCount == objectName ? objectName : true;
			}
		};

		local.updateGraphics = function() {
			localContainer.clearScreen(this.context, this.canvas.width, this.canvas.height);
			this.iterateOverObjects(function(object) {
				object.updateGraphics();
			});
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
			container: undefined, // set the container too?
			ratio: [640, 480],
			div: null, // Pass in a div if your not planning on creating one
			validate: function(object) {
				if (object.setup) return true;
			}
		};
		Base.extend(Base.orderedObject(), local, true);
		Base.extend(config, local);

		// Set the container
		local.container = document.getElementById(local.container);

		local.add_ordered = local.add;
		local.add = function(objectName, object) {
			if (this.add_ordered(objectName, object)) {
				var layerId = "Layer".concat(this.layerIds++, "_", objectName);
				object.setup(this.div, layerId, this.ratio);
				return true;
			}
		};

		local.createDiv = function() {
			var div = document.createElement("div");
			div.setAttribute("id", "toFrage");
			div.setAttribute("oncontextmenu", "return false;"); // Stops right-clicking bringing up a context menu
			div.setAttribute("style", "position: relative; width: " + this.ratio[0] + "px; height: " + this.ratio[1] + "px;");
			if (this.container) this.container.appendChild(div);
			this.div = div;
		};

		local.update = function() {
			this.iterateOverObjects(function(object) {
				object.updateGraphics();
			});
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
		context.drawImage(
			image,
			position[0] - imageOffset[0]*scale,
			position[1] - imageOffset[1]*scale,
			image.width*scale,
			image.height*scale
		);
		this.reset(context);
	};

	localContainer.drawImageClip = function(context, image, imageOffset, position, rotation, scale, clipPosition, clipRatio) {
		this.translateRotate(context, position, rotation);
		context.drawImage(
			image,
			clipPosition[0],
			clipPosition[1],
			clipRatio[0],
			clipRatio[1],
			(position[0] - imageOffset[0]/2)*scale,
			(position[1] - imageOffset[1]/2)*scale,
			imageOffset[0]*scale,
			imageOffset[1]*scale
		);
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
