/**
	An extension of the webOS.js script provided within enyo-webos to provide
	additional APIs for LuneOS devices and legacy devices.

	A collection of static variables and functions core to webOS functionality
	and the webOS feature-set. A large amount of PalmSystem bindings combined
	with some utility functions.
*/

// LuneOS.js initialization
(function() {

	// webOS.js verification/init
	if(!window.webOS) {
		console.warn('WARNING: webOS.js missing. Will attempt to continue.');
		window.webOS = {};
	}
	// Was `webOS.plaform` - a typo, so this guarded nothing and the real object was whatever
	// webOS.js left behind. Harmless until webOS.js is missing, when the lines below throw.
	webOS.platform = webOS.platform || {};

	// Mojo js hook system init
	window.Mojo = window.Mojo || {};

	// platform verification
	if(window.navigator.userAgent.toLowerCase().indexOf('luneos')>=0) {
		webOS.platform.luneos = true;
	}

	// Fall back to PalmSystem when the user agent does not say "luneos" and webOS.js detected
	// nothing either, which is the normal case on a current LuneOS build and leaves every
	// platform-gated feature in this library switched off - including the keyup -> `backgesture`
	// emulation below, so an app has no back gesture at all.
	//
	// Two independent reasons it ends up empty:
	//
	//  1. WAM's user agent no longer carries the marker. Measured on a MindPhone:
	//     "Mozilla/5.0 (X11; Linux armv7l) AppleWebKit/537.36 (KHTML, like Gecko)
	//      Chrome/151.0.7922.108 Safari/537.36 WebAppManager"
	//
	//  2. webOS.js decides legacy-vs-open with
	//         if (d.platformVersionMajor && d.platformVersionMinor)
	//     which is a truthiness test on a number that is legitimately zero. LuneOS reports
	//     platformVersion "3.0.5", so platformVersionMinor is 0, the branch is skipped, and
	//     neither platform.legacy nor platform.open is set. No exception is raised, so the
	//     catch that would have set `open` never runs either. (The proper fix for that one is
	//     a presence test in webOS.js; this fallback does not depend on it.)
	//
	// PalmSystem is the honest test for "running inside a webOS app container", and this only
	// fires when nothing else matched, so a TV, watch, legacy or Open webOS build keeps the
	// platform webOS.js gave it.
	if(!webOS.platform.luneos && !webOS.platform.legacy && !webOS.platform.open &&
			!webOS.platform.tv && !webOS.platform.watch && window.PalmSystem) {
		webOS.platform.luneos = true;
		delete webOS.platform.unknown;
	}

})();


/* ============================================================================
	Back gesture
============================================================================*/
(function() {

	// Deliberately NOT inside the platform guard that the rest of the Mojo hooks live behind.
	// webos-lib's BackGesture.js - what Enyo 2.5 and earlier apps used, and what this library
	// supersedes for 2.7 - listened unconditionally:
	//
	//     enyo.dispatcher.listen(document, 'keyup', function(ev) {
	//         if (ev.keyCode == 27 || ...) { enyo.Signals.send('onbackbutton', ev); }
	//     });
	//
	// Gating it on webOS.platform.{legacy,open,luneos} is what broke the back gesture on current
	// LuneOS, where all three are unset and the listener was therefore never installed. A keyup
	// listener that only reacts to Escape and the webOS Back keys costs nothing anywhere, and the
	// compositor's back gesture is exactly that key: CardView.onSwipeLeftGesture does
	// seat.sendKeyEvent(Qt.Key_Escape, true/false) to the focused surface.
	document.addEventListener('keyup', function(ev) {
		if (ev.keyCode == 27 || ev.keyIdentifier == "U+1200001"
				|| ev.keyIdentifier == "U+001B" || ev.keyIdentifier == "Back") {
			var e = document.createEvent("Event");
			e.initEvent("backgesture", false, false);
			document.dispatchEvent(e);
		}
	});

})();


