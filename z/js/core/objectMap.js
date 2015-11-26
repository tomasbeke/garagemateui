/**
 * Created by Atul on 5/20/2015.
 */
try {
    $.objectMap = new WeakMap();
} catch(e){$.handleEx(e)}
$.objectMap.getOrCreate = (function () {
    var memkey = null, memval = null,meminitkey=null
    return function (ctx, initkey) {
        if (memkey !== null && memkey === ctx ) {
            if(memval && initkey && memval[initkey]==null){memval[initkey]=Object.create(null)}
            return initkey ? memval[initkey] : memval
        }
        if (ctx == null || !(typeof(ctx) == "object"|| typeof(ctx) == "function")) {
            throw new TypeError("Only objects for Weakmnap")
        }
        var nu = this.get(ctx);
        nu || (this.set(ctx, nu = Object.create(null)));
        if (initkey && !(initkey in nu)) {
            nu[initkey] = Object.create(null)
        }
        memkey = ctx;
        memval = nu;
        meminitkey=initkey;
        return initkey ? nu[initkey] : nu;
    }
})();