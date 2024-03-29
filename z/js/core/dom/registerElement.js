
if (!document.registerElement) {
    (function(e, t, n, r) {
        "use strict";

        function z(e, t) {
            for (var n = 0, r = e.length; n < r; n++) Y(e[n], t)
        }

        function W(e) {
            for (var t = 0, n = e.length, r; t < n; t++) r = e[t], U(r, p[V(r)])
        }

        function X(e) {
            return function(t) {
                b.call(A, t) && (Y(t, e), z(t.querySelectorAll(d), e))
            }
        }

        function V(e) {
            var t = e.getAttribute("is"),
                n = e.nodeName,
                r = m.call(h, t ? f + t.toUpperCase() : a + n);
            return t && -1 < r && !$(n, t) ? -1 : r
        }

        function $(e, t) {
            return -1 < d.indexOf(e + '[is="' + t + '"]')
        }

        function J(e) {
            var t = e.currentTarget,
                n = e.attrChange,
                r = e.prevValue,
                i = e.newValue;
            t.attributeChangedCallback && e.attrName !== "style" && t.attributeChangedCallback(e.attrName, n === e.ADDITION ? null : r, n === e.REMOVAL ? null : i)
        }

        function K(e) {
            var t = X(e);
            return function(e) {
                t(e.target)
            }
        }

        function Q(e, t) {
            var n = this;
            M.call(n, e, t), j.call(n, {
                target: n
            })
        }

        function G(e, t) {
            k(e, t), q ? q.observe(e, D) : (B && (e.setAttribute = Q, e[i] = I(e), e.addEventListener(u, j)), e.addEventListener(o, J)), e.createdCallback && (e.created = !0, e.createdCallback(), e.created = !1)
        }

        function Y(e, t) {
            var n, r = V(e),
                i = "attached",
                s = "detached"; - 1 < r && (R(e, p[r]), r = 0, t === i && !e[i] ? (e[s] = !1, e[i] = !0, r = 1) : t === s && !e[s] && (e[i] = !1, e[s] = !0, r = 1), r && (n = e[t + "Callback"]) && n.call(e))
        }
        if (r in t) return;
        var i = "__" + r + (Math.random() * 1e5 >> 0),
            s = "extends",
            o = "DOMAttrModified",
            u = "DOMSubtreeModified",
            a = "<",
            f = "=",
            l = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/,
            c = ["ANNOTATION-XML", "COLOR-PROFILE", "FONT-FACE", "FONT-FACE-SRC", "FONT-FACE-URI", "FONT-FACE-FORMAT", "FONT-FACE-NAME", "MISSING-GLYPH"],
            h = [],
            p = [],
            d = "",
            v = t.documentElement,
            m = h.indexOf || function(e) {
                    for (var t = this.length; t-- && this[t] !== e;);
                    return t
                },
            g = n.prototype,
            y = g.hasOwnProperty,
            b = g.isPrototypeOf,
            w = n.defineProperty,
            E = n.getOwnPropertyDescriptor,
            S = n.getOwnPropertyNames,
            x = n.getPrototypeOf,
            T = n.setPrototypeOf,
            N = !!n.__proto__,
            C = n.create || function Z(e) {
                    return e ? (Z.prototype = e, new Z) : this
                },
            k = T || (N ? function(e, t) {
                    return e.__proto__ = t, e
                } : S && E ? function() {
                    function e(e, t) {
                        for (var n, r = S(t), i = 0, s = r.length; i < s; i++) n = r[i], y.call(e, n) || w(e, n, E(t, n))
                    }
                    return function(t, n) {
                        do e(t, n); while (n = x(n));
                        return t
                    }
                }() : function(e, t) {
                    for (var n in t) e[n] = t[n];
                    return e
                }),
            L = e.MutationObserver || e.WebKitMutationObserver,
            A = (e.HTMLElement || e.Element || e.Node).prototype,
            O = A.cloneNode,
            M = A.setAttribute,
            _ = t.createElement,
            D = L && {
                    attributes: !0,
                    characterData: !0,
                    attributeOldValue: !0
                },
            P = L || function(e) {
                    B = !1, v.removeEventListener(o, P)
                },
            H = !1,
            B = !0,
            j, F, I, q, R, U;
        T || N ? (R = function(e, t) {
            b.call(t, e) || G(e, t)
        }, U = G) : (R = function(e, t) {
            e[i] || (e[i] = n(!0), G(e, t))
        }, U = R), L || (v.addEventListener(o, P), v.setAttribute(i, 1), v.removeAttribute(i), B && (j = function(e) {
            var t = this,
                n, r, s;
            if (t === e.target) {
                n = t[i], t[i] = r = I(t);
                for (s in r) {
                    if (!(s in n)) return F(0, t, s, n[s], r[s], "ADDITION");
                    if (r[s] !== n[s]) return F(1, t, s, n[s], r[s], "MODIFICATION")
                }
                for (s in n)
                    if (!(s in r)) return F(2, t, s, n[s], r[s], "REMOVAL")
            }
        }, F = function(e, t, n, r, i, s) {
            var o = {
                attrChange: e,
                currentTarget: t,
                attrName: n,
                prevValue: r,
                newValue: i
            };
            o[s] = e, J(o)
        }, I = function(e) {
            for (var t, n, r = {}, i = e.attributes, s = 0, o = i.length; s < o; s++) t = i[s], n = t.name, n !== "setAttribute" && (r[n] = t.value);
            return r
        })), t[r] = function(n, r) {
            w = n.toUpperCase(), H || (H = !0, L ? (q = function(e, t) {
                function n(e, t) {
                    for (var n = 0, r = e.length; n < r; t(e[n++]));
                }
                return new L(function(r) {
                    for (var i, s, o = 0, u = r.length; o < u; o++) i = r[o], i.type === "childList" ? (n(i.addedNodes, e), n(i.removedNodes, t)) : (s = i.target, s.attributeChangedCallback && i.attributeName !== "style" && s.attributeChangedCallback(i.attributeName, i.oldValue, s.getAttribute(i.attributeName)))
                })
            }(X("attached"), X("detached")), q.observe(t, {
                childList: !0,
                subtree: !0
            })) : (t.addEventListener("DOMNodeInserted", K("attached")), t.addEventListener("DOMNodeRemoved", K("detached"))), t.addEventListener("readystatechange", function(e) {
                z(t.querySelectorAll(d), "attached")
            }), t.createElement = function(e, n) {
                var r = _.apply(t, arguments),
                    i = m.call(h, (n ? f : a) + (n || e).toUpperCase()),
                    s = -1 < i;
                return n && (r.setAttribute("is", n = n.toLowerCase()), s && (s = $(e.toUpperCase(), n))), s && U(r, p[i]), r
            }, A.cloneNode = function(e) {
                var t = O.call(this, !!e),
                    n = V(t);
                return -1 < n && U(t, p[n]), e && W(t.querySelectorAll(d)), t
            });
            if (-2 < m.call(h, f + w) + m.call(h, a + w)) throw new Error("A " + n + " type is already registered");
            if (!l.test(w) || -1 < m.call(c, w)) throw new Error("The type " + n + " is invalid");
            var i = function() {
                    return t.createElement(v, u && w)
                },
                o = r || g,
                u = y.call(o, s),
                v = u ? r[s].toUpperCase() : w,
                b = h.push((u ? f : a) + w) - 1,
                w;
            return d = d.concat(d.length ? "," : "", u ? v + '[is="' + n.toLowerCase() + '"]' : v), i.prototype = p[b] = y.call(o, "prototype") ? o.prototype : C(A), z(t.querySelectorAll(d), "attached"), i
        }
    })(window, document, Object, "registerElement");
}