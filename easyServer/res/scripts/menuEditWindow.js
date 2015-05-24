
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
	
	var btnLabel = easy.windowLib.getLabelWidget({
		text: "Button!",
		ratio: [0, 10],
		align: "center",
		baseline: "middle"
	});
	
	var button = easy.windowLib.getButtonWidget({
		func:function() {
			console.log("Button pressed!");
			//console.log(this.clickedStyle);
		},
		ratio: [40, 20],
		styles: {
			"default": {
				color:"pink",
				alpha: .6,
				borderColor: "blue"
			},
			"active": {
				color: "gray",
				alpha: 1,
				borderColor: "white"
			}
		},
		clickedStyle: "active",
		label: btnLabel,
		localPos: [50, 50]
	});
	
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
	blockControls.add("button", button);
	
	
	mainWindow.add("display", blockDisplay);
	mainWindow.add("controls", blockControls);
	
	windowManager.add("editWindow", mainWindow);
	
	return mainWindow;
}