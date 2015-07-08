// Rename file to LoadImages
function loadImage(){
	var images = {};
	var folder = "res/images/";
	// Could be a dynamic list..
	var imageUrls = {
		"player":"ship.png",
		"playera":"shipa.png",
		"playerb":"shipb.png",
		"gun":"gun.png",
		"cursor":"cursor_a.png",
		"spritePlayer":"spPlayer.png",
		"bot":"bot.png",
		"bullet":"bullet_a.png",
		"starSmall":"starSmall.png",
		"starLarge":"starLarge.png",
		"starHuge":"starHuge.png",
		"engine":"engine.png",
		"buoy_sprite":"Ping_sprite_small.png"
	};
	
	var totalImages = 0;
	var totalLoaded = 0;
	// Image callback function
	function callBack() {
		totalLoaded++;
		// Run when all the images are loaded
		if (totalLoaded == totalImages){
			setup(images);
		}
	}
	// Start loading each image
	for (imageName in imageUrls) {
		totalImages++;
		var image = new Image();
		image.src = folder + imageUrls[imageName];
		image.onload = function() {callBack();};
		images[imageName] = image;
	}
}

