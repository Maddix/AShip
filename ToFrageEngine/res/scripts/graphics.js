function Graphics(Base) {
	var localContainer = {
		version: "1"
	};

	// Matrix for the canvas
	// context.transform(
	// 		Sc-X, Sk-Y, D-x,
	//		Sk-x, Sc-Y, D-y
	// )
	// Scale X | Skew Y  | Displace X
	// Skew X  | Scale Y | Displace Y
	// 0	   | 0		 | 1

	//ldp.p canvasContext list<number, number> number
	//ldp Moves then rotates the context
	localContainer.contextTranslateRotate = function(context, position, rotation) {
		context.translate(position[0], position[1]);
		context.rotate(rotation);
	};

	//ldp.p canvasContext
	//ldp Returns the context to 0,0 and sets the rotates to 0
	localContainer.contextReset = function(context) {
		context.setTransform(1, 0, 0, 1, 0, 0); // Only needed if we change setTransform
		context.restore();
	};

	//ldp.p canvasContext image list<number, number> list<number, number> number
	//ldp Draws an image on the context with the given offset, position, and rotation and then resets the context.
	localContainer.drawImage = function(context, image, imageOffset, position, rotation) {
		this.contextTranslateRotate(context, position, rotation);
		context.drawImage(image, -imageOffset[0], -imageOffset[1]);
		this.contextReset(context);
	};

	//ldp.p canvasContext image list<number, number> list<number, number> number number
	//ldp Draws an image on the context with the given offset, position, rotation, and scale and then resets the context.
	localContainer.drawImageScale = function(context, image, imageOffset, position, rotation, scale) {
		this.contextTranslateRotate(context, position, rotation);
		context.drawImage(
			image,
			-imageOffset[0]*scale,
			-imageOffset[1]*scale,
			image.width*scale,
			image.height*scale
		);
		this.contextReset(context);
	};

	//ldp.p canvasContext image list<number, number> list<number, number> number number list<number, number> list<number, number>
	//ldp Draws an image on the context with the given offset, position, rotation, and scale as well as clipping the image and then resets the context.
	localContainer.drawImageClip = function(context, image, imageOffset, position, rotation, scale, clipPosition, clipRatio) {
		this.contextTranslateRotate(context, position, rotation);
		context.drawImage(
			image,
			clipPosition[0],
			clipPosition[1],
			clipRatio[0],
			clipRatio[1],
			(-imageOffset[0]/2)*scale,
			(-imageOffset[1]/2)*scale,
			imageOffset[0]*scale,
			imageOffset[1]*scale
		);
		this.contextReset(context);
	};

	//ldp.p number?string
	//ldp.r string
	//ldp Takes a number or string and appends a 'px' if one is not present. (Aweful name. :c)
	// Is addPx a more fitting name?
	localContainer.makeCssPixel = function(item) {
		if (typeof item === "string" && item.slice(-2).toLowerCase() === "px") return item;
		return item + "px";
	}

	//ldp.r object
	//ldp Creates a canvas element and manages it. Used for drawing to the screen.
	localContainer.getLayer = function() {
		var local = {
			canvas: undefined,
			context: undefined,
			objectCount: 0,
			style: "position: absolute; background-color: transparent;",
			validate: function(object) {
				if (object.updateGraphics && object.setup) return true;
			}
		};
		//ldp.e
		Base.extend(Base.orderedObject(), local, true);

		//ldp Preserve parent function
		local.add_ordered = local.add;

		//ldp.p element string list<int, int ..> boolean
		//ldp Creates a canvas element and then gets the canvas 2d object by default.
		local.setup = function(container, id, ratio, is3d) {
			var canvas = document.createElement("canvas");
			canvas.setAttribute("id", id);
			canvas.setAttribute("width", localContainer.makeCssPixel(ratio[0]));
			canvas.setAttribute("height", localContainer.makeCssPixel(ratio[1]));
			canvas.setAttribute("style", this.style);
			this.context = canvas.getContext(is3d ? "3d" : "2d");
			container.appendChild(canvas);
			this.canvas = canvas;
		};

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

		//ldp Clear the context and then have all the object draw.
		local.updateGraphics = function() {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.iterateOverObjects(function(object) {
				object.updateGraphics();
			});
		};

		return local;
	};

	//ldp.p object
	//ldp.r object
	//ldp Holds data on how the layers should be created and then manages them.
	localContainer.getLayerController = function(config) {
		var local = {
			layerCountId: 0,
			ratio: [640, 480],
			is3d: false,
			div: null, // Pass in a div if your not planning on creating one
			divAttributes: {
				id: "toFrage",
				oncontextmenu: "return false;",
				style: "position: relative;",
				width: localContainer.makeCssPixel(720),
				height: localContainer.makeCssPixel(640)
			},
			validate: function(object) {
				if (object.setup) return true;
			}
		};
		//ldp.e
		Base.extend(Base.orderedObject(), local, true);
		Base.extend(config, local);

		//ldp Preserve parent function
		local.add_ordered = local.add;

		//ldp.p element
		//ldp Creates or receives a div and adds attributes ot it.
		local.setup = function(container) {
			var div = document.createElement("div");
			for (var key in this.divAttributes) {
				div.setAttribute(key, this.divAttributes[key]);
			}
			container.appendChild(div);
			this.div = div;
		};

		//ldp.p string object
		//ldp.r true if the layer was added.
		//ldp Adds a layer object and calls setup on it.
		local.add = function(objectName, object) {
			if (this.add_ordered(objectName, object)) {
				var layerId = "Layer".concat(this.layerCountId++, "_", objectName);
				object.setup(this.div, layerId, this.ratio, this.is3d);
				return true;
			}
		};

		//ldp Updates each layer.
		local.update = function() {
			this.iterateOverObjects(function(object) {
				object.updateGraphics();
			});
		};

		return local;
	};

	//ldp.p object
	//ldp.r object
	//ldp The simplest drawable object.
	localContainer.drawable = function(config) {
		var local = Base.extend(config, {
			pos: [0, 0],
			alpha: 1,
			context: null,
			setup: function(context) {this.context = context;}
		});
		//ldp This is where you would put your drawing code. As this is an example I'm leaving it commented due to performance concerns.
		//local.updateGraphics = function() {};
		return local;
	};

	//ldp.p object
	//ldp.r object
	/* ldp A simple object that will draw a given image. Complete with an offset, rotation, and scale.
		If 'automaticImageSmoothing' is true then 'imageSmoothing' will be ignored and image smoothing
		will be enabled and disabled depending on if the 'scale' is greater then 1 or less then 1.
	*/
	localContainer.image = function(config) {
		var local = {
			image: null,
			rotation: 0,
			offset: [0, 0],
			scale: 1,
			automaticImageSmoothing: true,
			imageSmoothing: true
		};
		//ldp.e
		Base.extend(this.drawable(config), local);

		//ldp Sets the image smoothing on the context. Calling outside of drawing will waste CPU time.
		local.setContextImageSmoothingEnabled = function() {
			this.context.imageSmoothingEnabled = this.automaticImageSmoothing ? (this.scale > 1 ? false : true) : this.imageSmoothing;
		};

		//ldp Sets the alpha for the image and then draws it.
		local.updateGraphics = function() {
			this.context.globalAlpha = this.alpha;
			this.setContextImageSmoothingEnabled();
			localContainer.drawImageScale(
				this.context,
				this.image,
				this.offset,
				this.pos,
				this.rotation,
				this.scale
			);
		};

		return local;
	};

	//ldp.p object
	//ldp.r object
	//ldp Will animate over a spritesheet with keyframes. Is not automatic so you will have to set 'currentFrame' to the proper frame.
	localContainer.animationManual = function(config) {
		var local = {
			animationKeyFrames: {}, // {"AnimationName":[x, y, width, height, ..], "Idle":[0, 0, 32, 32], ..}
			currentAnimation: "",
			currentAnimationLength: 0,
			currentFrame: 0,
			frame: []
		};
		//ldp.e
		Base(this.image(config), local);

		//ldp.p number
		//ldp Keeps the current frame within the animation cycle.
		local.setFrame = function(frameNumber) {
			if (frameNumber < this.currentAnimationLength) this.currentFrame = 0;
			else if (frameNumber > this.currentAnimationLength) this.currentFrame = this.currentAnimationLength - 1;
			else this.currentFrame = frameNumber;
		};

		//ldp Moves the animaion forward one frame.
		local.nextFrame = function() {
			this.setFrame(this.currentframe + 1);
		};

		//ldp Moves the animation backward one frame.
		local.previousFrame = function() {
			this.setFrame(this.currentframe - 1);
		};

		//ldp Sets the selected animation frame length.
		local.getAnimationLength = function() {
			this.currentAnimationLength =  this.animationKeyFrames[this.currentAnimation].length/4;
		};

		//ldp Calculates the frame keys for the current frame.
		local.getFrame = function() {
			var keyFrames = this.animationKeyFrames[this.currentAnimation];
			this.frame = [
				keyFrames[this.currentFrame].slice(0, 2), // [x, y]
				keyFrames[this.currentFrame].slice(2, 4) // [width, height]
			];
		};

		//ldp.p string number
		//ldp.r true if the animationName was valid
		//ldp Sets the animation and frame to start looping over.
		local.setCurrentAnimation = function(animationName, frameNumber) {
			if (animationName in this.animationKeyFrames) {
				this.currentAnimation = animationName;
				this.getAnimationLength();
				this.setFrame(frameNumber || 0);
				return true;
			}
		};

		//ldp Draws the current frame from the current animation.
		local.updateGraphics = function() {
			this.context.globalAlpha = this.alpha;
			this.setContextImageSmoothingEnabled();
			localContainer.drawImageClip(
				this.context,
				this.image,
				this.getOffsetScale(),
				this.pos,
				this.rotation,
				this.scale,
				this.frame[0], // ImageCut [x, y]
				this.frame[1] // ImageCut [width, height]
			);
		};
		return local;
	};

	//ldp.p object
	//ldp.r object
	//ldp Automatically animate without having to manually change the frame.
	localContainer.animation = function(config) {
		var local = {
			framesPerSecond:1, // Per second
			repeatAnimation:true, // Repeat the animation
			animate:false, // start/continue the animation
			animateForwards: true, // false for backwards
			lastFrameTime: 0
		};
		//ldp.e
		Base.extend(this.animationManual(config), local);

		//ldp preserve parent function
		local.setCurrentAnimation_manual = local.setCurrentAnimation;

		//ldp.p string number number
		//ldp.r true if the animationName was valid
		//ldp Resets the animation timer while resetting the animation.
		local.setCurrentAnimation = function(animationName, frameNumber, framesPerSecond) {
			if (this.setCurrentAnimation_manual(animationName, frameNumber)) {
				this.LastFrameTime += 1000/this.framesPerSecond;
				if (framesPerSecond) this.framesPerSecond = framesPerSecond;
				return true;
			}
		};

		//ldp Check to see if the animation has reached the end of the cycled for the direction its cycling. If repeat animation is false then stop the animation.
		local.hasAnimationFinishedCycle = function() {
			if (!this.repeatAnimation) {
				if (this.animateForwards && this.currentFrame == this.currentAnimationLength-1) this.animate = false;
				else if (!this.animateForwards && this.currentFrame == 0) this.animate = false;
			}
		};

		//ldp.p object
		//ldp Increments/Decrements the frame every so many milliseconds.
		local.updateLogic = function(frame) {
			if (this.animate && frame.time - this.lastFrameTime >= 1000/this.framesPerSecond) {
				if (this.animateForwards) this.nextFrame();
				else previousFrame();
				this.hasAnimationFinishedCycle();
				this.lastFrameTime = frame.time;
			}
		};

		return local;
	};

	//ldp.p object number
	//ldp.r object
	//ldp Creates a object that will render text. I will need to make another pass when I start using this again.
	localContainer.text = function(config, fontWidth) {
		// Can't be touched from outside the constructor. (^'u')^ - {yey}
		var privateLocal = {
			width: 0, // This is determined by the height and length of local.text
			height: fontWidth ? fontWidth : 12
		};
		var local = {
			text: "null",
			font: "Arial",
			color: "white",
			align: "start", // start, end, left, center, right
			baseline: "alphabetic" // top, bottom, middle, alphabetic, hanging
		};
		//ldp.e
		Base.extend(this.drawable(config), local);

		//ldp.p number
		//ldp Set the height of the text.
		local.setSize = function(height) {
			privateLocal.height = height;
		};

		//ldp.r list<number, number>
		//ldp get the size of the text.
		local.getSize = function() {
			return [privateLocal.width, privateLocal.height];
		};

		//ldp Set the font on the context.
		local.setFont = function() {
			this.context.font = "{0} {1}".format(localContainer.makeCssPixel(privateLocal.height), this.font);
		};

		//ldp Set the font and get the width of the text
		local.getTextWidth = function() {
			this.setFont();
			privateLocal.width = this.context.measureText(this.text).width;
		};

		//ldp Render the text
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

	//ldp.p object
	//ldp.r object
	//ldp Defines common things in shapes.
	localContainer.shape = function(config) {
		var local = {
			ratio:[100, 100],
			color:"white" // Should it be black?
		};
		//ldp.e
		Base.extend(this.drawable(config), local);
		return local;
	};

	//ldp.p object
	//ldp.r object
	//ldp Defines common things with borders around shapes.
	localContainer.border = function(config) {
		var local = {
			borderWidth:1,
			borderColor:"black",
			borderStyle:"round", // bevel, round, miter
			borderAlpha:1
		};
		//ldp.e
		Base.extend(config, local);
		return local;
	};

	//ldp.p object
	//ldp.r object
	//ldp Draws a rectangle with or without a border.
	localContainer.rectangle = function(config) {
		var local = {
			includeBorder: true
		};
		//ldp.e
		Base.extend(this.shape(config.includeBorder ? this.border(config) : config), local);

		//ldp Set the right draw function
		if (local.includeBorder) {
			//ldp Draw the rectangle with a border.
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
			//ldp Draw the rectangle without a border.
			local.updateGraphics = function() {
				this.context.beginPath();
				this.context.rect(this.pos[0], this.pos[1], this.ratio[0], this.ratio[1]);
				this.context.globalAlpha = this.alpha;
				this.context.fillStyle = this.color;
				this.context.fill();
			};
		}

		return local;
	};


	// Not tested yet.
	//ldp.p object
	//ldp.r object
	//ldp Draws a circle.
	localContainer.circle = function(config) {
		var local = {
			includeBorder: true,
			angleRatio: [0, 2*Math.PI],
			radius: 100,
			clockwise: true,
			color: "white"
		};
		//ldp.e
		Base.extend(this.drawable(config.includeBorder ? this.border(config) : config), local);

		//ldp Set the right draw function
		if (local.includeBorder) {
			//ldp Draw the rectangle with a border.
			local.updateGraphics = function() {
				this.context.beginPath();
				this.context.arc(this.pos[0], this.pos[1], this.radius, this.angleRatio[0], this.angleRatio[1], this.clockwise);
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
			//ldp Draw the rectangle without a border.
			local.updateGraphics = function() {
				this.context.beginPath();
				this.context.arc(this.pos[0], this.pos[1], this.radius, this.angleRatio[0], this.angleRatio[1], this.clockwise);
				this.context.globalAlpha = this.alpha;
				this.context.fillStyle = this.color;
				this.context.fill();
			};
		}

		return local;
	};

	//ldp.p object
	//ldp.r object
	//ldp Draws a line.
	localContainer.line = function(config) {
		var local = {
			style: "round",
			lineWidth: 1
		};
		//ldp.e
		Base(this.shape(config), local);

		//ldp Draw the line.
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

	//ldp.p object
	//ldp.r object
	//ldp Draws multiple lines.
	localContainer.lines = function(config) {
		var local = {
			style: "round",
			lineWidth: 1,
			shape: [] // Holds lists of points, each new list is a new line -> [[startX,startY, x,y, ..], [startX,startY, x,y], ..]
		};
		//ldp.e
		Base(this.shape(config), local);

		//ldp Draw all the lines.
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
