#webos-lib

*A selection of enyo2 kinds to restore functionality missing from enyo1*
*Unified from webos-ports-lib, webOS-Ext & enyo1-to-enyo2 kinds by ShiftyAxel, Jason Robitaille and Arthur Thornton*

##BackGesture

A function that listens for the webOS Back Gesture and fires the onbackbutton signal. Both 2.x and Open webOS are supported, as well as phonegap and the Esc key on desktop browsers.

**Example:**

     {kind: "enyo.Signals", onbackbutton: "handleBackGesture"}
     
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

##CrossAppUI

Ported from the non-published set of Enyo 1 APIs to Enyo2, CrossAppUI takes a 'path' parameter (the HTML file to open) and displays it inside your application.
The child application can pass stringified JSON prefixed with 'enyoCrossAppResult=' up to the CrossAppUI via the 'message' event (window scope). CrossAppUI will strip off the prefix, parse it into an object and fire onResult. This is intended to be used as a base class for app-in-app kinds, such as FilePicker (see below).

**message Event Example:**
     "enyoCrossAppResult={\"result\":[{\"fullPath\":\"/path/to/selected/file.foo\",\"iconPath\":\"/var/luna/extractfs//path/to/selected/file.foo:0:0:\",\"attachmentType\":\"image\",\"dbId\":\"++ILuOICkjNDQaUP\"}]}"

**Corresponding onResult Output:**
     {"fullPath":"/path/to/selected/file.foo","iconPath":"/var/luna/extractfs//path/to/selected/file.foo:0:0:","attachmentType":"image","dbId":"++ILuOICkjNDQaUP"}

**Example:**

     {kind:"CrossAppUI", style: "width: 100%; height: 100%;", path: "/path/to/app/html.html", onResult: "handleResult"}

##FilePicker

Ported across from Enyo 1, this is a CrossAppUI kind that points to the built-in webOS filepicker. The onPickFile event is called when the file is chosen.

**onPickFile Output:**
     {"fullPath":"/path/to/selected/file.foo","iconPath":"/var/luna/extractfs//path/to/selected/file.foo:0:0:","attachmentType":"image","dbId":"++ILuOICkjNDQaUP"}

**Example:**
     {name: "ImagePicker", kind: "FilePicker", fileType:["image"], onPickFile: "selectedImageFile"}
