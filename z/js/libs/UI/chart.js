UI.Chart = Klass("Chart",

    {   conntainer:null,config:null,id:null,type:null,chartData:null,
        parts:[],
        init:function(){
            var defchartData={
                height:0,width:0,title:"",labels:[],values:[],
                data:{},valuesByPerc:[],ValueSum:null,
                rootEl:null,gEl:null,
                parts:{}
            }
            if(this.chartData){
                var nu=this.chartData;
                var nuchartData=$.LinkedMap(defchartData,{defineasfield:true})
                $.each(nu,function(v,k){
                    if(!k || v==null ){return}
                    if(k in defchartData){
                        nuchartData.set(k,v)
                    } else{nuchartData.get("data")}
                })

                this.chartData.each(function(it){

                })
            }

            this.chartData={
                height:0,width:0,title:"",labels:[],values:[],data:{},valuesByPerc:[],ValueSum:null,
                rootEl:null,gEl:null,
                parts:{}
            }
        },
        render:function(){

        },
        redraw:function(){

        },

        findPart:function(srch){
            if(srch==null){return null}
            var ret
            if(typeof(srch)=="string"){

            } else if(typeof(srch)=="object"&&"x" in srch&&"y" in srch){

            }else if(typeof(srch)=="number"&&arguments.length==2){

            }
            return ret

        },
        renderPart:function(){

        },
        renderSeries:function(){

        },
        prep:function(){
            var h=this.container.clientHeight,w=this.container.clientWidth,c=this.config||{}
            var chart = document.createElementNS(svgns, "svg:svg"),
                chartgroup = document.createElementNS(svgns, "g");
            chart  =this.container.appendChild(chart)
            g=config.chart.appendChild(chartgroup)
            for(var i = 0; i < .length; i++) {total += config.data[i]; }
            this.chartData={
                height:w-20,width: h-30,title: c.title,
                labels:[],values:[],data:{},valuesByPerc:[],ValueSum:null,colors:[],
                rootEl:chart,
                gEl:g,
                parts:{}
            }
            var
                config={parts:{}},
                data, width, height, cx, cy, r, colors, labels, lx, ly

            lx=1;ly=1
            config.r=Math.min(config.height/2 - 5,config.width/2)
            config.cx=(config.width/2)+10;        config.cy=(config.height/2)+30

            config.width=w-20;
            config.height=h-30
            config.colors=ccolors;
            config.title=title
            config.labels=Object.keys(parts)
            config.data=config.labels.map(function(k){return parts[k]})
            //var c=pieChart(data, w, h,cx, cy,r, ccolors, labels)

            if(config.g.classList){config.g.classList.add("chart-elem-group")}

            var total = 0;// Add up the data values so we know how big the pie is
            for(var i = 0; i < config.data.length; i++) {total += config.data[i]; }
            var startangle = 0;
            for(var i = 0; i < config.labels.length; i++) {
                var  part={
                    label:config.labels[i],value:config.data[i],angle:360*(config.data[i]/total),
                    elem:null,labelelem:null    ,index:i+1   , id:config.labels[i],
                    startangle:startangle ,color:ccolors[i]
                }
                part.endangle=(startangle =part.startangle + part.angle),
                    part.delta=(part.endangle-part.startangle)/2
                config.parts[config.labels[i]]=part
                makeSlice(part,config)
            }
        } ,
        addSeries:function(label,data){

        }

    }
);
UI.Chart.PIE = Klass("ui.Chart.pie",UI.Chart,{
    render:function(){


    }
});





    var svgns = "http://www.w3.org/2000/svg",PI=Math.PI,ccolors=["#ff0000","#00ff00","#0000ff","#ffffee","#ff00ff","#ffff00","#ff8888","#ffff88","#88ffff","#888888"];
    function svgattr(el){
        var a=[].slice.call(arguments,1)
        while(a.length>1){
            el.setAttribute(a.shift(), String(a.shift()));
        }
        return el
    }
    function rad(angleInDegrees){
        return (angleInDegrees * PI) / 180.0;
    }
    function mousepos(ev){
        return {x:ev.x,y:ev.y};
    }

    if(!window.requestAnimationFrame){
        window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };

    }

    var Tips=function(config){
        config.tipG=document.createElementNS(svgns, "g")
        svgattr(config.tipG,"opacity",".7","viewBox", "0 0 200 30");
        config.tip=document.createElementNS(svgns, "rect")
        svgattr(config.tip,"width", 200,"x", 1,"y", 1,"height", 30,"opacity",".7");
        config.tipG.appendChild(config.tip)
        config.tiplabel=document.createElementNS(svgns, "text")
        svgattr(config.tiplabel,"fill","white","x",10,"y",20,"opacity","1","text-anchor","left","font-family", "sans-serif","letter-spacing",".1em","font-size", "12")
        config.tipG.appendChild(config.tiplabel)
        //config.chart.appendChild(config.tip)
        config.chart.appendChild(config.tipG)
        //config.tip.style.display="none"
        config.tiplabel.style.zIndex=10

        config.tipG.style.display="none"


        if(!config.mv){
            config.currentzoom=null
            var posTip=function(ev,part,config){
                var ofset=config.chart.getBoundingClientRect(),p=mousepos(ev),
                    x=Math.max(10,(p.x-ofset.left)+ 10), y=Math.max(10,p.y-(ofset.top+ 10))
                //svgattr(config.tip,"x",x, "y",y)
                //svgattr(config.tiplabel,"x",x+5, "y",y+20)
                svgattr(config.tipG,"transform","translate("+x+","+y +")")
                while(config.tiplabel.firstChild){config.tiplabel.removeChild(config.tiplabel.firstChild)}
                config.tiplabel.appendChild(document.createTextNode(part.value+" :: "+part.label));
                //config.tip.style.display="block"
                config.tipG.style.display="block"
                if(config.tipG.classList){config.tipG.classList.add("chart-tip")}
            }
            var mv=function(ev){
                if(config.dragging){return}
                if(!(ev.target&&ev.target.classList)){return}
                var target=ev.target
                if(target&&String(target.tagName).toUpperCase()=="TSPAN"){target=target.parentNode}
                if(target&&String(target.tagName).toUpperCase()=="TEXT"){target=target.previousElementSibling||target.previousSibling}
                if(!target){return}
                var slice=target.classList.contains("chart-slice")?target:null;
                if(slice&&slice.setAttribute&&slice.dataset&&slice.dataset.id){
                    var id=slice.dataset.id
                    var part=config.parts[id];if(!part){return}

                    if(config.currentzoom&&config.currentzoom.id===id){posTip(ev,part,config);return}
                    if(config.currentzoom){
                        makeSlice(config.currentzoom,config)
                        document.getElementById(config.currentzoom.elem).style.zIndex=10
                    }


                    if(!part._saved){part._saved=JSON.stringify(part);}

                    var copy={}
                    Object.keys(config).forEach(function(k){copy[k]=config[k]});
                    copy.startangle=config.startangle-10;
                    copy.endangle=config.endangle+10
                    copy.r=config.r+10
                    makeSlice(part,copy)
                    document.getElementById(part.elem).style.zIndex=11
                    config.currentzoom=part
                    var curr=[ev,part,config]
                    window.requestAnimationFrame(function(){if(!curr.length){return}
                        posTip.apply(null,curr);curr.length=0;
                    })

                }
            }
            config.g.addEventListener("mousemove",mv)
            config.mv=mv
        }
    }
     function chart(container,type,data,config){

     }

