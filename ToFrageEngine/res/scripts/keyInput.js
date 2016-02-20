// This uses Jquery 2.0.3 and Jquary-mousewheel(https://github.com/brandonaaron/jquery-mousewheel)
// Note for mousedown/up, event.which ~ 1 for left, 2 for middle, 3 for right

function Input(toFrage) {
	var localContainer = {
		version: "1.0",
		requires: "Jquery 2.0.3+ and Jquery-mousewheel",
		frage:toFrage,
		defaultKeyMap: { // Keep in mind that the key-codes are from the Jquery event.which, need to add in special characters
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
		defaultShiftKeyMap: {
			49: "!", 50:"@", 51:"#", 52:"$", 53:"%", 54:"^",
			55:"&", 56:"*", 57:"(", 58:")", 189:"_", 187:"+",
			219:"{", 221:"}", 220:"|", 186:":", 222:'"', 188:"<",
			190:">", 191:"?", 192:"~"
		}
	};

	//local.createReversedKeyMap = function() {
	//	this.keyMapReversed = {};
	//	for (key in this.keyMapDefault) {
	//		this.keyMapReversed[this.keyMapDefault[key]] = parseInt(key);
	//	}
	//};
	//local.createReversedKeyMap(); // Call it here since we don't have a setup.

	localContainer.getInputManager = function(config) {
		var local = {
			rawInput: {},
			rawInputOrder: []
		};
		this.frage.Base.extend(config, local);

		local.addInput = function(input, value) {
			this.rawInput[input] = value;
			if (this.rawInputOrder.indexOf(input) == -1) this.rawInputOrder.push(input);
		};

		local.removeInput = function(input, value) {
			delete this.rawInput[input];
			var index = this.rawInputOrder.indexOf(input);
			if (index != -1) this.rawInputOrder.splice(index, 1);
		};

		local.getInput = function() {
			return {
				input: localContainer.frage.Base.deepCopy(this.rawInput),
				inputOrder: localContainer.frage.Base.deepCopy(this.rawInputOrder)
			};
		};

		return local;
	};

	localContainer.getListenerManager = function(config) {
		var local = {
			listeners: []
		};
		this.frage.Base.extend(config, local);

		local.addListenerTo = function(element, listenerName, callback) {
			$(element).on(listenerName, callback);
			this.listeners.push(listenerName);
		};

		local.removeListenerFrom = function(element, listenerName) {
			var index = this.listeners.indexOf(listenerName);
			if (index != -1) {
				$(element).off(listenerName);
				this.listeners.splice(index, 1);
				return true;
			}
		};

		local.removeListenersFrom = function(element) {
			for (var index=0; index > this.listeners; index++) {
				this.removeListener(element, this.listeners[index]);
			}
		};

		return local;
	}

	// Note for mousedown/up, event.which ~ 1 for left, 2 for middle, 3 for right
	localContainer.getInput = function(config) {
		var local = {
			keyElement: "body",
			mouseElement: "canvas",
			// Only used for keys
			blacklist: {"Ctrl-R":[17, 82], "F5":[116], "Ctrl-Shift-C":[17, 16, 67]} // {"description":[key, ..], ..}
		};
		this.frage.Base.extend(this.getListenerManager(this.getInputManager(config)), local);

		local.notMatchingBlacklist = function() {
			for (var keyComboName in this.blacklist) {
				var keyCombo = this.blacklist[keyComboName];
				var matchingCombo = true;
				for (var index=0; index < keyCombo.length; index++) {
					if (this.rawInput[keyCombo[index]] == undefined) matchingCombo = false;
				}
				if (matchingCombo) return false;
			}
			return true;
		};

		local.addListeners = function() {
			this.addListenerTo(this.keyElement, "keydown", function(jqueryKeyEvent) {
				local.addInput(jqueryKeyEvent.which, true);
				if (local.notMatchingBlacklist()) return false;
			});

			this.addListenerTo(this.keyElement, "keyup", function(jqueryKeyEvent) {
				local.removeInput(jqueryKeyEvent.which, false);
				return false;
			});

			this.addListenerTo(this.mouseElement, "mousemove", function(jqueryMouseEvent) {
				local.removeInput("mouseMove");
				local.addInput("mouseMove", [
					jqueryMouseEvent.pageX - $(local.mouseElement).offset().left,
					jqueryMouseEvent.pageY - $(local.mouseElement).offset().top
				]);
			});

			// TODO: Is the for-loop too slow?
			if (this.getScrollData) {
				this.addListenerTo(this.mouseElement, "mousewheel", function(jqueryMouseEvent) {
					var delta = [jqueryMouseEvent.deltaX, jqueryMouseEvent.deltaY];
					// normalize the scroll delta
					for (var index=0; index < delta.length; delta++){
						if (delta[index] > 1) delta[index] = 1;
						if (delta[index] < -1) delta[index] = -1;
					}
					local.removeInput("mouseWheel");
					local.addInput("mouseWheel", delta);
					return false; // returning false prevents the default action (page scroll)
				});
			}

			// Note for mousedown/up, event.which ~ 1 for left, 2 for middle, 3 for right
			this.addListenerTo(this.mouseElement, "mousedown", function(jqueryKeyEvent) {
				local.addInput(jqueryKeyEvent.which, true);
				jqueryKeyEvent.stopPropagation();
				jqueryKeyEvent.preventDefault();
			});

			this.addListenerTo(this.mouseElement, "mouseup", function(jqueryKeyEvent) {
				local.removeInput(jqueryKeyEvent.which, false);
				jqueryKeyEvent.stopPropagation();
				jqueryKeyEvent.preventDefault();
			});
		}

		return local;
	};

	return localContainer;
};
