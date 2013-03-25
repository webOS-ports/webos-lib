enyo.requiresWindow(function() {
	if(enyo.platform.webos >= 3) {
		//if device has a virtual keyboard, add functions
		Mojo = window.Mojo || {};
		Mojo.keyboardShown = function (inKeyboardShowing) {
			webos.keyboard._isShowing = inKeyboardShowing;
			enyo.Signals.send("onvirtualkeyboard", {type:"virtualkeyboard", showing: inKeyboardShowing});
		}
		webos = window.webos || {};
		webos.keyboard = {
			types: {
				text: 0,
				password: 1,
				search: 2,
				range: 3,
				email: 4,
				number: 5,
				phone: 6,
				url: 7,
				color: 8
			},
			isShowing: function() {
				return webos.keyboard._isShowing || false;
			},
			show: function(type){
				if(webos.keyboard.isManualMode()) {
					PalmSystem.keyboardShow(type || 0);
				}
			},
			hide: function(){
				if(webos.keyboard.isManualMode()) {
					PalmSystem.keyboardHide();
				}
			},
			setManualMode: function(mode){
				webos.keyboard._manual = mode;
				PalmSystem.setManualKeyboardEnabled(mode);
			},
			isManualMode: function(){
				return enyo.webOS.keyboard._manual || false;
			},
			forceShow: function(type){
				webos.keyboard.setManualMode(true);
				PalmSystem.keyboardShow(inType || 0);
			},
			forceHide: function(){
				webos.keyboard.setManualMode(true);
				PalmSystem.keyboardHide();
			}
		};
	}
});