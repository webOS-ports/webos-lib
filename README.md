#webos-lib

*A selection of enyo2 kinds to restore functionality missing from enyo1*

**For Enyo 2.5 and lower, use this.  For Enyo 2.7 and higher, use [enyo-luneos](https://github.com/JayCanuck/enyo-luneos.git)
by Jason Robitaille**

*Unified from webos-ports-lib, webOS-Ext & enyo1-to-enyo2 kinds by ShiftyAxel, Jason Robitaille and Arthur Thornton*

**Full documentation can be found at [http://webos-ports.github.io/webos-lib/](http://webos-ports.github.io/webos-lib/)**

##AppMenu

Ported from Enyo 1, the AppMenu kind will replicate the behavior of the standard app menu shown in webOS apps. This will have a slightly different style, though, since it uses onyx.Menu as opposed to a custom background image.

**Example:**

	{kind:"AppMenu", onSelect: "appMenuItemSelected", components: [{content:"Do something", ontap: "doSomething"}]}

##ApplicationEvents

A convenient subkind of _enyo.Signals_ that outlines all of the webOS-specific events from webos-lib.

**Example:**

     {kind: "enyo.ApplicationEvents", onbackbutton: "handleBackGesture", onactivate: "handleActivate", ondeactivate: "handleDeactivate", onmenubutton: "handleMenuButton", onrelaunch: "handleRelaunch", onlowmemory:"handleLowMemory", onvirtualkeyboard: "handleVirtualKeyboard"}


##BackGesture

A function that listens for the webOS Back Gesture and fires the onbackbutton signal. Both 2.x and Open webOS are supported, as well as phonegap and the Esc key on desktop browsers.

You don't instantiate this in your app, you listen with an enyo.Signals (or enyo.ApplicationEvents).

**Example:**

     {kind: "enyo.Signals", onbackbutton: "handleBackGesture"}

	 
##CoreNavi

An in-app gesture area that can be used for debugging. Emulates the Open webOS back gesture by default, set fingerTracking to true in order to emulate the new Finger Tracking API events. Only shows itself on non-palm platforms, so it's safe to ship with your app.

     //KeyUp-based Gesture
     components: [
     	{kind: "Signals", onkeyup: "handleKeyUp"},
     	{kind: "CoreNavi", fingerTracking: false}
     ],
     handleKeyUp: function(inSender, inEvent) {
	if(inEvent.keyIdentifier == "U+1200001") {
		//Do Stuff
	}
     }
     
     //Finger Tracking API
     components: [
     	{kind: "Signals",
	onCoreNaviDragStart: "handleCoreNaviDragStart",
	onCoreNaviDrag: "handleCoreNaviDrag",
	onCoreNaviDragFinish: "handleCoreNaviDragFinish"}
     	{kind: "Panels",
     	arrangerKind: "CarouselArranger",
     	components:[
     		{content: "Foo"},
     		{content: "Bar"},
     		{content: "DecafIsBad"},
     	]},
     	{kind: "CoreNavi", fingerTracking: true}
     ],
     handleCoreNaviDragStart: function(inSender, inEvent) {
     	this.$.CoreNaviPanels.dragstartTransition(inEvent);
     },
     handleCoreNaviDrag: function(inSender, inEvent) {
     	this.$.CoreNaviPanels.dragTransition(inEvent);
     },
     handleCoreNaviDragFinish: function(inSender, inEvent) {
     	this.$.CoreNaviPanels.dragfinishTransition(inEvent);
     },
	

**Example:** 	 
	 
##CrossAppUI

Ported from the non-published set of Enyo 1 APIs to Enyo2, CrossAppUI takes a 'path' parameter (the HTML file to open) and displays it inside your application.
The child application can pass stringified JSON prefixed with 'enyoCrossAppResult=' up to the CrossAppUI via the 'message' event (window scope). CrossAppUI will strip off the prefix, parse it into an object and fire onResult. This is intended to be used as a base class for app-in-app kinds, such as FilePicker (see below).

Requires enyo.ServiceRequest, from the enyo-webos library.

**message Event Example:**

     "enyoCrossAppResult={\"result\":[{\"fullPath\":\"/path/to/selected/file.foo\",\"iconPath\":\"/var/luna/extractfs//path/to/selected/file.foo:0:0:\",\"attachmentType\":\"image\",\"dbId\":\"++ILuOICkjNDQaUP\"}]}"

**Corresponding onResult Output:**

     {"fullPath":"/path/to/selected/file.foo","iconPath":"/var/luna/extractfs//path/to/selected/file.foo:0:0:","attachmentType":"image","dbId":"++ILuOICkjNDQaUP"}

**Example:**

     {kind:"CrossAppUI", style: "width: 100%; height: 100%;", path: "/path/to/app/html.html", onResult: "handleResult"}

##FilePicker

Ported across from Enyo 1, this is a CrossAppUI kind that points to the built-in webOS filepicker. The onPickFile event is called when the file is chosen.

Requires enyo.ServiceRequest, from the enyo-webos library.


**onPickFile Output:**

     {"fullPath":"/path/to/selected/file.foo","iconPath":"/var/luna/extractfs//path/to/selected/file.foo:0:0:","attachmentType":"image","dbId":"++ILuOICkjNDQaUP"}

**Example:**

     {name: "ImagePicker", kind: "FilePicker", fileType:["image"], onPickFile: "selectedImageFile"}

##HtmlContent

Syntactical sugar for a Control with `allowHtml:true`.
Like the Enyo 1 Control of the same name.

**Example:**

	{kind:"HtmlContent", content:"This content is<br />separated by an HTML line break (&lt;br /&gt;) tag"}

##LunaBindings

Binds LunaSysMgr application events to Enyo signals.
	
>_onactivate_: When the window is activated<br>
>_ondeactivate_: When the window is deactivated<br>
>_onmenubutton_: When the app menu is toggled<br>
>_onrelaunch_: When the app is relaunched<br>
>_onlowmemory_: To monitor for high memory usage<br>

You don't instantiate this in your app, you listen with an enyo.Signals (or enyo.ApplicationEvents).

**Example:**

	{kind: "enyo.Signals", onactivate: "handleActivate", ondeactivate: "handleDeactivate", onmenubutton: "handleMenuButton", onrelaunch: "handleRelaunch", onlowmemory:"handleLowMemory"}

##ModalDialog

Another kind ported from Enyo 1, this is an onyx.Popup that has `modal:true` and `autoDismiss:false` set to act like a modal dialog

**Example:**

	{name: "myDialog", kind:"ModalDialog", components[/* your components */, { kind: onyx.Button, content: "Close popup", ontap: "closePopup"}]}
	closePopup: function() {this.$.myDialog.hide()};

##PalmService

_enyo.PalmService_ has been removed, in favor of enyo.LunaService in enyo-webos. 
Your onResponse and onError functions must check the fields of inResponse, rather than inResponse.data.

	
##PortsHeader

An onyx.Toolbar that displays the app icon, a custom title and an optional random tagline.

**Example:**

     {kind: "PortsHeader",
     title: "FooApp",
     taglines: [
          "My foo-st app",
          "Banana boat.",
          "Fweeeeeeep. F'tang."
     ]}

##PortsSearch

A variant of the PortsHeader that contains an animated, expandable search bar. onSearch is fired based on the 'instant' member variable. If true, it will fire every time the text is changed, otherwise it will fire when the user presses enter or the field loses focus after modification. Setting the 'submitCloses' variable to true will close the search box in this situation.

**Example:**

     {kind: "PortsSearch",
     title: "SearchyFooApp",
     instant: false,
     submitCloses: true,
     taglines: [
          "My foo-st app",
          "Banana boat.",
          "Fweeeeeeep. F'tang."
     ],
     onSearch: "searchFieldChanged"}	

	 
##ProgressOrb

A circular variant of the onyx progress bar with an button in the center. Uses an enyo.Animator for smooth transitions between values.
Published properties are value, min and max.
This is an enyo2 reimagining of the progress indicator from the webOS 2.x Browser.

**Example:**

     {name: "FooOrb",
     kind: "ProgressOrb",
     style: "position: absolute; right: 8px; bottom: 8px;",
     content: "O",
     onButtonTap: "buttonTapped"},
     buttonTapped: function(inSender, inEvent) {
	this.$.FooOrb.setValue(this.$.FooOrb.value + 100);
     },

##ServiceRequest

_enyo.ServiceRequest has been removed, in favor of enyo.ServiceRequest in enyo-webos.
That should be a drop-in replacement


##SymKey

Static symkey functionality for webOS 1.x and 2.x.
	
When the symkey on the physical keyboard is pressed, this properly opens the
symtable within webOS.  Automatically opens on the symkey, but can also be
manually activated from `webos.showSymTable()`.

Requires enyo.ServiceRequest, from the enyo-webos library.


##VirtualKeyboard

Collection of static webOS virtual keyboard functions and constants.	
Sends an _onvirtualkeyboard_ signal that you can listen for.

**Example:**

	{kind: "enyo.Signals", onvirtualkeyboard: "handleVirtualKeyboard"}

##WebView

This is a port of code from Enyo 1 to Enyo 2 to enable the use of a WebView widget
(think of it like an iframe) inside an Enyo app on webOS. This uses Enyo 1 code and
was slightly modified to enable it to work with Enyo 2. For complete documentation,
refer to [this document](https://developer.palm.com/content/api/reference/enyo/enyo-api-reference.html#enyo.WebView)
(ignore the Inheritance section and all other kinds)

##webos.js

A collection of static variables and functions core to webOS functionality
and the webOS feature-set. A large amount of PalmSystem bindings combined
with some utility functions.
