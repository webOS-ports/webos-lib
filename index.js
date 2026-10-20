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
	'menubutton',
	'virtualkeyboard',
	'appshow',
	'apphide',
	'lowmemory'
];
for (var i=0, e; (e=wev[i]); i++) {
	document.addEventListener(e, utils.bind(Signals, 'send', 'on' + e), false);
}

exports.version = '2.6.0-rc.1';
