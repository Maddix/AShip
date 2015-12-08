// This uses Jquery 2.0.3 and Jquary-mousewheel(https://github.com/brandonaaron/jquery-mousewheel)
// Note for mousedown/up, event.which ~ 1 for left, 2 for middle, 3 for right

function InputHandler(easyFrame) {
	var localContainer = {
		version:"1.0",
		requires: "Jquery 2.0.3+ and Jquery-mousewheel",
		easy:easyFrame
	};

	localContainer.Context = function(config) {
		var local = {

		}

		return local;
	}

	localContainer.getKeyboardMouseController = function(config) {
		var local = {
			keyEvent:{}, // Keep track of held down keys (key:[bool, ID]) (true is down, false is up)
			keyEventOrder: [], // Keep track of which key pressed first [[ID, key] ..]
			mouseEvent:{}, // Keeps track of mouse movement and scrolling
			removeKeyEvent:[],
			removeMouseEvent:[],
			whitelistKeys: [],
			blacklistKeys: [],
			elementForKeys: "body",
			elementForMouse: "canvas",
			keyCount: 0,
			getScrollData: true,
			keyMapReversed: {},
			keyMapDefault: { // Keep in mind that the key-codes are from the Jquery event.which, need to add in special characters
				65:"a", 66:"b", 67:"c", 68:"d", 69:"e", 70:"f", 71:"g",
				72:"h", 73:"i", 74:"j", 75:"k", 76:"l", 77:"m", 78:"n",
				79:"o", 80:"p", 81:"q", 82:"r", 83:"s", 84:"t", 85:"u",
				86:"v", 87:"w", 88:"x", 89:"y", 90:"z",
				38:"upArrow", 37:"leftArrow", 36:"rightArrow", 40:"downArrow",
				8:"backspace", 13:"enter", 32:"space", 27:"escape",
				16:"shift", 17:"ctrl", 18:"alt", 9:"tab",
				48:"0", 49:"1", 50:"2", 51:"3", 52:"4",
				53:"5", 54:"6", 55:"7", 56:"8", 57:"9",
				188:",", 190:".", 191:"/", 219:"[", 220:"\\", 221:"]", 192:"`",
				186:";", 222:"'", 189: "-", 187:"=",
				112:"f1", 113:"f2", 114:"f3", 115:"f4", 116:"f5", 117:"f6",
				118:"f7", 119:"f8", 120:"f9", 121:"f10", 122:"f11", 123:"f12",
				1:"LMB", 2:"MMB", 3:"RMB" // Not sure if having these in caps will throw people off.
			},
			keyMapDefaultShift: {
				49: "!", 50:"@", 51:"#", 52:"$", 53:"%", 54:"^",
				55:"&", 56:"*", 57:"(", 58:")", 189:"_", 187:"+",
				219:"{", 221:"}", 220:"|", 186:":", 222:'"', 188:"<",
				190:">", 191:"?", 192:"~"
			},
			// Move away from this - ? What?
			keyMap:{}, // set to default below, this is so we can modify keyMap and still
					  // be able to set it back to the default mapping
			keyMapShift:{}
		};
		local.keyMap = this.easy.Base.extend(local.keyMapDefault);
		local.keyMapShift = this.easy.Base.extend(local.keyMapDefaultShift);
		this.easy.Base.extend(config, local);

		local.addKeyEvent = function(key) {
			if (this.keyEvent[key] === undefined) {
				if (this.whitelistKeys.length && this.whitelistKeys.indexOf(key) != -1 || this.blacklistKeys.indexOf(key) === -1) {
					this.keyEvent[key] = [false, ++this.keyCount];
					this.keyEventOrder.push([this.keyCount, key]);
				}
			}
		};

		local.changeKeyMapping = function(newMapping) {
			for (var newKey in newMapping) {
				delete this.keyMapDefault[this.keyMapReversed[newMapping[newKey]]];
				this.keyMapDefault[this.keyMapReversed[newKey]] = newMapping[newKey];
			}
		};

		local.resetKeyMapping = function() {
			this.keyMapDefault = localContainer.easy.base.inherit(this.keyMapDefault);
		};

		local.createReversedKeyMap = function() {
			this.keyMapReversed = {};
			for (key in this.keyMapDefault) {
				this.keyMapReversed[this.keyMapDefault[key]] = parseInt(key);
			}
		};
		local.createReversedKeyMap(); // Call it here since we don't have a setup.

		// this will update the keys that are being held
		local.update = function() {
			// get a snapshot of the key/mouse events
			var newKeyMouse = {
				keys:localContainer.easy.Base.extend(this.keyEvent),
				mouse:localContainer.easy.Base.extend(this.mouseEvent),
				keyOrder:localContainer.easy.Base.extend(this.keyEventOrder)
			};

			// clear both key and mouse events
			for (var keyIndex in this.removeKeyEvent) {
				delete this.keyEvent[this.removeKeyEvent[keyIndex]];
			}
			this.removeKeyEvent = []; // reset the removeKeyEvent

			for (var mouseIndex in this.removeMouseEvent) {
				delete this.mouseEvent[this.removeMouseEvent[mouseIndex]];
			}
			this.removeMouseEvent = []; // reset the removeMouseEvent

			// return the snapshot
			return newKeyMouse;
		};

		// I should create a function that removes all the listeners ?
		local.setupListeners = function() {
			$(this.elementForKeys).on("keydown", function(jqueryKeyEvent) {
				var convertedKey = local.keyMap[jqueryKeyEvent.which];
				if (local.keyEvent["shift"]) {
					var convertedShiftKey = local.keyMapShift[jqueryKeyEvent.which];
					if (convertedShiftKey) {
						convertedKey = convertedShiftKey;
					} else if (convertedKey.length === 1) {
						convertedKey = convertedKey.toUpperCase();
					}
				}

				local.addKeyEvent(convertedKey);
				if (local.keyEvent[convertedKey] && local.keyEvent[convertedKey][0] === false) {
					local.keyEvent[convertedKey][0] = true;
					return false;
				} else if (convertedKey === "backspace") {
					return false;
				}
			});

			$(this.elementForKeys).on("keyup", function(jqueryKeyEvent) {
				var convertedKey = local.keyMap[jqueryKeyEvent.which];
				var shiftKey = local.keyMapShift[jqueryKeyEvent.which];
				var upper = convertedKey ? convertedKey.toUpperCase() : "";

				if (local.keyEvent[shiftKey]) {
					convertedKey = shiftKey;
				} else if (local.keyEvent[upper]) {
					convertedKey = upper;
				}

				if (local.keyEvent[convertedKey]) {
					// This will remove the list of [true, ID] and replace it with false
					for (var index=0; index < local.keyEventOrder.length; index++) {
						var keyID = local.keyEventOrder[index][0];
						if (keyID === local.keyEvent[convertedKey][1]) {
							local.keyEventOrder.splice(index, 1);
							break;
						}
					}
					local.keyEvent[convertedKey] = false;
					local.removeKeyEvent.push(convertedKey);
					return false;
				}
			});

			$(this.elementForMouse).on("mousemove", function(jqueryMouseEvent) {
				local.mouseEvent["mousePosition"] = [
					jqueryMouseEvent.pageX - $(local.elementForMouse).offset().left,
					jqueryMouseEvent.pageY - $(local.elementForMouse).offset().top
				];
			});

			if (this.getScrollData) {
				$(this.elementForMouse).on("mousewheel", function(jqueryMouseEvent) {
						var delta = [jqueryMouseEvent.deltaX, jqueryMouseEvent.deltaY];
						// normalize the scroll delta
						for (var index in delta){
							if (delta[index] > 1) delta[index] = 1;
							if (delta[index] < -1) delta[index] = -1;
						}
						local.mouseEvent["mousewheel"] = delta;
						local.removeMouseEvent.push("mousewheel");
					return false; // returning false prevents the default action (page scroll)
				});
			}

			// Note for mousedown/up, event.which ~ 1 for left, 2 for middle, 3 for right
			$(this.elementForMouse).mousedown(function(jqueryKeyEvent) {
				var convertedKey = local.keyMap[jqueryKeyEvent.which];
				local.keyEvent[convertedKey] = true; // Might need to pass or prevent repeating
				jqueryKeyEvent.stopPropagation();
				jqueryKeyEvent.preventDefault();
			});

			$(this.elementForMouse).mouseup(function(jqueryKeyEvent) {
				var convertedKey = local.keyMap[jqueryKeyEvent.which];
				local.keyEvent[convertedKey] = false; // Might need to pass or prevent repeating
				local.removeKeyEvent.push(convertedKey);
				jqueryKeyEvent.stopPropagation();
				jqueryKeyEvent.preventDefault();
			});
		};
		local.setupListeners();

		return local;
	};

	// Profiles just hold groups of objects that have inputContexts. They can even hold other Profiles.
	localContainer.Profile = function(config) {
		var local = {
			validate: function(object) {
				if (object.inputContext) return true;
			},
			activeObjectName: false
		};
		this.easy.Base.extend(this.easy.Base.orderedObject(), local, true);
		this.easy.Base.extend(config, local);

		local.setActive = function(objectName) {
			if (this.objectNames.indexOf(objectName) != -1) {
				this.activeObjectName = objectName;
				return true;
			}
			this.activeObjectName = false;
			return false;
		};

		local.inputContext = function(input) {
			if (this.activeObjectName) {
				return this.objects[this.activeObjectName].inputContext(input);
			} else {
				var remainingKeys = input;
				this.iterateOverObjects(function(object, name) {
					if (remainingKeys) remainingKeys = object.inputContext(remainingKeys);
					else return true; // break out of the loop
				});
				return remainingKeys;
			}
		};

		return local;
	};

	return localContainer;
};