/* ============================================================================
	Device Orientation APIs
============================================================================*/
(function() {

	webOS.orientation = {
		/**
		 * Set the current window orientation, if supported
		 * @param {string} orientation - One of 'up', 'down', 'left', 'right', or 'free'.
		 */
		setOrientation: function(orientation) {
			if(window.PalmSystem && PalmSystem.setWindowOrientation) {
				PalmSystem.setWindowOrientation(orientation);
			}
		},

		/**
		 * Returns the current window orientation
		 * @return {string} Orientation is one of 'up', 'down', 'left', 'right', or 'free'
		 */
		getOrientation: function() {
			if(window.PalmSystem && PalmSystem.setWindowOrientation) {
				return PalmSystem.windowOrientation;
			} else {
				return "up";
			}
		}
	};

})();


/* ============================================================================
	Utility APIs
 ============================================================================*/
(function() {

	webOS.util = {
		isLegacyPhone: function() {
			return !webOS.keyboard;
		
		},
		/**
			Searches _inText_ for URLs (web and mailto) and emoticons (if supported),
			and returns a new string with those entities replaced by HTML links and
			images (respectively).

			Passing false for an  _inOptions_ field will prevent LunaSysMgr from
			HTML-izing that text type.

			Default option values:

			* `phoneNumber: true,`
			* `emailAddress: true,`
			* `webLink: true,`
			* `schemalessWebLink: true,`
			* `emoticon: true`
		*/
		runTextIndexer: function (inText, inOptions) {
			if (inText && inText.length > 0 && window.PalmSystem && PalmSystem.runTextIndexer) {
				return PalmSystem.runTextIndexer(inText, inOptions);
			}
			return inText;
		},

		/**
			New content management with LED notifications. Pass _true_ to
			indicate new content, pass _false_ to remove indications.
		*/
		indicateNewContent: function (hasNew) {
			if (window.PalmSystem && this._throbId && PalmSystem.removeNewContentIndicator) {
				PalmSystem.removeNewContentIndicator(this._throbId);
				this._throbId = undefined;
			}
			if (window.PalmSystem && hasNew && PalmSystem.addNewContentIndicator) {
				this._throbId = PalmSystem.addNewContentIndicator();
			}
		}
	};

})();


