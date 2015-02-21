/**
 * Syntactical sugar for a Control with `allowHtml:true`.
 * Like the Enyo 1 Control of the same name.
 */

enyo.kind({
	name: "enyo.HtmlContent",
	kind: enyo.Control,
	tag: "div",
	allowHtml: true
});