var PIE= function(){

    function makeSlice(part,chart) {
        var cx=chart.cx,cy=chart.cy,r=chart.r
        var x1 = cx + r * Math.sin(rad(part.startangle)),y1 = cy - r * Math.cos(rad(part.startangle));
        var x2 = cx + r * Math.sin(rad(part.endangle)),y2 = cy - r * Math.cos(rad(part.endangle));
        part.p1={x:x1,y:y1};part.p2={x:x2,y:y2}
        // This is a flag for angles larger than than a half circle,for arc drawing component
        var elem,path,label ,labelelem,big = (rad(part.endangle) - rad(part.startangle) > PI)?1:0;
        if(part.elem&&document.getElementById(part.elem)&&document.getElementById(part.elem).parentNode){
            path=document.getElementById(part.elem)
        }else{
            path = document.createElementNS(svgns, "path");
        }

        // to circle center      line to (x1,y1)           arc of radius r       arc details          to end          Close path
        var d = "M " + cx + "," + cy +  " L " + x1 + "," + y1 +   " A " + r + "," + r + " 0 " + big + " 1 " +  x2 + "," + y2 +" Z";
        svgattr(path,"d", d,"fill", part.color,"stroke", "black","stroke-width", "2"); // 2 units thick
        if(path.classList){path.classList.add("chart-slice")};
        if(path.dataset){path.dataset.id=part.label}
        if(path.parentNode && path.parentNode==chart.g){elem=path}
        else{elem=chart.g.appendChild(path)}
        // Add to chart
        if(!elem.id){elem.id="svg_el_"+(++_id_counter)}

        part.elem=elem.id
        var bb=elem.getBBox()
        part.bb={x:bb.x,y:bb.y,width:bb.width,height:bb.height}
        // And add a label to the right of the rectangle
        if(!part.labelelem){var idx=part.index-1
            var lx=5,ly=45,ang=(part.startangle+((part.endangle-part.startangle)/2)+360)%360,bb=part.bb,
                x3 = cx + (r*.66) * Math.sin(rad(ang)),y3 = cy - (r*.66) * Math.cos(rad(ang));
            ang=ang-90

            var icon = document.createElementNS(svgns, "rect");
            svgattr(icon,"x",lx,"y", ly+(20*idx),"width", 16,"height", 16,"fill", part.color,"stroke", "#666","stroke-width", "1");
            var txtlabel = document.createElementNS(svgns, "text");
            svgattr(txtlabel,"x", lx+24,"y", ly+(20*idx)+12,"font-family", "sans-serif","fill", "white","font-size", "12");
            txtlabel.appendChild(document.createTextNode(part.value+":"+part.label));

            chart.chart.appendChild(icon)
            chart.chart.appendChild(txtlabel)
            part.labelelem=1
        }
    function pieChart(parts,container,title) {
        var config={parts:{}},
            data, width, height, cx, cy, r, colors, labels, lx, ly
        var h=container.clientHeight,w=container.clientWidth
        lx=1;ly=1
        config.width=w-20;config.height=h-30
        config.r=Math.min(config.height/2 - 5,config.width/2)
        config.cx=(config.width/2)+10;        config.cy=(config.height/2)+30
        config.colors=ccolors;        config.title=title
        config.labels=Object.keys(parts)
        config.data=config.labels.map(function(k){return parts[k]})
        //var c=pieChart(data, w, h,cx, cy,r, ccolors, labels)
        var chart = document.createElementNS(svgns, "svg:svg"),
            chartgroup = document.createElementNS(svgns, "g");
        config.chart  =container.appendChild(chart)
        config.g=config.chart.appendChild(chartgroup)
        if(config.g.classList){config.g.classList.add("chart-elem-group")}

        var total = 0;// Add up the data values so we know how big the pie is
        for(var i = 0; i < config.data.length; i++) {total += config.data[i]; }
        var startangle = 0;
        for(var i = 0; i < config.labels.length; i++) {
            var  part={
                label:config.labels[i],value:config.data[i],angle:360*(config.data[i]/total),
                elem:null,labelelem:null    ,index:i+1   , id:config.labels[i],
                startangle:startangle ,color:ccolors[i]
            }
            part.endangle=(startangle =part.startangle + part.angle),
                part.delta=(part.endangle-part.startangle)/2
            config.parts[config.labels[i]]=part
            makeSlice(part,config)
        }


        config=config
        return config;
    }
    return {
        render:function(canvas){
            pieChart(canvas.data,canvas.container,canvas.config.title)
        }


    }
}
}
})();
/*
    config.g.addEventListener("mousedown",function(ev){
            config.dragging={theta:config.theta||0,x:config.cx,y:config.cy,ofset:config.chart.getBoundingClientRect()};

            function mmv(ev){
                if(!config.dragging){return}
                var p=mousepos(ev),d=config.dragging
                var ang=((d.theta+(Math.atan((p.y-(d.ofset.top+d.y)) / (p.x-(d.ofset.left+d.x))) * 180 / PI))+360)%360
                var curr=[ang, d.x, d.y];
                window.requestAnimationFrame(function(){if(!curr.length){return}
                    config.g.setAttribute("transform","rotate("+curr.join(",")+")")
                    curr=curr[0];curr.length=0 ;config.theta=ang
                })
            }
            function mup(ev){
                config.dragging=0;config.g.style.cursor="auto"
                document.removeEventListener("mouseup",mup);config.chart.removeEventListener("mousemove",mmv);
            }
            document.addEventListener("mouseup",mup)
            setTimeout(function(){if(!config.dragging){return}
                config.g.style.cursor="move" ;config.chart.addEventListener("mousemove",mmv)
            },100)
        })


     if(part.labelelem&&document.getElementById(part.labelelem)&&document.getElementById(part.labelelem).parentNode){
     label=document.getElementById(part.labelelem)
     }else{
     label=document.createElementNS(svgns, "text")
     }
     if(ang>180){ang=ang-180}
     else if(ang>90){ang=ang+180}
     svgattr(label,"x", x3,"y", y3 ,"text-anchor","middle","font-family", "sans-serif","letter-spacing",".1em","font-size", "12","transform","rotate("+(ang )+","+x3+","+(y3-2)+")");
     while(label.firstChild){label.removeChild(label.firstChild)}

     var ts=label.appendChild(document.createElementNS(svgns, "tspan"))
     svgattr(ts,"x",x3)
     ts.appendChild(document.createTextNode(part.label));
     var ts2=label.appendChild(document.createElementNS(svgns, "tspan"))
     ts2.appendChild(document.createTextNode(part.value));
     svgattr(ts2,"x",x3,"dy",15)

     if(label.parentNode && label.parentNode==chart.chart){labelelem=label}
     else{labelelem=chart.chart.appendChild(label)}  ;               // Add text to the chart
     if(!labelelem.id){labelelem.id="svg_el_"+(++_id_counter)}
     part.labelelem=labelelem.id
     */
