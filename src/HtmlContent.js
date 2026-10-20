/**
 * Syntactical sugar for a Control with `allowHtml:true`.
 * Like the Enyo 1 Control of the same name.
 */

var Control = require('enyo/Control');

module.exports = Control.kind({
	name: "luneos.HtmlContent",
	tag: "div",
	allowHtml: true
});