// if we're on webOS/Open webOS, write a relaunch method to handle app menu
if (window.PalmSystem) {
	Mojo.relaunch = function() {
		var lp = webos.launchParams();

		if (lp['palm-command'] && lp['palm-command'] == 'open-app-menu') {
			enyo.Signals.send("onToggleAppMenu");
		}
	};
}

// write a fetchAppInfo method to replace the missing one
enyo.fetchAppInfo = function() {
	// we store it in enyo.appInfo; if that doesn't exist, fetch it
	if (!enyo.appInfo) {
		try {
			var appInfoJSON,
				appInfoPath = enyo.g11n.Utils._fetchAppRootPath() + "appinfo.json";
			
			if (window.PalmSystem) {
				// if we're on webOS, use palmGetResource
				// need to avoid this on Open webOS or make sure palmGetResource
				// doesn't crash
				appInfoJSON = palmGetResource(appInfoPath);
			} else {
				// if we're not on webOS, use a synchronous XHR request to pick it up
				// can't use on webOS since it doesn't support synchronous XHR
				appInfoJSON = enyo.xhr.request({url: appInfoPath, sync: true}).responseText;
			}
			enyo.appInfo = JSON.parse(appInfoJSON);
		} catch (e) {
			// you should probably fill in any info your app *needs* to function here (i.e. an id)
			enyo.appInfo = {
				id: "",
				version: "",
				title: ""
			};
			
			// if it errors out, log an error
			typeof console != "undefined" && console.error("enyo.fetchAppInfo(): couldn't fetch app info");
		}
	}
	
	// now return enyo.appInfo
	return enyo.appInfo;
};