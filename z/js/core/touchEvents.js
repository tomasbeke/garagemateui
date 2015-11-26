
(function() {
	var _issetup = null

	function setupPointerEvents() {
		'use strict';
		if (_issetup) {
			return
		}
		_issetup = true;
		//events swipedown swipeleft swipeup swiperight tap dbltap pointermove
		var doc = document,
			SWIPE_TRESHOLD = 80,
			TAP_TRESHOLD = 200,
			JUST_ON_TOUCH_DEVICES = 0,
			TAP_PRECISION = 60; //px by default
		if (typeof doc.createEvent !== 'function') return false; // no tap events here
		// helpers
		var __counter = 0,
			msPointerEnabled = !!navigator.pointerEnabled || navigator.msPointerEnabled,
			mousePos = $d.util.mousePos,
			toIgnore = [],
			baseObj = null,
			basefns = [],
			isTouch = (!!('ontouchstart' in window) && navigator.userAgent.indexOf('PhantomJS') < 0) || msPointerEnabled,
			ensureId = function(el) {
				if (!el) {
					return
				}
				if (!el.id && el.tagName) {
					el.id = "anon_" + el.tagName + (++__counter)
				}
				return el.id
			},
			byId = function byId(id) {
				if (!id) {
					return null
				}
				return typeof(id) == "string" ? document.getElementById(id) : (id.nodeType ? id : null)
			},
			makeEventObject = function(ev) {
				if (!baseObj) {
					baseObj = Object.create(null)
					baseObj.__byId = byId
					Object.defineProperty(baseObj, "touchTarget", {
						get: function() {
							var target, ev, d = this.__data;
							if (!(d && d.touchTarget)) {
								if (!(ev = this.originalEvent)) {
									return null
								};
								if (!d) {
									d = this.__data = {};
								}
								if (ev.changedTouches && ev.changedTouches.length) {
									target = ev.changedTouches[0]
								}
								if (!target && ev.targetTouches && ev.targetTouches.length) {
									target = ev.targetTouches[0]
								}
								if (!target && ev.touches && ev.touches.length) {
									target = ev.touches[0]
								}
								if (!target) {
									target = ev.target || ev.srcElement;
								}
								d.touchTarget = ensureId(target);
							}

							return byId(d.touchTarget);
						},
						set: function() {},
						enumerable: true,
						configurable: false
					});
					Object.defineProperty(baseObj, "mousePosition", {
						get: function() {
							var e, d;
							if (!(e = this.originalEvent)) {
								return null
							};
							d = this.__data || (this.__data = {});
							if (!d.pos) {
								$d.mousepos(e, d.pos = {});
							}
							return d.pos
						},
						set: function() {},
						enumerable: true,
						configurable: false
					});
					Object.defineProperty(baseObj, "x", {
						get: function() {
							return (this.mousePosition || {}).x
						},
						set: function() {},
						enumerable: true,
						configurable: false
					});
					Object.defineProperty(baseObj, "y", {
						get: function() {
							return (this.mousePosition || {}).y
						},
						set: function() {},
						enumerable: true,
						configurable: false
					});

					for (var k in ev) {
						if (k.toUpperCase() === k) {
							baseObj[k] = ev[k]
						} else if (typeof(ev[k]) == "function") {
							baseObj[k] = Function("var name='" + k + "',e=this.originalEvent;return  e && typeof(e[name])=='function' && e[name].apply(e,arguments)")
						} else if (ev[k] && ev[k].nodeType) {
							Object.defineProperty(baseObj, k, {
								get: Function("var name='" + k + "',d=this.__data;return d &d[name] && this.__byId(d[name])")
							});
						}
					}
				}
				var nu = Object.create(baseObj, {
					originalEvent: {
						value: ev,
						enumerable: false,
						writable: true
					}
				})
				return nu


			},
			msEventType = function(type) {
				var lo = type.toLowerCase(),
					ms = 'MS' + type;
				return navigator.msPointerEnabled ? ms : lo;
			},
			touchevents = {
				touchstart: msEventType('PointerDown') + ' touchstart',
				touchend: msEventType('PointerUp') + ' touchend',
				touchmove: msEventType('PointerMove') + ' touchmove'
			},
			setListener = function(elm, events, callback) {
				var eventsArray = events.split(' '),
					i = eventsArray.length;
				while (i--) {
					elm.addEventListener(eventsArray[i], callback, false);
				}
			},
			getPointerEvent = function(event) {
				return event.targetTouches ? event.targetTouches[0] : event;
			},
			sendEvent = function(elm, eventName, originalEvent, data) {

				var customEvent = doc.createEvent('Event');
				data = data || {};
				data.x = currX;
				data.y = currY;
				if (!data.distance) {
					var deltaY = cachedY - currY,
						deltaX = cachedX - currX
					data.distance = {
						x: Math.abs(deltaX),
						y: Math.abs(deltaY)
					}
				}
				customEvent.originalEvent = originalEvent;
				for (var key in data) {
					customEvent[key] = data[key];
				}
				customEvent.initEvent(eventName, true, true);
				customEvent.istouchEvent = true
				elm.dispatchEvent(customEvent);

			},
			onTouchStart = function(e) {
				var pointer = getPointerEvent(e)
				cachedX = currX = pointer.pageX; // caching the current x
				cachedY = currY = pointer.pageY; // caching the current y
				touchStarted = true; // a touch event is detected
				tapNum++;
				clearTimeout(tapTimer); // detecting if after 200ms the finger is still in the same position

				tapTimer = setTimeout(function() {
					if (
						cachedX >= currX - precision && cachedX <= currX + precision &&
						cachedY >= currY - precision && cachedY <= currY + precision &&
						!touchStarted
					) { // Here you get the Tap event
						e.istouchEvent = true
						sendEvent(e.target, (tapNum === 2) ? 'dbltap' : 'tap', e);
					}
					tapNum = 0;
				}, taptreshold);

			},
			onTouchEnd = function(e) {
				var dir = [],
					deltaY = cachedY - currY,
					deltaX = cachedX - currX;
				touchStarted = false;
				if (deltaX <= -swipeTreshold) {
					dir.push("right")
				}
				if (deltaX >= swipeTreshold) {
					dir.push("left")
				}
				if (deltaY <= -swipeTreshold) {
					dir.push("down")
				}
				if (deltaY >= swipeTreshold) {
					dir.push("right")
				}
				e.istouchEvent = true
				if (dir.length) {
					var data = {
						dir: dir,
						distance: {
							x: Math.abs(deltaX),
							y: Math.abs(deltaY)
						}
					}
					for (var i = 0; i < dir.length; i++); {
						sendEvent(e.target, "swipe" + dir[i], e, data);
					};
					sendEvent(e.target, "swipe", e, data);
				}
			},
			lastcheck = 0,
			mintime = 50,
			onTouchMove = function(e) {
				var pointer, ts = Date.now();
				if (ts - lastcheck < mintime) {
					return
				}
				if (!(pointer = getPointerEvent(e))) {
					return
				}
				currX = pointer.pageX;
				currY = pointer.pageY;

				lastcheck = ts;

				//console.log(currY,currX, e.target||"nitargt")
				e.istouchEvent = true
				sendEvent(e.target, "pointermove", e);
			},
			touchStarted = false, // detect if a touch event is sarted
			swipeTreshold = SWIPE_TRESHOLD || 80,
			taptreshold = TAP_TRESHOLD || 200,
			precision = TAP_PRECISION / 2 || 60 / 2, // touch events boundaries ( 60px by default )
			justTouchEvents = JUST_ON_TOUCH_DEVICES || isTouch,
			tapNum = 0,
			currX, currY, cachedX, cachedY, tapTimer;

		//setting the events listeners
		setListener(doc, touchevents.touchstart + (justTouchEvents ? '' : ' mousedown'), onTouchStart);
		setListener(doc, touchevents.touchend + (justTouchEvents ? '' : ' mouseup'), onTouchEnd);
		setListener(doc, touchevents.touchmove + (justTouchEvents ? '' : ' mousemove'), onTouchMove);
	}

	$d._setupPointerEvents =  function(el, type, fnct) {
		if (!_issetup) {
			setupPointerEvents()
		}
		if (typeof(el) == "function") {
			fnct = el;
			type = "pointermove";
			el = null;
		}
		if (typeof(type) == "function") {
			fnct = type;
			type = "pointermove";
		}
		var handlers={
			ontouchstart : function(fn) {var elem=this
				document.addEventListener("touchstart", function(ev) {
					if (!(ev.target && elem.contains && elem.contains(ev.target))) {
						return
					}
					fn.call(elem, ev)
				})
			},
			touchend : function(fn) {var elem=this
				document.addEventListener("touchend", function(ev) {
					if (!(ev.target && elem.contains && elem.contains(ev.target))) {
						return
					}
					fn.call(elem, ev)
				})
			},
			ontouchmove : function(fn) {var elem=this
				document.addEventListener("pointermove", function(ev) {
					if (!(ev.target && elem.contains && elem.contains(ev.target))) {
						return
					}
					fn.call(elem, ev)
				})
			}
		}
		var elem = el ? $d(el) : null
		if (elem) {
			$.extend(elem,handlers)

		} else {
			if (typeof(type) == "string" && typeof(fnct) == "function") {
				document.addEventListener(type, fnct);
			}
		}

		return elem
	}
}());
