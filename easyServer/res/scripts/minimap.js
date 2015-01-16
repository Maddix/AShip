// rewrite
function createMinimap(fill, outline, minimapX, minimapY, width, height, layer) {
	// Create MiniMap background - Still needs position set
	var minimapBackground = new Kinetic.Rect({
		x:width - minimapX - 25,  // - 25 is how far from the bottom-right of the screen to sit, need to change this later.
		y:height - minimapY - 25,  // Ditto here.
		width:minimapX,
		height:minimapY,
		fill:fill,
		cornerRadius:20,
		opacity:0.5,
		stroke:outline,
		strokeWidth:20,
	});
	// Add populate to the Rect object
	minimapBackground.populate = [];
	layer.add(minimapBackground);
	return minimapBackground;
}

function createCircle(color, size, posX, posY) {
	// Create a new Circle
	var newCircle = new Kinetic.Circle({
		x:posX,
		y:posY,
		radius:size,
		opacity:1,
		fill:color,
		stroke:"gray",
		strokeWidth:1
	});
	return newCircle;
}

function populateMinimap(objects, width, height, minimap, layer) {
	
	var minimapX = minimap.getWidth();
	var minimapY = minimap.getHeight();
	for (item in objects) {
		// The objects color
		var color = item;
		for (piece in objects[item]) {
			var piece = objects[item][piece];
			var scaledX = scaleNumber(piece.getX(), width, minimapX);
			var scaledY = scaleNumber(piece.getY(), height, minimapY);
			var point = createCircle(color, minimapX/100 + minimapY/100, minimapX, minimapY);
			
			layer.add(point);
			var circle = {
				img:point,
				obj:piece,
				visible:false
			}
			minimap.populate.push(circle);
		}
	}
}

function updateMinimap(minimap, width, height, range) {
	
	// Please note: Range is how much extra space is added, 1 is 1x1 to the window.
	//              2 is 1.5x1.5 to the window. 3 is 2x2 to the window and so on.
	
	var minimapX = minimap.getWidth();
	var minimapY = minimap.getHeight();
	
	// Where to place on the minimapBackground
	var localX = minimap.getX() + minimapX/2 - minimapX/(range*2);
	var localY = minimap.getY() + minimapY/2 - minimapY/(range*2);
	
	for (item in minimap.populate) {
		// Minimap object
		var item = minimap.populate[item];
		var obj = item.obj;
		var point = item.img;
		
		// Minimap space
		point.setX(scaleNumber(obj.getX(), width, minimapX/range) + localX);
		point.setY(scaleNumber(obj.getY(), height, minimapY/range) + localY);
		
		// Creates a boundary around the minimapBackground and detect when a dot has crossed it (-3 is offset)
		if (withinBounds_a(point.getX(), point.getY(), minimapX, minimapY, minimap.getX(), minimap.getY(), -3)) point.setVisible(true);
		else point.setVisible(false);
	}
}