// Lisp Document Parser

//ldp Acts like a namespace.
function Base() {
	//ldp.main
	var localContainer = {
		version: "1"
	};

	//ldp.p object !object !boolean
	//ldp.r object
	/*ldp Copies keys and values from the first object to the second overwritting
		items in the second in the process. Set overwrite to true to keep the first
		object from overwritting defined keys in the second object.

		It only works with objects and does not make a deep copy.
	*/
	localContainer.extend = function(piece, object, overwrite) {
		object = object ? object : {};
		if (piece) for (var item in piece) if (!object[item] || !overwrite) object[item] = piece[item];
		return object;
	}

	//ldp.p list?object
	//ldp.r list?object
	//ldp Deep copies a object or a list.
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

	//ldp.p !object !boolean
	//ldp.r object
	/*ldp
		Should I add hasObject, getObjectNames functions?
		Should I rename the object theme to be more general?
		If lite is true then only include add and remove functions in the returned object.
	*/
	localContainer.orderedObject = function(config, lite) {
		//ldp.mainReturn
		var local = {
			objects: {},
			objectNames: [],
			//ldp validate is a function that takes a object and returns a bool depending if the object has what you want.
			validate: function(object) {
				return true;
			}
		};
		//ldp.e config
		this.extend(config, local);

		//ldp.p string item
		//ldp.r true if item was added, undefined otherwise.
		//ldp Takes a name and item and stores it if the item has pass validation and then returns true.
 		local.add = function(objectName, object) {
			if (this.validate && this.validate(object)) {
				this.objects[objectName] = object;
				this.objectNames.push(objectName);
				return true;
			}
		};

		//ldp.p string
		//ldp.r item if found, false otherwise.
		//ldp Returns the object connected with given key.
		local.get = function(objectName) {
			if (objectName in this.objects) {
				return this.objects[objectName];
			}
		};

		//ldp.p string
		//ldp.r item if found, undefined otherwise.
		//ldp Removes a item matching the given name and returns it.
		local.remove = function(objectName) {
			if (objectName in this.objects) {
				var object = this.objects[objectName];
				delete this.objects[objectName];
				this.objectNames.splice(this.objectNames.indexOf(objectName), 1);
				return object;
			}
		};

		if (!lite) {
			//ldp.p string !number
			//ldp.r true if items position was changed, undefined otherwise.
			/*ldp Changes the position of a item with the given name. Leave newIndex blank if you
				want to move the object to the end.
			*/
			local.changePosition = function(objectName, newIndex) {
				if (objectName in this.objects) {
					this.objectNames.splice(this.objectNames.indexOf(objectName), 1);
					if (newIndex >= 0 && newIndex < this.objectNames.length) this.objectNames.splice(newIndex, 0, objectName);
					else this.objectNames.push(objectName);
					return true;
				}
			};

			// Should this be here or should it be a general standalone function?
			// 'func' is a function that takes a object and its name. 'objectNames' is a list of strings. Not required.
			// 'objects' is a list of objects. Not required.
			//ldp.p function !list<string ..> !object<string, item ..>
			/*ldp Iterates over this.objects and repeatedly calls func with each item and
				name. If the function returns true then break, if it returns false then
				continue (skip to the next object). If you pass a list of keys and a object
				it will iterate other that instead.
			*/
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

	//ldp.p object function !string
	//ldp Loads images from 'loadObject' and calls 'callWhenComplete' with the loaded images. 'folder' is prepended to each image path.
	localContainer.loadImages = function(loadObject, callWhenComplete, folder) {
		folder = folder || "";
		var imageObjects = {},
			loadCount = 0,
			loaded = 0;

		function loadedCallback() {
			if (++loaded == loadCount) callWhenComplete(imageObjects);
		};

		for (var imageName in loadObject) {
			loadCount++;
			var image = new Image();
			image.src = folder + loadObject[imageName];
			image.onload = function() { loadedCallback(); }
			imageObjects[imageName] = image;
		}
	};


	//ldp.p !object
	//ldp.r object
	//ldp Manages objects and calls updateLogic on added objects when 'update()' is called.
	localContainer.getLogicController = function(config) {
		//ldp.main
		var local = {
			validate: function(object) {
				if (object.updateLogic) return true;
			}
		};
		//ldp.e
		local = this.extend(this.orderedObject(config), local, true);

		//ldp.p !object
		//ldp.r undefined
		//ldp Calls updateLogic() on each object and passes a frame object.
		local.update = function(frame) {
			this.iterateOverObjects(function(object) {
				object.updateLogic(frame);
			});
		};

		return local;
	}

	// TODO: Start here
	//ldp Really old, was used with the ship physics stuff. Ignore for now.
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

	//ldp.p !object
	//ldp.r object
	//ldp This is a loop that will call 'func' passing a new 'frame object' each x amount of ms.
	localContainer.loop = function(config) {
		//ldp.main
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
		//ldp.e
		this.extend(config, local);

		//ldp Checks that the browser can use requestAnimationFrame. Defaults to setTimeout otherwise.
		local.getCallbackFunction = function() {
			this.requestFunction = function(callback) {
				setTimeout(callback, this.fps);
			};
			if (this.useRAF && this.rAF) this.requestFunction = this.rAF;

		}; // Calling the function right after creating it (func{}();) will set the 'this' to the window
		local.getCallbackFunction(); // Calling the function from 'local' insures that 'this' will be the window // what? don't I mean will be the 'local' object?

		//ldp Toggles 'this.modifier' from its current value to 0.
		local.togglePause = function() {
			this.pausedModifier = this.modifier;
			if (this.modifier > 0) this.modifier = 0;
			else this.modifier = this.pausedModifier;
		};

		//ldp.p number
		//ldp.r undefined
		//ldp Set the FPS
		local.setFPS = function(newFps) {
			this.fps = 1000/newFps;
		};

		// Called for free on creation.
		local.setFPS(local.fps);

		//ldp Starts the loop
		local.start = function() {
			this.running = true;
			this.update();
		};

		//ldp Stops the loop
		local.stop = function() {
			this.running = false;
		};

		//ldp Handles keeping track of time and creating the 'frame object'. Don't manually call this.
		local.update = function() {
			if (this.running) {

				var currentTime = Date.now(),
					timeDifference = currentTime - this.lastTime;
				this.lastTime = currentTime;
				this.elapsedTime += timeDifference;
				this.tick += timeDifference;

				if (currentTime - this.lastTickTime >= 1000) { // Once per second
					this.lastTickTime = currentTime;
				}

				if (this.elapsedTime >= this.fps) {
					//ldp This object is created each frame and passed to 'this.func'.
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

				var that = this,
					requestFunction = this.requestFunction;
				requestFunction(function(){
					that.update();
				});
			}
		};

		// Don't call this. Can't remember what this does unfortunately. It's important though.
		local.runRequestFunction = function(callback) {
			var temp = this.requestFunction;
			temp(callback);
		};

		return local;
	};

	return localContainer;
};
