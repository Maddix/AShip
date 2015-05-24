// /////////////
// Window system

function windowLib(easyFrame) {
	var localContainer = {
		version:"1.0",
		easy: easyFrame
	};
	
	// Write test to make sure that objects getting pushed though the pipeline have the required stuff
	
	localContainer.getMenuContainer = function(config) {
		var local = {
			activeObject: null,
			context: null,
			active: false,
			inputContext: undefined
		};
		this.easy.base.newObject(this.easy.base.orderedObject(), local);
		local.addObject = local.add;
		this.easy.base.newObject(config, local);
		
		local.setup = function(context) {
			this.context = context;
			for (var objectIndex in this.objectNames) {
				this.objects[this.objectNames[objectIndex]].setup(context, this);
			}
		};
		
		local.add = function(objectName, object) {
			this.addObject(objectName, object);
			if (object.setup && this.context) {
				object.setup(this.context, this);
			}
		};
		
		local.inputContext = function(input) {
			var processedInput = undefined;
			if (checkWithinBounds(input.mouse["mousePosition"], this.pos, this.ratio, 0)) {
				for (var objectIndex=this.objectNames.length-1; objectIndex >= 0; objectIndex--) {
					var object = this.objects[this.objectNames[objectIndex]];	
					if (object.inputContext) {
						processedInput = object.inputContext(input);
						if (processedInput) {
							this.active = true;
							break;
						} else {
							this.active = false;
						}
					}
				}
			} else {
				if (this.active) return input;
			}
			return processedInput;
		}
		
		local.update = function(frame) {
			for (var objectIndex in this.objectNames) {
				this.objects[this.objectNames[objectIndex]].update(frame);
			}
		};
		return local;
	};
	
	localContainer.getMenuManager = function(config) {
		var local = {};
		this.easy.base.newObject(this.getMenuContainer(config), local);
		
		local.inputContext = function(input) {	
			for (var objectIndex=this.objectNames.length-1; objectIndex >= 0; objectIndex--) {
				var object = this.objects[this.objectNames[objectIndex]];
				if (object.inputContext) {
					var returnedInput = object.inputContext(input);
					if (returnedInput) {
						input = returnedInput;
						break;
					}
				}
			}
			return input;
		};
		
		return local;
	};
	
	localContainer.getMenuWindow = function(config) {
		var local = {
			pos: [0, 0],
			ratio: [10, 10],
			mousePositionOffset: 0
		};
		this.easy.base.newObject(this.getMenuContainer(config), local);

		local.update = function(frame) {
			for (var objectIndex in this.objectNames) {
				this.objects[this.objectNames[objectIndex]].update(frame, this.pos, this.ratio);
			}
		};
		
		return local;
	};
	
	localContainer.getMenuBlock = function(config) {
		var local = {
			localPos: [0, 0],
			localRatio: [100, 100],
			pos: [0, 0],
			ratio: [0, 0],
			arrangeStyle: "",
			arrangeAxis: 0, // 0 or 1 - x and y
			arrangeFunctions: {}
		};
		this.easy.base.newObject(this.getMenuContainer(config), local);
		
		local.arrangeFree = function(frame, objects, objectNames, pos, ratio, axis) {
			for (var i=0; i<objectNames.length; i++) {
				var widget = objects[objectNames[i]];
				var newPos = [
					pos[0] + (ratio[0] * (widget.localPos[0]/100)),
					pos[1] + (ratio[1] * (widget.localPos[1]/100))
				];
				if (widget.update) widget.update(frame, newPos, ratio);
			}
		};
		local.arrangeFunctions["free"] = local.arrangeFree;
		
		local.update = function(frame, blockPos, blockRatio) {
			this.pos = [
				blockPos[0] + (blockRatio[0] * (this.localPos[0]/100)),
				blockPos[1] + (blockRatio[1] * (this.localPos[1]/100))
			];
			this.ratio = [
				blockRatio[0] * (this.localRatio[0]/100), 
				blockRatio[1] * (this.localRatio[1]/100)
			];
			
			if (this.arrangeFunctions[this.arrangeStyle]) {
				this.arrangeFunctions[this.arrangeStyle](
					frame, 
					this.objects, 
					this.objectNames, 
					this.pos, 
					this.ratio, 
					this.arrangeAxis
				);
			}
		};
		
		return local;
	};
	
	
	// Old, update it.
	// Create some sort of window docking / Talk with the windowManager?
	// This is a window enhancement, it lets you drag the window
	// Rename?
	localContainer.getWindowWidgetDrag = function(config) {
		var local = {
			pos: [0, 0],
			localPos: [0, 0],
			ratio: [10, 10],
			localRatio: [10, 10],
			offset: 2,
			parent: null,
			windowMouseOffset: [0, 0],
			clickOffset: 0,
			clicked: false,
			active: false,
			inputContext: null
		};
		this.easy.base.newObject(config, local);
		
		local.setup = function(context, parent) {
			this.parent = parent;
		};
		
		local.inputContext = function(input) {
			var input = input;
				
			if (input.keys["LMB"]) {
				if (checkWithinBounds(input.mouse["mousePosition"], this.pos, this.ratio, this.clickOffset)) {
					if (!this.active) {
						this.active = true;
						this.windowMouseOffset = [
							input.mouse["mousePosition"][0] - this.parent.pos[0], 
							input.mouse["mousePosition"][1] - this.parent.pos[1]
						];
					} else {
						this.parent.pos = [
							input.mouse["mousePosition"][0] - this.windowMouseOffset[0], 
							input.mouse["mousePosition"][1] - this.windowMouseOffset[1]
						];
						this.preventWindowFalloff();
					}
					delete input.keys["LMB"];
				}
			}
			
			if (input.keys["LMB"] === false) {
				this.active = false;
				this.windowMouseOffset = [0, 0];
				delete input.keys["LMB"];
			}
			
			return input;
		}
		
		local.click = function(input) {
			//console.log("Drag clicked.");
			if (checkWithinBounds(input.mouse["mousePosition"], this.pos, this.ratio, this.clickOffset)) {
				if (!this.clicked) {
					this.clicked = true;
					this.windowMouseOffset = [input.mouse["mousePosition"][0] - this.parent.pos[0], input.mouse["mousePosition"][1] - this.parent.pos[1]];
					return true;
				}
			}
			if (this.clicked) {
				this.parent.pos = [input.mouse["mousePosition"][0] - this.windowMouseOffset[0], input.mouse["mousePosition"][1] - this.windowMouseOffset[1]];
				this.preventWindowFalloff();
			
				return true;
			} else {
				return false;
			}
		};
		
		local.preventWindowFalloff = function() {
			if (this.parent.pos[0] - this.offset <= 0) this.parent.pos = [0 + this.offset, this.parent.pos[1]];
			else if (this.parent.pos[0] + this.parent.ratio[0] + this.offset >= DATA.screenRatio[0]) this.parent.pos = [DATA.screenRatio[0] - this.parent.ratio[0] - this.offset, this.parent.pos[1]];	
			if (this.parent.pos[1] - this.offset <= 0) this.parent.pos = [this.parent.pos[0], 0 + this.offset];
			else if (this.parent.pos[1] + this.parent.ratio[1] + this.offset >= DATA.screenRatio[1]) this.parent.pos = [this.parent.pos[0], DATA.screenRatio[1] - this.parent.ratio[1] - this.offset];
		};
		
		local.release = function(input) {
			this.clicked = false;
			this.windowMouseOffset = [0, 0];
		};
		
		local.update = function(frame, blockPos, blockRatio) {
			this.ratio = [
				blockRatio[0] * (this.localRatio[0]/100), 
				blockRatio[1] * (this.localRatio[1]/100)
			];
		};
		
		return local;
	};
	
	localContainer.getResize = function(config) {
		var local = {
			minimumRatio: [100, 100],
			dragOffset: 5 // px
		};
		this.easy.base.newObject(config, local);
		
	
		
		local.inputContext = function(input) {
			
			var mousePos = input.mouse["mousePosition"];
			
			if (input.keys["LMB"]) {
				if (!this.active) {
					if (checkWithinBounds(mousePos, this.pos, this.ratio, this.dragOffset)) {
						// Am I touching any of the edges? if so than make the edge follow the mouse
					}
				}
			}
			
		};
		
		return local;
	};
	
	
	// Is this going to be used at all?
	localContainer.getWindowResize = function(config) {
		var local = {
			localPos: [0, 0],
			localRatio: [0, 0],
		};
		
		local.inputContext = function(input) {
			
			if (input.keys["LMB"]) {
				
			}
			
			return input;
		}
		
		return local;
	}
	
	// This is a window enhancement, it lets you resize the window
	// Rename?
	localContainer.getWindowWidgetResize = function(config) {
		var local = {
			pos: [0, 0],
			localPos: [0, 0],
			ratio: [10, 10],
			localRatio: [10, 10],
			ratioPos: [0, 0],
			minRatio: [0, 0],
			offset: [20, 20], // Offset, inset
			selectedEdge: [undefined, undefined],
			parent: null,
			active: true,
			clicked: false
		};
		
		local.setup = function() {
			this.ratio = [this.parent.ratio[0], this.parent.ratio[1]];
			this.minRatio = [this.parent.ratio[0], this.parent.ratio[1]];
		};
		
		// All parameters are numbers and not lists
		local.getSide = function(newPosition, localPosition, localRatio, offset, inset) {
			var side; // side is set to undefined by default
			if (newPosition > localPosition - offset && 
				newPosition < localPosition + inset) side = true;
			if (newPosition > (localPosition + localRatio) - inset &&
				newPosition < localPosition + localRatio + offset) side = false;	
			return side;
		};
		
		local.getSelectedEdge = function(mousePos) {
			// true is top/left, false is bottom/right, undefined = not touching
			this.ratioPos = [this.ratio[0] + this.pos[0], this.ratio[1] + this.pos[1]];
			this.selectedEdge = [
				this.getSide(mousePos[0], this.pos[0], this.ratio[0], this.offset[0], this.offset[1]), // Top, bottom
				this.getSide(mousePos[1], this.pos[1], this.ratio[1], this.offset[0], this.offset[1]) // Left, right
			];
		};
		
		local.resizeFrame = function(mousePos) {
			if (this.active) {
				// Top
				if (this.selectedEdge[1]) {
					if (mousePos[1] < this.ratioPos[1] - this.minRatio[1]) {
						this.pos[1] = mousePos[1];
						this.ratio[1] = this.ratioPos[1] - mousePos[1];
					} else {
						this.pos[1] = this.ratioPos[1] - this.minRatio[1];
						this.ratio[1] = this.minRatio[1];
					}	
				}
			
				// left
				if (this.selectedEdge[0]) {
					if (mousePos[0] < this.ratioPos[0] - this.minRatio[0]) {
						this.pos[0] = mousePos[0];
						this.ratio[0] = this.ratioPos[0] - mousePos[0];
					} else {
						this.pos[0] = this.ratioPos[0] - this.minRatio[0];
						this.ratio[0] = this.minRatio[0];
					}
				}
				
				// Bottom
				if (this.selectedEdge[1] === false) {
					if (mousePos[1] > this.minRatio[1] + this.pos[1]) {
						this.ratio[1] = mousePos[1] - this.pos[1];
						this.ratioPos[1] = this.ratio[1] + this.pos[1];
					} else {
						this.ratio[1] = this.minRatio[1];
						this.ratioPos[1] = this.ratio[1] + this.pos[1];
					}
				}
				
				// right
				if (this.selectedEdge[0] === false) {
					if (mousePos[0] > this.minRatio[0] + this.pos[0]) {
						this.ratio[0] = mousePos[0] - this.pos[0];
						this.ratioPos[0] = this.ratio[0] + this.pos[0];
					} else {
						this.ratio[0] = this.minRatio[0];
						this.ratioPos[0] = this.ratio[0] + this.pos[0];
					}
				}
			}
		};
		
		local.click = function(mousePos, LMB, RMB) {
			if (!this.clicked) {
				this.clicked = true;
				this.getSelectedEdge(mousePos);
				return true;
			} else if (this.selectedEdge[0] !== undefined || this.selectedEdge[1] !== undefined) {
				this.resizeFrame(mousePos);
				this.parent.pos = [this.pos[0], this.pos[1]];
				this.parent.ratio = [this.ratio[0], this.ratio[1]];
				return true;
			}
			return false;
		};
		
		local.release = function(mousePos, LMB, RMB) {
			this.clicked = false;
			this.selectedEdge = [undefined, undefined];
		};
		
		local.update = function(parentWindow, blockPos, blockRatio) {
			this.parent.ratio = [this.ratio[0], this.ratio[1]];
		};
		
		return local;
	};
	
	// Add pos and ratio to this with context?
	localContainer.widget = function() {
		return {
			pos: [0, 0],
			localPos:[0, 0],
			ratio: [100, 100],
			localRatio:[0, 0],
			context: null,
			setup:function(context) {
				this.context = context;
			}
		};
	};
	
	localContainer.getLabelWidget = function(config) {
		var local = {};
		this.easy.base.newObject(this.widget, local);
		this.easy.base.newObject(this.easy.base.getAtomText(config), local);
		local.updateText = local.update;
		
		local.update = function(frame, newPos, ratio) {
			this.pos = newPos;
			this.updateText();
		};
		
		// rewrite the text.update to take into account active styles and non active
		
		return local;
	};
	
	localContainer.getRectangleWidget = function(config) {
		var local = {
			activeStyle: "default",
			styles: {
				"default": {
					alpha: 1,
					color: "gray",
					borderAlpha: 1,
					borderColor: "black",
					borderWidth: 1,
					borderStyle: "round"
				}
			}
		};
		this.easy.base.newObject(this.widget(), local);
		local.styles["default"] = this.easy.base.newObject(config.styles["default"], local.styles["default"]);		
		for (key in config.styles) {
			if (key != "default") {
				local.styles[key] = this.easy.base.newObject(config.styles[key], this.easy.base.newObject(local.styles["default"]));
			}
		}
		delete config.styles;
		this.easy.base.newObject(config, local);
		
		
		local.changeStyle = function(newStyle) {
			if (this.styles[newStyle]) this.activeStyle = newStyle;
			else console.warn("RectangleWidget doesn't have style '" + newStyle + "'");
		};
		
		local.update = function(frame, newPos, ratio) {
			this.context.beginPath();
			this.context.rect(this.pos[0], this.pos[1], this.ratio[0], this.ratio[1]);
			this.context.globalAlpha = this.styles[this.activeStyle].alpha;
			this.context.fillStyle = this.styles[this.activeStyle].color;
			this.context.fill();
			
			// Rect border
			this.context.globalAlpha = this.styles[this.activeStyle].borderAlpha;
			this.context.lineJoin = this.styles[this.activeStyle].borderStyle;
			this.context.lineWidth = this.styles[this.activeStyle].borderWidth;
			this.context.strokeStyle = this.styles[this.activeStyle].borderColor;
			this.context.stroke();
			
		};
		
		return local;
	};
	
	// Make a widget rectangle and rewrite the update to have a active styles
	
	localContainer.getButtonWidget = function(config) {
		var local = {
			func: null,
			altFunc: null,
			label: null,
			active: false,
			clickedStyle: "default",
			clicked: false // This is to work-around 'input.keys["LMB"]' not having a pressed status
		};
		this.easy.base.newObject(this.widget(), local);
		this.easy.base.newObject(this.getRectangleWidget(config), local);
		local.updateRect = local.update;
		
		local.setup = function(context) {
			this.context = context;
			if (this.label) this.label.setup(context);
		};
		
		local.setText = function(text) {
			if (this.label) this.label.text = text;
			else console.warn("Cannot set text, label is null");
		};
		
		local.setLabel = function(label) {
			this.label = label;
		};
		
		local.inputContext = function(input) {
			if (input.keys["LMB"] || input.keys["RMB"]) {
				if (!this.clicked) {
					this.clicked = true;
					if (checkWithinBounds(input.mouse["mousePosition"], this.pos, this.ratio, 0)) {
						this.active = true;
						this.changeStyle(this.clickedStyle);
					}
				}
			}
			
			// TODO: Compress into one function
			if (input.keys["LMB"] == false) {
				if (this.active && this.func) {
					this.active = false;
					if (checkWithinBounds(input.mouse["mousePosition"], this.pos, this.ratio, 0)) {
						if (this.func) this.func();
					}
				}
				this.clicked = false;
				this.changeStyle("default");
				delete input.keys["LMB"];
			
			} else if (input.keys["RMB"] == false) {
				if (this.active && this.altFunc) {
					this.active = false;
					if (checkWithinBounds(input.mouse["mousePosition"], this.pos, this.ratio, 0)) {
						if (this.altFunc) this.altFunc();
					}
				}
				this.clicked = false;
				this.changeStyle("default");
				delete input.keys["RMB"];
			}
			
			if (this.clicked) return input;
		};
		
		local.update = function(frame, newPos, ratio) {
			this.pos = newPos;
			this.updateRect();
			if (this.label) this.label.update(frame, [newPos[0] + (this.ratio[0]/2), newPos[1] + (this.ratio[1]/2)], this.ratio);
		};
		
		return local;
	};
	
	localContainer.getTextWidget = function(config) {
		var local = this.easy.base.newObject(this.widget());
		this.easy.base.newObject(this.easy.base.getAtomText(config), local);
		local.updateText = local.update;
		local.setup = function(context) {
			this.context = context;
			this.setTextWidth();
		};
		local.update = function(frame, newPos, ratio) {
			this.pos = newPos;
			this.updateText();
		};
		return local;
	};

	localContainer.getRectWidget = function(config) {
		var local = this.easy.base.newObject(this.widget());
		this.easy.base.newObject(this.easy.base.getAtomRectangle(config), local);
		
		local.updateRect = local.update;
		
		local.update = function(frame, newPos, blockRatio) {
			this.pos = newPos;
			this.updateRect();
		};
		return local;
	};
	
	localContainer.getBackgroundRectWidget = function(config) {
		var local = {};
		this.easy.base.newObject(this.getRectWidget(config), local);
		
		local.update = function(frame, newPos, blockRatio) {
			this.pos = newPos;
			this.ratio = blockRatio;
			this.updateRect();
		};

		return local;
	};
	
	// Really needed?
	localContainer.getGrid = function(config) {
		var local = {
			ratio: [50, 50],
			gridSize: [5, 5]
		};
		this.easy.base.newObject(this.widget, local);
		this.easy.base.newObject(this.easy.base.getAtomCustomLines(config), local);
		
		local.setup = function(context) {
			this.context = context;
			
			for (var index=0; index < this.ratio.length; index++) {
				
				var offset = 0;
				
				for (; offset <= this.ratio[index]; ) {
					
					// Make a mesh
					this.shape.push();
					
				}
				
			}
			
		};
		
		local.update = function(frame) {
		
		};
		
		return local;
	};
	
	localContainer.getViewObject = function(config) {
		var local = {
			object: null,
			objectOriginal: null,
			ratio: [0, 0],
			pos:[0,0],
			active: false
		};
		this.easy.base.newObject(this.widget(), local);
		this.easy.base.newObject(this.easy.base.atom, local);
		this.easy.base.newObject(config, local);
		
		local.setup = function(context) {
			this.context = context;
			if (this.object) {
				this.object.setup(context);
			}
		};
		
		local.inputContext = function(input) {
			if (input.keys["LMB"]) {
				if (!this.active) {
					if (checkWithinBounds(input.mouse["mousePosition"], this.pos, this.ratio, 0)) {
						this.active = true;
						var localMousePos = [
							input.mouse["mousePosition"][0] - this.object.pos[0], 
							input.mouse["mousePosition"][1] - this.object.pos[1], 
						];
						
						var newSlotName = "slot_" + input.mouse["mousePosition"][0] + input.mouse["mousePosition"][1];
						
						this.object.addSlot(newSlotName, localMousePos);
						this.objectOriginal.addSlot(newSlotName, localMousePos);
						
						console.log("Ship slot added at: " + localMousePos);
						
						return input;
					}
				}
			}
			
			if (input.keys["LMB"] === false) {
				this.active = false;
			}
			
			if (input.keys["RMB"]) {
				if (!this.active) {
					if (checkWithinBounds(input.mouse["mousePosition"], this.pos, this.ratio, 0)) {
						this.active = true;
						var localMousePos = [
							input.mouse["mousePosition"][0] - this.object.pos[0], 
							input.mouse["mousePosition"][1] - this.object.pos[1], 
						];
						
						for (var slotName in this.object.slots) {;
							var slot = this.object.slots[slotName];
							if (Math.abs(slot.offset[0] - localMousePos[0]) < 20 && Math.abs(slot.offset[1] - localMousePos[1]) < 20) {
								if (this.object.isSlotEmpty(slotName)) {
									
									var newEngine = localContainer.easy.components.engineNew({
										image:DATA.images["engine"],
										offset:[DATA.images["engine"].width/2, DATA.images["engine"].height/2],
										power: 10
									});
									
									var newEngineDup = localContainer.easy.base.copyItem(newEngine);
									
									this.object.addObject(slotName, newEngine);
									this.objectOriginal.addObject(slotName, newEngineDup);
									console.log("Engine added to slot: " + slotName);
									this.objectOriginal.sortEngines();
									console.log("Recal engines..");
									
									return input
								}
							}
						}
						
					}
				}
			}
			
			if (input.keys["RMB"] === false) {
				this.active = false;
			}
			
		};

		local.setObject = function(object) {
			this.object = localContainer.easy.base.copyItem(object);
			this.object.setScale(1);
			this.object.imageSmoothing = false;
			this.objectOriginal = object;
			if (this.context) this.object.setup(this.context);
		};
		
		local.reset = function() {
			this.object = null;
			this.objectOriginal = null;
		};
		
		local.update = function(frame, newPos, blockRatio) {
			this.pos = [newPos[0] - (this.ratio[0]/2), newPos[1] - (this.ratio[1]/2)];
			if (this.object) {
				this.object.pos = newPos;
				this.object.update(frame);
			}
		};
		
		return local;
	};
	
	return localContainer;
};