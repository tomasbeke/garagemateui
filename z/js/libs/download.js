/**
 * Created by pc5 on 10/31/2014.
 */
Util.download=(function( ){
    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder ||
        window.MozBlobBuilder || window.MSBlobBuilder;
    window.URL || (window.URL = window.webkitURL);
    window.saveAs || ( window.saveAs = (
        window.navigator.msSaveBlob ? function(b,n){ return window.navigator.msSaveBlob(b,n); } : false) ||
        window.webkitSaveAs || window.mozSaveAs || window.msSaveAs || (function(){
        // URL's

        if(!window.URL){ return false;  }
        return function(b,name,type){type=type||'text/text'
            var url;
            if(typeof(BlobBuilder)!="undefined"){
                var bb = new BlobBuilder();
                bb.append('body { color: red; }');
                var blob = bb.getBlob(type);

                url = URL.createObjectURL(blob); // Test for download link support
            }   else{
                url='data:' + type + ';base64,' + self.btoa(b);
            }


            if( "download" in document.createElement('a') ){
                var a = document.createElement('a');
                a.setAttribute('href', url);
                a.setAttribute('download', name);
                var clickEvent = document.createEvent ("MouseEvent");// Create Click event
                clickEvent.initMouseEvent ("click", true, true, window, 0,
                    clickEvent.screenX, clickEvent.screenY, clickEvent.clientX, clickEvent.clientY,
                    clickEvent.ctrlKey, clickEvent.altKey, clickEvent.shiftKey, clickEvent.metaKey,
                    0, null);
                a.dispatchEvent (clickEvent);// dispatch click event to simulate download
            }
            else{ window.open(url, '_blank', ''); // fallover, open resource in new tab.
            }
        };

    })() );
    return window.saveAs
})()