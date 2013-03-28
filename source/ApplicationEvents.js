/**
	Binds LunaSysMgr application events to Enyo signals.
	
	_"onactivate"_: When the window is activated
	_"ondeactivate"_: When the window is deactivated
	_"onmenubutton"_: When the app menu is toggled
	_"onrelaunch"_: When the app is relaunched
*/

if (window.PalmSystem) {
	Mojo = window.Mojo || {};

	// LunaSysMgr calls this when the windows is maximized or opened.
	Mojo.stageActivated = function() {
		enyo.Signals.send("onactivate");
	};

	// LunaSysMgr calls this when the windows is minimized or closed.
	Mojo.stageDeactivated = function() {
		enyo.Signals.send("ondeactivate");
	};

	// LunaSysMgr calls this whenever an app is "launched;" 
	Mojo.relaunch = function() {
		var param = webos.launchParams();
		if(param["palm-command"] == "open-app-menu") {
			enyo.Signals.send("onmenubutton");
		} else {
			enyo.Signals.send("onrelaunch", param);
		}
		// Need to return true to tell sysmgr the relaunch succeeded.
		// otherwise, it'll try to focus the app, which will focus the first
		// opened window of an app with multiple windows.
		return true;
	};
}
