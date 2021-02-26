# TransitionEnd
[![Build
Status](https://travis-ci.org/EvandroLG/transitionEnd.svg?branch=master)](https://travis-ci.org/EvandroLG/transitionEnd)

TransitionEnd is an agnostic and cross-browser library to work with event transitionend.

## Browser Support
![Chrome](https://raw.github.com/alrra/browser-logos/master/chrome/chrome_48x48.png) |
![Firefox](https://raw.github.com/alrra/browser-logos/master/firefox/firefox_48x48.png) |
![IE](https://raw.github.com/alrra/browser-logos/master/internet-explorer/internet-explorer_48x48.png) |
![Opera](https://raw.github.com/alrra/browser-logos/master/opera/opera_48x48.png) |
![Safari](https://raw.github.com/alrra/browser-logos/master/safari/safari_48x48.png)
--- | --- | --- | --- | --- |
1.0+ ✔ | 4.0+ ✔ | 10+ ✔ | 10.5 ✔ | 3.2+ ✔ |

## Methods
* transitionEnd(element).<code>bind(callback)</code>
* transitionEnd(element).<code>unbind()</code>
* transitionEnd(element).<code>whichTransitionEnd()</code>

**Examples**
```js
var box = $("#box"); // or document.getElementById("box")
var foo = $("#foo");

transitionEnd(box).bind(function(){
	foo.addClass("on");
	transitionEnd(box).unbind();
});

var transition = transitionEnd(box).whichTransitionEnd(); // return for example "webkitTransitionEnd"
```
