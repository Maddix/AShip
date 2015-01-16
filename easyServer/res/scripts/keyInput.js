// This uses Jquery 2.0.3 and Jquary-mousewheel(https://github.com/brandonaaron/jquery-mousewheel)
// Note for mousedown/up, event.which ~ 1 for left, 2 for middle, 3 for right
// TODO: Add brackets, comma, ect. to the keyMap

function inputHandler(easyFrameBase) {
	var localContainer = {
		version:"1.0",
		requires: "Jquery 2.0.3+ and Jquery-mousewheel",
		easyFrameBase:easyFrameBase
	};

	localContainer.getKeyboardMouseController = function(config) {
		var local = {
			keyEvent:{}, // Keep track of held down keys (key:bool) (true is down, false is up)
			mouseEvent:{}, // Keeps track of mouse movement and scrolling
			removeKeyEvent:[],
			knownKeys:[], // Needed to keep normal functionality on the page (F5, Ctrl-R, ect), fill with keys we want to know about
			elementForKeys: "body",
			elementForMouse: "canvas",
			getScrollData: true,
			keyMapReversed: { // Used! HA!
					"a":65, "b":66, "c":67, "d":68, "e":69, "f":70, "g":71,
					"h":72, "i":73, "j":74, "k":75, "l":76, "m":77, "n":78,
					"o":79, "p":80, "q":81, "r":82, "s":83, "t":84, "u":85,
					"v":86, "w":87, "x":88, "y":89, "z":90, 
					"upArrow":38, "leftArrow":37, "rightArrow":39, "downArrow":40, 
					"backspace":8, "enter":13, "space":32, "escape":27,
					"shift":16, "ctrl":17, "alt":18, "tab":9,
					"0":48, "1":49,"2":50, "3":51, "4":52,
					"5":53, "6":54, "7":55, "8":56, "9":57,
					"LMB":1, "MMB":2, "RMB":3
			},
			keyMapDefault: { // Keep in mind that the key-codes are from the Jquery event.which
					65:"a", 66:"b", 67:"c", 68:"d", 69:"e", 70:"f", 71:"g",
					72:"h", 73:"i", 74:"j", 75:"k", 76:"l", 77:"m", 78:"n",
					79:"o", 80:"p", 81:"q", 82:"r", 83:"s", 84:"t", 85:"u",
					86:"v", 87:"w", 88:"x", 89:"y", 90:"z",
					38:"upArrow", 37:"leftArrow", 36:"rightArrow", 40:"downArrow",
					8:"backspace", 13:"enter", 32:"space", 27:"escape",
					16:"shift", 17:"ctrl", 18:"alt", 9:"tab",
					48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 
					53:"5", 54:"6", 55:"7", 56:"8", 57:"9",
					1:"LMB", 2:"MMB", 3:"RMB"
			},
			keyMap:{} // set to default below, this is so we can modify keyMap and still 
						// be able to set it back to the default mapping
		};
		local.keyMap = this.easyFrameBase.newObject(local.keyMapDefault);
		this.easyFrameBase.newObject(config, local);

		local.addKeyEvent = function(key) {
			if (this.keyEvent[key] === undefined && this.knownKeys.indexOf(key) != -1) {
				this.keyEvent[key] = false;
			}
		};
		
		local.changeKeyMapping = function(newMapping) {
			for (var newKey in newMapping) {
				delete this.keyMap[this.keyMapReversed[newMapping[newKey]]];
				this.keyMap[this.keyMapReversed[newKey]] = newMapping[newKey];
			}
		};
		
		local.resetKeyMapping = function() {
			this.keyMap = easyFrameBase.newObject(this.keyMapDefault);
		};
		
		// this will update the keys that are being held
		local.update = function() {			
			// get a snapshot of the key/mouse events
			var newKeyMouse = {keys:localContainer.easyFrameBase.newObject(this.keyEvent), 
								mouse:localContainer.easyFrameBase.newObject(this.mouseEvent)};
			
			// set the keys to "held" - works well, don't need it now, and it just slows things down \_(._.)_/
			//for (var keyIndex in this.keyEvent) {
			//	if (this.keyEvent[keyIndex] === true) this.keyEvent[keyIndex] = "held";
			//}
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
		}
		
		local.setupListeners = function() {
			$(this.elementForKeys).on("keydown", function(jqueryKeyEvent) {
				var convertedKey = local.keyMap[jqueryKeyEvent.which];
				local.addKeyEvent(convertedKey);
				if (local.keyEvent[convertedKey] === false) {
					local.keyEvent[convertedKey] = true;
					return false;
				}	
			});
			
			$(this.elementForKeys).on("keyup", function(jqueryKeyEvent) {
				var convertedKey = local.keyMap[jqueryKeyEvent.which];
				if (local.keyEvent[convertedKey]) {
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

	// /////////////////////////////////////////
	// InputController - Handles input contexts
	// ---------------
	
	localContainer.getInputController = function() {
		var local = {
			contextGroup:{}, // [group:{keys, contexts}, ..]
			groupKeys: []
		};
		
		local.addContext = function(contextGroupName, contextName, context) {
			// If no contextGroup is found, then make one
			if (!this.contextGroup[contextGroupName]) {
				this.contextGroup[contextGroupName] = {keys:[], contexts:{}};
				this.groupKeys.push(contextGroupName);
			}
			this.contextGroup[contextGroupName].keys.push(contextName);
			this.contextGroup[contextGroupName].contexts[contextName] = context;
		};
		
		local.removeContext = function(contextGroupName, contextName) {
			var index = this.contextGroup[contextGroupName].keys.indexOf(contextName);
			if (index != -1) {
				this.contextGroup[contextGroupName].keys.splice(index, 1);
				delete this.contextGroup[contextGroupName].contexts[contextName];
				
				// remove the group if its unused
				if (this.contextGroup[contextGroupName].keys.length <= 0) {
					var groupIndex = this.groupKeys.indexOf(contextGroupName);
					this.groupKeys.splice(groupIndex, 1);
					delete this.contextGroup[contextGroupName];
				}
			}
		};
		
		local.changeContextPosition = function(contextGroupName, contextName, newIndex) {
			var contextIndex = this.contextGroup[contextGroupName].keys.indexOf(contextName);
			if (contextIndex != -1 && newIndex < this.contextGroup[contextGroupName].keys.length) {
				this.contextGroup[contextGroupName].keys.splice(contextIndex, 1);
				this.contextGroup[contextGroupName].keys.splice(newIndex, 0, contextName);
			}
		};
		
		// not tested
		local.getContextPosition = function(contextGroupName, contextName) {
			return this.contextGroup[contextGroupName].keys.indexOf(contextName);
		};
		
		local.update = function(newKeyList) {
			
			/*/ testing - remove when you can't remember why its here
			if (newKeyList.keys["space"]) {
				console.log(newKeyList.keys);
			} else if (newKeyList.keys["space"] === false) {
				console.log(newKeyList.keys);
			}
			*/
			
			var remainingKeys = newKeyList;
			for (var groupIndex in this.groupKeys) {
				var group = this.contextGroup[this.groupKeys[groupIndex]];
				for (var contextIndex in group.keys) {
					remainingKeys = group.contexts[group.keys[contextIndex]](remainingKeys);
				}
			}
		};
		
		return local;
	}
	
	return localContainer;
};