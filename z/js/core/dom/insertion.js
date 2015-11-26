
(function(){
var positions = {
                append: 1,
                before: 2,
                after: 2,
                prepend: 1,
                content: 1,
                below: "after",
                refresh: "content",
                beforebegin: "before",
                afterstart: "prepend",
                afterend: "after",
                beforeend: "append",
                insert: "append",
                top: "prepend",
                bottom: "append",
                replace: 3,
                wrap: 3,
                wrapall: 3,
                wrapainner: 3,
                copychildren: 3,
                movechildren: 3
            };
	function _renderDomContent(cntnt0,el,pos,memo){
            var worker, cntnt;
            memo=memo||{}
            var istag,tagattribs=""
            if (typeof(cntnt0) == "string") {
                if(/^\<[\w\-]+\/?\>$/.test(cntnt0)){
                    istag=cntnt0.substr(1,cntnt0.length-2)
                } else if(/^[\w]+\.[\w\.\-]+$/.test(cntnt0)){
                    var arr=cntnt0.split(".")
                    istag=arr.shift();tagattribs=" class='"+arr[0]+"'"
                }
                if ($d._util.isValidTagName(cntnt0)) {
                    istag = cntnt0
                }
                if(istag){
                    cntnt = "<" + istag + ( tagattribs) + "></" + istag + ">"
                } else {
                    var op
                    if (/^\^?[+\-]\$?\s+/.test(cntnt0)) {
                        op = cntnt0.substr(0, cntnt.indexOf(" ") + 1).trim()
                        cntnt = cntnt0.substr(op.length).trim()
                    }
                    var c = cntnt || cntnt0
                    if (c.indexOf("<") != 0 && (c.indexOf("$") >= 0 || c.indexOf(">") >= 0 || c.indexOf("Z!") == 0)) {
                        cntnt = $d.template(cntnt || cntnt0).html()
                    } else {
                        if (el && !el.firstChild && (!pos )) {
                            $d.html(el, c)
                            if (el && el.childElementCount == 1) {
                                memo.done=true
                                return $d(el.firstElementChild)
                            }
                            memo.done=true
                            return el;
                        } else {
                            cntnt = c
                        }
                    }
                }
                worker = document.createElement("div")
                cntnt = (cntnt || cntnt0).trim()
                var firsttag = ""
                if (cntnt.indexOf("<") == 0) {
                    if (cntnt.indexOf("<tr") == 0) {
                        firsttag = "tr";
                        cntnt = "<table>" + cntnt + "</table>"
                    } else if (cntnt.indexOf("<tbody") == 0) {
                        firsttag = "tbody";
                        cntnt = "<table>" + cntnt + "</table>"
                    } else if (cntnt.indexOf("<thead") == 0) {
                        firsttag = "thead";
                        cntnt = "<table>" + cntnt + "</table>"
                    } else if (cntnt.indexOf("<tfoot") == 0) {
                        firsttag = "tfoot";
                        cntnt = "<table>" + cntnt + "</table>"
                    } else if (cntnt.indexOf("<caption") == 0) {
                        firsttag = "caption";
                        cntnt = "<table>" + cntnt + "</table>"
                    } else if (cntnt.indexOf("<td") == 0) {
                        firsttag = "td";
                        cntnt = "<table><tr>" + cntnt + "</tr></table>"
                    } else if (cntnt.indexOf("<th") == 0) {
                        firsttag = "th";
                        cntnt = "<table><tr>" + cntnt + "</tr></table>"
                    }
                }

                if (op && el) {
                    var s = el.innerHTML
                    if (op == "+$" || op == "+") {
                        el.innerHTML += cntnt
                    }
                    if (op.charAt(0) == "^") {
                        el.innerHTML = cntnt + s
                    }
                    if (op.indexOf("-") >= 0) {
                        var re = RegExp.escape(s);
                        if (op.indexOf("^") == 0) {
                            s = "^(" + s + ")"
                        };
                        if (op.indexOf("$") == op.length - 1) {
                            s = "(" + s + ")$"
                        };
                        el.innerHTML = s.replace(RegExp.escape(re, [op.indexOf("*") >= 0 ? "g" : "", op.indexOf("i") >= 0 ? "i" : ""].join("")), "")
                    }
                    memo.done=true
                    return $d(el)
                }

                worker.innerHTML = cntnt?cntnt.trim():"";
                if (worker.firstChild && worker.firstChild === worker.lastChild) {
                    cntnt = worker.firstChild
                } else if (firsttag) {
                    cntnt = worker.querySelector(firsttag)
                } else {
                    cntnt = document.createDocumentFragment()
                    while (worker.firstChild) {
                        cntnt.appendChild(worker.removeChild(worker.firstChild))
                    }
                }
                if (!cntnt) {
                    worker = document.createElement("div")
                    worker.innerHTML = String(cntnt0).trim()
                    if (worker.firstChild && worker.firstChild === worker.lastChild) {
                        cntnt = worker.firstElementChild
                    } else {
                        cntnt = document.createDocumentFragment()
                        while (worker.firstChild) {
                            cntnt.appendChild(worker.firstChild)
                        }
                    }

            }
            } else if (cntnt0 && typeof(cntnt0) == "object") {
                if (cntnt0 instanceof Node || (!cntnt0.el && cntnt0.nodeType == 1) || cntnt0.nodeType == 11) {
                    cntnt = cntnt0
                } else if (cntnt0.isDomWrap || (cntnt0.el && cntnt0.el.nodeType)) {
                    cntnt = cntnt0.el
                    if (cntnt.el && cntnt.el.nodeType) {
                        cntnt = cntnt.el
                    }
                } else if (Object.keys(cntnt0).length) {
                    cntnt = document.createElement(cntnt0.tag || cntnt0.tagName || "div")
                    memo.props = cntnt0;
                    delete memo.props.tag;
                    delete memo.props.tagName;
                }
            }
            if (!(cntnt && cntnt.nodeType)) {
                return null
            }
            return cntnt
        } 
		
	$.extend($d,{
		insert: (function() {
            
            function insertAt(el,data,pos){
                var res ,cntnt=data,container=el,
                    before = null,
                    origpos = pos
                if (!pos) {
                    pos = "append"
                }
                if (pos == "content") {
                    $d.clear(container);
                    pos = "append"
                }
                if (pos == "copychildren") {

                     while (data.firstChild) {
                         container.appendChild(data.firstChild)
                    }
                    res=container
                } else if (pos == "movechildren") {
                    while (data.firstChild) {
                        container.appendChild(data.removeChild(data.firstChild))
                    }
                    res=container
                } else if (pos == "after") {
                    container = el.parentNode;
                    before = el.nextSibling
                } else if (pos == "wrap" || pos == "replace" || pos == "before") {
                    container = el.parentNode;
                    before = el
                } else if (pos == "wrapinner" || pos == "prepend") {
                    before = el.firstChild
                }
                if (!res) {
                    var cntntel = cntnt.el || cntnt
                    if (before) {
                        container.insertBefore(cntntel, before)
                        res = before.previousSibling
                    } else {
                        if (container.firstChild && container.firstChild.nodeType == 3 && container.firstChild.nodeValue == ".") {
                            container.removeChild(container.firstChild)
                        }
                        res = container.appendChild(cntntel);
                        if (cntntel.nodeType == 11) {
                            res = container.lastElementChild
                        }
                    }

                    if (res) {
                        cntntel = el.el || el
                        if (origpos == "replace" && cntntel.parentNode) {
                            cntntel.parentNode.removeChild(cntntel)
                        } else if (origpos == "wrap") {
                            res.appendChild(cntntel.parentNode.removeChild(cntntel))
                        } else if (origpos == "wrapinner") {
                            while (res.nextSibling) {
                                var p = res.parentNode
                                res.appendChild(p.removeChild(res.nextSibling))
                            }
                        }
                    }
                }
                return res;
            }
            return function(el0, cntnt0, pos, props) {
                if (!el0) {
                    el0 = document.body
                }
                if (el0 === document || el0.el === document) {
                    el0 = document.body
                }
                var worker, cntnt, el = $d.toEl(el0);
                if (!el) {
                    return
                }

                if (Array.isArray(cntnt0)) {
                    for (var i = 0, ln = cntnt0.length; i < ln; i++) {
                        $d.insert(el0, cntnt0[i], pos, props)
                    }
                    return $d(el);
                }

                if (pos) {
                    if (typeof(pos) == "object") {
                        props = pos;
                        pos = null;
                    } else if (typeof(pos) == "string") {
                        if (positions[pos.toLowerCase()]) {
                            if (typeof(positions[pos.toLowerCase()]) == "string") {
                                pos = positions[pos.toLowerCase()]
                            }
                        } else {
                            props = pos;
                            pos = "append"
                        }
                    }
                }
                pos = pos || "append"
                if (!(props && typeof(props) == "object")) {
                    if (typeof(props) == "string") {
                        props = {
                            value: props
                        }
                    } else props = null;
                }

                var memo = {}
                cntnt =  _renderDomContent(cntnt0, el, (!pos || positions[pos] == 1) ? null : pos, memo)

                if (memo.done) {
                    //if(cntnt && cntnt.nodeType==11){cntnt=cntnt.firstChild}
                    return $d(cntnt)
                }
                if (!(cntnt && cntnt.nodeType)) {
                    return null
                }
                props = memo.props || props

                var nu=insertAt(el,cntnt,pos)

                var res = $d(nu ? nu : el);
                if (res && props) {
                    var items
                    if (Array.isArray(props)) {
                        items = props;
                        props = null
                    }
                    if (props) {
                        if (props.elements) {
                            items = props.elements;
                            delete props.elements
                        }
                        if (props.items) {
                            items = props.items;
                            delete props.items
                        }
                        $d.prop(res, props)
                    }
                    if (items && items.length) {
                        var tag = "span"
                        if (res.tagName == "UL" || res.tagName == "OL") {
                            tag = "li"
                        } else if (res.tagName == "SELECT") {
                            tag = "option"
                        } else if (res.tagName == "TR") {
                            tag = "td"
                        }
                        tag = "<" + tag + "/>"
                        var list = items.slice();
                        while (list.length) {
                            res.insert(tag, list.shift())
                        }
                    }
                }
                //if(res && res.nodeType==11){res=res.firstChild}
                return $d(res)
            }
        })(),

        detach: function detach(e, selector) {},
        replaceWith: function replaceWith(e, content) {
            return $d.insert(e, content, "replace")
        },
        unwrapEl: function unwrapEl(e) {
            return $d
        },
        wrapEl: function wrapEl(e, html) {
            return $d.insert(e, html, "wrap")
        },
        wrapAll: function wrapAll(e, html) {
            var el = $d.toEl(e);
            if (!el) {
                return
            }
            [].slice.call(el.children).forEach(function(it) {
                $d.insert(it, html, "wrap")
            })
            return $d(el)
        },
        wrapInner: function wrapInner(e, html) {
            $d.insert(e, html, "wrapinner")
        },
        replaceAll: function replaceAll(e, content) {
            $d.insert(e, content, "replace")
        },

        compile: function(e, model) {
            var el = $d(e);
            if (!el) {
                return
            }
            return model.compile(el)
        },

        appendTo: function appendTo(e, target) {
            var el = $d.toEl(e);
            if(!el){return null}
            return $d.insert(target, el) || $d(el)
        },
        append: function append(e, content) {
            var el = $d(e);
            return el.insert(content, "append") || el;
        },
        before: function before(e, content) {
            return $d(e).insert(content, "before")
        },
        after: function after(e, content) {
            return $d(e).insert(content, "after")
        },
        prepend: function prepend(e, content) {
            return $d(e).insert(content, "top")
        }
	})
})();		