/* ============================================================================
	Virtual Keyboard APIs
============================================================================*/
(function() {

	// virtual keyboard detection
	var hasVKeyboard = true;
	try {
		if(webOS.platform.legacy &&
				webOS.device.platformVersionMajor &&
				window.PalmSystem && window.PalmSystem.deviceInfo) {
			var di = JSON.parse(PalmSystem.deviceInfo);
			if(parseInt(di.platformVersionMajor)<3) {
				hasVKeyboard = false;
			}
		}
	} catch(e) {}

	if(hasVKeyboard) {
		var state = {};

		
		//Mojo LunaSysMgr hook for detecting keyboard shown
		Mojo.keyboardShown = function(inKeyboardShowing) {
			state.isShowing = inKeyboardShowing;
			var evt = document.createEvent('HTMLEvents');
			evt.initEvent("virtualkeyboard", false, false);
			evt.showing = inKeyboardShowing;
			document.dispatchEvent(evt);
		};
		
		webOS.keyboard = {
			/**
			 * Virtual keyboard type constants
			 * @readonly
	 		 * @enum {number}
			 */
			types: {
				/** Standard default keyboard layout */
				text: 0,
				/** Password-oriented keyboard layout */
				password: 1,
				/** Search-oriented keyboard layout */
				search: 2,
				/** Range-oriented keyboard layout */
				range: 3,
				/** Email-oriented keyboard layout */
				email: 4,
				/** Number-oriented keyboard layout */
				number: 5,
				/** Phone-oriented keyboard layout */
				phone: 6,
				/** URL-oriented keyboard layout */
				url: 7,
				/** Color-oriented keyboard layout */
				color: 8
			},
		
			/**
			 * Returns whether or not the virtual keyboard is currently displayed
			 * @return {boolean} Virtual keyboard visibility.
			 */
			isShowing: function() {
				return state.isShowing || false;
			},
		
			/**
			 * Shows the virtual keyboard
			 * @param {webOS.keyboard.types|number} [type=webOS.keyboard.types.text] - Type of virtual keyboard to display; from webOS.keyboard.types constants.
			 */
			show: function(type){
				if(this.isManualMode() && window.PalmSystem && PalmSystem.keyboardShow) {
					PalmSystem.keyboardShow(type || 0);
				}
			},
		
			/**
			 * Hides the virtual keyboard
			 */
			hide: function(){
				if(this.isManualMode() && window.PalmSystem && PalmSystem.keyboardHide) {
					PalmSystem.keyboardHide();
				}
			},
		
			/**
			 * Enables/disables manual mode for the virtual keyboard
			 * @param {boolean} mode - If true, keyboard must be manually forced shown/hidden. If false, it's automatic.
			 */
			setManualMode: function(mode){
				state.manual = mode;
				if(window.PalmSystem && PalmSystem.setManualKeyboardEnabled) {
					PalmSystem.setManualKeyboardEnabled(mode);
				}
			},
		
			/**
			 * Whether or not manual mode is set for the virtual keyboard
			 * @return {boolean} Manual mode status
			 */
			isManualMode: function(){
				return state.manual || false;
			},
		
			/**
			 * Force the virtual keyboard to show. In the process, enables manual mode.
			 * @param {webOS.keyboard.types|number} [type=webOS.keyboard.types.text] - Type of virtual keyboard to display; from webOS.keyboard.types constants.
			 */
			forceShow: function(inType){
				this.setManualMode(true);
				if(window.PalmSystem && PalmSystem.keyboardShow) {
					PalmSystem.keyboardShow(inType || 0);
				}
			},
		
			/**
			 * Force the virtual keyboard to hide. In the process, enables manual mode.
			 */
			forceHide: function(){
				this.setManualMode(true);
				if(window.PalmSystem && PalmSystem.keyboardHide) {
					PalmSystem.keyboardHide();
				}
			},

			/**
			 * Copies inText to system clipboard
			 * @param {string} inText - Text content to set into the clipboard
			 */
			setClipboard: function (inText) {
				if (!this._clipboardTextArea) {
					this._clipboardTextArea = document.createElement("textarea");
				}
				this._clipboardTextArea.value = inText;
				document.body.appendChild(this._clipboardTextArea);
				webOS.keyboard && webOS.keyboard.setManualMode(true); //suspend keyboard
				this._clipboardTextArea.select();
				document.execCommand("cut");
				this._clipboardTextArea.blur();
				webOS.keyboard && webOS.keyboard.setManualMode(false);
				document.body.removeChild(this._clipboardTextArea);
			},

			/**
			 * Gets what is stored in system clipboard and calls the supplied callback.
			 * @param {function} inCallback - Callback function to pass the clipboard text into.
			 */
			getClipboard: function (inCallback) {
				if (!this._clipboardTextArea) {
					this._clipboardTextArea = document.createElement("textarea");
				}
				document.body.appendChild(this._clipboardTextArea);
				this._clipboardTextArea.value = "";
				webOS.keyboard && webOS.keyboard.setManualMode(true); //suspend keyboard
				this._clipboardTextArea.select();
				this._clipboardTextArea.oninput = function () {
					inCallback(this._clipboardTextArea.value);
					// "hide the textarea until it is needed again.
					this._clipboardTextArea.value = "";
					this._clipboardTextArea.blur();
					webOS.keyboard && webOS.keyboard.setManualMode(false);
					document.body.removeChild(this._clipboardTextArea);
				}.bind(this);

				if (window.PalmSystem && PalmSystem.paste) {
					PalmSystem.paste();
				} else {
					document.execCommand("paste");
				}
			},

			/**
			 * Pastes any content in the clipboard.
			 */
			pasteClipboard: function() {
				if (window.PalmSystem && PalmSystem.paste) {
					PalmSystem.paste();
				}
			}
		};
	}

})();


/* ============================================================================
	Window Card APIs
 ============================================================================*/
