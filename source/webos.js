webos = window.webos || {};

enyo.requiresWindow(function() {
	if (window.PalmSystem) {
		PalmSystem.stageReady();
		webos = {
			identifier: function(){
				var tokens = PalmSystem.identifier.split(" ");
				return {
					appID: tokens[0],
					process: tokens[1],
				};
			},
			launchParams: function() {
				return enyo.json.parse(PalmSystem.launchParams || "{}") || {};
			},
			deviceInfo: function(){
				return enyo.json.parse(PalmSystem.deviceInfo);
			},
			localeInfo: function(){
				return {
					locale: PalmSystem.locale,
					localeRegion: PalmSystem.localeRegion,
					phoneRegion: PalmSystem.phoneRegion
				};
			},
			isTwelveHourFormat: function(){
				return (PalmSystem.timeFormat === "HH12");
			},
			pasteClipboard: function(){
				PalmSystem.paste();
			},
			getWindowOrientation: function() {
				//Returns one of 'up', 'down', 'left' or 'right'.
				return PalmSystem.screenOrientation;
			},
			setWindowOrientation: function(inOrientation) {
				//inOrientation is one of 'up', 'down', 'left', 'right', or 'free'
				PalmSystem.setWindowOrientation(inOrientation);
			},
			setFullScreen: function(inMode) {
				PalmSystem.enableFullScreenMode(inMode);
			},
			indicateNewContent: function(hasNew) {
				if(webos._throbId) {
					PalmSystem.removeNewContentIndicator(webos._throbId);
					webos._throbId = undefined;
				}
				if(hasNew) {
					webos._throbId = PalmSystem.addNewContentIndicator();
				}		
			},
			isActivated: function(inWindow) {
				inWindow = inWindow || window;
				if(inWindow.PalmSystem) {
					return inWindow.PalmSystem.isActivated
				}
				return false;
			},
			activate: function(inWindow) {
				inWindow = inWindow || window;
				if(inWindow.PalmSystem) {
					inWindow.PalmSystem.activate();
				}
			},
			deactivate: function(inWindow) {
				inWindow = inWindow || window;
				if(inWindow.PalmSystem) {
					inWindow.PalmSystem.deactivate();
				}
			},
			addBannerMessage: function() {
				return PalmSystem.addBannerMessage.apply(PalmSystem, arguments);
			},
			removeBannerMessage: function(inId) {
				PalmSystem.removeBannerMessage.apply(PalmSystem, arguments);
			},
			setWindowProperties: function(inWindow, inProps) {
				if(arguments.length==1) {
					inProps = inWindow;
					inWindow = window;
				}
				if(inWindow.PalmSystem) {
					inWindow.PalmSystem.setWindowProperties(inProps);
				}
			},
	
			/** Searches _inText_ for URLs (web and mailto) and emoticons (if supported),
			 * and returns a new string with those entities replaced by HTML links and images
			 * (respectively).
			 *
			 * Passing false for an  _inOptions_ field will prevent LunaSysMgr from HTML-izing
			 * that text type.
			 *
			 * Default option values:
			 * 	{
			 * 		phoneNumber: true,
			 * 		emailAddress: true,
			 * 		webLink: true,
			 * 		schemalessWebLink: true,
			 * 		emoticon: true
			 * 	}
			 **/
			runTextIndexer: function(inText, inOptions){
				if (inText && inText.length > 0 && PalmSystem.runTextIndexer) {
					return PalmSystem.runTextIndexer(inText, inOptions);
				}
				return inText;
			},
			keyboard: undefined, //undefined unless a virtual keyboard is present
		};
	}
});
webOS = window.webOS;
enyo.webOS = webOS;
enyo.webos = enyo.webOS;
