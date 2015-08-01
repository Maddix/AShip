<!DOCTYPE html>
<html>
<head>

	<link rel="icon" type="image/png" href="res/images/icon.png" />
	<title>A Ship Game</title>

	<!-- CSS -->
	<link rel="stylesheet" type="text/css" href="res/styles/style.css">

	<script src="res/scripts/jquery-v2.0.3.min.js"></script>
	<script src="res/scripts/jquery.mousewheel.js"></script>
	<script src="res/scripts/menu.js"></script>
	<script src="res/scripts/AI.js"></script>
	<script src="res/scripts/components.js"></script>
	<script src="res/scripts/math.js"></script>
	<script src="res/scripts/particles.js"></script>
	<script src="res/scripts/background.js"></script>
	<script src="res/scripts/minimap.js"></script>
	<script src="res/scripts/easyFrame.js"></script>
	<script src="res/scripts/createContent.js"></script>
	<script src="res/scripts/menuEditWindow.js"></script>
	<script src="res/scripts/keyInput.js"></script>
	<script src="res/scripts/loadImages.js"></script>
	<script src="res/scripts/main.js"></script>

	<script type="text/javascript">
		$(function() {
			//'use strict'; // Used to turn on extra browser warnings?
			var easy = EasyFrame();
            easy.base.loadImages({
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
            }, function(loadedImages) {
                setup(loadedImages, easy);
            }, "../res/images/");
		});
	</script>

</head>
<body>
	<!-- oncontectmenu is used to stop the context menu when you right click, thus freeing the right mouse button -->
	<div id="container"></div>

</body>
</html>
