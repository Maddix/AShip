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
			isMouseOver: function(mousePosition) {
				return easy.Math.checkWithinBounds(mousePosition, this.pos, this.ratio, 0);
			}
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
			}
		};
		this.easy.Base.extend(this.easy.Base.orderedObject(), local, true);
		this.easy.Base.extend(this.widget(), local);
		this.easy.Base.extend(config, local);

		local.setup = function(context) {
			this.context = context;
			this.iterateOverObjects(function(object) {
				object.setup(context);
			});
		};

		local.orderedObject_add = local.add;
		local.add = function(objectName, object) {
			if (this.orderedObject_add(objectName, object) && this.context) {
				object.setup(this.context);
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
			this.iterateOverObjects(function(object, name) {
				if (object.isMouseOver(input.mouse["mousePosition"])) {
					local.changePosition(name, 0);
					var used = this.objects[found].inputContext(input);
					if (used) {
						input = used;
						return true; // Break
					}
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

		local.inputContext = function(context) {
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

		local.inputContext = function(context) {
		};

		return local;
	};

	return localContainer;
};
