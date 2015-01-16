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

///////////////////////////////////////////////////
// toPercent ~ Converts 'integer' into a percent //
// Parameters: int integer						 //
// Example: 54 = .54 | 5 = .05 | 332 = 1		 //
///////////////////////////////////////////////////
// Move away from using this ?
function toPercent(integer) {
	if (integer <= 0) return 0;
	if (integer >= 100) return 1;
	else if (integer < 10) return parseFloat(".0" + integer);
	else return parseFloat("." + integer);
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

////////////////////////////////////////////////////////////////////
// getSizeOfPiece ~ Returns the percentage of 'integer' to 'max'. //
//					As in 50 of 500 is 10%. 250 of 500 is 50%.    //
// Parameters: int integer - int max -							  //
//	int roundTo ~ How many numbers after the decimal point.		  //
// Example: (50, 500, 2) = 10									  //
////////////////////////////////////////////////////////////////////

// Remove as this is usless. 50 / 500 = .1 or 500 / 50 = 10

// Need a good name..
function getSizeOfPiece(integer, max, roundTo) {
	return parseFloat((integer / (max / 100)).toFixed(roundTo));
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

//////////////////////
// rotateToAngle ~
// Parameters:
//
// Example:
///////////

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

// |a + b| (?)
function dotProduct(vectorOne, vectorTwo) {
	return vectorOne[0]*vectorTwo[0] + vectorOne[1]*vectorTwo[1];
};

//  a X b
function crossProduct(vectorOne, vectorTwo) {
	return vectorOne[0]*vectorTwo[1] - vectorOne[1]*vectorTwo[0];
};

// |v|
function vectorMagnitude(vector) {
	return Math.hypot(vector[0], vector[1]);
};

// Same thing as crossProductAngle - remove when not needed
function angleBetweenVectors(vectorOne, vectorTwo) {
	return dotProduct(vectorOne, vectorTwo) / 
		(vectorMagnitude(vectorOne)*vectorMagnitude(vectorTwo));
};

// Returns angularVelocity
// Force and offset are vec2s, inertia is a scaler
function angularVelocity(offset, force, inertia) {
	return crossProduct(offset, force)/inertia;
};

// Angle should (needs to) be a radian, doesn't work too well with degrees
// http://stackoverflow.com/questions/2259476/rotating-a-point-about-another-point-2d
// Normal function
// Canvas already does this with transform(x, y) for center and rotate(rad), but which is faster? Canvas..
function rotatePoint(point, angle) {
	var angles = [Math.sin(angle), Math.cos(angle)];
	return [(angles[1]*point[0] - angles[0]*point[1]),
			(angles[0]*point[0] + angles[1]*point[1])];
} 

function getVelocityToAngle(acceleration, angle) {
	return [acceleration * Math.sin(angle), 
			acceleration * -Math.cos(angle)];
}

// REMOVE IF NEW FUNCTION WORKS
function withinBounds(x, y, width, height, offset) {
	var within = true;
	if (x > width + offset || x < 0 - offset) within = false;
	else if (y > height + offset || y < 0 - offset) within = false; 
	return within;
}

// Make parameters more understandable
// x, y is the start location of the box ~ Exactly the same as withinBounds
// Made this the default, only remove the _a and then make it have dynamic parameters
// REMOVE IF NEW FUNCTION WORKS
function withinBounds_a(objX, objY, width, height, x, y, offset) {
	var within = true;
	if (objX > x + width + offset || objX < x - offset) within = false;
	else if (objY > y + height + offset || objY < y - offset) within = false;
	return within;
}

// need a new name
// THIS IS THE NEW FUNCTION
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

// Needs a new name
// REMOVE IF 'getDistance' WORKS
function distanceFromTarget(objOneX, objOneY, objTwoX, objTwoY) {
	return Math.sqrt(Math.pow(objOneX - objTwoX, 2) + Math.pow(objOneY - objTwoY, 2));
}

// not tested
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

// This is for Kineticjs4.7.4, as of 5.0.0 we don't need this any more
function formatAnimationKeys(ani) {
	var formattedAnimation = [];
	for (var key=0; key < ani.length; key+=4) {
		formattedAnimation.push({x: ani[key],
								y: ani[key+1],
								width: ani[key+2],
								height: ani[key+3]});
	}
	return formattedAnimation;
}