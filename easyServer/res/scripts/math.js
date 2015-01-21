// //////////////
// Math Library!
//
// ////////////////////////////
// Check these links later
// Rotation-box-collision-detection: www.ragestorm.net/tutorial?id=22
// Also look for box-onAxis-collision (menu stuff maybe?)

// Place in a name space

/////////////////////////////////////////////////////////////
// intRandom ~ Returns a random number from 'min' to 'max' //
// Parameters: int min - int max						   //
// Example: (10, 20) = 14								   //
/////////////////////////////////////////////////////////////

function intRandom(min, max) {
	return parseInt(Math.random() * (max - min) + min);
}

function random(min, max) {
	return Math.random() * (max - min) + min;
};

//////////////////////////////////////////////
// toRadian ~ Converts 'degree' to a radian //
// Parameters: int degree 				    //
// Example: 90 = PI/2					    //
//////////////////////////////////////////////

function toRadian(degree) {
	return degree*Math.PI/180;
}

//////////////////////////////////////////////////////
// getAverage ~ Gets the average number from a list //
// Parameters: list[int, int, nth]					//
// Example: [5, 10, 7, 14, 11] = 9.4				//
//////////////////////////////////////////////////////

function getAverage(averageList) {
	var total = 0;
	for(var numberIndex in averageList) total += averageList[numberIndex];
	return total / averageList.length;
}

///////////////////////////////////////////////////////////////////////////////
// getAngle ~ Returns the radian angle from position 'from' to position 'to' //
// Parameters: list[int, int] from - list[int, int] to						 //
// Example: ([0, 0], [0, 10]) = PI/2										 //
///////////////////////////////////////////////////////////////////////////////

// Fixed (?)
// http://math.rice.edu/~pcmi/sphere/drg_txt.html - radian tutorial. very good!
function getAngle(from, to) {
	return Math.atan2((to[1] - from[1]), (to[0] - from[0]));
}

// All angles should be in radians, positions should be in a lists, ([x, y])
function rotateToAngle(pos, targetPos, currentAngle, angleOffset, turnRate) {
	var targetAngle = getAngle(pos, targetPos) + angleOffset;
	return slowTurn(currentAngle, targetAngle, turnRate);
};

// Don't use unless you're sure!! Use rotateToAngle instead.
function slowTurn(angle, targetAngle, turnRate) {
	var newAngle = angle;
	if (angle != targetAngle) {
		var delta = targetAngle - newAngle;
		if (delta > Math.PI) delta -= Math.PI*2;
		if (delta < -Math.PI) delta += Math.PI*2;
		if (delta > 0) newAngle += turnRate;
		else newAngle -= turnRate;
		if (Math.abs(delta) < turnRate) newAngle = targetAngle;
	}
	return newAngle;
}

// All angles given are assumed to be positive
// 0 <= startAngle < noPassAngle < PI*2
function limitTurn(startAngle, noPassAngle, angleOffset, currentAngle) {
	var angle = currentAngle;
	if (currentAngle < startAngle + angleOffset) angle = startAngle + angleOffset;
	else if (currentAngle > noPassAngle + angleOffset) angle = noPassAngle + angleOffset;
	return angle;
}

function dotProduct(vectorOne, vectorTwo) {
	return vectorOne[0]*vectorTwo[0] + vectorOne[1]*vectorTwo[1];
};

function crossProduct(vectorOne, vectorTwo) {
	return vectorOne[0]*vectorTwo[1] - vectorOne[1]*vectorTwo[0];
};

function vectorMagnitude(vector) {
	return Math.hypot(vector[0], vector[1]);
};

function angleBetweenVectors(vectorOne, vectorTwo) {
	return dotProduct(vectorOne, vectorTwo) / 
		(vectorMagnitude(vectorOne)*vectorMagnitude(vectorTwo));
};

// Returns angularVelocity
// Force and offset are vec2s, inertia is a scaler
function angularVelocity(offset, force, inertia) {
	return crossProduct(offset, force)/inertia;
};

// Angle is in radians
// http://stackoverflow.com/questions/2259476/rotating-a-point-about-another-point-2d
// Normal function
// Canvas already does this with transform(x, y), though I'm not sure how hard it would be to us it.
function rotatePoint(point, angle) {
	var angles = [Math.sin(angle), Math.cos(angle)];
	return [(angles[1]*point[0] - angles[0]*point[1]),
			(angles[0]*point[0] + angles[1]*point[1])];
} 

function getVelocityToAngle(acceleration, angle) {
	return [acceleration * Math.sin(angle), 
			acceleration * -Math.cos(angle)];
}

// Make parameters more understandable
function checkWithinBounds(pos, boxOrigin, boxRatio, offset) {
	var inside = true;
	// left or right
	if (pos[0] > boxOrigin[0] + boxRatio[0] + offset || pos[0] < boxOrigin[0] - offset) inside = false;
	// top or bottom
	else if (pos[1] > boxOrigin[1] + boxRatio[1] + offset || pos[1] < boxOrigin[1] - offset) inside = false;
	
	return inside;
}

// This is used by the minimap to scale numbers to the right size
// needs a new name
function scaleNumber(number, width, newWidth) {
	return number/width * newWidth;
}

function getDistance(one, two) {
	return Math.sqrt(Math.pow(one[0] - two[0], 2) + Math.pow(one[1] - two[1], 2));
}

function checkCircleCollision(objOnePos, objOneRadius, objTwoPos, objTwoRadius) {
	var collision = false;
	var distance = distanceFromTarget(objOnePos[0], objOnePos[1], objTwoPos[0], objTwoPos[1]);
	// Think about the equal part in ">=". It might be better to ignore touching.
	if (objOneRadius + objTwoRadius >= distance) collision = true;
	return collision;
}