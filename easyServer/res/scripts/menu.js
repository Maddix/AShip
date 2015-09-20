// /////////////
// Window system

function WindowLib(easyFrame) {
	var localContainer = {
		version:"1.0",
		easy: easyFrame
	};

	// Write test to make sure that objects getting pushed though the pipeline have the required stuff

	localContainer.getMenuContainer = function(config) {
		var local = {
			name: "Unnamed_Object",
			activeObject: null,
			context: null,
			active: false,
			inputContext: undefined,
			validate: function(object) {
				if (object.updateGraphics && object.setup && object.inputContext && object.updateEvents) return true;
			}
		};
		this.easy.Base.extend(this.easy.Base.orderedObject(), local, true);
		this.easy.Base.extend(config, local);

		local.setup = function(context) {
			this.context = context;
			this.iterateOverObjects(function(object) {
				object.setup(context, local.name);
			});
		};

		local.orderedObject_add = local.add;
		local.add = function(objectName, object) {
			if (this.orderedObject_add(objectName, object)) {
				if (this.context) object.setup(this.context);
				return true;
			}
		};

		// Left empty to be extended and filled in.
		local.updateEvents = function(events) {
		};

		local.inputContext = function(input) {
			var processedInput = undefined;
			if (localContainer.easy.Math.checkWithinBounds(input.mouse["mousePosition"], this.pos, this.ratio, 0) || this.active) {
				for (var objectIndex=this.objectNames.length-1; objectIndex >= 0; objectIndex--) {
					var object = this.objects[this.objectNames[objectIndex]];
					processedInput = object.inputContext(input);
					if (processedInput) {
						this.active = true;
						break;
					} else {
						//this.acitve = false;
					}
				}
			}
			return processedInput;
		};

		local.updateLogic = function(frame) {
			this.iterateOverObjects(function(object) {
				if (object.updateLogic) object.updateLogic(frame);
			});
		}

		local.updateGraphics = function() {
			this.iterateOverObjects(function(object) {
				object.updateGraphics();
			});
		};

		return local;
	};

	localContainer.getMenuManager = function(config) {
		var local = {
			eventController: this.easy.Base.getEventController()
		};
		this.easy.Base.extend(this.getMenuContainer(config), local);

		local.setup = function(context, name) {
			this.context = context;
			this.iterateOverObjects(function(object) {
				object.setup(context, local.name, this.eventController);
			});
		};

		local.menuContainer_add = local.add;
		local.add = function(objectName, object) {
			if (this.menuContainer_add(objectName, object)){
				this.eventController.add(objectName, object);
				return true;
			};
		};

		local.menuContainer_updateLogic = local.updateLogic;
		local.updateLogic = function(frame) {
			this.menuContainer_updateLogic(frame);
			this.eventController.updateLogic();
		};

		local.inputContext = function(input) {
			for (var objectIndex=this.objectNames.length-1; objectIndex >= 0; objectIndex--) {
				var object = this.objects[this.objectNames[objectIndex]];
				var returnedInput = object.inputContext(input);
				if (returnedInput) {
					input = returnedInput;
					break;
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
			arrangeStyle: "",
			arrangeFunctions: {},
			eventController: null
		};
		this.easy.Base.extend(this.getMenuContainer(this.easy.Base.manageEvents(config)), local);

		local.arrangeFree = function(objects, objectNames, pos, ratio) {
			for (var nameIndex in objectNames) {
				var object = objects[objectNames[nameIndex]];
				var newPos = [
					pos[0] + (ratio[0] * (object.localPos[0]/100)),
					pos[1] + (ratio[1] * (object.localPos[1]/100))
				];
				object.updateGraphics(newPos, ratio);
			}
		};
		if (!local.arrangeFunctions["free"]) local.arrangeFunctions["free"] = local.arrangeFree;

		local.setup = function(context, name, eventController) {
			this.context = context;
			this.parentName = name;
			this.eventController = eventController;

			this.iterateOverObjects(function(object) {
				object.setup(context, eventController);
			});
		};

		console.log("TODO: You need to fix the eventController. Make sure it works whether you call setup or add.");

		local.menuContainer_add = local.add;
		local.add = function(objectName, object) {
			if (this.menuContainer_add(objectName, object)){
				if (this.eventController) this.eventController.add(objectName, object);
				return true;
			};
		};

		local.updateEvents = function(events) {
			console.log("Processing events..");
			//if (events) console.log("Events:", events);

			this.iterateOverEvents(this.searchEvents("_moveWindow", events), function(event) {
				console.log("Event Found!");
				if (event.message.pos) this.pos = event.message.pos;
			});
		};

		local.updateGraphics = function(parentPos, parentRatio) {
			var parentPos = parentPos ? parentPos : this.pos;
			var parentRatio = parentRatio ? parentRatio : this.ratio;

			var pos = [
				parentPos[0] + (parentRatio[0] * (this.pos[0]/100)),
				parentPos[1] + (parentRatio[1] * (this.pos[1]/100))
			];
			var ratio = [
				parentRatio[0] * (this.ratio[0]/100),
				parentRatio[1] * (this.ratio[1]/100)
			];

			if (this.arrangeFunctions[this.arrangeStyle]) {
				this.arrangeFunctions[this.arrangeStyle](this.objects, this.objectNames, pos, ratio);
			}
		};

		return local;
	};

	localContainer.widgetDrag = function(config) {
		var local = {
			dragEvent: null,
			disable: false,
			inputActive: false,
			clicked: false,
			targetName: "Need a target name!"
		};
		this.easy.Base.extend(this.widget(), local, true);
		this.easy.Base.extend(this.easy.Base.manageEvents(config), local);

		local.updateEvents = function(events) {
			if (this.dragEvent) {
				var event = this.dragEvent;
				this.dragEvent = null;
				return event;
			}
		};

		local.inputContext = function(input) {

			// Setup
			if (input.keys["LMB"]) {
				if (!this.clicked) {
					console.log("clicked");
					this.clicked = true;
					if (localContainer.easy.Math.checkWithinBounds(input.mouse["mousePosition"], this.pos, this.ratio, 0)) {
						this.inputActive = true;
					}
				}
			}

			if (this.inputActive) {
				this.dragEvent = this.createEvent("_moveWindow", {pos: input.mouse["mousePosition"]});
				delete input.keys["LMB"];
			}

			if (input.keys["LMB"] === false) {
				console.log("Released");
				this.clicked = false;
				this.inputActive = false;
			}

			if (this.inputActive) return input;
		};

		local.updateLogic = function(frame) {

		};

		local.updateGraphics = function(newPos, newRatio) {
			this.pos = newPos;
			this.ratio = newRatio;
		};

		return local;
	}


	localContainer.getResize = function(config) {
		var local = {
			minimumRatio: [100, 100],
			dragOffset: 5 // px
		};
		this.easy.Base.extend(config, local);



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
			parentName: "parent Name!",
			setup:function(context, name) {
				this.context = context;
				this.parentName = name;
			}
		};
	};

	localContainer.getLabelWidget = function(config) {
		var local = {};
		this.easy.Base.extend(this.widget(), local);
		this.easy.Base.extend(this.easy.Graphics.getAtomText(config), local);

		local.inputContext = function(input) {
			return input;
		};

		local.updateText = local.updateGraphics;
		local.updateGraphics = function(newPos, newRatio) {
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
		this.easy.Base.extend(this.widget(), local);
		local.styles["default"] = this.easy.Base.extend(config.styles["default"], local.styles["default"]);
		for (key in config.styles) {
			if (key != "default") {
				local.styles[key] = this.easy.Base.extend(config.styles[key], this.easy.Base.extend(local.styles["default"]));
			}
		}
		delete config.styles;
		this.easy.Base.extend(config, local);


		local.changeStyle = function(newStyle) {
			if (this.styles[newStyle]) this.activeStyle = newStyle;
			else console.warn("RectangleWidget doesn't have style '" + newStyle + "'");
		};

		local.update = function() { // frame, newPos, ratio
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


	localContainer.getInputfieldWidget = function(config) {
		var local = {
			label: null,
			active: false,
			clicked: false,
			clickedStyle: "default",
			defaultStyle: "default",
			text: "",
			maxTextLength: 0,
			maxTextChars: -1,
			keyCount: -1, // This way we can start the count at 0
			keyBlacklist: [
				"LMB", "RMB", "MMB", "upArrow", "leftArrow",
				"rightArrow", "downArrow", "shift", "ctrl",
				"alt", "escape", "enter", "space", "backspace"
			]
		};
		this.easy.Base.extend(this.getRectangleWidget(config), local);
		local.updateRect = local.update;

		if (!local.maxTextLength) local.maxTextLength = local.ratio[0]-15;

		local.setup = function(context) {
			this.context = context;
			if (this.label) this.label.setup(context);
		};

		// If clicked on then remain active, if click elsewhere then deactivate.

		local.inputContext = function(input) {

			if (input.keys["LMB"]) {
				if (checkWithinBounds(input.mouse["mousePosition"], this.pos, this.ratio, 0)) {
					this.clicked = true;
					this.changeStyle(this.clickedStyle);
					this.active = true;
				} else {
					this.clicked = false;
					this.changeStyle(this.defaultStyle);
				}
			}

			// Scan keys
			if (this.active) {
				if (input.keyOrder) {
					for (var index=0; index < input.keyOrder.length; index++) {
						key = input.keyOrder[index];
						if (key[0] > this.keyCount) {
							this.keyCount = key[0];
							if (this.keyBlacklist.indexOf(key[1]) === -1) {
								this.text += key[1];
								this.keyCount = key[0];
								delete input.keys[key[1]];
							} else if (key[1] === "space") {
								this.text += " ";
								this.keyCount = key[0];
								delete input.keys["space"];
							} else if (key[1] === "backspace") {
								this.text = this.text.slice(0, -1);
								this.keyCount = key[0];
								delete input.keys["backspace"];
							}
						} else {
							if (this.keyBlacklist.indexOf(key[1]) === -1) {
								delete input.keys[key[1]];
							} else if (key[1] === "space") {
								delete input.keys[key[1]];
							}
						}
					}
				}
			}

			if (this.active) {
				if (!this.clicked) this.active = false;
				return input;
			}
		};

		local.update = function(frame, newPos, ratio) {
			this.pos = newPos;
			this.updateRect();
			if (this.label) {
				this.label.text = this.text;
				this.label.update(frame, [newPos[0] + (this.ratio[0]/2), newPos[1] + (this.ratio[1]/2)], this.ratio);
			}
		};

		return local;
	};

	localContainer.getButtonWidget = function(config) {
		var local = {
			func: null,
			altFunc: null,
			label: null,
			active: false,
			clickedStyle: "default",
			defaultStyle: "default",
			clicked: false // This is to work-around 'input.keys["LMB"]' not having a pressed status
		};
		this.easy.Base.extend(this.getRectangleWidget(config), local);
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

			if (input.keys["LMB"]) {
				// One time setup
				if (!this.clicked) {
					this.clicked = true;
					if (checkWithinBounds(input.mouse["mousePosition"], this.pos, this.ratio, 0)) {
						this.changeStyle(this.clickedStyle);
						this.active = true;
					}
				}
			}

			if (input.keys["LMB"] === false) {
				if (checkWithinBounds(input.mouse["mousePosition"], this.pos, this.ratio, 0)) {
					if (this.active && this.func) this.func();
					delete input.keys["LMB"];
				}
				this.clicked = false;
				this.changeStyle(this.defaultStyle);
			}


			if (this.active) {
				if (!this.clicked) this.active = false;
				return input;
			}
		};

		local.update = function(frame, newPos, ratio) {
			this.pos = newPos;
			this.updateRect();
			if (this.label) this.label.update(frame, [newPos[0] + (this.ratio[0]/2), newPos[1] + (this.ratio[1]/2)], this.ratio);
		};

		return local;
	};

	localContainer.getRectangleWidget = function(config) {
		var local = this.widget();
		this.easy.Base.extend(this.easy.Graphics.getAtomRectangle(config), local);

		local.updateRect = local.updateGraphics;
		local.updateGraphics = function(newPos, newRatio) {
			this.pos = newPos;
			this.updateRect();
		};
		return local;
	};

	localContainer.getBackgroundRectangleWidget = function(config) {
		var local = this.easy.Base.extend(this.getRectangleWidget(config));

		local.updateGraphics = function(newPos, newRatio) {
			this.pos = newPos;
			this.ratio = newRatio;
			this.updateRect();
		};

		return local;
	};

	// Add a border around a window and add a menu bar with buttons.
	localContainer.getBackgroundWindowMenuWidget = function(config) {
		var local = {

		};
		this.easy.Base.extend(this.getBackgroundRectangleWidget(config), local);

		local.inputContext = function(input) {
			return input;
		};

		local.backgroundRectangle_updateGraphics = local.updateGraphics;
		local.updateGraphics = function(newPos, newRatio) {

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
		this.easy.Base.extend(this.widget(), local);
		this.easy.Base.extend(this.easy.Base.atom, local);
		this.easy.Base.extend(config, local);

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

									var newEngineDup = localContainer.easy.Base.copyItem(newEngine);

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
			this.object = localContainer.easy.Base.copyItem(object);
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
