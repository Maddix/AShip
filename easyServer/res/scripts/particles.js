
function particles(easyFrame) {
	var localContainer = {
		version:"1.0",
		easy:easyFrame
	}
	
	// Condense the particle so that we only keep track of data and not functions too, functions are slow..
	localContainer.particle = function() {
		var local = {
			pos: [0, 0],
			alive: true,
			life: 1000,
			remainingLife: 0,
			lifeDec: 60,
			velocity: [0, 0]
		}
		//this.easy.base.newObject(this.easy.base.atom, local);
		
		local.setup = function() {
			this.remainingLife = this.life;
		};
		
		local.update = function(frame) {
			this.remainingLife -= frame.updateTime;

			if (this.remainingLife < 0) {
				this.alive = false;
			} else {
				this.pos[0] += this.velocity[0]*frame.delta;
				this.pos[1] += this.velocity[1]*frame.delta;
			}
		};
		
		return local;
	};
	
	

	
	localContainer.getRectParticle = function(config) {
		var local = {
			ratio:[8, 8],
			borderStyle:"miter",
			borderWidth: 0,
			borderColor: "white",
			//colorObj: {red:92, green:42, blue:141, alpha:1.5},
			//colorObj: {red:0, green:179, blue:255, alpha:2.5},
			//colorObj: {red:255, green:239, blue:66, alpha:2.5},
			colorObj: {red:255, green:239, blue:66, alpha:2.5},
			endColor: {red:180, green:0, blue:0, alpha:0}
			
			//endColor: {red:91, green:239, blue:66, alpha:0}
		};
		this.easy.base.newObject(this.particle(), local);
		local.updateParticle = local.update;
		local.setupParticle = local.setup;
		this.easy.base.newObject(this.easy.base.getAtomRectangle(config), local);
		local.updateRect = local.update;
		local.setupRect = local.setup;
		
		local.setup = function(context) {
			this.setupParticle();
			this.setupRect(context);
		};
		
		local.transition = function(percent, start, end) {
			return start + (end - start) * percent;
		};
		
		local.interpolate = function(percent, startColor, endColor) {
			return {
				red: parseInt(this.transition(percent, startColor.red, endColor.red)),
				green: parseInt(this.transition(percent, startColor.green, endColor.green)),
				blue: parseInt(this.transition(percent, startColor.blue, endColor.blue)),
				alpha: this.transition(percent, startColor.alpha, endColor.alpha),
			}
		};
		
		local.colorObjectToString = function(colorObj) {
			return "rgba(" + 
				colorObj.red + "," + 
				colorObj.green + "," + 
				colorObj.blue + "," +
				colorObj.alpha + ")";
		};
		
		local.update = function(frame) {
			
			
			var lifePercent = 1 - this.remainingLife / this.life;
			var interpolatedColor = this.interpolate(lifePercent, this.colorObj, this.endColor);
			this.color = this.colorObjectToString(interpolatedColor);
			//console.log(this.color);
			//this.alpha = 1- lifePercent;
			
			this.updateParticle(frame);
			this.updateRect();
		};
		
		return local;
	};
	
	// ALSO NEW
	// Make a Hex based color shifter and maybe even a HSV
	localContainer.getRGBAColorShift = function(config) {
		var local = {
			// Alpha is only between 1 and 0 but making it 1+ will help it be visible longer
			startColor: {red:255, green:255, blue:255, alpha:2},
			endColor: {red:0, green:0, blue:0, alpha:0}
		};
		this.easy.base.newObject(config, local);
		
		// I'm not moving this into interpolate because it would get created 
		// per particle, though it should be there
		local.transition = function(percent, start, end) {
			return start + (end - start) * percent;
		};
		
		local.interpolate = function(percent, startColor, endColor) {
			return {
				red: parseInt(this.transition(percent, startColor.red, endColor.red)),
				green: parseInt(this.transition(percent, startColor.green, endColor.green)),
				blue: parseInt(this.transition(percent, startColor.blue, endColor.blue)),
				alpha: this.transition(percent, startColor.alpha, endColor.alpha),
			}
		};
		
		local.colorObjectToString = function(colorObj) {
			return "rgba(" + 
				colorObj.red + "," + 
				colorObj.green + "," + 
				colorObj.blue + "," +
				colorObj.alpha + ")";
		};
		
		local.getColorShift = function(totalLife, currentLife) {
			var lifePercent = 1 - currentLife / totalLife;
			var interpolatedColor = this.interpolate(lifePercent, this.startColor, this.endColor);
			return this.colorObjectToString(interpolatedColor);
		};
		
		return local;
	};
	
	// NEW
	localContainer.particleSprayer = function(config) {
		var local = {
			active: true,
			particles: [], // [[currentLife, pos, velocity]]
			pos: [100, 100],
			velocity: [0, 0],
			spawnRate: 300, // Per second
			spawnCone: Math.PI/8,
			spawnRotation: 0,
			speedRatio: [5, 10],
			lifeRatio: [50, 100],
			totalParticles: 0,
			spawn: 0,
			lastUpdateTime: 0,
			life: 2, // in seconds
			context: null
			
		};
		this.easy.base.newObject(config, local);
		
		local.setup = function(context) {
			this.context = context;
		};
		
		local.createParticle = function() {
			this.particles.push([
				// Life
				this.life*random(this.lifeRatio[0], this.lifeRatio[1])/100,
				// Position
				[this.pos[0], this.pos[1]],
				// Velocity
				getVelocityToAngle(
					random(this.speedRatio[0], this.speedRatio[1]),
					random(this.spawnRotation - this.spawnCone/2, this.spawnRotation + this.spawnCone/2)
				)
			]);
		};
		
		local.spawnParticles = function(frame) {
			// prevents huge lag spikes
			if (this.lastDeltaTime*5 < frame.delta) this.spawn += this.lastDeltaTime*(this.spawnRate);
			else this.spawn += frame.delta*(this.spawnRate);
			//console.log(this.spawn);
			this.lastDeltaTime = frame.delta;
			// If this.spawn isn't even then the remainder will be added to the next spawn phase
			for (var i=0; i < parseInt(this.spawn); i++) {
				this.createParticle();
				this.totalParticles += 1;
				this.spawn -= 1;
			}
		};
		
		local.update = function(frame) {
			// Create new particles!
			if (this.active) this.spawnParticles(frame);
			
			// Then Update them!
			for (var particleIndex=this.particles.length-1; particleIndex >= 0; particleIndex--) {
				var particle = this.particles[particleIndex];
				// remove life
				particle[0] -= frame.delta;
				if (particle[0] > 0) {
					// Update position
					particle[1] = [
						particle[1][0] += particle[2][0]*frame.delta, 
						particle[1][1] += particle[2][1]*frame.delta
					];					
				} else {
					this.particles.splice(particleIndex, 1);
					this.totalParticles -= 1;
				}
			}
		};
		
		return local;
	};
	
	localContainer.getRectangleParticleSprayer = function(config) {
		var local = {
			ratio: [10, 10]
		};
		this.easy.base.newObject(this.particleSprayer(this.getRGBAColorShift(config)), local);
		
		local.drawRectangle = function(pos, ratio, color) {
			this.context.beginPath();
			this.context.rect(pos[0], pos[1], ratio[0], ratio[1]);
			this.context.fillStyle = color;
			this.context.fill();
		};
		
		local.update = function(frame) {
			
			// Since we aren't using the globalAlpha lets set it back to 1
			this.globalAlpha = 1;
			
			if (this.active) this.spawnParticles(frame);
			
			// Then Update them! This reverse forloop lets me delete the dead particles while 
			// updating them, but it makes the new particles be overlapped by the last.
			for (var particleIndex=this.particles.length-1; particleIndex >= 0; particleIndex--) {
				var particle = this.particles[particleIndex];
				// remove life
				particle[0] -= frame.delta;
				if (particle[0] > 0) {
					// Update position
					particle[1] = [
						particle[1][0] += particle[2][0]*frame.delta, 
						particle[1][1] += particle[2][1]*frame.delta
					];
					this.drawRectangle(particle[1], this.ratio, this.getColorShift(this.life, particle[0]));
				} else {
					this.particles.splice(particleIndex, 1);
					this.totalParticles -= 1;
				}
			}
		}
		
		return local;
	};
	
	localContainer.getParticleController = function(config) {
		var local = {
			active:false,
			particle: null,
			context: null,
			pos: [100, 100],
			spawnRate: 300, // Per second
			spawnAngle: Math.PI/8,
			spawnRotation: 0,
			speedRatio: [6, 10], // Min and Max speed
			lifeRatio: [50, 100], // Min and Max
			particles: [],
			parentVelocity: [0, 0],
			totalParticles: 0,
			lastSpawn: 0,
			lastUpdateTime: 0
		};
		this.easy.base.newObject(config, local);
		
		local.setup = function(context) {
			this.context = context;
		};
		
		local.setParticle = function(particle) {
			this.particle = particle;
		};
		
		local.createParticle = function() {
			var newParticle = this.particle();
			var velocity = getVelocityToAngle(
				random(this.speedRatio[0], this.speedRatio[1]), 
				random(this.spawnRotation - this.spawnAngle/2, this.spawnRotation + this.spawnAngle/2)
			);
			
			newParticle.pos = [this.pos[0] - newParticle.ratio[0]/2, this.pos[1] - newParticle.ratio[1]/2];
			newParticle.velocity = velocity;
			newParticle.life = newParticle.life * random(this.lifeRatio[0], this.lifeRatio[1])/100;
			
			newParticle.setup(this.context);
			this.particles.push(newParticle);
		};
		
		local.spawnParticles = function(frame) {
			// prevents huge lag spikes due to frame.frameUpdateTime growing when the tab loses focus
			if (this.lastUpdateTime*3 < frame.updateTime) {
				this.lastSpawn += this.lastUpdateTime/(1000/this.spawnRate);
				//console.log("Update spike! Time: " + frame.updateTime);
			} else {
				this.lastSpawn += frame.updateTime/(1000/this.spawnRate);
			}
			this.lastUpdateTime = frame.updateTime;
			for (var i=0; i < parseInt(this.lastSpawn); i++) {
				this.createParticle();
				this.totalParticles += 1;
				this.lastSpawn -= 1;
			}
		};
		
		local.update = function(frame) {
			// Remove dead
			
			for (var particleIndex=this.particles.length-1; particleIndex >= 0; particleIndex--) {
				if (!this.particles[particleIndex].alive) {
					this.particles.splice(particleIndex, 1);
					this.totalParticles -= 1;
				}
			}
			
			// spawn!
			if (this.active) this.spawnParticles(frame);
			
			// Update alive
			var particles = this.particles;
			for (var particleIndex in particles) {
				this.particles[particleIndex].update(frame);
			}
			this.spawnRotation += 10*frame.delta;
		};
		
		return local;
	}
	
	return localContainer;
};