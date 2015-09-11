// /////////////
// Window system

function WindowLib(easyFrame) {
	var localContainer = {
		version:"1.0",
		easy: easyFrame
	};


	localContainer.container = function(config) {
		var local = {
			pos: [0, 0],
			ratio: [0, 0],
			arrangePos: [50, 50], // Position self in the center of parent container
			//arrangeRatio: [50 50], // Fill half of the parent container
			events: [], // [{type:"", target:"", data:{}}, ..]
			handleEvent: function(event) {

			},
			validate: function(object) {
				return true;
			}
		};
		this.easy.Base.extend(this.easy.Base.orderedObject(), local, true);
		this.easy.Base.extend(config, local);

		local.setup = function(context) {
			var this.context = context
			this.iterateOverObjects(function(object) {
				object.setup(context);
			});
		};

		local.updateLogic = function(frame, positionData) {
			// Arrange self
			this.pos = [
				positionData.pos[0] + (positionData.pos[0] * (this.arrangePos[0] / 100)),
				positionData.pos[1] + (positionData.pos[1] * (this.arrangePos[1] / 100))
			]

			// Arrange children
			this.iterateOverObjects(function(object) {
				object.updateLogic(frame, {
					pos: local.pos
				});
			});
		};

		local.eventContext = function(events) {
			var newEvents = [];
			this.iterateOverObjects(function(object) {
				object.eventContext(events).forEach(function(item) {
					newEvents.push(item);
				});
			});
		};

		local.processEvents = function() {
			for (var eventIndex=0; eventIndex < this.events.length; eventIndex++) {
				this.handleEvent(this.events[eventIndex]);
			}
			this.events = [];
		};

		local.inputContext = function(input) {


		};

		return local;
	};



	return localContainer;
};
