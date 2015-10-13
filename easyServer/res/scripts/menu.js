// /////////////
// Window system

function WindowLib(easyFrame) {
	var localContainer = {
		version:"1.0",
		easy: easyFrame
	};

	localContainer.widget = function() {
		return {
			arrangePos: [0, 0], // 0 to 1
			arrangeRatio: [1, 1], // 0 to 1
			active: false,
			isMouseOver: function(mousePosition) {
				return localContainer.easy.Math.checkWithinBounds(mousePosition, this.pos, this.ratio, 0);
			},
			mouserOver: function() {
				this.active = true;
			},
			//mouseOff: function() {
			//	this.active = false;
			//}
		};
	};

	localContainer.container = function(config) {
		var local = {
			pos: [0, 0],
			ratio: [0, 0],
			arrangePos: [.5, .5], // Position self in the center of parent container
			arrangeRatio: [.5, .5], // Fill half of the parent container
			context: undefined, // Needed to give to objects after setup has been called.
			validate: function(object) {
				if (object.setup
					&& object.arrangePos
					&& object.arrangeRatio
					&& object.inputContext) return true;
			},
			reversedObjectNames: []
		};
		this.easy.Base.extend(this.easy.Base.orderedObject(), local, true);
		this.easy.Base.extend(config, local);

		local.setup = function(context) {
			this.context = context;
			this.iterateOverObjects(function(object) {
				object.setup(context);
			});
		};

		local.isMouseOver = function(mousePosition) {
			return localContainer.easy.Math.checkWithinBounds(mousePosition, this.pos, this.ratio, 0);
		},

		local.orderedObject_add = local.add;
		local.add = function(objectName, object) {
			if (this.orderedObject_add(objectName, object)) {
				if (this.context) object.setup(this.context);
				this.reversedObjectNames.splice(0, 0, objectName);
			}
		};

		local.reverseIterateOverObjects = function(func) {
			for (var nameIndex=this.reversedObjectNames.length-1; 0 <= nameIndex; nameIndex--) {
				// Might not be completely clear. If you return true then we break. Return false to continue.
				if (func(this.objects[this.reversedObjectNames[nameIndex]], this.reversedObjectNames[nameIndex])) break;
			}
		};

		local.updateLogic = function(frame) {
			// Arrange children - In this case arrange free
			this.iterateOverObjects(function(object) {
				object.pos = [
					local.pos[0] + (local.ratio[0] * object.arrangePos[0]),
					local.pos[1] + (local.ratio[1] * object.arrangePos[1])
				];
				object.ratio = [
					local.ratio[0] * object.arrangeRatio[0],
					local.ratio[1] * object.arrangeRatio[1],
				];
				object.updateLogic(frame);
			});
		};

		local.updateGraphics = function() {
			this.iterateOverObjects(function(object) {
				object.updateGraphics();
			});
		};

		local.eventContext = function(events) {

		};

		local.inputContext = function(input) {
			this.reverseIterateOverObjects(function(object, name) {
				if (object.isMouseOver(input.mouse["mousePosition"])) {
					//local.changePosition(name);
					var used = object.inputContext(input);
					if (used) {
						//console.log(name);
						if (!object.active) object.active = true;
						input = used;
						return true; // Break
					}
				}
				if (object.active) {
					object.active = false;
					console.log("This!", name);
					object.mouseOff();
				}
			});
			return input;
		};

		return local;
	};

	localContainer.square = function(config) {
		var local = this.easy.Base.extend(this.widget());
		this.easy.Base.extend(this.easy.Graphics.getRectangle(config, true), local);
		local.updateLogic = function(frame) {
			//console.log(this.arrangePos);
		};

		local.inputContext = function(input) {
		};

		return local;
	};

	localContainer.text = function(config, fontWidth) {
		var local = this.easy.Base.extend(this.widget());
		this.easy.Base.extend(this.easy.Graphics.getText(config, fontWidth), local);

		local.setup = function(context) {
			this.context = context;
			this.getTextWidth();
		};

		local.updateLogic = function(frame) {
			//console.log(this.arrangePos);
		};

		local.inputContext = function(input) {

		};

		return local;
	};

	localContainer.touchSquare = function(config) {
		var local = {
		};
		this.easy.Base.extend(this.square(config), local);

		local.mouseOff = function() {
			this.color = "orange";
			console.log("PRESSED!");
		};

		local.inputContext = function(input) {
			if (this.active) this.color = "pink";
			console.log("input!");
			if (input.keys["LMB"]) {
				console.log("Pressed");
				delete input.keys["LMB"];
			}

			if (input.keys["LMB"] === false) {
				console.log("Released");
				delete input.keys["LMB"];
			}

			return input;
		}

		return local;
	};

	return localContainer;
};
