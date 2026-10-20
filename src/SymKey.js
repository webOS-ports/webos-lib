require('enyo-luneos');

/**
	Static symkey functionality for webOS 1.x and 2.x.
	
	When the symkey on the physical keyboard is pressed, this properly opens the
	symtable within webOS.  Automatically opens on the symkey, but can also be
	manually activated from `showSymTable()`.
*/

var
	Component = require('enyo/Component'),
	Signals = require('enyo/Signals'),
	ServiceRequest = require('enyo-webos/ServiceRequest'),
	platform = require('enyo/platform');


var SymKey = Component.kind({
	name: "luneos.SymKey",
	//* @protected
	components: [
		{kind:Signals, onkeydown:"keydown", onwebOSRelaunch:"relaunch"}
	],
	//* @public
	//* Opens the webOS symtable popup.
	show: function(target) {
		this.symKeyTarget = target || document;
        this.request = new ServiceRequest({
			service: "palm://com.palm.applicationManager",
			method: "launch"
		});
		this.request.error(this, "serviceFailure");
		this.request.go({
			"id":"com.palm.systemui",
			"params": {
				"action":"showAltChar"
			}
		});
	},
	//* @protected
	keydown:function(inSender, inEvent) {
		if(inEvent.keyCode === 17) {
			this.show(inEvent.target);
		}
	},
	serviceFailure: function(inSender, inError) {
		this.log(inError.errorText || "Unable to show symkey interface");
	},
	relaunch: function(inSender, inEvent) {
		var altCharSelected = inEvent.detail.altCharSelected;
		if(!altCharSelected) {
			return false;
		}

		var selection, charCode;
		// Put the text into the editable element
		selection = window.getSelection();
		// make sure there are any available range to index as
		// getRangeAt does not protect against that
		if (selection && selection.rangeCount > 0 && selection.getRangeAt(0)) {
			document.execCommand("insertText", true, altCharSelected);
		}

		// Fire off our fake events
		charCode = altCharSelected.charCodeAt(0);
		this.sendFakeKey("keydown", charCode);
		this.sendFakeKey("keypress", charCode);
		this.sendFakeKey("keyup", charCode);
	},
	sendFakeKey: function(eventType, charCode) {
		var e = document.createEvent("Events");
		e.initEvent(eventType, true, true);

		e.keyCode = charCode;
		e.charCode = charCode;
		e.which = charCode;

		this.symKeyTarget.dispatchEvent(e);
		return e;
	}
});
var SymKeyStatic = new SymKey();


//* @public
/**
	Opens the webOS symtable popup on webOS 1.x and 2.x devices.
	
	Should rarely ever need to be manually called, as it is called by default whenever
	the symkey on the physical keyboard is pressed.
	
	The optional _target_ parameter specifies the target editable element that will
	receive the key input events. Default, if not specified, is `document`.
*/
module.exports = {
	showSymTable: function(target) {
		if(platform.webos && platform.webos < 3) {
			SymKeyStatic.show(target);
		}
	}
};
