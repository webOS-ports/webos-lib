var
	utils = require('enyo/utils'),
	Signals = require('enyo/Signals');

require('enyo-webos');
require('./LuneOS/LuneOS');

// Listens for LuneOS-specific events
var wev = [
	'activate',
	'deactivate',
	'backgesture',
	'virtualkeyboard',
	'appshow',
	'apphide',
	'lowmemory'
];
for (var i=0, e; (e=wev[i]); i++) {
	document.addEventListener(e, utils.bind(Signals, 'send', 'on' + e), false);
}
// enyo-webos already sends onmenubutton for "menubutton" unless Cordova is loaded. Sending it here
// as well delivered every tap twice, so a toggle such as AppMenu's opened and closed at once.
if (global.cordova) {
	document.addEventListener('menubutton', utils.bind(Signals, 'send', 'onmenubutton'), false);
}

exports.version = '2.6.0-rc.1';
