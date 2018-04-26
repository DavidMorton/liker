var event = new MouseEvent('focus', {
	view: window,
	bubbles: true,
	cancelable: true
  });

var cb = document.getElementsByClassName('_avvq0')[0]; 
var cancelled = !cb.dispatchEvent(event);
cb.value = "#architecture"

var evt = document.createEvent("KeyboardEvent");
var initMethod = typeof evt.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";

evt[initMethod](
                   "keypress", // event type : keydown, keyup, keypress
                    true, // bubbles
                    true, // cancelable
                    window, // viewArg: should be window
                    false, // ctrlKeyArg
                    false, // altKeyArg
                    false, // shiftKeyArg
                    false, // metaKeyArg
                    13, // keyCodeArg : unsigned long the virtual key code, else 0
                    0 // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0
);

var canceled = !cb.dispatchEvent(evt);