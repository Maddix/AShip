
function Particles(toFrage) {
	var localContainer = {
		version: "1.0",
		frage: toFrage
	}

	// Make a Hex based color shifter and maybe even a HSV
	localContainer.getRGBAColorShift = function(config) {
		var local = {
			// Alpha is only between 1 and 0 but making it 1+ will help it be visible longer
			startColor: {red:255, green:255, blue:255, alpha:2},
			endColor: {red:0, green:0, blue:0, alpha:0}
		};
		this.frage.base.extend(config, local);

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


	localContainer.particleSprayer = function(config) {
		var local = {
			active: true,
			particles: [], // [[currentLife, pos, velocity]]
			pos: [100, 100],
			velocity: [0, 0],
			spawnRate: 300, // Per second
			spawnCone: Math.PI/8,
			spawnRotation: 0,
			spawnPosOffset: [0, 0],
			speedRatio: [5, 10],
			lifeRatio: [50, 100],
			totalParticles: 0,
			spawn: 0,
			lastUpdateTime: 0,
			life: 2, // in seconds
			context: null

		};
		this.frage.base.newObject(config, local);

		local.setup = function(context) {
			this.context = context;
		};

		local.createParticle = function() {
			this.particles.push([
				// Life
				this.life*random(this.lifeRatio[0], this.lifeRatio[1])/100,
				// Position
				[this.pos[0] - this.spawnPosOffset[0], this.pos[1] - this.spawnPosOffset[1]],
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

		local.updateGraphics = function(frame) {
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
		this.frage.base.newObject(this.particleSprayer(this.getRGBAColorShift(config)), local);
		local.spawnPosOffset = [local.ratio[0]/2, local.ratio[1]/2];

		local.drawRectangle = function(pos, ratio, color) {
			this.context.beginPath();
			this.context.rect(pos[0], pos[1], ratio[0], ratio[1]);
			this.context.fillStyle = color;
			this.context.fill();
		};

		local.updateGraphics = function(frame) {

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

	return localContainer;
};
