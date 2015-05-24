// This uses Jquery 2.0.3 and Jquary-mousewheel(https://github.com/brandonaaron/jquery-mousewheel)
// Note for mousedown/up, event.which ~ 1 for left, 2 for middle, 3 for right
// TODO: Add brackets, comma, ect. to the keyMap

// Bubble up event input
// First issue - what was clicked?
// List of 
// Second issue - Managing bubbling event.
// 

function inputHandler(easyFrame) {
	var localContainer = {
		version:"1.0",
		requires: "Jquery 2.0.3+ and Jquery-mousewheel",
		easy:easyFrame
	};

	localContainer.getKeyboardMouseController = function(config) {
		var local = {
			keyEvent:{}, // Keep track of held down keys (key:[bool, ID]) (true is down, false is up)
			keyEventOrder: [], // Keep track of which key pressed first [[ID, key], ..]
			mouseEvent:{}, // Keeps track of mouse movement and scrolling
			removeKeyEvent:[],
			knownKeys:[], // Needed to keep normal functionality on the page (F5, Ctrl-R, ect), fill with keys we want to know about
			elementForKeys: "body",
			elementForMouse: "canvas",
			keyCount: 0,
			getScrollData: true,
			keyMapReversed: {},
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
			// Move away from this
			keyMap:{} // set to default below, this is so we can modify keyMap and still 
					  // be able to set it back to the default mapping
		};
		local.keyMap = this.easy.base.newObject(local.keyMapDefault);
		this.easy.base.newObject(config, local);

		local.addKeyEvent = function(key) {
			if (this.keyEvent[key] === undefined && this.knownKeys.indexOf(key) != -1) {
				this.keyEvent[key] = [false, ++this.keyCount];
				this.keyEventOrder.push(this.keyCount);
			}
		};
		
		local.changeKeyMapping = function(newMapping) {
			for (var newKey in newMapping) {
				delete this.keyMapDefault[this.keyMapReversed[newMapping[newKey]]];
				this.keyMapDefault[this.keyMapReversed[newKey]] = newMapping[newKey];
			}
		};
		
		local.resetKeyMapping = function() {
			this.keyMapDefault = localContainer.easy.base.newObject(this.keyMapDefault);
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
				keys:localContainer.easy.base.newObject(this.keyEvent), 
				mouse:localContainer.easy.base.newObject(this.mouseEvent),
				keyOrder:localContainer.easy.base.copyItem(this.keyEventOrder)
			};
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
		};
		
		// I should create a function that removes all the listeners ?
		local.setupListeners = function() {
			$(this.elementForKeys).on("keydown", function(jqueryKeyEvent) {
				var convertedKey = local.keyMap[jqueryKeyEvent.which];
				local.addKeyEvent(convertedKey);
				if (local.keyEvent[convertedKey] === false) {
					local.keyEvent[convertedKey][0] = true;
					return false;
				}	
			});
			
			$(this.elementForKeys).on("keyup", function(jqueryKeyEvent) {
				var convertedKey = local.keyMap[jqueryKeyEvent.which];
				if (local.keyEvent[convertedKey]) {
					// This will remove the list of [true, ID] and replace it with false, this is so you can do 'input.keys["w"] === false'.
					var indexID = local.keyEventOrder.indexOf(local.keyEvent[convertedKey][1]);
					if (indexID != -1) local.keyEventOrder.splice(indexID, 1);
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
	
	localContainer.getProfileManager = function(config) {
		var local = this.easy.base.newObject(this.easy.base.orderedObject());
		this.easy.base.newObject(config, local);
		
		local.update = function(newKeyList) {
			var remainingKeys = newKeyList;
			for (var profileIndex in this.objectNames) {
				var profile = this.objects[this.objectNames[profileIndex]];
				if (remainingKeys) remainingKeys = profile.update(remainingKeys);
				else break;
			}
		};
		
		return local;
	};
	
	localContainer.profile = function(config) {
		var local = {
			userKeyMapping: {}, // Not used, make it work again. There will only be one global keyMapping.
			controlContext: null
		};
		this.easy.base.newObject(this.easy.base.orderedObject(), local);
		this.easy.base.newObject(config, local);
		local.addObject = local.add;
		
		local.add = function(objectName, object) {
			if (object.inputContext) this.addObject(objectName, object);
			else return null; // or print something :o
		};
		
		local.update = function(input) {
			
			var remainingKeys = input;
			if (this.controlContext) var remainingKeys = this.controlContext(remainingKeys);
			
			for (var objectIndex in this.objectNames) {
				var object = this.objects[this.objectNames[objectIndex]];
				if (remainingKeys) remainingKeys = object.inputContext(remainingKeys);
				else break;
			}
			return input;
		}
		
		return local;
	};
	
	return localContainer;
};
