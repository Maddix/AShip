/*
 //////////////
 General Issues
 - Broken, update to new standard!
 - velocity vectors like [50, 1] have stars piling up on one edge and won't distribute evenly
 - [Fixed/monitor] Star popping still happening (?)
 /////////////
 Things to do
 - More small stars then large ones
 - Remove need to call createStars (?)
 ////////////
 Proper use
 - Create object
 - Connect to layer
 - Call object.createStars 
 */
 
function StarController(config) {
	var localData = {
		minStars:20,
		maxStars:50,
		context:null, // this pertains to layers
		velocity:[1, 1],
		boundryOffset:10,
		smallStarSpeed:[.1, .4],
		largeStarSpeed:[.9, .4]
	};
	for (var key in config) localData[key] = config[key];
	// Good answer -> http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
	localData.totalStars = intRandom(localData.minStars, localData.maxStars); // Random range from 20 to 50 or whatever is set
	localData.objects = [];
	localData.currentTotal = 0;
	
	// Star prototype
	function Star_old(config) {
		AtomImage.call(this);
		this.updateImage = this.update;
		this.hindrance = 0;
		this.offsetPos = [0, 0];
		for (var key in config) this[key] = config[key];
		var images = this.images;
		this.update = function() {
			// Should work.. Only thing missing is the '/frame.frameRate'
			this.pos[0] += localData.velocity[0]*this.hindrance; 
			this.pos[1] += localData.velocity[1]*this.hindrance;
			this.updateImage();
		}
	}
	
	function Star(config) {
		var local = {hindrance:0, offsetPos:[0, 0]};
		newObject(getAtomImage(), local);
		newObject(config, local);
		local.updateImage = local.update;
		
		local.update = function() {
			this.pos[0] += localData.velocity[0]*this.hindrance;
			this.pos[1] += localData.velocity[1]*this.hindrance;
			this.updateImage();
		}
		return local;
	}
	
	var newStar = function() {
		var starSize = intRandom(0, 2);
		var image = localData.images[starSize]; //0 to 1
		var star = Star({
			image: image,
			offset: [image.width/2, image.height/2]
		});
		// Set offset location
		star.pos[0] = intRandom(0, DATA.screenRatio[0]);
		star.pos[1] = intRandom(0, DATA.screenRatio[1]);
		// Set hindrance
		// Example: .03 = 3%, .7 = 70%, 5 = 500%
		var smallSpeed = localData.smallStarSpeed;
		var largeSpeed = localData.largeStarSpeed;
		if (starSize == 0) {
			star.hindrance = (Math.random() * (smallSpeed[1] - smallSpeed[0]) + smallSpeed[0]); // Slow
		} else {
			star.hindrance = (Math.random() * (largeSpeed[1] - largeSpeed[0]) + largeSpeed[0]); // Fast
		}
		addStar(star);
	}
	
	var repostion = function(star, velocity, camera, screenRatio, offset) {
		// star, camera, position, screenRatio, offset
		var direction = []; 
		if (velocity[0] < 0) direction.push(1);
		else direction.push(2);
		if (velocity[1] > 0) direction.push(3);
		else direction.push(4);
		direction = direction[intRandom(0, 2)];
		var x = 0;
		var y = 0;
		if (direction == 1){
			x = intRandom(screenRatio[0], screenRatio[0] + offset);
			y = intRandom(0, screenRatio[1]);
		} else if (direction == 2) {
			x = intRandom(0, -offset);
			y = intRandom(0, screenRatio[1]);
		} else if (direction == 3) {
			x = intRandom(0, screenRatio[0]);
			y = intRandom(0, -offset);
		} else if (direction == 4) {
			x = intRandom(0, screenRatio[0]);
			y = intRandom(screenRatio[1], screenRatio[1] + offset);
		}
		star.pos[0] = x;
		star.pos[1] = y;
	}
	
	var addStar = function(newStar) {
		newStar.context = localData.context;
		localData.objects.push(newStar);
	}
	
	localData.createStars = function() {
		for (var number = 0; number <= localData.totalStars; number++) {
			newStar();
			localData.currentTotal++;
		}
	}

	localData.connect = function(context) {
		localData.context = context;
	}
	
	localData.update = function() {
		for (var star in localData.objects) {
			var obj = localData.objects[star];
			if (!withinBounds_a(obj.pos[0], obj.pos[1], DATA.screenRatio[0], DATA.screenRatio[1], 0, 0, localData.boundryOffset)) {
				repostion(obj, localData.velocity, DYNAMIC_DATA.cameraPos, DATA.screenRatio, localData.boundryOffset);
			}
			// update the star either way
			localData.objects[star].update();
		}
	}
	// set these so that we can access them from the outside
	this.context = localData.context;
	this.createStars = localData.createStars;
	this.update = localData.update;
}