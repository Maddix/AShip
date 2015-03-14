
function components(easyFrame) {
	var localContainer = {
		version:"1.0",
		easy:easyFrame
	};

	localContainer.ship = function(config) {
		var local = {
			slots: {}, // Slot:{"name":{"object":obj, }, ..}
			software: {},
			inputContext: null
		};
		this.easy.base.newObject(this.easy.base.getAtomImage(config), local);
		this.easy.base.newObject(this.easy.base.atomPhysics, local);
		local.updateImage = local.update;
		
		local.setup = function(context) {
			this.context = context;
			this.calcInertia(2);
			
			for (var slotName in this.slots) {
				var slot = this.slots[slotName];
				if (slot.object) slot.object.setup(this.context, slot.offset)
			}
			
			for (var softwareName in this.software) {
				var program = this.software[softwareName];
				if (program.object) program.object.setup(this);
			}
		};
		
		local.addSlot = function(name, offset) {
			this.slots[name] = {offset:offset, object:null};
		};
		
		local.isSlotEmpty = function(name) {
			if (this.slots[name]) return !this.slots[name].object;
		};
		
		local.addSoftwareSlot = function(name) {
			this.software[name] = {object:null};
		};
		
		local.isSoftwareSlotEmpty = function(name) {
			if (this.software[name]) return !this.software[name].object;
		};
		
		local.addObject = function(name, object) {
			this.slots[name].object = object;
			object.setup(this.context, this.slots[name].offset);
		};
		
		local.removeObject = function(name) {
			var object = undefined;
			if (this.slots[name] && this.slots[name].object != null) {
				object = this.slots[name].object;
				this.slots[name].object = null;
			}
			return object;
		};
		
		local.addSoftware = function(name, object) {
			this.software[name].object = object;
			object.setup(this);
		};
		
		local.update = function(frame) {
			//console.log(this.velocity[0]*frame.delta);
			this.pos[0] += this.velocity[0]*frame.delta;
			this.pos[1] += this.velocity[1]*frame.delta;
			this.rotation += this.angularVelocity*frame.delta;
			this.updateImage();
			
			// Update objects
			for (var slotName in this.slots) {
				var slot = this.slots[slotName];
				if (slot.object) slot.object.update(frame, this);
			}
			
			// Update software
			for (var softName in this.software) {
				var program = this.software[softName];
				program.object.update(frame, this);
			}
			
		};
		
		return local;
	};

	localContainer.engineComputer = function(config) {
		var local = {
			type:"computer",
			engineSorting: {
				"forward":{torque:0, rotation:0}, 
				"strafeRight":{torque:0, rotation:Math.PI/2}, 
				"backward":{torque:0, rotation:Math.PI}, 
				"strafeLeft":{torque:0, rotation:(Math.PI*3)/2},
				"turnRight":{torque:-1},
				"turnLeft":{torque:1}
			},
			engineGroups: {},
			quedEvents: [],
			defaultAngleOffset: Math.PI/8
		};
		
		local.setup = function(parent) {
			this.setupEngines(parent.slots);
		};
		
		local.setupEngines = function(parentEngines) {
			for (var movementName in this.engineSorting) {		
				var movement = this.engineSorting[movementName];
				var totalTorque = 0;
				// I should worry about the x and y  ?
				var possibleEngines = [];
				for (var engineName in parentEngines) {
					
					var engine = parentEngines[engineName].object;
					if (engine) {
						var engineStats = engine.getInfo();
						var add = false;
						
						var angleOffset = movement.angleOffset ? movement.angleOffset : this.defaultAngleOffset
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
							possibleEngines.push(engine);
						};	
					}
				}
				//console.log("--- '" + movementName + "' Torque: " + totalTorque + " TotalEngines: " + possibleEngines.length + " ---");
				this.engineGroups[movementName] = possibleEngines;
			}
		};
		
		local.fireThrusters = function(engineGroup, frame, parent) {
			for (var engineIndex in this.engineGroups[engineGroup]) {
				var engine = this.engineGroups[engineGroup][engineIndex];
				if (!engine.activated) {
					var engineOutput = this.engineGroups[engineGroup][engineIndex].activate(parent.rotation, parent.inertia, parent.mass);
					engine.activated = true;
					parent.angularVelocity += engineOutput.angularVelocity*frame.delta;
					parent.velocity[0] += engineOutput.velocity[0];
					parent.velocity[1] += engineOutput.velocity[1];
				}
			}
		}
		
		local.activate = function(engineGroup, parent) {
			this.quedEvents.push([engineGroup, parent]);
		};
		
		local.update = function(frame, parent) {
			
			for (var eventIndex in this.quedEvents) {
				var action = this.quedEvents[eventIndex];
				this.fireThrusters(action[0], frame, action[1]);
			}
			this.quedEvents = [];
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
		this.easy.base.newObject(this.easy.base.getAtomImage(config), local);
		local.updateImage = local.update;
		
		local.setup = function(context, offset) {
			this.context = context;
			this.localOffset = offset;
			
			/*
			this.particleController = localContainer.easy.particles.getParticleController({
				particle:this.particle,
				pos:[this.pos[0], this.pos[1]],
				spawnAngle: Math.PI/4,
				spawnRate:50,
				spawnRotation:this.rotation,
				speedRatio:[20, 90],
				lifeRatio:[50, 100]
			});
			this.particleControllerLayer.add(this.particleController);
			*/
			
			this.particleController = localContainer.easy.particles.getRectangleParticleSprayer({
				startColor: {red:255, green:239, blue:66, alpha:2.5},
				endColor: {red:180, green:0, blue:0, alpha:0},
				ratio: [4, 4],
				active: false,
				pos: [this.pos[0], this.pos[1]],
				spawnCone: Math.PI/4,
				speedRatio: [50, 80],
				lifeRatio: [50, 100],
				life: .5,
				spawnRate: 50
			});
			DATA.layerController.getLayer("particleLayer").add(this.particleController);
		};
		
		local.getInfo = function() {
			var velocity = getVelocityToAngle(this.power, this.localRotation);
			var torque = crossProduct(this.localOffset, velocity);
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
			var newAngularVelocity = angularVelocity(this.localOffset, staticForce, parentInertia);
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
			//this.particleController.parentVelocity = parent.velocity;
			if (this.spawnParticle) {
				this.particleController.spawnParticles(frame);
				this.spawnParticle = false;
			}
			this.particleController.update(frame);
			this.updateImage();
		};
		
		return local;
	};
	
	
	/* #Pydoc
		ship
		Is a ship that can have modules
	*/
	localContainer.object = function(config) {
		var local = {
			inputContext: null,
			velocity:[0, 0],
			angularVelocity:0,
			slots: {},
			mass: 1
		};
		this.easy.base.newObject(this.easy.base.getAtomImage(config), local);
		local.updateImage = local.update;
		
		local.setup = function(context) {
			this.context = context;
			for (var slotName in this.slots) {
				this.slots[slotName].setup(context);
			}
		};
		
		local.addSlot = function(slotName, slot) {
			if (this.context) slot.setup(context);
			this.slots[slotName] = slot;
		};
		
		local.giveCommand = function(command) {
			for (var slotName in this.slots) {
				this.slots[slotName].receiveCommand(command, this);
			}
		};
		
		local.update = function(frame) {
			this.pos[0] += this.velocity[0]*frame.delta;
			this.pos[1] += this.velocity[1]*frame.delta;
			this.rotation += this.angularVelocity*frame.delta;
			this.updateImage();
			
			for (var slotName in this.slots) {
				this.slots[slotName].update(frame, this);
			}
		};
		return local;
	};
	
	localContainer.engine = function(config) {
		var local = {
			posOffset:[0, 0],
			commandContext:null,
			localRotation: 0,
			thrustRotation: 1,
			power: 1,
			action: null
		};
		this.easy.base.newObject(this.easy.base.getAtomImage(config), local);
		local.updateImage = local.update;
		
		local.receiveCommand = function(command, parent) {
			this.commandContext(command, parent);
		}
		
		if (!local.commandContext) {
			local.commandContext = function(command, parent) {
				
				if (command["thrust"]) {
					
					local.action = function(frame, parent) {
						var force = getVelocityToAngle(local.power, parent.rotation + local.localRotation);
						var staticForce = getVelocityToAngle(local.power, local.localRotation);
						var torque = crossProduct(local.posOffset, staticForce);
						var acceleration = [force[0]/parent.mass, force[1]/parent.mass];
						parent.velocity[0] += acceleration[0];
						parent.velocity[1] += acceleration[1];
						parent.angularVelocity += (torque/parent.inertia)*frame.delta;
					};
				}	
			}
		}
		
		local.update = function(frame, parent) {
			var rotatedPos = rotatePoint(this.posOffset, parent.rotation);
			this.pos[0] = parent.pos[0] + rotatedPos[0];
			this.pos[1] = parent.pos[1] + rotatedPos[1];
			this.rotation = parent.rotation + this.localRotation;
			if (this.action) {
				this.action(frame, parent);
				this.action = null;
			}
			this.updateImage();
		}
		
		return local;
	}
	
	return localContainer;
};