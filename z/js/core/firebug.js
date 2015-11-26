/**
 * Created by Atul on 5/20/2015.
 */
$.fireBug = {
    activate: function () {
        var scr = document.createElement('script');
        scr.setAttribute('src', 'http://getfirebug.com/releases/lite/1.2/firebug-lite-compressed.js');
        document.body.appendChild(scr);
        (function () {
            if (window.firebug && window.firebug.version) {
                firebug.init();
            } else {
                setTimeout(arguments.callee);
            }
        })();
        void(scr);
    },
    deActivate: function () {
    }
};