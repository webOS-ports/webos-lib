enyo.kind({
	name: "PortsHeader",
	kind: "onyx.Toolbar",
	classes: "ports-header",
	title: "WebOS Ports Header",
	taglines: [
		"Random Tagline Here.",
	],
	components:[
		{kind: "Image", src: "icon.png", style: "height: 100%; margin: 0;"},
		{tag: "div",
		style: "height: 100%; margin: 0 0 0 8px;",
		components: [
			{name: "Title",
			content: "",
			style: "vertical-align: top; margin: 0; font-size: 21px;"},
			{name: "Tagline",
			content: "",
			style: "display: block; margin: 0; font-size: 13px;"}
		]}
	],
	rendered: function() {
		this.inherited(arguments);
		this.$.Title.setContent(this.title);
		this.$.Tagline.setContent(this.currentTagline());
	},
	/**
		An explicit tagline set via setTagline() wins over the random pool, so a
		caller can use the subtitle line to show live status instead.
	*/
	currentTagline: function() {
		if (this.tagline) {
			return this.tagline;
		}
		return this.taglines[Math.floor(Math.random() * this.taglines.length)];
	},
	//* Replaces the tagline with fixed text. Pass a falsy value to go back to the random pool.
	setTagline: function(inText) {
		this.tagline = inText;
		if (this.$.Tagline) {
			this.$.Tagline.setContent(this.currentTagline());
		}
	}
});
