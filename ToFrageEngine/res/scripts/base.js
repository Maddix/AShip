function Base() {
	var localContainer = {
		version: "1"
	};

	// Only works with objects. Set overwrite to true to only copy undefined keys.
	localContainer.extend = function(piece, object, overwrite) {
		object = object ? object : {};
		if (piece) for (var item in piece) if (!object[item] || !overwrite) object[item] = piece[item];
		return object;
	}

	localContainer.deepCopy = function(item) {
		var itemProto = Object.prototype.toString.call(item);
		var newItem = item;
		var getItem = function(child) { return localContainer.deepCopy(child); };
		if (itemProto === Object.prototype.toString.call([])) {
			newItem = [];
			for (var itemIndex=0, len=item.length; itemIndex < len; itemIndex++) newItem.push(getItem(item[itemIndex]));
		}
		if (itemProto === Object.prototype.toString.call({})) {
			newItem = {};
			for (var itemIndex in item) newItem[itemIndex] = getItem(item[itemIndex])
				}
		return newItem;
	};


	// Should I add hasObject, getObjectNames functions?
	// Should I rename the object theme to be more general?
	// If lite is true then only include add and remove functions in the returned object.
	localContainer.orderedObject = function(config, lite) {
		var local = {
			objects: {},
			objectNames: [],
			// validate is a function that takes a object and returns a bool depending if the object has what you want.
			validate: function(object) {
				return true;
			}
		};
		this.extend(config, local);

		local.add = function(objectName, object) {
			if (this.validate && this.validate(object)) {
				this.objects[objectName] = object;
				this.objectNames.push(objectName);
				return true;
			}
		};

		local.remove = function(objectName) {
			var index = this.objectNames.indexOf(objectName);
			if (index != -1) {
				var object = this.objects[objectName];
				delete this.objects[objectName];
				this.objectNames.splice(index, 1);
				return object;
			}
		};

		if (!lite) {
			// Leave newIndex blank if you want to move the object to the end
			local.changePosition = function(objectName, newIndex) {
				var index = this.objectNames.indexOf(objectName);
				if (index != -1) {
					this.objectNames.splice(index, 1);
					if (newIndex >= 0 && newIndex < this.objectNames.length) {
						this.objectNames.splice(newIndex, 0, objectName);
					} else {
						this.objectNames.push(objectName);
					}
					return true;
				}
			};

			// 'func' is a function that takes a object and its name. 'objectNames' is a list of strings. Not required.
			// 'objects' is a list of objects. Not required.
			local.iterateOverObjects = function(func, objectNames, objects) {
				objectNames = objectNames || this.objectNames;
				objects = objects || this.objects;
				for (var nameIndex=0; nameIndex < objectNames.length; nameIndex++) {
					// Might not be completely clear. If you return true then we break. Return false to continue.
					// Should I pull 'objectNames[nameIndex]' into a var?
					if (func(objects[objectNames[nameIndex]], objectNames[nameIndex])) break;
				}
			}
		}

		return local;
	};

	localContainer.getEventController = function() {
		var local = {
			newEvents: [],
			events: [],
			validate: function(object) {
				if (object.updateEvents) return true;
			}
		};
		this.extend(this.orderedObject(), local, true);

		local.updateLogic = function() {
			this.events = this.newEvents;
			this.newEvents = [];

			this.iterateOverObjects(function(object) {
				var newEvent = object.updateEvents(local.events);
				if (newEvent) local.newEvents.push(newEvent);
			});
		};

		return local;
	};

	localContainer.manageEvents = function(config) {
		var local = this.extend(config, local);

		local.createEvent = function(title, message) {
			return {title: title, message: message};
		};

		local.searchEvents = function(searchFor, events) {
			var matchingEvents = [];
			for (var eventIndex=0; eventIndex < events.length; eventIndex++) {
				var event = events[eventIndex];
				if (event.title == searchFor) {
					matchingEvents.push(event);
				};
			}
			return matchingEvents;
		};

		local.iterateOverEvents = function(events, func) {
			for (var eventIndex=0; eventIndex < events.length; eventIndex++) {
				if (func(events[eventIndex])) break;
			}
		};

		return local;
	}

	localContainer.loadImages = function(loadObject, callWhenComplete, folder) {
		folder = folder ? folder : "";
		var imageObjects = {};
		var loadCount = 0;
		var loaded = 0;

		function loadedCallback() {
			loaded++;
			if (loaded == loadCount) {
				callWhenComplete(imageObjects);
			}
		};

		for (var imageName in loadObject) {
			loadCount++;
			var image = new Image();
			image.src = folder + loadObject[imageName];
			image.onload = function() { loadedCallback(); }
			imageObjects[imageName] = image;
		}
	};

	localContainer.getLogicController = function(config) {
		var local = {
			validate: function(object) {
				if (object.updateLogic) return true;
			}
		};
		local = this.extend(this.orderedObject(config), local, true);

		local.update = function(frame) {
			this.iterateOverObjects(function(object) {
				object.updateLogic(frame);
			});
		};

		return local;
	}

	// TODO: Start here
	localContainer.atomPhysics = {
		shape: 2,
		size: 10,
		density: 2,
		mass: 0, // size*density, How this differs from inertia, I'm not sure
		inertia: 20, // Shape*density ? (*shape?)
		velocity: [0, 0],
		angularVelocity: 0,
		calcMass: function(scale) {
			this.mass = this.size*this.density;
			if (scale) this.mass = this.mass*scale;
		},
		calcInertia: function(scale) {
			if (!this.mass) {this.calcMass(scale);}
			this.inertia = this.mass*this.shape
			if (scale) this.inertia = this.inertia*scale;
		}
	};

	localContainer.loop = function(config) {
		var local = {
			fps: 60,
			func: undefined,
			elapsedTime: 0,
			lastTime: Date.now(), // used to be 'new Date().getTime();'
			running: false,
			tick: 0, // keeps track of the time since the loop was started in milliseconds (Note, modifier modifies this >:D)
			lastTickTime: Date.now(),
			modifier: 1, // simulation speed, 1 is normal, 0 is paused, 2 is 2x time normal speed.
			pausedModifier: 0, // for keeping track of what the modifier was before pausing
			useRAF:true, // Normally slower than setTimeout, though smoother
			rAF: (function(){ // requestAnimationFrame
				return window.requestAnimationFrame
				|| window.webkitRequestAnimationFrame
				|| window.mozRequestAnimationFrame
				|| window.oRequestAnimationFrame
				|| window.msRequestAnimationFrame;}()),
			requestFunction: undefined
		};
		this.extend(config, local);
		local.fps = 1000/local.fps;

		local.getCallbackFunction = function() {
			this.requestFunction = function(callback) {
				setTimeout(callback, this.fps);
			};
			if (this.useRAF && this.rAF) {
				this.requestFunction = this.rAF;
			}

		}; // Calling the function right after creating it (func{}();) will set the 'this' to the window
		local.getCallbackFunction(); // Calling the function from 'local' insures that 'this' will be the window // what? don't I mean will be the 'local' object?

		local.togglePause = function() {
			this.pausedModifier = this.modifier;
			if (this.modifier > 0) {
				this.modifier = 0;
			} else {
				this.modifier = this.pausedModifier;
			}
		};

		local.start = function() {
			this.running = true;
			this.update();
		};

		local.stop = function() {
			this.running = false;
		};

		local.update = function() {
			if (this.running) {

				var currentTime = Date.now();
				var timeDifference = currentTime - this.lastTime;
				this.lastTime = currentTime;
				this.elapsedTime += timeDifference;
				this.tick += timeDifference;

				if (currentTime - this.lastTickTime >= 1000) { // Once per second
					this.lastTickTime = currentTime;
				}

				if (this.elapsedTime >= this.fps) {
					var frame = {
						rate: parseFloat((1000/this.elapsedTime).toFixed(1)),
						// Remove this?
						updateTime: this.elapsedTime*this.modifier, // Should I tie this in with this.modifier?
						delta: (this.elapsedTime/1000)*this.modifier,
						time: this.tick*this.modifier
					};

					this.elapsedTime = 0;
					this.func(frame);
				}

				var that = this;
				var requestFunction = this.requestFunction;
				requestFunction(function(){
					that.update();
				});
			}
		};

		local.runRequestFunction = function(callback) {
			var temp = this.requestFunction;
			temp(callback);
		};

		return local;
	};

	return localContainer;
};
