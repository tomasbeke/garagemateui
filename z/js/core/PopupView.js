( function() {
	function showArrow(config) {

		//&dtrif;
		if (!(config.options.showarrow || config.options.showArrow || config.options.anchorPos == "pointer")) {
			if (config.arrow && config.arrow.style) {
				config.arrow.style.display = "none"
			}
			return
		}
		var pos = ""
		var d = config.el, anchor = config.options.anchor, optns = config.options
		var anchorpos = {}, b = d.getBoundingClientRect()
		if (anchor && anchor.getBoundingClientRect) {
			anchorpos = anchor.getBoundingClientRect()
		} else {
			if (anchor.height && anchor.width) {
				anchorpos = anchor
			}
			else {
				return
			}
		}
		if (b.left < anchorpos.right && b.right > anchorpos.left) {
			if ((b.bottom - 10) <= anchorpos.top) {
				pos = "d"
			} else if ((b.top + 10) > anchorpos.bottom) {
				pos = "u"
			}
		} else if (b.bottom > anchorpos.top && b.top < anchorpos.bottom) {
			if ((b.right - 10) <= anchorpos.left) {
				pos = "r"
			} else if ((b.left + 10) > anchorpos.right) {
				pos = "l"
			}
		}
		if (pos) {
			//d.style.padding="18px"
			if (!config.arrow) {
				config.arrow = config.el.appendChild(document.createElement("div"))
			}
			config.arrow.style.display = "block"
			config.arrow.className = "anchor-arrow pos-" + pos
			config.arrow.innerHTML = "&" + pos + "trif;"
			config.arrow.style.removeProperty("left")
			config.arrow.style.removeProperty("right")
			config.arrow.style.removeProperty("top")
			config.arrow.style.removeProperty("bottom")
			var bg = document.defaultView.getComputedStyle(config.content)["backgroundColor"]
			if (!bg || bg == "rgba(0, 0, 0, 0)" || bg == "inherit") {
				if (config.content.firstElementChild) {
					bg = document.defaultView.getComputedStyle(config.content.firstElementChild)["backgroundColor"]
				}
			}
			bg = String(bg).trim()
			if (bg == "rgb(255, 255, 255)" || bg == "#FFFFFF" || bg == "#ffffff") {
				bg = "#111111"
			}

			if (pos == "l" || pos === "r") {
				var t = Math.min(b.height - 0, Math.max(10, anchorpos.top - b.top))
				config.arrow.style.top = (t + (anchorpos.height / 2)) + "px"
			}
			if (pos == "u" || pos === "d") {
				if (anchorpos.width > b.width) {
					config.arrow.style.left = ((b.width / 2) - 10) + "px"
				} else {
					var l = Math.min(b.width - 20, Math.max(10, anchorpos.left - b.left))
					config.arrow.style.left = Math.min(b.width - 20, (l + (anchorpos.width / 2))) + "px"
				}

			}
			/*if(pos=="l"){
			 config.arrow.style.padding="0 0 0 20px"
			 } else if(pos=="r"){
			 config.arrow.style.padding="0 20px 0 0 "
			 } else if(pos=="u"){
			 config.arrow.style.padding="20px 0 0 0 "
			 } else if(pos=="d"){
			 config.arrow.style.padding="0 0 20px 0 "
			 }*/
			config.arrow.style.color = bg
		} else {
			d.style.padding = "0"
			if (config.arrow) {
				config.arrow.style.display = "none"
			}
		}
	}

	function applyRect(force) {
		var contentcss = {}, css = {}, lastdims = this.__lastdims
		if (this.rect) {
			this.rect.applyConstrains()
			var dims = this.rect.uuid();
			if (!force && lastdims && lastdims == dims) {
				return
			}
			this.__lastdims = dims;
			if (this.rect.get("height")) {
				contentcss.height = this.rect.get("height")
			}
			if (this.rect.get("width")) {
				contentcss.width = this.rect.get("width")
			}
			if (this.rect.get("top")) {
				css.top = this.rect.get("top")
			}
			if (this.rect.get("left")) {
				css.left = this.rect.get("left")
			}
			this.el.css(css)
			this.contentWrap.css(contentcss)
		}
	}

	function adjustpos(config, applyclip) {
		if(config.options.positionClass){
			return
		}
		var d = config.el, anchor = config.options.anchor, optns = config.options, vp = config.options.container ? $d(config.options.container).bounds() : $.viewport
		var b = d.getBoundingClientRect(), x = vp.width - b.right, y = vp.height - b.bottom;

		if (!$d.isVisible(d, true) || config.options.centered || config.options.centerX || config.options.centerx || config.options.centery || config.options.centerY) {
			return
		}
		var offset = config.options.offset || 1
		var anchorB = anchor ? (anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : anchor) : null
		if (!anchorB && anchor && anchor.height && anchor.width) {
			anchorB = anchor
		}
		if (!anchorB) {
			return
		}
		if (x < 0 || b.left < 1) {
			if (b.left < 1) {
				this.rect.left = offset
			}
			else {
				this.rect.left = Math.max(1, (b.left + x) - offset)
			}
			//d.style.left=Math.max(1,b.left+x)+"px"
		}
		if (config.options.container && vp.bottom < anchorB.bottom) {

		}
		if (y < 1 || b.top < 1) {
			if (b.top < 1) {
				this.rect.top = offset
			}
			else {
				this.rect.top = Math.max(offset, (b.top + y) - offset)
			}
			var diff = $d(d).bounds().bottom - ($.viewport.height - offset)
			if (diff > 1) {
				if (!optns.top) {
					this.rect.top = ($d(d).bounds().top - (diff))
				}
				else {
					this.rect.height = ($d(config.content).bounds().height - (diff))
				}
			}
		}
		applyRect.call(this)
		/*if(applyclip===true){
		 d.style.clip='rect('+[0,(b.width+10),(b.height+10),0].map(function(a){return a && !isNaN()?(a+"px"):a}).join(", ")+")"
		 //d.__clipper.update([0,(b.width+10),(b.height+10),0]).applyCss()
		 }*/
		return anchorB
	}

	var scrollHandle = null

	function resizepopup(config) {
		var d = config.content, el = config.el, vp = $.viewport, vw = this
		if (d.__dragging) {
			return
		}
		var curr = d.getBoundingClientRect(), curpos = null, innerH = vp.height, innerW = vp.width, cnt = 0
		$d.trackMouse(
			{
				move: function (ev) {
					var nu = {width: (curr.width + ev.delta.x), height: (curr.height + ev.delta.y)}
					if (cnt > 1 && (nu.height < 1 || nu.width < 1)) {
						if (nu.height < 1) {
							var t = curr.top + (nu.height - 1)
							nu.height = Math.abs(nu.height) + 1
							el.style.top = t + "px"
						}
						if (nu.width < 1) {
							var l = curr.left + (nu.width - 1)
							nu.width = Math.abs(nu.width) + 1
							el.style.left = l + "px"
						}
					}
					cnt++
					$d.css(d, {width: Math.abs(nu.width) + "px", height: Math.abs(nu.height) + "px"})
				},
				end: function (ev) {
					vw.rect.top = d.style.top
					vw.rect.left = d.style.left
					showArrow.call(vw, config)
					vw.fire("resize")
				}
			})

	}

	function dragpopup(config) {
		var d = config.el, rect = this.rect, vw = this
		if (d.__dragging) {
			return
		}
		$d.trackMouse(
			{
				applyElPos: true, translate: true, target: d, end: function (ev) {
				showArrow.call(vw, config)
			}
			}
		)

	}

	function centerpopup(config) {
		var d = config.el, b = d.getBoundingClientRect(), vp = $.viewport, innerH = vp.height, innerW = vp.width;

		if (b.height + 10 > innerH) {
			config.content.style.height = (innerH - 10) + "px"
			b = d.getBoundingClientRect()
		}
		if (b.width + 10 > innerW) {
			config.content.style.width = (innerW - 10) + "px"
			b = d.getBoundingClientRect()
		}
		$d.addClass(d, "center-center")

		//d.style.left=((innerW- b.width)/2)+"px"
		//d.style.top=((innerH- b.height)/2)+"px"

	}

	function parseAlignment(aligna) {
		var alignX = "", alignY = "", ret = {y: "", x: ""}
		if (Array.isArray(aligna)) {
			alignX = aligna[0]
			alignY = aligna[1]
		} else if (aligna == "below") {
			ret.below = true
			alignY = "bottom"
			alignX = "left"
		} else if (aligna == "above") {
			alignY = "top"
			alignX = "left"
		} else if (typeof(aligna) == "string") {
			if (aligna == "c" || aligna == "center") {
				ret.center = true
			}
			else if (aligna.length == 2) {
				aligna.indexOf("t") >= 0 && (alignY = "top");
				aligna.indexOf("b") >= 0 && (alignY = "bottom");
				aligna.indexOf("l") >= 0 && (alignX = "left");
				aligna.indexOf("r") >= 0 && (alignX = "right");
			} else {
				var alignalc = aligna.toLowerCase()
				alignalc.indexOf("top") >= 0 && (alignY = "top");
				alignalc.indexOf("bottom") >= 0 && (alignY = "bottom");
				alignalc.indexOf("left") >= 0 && (alignX = "left");
				alignalc.indexOf("right") >= 0 && (alignX = "right");
			}
		}
		ret.x = alignX;
		ret.y = alignY;
		return ret
	}

	function pospopup(config) {
		var anchorB = {left: 0, top: 0, height: 0, width: 0}, ths = this, x, y
		var d = config.el, optns = config.options, anchor = optns.anchor, w;
		if (!d) {
			return
		}
		if (optns.container && optns.container !== document.body) {
			$d.css(config.el, "position", "absolute")
		}
		;
		var C = {};
		"top left width height maxHeight maxWidth minHeight minWidth".split(" ").forEach(function (k) {
			var v = optns[k]
			if (typeof(v) == "function") {
				v = v.call(ths, anchorB)
			}
			if (typeof(v) == "number") {
				if (k.indexOf("max") == 0 || k.indexOf("min") == 0) {
					C[k.substr(3).toLowerCase()] || (C[k.substr(3).toLowerCase()] = {})
					C[k.substr(3).toLowerCase()][k.substr(0, 3)] = v
					config.content.style[k] = isNaN(v) ? v : (v + "px")
				} else {
					this.rect[k] = v;
				}
			}

		}, this);
		var  forcecss, x, y,arowht = 0,w = optns.width
		this.rect.setConstrain(C);
		if(!config.options.positionClass){
			if (optns.top || optns.left) {
				y = optns.top
				x = optns.left
			} else {
				if (optns.anchorPos == "pointer") {
					optns.anchor = anchor = anchor || [].slice.call(document.querySelectorAll(":hover")).pop()
					optns.showarrow = true
				}
				if (!anchor || config.options.centered) {
					return centerpopup(config)
				}

				if (anchor && anchor.getBoundingClientRect) {
					anchorB = anchor.getBoundingClientRect()
				} else if (anchor && ("x" in anchor || "y" in anchor)) {
					if (anchor.x != null) {
						anchorB.left = anchor.x;
					}
					if (anchor.y != null) {
						anchorB.top = anchor.y
					}
				} else if (anchor && anchor.height && anchor.width) {
					anchorB = anchor
				} else {
					return

				}
				;
				if (!optns.maxHeight && config.content && config.content.style["maxHeight"]) {
					config.content.style.removeProperty("maxHeight");
				}

				x = anchorB.left;y = anchorB.top
				var aligna = config.options.alignAnchor || ""
				var align = parseAlignment(aligna), viewport = $.viewport
				var showarrow;
				if (config.options.showarrow || config.options.showArrow || config.options.anchorPos == "pointer") {
					showarrow = true
				}

				if (optns.alignCenter) {
					align.center = true
				}
				if (w == "auto") {
					w = null
				}
				if (optns.centerx || optns.centerX) {
					var w1 = Number(optns.width) || d.scrollWidth || $d.width(d) || 0
					anchorB.left = ($.viewport.width) / 2 // - w1
					d.style.transform = "translate(-50%,0)";
				}
				if (optns.centerY || optns.centery) {
					var h = Number(optns.height) || d.scrollHeight || $d.height(d) || 0
					anchorB.top = ($.viewport.height) / 2
					d.style.transform = "translate(0,-50%)";
				}
				var x = anchorB.left, y = anchorB.top, w = optns.width


				if (!w && optns.width != "auto" && anchorB.width && (align.below || align.above)) {
					w = Math.max(optns.minWidth || 0, anchorB.width)
					if (optns.maxWidth) {
						w = Math.min(w, optns.maxWidth)
					}


				}
				var ht = (d.offsetHeight || Number(optns.height) || 0),
					wd = (d.offsetWidth || anchorB.width || 0)
				if (optns.maxHeight && optns.maxHeight > 1) {
					ht = Math.min(ht, optns.maxHeight)
				}
				if (optns.minHeight && optns.minHeight > 1) {
					ht = Math.max(ht, optns.minHeight)
				}

				var offset = config.options.offset || 1
				if (showarrow) {
					var isabove
					if (config.arrow && config.arrow.style) {
						config.arrow.style.display = "none"
					}
					//above

					if (anchorB.top > (ht + 15)) {
						y = anchorB.top - (ht + 15)
						isabove = true;

						x = Math.max(1, (anchorB.left + (anchorB.width ? (anchorB.width / 2) : 0)) - (wd ? (wd / 2) : 0))
					} else if ((anchorB.bottom || anchorB.top) < (viewport.height - ht)) {
						y = (anchorB.bottom || anchorB.top) + 10
						isabove = false
						x = Math.max(1, (anchorB.left + (anchorB.width ? (anchorB.width / 2) : 0)) - (wd ? (wd / 2) : 0))
					} else if ((anchorB.right || anchorB.left) < (viewport.width - wd)) {
						y = Math.max(1, anchorB.top - (ht / 2))
						x = (anchorB.right || anchorB.left) + 10
					} else if (anchorB.left > wd) {
						y = Math.max(1, anchorB.top - (ht / 2))
						x = Math.max(1, (anchorB.left - (wd + 10) ))
					}
					if (!optns.height) {
						if (!optns.maxHeight) {
							if (isabove === true) {
								this.rect.setConstrain("height", {max: anchorB.top - 15})
								this.rect.maxbottom = anchorB.top - 15;
								if (ht > 100) {
									config.content.style["maxHeight"] = (anchorB.top - (offset + 15 + config.content.offsetTop)) + "px"
								}
							} else if (isabove === false) {
								this.rect.setConstrain("height", {max: $.viewport.height - (anchorB.bottom + 15)})
								if (ht > 100) {
									config.content.style["maxHeight"] = (($.viewport.height - anchorB.bottom) - (offset + 15 + config.content.offsetTop)) + "px"
								}
							}
						}
					}
				} else {
					if (align.y == "bottom") {
						y = anchorB.bottom
					} else if (align.y == "top") {
						y = anchorB.top - ht
					}
					if (align.x == "right") {
						x = anchorB.right;
					} else if (!align.below && align.x == "left") {
						x = anchorB.left - wd;
					}
					if (align.center && anchorB.height) {
						y = (anchorB.top + (anchorB.height / 2)) - (ht / 2)

					}
					if (align.center && anchorB.width) {
						x = (anchorB.left + (anchorB.width / 2)) - (wd / 2)
					}
				}
			}
			if (optns.container && optns.container !== document.body) {
				var contB = $d.bounds(optns.container)
				x = x - contB.left;
				y = y - contB.top;
			}
		}


		if (w) {
			this.rect.width = w;
		}
		else if (optns.width) {
			this.rect.width = optns.width;
		}
		if (optns.height || arowht) {
			this.rect.height = optns.height || arowht;
		}
		else if (config.content.style.height) {
			config.content.style.removeProperty("height");
		}

		if (x) {
			this.rect.left = x
		}
		if (y) {
			this.rect.top = y
		}
		//$d.isVisible(config.header,true) && $d.css(config.header,{width:$d(config.content).width()})
		//$d.isVisible(config.footer,true) &&  $d.css(config.footer,{width:$d(config.content).width()})
		applyRect.call(this, forcecss)
		adjustpos.call(this, config, true)
		showArrow.call(this, config)

		return anchorB
	}

	function onhidepopup(vw) {
		var idx = PopupView._activeViews.indexOf(vw)
		idx >= 0 && PopupView._activeViews.splice(idx, 1)
		vw.__lastdims = null
	}

	function setupDrag(config) {
		var optns = config.options, vw = this
		if (optns.resizable === true && !config.resizer) {
			config.resizer = config.el.appendChild(document.createElement("div"))
			config.resizer.className = "resizer"
			config.resizer.innerHTML = "&#x022F0;"
			optns.resizeHandle = ".resizer"
		}
		if (optns.draggable === true) {
			optns.dragHandle = ".popup-header"
			if (!optns.title) {
				optns.title = "&nbsp;"
			}
		}
		if (!config._eventhandle && (optns.resizeHandle || optns.dragHandle)) {
			var h = optns.resizeHandle ? config.el.querySelector(optns.resizeHandle) : null
			if (h) {
				h.style.cursor = "nwse-resize";
				$d.toFront(h)
			}
			var h = optns.dragHandle ? config.el.querySelector(optns.dragHandle) : null
			if (h) {
				h.style.cursor = "move"
			}
			config.el.addEventListener("mousedown", config._eventhandle = function (ev) {
				var el = this;
				if (optns.resizeHandle) {
					var h = el.querySelector(optns.resizeHandle)
					if (h && h.contains(ev.target)) {
						setTimeout(function () {
							resizepopup.call(vw, config)
						}, 1)
						return
					}

				}
				if (optns.dragHandle) {
					var h = el.querySelector(optns.dragHandle)
					if (h && h.contains(ev.target)) {
						setTimeout(function () {
							dragpopup.call(vw, config)
						}, 1)
					}
				}

			})
		}
	}

	function setupScrollHandle() {
		if (!scrollHandle) {
			$.viewport.on("scroll", scrollHandle = function () {
				PopupView._activeViews && PopupView._activeViews.forEach(
					function (vw) {
						vw && vw.verify() && vw._winEv()
					}
				)
			}.bind(this))
		}
	}

	function setContent() {
		var config = this.config
		var optns = config.options, repos
		if (optns.content) {
			if (this.contentUI) {
				this.contentUI.applyUI(config.content)
			}
			optns._contentsaved = optns.content;
			if (typeof(optns.content) == "function") {
				var res = optns.content(config.el, optns)
				if (typeof(res) == "string") {
					config.content.innerHTML = res;
					repos = 1
				}
			}
			else if (optns.content.tagName) {
				config.content.innerHTML = "";
				config.content.appendChild(optns.content);
				repos = 1
			}
			else {
				var url = optns.content.url
				if (!url && typeof(optns.content) == "string" && optns.content.indexOf("http") == 0 && !/\s/.test(optns.content)) {
					url = optns.content;
				}
				if (url) {
					if (url && !$d(config.content).q("iframe")) {
						var ifr = document.createElement("iframe");
						ifr.border = ifr.margin = ifr.padding = 0;
						ifr.height = ifr.width = ifr.style.height = ifr.style.width = "99.9%";

						ifr.src = url;
						$d(config.content).clear().el.appendChild(ifr)
					}
				}
				else {
					config.content.innerHTML = Array.isArray(optns.content) ? optns.content.join("") : String(optns.content)
				}
				repos = 1
			}

			optns.content = null

		}
		if (repos && this.isVisible() && !config.__showing) {
			pospopup.call(this, config)
		}

	}

	function addCancelLink() {
		if (this.config.options.showcancellink) {
			if (!this.$(".top-right-cancel")) {
				this.el.append("<div class='top-right-cancel'></div>").toFront(true).pointerselect(function (e) {
					e.stopPropagation && e.stopPropagation();
					e.stopImmediatePropagation && e.stopImmediatePropagation();
					this.hide()
				}.bind(this))
			}
		}
	}

	function removeFromview() {
		var d = this.el
		if (!d) {
			return
		}

		var config = this.config;
		config.visible = config.__showing = false

		d.removeClass("_hiding")
		if (config._eventhandle) {
			d.removeEventListener("mousedown", config._eventhandle)
			config._eventhandle = null;
		}
		config.observer && config.observer.fire("afterhide")

		if (config.options.destroyonhide) {
			config.observrfn && $.observe(config.options, config.observrfn, false)
			config.observrfn = null
			config.observer && config.observer.destroy && config.observer.destroy()
			d.remove()
			config.el = null;
		} else {
			d.addClass("hidden")
			if (config._cloak) {
				config._cloak = null;
			}
		}
	}

	function showpopup() {
		var config = this.config
		var optns = config.options, d = config.el;
		if (!this.$()) {
			return
		}
		var anchor = optns.anchor
		if (optns.title) {
			optionhandlers.title.call(this, optns.title)
		}
		if (config.firstvisible == null) {
			config.firstvisible = true
		} else {
			config.firstvisible = false
		}

		config.visible = false;
		if (this.fire("beforeshow") === false) {
			return
		}
		config.visible = true
		setContent.call(this)
		if(config.firstvisible && optns.closeButton){
			this.addButton("Close",this.hide.bind(this))
		}
		optns.width && $d.css(config.content, "width", optns.width)
		optns.height && $d.css(config.content, "height", optns.height)
		optns.minWidth && $d.css(config.content, "minWidth", optns.minWidth)
		optns.maxWidth && $d.css(config.content, "maxWidth", optns.maxWidth)
		optns.minHeight && $d.css(config.content, "minHeight", optns.minHeight)
		optns.maxHeight && $d.css(config.content, "maxHeight", optns.maxHeight)


		PopupView._activeViews.indexOf(this) == -1 && PopupView._activeViews.push(this)

		if (anchor && anchor.target && anchor.target !== document.body && anchor.target !== document) {
			anchor = anchor.target
		}
		if (anchor && optns.anchor != anchor) {
			optns.anchor = anchor
		}
		var ths = this;
		var container = optns.container || document.body
		if (!this.$().isAttached() || !this.$().parent().is((container))) {
			$d(container).append(config.el);
		}
		addCancelLink.call(this)

		if (optns.css) {
			$d.css(config.content, optns.css)
		}
		var klass = optns.klass || optns.className || optns["class"]
		if (klass) {
			$d.addClass(config.el, klass)
		}
		setupDrag.call(this, config)
		setupScrollHandle()
		if (config._onblur) {
			config._onblur.cancel(true);
		}

		config._onblur = $d.outside(config.el, {
			ignoreblur: (config.options.hideonblur === false),
			esc: true,
			test: function (target) {
				if (target && this.config.observer && this.config.observer.fire("beforehide", target) === false) {
					return
				}
				if ($d(this.config.options.anchor) && $d(this.config.options.anchor).contains(target)) {
					return
				}
				return true;
			}.bind(this),
			callback: this._hideEl.bind(this)
		})
		if (!config.__showing) {
			this._showEl()
		}
		//setTimeout(setupEvents.bind(this),0)
	}

	function _resolve(val) {
		if (typeof(val) == "function") {
			return val.call(this)
		}
		return val
	}

	var optionhandlers = {
		"title": function (val, oldValue) {
			if (this.config.header) {
				var T = $d.q(this.config.header, ".popup-title") || $d(this.config.header).append("div.popup-title")
				T.html(_resolve.call(this, val));

			}
		},

		"$footer": function (val, oldValue) {

		},
		"content": function (val, oldValue) {
			setContent.call(this);
		},
		"resizeHandle": function (val, oldValue) {
			setupDrag.call(this, this.config);
		},
		"dragHandle": function (val, oldValue) {
			setupDrag.call(this, this.config);
		},
		"draggable": function (val, oldValue) {
			setupDrag.call(this, this.config);
		},
		"resizable": function (val, oldValue) {
			setupDrag.call(this, this.config);
		}
	}
	var proto = {
		_winEv: function (ev) {
			if (this.verify()) {
				pospopup.call(this, this.config)
			}
		},
		_hideEl: function _hideEl() {
			var config = this.config
			config.visible = false
			$.viewport.on("change", config.winev, false)
			config.__showing = false
			if (config._cloak) {
				config._cloak.remove()
			}
			if (config._onblur) {
				config._onblur.cancel(true);
				config._onblur = null;
			}

			config.observer && config.observer.fire("hide")

			if (config.el && config.el.parentNode && $d(config.el)) {
				if (config.el.classList.contains("_hiding")) {
					return
				}
				var ths = this
				var animateHide = config.options.animateHide
				if (config.options.animateShow == false && !animateHide) {
					animateHide = false;
				}
				if (animateHide !== false) {
					var animconfig=animateHide||{}

					config.el.classList.add("_hiding")
					if( animconfig.animationClass) {
						var outklass=animconfig.animationClass
						animconfig.duration=animconfig.duration||500
  						setTimeout(function () {
							config.el.classList.remove(outklass)
							removeFromview.call(this)
						}.bind(ths), animconfig.duration+100)
						config.el.classList.add(outklass)

					} else if( animconfig.method && typeof($d[animconfig.method])=="function"){
						var opts=$.clone(animconfig);delete opts.method
						opts.end=removeFromview.bind(ths)
						$d[animconfig.method](config.el,opts);
					} else{
						$d(config.el).hide()
						removeFromview.call(ths)
					}
					setTimeout(function () {
						if (config.el && config.el.parentNode) {
							config.el.classList.remove("_hiding")
						}
						onhidepopup(ths)
					}, Math.max(Number(animconfig.duration)||0,1000))

				} else {
					removeFromview.call(ths)
					onhidepopup(ths)
				}

			}
		},
		_showEl: function () {
			var config = this.config
			if (!config) {
				return
			}
			var EL = $d(config.el)
			var isvis = $d.isVisible(EL, true)
			EL.removeClass("hidden")
			EL.toFront()
			config.__showing = true;
			EL.show();
			if (isvis || config.options.animateShow === false) {

				config.__showing = false
				pospopup.call(this, config, true)
				config.observer && config.observer.fire("aftershow")

			} else {
				function aftershow() {

					var config = this.config
					config.__showing = false
					if (config.visible === false) {
						return
					}
					config.observer && config.observer.fire("aftershow")
					$d(config.el).toFront(true)
					if (config.options.modal) {
						if (!(config._cloak && $d.isAttached(config._cloak))) {
							config._cloak = $d._util.cloak({
								behind: config.el,
								nodestroy: (config.options.hideonblur !== false)
							});
						} else {
							config._cloak.setZ()
						}
					}
					pospopup.call(this, config, true)
				}
				var animconfig = $.isPlainObject(config.options.animateShow) ? config.options.animateShow : {}
				if( animconfig.animationClass) {
					var klass=animconfig.animationClass
					animconfig.duration=animconfig.duration||500
 					setTimeout(function () {
						config.el.classList.remove(klass)
						aftershow.call(this)
					}.bind(this), animconfig.duration)
					config.el.classList.add(klass)
 				}
 				else if(animconfig.method && typeof($d[animconfig.method])=="function"){
					var opts=$.clone(animconfig)
					opts.end=aftershow.bind(this);delete opts.method
					$d[animconfig.method](EL,opts);
				} else{
					animconfig.duration || (animconfig.duration = 200);
					animconfig.duration = 200

					EL.appear( animconfig ).then(
						aftershow.bind(this)
					);
				}
				}

			if (!config.winev) {
				config.winev = this._winEv.bind(this)
				$.viewport.on("change", config.winev)
			}

			if (this.contentUI) {
				this.contentUI.applyUI(config.content)
			}
			if (this.UI) {
				this.UI.applyUI(config.el)
			}
			if (config.options.centered || config.options.showarrow) {
				var ths = this
				setTimeout(function () {
					pospopup.call(ths, config)
				}, 500)
			}
			pospopup.call(this, config)
		},
		verify: function (ev) {
			if (!this.config) {
				return false
			}
			if (!this.config.el || !this.config.el.parentNode || !this.isVisible(true)) {
				this.hide();
				this.config.el = null;
				return false
			}
			return true
		},
		fire: function (nm, data) {
			this.config && this.config.observer && this.config.observer.fire(nm, data);
			return this
		},
		on: function (nm, cb, optns) {
			var observer = this.observer;
			observer && observer.on(nm, cb, optns);
			return this
		},
		show: function () {
			this.config && showpopup.call(this)
			return this
		},
		setContent: function (c) {
			if (!this.config) {
				return this
			}

			this.config.options.content = c;
			//setContent.call(this,this.config);
			return this
		},
		insertContent: function (c) {
			return this.setContent(c)
		},
		hide: function () {
			if (!this.config) {
				return
			}
			if (this.config.__showing) {
				return
			}
			this._hideEl()
			return this
		},
		isVisible: function (checkel) {
			if (!this.config) {
				return
			}
			if (!(this.el && $d.isAttached(this.el))) {
				return
			}
			if (checkel && !(this.el.isVisible(true))) {
				return
			}

			return this.config.visible
		},
		data: function () {
			if (!this.__expando) {
				this.__expando = $.expando.augment(this)
			}
			return this.__expando(arguments)
		},
		$content: function () {
			return this.el.q(".popup-content")
		},
		$header: function () {
			return this.el.q(".popup-header")
		},
		$footer: function () {
			return this.el.q(".popup-footer")
		},
		addButton: function (optns) {
			if (!this.config) {
				return
			}
			if(typeof(optns)=="string"){
				optns={label:optns}
				optns.callback=	arguments[1];

			}
			var callback=optns.callback
			if(!callback){
				if(String(optns.label).toLowerCase()=="close"){
					callback=this.hide;
				}
			} else if(typeof(callback)=="string"){
				if(typeof(this[callback])=="function"){
					callback=this[callback]
				} else{callback=null}

			}
			if(typeof(callback)!="function"){
				callback=function(){}
			}
			var container=this.config.footer
			if(optns.appendtobody){
				container=this.config.content
			}
			if (container) {
				$d.append(container, "<button class='ui-button blue'>" + (optns.label || optns.name) + "</button>")
					.on("click", callback.bind(this))
			}
			return this
		},
		layout: function () {
			if (!this.config) {
				return
			}
			pospopup.call(this, this.config)
			return this
		}
	}

	function _addLazyProp(proto, prop, fn) {
		$.defineProperty(proto, prop,
			(function (nm, valfn) {
				return {
					get: function () {
						var C = this.config;
						if (!C) {
							return
						}
						if (!C[nm]) {
							C[nm] = valfn(this);
						}
						delete this[nm]
						Object.defineProperty(this, nm, {
							value: C[nm],
							configurable: true,
							enumerable: true,
							writable: false
						})
						return C[nm]
					}, set: function (v) {
					}, configurable: true, enumerable: true
				}
			})(prop, fn));
	}

	_addLazyProp(proto, "contentUI", $.domUI)
	_addLazyProp(proto, "UI", $.domUI)
	_addLazyProp(proto, "observer", $.emitter.augment)
	$.defineProperties(proto, {
		contentWrap: {
			get: function () {
				return this.config && $d(this.config.content)
			}
		},
		el: {
			get: function () {
				return this.config && $d(this.config.el)
			}
		}
	})
	var PopupView = $.createClass(
		function PopupView(options) {
			options = options || {};
			this.rect = new $.G()
			this.rect.setConstrain({top: options.offset || 5, left: options.offset || 5});
			this.config = {options: options};
			Object.keys(optionhandlers).forEach(
				function (k) {
					this.config.options[k] || (this.config.options[k] = null)
				}, this
			);
			this.config.optionhandlers = $.extend({}, optionhandlers)
			if (options.ui) {
				this.UI.updateUI(options.ui);
			}
			if (options.contentui || options.contentUI) {
				this.contentUI.updateUI(options.contentui || options.contentUI);
			}

			this.$ = $d.util.createScopedDollar("el")
			this.config.observer = $.emitter.augment(this);
			$.observe(this.config.options, {onlyupdates: true},
				this.config.observrfn = function (rec) {
					var r = Array.isArray(rec) ? rec : [rec], h = this.config.optionhandlers || {};
					for (var i = 0; i < r.length; i++) {
						var val = r[i].value || r[i].newValue || r[i].object[r[i].name]
						if (val == null) {
							continue
						}
						var fn = h[r[i].name] || h[r[i].name.toLowerCase()]
						if (fn && typeof(fn) == "function") {
							fn.call(this, val, r[i].oldValue);
						}
					}
				}.bind(this)
			)
			var config = this.config, d = document.createElement("div")
			d.className = "popup-view hidden"
			d.innerHTML = "<div class='popup-header'></div><div class='popup-content'></div><div class='popup-footer'></div>"
			config.el = d;
			config.content = d.querySelector(".popup-content")
			config.header = d.querySelector(".popup-header")
			config.footer = d.querySelector(".popup-footer")
			if (config.options.auto) {
				this.show()
			}
		}, proto
	);
	PopupView._activeViews = []

	PopupView.hideAll = function () {
		PopupView._activeViews.slice().forEach(function (v) {
			v.hide();
		})
	}
	PopupView.getActive = function () {
		return PopupView._activeViews.find(function (v) {
			return v.isVisible(true);
		})
	}
	var splashDefaultOptions={
		//default
			"closeButton": false,
			"newestOnTop": false,
			"progressBar": false,

			"positionClass": "right-top",
			"preventDuplicates": true,

			"timeOut": 0,
			"extendedTimeOut": 0,

			"showDuration": 1300,
			"hideDuration": 1000,
			"showEasing": "ease",
			"hideEasing": "linear",
			"showMethod": "fadeIn",
			"hideMethod": "fadeOut",
			"tapToDismiss": false
	}
	/*
	Inspired by toastr
	takes same set of config options as toastr.

	 */
	var ACTIVESPLASHES=[]
	PopupView.splash = function (message ,optns) {
		if(typeof(optns)=="string"){optns={mode:optns}}
		if(!optns || !$.isPlain(optns)){
			optns={}
		}

		var content="<div class='splash-icon'></div><div class='splash-message'>"+message+"</div>"
		if(optns.title){
			content="<div class='splash-title'>"+optns.title+"</div>"+content
			delete optns.title;
		}

		var splashOptions=$.extend({},splashDefaultOptions)
		if($.isPlain(optns.splashOptions)){
			$.extend(splashOptions,optns.splashOptions)
		} else {
			$.each(optns,function(v,k){
				if(k in splashDefaultOptions){
					splashOptions[k]=v;
				}
			})
		}
		if(splashOptions.preventDuplicates){
			if(ACTIVESPLASHES.length){
				if(ACTIVESPLASHES.some(function(a){
						return a.config.options._contentsaved==content
					})){
					return
				}
			}
		}
		splashOptions.timeOut=optns.timeout||splashOptions.timeOut
		optns.animateShow={duration:splashOptions.showDuration,easing:splashOptions.showEasing,method:splashOptions.showMethod}
		optns.animateHide={duration:splashOptions.hideDuration,easing:splashOptions.showEasing,method:splashOptions.hideMethod}
		if(optns.positionClass && typeof(optns.positionClass)=="string"){
			if(optns.positionClass.indexOf("-")==-1){optns.positionClass=optns.positionClass.replace(/[A-Z]/,"-$&").toLowerCase()}
			var parts=optns.positionClass.split("-")
			var posclass=[],idx
			if((idx=parts.indexOf("left"))>=0 || (idx=parts.indexOf("right"))>=0){posclass.push(parts.splice(idx,1)[0]);}
			else if((idx=parts.indexOf("center"))>=0){posclass.push("center");parts.splice(idx,1)}
			else{posclass.push("center");}
			if((idx=parts.indexOf("top"))>=0 || (idx=parts.indexOf("bottom"))>=0){posclass.push(parts.splice(idx,1)[0]);}
			if(!posclass.length){posclass=["right","top"]}
 			if(posclass.length==1){posclass.push("center")}
			optns.positionClass=posclass.join("-")
		}
		if(!optns.positionClass && !optns.anchor){optns.positionClass="right-top"}
		optns.klass=["splash-popup","splash-popup-"+(optns.mode||'message'),optns.positionClass]
		optns.minHeight=optns.minHeight||40;optns.hideonblur=false
		optns.minWidth=optns.minWidth||250;
		if(!optns.maxWidth || (Number(optns.maxWidth)||0)<2) {
			optns.maxWidth = Math.min($.viewport.width - 20,  350);
		}
		optns.destroyonhide=true;
		optns.offset=10;
		var splashvw = new PopupView(optns);
		splashvw.on("beforehide",function(){
			if(this._timer){
				clearTimeout(this._timer)
				this._timer=0;
			}
		})


		splashvw.observer.on("hide",function(){
			var idx=ACTIVESPLASHES.indexOf(splashvw)
			idx>=0 && ACTIVESPLASHES.splice(idx,1)
		});

  		splashvw.setContent(content).show()
 		if(splashOptions.newestOnTop){
			ACTIVESPLASHES.forEach(function(a){
				a.hide();
			})
		}
		if(!splashOptions.newestOnTop && ACTIVESPLASHES.length){
			var bots=ACTIVESPLASHES.map(function(a){return a.el.bounds().bottom});
			var max=Math.max.apply(Math,bots)
			if(max){
				splashvw.el.css("top",max);
			}
		}
		ACTIVESPLASHES.push(splashvw)
		if(splashOptions.tapToDismiss){
			splashvw.el.on("click",splashvw.hide.bind(splashvw))
		}
		if(splashOptions.extendedTimeOut===true){
			splashOptions.extendedTimeOut=3000;
		}
 		splashvw._timer=setTimeout(function() {
			this._timer=0;
			 this.hide()
		}.bind(splashvw), (Number(splashOptions.timeOut) || 3000)+(Number(splashOptions.extendedTimeOut) || 0))
		return splashvw;
	}
	PopupView.lookupList = function (list, optns) {
		optns = optns || {}
		if (typeof(optns) == "function") {
			optns = {callback: optns}
		}
		var PopupViewOptions = $.extend({}, optns.popupoptions || optns || {})

		PopupViewOptions.alignAnchor = "below"
		PopupViewOptions.maxHeight = optns.maxHeight || 250
		if (PopupViewOptions.destroyonhide == null) {
			PopupViewOptions.destroyonhide = true;
		}
		PopupViewOptions.anchor = PopupViewOptions.anchor || $d.util.getActiveElement()
		var w = $d.width(PopupViewOptions.anchor)
		if (w) {
			if (!PopupViewOptions.minWidth) {
				PopupViewOptions.minWidth = Math.max(PopupViewOptions.minWidth || 0, w + 10)
				if (PopupViewOptions.maxWidth) {
					PopupViewOptions.minWidth = Math.min(PopupViewOptions.minWidth, PopupViewOptions.maxWidth);
				}
			}
		}
		if (PopupViewOptions.ignoreanchorstyle !== true) {
			PopupViewOptions.contentUI = {font: $d.css(PopupViewOptions.anchor, "font")}
		}

		//PopupViewOptions.modal=true;
		PopupViewOptions.minWidth = PopupViewOptions.minWidth || 150

		var vw = new PopupView(PopupViewOptions)
		vw.el.addClass("lookup-list")


		vw.adjustHeight = function () {
			if (!this.isVisible()) {
				return
			}
			var ul = this.$content("ul")
			if (!ul) {
				return
			}
			var tp = ul.offsetTop, maxht = this.config.options.maxHeight || this.config.options.height || 200
			if (!ul) {
				return
			}
			if (ul.scrollHeight + tp > maxht + 10) {
				ul && ul.css("h", maxht - tp)
			} else {
				ul.css("h", "auto")
			}
		}
		vw._buildList = function (optns, list) {
			var temtemplate=this.config.options.listitemtemplate
			if(temtemplate){
				if(typeof(temtemplate)=="string"){
					this.config.options.listitemtemplate=temtemplate= $.template(temtemplate)
				}
			}
			if(temtemplate){
				this._list= List.parseList($.collect(list,function(it,i){
					return {
						id:i,
						label:temtemplate(it),
						 datarecord:it
					}
				}), optns, {})
			}
			else {
				this._list = List.parseList(list, optns, {})
			}
			return this._list;
		}
		vw.buildList = function (optns, list) {
			if (list == null) {
				list = this.config.options.list
			}
			if(list && list.isPromise){
				return list.then(function(list1){
					this._buildList(optns, list1)
				}.bind(this))
			}
			return this._buildList(optns, list)

			return this._list
		}
		vw.renderListView = function (fin, optns, noforce) {

			var finlist = [], vw = this, template = "<li class='list-item' data-key='$id'>$label</li>"
			if (!(fin && fin.size())) {
				this.hide();
				return this;
			}

			var options = $.extend({}, this.config.options, $.isPlain(optns) ? optns : {});

			if (options.combo) {
				var html = ""

				var srchbox
				if (options.comboip && $d(options.comboip)) {
					srchbox = $d(options.comboip);
				}
				else {
					if (options.combotitle) {
						html = "<h4>" + _resolve.call(this, options.combotitle) + "</h4>"
					}
					html += "<div class='search-box-wrap'><input type='search' class='search-box'/><span class='search-item-count'></span></div>"
					this.$header().html(html);
					srchbox = this.$header().q(".search-box")
				}

				var vw = this

				srchbox.on("click.searchbox", function (ev) {
					if (this.val()) {
						var diff = this.bounds().right - ev.x
						if (diff >= 0 && diff < 20) {
							var cnt = 0;
							this.val("");
							if (vw.config.options.filterhandle) {
								cnt = vw.config.options.filterhandle("", vw);
							}
							else {
								cnt = vw.$().qq(".list-item").css("display", "block").length;
							}
							typeof(cnt) == "number" && cnt >= 0 && vw.$(".search-item-count") && vw.$(".search-item-count").html(cnt)
						}
					}
				})
				srchbox.on("input.searchbox", function (ev) {
					var cnt = 0, val = this.val()
					if (vw.config.options.searchhandle) {
						var res = vw.config.options.searchhandle(val, vw);
						if(res && res.isPromise){
							res.then(function(data){
								vw.reset(data, null, true);
							}.bind(vw))
						} else if(res && typeof(res)=="object"){
							vw.reset(res, null, true);
						}
						return
					}
					if (vw.config.options.filterhandle) {
						cnt = vw.config.options.filterhandle(val, vw);
					}
					else {
						if (val) {
							vw._list.searchText(val, function (rec, match) {
								if (!rec.dom) {
									return
								}
								if (match) {
									cnt++
									rec.dom.show()
								} else {
									rec.dom.hide()
								}
							})

						} else {
							vw._list.getList().forEach(function (rec) {
								rec && rec.dom && rec.dom.show()
							})
							//items.css("display","block")
							cnt = vw._list.getList().length
						}
					}

					typeof(cnt) == "number" && cnt >= 0 && vw.$(".search-item-count") && vw.$(".search-item-count").html(cnt)
				})
			}
			finlist = fin.applyTemplate(template)
			finlist.unshift("<ul class='filter-listbox' style='overflow:auto;margin-bottom:5px'>")
			finlist.push("</ul>")
			if (options && options.anchor) {
				vw.config.options.anchor = options.anchor;
			}
			vw.setContent(finlist.join(""));

			vw.$content().data("_list", fin)
			if (options.callback) {
				vw.$content().on("click.list", function (ev, el) {
					var k = $d.domdata(el, "key"), lst = this.data("_list") || []
					var rec = lst.findById(k)
					if (rec) {
						var record=rec.record
						if(record.datarecord){
							record=record.datarecord
						}
						if(lst.config && vw.config.options.recordProvider){
							record=vw.config.options.recordProvider.call(lst,rec)
						}
						if (options.callback.call(vw, record) !== false) {
							vw.hide()
						}
					}

				}, ".list-item")
			}
			if (vw.isVisible(true)) {
				vw.adjustHeight()
				vw.layout()
			}
			else {
				if (noforce !== true) {
					vw.show()
				}
			}
			vw.$content().css("overflow", "auto").qq(".list-item").each(function (it) {
				var el = fin.findById(it.domdata("key"))
				if (el) {
					el.dom = it;
				} else {
					console.log("not found", el)
				}
			})
			vw.fire("afterrender")
			return this
		}
		vw.reRenderList = function (optns) {
			this.renderList(null, optns)
		}
		vw.renderList = function (list, optns, noforce) {
			vw.fire("beforerender")
			var fin = this.buildList(optns, list)
			if (fin && fin.isPromise) {
				fin.then(function (nulist) {
					vw.renderListView(nulist, noforce)
				}.bind(this))
				return this
			}
			return this.renderListView(fin, noforce);

		}
		if (list) {
			vw.renderList(list, optns)
		}
		vw.clear = function (list, optns, andshow) {
			if (this.config.options.defaultText) {
				this.$("ul").html("div.default-list-text").html(this.config.options.defaultText)
			} else {
				this.$("ul").clear();
			}
			return this;
		}
		vw.reset = function (list, optns, andshow) {
			if (!optns) {
				optns = {}
			}

			if (optns.anchor === true) {
				optns = {anchor: $d.util.getActiveElement()}
			} else if (optns.nodeType) {
				optns = {anchor: optns}
			}
			if (!$.isPlain(optns)) {
				optns = {}
			}
			this.renderList(list, optns, andshow === false);

		}
		vw.on("aftershow", function () {
			this.adjustHeight()
		})

		return vw
	};
	ZModule.register("PopupView",PopupView)
	$.PopupView=PopupView
 })();

