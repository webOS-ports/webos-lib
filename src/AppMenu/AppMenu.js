require('enyo-luneos');

var
	Menu = require('onyx/Menu'),
	MenuItem = require('onyx/MenuItem'),
	Signals = require('enyo/Signals');

var AppMenuItem = MenuItem.kind({
	name: "luneos.AppMenuItem",
	classes: "enyo-item"
});

module.exports = Menu.kind({
	name: "luneos.AppMenu",
	classes: "enyo-appmenu",
	style: "overflow: hidden;",
	defaultKind: AppMenuItem,
	published: {
		maxHeight: 400
	},
	components: [
		{
			kind: Signals,
			onmenubutton: "toggle"
		}
	],
	//* @public
	toggle: function() {
		// if we're visible, hide it; else, show it
		if (this.showing)
			this.hide();
		else
			this.show();
	},
	//* @public
	show: function() {
		var height = 30 * this.controls.length - 1; /* take the scroller out of the equation */
		
		if (height > this.maxHeight) {
			height = this.maxHeight;
		}
		
		this.setBounds({
			height: height
		});
		this.inherited(arguments);
	},
	//* @private
	maxHeightChanged: function() {
		// if this is currently visible, go ahead and call show() to update the height if necessary
		if (this.showing) {
			this.show();
		}
	}
});

module.exports.Item = AppMenuItem;
