function MutationRecord() {
    var NILL = { }
     function defaultcComparator(a, b) {
        //if(a==null||b==null||!(Object(a)==a && Object(a)==a )){return a==b}
        return a === NILL ? -1 :
            a == b ? 0 : a > b ? 1 : -1
    }
     var primitives = {"number": Number, "string": String, "boolean": Boolean}
     function isPrimitive(a) {
        return primitives[typeof(a)]
    }

    function deacacivate(ths, a) {

        for (var i = 0, l = ["getVal", "setVal", "toggleBlock", "addBreakPoint", "isModified"], ln = l.length, fn; fn = l[i], i < ln; i++) {
            fn && (ths[fn] = function () {
                console.log("deactivated")
            });
        }
        return primitives[typeof(a)]
    }

    function MutationRecord(name, config) {
        if(!(this instanceof MutationRecord)){return new MutationRecord(name, config)}
        config = config || {}
        var callback = null
        if (typeof(config) == "function") {
            callback = config;
            config = {}
        }
        else {
            callback = config.callback
        }
        config.comparator = config.comparator || defaultcComparator
        var _inner = {ver: 0, L: [], O: NILL, V: NILL, breakPoints: {}}
        var __record__={}
        Object.defineProperties(__record__, {
            ver: {
                get: function () {
                    return _inner.ver
                }, set: function () {
                }, configurable: true, enumerable: false
            },
            name: {value: name, writable: false, configurable: false, enumerable: true},
            value: {
                get: function () {
                    return _inner.V === NILL ? null : _inner.V
                }, set: function () {
                }, configurable: false, enumerable: true
            },
            newValue: {
                get: function () {
                    return this.value
                }, set: function () {
                }, configurable: false, enumerable: true
            },
            oldValue: {
                get: function () {
                    return _inner.O === NILL ? null : _inner.O
                }, set: function () {
                }, configurable: false, enumerable: true
            },
            memo: {value: {}, configurable: true, writable: false, enumerable: false},
            log: {value: _inner.L, configurable: false, writable: false, enumerable: false}
        });

        Object.preventExtensions && Object.preventExtensions(__record__);

        var logIdx = 0, blocked = null;
        var listeners = [];
        if (typeof(callback) === "function") {
            listeners.push(callback)
        }
        function _dispatch() {var torem=null
            for (var i = 0, l = listeners, ln = l.length, fn; fn = l[i], i < ln; i++) {
                if(!fn){continue;}
                if(fn.call(this, __record__)===false){
                    (torem||(torem=[])).push(i);
                }
            }

            if(torem){while(torem.length)listeners.splice(torem.pop(),1);}
        }

        this.deactivate = function () {
            deacacivate(this)
            while (listeners.length) {
                listeners[0] = null;
                listeners.shift()
            }
             __record__=null;
        }
        this.onchange = function (fn, config) {
            var idx = listeners.indexOf(fn)
            if (idx >= 0) {
                if (config === false) {
                    listeners.slice(idx, 1)
                }
            } else {
                listeners.push(fn)
            }

        }
        this.setVal = function (v, label) {
            var I = _inner, t = v === null ? "null" : typeof(v),nill=curr===NILL,curr=nill?null:I.V;
            if (nill || t !== I.T || !config.comparator(curr, v, t)) {
                if(config.validator && !config.validator(I.V===NILL?null:I.V, v,this)){
                    return
                }
                I.T = t
                if(nill){I.orig=v}
                I.logIdx = I.log.push(I.O = I.V) - 1;
                I.label = label;
                I.V = v;
                I.V++;
                _dispatch();
            }
            return;
        }
        this.getVal = function () {
            return _inner.V;
        }
        this.toggleBlock = function (addblock) {
            blocked = true;
        }
        this.addBreakPoint = function (breakpoint) {
            if (breakpoint == null) {
                breakpoint = _inner.ver
            }
            _inner.breakPoints || (_inner.breakPoints[breakpoint] = [_inner.V]);
            return breakpoint;
        }
        this.isModified = function (sincebreakpoint) {
            if(I.V===NILL){return false}
            return sincebreakpoint ? (_inner.breakPoints[sincebreakpoint] && sincebreakpoint[0] == _inner.V) : !(_inner.V === _inner.orig)

        }
    }

    return MutationRecord
}