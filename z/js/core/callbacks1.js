/**
 * Created by Atul on 12/6/2014.
 */

;
$.callbacks=function(typ,delegat,opt) {
    return (function(type,delegate,options) {
        var innerlist = [], _type = type, state = 1, lastargs, _delegate = delegate, _eventSourcehandle = null;
        options = options || {}
        function _resetIndex() {
            for (var i = 0, ln = innerlist.length; i < ln; i++) {
                innerlist[i].index = i
            }
        }

        function _invoke(fn, ctx, args, o) {
            var memo = {
                ctx: (o ? o.ctx : null) || _delegate,
                args: args
            }, filter = (o ? o.filter : null) || options.filter, argsResolver = (o ? o.argsResolver : null) || options.argsResolver
            if (argsResolver) {
                if (argsResolver(memo) === false) {
                    return
                }
            }
            if (filter && typeof(filter) == "function" && !filter.apply(memo.ctx || null, memo.args)) {
                return
            }
            //try {

            return fn.apply(memo.ctx, memo.args || [])
            //} catch(e){

            //}
        }

        function _getHandle(fn, id) {
            if (fn && typeof(fn) === "string") {
                id = fn;
                fn = null
            }
            for (var i = 0, ln = innerlist.length, h; h = innerlist[i], i < ln; i++) {
                if ((id && h.optns.id === id) || (fn && h.fn === fn)) {
                    return h
                }
            }
        }

        var dispatcher = {
            dispatch: function _dispatch(type,args) {//argarr ...
                if (state == 1) {

                    var args = [].slice.call(args), torem = []
                    if(args[0]&&({}).toString.call(args[0])=="[object Arguments]"){args=[].slice.call(args[0]).concat(args.slice(1)||[])}
                    if(!type&&args[0]&&args[0].type){
                        type=args[0].type
                    }
                    lastargs = args.slice();

                    for (var i = 0, ln = innerlist.length, h; h = innerlist[i], i < ln; i++) {
                        var o = h.optns || {}, fnargs = (o.args && o.args.length) ? o.args.concat(args) : args
                        if(o.type&&type&&!(o.type=="*"|| o.type==type)){
                            continue
                        }
                        try {
                            var res = _invoke(h.fn, fnargs, o)
                            if (o.once) {
                                torem.push(i)
                            }
                        } catch (e) {  }
                    }
                    while (torem.length) {
                        innerlist.splice(torem.pop(), 1)
                    }
                }
            }
        }
        if (_type && delegate && delegate.addEventListener) {
            _eventSourcehandle = function (ev) {
                dispatcher.dispatch(ev.type,[ev])
            };
            (delegate.el || delegate).addEventListener(_type, _eventSourcehandle)
        }
        return {

            throttle: function (delay) {
                dispatcher.origdispatch || (dispatcher.origdispatch = dispatcher.dispatch)
                dispatcher.dispatch = (function (orig, d) {
                    var busy = 0, time = Number(d) || 100, fn = orig
                    return function (type,args) {
                        if (busy) {
                            return
                        }
                        fn(type,args)
                        busy = setTimeout(function () {
                            busy = 0;
                        }, time)
                    }
                })(dispatcher.origdispatch, delay)
            },
            debounce: function (delay) {
                dispatcher.origdispatch || (dispatcher.origdispatch = dispatcher.dispatch)
                dispatcher.dispatch = (function (orig, d) {
                    var busy = 0, time = Number(d) || 100, fn = orig, que = []

                    function _runner() {
                        busy = 0;
                        if (que.length) {var a=que.shift()
                            a&&fn(a[0],a[1])
                        }
                        if (que.length) {
                            busy = setTimeout(_runner, time)
                        }
                    }

                    return function (type,args) {
                        que.push([type,[].slice.call(arguments)]);
                        busy ? null : _runner()
                    }
                })(dispatcher.origdispatch, delay)
            },
            dispatchType: function (type) {
                if (!state) {
                    return
                }
                dispatcher.dispatch(type,arguments.length==2&&arguments[1]?arguments[1]:[].slice.call(arguments,1))
            },
            dispatch: function ( ) {
                if (!state) {
                    return
                }
                dispatcher.dispatch(null,arguments.length === 1 ? arguments[0] : arguments)
            },
            isPaused: function () {
                return state == -1
            },
            isStopped: function () {
                return !state
            },
            stop: function (memory) {
                if (!state) {
                    return
                }
                innerlist.length = 0;
                state = 0;
                if (memory != null) {
                    if (memory === true) {
                        memory = lastargs
                    }
                    if (!Array.isArray(memory)) {
                        memory = [memory]
                    }
                    options.memory=memory
                }
            },
            destroy: function () {
                this.stop();
                innerlist = lastargs = _delegate = optionsmemory = null
            },
            pause: function () {
                if (state == 1) {
                    state = -1
                }
            },
            resume: function () {
                if (state == -1) {
                    state = 1
                }
            },
            isEmpty: function () {
                return !(innerlist && innerlist.length)
            },
            add: function (fn, opts) {
                if (!state) {
                    return
                }
                if (typeof(fn) == "string") {
                    if (typeof(console[fn]) == "function") {
                        fn = console[fn].bind(console)
                    }
                    else if (_delegate && typeof(_delegate[fn]) == "function") {
                        fn = _delegate[fn]
                    }
                    else if (typeof(Math[fn]) == "function") {
                        fn = Math[fn]
                    }
                    else if (typeof(self[fn]) == "function") {
                        fn = self[fn]
                    }
                }
                if (typeof(fn) != "function") {
                    return
                }
                if (this.isStopped()) {
                    if (options.memory) {
                        _invoke(fn, null, options.memory)
                    }
                    return;
                }
                var o = {}
                if (opts && typeof(opts) == "object") {
                    o = opts
                }
                else if (typeof(opts) == "string") {
                    o.id = opts
                }
                else if (typeof(opts) == "boolean") {
                    o.once = opts
                }
                if (this._sticky) {
                    o.once = true;
                }
                if (!_getHandle(fn, o.id)) {
                    innerlist.push({fn: fn, id: o.id,type: o.type,optns: o, index: innerlist.length})
                }
                if (this._sticky) {
                    if (lastargs) {
                        this.dispatch(lastargs)
                    }
                }
            },
            remove: function (fn) {
                if (!state) {
                    return
                }
                var h;
                if (h = _getHandle(fn)) {
                    innerlist.splice(h.index, 1)
                    _resetIndex()
                }
                if (!innerlist.length && _eventSourcehandle && _delegate && _delegate.removeEventListener) {
                    _delegate.removeEventListener(_type, _eventSourcehandle);
                    _eventSourcehandle = null;
                }
            }
        }
    })(typ,delegat,opt);
};