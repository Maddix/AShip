
function createEditWindow(windowManager) {

	//var menu = DATA.layerController.getLayer("menu");
	var easy = DATA.easyFrame;

	/* ====== *
	   Window
	*  ====== */
	
	//var windowManager = DATA.windowManager;
	
	var mainWindow = easy.windowLib.getMenuWindow({
		pos: [400, 200],
		ratio: [200, 300]
	});
	
	/* ====== *
	   Blocks
	*  ====== */
	
	
	var blockDisplay = easy.windowLib.getMenuBlock({
		localPos:[0, 0],
		localRatio:[100, 30],
		arrangeStyle:"free"
	});
	
	var blockControls = easy.windowLib.getMenuBlock({
		localPos:[0, 30],
		localRatio:[100, 70],
		arrangeStyle:"free"
	});
	
	/* ======= *
	   Widgets
	*  ======= */
	
	var view = easy.windowLib.getViewObject({
		localPos:[50, 50],
		localRatio:[100, 100],
		ratio: [100, 64]
	});
	
	/*
	view.inputContext = function(input) {
		console.log(input);
		if (input.keys["LMB"]) {
			console.log(input.mouse["mousePosition"]);
		}
	};
	*/
	
	var backgroundTrans = easy.windowLib.getBackgroundRectWidget({
		color: "#9AC2E3",
		alpha: .5,
		borderAlpha: 0
	});
	
	var background = easy.windowLib.getBackgroundRectWidget({
		color: "#94A5B3",
		localRatio: [100, 100],
		borderAlpha: 0
		//localPos: [50, 50]
	});
	
	blockDisplay.add("backgroundTransparent", backgroundTrans);
	blockDisplay.add("view", view);
	blockControls.add("background", background);
	
	
	mainWindow.add("display", blockDisplay);
	mainWindow.add("controls", blockControls);
	
	
	//console.log(mainWindow);
	
	windowManager.add("editWindow", mainWindow);
	
	return mainWindow;
}