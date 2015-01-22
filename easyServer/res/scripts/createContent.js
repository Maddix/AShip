
function createContent() {
// Define common layers from the layerController
	var backgroundLayer = DATA.layerController.getLayer("backgroundLayer");
	var particleLayer = DATA.layerController.getLayer("particleLayer");
	var objectLayer = DATA.layerController.getLayer("objectLayer");
	var hud = DATA.layerController.getLayer("hud");
	var menu = DATA.layerController.getLayer("menu");
	var devOverlay = DATA.layerController.getLayer("devOverlay");
	var easy = DATA.easyFrame;
	
	
	// This tells canvas to draw with image smoothing (Its on by default)
	//objectLayer.context.imageSmoothingEnabled = true;
	
	
	/* ====================== *
	   Background setup stuff
	*  ====================== */
	
	// Background rect, to be the bottom layer
	var background = easy.base.getAtomRectangle({
		pos:[0, 0],
		ratio:[DATA.screenRatio[0], DATA.screenRatio[1]],
		color:"black"
	});
	backgroundLayer.add(background);
	
	// Create text objects - Not sure if I need to create them here
	var fps = easy.base.getAtomText({text:"FPS", color:"white", ratio:[0, 12], pos:[0, 10]});
	fps.updateText = fps.update;
	fps.update = function(frame) {
		this.text = "FPS: " + frame.rate;
		this.updateText();
	}
	
	var delta = easy.base.getAtomText({text:"Delta Time", color:"white", ratio:[0, 12], pos:[0, 20]});
	delta.updateText = delta.update;
	delta.update = function(frame) {
		this.text = "Delta Time: " + frame.delta;
		this.updateText();
	}
	
	// Directions
	var up = easy.base.getAtomText({text:"'W' to move forward", color:"white", ratio:[0, 15], pos:[10, 100]});
	devOverlay.add(up);
	var side = easy.base.getAtomText({text:"'A' & 'D' to move left and right", color:"white", ratio:[0, 15], pos:[10, 130]});
	devOverlay.add(side);
	var back = easy.base.getAtomText({text:"'S' to move backward", color:"white", ratio:[0, 15], pos:[10, 160]});
	devOverlay.add(back);
	var space = easy.base.getAtomText({text:"'Space' to reset position and velocity", color:"white", ratio:[0, 15], pos:[10, 190]});
	devOverlay.add(space);
	
	if (DATA.debug) {
		devOverlay.add(fps);
		devOverlay.add(delta);
	}
	
	/* ========= *
	   Particles
	*  ========= */
	
	
	var particle = function() {
		return easy.particles.getRectParticle({
			life:300,
			ratio:[4, 4],
			borderWidth:0,
			borderColor:"white",
			borderAlpha: 0,
			color:"rgba(255, 255, 255, 255)"
		});
	}
	
	
	var particleController = easy.particles.getParticleController({
		particle:particle,
		pos:[540, 300],
		spawnRate:50,
		spawnAngle: Math.PI/16,
		spawnRotation: 0,
		speedRatio:[20, 40],
		lifeRatio:[80, 100]
	});
	
	//particleLayer.add(particleController);
	
	var particleCount = easy.base.getAtomText({text:"Particles: ", color:"white", ratio:[0, 12], pos:[0, 30]});
	particleCount.updateText = particleCount.update;
	particleCount.update = function() {
		this.text = "Particles: " + particleController.totalParticles;
		this.updateText();
	};
	devOverlay.add(particleCount);
	
	
	/* ============ *
	   Mouse Cursor
	*  ============ */
	
	var cursor = easy.base.getAtomImage({
		image:DATA.images["cursor"], 
		pos:[DATA.screenRatio[0]/2, DATA.screenRatio[1]/2],
		offset:[DATA.images["cursor"].width/2, DATA.images["cursor"].height/2],
	});
	cursor.updateImage = cursor.update;
	cursor.update = function(frame) {
		this.rotation += Math.PI/1.6*frame.delta;
		particleController.pos = [this.pos[0], this.pos[1]];
		cursor.updateImage();
	};
	devOverlay.add(cursor);
	
	var mouseContext = function(input){
		if (input.mouse["mousePosition"]) {
			cursor.pos = input.mouse["mousePosition"];
		}
		return input;
	}
	DATA.inputController.addContext("main", "mouseContext", mouseContext);
	
	/* ============= *
	   Input profile
	*  ============= */
	
	var profile = easy.inputHandler.getProfile({
		//userKeyMapping:{}, // when I press 't' I want to fire 'w'
		inputController:DATA.inputController,
		keyMouseController:DATA.keyMouseController,
		inputContextGroup:"test"
	});
	
	/* ======= *
	   Windows
	*  ======= */
	
	var windowManager = easy.windowLib.getWindowManager();
	
	windowManager.inputContext = function (input) {
		if (input.keys["LMB"]) {
			windowManager.click(input);
			//console.log("clicked");
		} else if (input.keys["LMB"] === false) {
			windowManager.release(input);
		}
		
		return input;
	};
	
	var titleWindow = easy.windowLib.getWindow({
		pos:[200, 200],
		ratio:[200, 240]
	});
	
	titleWindow.createBlock("fullWindow", {
		arrangeStyle:"free",
		ratio:[100, 100]
	});
	
	var titleRect = easy.windowLib.getRectWidget({
		color:"green",
		localPos:[0, 0]
	});
	
	var titleWidget = easy.windowLib.getTextWidget({
		text:"Hello!",
		align:"start",
		baseline:"top",
		localPos:[0, 0]
	});
	
	console.log(titleRect);
	
	titleWindow.addWidget("fullWindow", titleRect);
	
	titleWindow.addWidget("fullWindow", titleWidget);
	
	windowManager.addWindow("title", titleWindow);
	
	menu.add(windowManager);
	console.log(windowManager);
	profile.add("window", windowManager);
	
	/* ===== *
	   Ships
	*  ===== */
	
	var engineDefault = easy.components.engineNew({
		image:DATA.images["engine"],
		offset:[DATA.images["engine"].width/2, DATA.images["engine"].height/2],
		power: 10,
		particle: particle,
		particleControllerLayer: particleLayer
	});
	
	var engineBackRightNew = easy.base.newObject({
		//xlocalRotation:Math.PI/8
	}, easy.base.newObject(engineDefault));
	
	var engineBackLeftNew = easy.base.newObject({
		//localRotation:-Math.PI/8
	}, easy.base.newObject(engineDefault));
	
	var engineFrontRightNew = easy.base.newObject({
		localRotation:Math.PI
	}, easy.base.newObject(engineDefault));

	var engineFrontLeftNew = easy.base.newObject({
		localRotation:Math.PI
	}, easy.base.newObject(engineDefault));
	
	var engineBackNew = easy.base.newObject({
		power: 20
	}, easy.base.newObject(engineDefault));
	
	var engineFrontSideRight = easy.base.newObject({
		localRotation: Math.PI/2
	}, easy.base.newObject(engineDefault));

	var engineFrontSideLeft = easy.base.newObject({
		localRotation: Math.PI*3/2
	}, easy.base.newObject(engineDefault));
	
	var engineComputer = easy.components.engineComputer({
		
	});
	
	var ship = easy.components.ship({
		image:DATA.images["playera"],
		offset:[DATA.images["playera"].width/2, DATA.images["playera"].height/2],
		pos:[DATA.screenRatio[0]/2, DATA.screenRatio[1] - DATA.screenRatio[1]/10],
		alive:true,
		inputContext:function(input) {
			
			// The engines can be used for more than one action at a time, like go forward and turnRight :S
			
			if (input.keys["w"]) {
				ship.software["engineComputer"].object.activate("forward", ship);
			}
			if (input.keys["a"]) {
				ship.software["engineComputer"].object.activate("turnLeft", ship);
			}
			if (input.keys["d"]) {
				ship.software["engineComputer"].object.activate("turnRight", ship);
			}
			if (input.keys["s"]) {
				ship.software["engineComputer"].object.activate("backward", ship);
			}
			if (input.keys["e"]) {
				ship.software["engineComputer"].object.activate("strafeRight", ship);
			}
			if (input.keys["q"]) {
				ship.software["engineComputer"].object.activate("strafeLeft", ship);
			}
			if (input.keys["r"] === false) {
				console.log("Recalc engines..");
				ship.software["engineComputer"].object.setupEngines(ship.slots);
				console.log(titleWindow);
			}
			if (input.keys["space"]) {
				ship.velocity = [0, 0];
				ship.angularVelocity = 0;
				ship.pos = [DATA.screenRatio[0]/2, DATA.screenRatio[1] - DATA.screenRatio[1]/10];
				ship.rotation = 0;
			};
		
			return input;
		}
	});
	objectLayer.add(ship);
	
	ship.addSlot("engineBackRight", [-10, 10]);
	ship.addSlot("engineBackLeft", [10, 10]);
	ship.addSlot("engineFrontRight", [-10, -10]);
	ship.addSlot("engineFrontLeft", [10, -10]);
	ship.addSlot("engineBack", [0, 10]);
	ship.addSlot("engineFrontSideRight", [-13, -7]);
	ship.addSlot("engineFrontSideLeft", [13, -7]);
	ship.addSoftwareSlot("engineComputer", engineComputer);
	
	
	ship.addObject("engineBackRight", engineBackRightNew);
	ship.addObject("engineBackLeft", engineBackLeftNew);
	ship.addObject("engineFrontRight", engineFrontRightNew);
	ship.addObject("engineFrontLeft", engineFrontLeftNew);
	ship.addObject("engineBack", engineBackNew);
	ship.addObject("engineFrontSideRight", engineFrontSideRight);
	ship.addObject("engineFrontSideLeft", engineFrontSideLeft);
	
	ship.addSoftware("engineComputer", engineComputer);
	
	profile.add("newShip", ship);	
}