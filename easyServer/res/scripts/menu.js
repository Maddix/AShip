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
				return localContainer.easy.Math.checkWithinBounds(mousePosition, this.pos, this.ratio, 0);
			}
		};
	};

	localContainer.container = function(config) {
		var local = {
			pos: [0, 0],
			ratio: [0, 0],
			arrangePos: [.5, .5],
			arrangeRatio: [.5, .5],
			context: undefined,
			validate: function(object) {
				if (object.setup
					&& object.arrangePos
					&& object.arrangeRatio) return true;
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

		return local;
	};

	/*
	localContainer.container = function(config) {
		var local = {
			pos: [0, 0],
			ratio: [0, 0],
			arrangePos: [.5, .5], // Position self in the center of parent container
			arrangeRatio: [.5, .5], // Fill half of the parent container
			context: undefined, // Needed to give to objects after setup has been called.
			mouseOver: false,
			inputProfile: localContainer.easy.InputHandler.Profile(),
			validate: function(object) {
				if (object.setup
					&& object.arrangePos
					&& object.arrangeRatio) return true;
			}
		};
		this.easy.Base.extend(this.easy.Base.orderedObject(), local, true);
		this.easy.Base.extend(this.widget(), local, true);
		this.easy.Base.extend(config, local);

		local.setup = function(context) {
			this.context = context;
			this.iterateOverObjects(function(object) {
				object.setup(context);
			});
		};

		local.orderedObject_add = local.add;
		local.add = function(objectName, object, joinInputContext) {
			if (this.orderedObject_add(objectName, object)) {
				if (this.context) object.setup(this.context);
				if (joinInputContext) {
					this.inputProfile.add(objectName, object);
					return true;
				} else this.orderedObject_remove(objectName);
			}
		};

		local.orderedObject_remove = local.remove;
		local.remove = function(objectName) {
			this.inputProfile.remove(objectName);
			return this.orderedObject_remove(objectName);
		};

		local.orderedObject_changePosition = local.changePosition;
		local.changePosition = function(objectName) {
			this.inputProfile.changePosition(objectName);
			return this.orderedObject_changePosition(objectName);
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
			var over = this.isMouseOver(input.mouse["mousePosition"])
			if (over || this.mouseOver) {
				this.mouseOver = over;
				return this.inputProfile.inputContext(input);
			} else {
				return input;
			}
		};

		return local;
	};
	*/

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

		local.inputContext = function(input) {

			if (this.isMouseOver(input.mouse["mousePosition"])) {
				this.color = "pink";

				if (input.keys["LMB"]) {
					console.log("Pressed");
					delete input.keys["LMB"];
				}

				if (input.keys["LMB"] === false) {
					console.log("Released");
					delete input.keys["LMB"];
				}
			} else {
				this.color = "orange";
			}

			return input;
		};

		return local;
	};

	return localContainer;
};
