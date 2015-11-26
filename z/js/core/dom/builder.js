/**
 * Created by Atul on 8/15/2015.
 */
var _buildElement = (function _buildElement() {
	//grapphics ele
	var gel = ["circle", "rect", "square", "line", "path", "polygon"]

	function _resolveTemplate(c) {
		return c
	}

	function _build(cntnt0) {
		var worker, cntnt, el, props = {};
		if (!cntnt0) {
			return
		}
		var children = null,
			tag, a = [].slice.call(arguments)
		if ($.isArray(a[0])) {
			var res = a[0].map(function(v) {
				return _build(v)
			})
			cntnt = document.createDocumentFragment()
			res.forEach(function(a) {
				a && cntnt.appendChild(a)
			})
			return cntnt
		}


		if (typeof(a[0]) == "string") {
			if (/^[\w]+$/.test(a[0]) || /^<([\w\-]+)\/?>$/.test(a[0])) {
				tag = a.shift().replace(/\W/g, "")
			} else if (a[0].charAt(0) == "<") {
				cntnt = a.shift();
			}
		}
		if (tag) {
			props.tag = tag
		}
		if (typeof(a[0]) == "string") {
			var t
			if (/\W/.test(a[0]) && a[0].charAt(0) != "<") {
				if (a[0].charAt(0) == "`") {
					t = a.shift();
					props.text = t.substr(1)
				} else if (/[\.\[\{\#]/.test(a[0])) {
					t = a.shift()
					t = t.replace(/\.([\w\-]+)/g, function(a, b) {
						props.klass || (props.klass = []);
						props.klass.push(b);
						return ""
					})
					t = t.replace(/#([\w\-]+)/g, function(a, b) {
						props.id = b;
						return ""
					})
					t = t.replace(/\[([^\[]+)\]/g, function(a, b) {
						b.split(/\s*;\s*/).forEach(function(k) {
							var arr = k.split(/[\=\:]/)
							if (arr.length == 2) {
								props[arr[0]] = arr[1]
							}

						})
						return "";
					})
					if (t) {
						if (t.indexOf("`") >= 0) {
							var txt = t.split(/`/)
							props.text = txt.pop()
							t = txt.shift()
						}
						if (t && /^\w+$/.test(t) && !props.tag) {
							props.tag = t
						}
					}
				}
			} else if (/^\w+$/.test(a[0])) {
				if (!props.tag) {
					props.tag = a.shift()
				}
			} else {
				cntnt = a.shift()
			}
		}
		if ($.isPlain(a[0])) {
			$.extend(props, a.shift())
		}
		if (a.length) {
			if ($.isArray(a[0])) {
				props.children = a.shift()
			}
		}
		if (a[0]) {
			cntnt = a.shift()
		}
		if (typeof(cntnt) == "string") {
			cntnt = _resolveTemplate(cntnt)
			worker = document.createElement("div")
			worker.innerHTML = cntnt.trim();
			if (worker.firstChild && worker.firstChild == worker.lastChild) {
				cntnt = worker.firstChild
			} else {
				cntnt = document.createDocumentFragment()
				while (worker.firstChild) {
					cntnt.appendChild(worker.removeChild(worker.firstChild))
				}
			}
			//document.createDocumentFragment();
			//while(worker.firstChild){cntnt.appendChild(worker.removeChild(worker.firstChild))}
		} else if (cntnt && typeof(cntnt) == "object") {
			if (cntnt instanceof Node || cntnt.nodeType == 11) {} else if (cntnt0.isDomWrap) {
				cntnt = cntnt.el
			} else if (Object.keys(cntnt).length) {
				props = $.extend(props || {}, cntnt)
			}
		}
		if (!(cntnt && cntnt.nodeType)) {
			cntnt = document.createElement(props.tag || props.tagName || "div")
		}
		delete props.tag;
		delete props.tagName;

		if (Object.keys(props).length) {
			var el = $d(document.body.appendChild(cntnt))
			var css = props.css || props.styles || props.style
			if (css) {
				el.css(css)
				delete props.css;
				delete props.styles;
				delete props.style;
			}
			if (props.text || props.content) {
				el.text(props.text || props.content)
				delete props.text;
				delete props.content;
			}
			if (props.val || props.value) {
				el.val(props.val || props.value)
				delete props.val;
				delete props.value;
			}
			if (props.klass) {
				el.addClass(props.klass)
				delete props.klass;
			}
			if (props.attr) {
				el.attr(props.attr)
				delete props.klass;
			}


			if (props.children || props.child) {
				children = props.children || props.child;
				delete props.children;
				delete props.child
			}


			for (var k in props) {
				if (k && typeof(k) == "string" && props[k] != null && typeof(props[k]) != "object") {
					//if(k in stl) {el.css(k,props[k])}
					el.prop(k, props[k])
					delete props[k]
				}
			}
			cntnt = el.el.cloneNode(true)
			el.remove()
			cntnt.removeAttribute && cntnt.removeAttribute("id");
			if ($.isArray(children)) {
				var tag = String(cntnt.tagName).toLowerCase(),
					ctag
				if (tag == "ul" || tag == "ol") {
					ctag = "li"
				} else if (tag == "tr") {
					ctag = "td"
				} else if (tag == "tbody" || tag == "table" || tag == "thead") {
					ctag = "tr"
				} else if (tag == "dl") {
					ctag = "dt"
				}
				children.map(function(v) {
					return _build(ctag, v)

				})
					.forEach(function(nu) {
						nu && cntnt.appendChild(nu)
					})
			}


		}
		return cntnt && cntnt.nodeType ? cntnt : null
	}
	return _build
})();

function _buildDom(cntnt0) {
	var ret = _buildElement.apply(this, arguments)
	return ret
}