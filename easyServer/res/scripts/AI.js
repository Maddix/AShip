

function ai(easyFrameBase) {
	var localContainer = {
		easyFrameBase:easyFrameBase
	};
	
	// Warning - setActiveObject will put the object to 1st index, and not the 0th. The 0th being reserved for the MainContext
	localContainer.profile = function(config) {
		var local = {
			userKeyMapping:{}, // {"t":"w"} - overrides the default keyList mapping
			objectNames:[], // Object names
			objects:{}, // {"objectName":object}
			inputController:null,
			keyMouseController:null,
			inputContextGroup:""
		};
		easyFrameBase.newObject(config, local);
		local.keyMouseController.changeKeyMapping(local.userKeyMapping);
		
		local.add = function(objectName, object) {
			this.objectNames.push(objectName);
			this.objects[objectName] = object;
			if (object.inputContext != null) this.addContext(objectName);
		};
		
		local.setActiveObject = function(objectName) {
			var index = this.objectNames.indexOf(objectName);
			if (index != -1) {
				var pulled = this.objectNames.splice(index, 1);
				this.objectNames.splice(0, 0, objectName);
				
				// Move the active object's context to the second item of the group
				this.inputController.changeContextPosition(this.inputContextGroup, objectName + "Context", 1);
			}
		};
		
		local.removeObject = function(objectName) {
			var index = this.objectNames.indexOf(objectName);
			if (index != -1) {
				this.removeContext(objectName);
				delete this.objects[this.objectNames.splice(index, 1)];
			}
		};
		
		// not tested
		local.setMainContext = function(newMainContext) {
			this.removeContext("MainContext"); // remove incase of older one
			this.inputController.addContext(this.inputContextGroup, "MainContext", newMainContext);
			this.inputController.changeContextPosition(this.inputContextGroup, "MainContext", 0);
		};
		
		local.getObjectNames = function() {
			return this.objectNames;
		};
		
		local.addContext = function(objectName) {
			var context = this.objects[objectName].inputContext
			if (context) {
				this.inputController.addContext(this.inputContextGroup, objectName + "Context", context);
			}
		};
		
		local.removeContext = function(objectName) {
			this.inputController.removeContext(this.inputContextGroup, objectName + "Context");
		};
		
		return local;
	};

	return localContainer;
};