(function() {

	webOS.window = {
		/**
		 * Returns the current launch parameters for the app
		 * @param {object} [inWindow=window] - A window object to reference from, otherwise current window.
		 * @return {object} Launch parameters
		 */
		launchParams: function(inWindow) {
			inWindow = inWindow || window;
			if(inWindow.PalmSystem) {
				return JSON.parse(inWindow.PalmSystem.launchParams || "{}") || {};
			}
			return {};
		},

		/**
		 * Whether a window is activated or not.
		 * @param {object} [inWindow=window] - A window object to reference from; if omitted, uses current window.
		 * @return {boolean} Activated status
		 */
		isActivated: function(inWindow) {
			inWindow = inWindow || window;
			if(inWindow.PalmSystem) {
				return inWindow.PalmSystem.isActivated;
			}
			return false;
		},

		/**
		 * Tell webOS to activate the current page of your app, bringing it into focus.
		 * @param {object} [inWindow=window] - A window object to reference from; if omitted, uses current window.
		 */
		activate: function(inWindow) {
			inWindow = inWindow || window;
			if(inWindow.PalmSystem && inWindow.PalmSystem.activate) {
				inWindow.PalmSystem.activate();
			}
		},

		/**
		 * Tell webOS to deactivate your app.
		 * @param {object} [inWindow=window] - A window object to reference from; if omitted, uses current window.
		 */
		deactivate: function(inWindow) {
			inWindow = inWindow || window;
			if(inWindow.PalmSystem && inWindow.PalmSystem.deactivate) {
				inWindow.PalmSystem.deactivate();
			}
		},

		/**
		 * Creates a child window in a new card.
		 * @param {string} [url] - URL for an HTML file to be loaded into the new card.
		 * @param {string} [html] - HTML code to inject into the new card's window.
		 * @return {object} Window object of the child window for the new card
		 */
		newCard: function(url, html) {
			if(!url && !(webOS.platform.legacy || webOS.platform.open)) {
				url = "about:blank";
			}
			var child = window.open(url);
			if(html) {
				child.document.write(html);
			}
			if(child.PalmSystem && child.PalmSystem.stageReady) {
				child.PalmSystem.stageReady();
			}
			return child;
		},

		/**
		 * Enable or disable full screen display.
		 * @param {boolean} state - Whether to enable or disable full screen mode
		 */
		setFullScreen: function(state) {
			// valid state values are: true or false
			if(window.PalmSystem && PalmSystem.enableFullScreenMode) {
				PalmSystem.enableFullScreenMode(state);
			}
		},

		/**
		 * Used to set the window properties of the WebOS application. Generally should not be needed by developers directly.
		 * @param {object} inWindow=window] - A window object to reference from; if omitted, uses current window.
		 * @param {object} inProps - Properties to apply to the app window. Valid properties include:
		 * @param {boolean} [inProps.blockScreenTimeout] - If true, the screen will not dim or turn off in the absence of user activity. If false, the timeout behavior will be reinstated.
		 * @param {boolean} [inProps.setSubtleLightbar] - If true, the light bar will be made somewhat dimmer than normal. If false, it will return to normal.
		 * @param {boolean} [inProps.fastAccelerometer] - If true, the accelerometer rate will increase to 30 hz; false by default, rate is at 4 hz. Note fast rate is active only for apps when maximized.
		 */
		setWindowProperties: function(inWindow, inProps) {
			if(arguments.length==1) {
				inProps = inWindow;
				inWindow = window;
			}
			if(inWindow.PalmSystem && inWindow.PalmSystem.setWindowProperties) {
				inWindow.webOS.window.properties = inProps = inProps || {};
				inWindow.PalmSystem.setWindowProperties(inProps);
			}
		},

		/**
		 * Used to get the window properties of the WebOS app. Generally should not be needed by developers directly.
		 * @param {object} [inWindow=window] - A window object to reference from; if omitted, uses current window.
		 * @return {object} Application window properties that have been set thus far.
		 */
		getWindowProperties: function(inWindow) {
			inWindow = inWindow || window;
			inWindow.webOS.window.properties = inWindow.webOS.window.properties || {};
			return inWindow.webOS.window.properties;
		},

		/**
		 * Enable or disable screen timeout. When enabled, the device screen will not dim.
		 * @param {boolean} state - Whether or not to block screen timeout
		 */
		blockScreenTimeout: function(state) {
			webOS.window.properties.blockScreenTimeout = state;
			this.setWindowProperties(navigator.windowProperties);
		},

		/**
		 * Sets the lightbar to be a little dimmer for screen locked notifications.
		 * @param {boolean} state - Whether or not to dim the lightbar
		 */
		setSubtleLightbar: function(state) {
			webOS.window.properties.setSubtleLightbar = state;
			this.setWindowProperties(webOS.window.properties);
		},
		
		/**
		 * Enable/disable fast accelerometer update rates.
		 * @param {boolean} state - When false, accelerometer updates at 4Hz; when enabled, updates at 30Hz
		 */
		setFastAccelerometer: function(state) {
			webOS.window.properties.fastAccelerometer = state;
			this.setWindowProperties(webOS.window.properties);
		}
	};

})();


