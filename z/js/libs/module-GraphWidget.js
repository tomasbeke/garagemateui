    var worker = null,svgns="http://www.w3.org/2000/svg";
    var util = {
        extend: function (target) {
            target = target || {}
            for (var a = 1, args = arguments, arglength = args.length; a < arglength; a++) {
                if (!(args[a] && typeof(args[a]) == "object")) {
                    continue
                }
                var src = args[a];
                for (var arr = Object.keys(src), i = 0, len = arr.length, key; key = arr[i], i < len; i++) {
                    target[key] = src[key]
                }
            }
            return target
        },

        attrmap: {
            anchor: "text-anchor", color: "stroke", "background": "fill", "bg": "fill"
        }


    }

    function GraphWidget(data) {
        this.config = {}
        this._rendered = false;
        this.el = GraphWidget.makeEl()
         if (data  ) {
                 this.addSeries ( data)
         }

    }

    GraphWidget._worker = null
    GraphWidget.makeEl = function () {
        var worker = GraphWidget._worker
        if (!worker) {
            worker = document.createElement("div")
            worker.innerHTML = '\
         <svg width="100%" height="100%" >\
          <path d="M0 0, 1 1Z" stroke="black" class="txt-worker-path" stroke-width="1" fill="transparent"/>\
         <text x="0" y="15" class="txt-worker-text"> </text></svg>';
            worker.querySelector("path").style["-webkit-transition"] = worker.querySelector("path").style.transition = "all .5s ease"
            GraphWidget._worker = worker

        }
        var nu = worker.cloneNode(true);
        nu.style["-webkit-transition"] = nu.style.transition = "all .5s ease"
        return nu

    }
    GraphWidget.prototype.addText = function (text, style) {
        if (text && typeof(text) == "object") {
            var isarr = Array.isArray(text)
            for (var arr = Object.keys(text), i = 0, len = arr.length, key; key = arr[i], i < len; i++) {
                this.addText(isarr ? text[key] : key, isarr ? style : util.extend({}, style, text[key]))
            }
            return this
        }
        var txt = this.el.appendChild(this.el.querySelector(".txt-worker-text").cloneNode(true))
        if(txt.classList){txt.classList.remove("txt-worker-text")}
        else{
            txt.className=String(txt.className).replace(/\s*txt\-worker\s*/g,"")
        }
        txt.textContent = String(text);
        if (style) {
            for (var arr = Object.keys(style), i = 0, len = arr.length, key; key = arr[i], i < len; i++) {
                this.attr(key, style[key], txt)
            }
        }
        return this;
    }
    GraphWidget.prototype.parse = function (data) {
        if (data) {
            if (typeof(data) == "string") {
                data = data.split(/\s*[,\s]+\s*/).map(Number)
            }
            if (Array.isArray(data)||Array.isArray(data.data||data.points)) {
               return data;
            }
        }
    }
    GraphWidget.prototype.buildPath = function (data) {
        if(Array.isArray(data)){data={points:data,attr:{}}}
         var vals = data.points||data.data,attr=data.attr,path = [], x=0,ht= 0,pel
        if(vals.data){data=vals;vals=vals.data;}
        attr=attr||data.attr||{}
        if(data.type=="line"){
            path.push("M" + vals[0][0] + " " + vals[0][1], "L " + vals[1][0] +" "+vals[1][1] )
        } else {
            var minval=20,max = Math.max.apply(Math, vals), min = Math.min.apply(Math, vals), mid = min + (max - min / 2),
                first = vals.shift(), last = vals[vals.length - 1]
            ht = mid * 2 + 40, offset = (mid - min);
            //first=Math.max(minval,first)
            if (vals.length % 2) {
                vals.push(last)
            }
            if (data.smooth) {
                x = 0
                while (vals.length >= 2) {
                    x += 5
                    var p = "S " + x + " " + (offset + vals.shift())
                    x += 5;
                    p += ", " + x + " " + (offset + vals.shift())
                    path.push(p)
                }
            } else {
                x = 0
                while (vals.length) {
                    x += 5
                    path.push("L " + (x) + " " + (offset + vals.shift()))
                }
            }
            path.unshift("M0" + " " + first )
            ht=ht - 20
            path.push("L" + x + " " + ht, "L0 " + ht, "L0 " + first + "Z")
        }
        if(!path.length){return}

        pel = this.el.querySelector("path").cloneNode(true)
        this.attr("d", path.join(" "),pel)


        //this.config.viewBox = vw;
        //this.attr("viewBox", vw.join(" "));
        if (attr && typeof(attr) == "object") {
            for (var arr = Object.keys(attr), i = 0, len = arr.length, key; key = arr[i], i < len; i++) {
                if(key=="style"){

                } else if(key=="klass"||key=="class"||key=="className"){

                }
                else{this.attr(key, attr[key],pel)}
            }
        }
        var vw = [0, 0, x||0, ht||0];
        data.viewBox = vw;
        data.path = pel;
        return data;
    }
    GraphWidget.prototype.addSeries = function (name,data) {
        if(data==null&&name){data=name.data||name;name=name.name||name.label}
        if(!data){return}
        data=this.parse(data)
        if(!data){return}
        name=name||"_";
        this.config.data=this.config.data||[];
        this.config.data.push({name:name,data:data});
        return this;
    }
    GraphWidget.prototype.addLine = function (name,from, to,attr) {
         name=name||"_";
        this.config.data=this.config.data||[];
        this.config.data.push({name:name,line:true,type:"line",attr:attr,data:[from,to]});
        return this;
    }
    GraphWidget.prototype.render = function (data, dom) {
        if (data && data.nodeType) {
            dom = data;
            data = null
        }
        if (data) {
            this.addSeries("",data)
        }
         if(this.config.data){
            this.config.data=this.config.data.map(function(k){
                return this.buildPath(k)
            },this);
        }
        if (this.config.data.length) {
            var vw = [0, 0, 240, 170];
            this.config.data.forEach(function (p) {
                if (p.viewBox) {
                    vw[2] = Math.max(vw[2], p.viewBox[2]);
                    vw[3] = Math.max(vw[3], p.viewBox[3])
                }

                p.path = this.el.appendChild(p.path)
               // p.path.dataset.key= p.name||"_"
              /*  p.path.hilite = function () {
                    this.style.opacity=1
                    for (var l = this.parentNode.querySelectorAll("path"), i = 0; i < l.length; i++) {
                        if (l[i]!==this){if(!l[i].dataset || l[i].dataset.key=="_"){continue}
                            l[i].style.opacity=.1
                        }
                    }
                }
                p.path.onmouseover = function () {
                    this.hilite()
                }*/
            }, this)
            if (this.config.id && !GraphWidget._cache[this.config.id]) {
                GraphWidget._cache[this.config.id] = this.el.cloneNode(true)
            }
            this.config.viewBox = vw;
            this.attr("viewBox", vw.join(" "));
            this._rendered = true;
            this.el._pending=0
            /*this.el.onmousemove = function (ev) {
                if(ev.target.tagName==="path"){return}
                if(ev.target.tagName==="text" && ev.target.dataset&& ev.target.dataset.key){if(ev.target.dataset.key=="_"){return}
                    var p=this.querySelector("path[data-key='"+(ev.target.dataset.key)+"']")
                    if(p&& p.hilite){p.hilite()}
                    return
                }
                if(this._pending!=2){
                    if(!this._pending){
                        this._pending=1
                        setTimeout(function(){this._pending=2}.bind(this),1000)
                    }
                    return
                }
                this._pending=0
                for (var l = this.querySelectorAll("path"), i = 0; i < l.length; i++) {
                        l[i].style.opacity=1

                }

            }*/
        }
        if (dom) {
            this.appendTo(dom)
        }

        return this;
    }
    GraphWidget.prototype.cleanUp=function(){
        var wrkr=this.el.querySelector(".txt-worker-text")
        if(wrkr){wrkr.parentNode.removeChild(wrkr)}
        wrkr=this.el.querySelector(".txt-worker-path")
        if(wrkr){wrkr.parentNode.removeChild(wrkr)}
    }
    GraphWidget.prototype.attr = function (nm, val, el) {
        var pathel, ns = nm.indexOf(":") > 0 ? "http://www.w3.org/2000/svg" : null;//'
        nm = util.attrmap[nm] || nm
        if (el) {
            el.setAttributeNS(ns, nm, val)
            return this
        }

        if (nm == "d" || nm == "stroke" || nm == "fill") {
            pathel = this.el.querySelector("path")
            pathel.setAttributeNS(ns, nm, val)
            return
        }
        this.el.setAttributeNS(ns, nm, val)
        return this;
    }
    GraphWidget.prototype.clone = function (data) {
        var nu = new GraphWidget(data);
        nu.el = this.el.cloneNode(true)
        for (var i = 0, arr = Object.keys(this.config), length = arr.length, key; key = arr[i], i < length; i++) {
            if (key == "id" || key == "data") {
                continue
            }
            if (this.config[key] && typeof(this.config[key]) == "object") {
                nu.config[key] = JSON.parse(JSON.stringify(this.config[key]))
            }
            else {
                nu.config[key] = this.config[key]
            }
        }
        nu._rendered = this._rendered
        return nu
    }
    GraphWidget.prototype.getMarkup = function () {
        if (this.el.outerHTML) {
            return this.el.outerHTML
        } else {
            var div = document.createElement("div")
            div.appendChild(this.el)
            var str = div.innerHTML;
            div = null;
            return str;
        }
    }
    GraphWidget.prototype.writePNGResponse = function (reqquery, response, query) {

        jsdom = require('jsdom'),
            child_proc = require('child_process'),
            w = 400,
            h = 400,
            htmlStub ,
            markup = this.getMarkup();

        response.writeHead(200, {'Content-Type': 'image/png'});
        var convertWorker = child_proc.spawn(),
            values = query['data'] || ".5,.5"
                    .split(",")
                    .map(function (v) {
                        return parseFloat(v)
                    });

        convertWorker.stdout.on('data', function (data) {
            response.write(data);
        });
        convertWorker.on('exit', function (code) {
            response.end();
        });
        htmlStub = '<!DOCTYPE html><div id="graph" style="width:' + w + 'px;height:' + h + 'px;">' + markup + '</div>'
        jsdom.env({
            features: {QuerySelector: true}, html: htmlStub, done: function (errors, window) {
                var svgsrc = window.document.querySelector(".graph").innerHTML
                convertWorker.stdin.write(svgsrc);
                convertWorker.stdin.end();
            }
        });
    }
    GraphWidget.prototype.writeResponse = function (request, response) {
        var query = url.parse(request.url, true).query
        if (query.png) {
            return this.writePNGResponse(query, response)
        }
        response.setHeader("Content-Type", "image/svg+xml")
        response.write(this.getMarkup());
        response.end();
    }

    GraphWidget.prototype.appendTo = function (dom, clear, force) {

        if (dom) {
            if (typeof(dom) == "string") {
                dom = document.querySelector(dom)
            }
            if (dom && dom.nodeType) {
                if (clear) {
                    while (dom.firstChild) {
                        dom.removeChild(dom.firstChild)
                    }
                }
                if (!this._rendered || force) {
                    this.el = dom.appendChild(GraphWidget.makeEl().firstElementChild.cloneNode(true))//querySelector("svg")
                    this._rendered = false
                } else {
                    this.el = dom.appendChild(this.el)
                }
                this.el.querySelector("path").style["-webkit-transition"] = this.el.querySelector("path").style.transition = "all .5s ease"
            }
        }
        if (!this._rendered || this.data) {
            this.render()
        }
        return this
    }
    GraphWidget._cache = {}
    GraphWidget.create = function (config) {
        if (config && config.id && GraphWidget._cache[config.id]) {
            return GraphWidget._cache[config.id].clone();
        }
        return new GraphWidget(config);
    }

module.exports=    GraphWidget