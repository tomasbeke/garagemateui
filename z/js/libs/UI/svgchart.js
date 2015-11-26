/**
 * Created by atul on 7/6/14.
 */
 !function(factory){
       UI.SvgChart=factory()


} (    function(){

         var _id_counter=Number(String(Date.now()).substr(4))
         var svgns = "http://www.w3.org/2000/svg",PI=Math.PI,ccolors=["#a48ad4","#aec785","#fdd752","#32D2C9","#ff00ff","#ffff00","#ff8888","#ffff88","#88ffff","#888888"];
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
         function pos(ev){
             return {x:ev.x,y:ev.y};
         }

         if(!window.requestAnimationFrame){
             window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
                 function(callback) {
                     window.setTimeout(callback, 1000 / 60);
                 };

         }
         function makeSlice(part,chart) {
             var cx=chart.cx,cy=chart.cy,r=chart.r
             var x1 = cx + r * Math.sin(rad(part.startangle)),y1 = cy - r * Math.cos(rad(part.startangle));
             var x2 = cx + r * Math.sin(rad(part.endangle)),y2 = cy - r * Math.cos(rad(part.endangle));
             part.p1={x:x1,y:y1}
             part.p2={x:x2,y:y2}
             svgDoc=chart.ownerDocument
             // This is a flag for angles larger than than a half circle,for arc drawing component
             var elem,path,label ,labelelem,big = (rad(part.endangle) - rad(part.startangle) > PI)?1:0;
             if(part.elem&&document.getElementById(part.elem)&&document.getElementById(part.elem).parentNode){
                 path=document.getElementById(part.elem)
             }else{
                 path = document.createElementNS(svgns, "path");
             }

             // to circle center      line to (x1,y1)           arc of radius r       arc details          to end          Close path
             var d = "M " + cx + "," + cy +  " L " + x1 + "," + y1 +   " A " + r + "," + r + " 0 " + big + " 1 " +  x2 + "," + y2 +" Z";
             //  var x1 = cx + r * Math.sin(rad(0)),y1 = cy - r * Math.cos(rad(0));
             //  var x2 = cx + r * Math.sin(rad(part.endangle-part.startangle)),y2 = cy - r * Math.cos(rad(part.endangle-part.startangle));
             //    var d = "M " + cx + "," + cy +  " L " + r + "," + 0 +   " A " + r + "," + r + " 0 " + big + " 1 " +  (x2) + "," + (y2) +" Z";
             svgattr(path,"d", d,"fill", part.color,"stroke", "#666","stroke-width", "1"); // 2 units thick

             /*      setTimeout(function(){
              var animateTransformel=document.createElementNS(svgns, "animateTransform");
              var animateTransform = {attributeType:"xml", attributeName:"transform", type:"rotate", dur:"4s",
              from:[0 ,r,r].join(" ") ,to:[360*(-1),r,r].join(" ")}
              Object.keys(animateTransform,function(k){
              animateTransformel.setAttributeNS(null,k,animateTransform[k])

              });
              path.appendChild(animateTransformel);
              animateTransformel.beginElement();
              },5000)*/
             if(path.classList){path.classList.add("pie-slice")};
             if(path.dataset){path.dataset.id=part.label}
             if(path.parentNode && path.parentNode==chart.g){elem=path}
             else{elem=chart.g.appendChild(path)}
             // Add to chart
             if(!elem.id){elem.id="svg_el_"+(++_id_counter)}

             part.elem=elem.id
             var bb=elem.getBBox()
             part.bb={x:bb.x,y:bb.y,width:bb.width,height:bb.height}
             // And add a label to the right of the rectangle
             var lineht=16
             if(!part.labelelem){var idx=part.index-1
                 var lx=5,ly=chart.yOffset||40,ang=(part.startangle+((part.endangle-part.startangle)/2)+360)%360,bb=part.bb,
                     x3 = cx + (r*.66) * Math.sin(rad(ang)),y3 = cy - (r*.66) * Math.cos(rad(ang));
                 ang=ang-90

                 var icon = document.createElementNS(svgns, "rect");
                 svgattr(icon,"x",lx,"y", ly+(lineht*idx),"width", lineht-2,"height", lineht-2,"fill", part.color,"stroke", "#666","stroke-width", "1");
                 var txtlabel = document.createElementNS(svgns, "text");
                 svgattr(txtlabel,"x", lx+lineht+5,"y", ly+(lineht*idx)+lineht-4,"width",130,"font-family", "sans-serif","fill", "gray","font-size", "11");
                 var s=part.value+":"+part.label ;if(s.length>18){txtlabel.totle=s;s=s.substr(0,18)+".."}
                 txtlabel.appendChild(document.createTextNode(s));

                 chart.chart.appendChild(icon)
                 chart.chart.appendChild(txtlabel)
                 part.labelelem=1
             }
             /*
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
         }
         function pieChart(parts,container,title) {
             var config={parts:{}},yOffset=40,
                 data, width, height, cx, cy, r, colors, labels, lx, ly
             var h=container.clientHeight,w=container.clientWidth
             config.yOffset=yOffset
             lx=1
             ly=1
             config.width=w-10
             config.height=h-5
             $d.addClass(container,"noselection")
             var woffset=150,avwd=config.width-woffset,avht=config.height-yOffset
             var r=Math.min(avht/2  ,avwd/2)
             config.r=r

             //config.cx=config.width  //(config.width/2)+10
             //  if(avwd>200){
             config.cx= (avwd/2)
             // }
             config.cy=(avht/2)//+30

             config.colors=ccolors
             config.title=title
             config.labels=Object.keys(parts)
             config.data=config.labels.map(function(k){return parts[k]})
             //var c=pieChart(data, w, h,cx, cy,r, ccolors, labels)
             var chart = document.createElementNS(svgns, "svg:svg");
             svgattr(chart,"viewBox",[0, 0 ,config.width+20, config.height+yOffset  ].join(" "))
             var chartgroup = document.createElementNS(svgns, "g");
             container.innerHTML=""
             var div=container.appendChild(document.createElement("h3"))

             div.style.cssText="position:absolute;line-height:1.2;text-align:center;height:1.6em;width:90%;left:5%;"

             div.innerHTML=title||""

             config.chart  =container.appendChild(chart)
              config.g=config.chart.appendChild(chartgroup)
             if(config.g.classList){config.g.classList.add("slice-elem-group")}
             //   svgattr(config.g,"viewbox",woffset+" "+30+" "+avwd+" "+(config.height ) +" ")
             //svgattr(config.g,"viewbox",0+" "+0+" "+avwd+" "+(config.height ) +"")
             svgattr(config.g,"transform","translate(150,"+yOffset+")")
             svgattr(config.g,"width",avwd+"px")
             svgattr(config.g,"height",config.height +"px")
             var total = 0;// Add up the data values so we know how big the pie is
             for(var i = 0; i < config.data.length; i++) {
                 total += config.data[i];
             }
             var startangle = 0;
             for(var i = 0; i < config.labels.length; i++) {
                 var  part={
                     label:config.labels[i],
                     value:config.data[i],angle:360*(config.data[i]/total),
                     elem:null,
                     labelelem:null    ,index:i+1   , id:config.labels[i],
                     startangle:startangle ,color:ccolors[i]

                 }
                 part.endangle=(startangle =part.startangle + part.angle),
                     part.delta=(part.endangle-part.startangle)/2
                 config.parts[config.labels[i]]=part
                 makeSlice(part,config)
             }
             config.tipG=document.createElementNS(svgns, "g")
             svgattr(config.tipG,"opacity",".7","viewBox", "0 0 200 35");
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
                     var ofset=config.chart.getBoundingClientRect(),p=pos(ev),
                         x=Math.max(10,(p.x-ofset.left)+ 10), y=Math.max(10,p.y-(ofset.top+ 10))
                     //svgattr(config.tip,"x",x, "y",y)
                     //svgattr(config.tiplabel,"x",x+5, "y",y+20)
                     svgattr(config.tipG,"transform","translate("+x+","+y +")")
                     while(config.tiplabel.firstChild){config.tiplabel.removeChild(config.tiplabel.firstChild)}
                     config.tiplabel.appendChild(document.createTextNode(part.value+" :: "+part.label));
                     //config.tip.style.display="block"
                     config.tipG.style.display="block"
                     if(config.tipG.classList){config.tipG.classList.add("slice-tip")}
                 }
                 var mv=function(ev){
                     if(config.dragging){return}
                     if(!(ev.target&&ev.target.classList)){return}
                     var target=ev.target
                     if(target&&String(target.tagName).toUpperCase()=="TSPAN"){target=target.parentNode}
                     if(target&&String(target.tagName).toUpperCase()=="TEXT"){target=target.previousElementSibling||target.previousSibling}
                     if(!target){return}
                     var slice=target.classList.contains("pie-slice")?target:null;
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
             config.g.addEventListener("mousedown",function(ev){
                 config.dragging={theta:config.theta||0,x:config.cx,y:config.cy,
                     bb:config.chart.getBoundingClientRect()
                 };
                 config.dragging.ofset={top:config.dragging.bb.top ,left:config.dragging.bb.left }
                 function mmv(ev){
                     if(!config.dragging){return}
                     var p=pos(ev),d=config.dragging
                     var ang=((d.theta+(Math.atan((p.y-(d.ofset.top+d.y)) / (p.x-(d.ofset.left+d.x))) * 180 / PI))+360)%360
                     var curr=[ang, d.x, d.y];
                     window.requestAnimationFrame(function(){if(!curr.length){return}
                         var currtm=String(config.g.getAttribute("transform")||"").replace(/rotate\([^\)]+\)/g,"").trim()
                         config.g.setAttribute("transform",(currtm+" rotate("+curr.join(",")+")").trim())

                         curr=curr[0];curr.length=0
                         config.theta=ang
                     })
                 }
                 function mup(ev){
                     config.dragging=0;
                     config.g.style.cursor="auto"
                     document.removeEventListener("mouseup",mup);
                     config.chart.removeEventListener("mousemove",mmv);
                 }
                 document.addEventListener("mouseup",mup)
                 setTimeout(function(){if(!config.dragging){return}
                     config.g.style.cursor="move"
                     config.chart.addEventListener("mousemove",mmv)
                 },100)
             })
             config=config

             return config;
         }
          return {
             pieChart:pieChart

         }
     }


     )               /*
 var     svgns = "http://www.w3.org/2000/svg"                ,
 function ptatAngle(centerX, centerY, radius, angleInDegrees) {
 var angleInRadians = angleInDegrees * Math.PI / 180.0;
 var x = centerX + radius * Math.cos(angleInRadians);
 var y = centerY + radius * Math.sin(angleInRadians);
 return {x:x,y:y};
 }
 function describeArc(x, y, radius, startAngle, endAngle){

 var start = ptatAngle(x, y, radius, startAngle);
 var end = ptatAngle(x, y, radius, endAngle);

 var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

 var d = [
 "M", start.x, start.y,
 "A", radius, radius, 0, arcSweep, 0, end.x, end.y
 ].join(" ");

 return d;
 }
 function angletoPt(pt,pt1, radius){
 return  Math.atan2((pt.y-pt1.y) / (pt.x-pt1.x)) * 180 / PI
 }
 */