/* ============================================================================
	Event API Setup
 ============================================================================*/
(function() {

	if(webOS.platform.legacy || webOS.platform.open || webOS.platform.luneos) {
		var fireDocumentEvent = function(type, data) {
			var evt = document.createEvent('HTMLEvents');
			evt.initEvent(type, false, false);
			for(var i in data) {
				if(data.hasOwnProperty(i)) {
					evt[i] = data[i];
				}
			}
			return document.dispatchEvent(evt);
		};

		// emulate webOSlaunch events on old devices
		var lp = webOS.window.launchParams();
		fireDocumentEvent("webOSLaunch", {detail:lp});

		window.Mojo.relaunch = function(e) {
			var lp = webOS.window.launchParams();
			if(lp['palm-command'] && lp['palm-command'] == 'open-app-menu') {
				// emulate "menubutton" event
				fireDocumentEvent("menubutton", {});
				return true;
			} else {
				// emulate "webOSRelaunch" event with parameters
				fireDocumentEvent("webOSRelaunch", {detail:lp});
			}
		};

		// clear any existing listeners; emulate page visibility events for card activate/deactivate
		window.onpageshow = window.onpagehide = window.onfocus = window.onblur = undefined;

		Mojo.stageActivated = function() {
			// fire "activate" event
			fireDocumentEvent("activate", {});

			// emulate "visibilitychange" event with parameters
			try {
				document.hidden = false;
				document.visibilityState = "visible";
				fireDocumentEvent("visibilitychange", {});
			} catch(e) {}
		};

		Mojo.stageDeactivated = function() {
			// fire "deactivate" event
			fireDocumentEvent("deactivate", {});

			// emulate "visibilitychange" event with parameters
			try {
				document.hidden = true;
				document.visibilityState = "hidden";
				fireDocumentEvent("visibilitychange", {});
			} catch(e) {}
		};


		// LunaSysMgr calls this when a KeepAlive app's window is shown
		// Only used by webOS builtin system apps
		Mojo.show = function() {
			// fire "appshow" event
			fireDocumentEvent("appshow", {});
		};
		
		// LunaSysMgr calls this when a KeepAlive app's window is hidden
		// Only used by webOS builtin system apps
		Mojo.hide = function() {
			// fire "appshow" event
			fireDocumentEvent("apphide", {});
		};
		
		// Applications that use significant memory can watch for this event and try to reduce
		// their memory usage when they see a non-normal state. This has a `state` property
		// with the value "low", "critical", or "normal".
		Mojo.lowMemoryNotification = function(params) {
			// fire "lowmemory" event
			fireDocumentEvent("lowmemory", {state: params.state});
		};
	}

})();


/* ============================================================================
	StageReady Initialization
 ============================================================================*/

//set the application to ready
if(window.PalmSystem && window.PalmSystem.stageReady) {
	window.addEventListener("load", function() {
		setTimeout(function () {
			window.PalmSystem.stageReady();
		}, 1);
	}, false);
}
