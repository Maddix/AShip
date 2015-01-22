// /////////////
// Window system

function windowLib(easyFrame) {
	var localContainer = {
		version:"1.0",
		easy: easyFrame
	};
	
	// aka, the layer for windows
	// This handles multiple Windows
	localContainer.getWindowManager = function() {
		var local = {
			activeWindowName: false, // holds a string when in use
			windowOrder: [], // holds windowNames
			windows: {},
			inputContext: null,
			context: null // For the windows
		};
		
		local.setup = function(context) {
			this.context = context;
			for (var windowIndex in this.windowOrder) {
				this.windows[this.windowOrder[windowIndex]].setup(context);
			}
		};
		
		local.addWindow = function(windowName, newWindow) {
			this.windowOrder.push(windowName);
			this.windows[windowName] = newWindow;
			if (this.context) newWindow.setup(this.context);
		};
		
		local.reorderWindow = function(windowName, id) {
			this.windowOrder.splice(this.windowOrder.indexOf(windowName), 1);
			this.windowOrder.push(windowName);
		};
		
		local.removeWindow = function(windowName) {
			this.windowOrder.splice(this.windowOrder.indexOf(windowName), 1);
			delete this.windows[windowName];
		};

		local.click = function(input) {
			// Reorder the windows if a window got clicked
			
			if (!this.activeWindowName) {
				for (var windowIndex in this.windowOrder) {
					var windowName = this.windowOrder[windowIndex]
					var windowClick = this.windows[windowName].click(input);
					if (windowClick != undefined) {
						this.activeWindowName = windowName;
						return windowClick;
					};
				}
			} else {
				return this.windows[this.activeWindowName].click(input);
			}
		};
		
		local.release = function(input) {
			if (this.activeWindowName) this.windows[this.activeWindowName].release(input);
			this.activeWindowName = false;
		};
		
		local.update = function() {
			for (var windowIndex in this.windowOrder) {
				this.windows[this.windowOrder[windowIndex]].update();
			}
		};
		return local;
	}
	
	// This holds widgets that display/do things
	localContainer.getWindow = function(config) {
		var local = {
			pos:[0, 0],
			ratio:[100, 100],
			context:null,
			clicked:false,
			inputContexts:null,
			blocks:{},
			blockOrder:[], // holds blockNames
			activeWidget:[],
			clickBoundsOffset:5
		};
		this.easy.base.newObject(config, local);
		
		local.setup = function(context) {
			this.context = context;
			for (var blockIndex in this.blockOrder) {
				var block = this.blocks[this.blockOrder[blockIndex]];
				for (var blockWidgetIndex in block.widgets) {
					block.widgets[blockWidgetIndex].setup(this.context);
				}
			}
		};
		
		local.createBlock = function(blockName, config) {
			var newBlock = {
				pos:[0, 0],
				ratio:[100, 100],
				widgets:[],
				arrangeStyle:"high"
			};
			localContainer.easy.base.newObject(config, newBlock);
			this.blockOrder.push(blockName);
			this.blocks[blockName] = newBlock;
		};
		
		local.addWidget = function(blockName, widget) {
			this.blocks[blockName].widgets.push(widget);
			if (this.context) widget.setup(this.context);
		};
		
		local.getActiveWidget = function(input) {
			for (var blockIndex in this.blockOrder) {
				var blockName = this.blockOrder[blockIndex]
				var block = this.blocks[blockName];
				for (var blockWidgetIndex in block.widgets) {
					var widget = block.widgets[blockWidgetIndex];
					if (widget.click && widget.click(input)) {
						return [blockName, blockWidgetIndex];
					}
				}
			}
			return [];
		};
		
		local.click = function(input) {
			if (checkWithinBounds(input.mouse["mousePosition"], this.pos, this.ratio, this.clickBoundsOffset)) {
				if (!this.clicked) {
					this.clicked = true;
					this.activeWidget = this.getActiveWidget(input);
					return input;
				}
			} else {
				return false;
			}
			
			if (this.activeWidget.length) {
				this.blocks[this.activeWidget[0]].widgets[this.activeWidget[1]].click(input);
			}
		};
		
		local.release = function(input) {
			this.clicked = false;
			if (this.activeWidget.length) {
				return this.blocks[this.activeWidget[0]].widgets[this.activeWidget[1]].release(input);
			}
			this.activeWidget = [];
		};
		
		local.arrangeAlongAxis = function(widgets, pos, ratio, axis) {
			var currentStep = pos[axis] + 10; // + 10 is a hard coded offset, remove
			var step = ratio[axis] / widgets.length;
			for (var widgetIndex in widgets) {
				var widget = widgets[widgetIndex];
				if (axis) widget.pos = [widget.pos[0], currentStep];
				else widget.pos = [currentStep, widget.pos[1]];
				currentStep += step;
			}
		};
		
		local.arrangeAlongCenter = function(widgets, pos, ratio, axis) {
			for (var widgetIndex in widgets) {
				var widget = widgets[widgetIndex];
				var center = pos[axis] + ((ratio[axis] - widget.ratio[axis])/2);
				if (axis) widget.pos = [widget.pos[0], center];
				else widget.pos = [center, widget.pos[1]];
			}
		};
		
		local.arrangeFree = function(widgets, pos, ratio) {
			for (var widgetIndex in widgets) {
				var widget = widgets[widgetIndex];
				widget.pos = [pos[0] + (ratio[0] * (widget.localPos[0]/100)), 
					pos[1] + (ratio[1] * (widget.localPos[1]/100))];
			}
		};
		
		// Note: localPos is not used as a percent, also localPos can be negative
		local.arrangeAbsolute = function(widgets, pos, ratio) {
			var pickEdge = function(pos, ratio, localPos, widgetRatio) {
				if (localPos >= 0) return pos + localPos;
				else return pos + ratio + localPos - widgetRatio;
			};
			for (var widgetIndex in widgets) {
				var widget = widgets[widgetIndex];
				widget.pos = [pickEdge(pos[0], ratio[0], widget.localPos[0], widget.ratio[0]), 
					pickEdge(pos[1], ratio[1], widget.localPos[1], widget.ratio[1])];
			}
		};
		
		local.arrangeWidgets = function(widgets, pos, ratio, style) {
			if (style == "long") {
				this.arrangeAlongAxis(widgets, pos, ratio, 0); // Stack them
				this.arrangeAlongCenter(widgets, pos, ratio, 1); // Center them
			} else if (style == "high") {
				this.arrangeAlongAxis(widgets, pos, ratio, 1); // Same for these two
				this.arrangeAlongCenter(widgets, pos, ratio, 0);
			} else if (style == "free") {
				this.arrangeFree(widgets, pos, ratio);
			} else if (style == "absolute") {
				this.arrangeAbsolute(widgets, pos, ratio);
			}
		};
		
		local.update = function() {
			for (var blockIndex in this.blockOrder) {
				var block = this.blocks[this.blockOrder[blockIndex]];
				var blockPos = [
					this.pos[0] + (this.ratio[0] * (block.pos[0]/100)), 
					this.pos[1] + (this.ratio[1] * (block.pos[1]/100))
				];
				var blockRatio = [
					this.ratio[0] * (block.ratio[0]/100), 
					this.ratio[1] * (block.ratio[1]/100)
				];

				// Arrange widgets
				this.arrangeWidgets(block.widgets, blockPos, blockRatio, block.arrangeStyle);
				
				for (blockWidgetIndex in block.widgets) {
					var widget = block.widgets[blockWidgetIndex];
					//console.log(widget.pos);
					if (widget.update) widget.update(blockPos, blockRatio);
				}
			}
		};
		return local;
	}
	
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
			clicked: false
		};
		this.easyFrameBase.newObject(config, local);
		
		local.click = function(mousePos, LMB, RMB) {
			if (checkWithinBounds(mousePos, this.pos, this.ratio, this.clickOffset)) {
				if (!this.clicked) {
					this.clicked = true;
					this.windowMouseOffset = [mousePos[0] - this.parent.pos[0], mousePos[1] - this.parent.pos[1]];
					return true;
				}
			}
			if (this.clicked) {
				this.parent.pos = [mousePos[0] - this.windowMouseOffset[0], mousePos[1] - this.windowMouseOffset[1]];
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
		
		local.release = function(mousePos, LMB, RMB) {
			this.clicked = false;
			this.windowMouseOffset = [0, 0];
		};
		
		local.update = function(parentWindow, blockPos, blockRatio) {
			this.ratio = [blockRatio[0] * (this.localRatio[0]/100), blockRatio[1] * (this.localRatio[1]/100)];
		};
		
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
	}
	
	localContainer.widget = {
		localPos:[0, 0],
		localRatio:[0, 0],
		setup:function(context) {
			this.context = context;
		}
	};
	
	localContainer.getTextWidget = function(config) {
		var local = this.easy.base.newObject(this.widget);
		this.easy.base.newObject(this.getButtonEnhancement(), local);
		this.easy.base.newObject(this.easy.base.getAtomText(config), local);
		local.setup = function(context) {
			this.context = context;
			this.setTextWidth();
		};
		return local;
	};

	localContainer.getRectWidget = function(config) {
		var local = {}
		this.easy.base.newObject(this.widget, local);
		this.easy.base.newObject(this.easy.base.getAtomRectangle(config), local);
		
		local.updateRect = local.update;
		
		local.update = function(blockPos, blockRatio) {
			this.ratio = blockRatio;
			this.updateRect();
		};
		return local;
	};
	
	
	
	// is that the right name for it? is it really a widget?
	// Shouldn't display anything by itself... It should be an enhancement! :D Done?
	localContainer.getButtonEnhancement = function() {
		var local = {
		clicked:false,
		buttonOffset:0
		};
		
		local.click = function(input) {
			if (checkWithinBounds(input.mouse["mousePosition"], this.pos, this.ratio, this.buttonOffset)) {
				if (!this.clicked) {
					this.clicked = true;
					console.log("Held.");
				}
				return true;
			} else {
				return false;
			}
		};
		
		local.release = function(input) {
			if (checkWithinBounds(input.mouse["mousePosition"], this.pos, this.ratio, this.buttonOffset)) {
				console.log("Clicked!");
				console.log(this);
			}
			this.clicked = false;
		};
		
		return local;
	};
	
	localContainer.getButtonWidgetOld = function(config) {
		var local = {
			localPos: [0, 0],
			widgets: [],
			clicked: false,
			onHoldColor: "gray",
			onHoldBorderColor: "red",
			buttonOffset: 0,
			defaultColor: "",
			defaultBorderColor: "",
			func: undefined
		};
		this.easyFrameBase.newObject(this.easyFrameBase.getAtomRectangle(config), local);
		local.updateRect = local.update;
		
		local.addWidget = function(newWidget) {
			this.widgets.push(newWidget);
		};
		
		local.setup = function(context) {
			this.context = context;
			this.defaultColor = this.color;
			this.defaultBorderColor = this.borderColor;
			// set the contexts
			for (var widgetIndex in this.widgets) {
				this.widgets[widgetIndex].setup(context);
			}
		};
		
		local.click = function(mousePos, LMB, RMB) {
			if (checkWithinBounds(mousePos, this.pos, this.ratio, this.buttonOffset)) {
				if (!this.clicked) {
					this.clicked = true;
					this.color = this.onHoldColor;
					this.borderColor = this.onHoldBorderColor;
				}
				return true;
			} else {
				return false;
			}
		};
		
		local.release = function(mousePos, LMB, RMB) {
			if (checkWithinBounds(mousePos, this.pos, this.ratio, this.buttonOffset)) {
				if (this.func) this.func();
			}
			this.clicked = false;
			this.color = this.defaultColor;
			this.borderColor = this.defaultBorderColor;
		};
		
		local.update = function() {
			this.updateRect();
			for (var widgetIndex in this.widgets) {
				var widget = this.widgets[widgetIndex];
				widget.pos = this.pos;
				widget.update();
			}
		};
		return local;
	}
	
	return localContainer;
};