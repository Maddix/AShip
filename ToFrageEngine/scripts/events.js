function Events(toFrage) {
	var localContainer = {
		version: "1",
		frage: toFrage
	};

	localContainer.actionEvent = function(config) {
		var local = {
			triggers: [],
			returnOnSuccess: [],
			triggered: false
		};
		this.frage.Base.extend(this.frage.Base.orderedObject(config), local);

		local.updateEvent = function(input) {
			if (!this.triggered) var passToCallback = {};
			for (var index=0; index < this.triggers.length; index++) {
				var trigger = this.triggers[index];
				if (!input[trigger]) {
					this.triggered = false;
					return input;
				} else if (!this.triggered) {
					passToCallback[trigger] = input[trigger];
				}
			}

			if (!this.triggered) {
				this.triggered = true;

				// Call callbacks.
				this.iterateOverObjects(function(callback) {
					callback(passToCallback);
				});

				// Delete keys
				for (var index=0; index < this.returnOnSuccess.length; index++) {
					delete input[this.returnOnSuccess[index]];
				}
			}

			return input;
		};

		return local;
	};

	localContainer.stateEvent = function(config) {
		var local = {
			triggers: [], // ["shift", "control", "w"] // It will be turned into keycodes - not human readable.
			returnOnSuccess: [] // ["shift", "control"] // Could be used for evil.. (╯°□°）╯︵ ┻━┻ Much power, great responsibility. ~ Doge
		};
		this.frage.Base.extend(this.frage.Base.orderedObject(config), local);

		local.updateEvent = function(input) {
			var passToCallback = {};
			// Check if all the required keys are active, bail out otherwise
			for (var index=0; index < this.triggers.length; index++) {
				var trigger = this.triggers[index];
				if (!input[trigger]) return input;
				else passToCallback[trigger] = input[trigger];
			}

			// Call callbacks.
			this.iterateOverObjects(function(callback) {
				callback(passToCallback);
			});

			// Delete keys
			for (var index=0; index < this.returnOnSuccess.length; index++) {
				delete input[this.returnOnSuccess[index]];
			}

			return input;
		};

		return local;
	};

	localContainer.getEventContext = function(config) {
		var local = {
			onHold: false,
			validate: function(object) {
				if (object.updateEvent) return true;
			}
		};
		this.frage.Base.extend(this.frage.Base.orderedObject(), local, true);
		this.frage.Base.extend(config, local);

		local.suspend = function() {
			this.onHold = true;
		};

		local.resume = function(name) {
			this.onHold = false;
		};

		local.state = function() {
			return this.onHold;
		};

		local.update = function(input) {
			if (!this.onHold) {
				var remaining = input;
				this.iterateOverObjects(function(object, name) {
					if (remaining) remaining = object.updateEvent(input);
					else return true;
				});
				return remaining;
			}
			return input;
		};

		return local;
	};

	return localContainer;
};
