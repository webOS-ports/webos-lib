require('enyo-luneos');

var
	Control = require('enyo/Control'),
	FittableColumnsLayout = require('layout/FittableLayout').Columns,
	EnyoImage = require('enyo/Image');


module.exports = Control.kind({
	name: "luneos.CoreNavi",
	events: {
		onCoreNaviDragStart: "",
		onCoreNaviDrag: "",
		onCoreNaviDragFinish: ""
	},
	style: "background-color: black;",
	layoutKind: FittableColumnsLayout,
	fingerTracking: false, //Use legacy keyEvents by default, set to true to enable finger-tracking events
	showing: true,
	components:[
		{style: "width: 33%;"},
		{kind: EnyoImage,
		src: "@../images/lightbar.png",
		fit: true,
		style: "width: 33%; height: 24px; padding-top: 2px;",
		ondragstart: "handleDragStart",
		ondrag: "handleDrag",
		ondragfinish: "handleDragFinish"},
		{style: "width: 33%;"}
	],
	//Hide on hosts with a hardware gesture area
	create: function() {
		this.inherited(arguments);
		if(window.PalmSystem)
			this.showing = false;
	},
	//CoreNaviDrag Event Synthesis
	handleDragStart: function(inSender, inEvent) {
		//Back Gesture
		if(this.fingerTracking === false) {
			if(inEvent.xDirection == -1) {
				//Back Gesture
				var evB = document.createEvent("HTMLEvents");
				evB.initEvent("keyup", "true", "true");
				evB.keyCode = 27;
				evB.keyIdentifier = "U+1200001";
				document.dispatchEvent(evB);
			}
			else {
				//Forward Gesture
			}
		}
		else {
			//Custom drag event
			this.doCoreNaviDragStart(inEvent);
		}
	},
	handleDrag: function(inSender, inEvent) {
		if(this.fingerTracking === true) {
			//Custom drag event
			this.doCoreNaviDrag(inEvent);
		}
	},
	handleDragFinish: function(inSender, inEvent) {
		if(this.fingerTracking === true) {
			//Custom drag event
			this.doCoreNaviDragFinish(inEvent);
		}
	}
});
