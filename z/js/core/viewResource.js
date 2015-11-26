/**
 * Created by Atul on 5/20/2015.
 */
$.viewResource = function (url, type) {
    var d;
    if (typeof(url) == "number" || !isNaN(url)) {
        url = "router?attachment&info=1&id=" + url + "&asurl=1&download=1";
        type = "url"
    }
    if (type == "url") { //
        ResURL.from(url).load(function (d) {
            var u = d.url
            if (u) {
                var u1 = u//"http://docs.google.com/viewer?url="+encodeURIComponent(u)
                //var d = View.Dialog({resizable: true, url: u1})
                d.show()
            }
        })
    } else {
        //var d = View.Dialog({resizable: true, url: url})
        d.show()
    }

    return d;
}
