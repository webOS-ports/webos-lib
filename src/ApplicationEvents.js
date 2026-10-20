require('enyo-luneos');

/**
	A convenient kind that is simply an <a href="#enyo/Signals">enyo/Signals</a> with all the various
	webOS-specific events outline.
	
	Admittedly this mostly helps with webOS event documentation and keeping
	track of what's available to listen for.
*/

var Signals = require('enyo/Signals');

Signals.kind({
	name: "luneos.ApplicationEvents",
	/**
		Sent when an app is launched; may occur before or after DOM load events.
		The event data will contain `webOS.window.launchParams()`.
	*/
	onwebOSLaunch: "",
	/**
		Sent when the app is relaunched (when the app is running but app attempts
		to be launched again).  The event data will contain `webOS.window.launchParams()`.
	*/
	onwebOSRelaunch: "",
	//* Sent when the card window is activated.
	onactivate: "",
	//* Sent when the card window is deactivated.
	ondeactivate: "",
	/**
		Sent when the back gesture is performed or the ESC key is pressed.
		The originating keyup event data is passed for potential `preventDefault()`
		usage.
	*/
	onbackgesture: "",
	//* Sent when the app menu is toggled.
	onmenubutton: "",
	/**
		Sent when the webOS virtual keyboard is opened or closed. Event data includes
		a _"showing"_ property that will be either _true_ or _false_.
	*/
	onvirtualkeyboard: "",
	/**
		Sent periodically and can be used to watch for significant memory usage by
		the application. Event data includes a _"state"_ property with the value
		_"low"_, _"critical"_, or _"normal"_.
	*/
	onlowmemory: ""
});
