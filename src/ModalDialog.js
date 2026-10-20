/**
 * Syntactical sugar for a modal onyx.Popup
 */

var Popup = require('onyx/Popup');

module.exports = Popup.kind({
	name: "luneos.ModalDialog",
	modal: true,
	autoDismiss: false,
	openAtCenter: function() {
		this.setCentered(true);
		this.show();
	}
});
