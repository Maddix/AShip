
function components(easyFrame) {
	var localContainer = {
		version:"1.0",
		easy:easyFrame
	};

	localContainer.ship = function(config) {
		var local = {
			slots: {}, // Slot:{"name":{"object":obj, }, ..}
			inputContext: null,
			imageSmoothing: false
		};
		this.easy.base.newObject(this.engineControl(this.easy.base.getImageResize(this.easy.base.getAtomImage(config))), local);
		this.easy.base.newObject(this.easy.base.atomPhysics, local);
		local.updateImage = local.update;
		
		local.setup = function(context) {
			this.context = context;
			this.calcInertia();
			
			for (var slotName in this.slots) {
				var slot = this.slots[slotName];
				if (slot.object) slot.object.setup(this.context, [slot.offset[0]*this.scale, slot.offset[1]*this.scale]);
			}
			
			// Recalculate engine groups
			this.quedEvents["engine"] = [];
			this.sortEngines();

		};
		
		local.setScale = function(newScale) {
			this.scale = newScale;
			
			for (var slotName in this.slots) {
				var slot = this.slots[slotName];
				if (slot.object) this.addObject(slotName, slot.object);
			}
			
		}
		
		local.setupSlots = function() {
			this.sortEngines();
		};
		
		local.addSlot = function(name, offset) {
			this.slots[name] = {offset:offset, object:null};
		};
		
		local.isSlotEmpty = function(name) {
			if (this.slots[name]) return !this.slots[name].object;
		};
		
		local.addObject = function(name, object) {
			if (this.slots[name]) this.slots[name].object = object;
			object.scale = this.scale;
			object.imageSmoothing = this.imageSmoothing;
			if (this.context) {
				object.setup(this.context, [this.slots[name].offset[0]*this.scale, this.slots[name].offset[1]*this.scale]);
				this.setupSlots();
			}
		};
		
		local.removeObject = function(name) {
			var object = undefined;
			if (this.slots[name] && this.slots[name].object != null) {
				object = this.slots[name].object;
				this.slots[name].object = null;
			}
			return object;
		};
		
		local.activate = function(eventType, group) {
			if (this.quedEvents[eventType]) this.quedEvents[eventType].push(group);
		};
		
		local.handleEvents = function(frame) {
			for (var eventType in this.quedEvents) {
				var type = this.quedEvents[eventType]
				if (eventType === "engine") {
					for (var eventIndex=0; eventIndex < type.length; eventIndex++) {
						this.fireThrusters(frame, type[eventIndex]);
					}
					this.quedEvents[eventType] = [];
				}
			}
		};
		
		local.update = function(frame) {
			this.pos[0] += this.velocity[0]*frame.delta;
			this.pos[1] += this.velocity[1]*frame.delta;
			this.rotation += this.angularVelocity*frame.delta;
			this.updateImage();
			
			// Update objects
			for (var slotName in this.slots) {
				var slot = this.slots[slotName];
				if (slot.object) slot.object.update(frame, this);
			}
			
			this.handleEvents(frame);
		};
		
		return local;
	};

	localContainer.engineControl = function(config) {
		var local = {
			engineSorting: {
				"forward":{torque:0, rotation:0}, 
				"strafeRight":{torque:0, rotation:Math.PI/2}, 
				"backward":{torque:0, rotation:Math.PI}, 
				"strafeLeft":{torque:0, rotation:(Math.PI*3)/2},
				"turnRight":{torque:-1},
				"turnLeft":{torque:1}
			},
			engineSortingDefaultAngleOffset: Math.PI/8,
			engineGroups: {},
			quedEvents: {}
		};
		this.easy.base.newObject(config, local);
		
		local.sortEngines = function() {
			for (var movementName in this.engineSorting) {	
				var movement = this.engineSorting[movementName];
				var totalTorque = 0;
				// I should worry about the x and y  ?
				var possibleEngines = [];
				for (var engineName in this.slots) {
					var object = this.slots[engineName].object;
					if (object && object.type === "engine") {
						var engineStats = object.getInfo();
						var add = false;
						
						var angleOffset = movement.angleOffset ? movement.angleOffset : this.engineSortingDefaultAngleOffset;
						var rotationCone = [
							movement.rotation - angleOffset, 
							movement.rotation + angleOffset
						];

						if (rotationCone[0] <= engineStats.rotation && engineStats.rotation <= rotationCone[1]) {
							add = true;
						} 
						
						// if engine torque is matching movement torque then add
						if (movement.torque > 0) {
							if (engineStats.torque != 0 && engineStats.torque <= movement.torque) {
								add = true;
							}
						} else if (movement.torque < 0) {
							if (engineStats.torque != 0 && engineStats.torque >= movement.torque) {
								add = true;
							}
						}
						
						// Add the engine
						if (add) {
							totalTorque += engineStats.torque;
							possibleEngines.push(object);
						};	
					}
				}
				this.engineGroups[movementName] = possibleEngines;
			}
		};
		
		local.fireThrusters = function(frame, group) {
			for (var engineIndex in this.engineGroups[group]) {
				var engine = this.engineGroups[group][engineIndex];
				if (engine && !engine.activated) {
					var engineOutput = engine.activate(this.rotation, this.inertia, this.mass);
					engine.activated = true;
					this.angularVelocity += engineOutput.angularVelocity*frame.delta;
					this.velocity[0] += engineOutput.velocity[0];
					this.velocity[1] += engineOutput.velocity[1];
				}
			}
		};
		
		return local;
	};
	
	localContainer.engineNew = function(config) {
		var local = {
			type: "engine",
			localOffset: [0, 0],
			power: 1,
			localRotation: 0,
			spawnParticle: false,
			activated: false
		};
		this.easy.base.newObject(this.easy.base.getImageResize(this.easy.base.getAtomImage(config)), local);
		local.updateImage = local.update;
		
		local.setup = function(context, offset) {
			this.context = context;
			this.localOffset = offset;
			// This makes sense, yet it feels off..
			//this.power = this.power*this.scale;
			
			this.particleController = localContainer.easy.particles.getRectangleParticleSprayer({
				startColor: {red:255, green:239, blue:66, alpha:2.5},
				endColor: {red:180, green:0, blue:0, alpha:0},
				ratio: [4*this.scale, 4*this.scale],
				active: false,
				pos: [this.pos[0], this.pos[1]],
				spawnCone: Math.PI/4,
				speedRatio: [50*this.scale, 80*this.scale],
				lifeRatio: [50, 100],
				life: .3,
				spawnRate: 50
			});
			DATA.layerController.getLayer("particleLayer").add(this.particleController);
		};
		
		//local.setScale = function(newScale) {
			//this.power = this.power*this.scale;
		//};
		
		local.getInfo = function() {
			var velocity = getVelocityToAngle(this.power, this.localRotation);
			var torque = crossProduct([this.localOffset[0]/this.scale, this.localOffset[1]/this.scale], velocity);
			return {"torque": torque, "power": this.power, "rotation":this.localRotation};
		};
		
		local.toggleParticles = function() {
			if (this.particleController.active) this.particleController.active = false;
			else this.particleController.active = true;
		};
		
		local.activate = function(parentRotation, parentInertia, parentMass, power) {
			var power = power ? power : this.power;
			var velocity = getVelocityToAngle(power, parentRotation + this.localRotation);
			velocity = [velocity[0]/parentMass, velocity[1]/parentMass];
			var staticForce = getVelocityToAngle(power, this.localRotation);
			var newAngularVelocity = angularVelocity([this.localOffset[0]/this.scale, this.localOffset[1]/this.scale], staticForce, parentInertia);
			this.spawnParticle = true;
			return {"angularVelocity":newAngularVelocity, "velocity":velocity};
		};
		
		local.update = function(frame, parent) {
			var rotatedPos = rotatePoint(this.localOffset, parent.rotation);
			this.pos[0] = parent.pos[0] + rotatedPos[0];
			this.pos[1] = parent.pos[1] + rotatedPos[1];
			this.rotation = parent.rotation + this.localRotation;
			
			if (this.activated) this.activated = false;
			
			this.particleController.pos = this.pos;
			this.particleController.spawnRotation = this.rotation + Math.PI;
			if (this.spawnParticle) {
				this.particleController.spawnParticles(frame);
				this.spawnParticle = false;
			}
			this.particleController.update(frame);
			this.updateImage();
		};
		
		return local;
	};
	
	return localContainer;
};