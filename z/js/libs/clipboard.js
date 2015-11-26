/**
 * Created by pc5 on 10/31/2014.
 */


$d.clipboard=(function(){
    /* Creates a new image from a given source */
    function createImage(source,onload) {
        var pastedImage = new Image();
        pastedImage.onload = function() {
            onload&&onload(this)
        }
        pastedImage.src = source;
        return pastedImage
    }
    return function(target){
        var el=$d(target)||$d(document),__pasteCatcher
        var elem=$d(target),_config={}
        function _catcher(){
            if (!__pasteCatcher) {
                __pasteCatcher = document.createElement("div");  // Firefox allows images to be pasted into contenteditable elements
                __pasteCatcher.style.position="absolute";__pasteCatcher.style.height="1px";__pasteCatcher.style.width="1px";
                __pasteCatcher.setAttribute("contenteditable", "");
                __pasteCatcher.tabIndex=1;
                __pasteCatcher.style.opacity = 0;
                document.body.appendChild(__pasteCatcher);
                __pasteCatcher.focus(); // as long as we make sure it is always in focus
                document.addEventListener("click", function() { __pasteCatcher.focus(); });
            }
            return __pasteCatcher
        }

        /* Handle paste events */
        function pasteHandler(e) {
            if (e&&e.clipboardData) {      // We need to check if event.clipboardData is supported (Chrome)
                // Get the items from the clipboard
                if (e.clipboardData.getData) {// Webkit - get data from clipboard, put into editdiv, cleanup, then cancel event
                    var data={} ,items=e.clipboardData.items
                    if(items){
                        for(var i=0,ln=items.length;i<ln;i++){
                            var it=items[i],d=e.clipboardData.getData(it.type)
                            if(d){
                                var t=it.type.indexOf("image")==0?"image":it.type.replace(/^(text)\/?/,"")
                                if(t=="image"){
                                    var blob = items[i].getAsFile(); // We need to represent the image as a file,
                                    var URLObj = window.URL || window.webkitURL;  // and use a URL or webkitURL (whichever is available to the browser)  to create a temporary URL to the object
                                    var source = URLObj.createObjectURL(blob);
                                    // The URL can then be used as the source of an image
                                    d=createImage(source);
                                }
                                data[t]={kind:it.kind,data:d,type:it.type}
                            }
                        }
                    }

                    processpaste(target, data);
                    if (e.preventDefault) {
                        e.stopPropagation();   e.preventDefault();
                    }

                    return false;
                }


            } else {   // If we can't handle clipboard data directly (Firefox),  we need to read what was pasted from the contenteditable element
                // This is a cheap trick to make sure we read the data  AFTER it has been inserted.
                setTimeout(checkInput, 1);
            }
            /* Parse the input in the paste catcher element */
            function checkInput() {
                var pasteCatcher=_catcher()

                var child = pasteCatcher.childNodes[0];   // Store the pasted content in a variable
                // Clear the inner html to make sure we're always getting the latest inserted content
                pasteCatcher.innerHTML = "";

                if (child) {var data=child.innerHTML
                    // If the user pastes an image, the src attribute
                    // will represent the image as a base64 encoded string.
                    if (child.tagName === "IMG") {
                        data=createImage(child.src);
                    }
                    processpaste(elem, data);
                }
            }
        }
        function _start( cnfg ) {
            if(typeof(cnfg)=="function"){_config.paste=cnfg;}
            else if($.isPlain(cnfg)){ $.extend(_config,cnfg);}
            elem.addEventListener ("paste", pasteHandler, false);
            elem.onpaste=pasteHandler
            if (!window.Clipboard) {_catcher()}
        }
        function processpaste ( target,content) {
            typeof(_config.paste)=="function" && _config.paste(target,content)

        }


        function _stop(){
            window.removeEventListener("paste", pasteHandler);

        }
        return {
            monitor:function(cnfg){
                cnfg===false?_stop(): _start(cnfg)
                return this
            },
            onpaste:function(fn){
                _config.paste= fn
                return this
            },
            oncut:function(){  _config.cut= fn
                return this
            },
            oncopy:function(){  _config.copy= fn
                return this
            }

        }
    }
})();
