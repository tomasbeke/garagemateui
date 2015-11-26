/**
 * Created by Atul on 5/20/2015.
 */
$.controller = (function () {
    function _controller(view) {
        this._scope = view;
        this._methods = {log: function () {
            console.log.apply(console, arguments)
        }}
        this._methods.print = this._methods.log;
        this._methods.alert = self.alert.bind(self);
    }

    _controller.prototype = {
        bind: function (nm, args) {
            return function (nm, a0) {
                var a = [].slice.call(arguments, 2)
                var args = [].concat(a0, a)
                return this.invoke(nm, args)
            }.bind(this, nm, args)
        },
        invokeFor: function (nm,arg) {
            if(typeof(this[nm])=="function"){return arg?this[nm].bind(this,arg):this[nm].bind(this)}
            return this.invoke.bind(this,nm)
        },
        hasMethod:function(nm){return (nm in this._methods) || typeof(this._scope[nm])=="function"},
        setPropertyValue: function (nm, val) {
            var owner=this._scope,prop=nm
            if(nm.indexOf(".")>0){
                var arr=nm.split(".");prop=arr.pop();
                owner=  arr.reduce(function(m,k){
                    return m?m[k]:null
                },this._scope);

            }
            if(owner){var curr=owner[prop]
                owner[prop]=val
                return curr;
            }
        },
        getPropertyValue: function (nm, val) {
            var owner=this._scope,prop=nm
            if(nm.indexOf(".")>0){
                var arr=nm.split(".");prop=arr.pop();
                owner=  arr.reduce(function(m,k){
                    return m?m[k]:null
                },this._scope);

            }
            if(owner){
                return owner[prop]
            }
        },
        invoke: function (nm, args) {
            if (args == null) {
                args = []
            }
            else if (typeof(args) != "object") {
                args = [args]
            }
            if (typeof(this[nm]) == "function") {
                return this[nm].apply(this, Array.isArray(args) ? args : args.length?[].slice.call(args):[args])
            }
            var mthd = this._methods[nm]  || (this._scope || {})[nm]
            if (typeof(mthd) == "function") {
                return mthd.apply(this._scope, Array.isArray(args) ? args : args.length?[].slice.call(args):[args])
            } else{
                console.log("controller fn not found:"+nm)
            }
            return null
        },
        add: function (nm, m) {
            if (typeof(nm) == "function") {
                m = nm;
                nm = m.name|| m._name
            }
            if(!nm){return null}
            this._methods[nm] = m//Function("return this.invoke('"+nm+"',[].slice.call(arguments))")
            return this
        }, mixin: function (obj, nooverwrite) {
            var mm = this._methods;
            $.each(obj, function (v, k) {
                if (typeof(k) == "string" && isNaN(k) && typeof(v) == "function") {
                    if (nooverwrite && typeof(mm[k]) == "function") {
                        return
                    }
                    mm[k] = v
                }
            })
            return this
        }
    }
    if (typeof(console) != "undefined")
        _controller.create = function (vw, obj) {
            if (!vw || typeof(vw) != "object" || $.isPlain(vw)) {
                obj = typeof(vw) == "object" ? vw : null
                vw = null;
            }
            var nu = new _controller(vw)
            if (obj) {
                nu.mixin(obj)
            }
            return nu
        }
    return _controller
})();
