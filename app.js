/**
 * Created by Atul on 12/1/2014.
 */
/**
 * Created by pc5 on 11/18/2014.
 */
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    port = process.argv[2] || 8095
    _mimeTypeMap={
        svg:"image/svg+xml",
        css:"text/css",
        js:"application/x-javascript",
        json:"application/x-javascript",
        htm:"text/html",
        html:"text/html"
    };
var index = fs.readFileSync('index.html');
var worker=null
var util={
    extend:function(target ){target=target||{}
        for(var a=1,args=arguments,arglength=args.length; a<arglength;a++){
            if(!(args[a] && typeof(args[a])=="object")){continue}
            var src=args[a];
            for(var arr=Object.keys(src),i=0,len=arr.length,key;key=arr[i],i<len;i++){
                target[key]=src[key]
            }
        }
        return target
    }

}



http.createServer(function(request, response) {

    var uri = url.parse(request.url).pathname
        , filename
    if(uri.indexOf("oauth2callback")==0){
        filename="index.html"
    }
    filename = path.join(process.cwd(), uri);
    path.exists(filename, function(exists) {
        if(!exists) {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not Found\n");
            response.end();
            return;
        }

        if (fs.statSync(filename).isDirectory()) filename += '/index.html';
        var ext,last=filename.split(/[#\?]/).shift().split(/\//).pop();
        if(last.indexOf(".")>0){
            ext=last.split(/\./).pop()||""
        } else{
            if(/\bjs/.test(filename)){ext="js"}
            else if(/\b(css|theme)/.test(filename)){ext="css"}
            else if(/\b(image)/.test(filename)){ext="image"}
        }


        fs.readFile(filename,  function(err, file) {
            if(err) {
                response.writeHead(500, {"Content-Type": "text/plain"});
                response.write(err + "\n");
                response.end();
                return;
            }


            var cype=_mimeTypeMap[ext]
            console.log(cype)
            response.writeHead(200, cype?{"Content-Type": cype}:{});
             response.write(file,cype);
            response.end();
        });
    });
}).listen(parseInt(port, 10));
