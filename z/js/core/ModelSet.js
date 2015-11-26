/**
 * Created by Atul on 5/20/2015.
 */


$.modelSet = Klass("$.modelSet", (function () {
        var proto = {
            items: null, itemKlass: null, name: null, nameProp: "", nameMap: null,
            init: function () {
                this.setup()
            },
            setup: function () {
                this.nameMap={}
                if (this.itemKlass) {
                    this.items = List.create(this.items || []).chainable(this.itemKlass)
                } else {
                    this.items = List.create(this.items || []);
                }
                if (this.itemAlias) {
                    var al = String(this.itemAlias);
                    al = al.charAt(0).toUpperCase() + al.substr(1)
                    this["update" + al + "s"] = this.updateItems
                    this["find" + al] = this.find
                }
            },
            getNames: function () {
                return this.items.collect(this.nameProp || "name")
            },
            updateItems: function (map) {
                $.each(map, function (v, k) {
                    var f
                    if (f = this.find(k)) {
                        f.updateProperties(v);
                    }
                }, this)
            },
            findAll: function (k) {
                return this.items.findAll(k)
            },

            find: function (k, extndd) {
                if (typeof(k) == "string") {
                    var r = this.nameMap[this.normalizeName(k)]
                    if (!r && extndd && !/id$/.test(k)) {
                        r = this.nameMap[this.normalizeName(k + "_id")]
                    }
                    if (r) {
                        return r;
                    }
                }
                var col = (typeof(k) == "number" && !isNaN(k)) ? this.items.findById(k) : this.items.find(k)
                if (!col) {

                    console.log( k)
                }
                return col
            },
            prep: function (v) {
                return v
            },
            at:function(i){
                if(typeof(i)=="number" && !isNaN(i)){
                    return this.items[i]
                }
            },
            size: function () {return this.items.length},
            add: function () {
                if (arguments.length == 1 && Array.isArray(arguments[0])) {
                    for (var i = 0, l = arguments[0], ln = l.length; i < ln; i++) {
                        this.add(l[i])
                    }
                    return this
                }
                var v = this.prep.apply(this, arguments)
                if (v) {
                    var v1 = v;
                    var kls = this.itemKlass;
                    if (kls && !(v instanceof kls)) {
                        v1 = kls.newInstance?kls.newInstance(v):new kls(v)
                    }
                    this.items.add(v1)
                    if (this.nameProp&&v1[this.nameProp]) {
                        this.nameMap[this.normalizeName(v1[this.nameProp])] = v1
                    }
                }
                return this
            },
            remove: function (i) {
                var v = this.find(i)
                if (v) {
                    this.items.remove(v)
                }
                return this
            },
            eachItem: function (fn, ctx) {
                this.items.each(fn, ctx || this);
                return this

            },
            collect: function (fn, ctx) {
                return this.items.collect(fn, ctx || this)
            },
            normalizeName: function (k) {
                return k
            }
        }

        return proto;
    })()
);
