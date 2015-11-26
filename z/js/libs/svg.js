 ;
 (function(window){"use strict";var nativeRequestAnimationFrame,nativeCancelAnimationFrame;(function(){var i,vendors=["webkit","moz","ms","o"],top;try{window.top.name;top=window.top}catch(e){top=window}nativeRequestAnimationFrame=top.requestAnimationFrame;nativeCancelAnimationFrame=top.cancelAnimationFrame||top.cancelRequestAnimationFrame;for(i=0;i<vendors.length&&!nativeRequestAnimationFrame;i++){nativeRequestAnimationFrame=top[vendors[i]+"RequestAnimationFrame"];nativeCancelAnimationFrame=top[vendors[i]+"CancelAnimationFrame"]||top[vendors[i]+"CancelRequestAnimationFrame"]}nativeRequestAnimationFrame&&nativeRequestAnimationFrame(function(){AnimationFrame.hasNative=true})})();function AnimationFrame(options){if(!(this instanceof AnimationFrame))return new AnimationFrame(options);options||(options={});if(typeof options=="number")options={frameRate:options};options.useNative!=null||(options.useNative=true);this.options=options;this.frameRate=options.frameRate||AnimationFrame.FRAME_RATE;this._frameLength=1e3/this.frameRate;this._isCustomFrameRate=this.frameRate!==AnimationFrame.FRAME_RATE;this._timeoutId=null;this._callbacks={};this._lastTickTime=0;this._tickCounter=0}AnimationFrame.FRAME_RATE=60;AnimationFrame.shim=function(options){var animationFrame=new AnimationFrame(options);window.requestAnimationFrame=function(callback){return animationFrame.request(callback)};window.cancelAnimationFrame=function(id){return animationFrame.cancel(id)};return animationFrame};AnimationFrame.now=Date.now||function(){return(new Date).getTime()};AnimationFrame.navigationStart=AnimationFrame.now();AnimationFrame.perfNow=function(){if(window.performance&&window.performance.now)return window.performance.now();return AnimationFrame.now()-AnimationFrame.navigationStart};AnimationFrame.hasNative=false;AnimationFrame.prototype.request=function(callback){var self=this,delay;++this._tickCounter;if(AnimationFrame.hasNative&&self.options.useNative&&!this._isCustomFrameRate){return nativeRequestAnimationFrame(callback)}if(!callback)throw new TypeError("Not enough arguments");if(this._timeoutId==null){delay=this._frameLength+this._lastTickTime-AnimationFrame.now();if(delay<0)delay=0;this._timeoutId=window.setTimeout(function(){var id;self._lastTickTime=AnimationFrame.now();self._timeoutId=null;++self._tickCounter;for(id in self._callbacks){if(self._callbacks[id]){if(AnimationFrame.hasNative&&self.options.useNative){nativeRequestAnimationFrame(self._callbacks[id])}else{self._callbacks[id](AnimationFrame.perfNow())}delete self._callbacks[id]}}},delay)}this._callbacks[this._tickCounter]=callback;return this._tickCounter};AnimationFrame.prototype.cancel=function(id){if(AnimationFrame.hasNative&&this.options.useNative)nativeCancelAnimationFrame(id);delete this._callbacks[id]};if(typeof exports=="object"&&typeof module=="object"){module.exports=AnimationFrame}else if(typeof define=="function"&&define.amd){define(function(){return AnimationFrame})}else{window.AnimationFrame=AnimationFrame}})(window);

     var Svg={}

    function utils(){
        var PI=Math.PI,  powcache=[]
        function FowlerAngle(dy,dx) {
            var adx, ady;    /* Absolute Values of Dx and Dy */
            var    code;        /* Angular Region Classification Code */

            adx = (dx < 0) ? -dx : dx;  /* Compute the absolute values. */
            ady = (dy < 0) ? -dy : dy;
             code = (adx < ady) ? 1 : 0;
            if (dx < 0)  code += 2;
            if (dy < 0)  code += 4;

            switch (code)
            {
                case 0: return (dx==0) ? 0 : ady/adx;  /* [  0, 45] */
                case 1: return (2.0 - (adx/ady));      /* ( 45, 90] */
                case 3: return (2.0 + (adx/ady));      /* ( 90,135) */
                case 2: return (4.0 - (ady/adx));      /* [135,180] */
                case 6: return (4.0 + (ady/adx));      /* (180,225] */
                case 7: return (6.0 - (adx/ady));      /* (225,270) */
                case 5: return (6.0 + (adx/ady));      /* [270,315) */
                case 4: return (8.0 - (ady/adx));      /* [315,360) */
            }
        }
        function getMidPoint(pth){
            if(!pth){return}
            var midpoint,pts=[],tot,st=0,X,Y,P,curvedMidpoint,XDf=0,YDf=0,PDf=0,res
            if(Array.isArray(pth)){pts=pth
                midpoint=pts.slice(1).reduce(function(m,it,i,arr){ if(!it){return m}
                    return  m.midPoint(  it.isPoint?it:Svg.Point(it)  )
                }, (pts[0]||{}).isPoint?pts[0]:Svg.Point(pts[0]) )
            }
            else {
                var inst=null,bb,svgbb,saved=pth
                if(pth.isShape){
                    inst=pth;pth=inst.svg||inst.wrapel
                    bb=inst.bbox

                } else if(pth.bbox&&pth.bbox.x!=null){
                    bb=pth.bbox;pth=null
                }
                svgbb=(pth&&pth.getBBox)?pth.getBBox():null

                if(!(svgbb&& (svgbb.height+svgbb.width)!=0)){
                   if(bb&&bb.diagonal){
                       return bb.c;
                   }

                }
            }
                var type=String(pth.nodeName).toLowerCase()
                if(!(type&&pth&&pth.nodeType==1&&pth.viewportElement)){return}
                  var attr="x y x1 y1 x2 y2 cx cy rx ry r height width".split(/\s/).reduce(function(m,it,i){return m[it]=Number(pth.getAttributeNS(null,it))||0,m},{})
                if(type!=="path"){
                    var  midpoint,type, x,y

                    if(type=="ellipse"||type=="circle"){x=attr.cx;y=attr.cy}
                    else if(type=="line"){x=attr.x1+(attr.x2-attr.x1)/2;y=attr.x1+(attr.y2-attr.y1)/2}
                    else if(type=="rect"){
                        x=attr.x+attr.width/2;
                        y=attr.y+attr.height/2
                    }
                    else {
                        if (!svgbb){svgbb=pth.getBoundingClientRect()}
                        x=(svgbb.x||svgbb.left||0)+(svgbb.width/2);
                        y=(svgbb.y||svgbb.top||0)+(svgbb.height/2)
                    }
                    if(x!=null & y!=null){midpoint=  Svg.Point(x,y)}
                }  else if(pts&&pts.length){


            for(var i=st,l=pts.length;i<l;i++){
                if( i>0 && i<l-st){
                    var pr= pts[i-1],nx= pts[i+1] ,thisp=pts[i]
                    if(  ((thisp.p()-pr.p()<0&& nx.p()-thisp.p()>0)||(thisp.p()-pr.p()>0&&thisp.p()-nx.p()<0))){var j;if((j=Math.abs(nx.p()-pr.p()))>PDf){PDf=j;P=i}}
                    if(  ((thisp.x-pr.x<0&&nx.x-thisp.x>0)||(thisp.x-pr.x>0&&thisp.x-nx.x<0))){var j;if((j=Math.abs(nx.x-pr.x))>XDf){XDf=j;X=i}}
                    if(  ((thisp.y-pr.y<0&&nx.y-thisp.y>0)||(thisp.y-pr.y>0&&thisp.y-nx.y<0))){var j;if((j=Math.abs(nx.y-pr.y))>YDf){YDf=j;Y=i}}
                }

            if(P){curvedMidpoint=pts[P];}
            if(X){curvedMidpoint=pts[X]}
            else if(Y){curvedMidpoint=pts[Y]}
            else {curvedMidpoint = pth.getPointAtLength(tot/2)}
            midpoint=  Svg.Point(curvedMidpoint.x,curvedMidpoint.y)
                }
             } else{
                if(svgbb){
                     midpoint=Svg.Point(svgbb.width/2,svgbb.height/2)
                }
            }
            return midpoint;
        }
         function calcAngle(p01,p02){
             if(!(p01 && p02)){return}
            var t,p11,p21,p1=p01.isPoint?p01:Svg.Point(p01),
             p2=p02.isPoint?p02:Svg.Point(p02)

             var ang, q,xoff=p2.x-p1.x ,yoff=p2.y-p1.y
             /*if(p2==p1){ang=0}
             else if(x==0){ang=90}
             else if(y==0){ang=0}
             else{
                 var res=solveTriangle(y,x,z)
                ang=res.aa
             } */
             q=yoff>0?(xoff>0?2:1):xoff>0?3:4
             var slope= Math.abs(yoff)/Math.abs(xoff)
             ang=Math.round(toDegrees(Math.atan(slope)));
             if(q%2){
                 ang=((q-1)*90) + ang;
             }else {
                 ang=(q*90) - ang;
             }
             if(typeof(app)!="undefined" && app.kanvas&&app.kanvas.msgbox){
                 app.kanvas.msgbox.innerHTML=["@"+Math.round(ang),"["+p1.x, p1.y+"]","["+p2.x, p2.y+"]"].join(", ")
                     //[q,Math.round(orig),Math.round(ang),xoff,yoff].join(",")
             }




             //console.log(q,Math.round(orig),Math.round(ang),xoff,yoff)
            return ang;
        }
        function bezierControlPt( lineData){
            var midPoint = {
                x:Math.abs(lineData[1].x - lineData[0].x)/2,
                y:Math.abs(lineData[1].y - lineData[0].y)/2
            };


            var angle = calcAngle(lineData[0],lineData[1]);
            var sin = Math.sin(angle * PI / 180),cos = Math.cos(angle * PI / 180);
            var xLen = Math.abs(lineData[1].x - lineData[0].x)/2, yLen = Math.abs(lineData[1].y - lineData[0].y)/2;
            var n = 1.5;
            var midpointArc = {
                x:  midPoint.x + (sin * (n * 25)),
                y:  midPoint.y + (cos * (n * 25))
            };
            //lineData.splice(1,0,midpointArc);
            return midpointArc
        }
        function isNumber( v){
            return typeof(v)=="number" && !isNaN(v)&&(v===v+0)
        }
    function pow2(a){    return Math.pow(a,2)  }
    function abs(a){  return Math.abs(a)  }
    function sq(a){ return pow2(a) }
    function sqrt(a){   return Math.sqrt(a)  }
    function _round(v,decs){var d=decs||2,f=powcache[d-1]||(powcache[d-1]=Math.pow(10,d));
        return Math.floor(v)<v?Math.round(v*f)/f:v
    }
    function getOppositeSide(a,c,bAng){
        var b= sqrt(pow2(a) + pow2(c) - (2 * a * c * Math.cos( bAng)))
        return  _round(b)
    }
    function pointOnCircle(deg0,radius,cx,xy){//width / radius
        var ret={},deg= toRadians (deg0),width=radius*Math.cos(deg),
            height=getOppositeSide(width ,radius, deg),a=width,c=radius,bAng=deg
        // msg.innerHTML=[deg0, a,deg].join("  ")
        ret.y=cy+((deg0<180?-1:1)*height)
        ret.x=cx+width
        return ret
    }
        function  toDegrees(angle) { return angle * (180 / PI); }
        function toRadians (angle) {  return angle * (PI / 180); }
        function sidesOf90degTri(h,deg,oppositeoradjacent){ //hyptonuese and angle
            return h*Math[oppositeoradjacent?"cos":"sin"](toRadians (deg))
        }
        function degreeBet2Pts( ux, uy, vx, vy ) {
            return _round(toDegrees(radianBet2Pts( ux, uy, vx, vy ) ))
        }
        function radianBet2Pts( ux, uy, vx, vy ) {
            var  dot = ux * vx + uy * vy;
            var  mod = Math.sqrt( ( ux * ux + uy * uy ) * ( vx * vx + vy * vy ) );
            var  rad = Math.acos( dot / mod );
            if( ux * vy - uy * vx < 0.0 ) rad = -rad;
            return  rad;
        }
        function isFn( v){
            return typeof(v)=="function"
        }
        function generatorFactry(){
            var NILL={isNull:true,valueOf:function(){return null},toString:function(){return "null"}}
              Object.freeze(NILL);
            var api={
                K:function(k){return function(){return k}},
                V:function(){return function(v){return (v&&typeof(v.valueOf)=="function")? v.valueOf():v}},
                I:function(){return function(a){return a}},
                getPropValue:function(propname){//resolve this prop for object passed as arg
                          return function(obj){return obj?obj[propname]:null}
                },
               getPropValueOrInvoke:function(propname){//resolve this prop for object passed as arg
                    var isfn=function(obj){return typeof(obj[propname])=="function"}
                    return function(obj){return isfn(obj[propname])?obj[propname].apply(this,arguments):obj[propname]}
                },
                getInvoker:function(propname){//resolve this prop for object passed as arg
                    var isfn=function(obj){return typeof(obj[propname])=="function"}
                    return function(obj){return isfn(obj[propname])?obj[propname].apply(this,arguments):null}
                },
                getObjValue:function(obj){//resolve this object for prop  passed as arg
                    return function(propname){return obj[propname]}
                },
                getObjValueOrInvoke:function(obj){//resolve this object for prop passed as arg
                    var isfn=function(prop){return typeof(obj[prop])=="function"}
                    return function(prop){return isfn(obj[prop])?obj[prop].apply(this,arguments):obj[prop]}
                },
                getMethodInvoker:function(obj){//resolve this object for prop passed as arg
                    var isfn=function(p){return typeof(obj[p])=="function"}
                    return function(p){return isfn(obj[p])?obj[p].apply(this,arguments):null}
                },
                getInvoker:function(fn){//resolve this object for prop passed as arg
                    var initArgs=[].slice.call(arguments,1)
                    return function(){return fn.apply(this,initArgs.concat([].slice.call(arguments)))}
                },
                ensureArity:function(numorargs){//ensure s the arity
                        var arity="length" in fn?fn.length:fn.toString().split(/[\)\(]/)[1].split(/[\s,]/).length;
                        return function(it,i,arr){return fn.apply(this,[].slice.call(arguments,0,numofargs))}
                },
                transformArgs:function(fn,tx){//ensure s the arity
                    return function(){return fn.apply(this,tx([].slice.call(arguments)))}
                },
                valueResolver:function(fn){//ensure s the arity
                    var ret;
                    if(fn==null){return api.V()}
                    if((typeof(fn)=="function" || typeof(fn)=="object") && fn._valueResolver){return fn};
                    if(typeof(fn)=="function"){ret=api.getInvoker.apply(this,arguments)}
                    else if(typeof(fn)=="object"){ret=api.getPropValueOrInvoke.apply(this,arguments)}

                    ret=api.K(fn)
                    ret._valueResolver=true;
                    return ret;
                },
                switchroo:function(map){//replaces values in arg list with values in provided map or return orig value
                     return function(){return function(){return [].map.call(arguments,function(a){
                         if(a===null){a=NILL}
                         return a in map?map[a]:a
                     })}}
                },

                partial:function(fn){
                    var ph={},a=fn.toString().trim().split(/[\)\(]/)[1].split(/\s*,\s*/).map(function(it){return it.trim()})
                        .map(api.switchroo({"_":ph,"nill":ph,"null":ph,"?":ph}))
                     return function(){
                        var a1=[].slice.call((arguments.length==1&&/arguments/i.test(({}).toString.call(arguments[0])))?arguments[0]:arguments),
                            ctx=this===self?undefined:this
                        a=a.map(function(i){return (i===ph&&a1.length)?a1.shift():i})
                        if(!a.some(function(i){return i===ph})){
                            return fn.apply(ctx,a)
                        }
                    }
                },
                binary:function(evaluatorfn/*val1,val2*/){
                    return api.partial(function(_,_,_){
                        var a=[].slice.call(arguments);
                        return a[0].call(this,a[1],a[2])})(arguments)
                },
                unary:function(evaluatorfn/*val1*/){
                    return api.partial(function(_,_){
                        var a=[].slice.call(arguments);
                        return a[0].call(this,a[1])})(arguments)
                },
                Eq:function(tores1){ var args=[].slice.call(arguments) ,tr=api.valueResolver()
                    args.unshift(function(a,b){return tr(a)==tr(b)});
                    return api.binary.apply(this,args)   },
                NotEq:function(tores1){ var args=[].slice.call(arguments) ,tr=api.valueResolver()
                    args.unshift(function(a,b){return tr(a)!=tr(b)});
                    return api.binary.apply(this,args)   },
                And:function(tores1){ var args=[].slice.call(arguments) ,tr=api.truthy
                    args.unshift(function(a,b){return tr(a)&&tr(b)});
                    return api.binary.apply(this,args)   },
                Or:function(tores1){ var args=[].slice.call(arguments) ,tr=api.truthy
                    args.unshift(function(a,b){return tr(a)||tr(b)})
                    return api.binary.apply(this,args)   },
                Not:function(tores1){ var args=[].slice.call(arguments) ,fl=api.falsy
                    args.unshift(function(a){return fl(a)});
                    return api.binary.apply(this,args)
                },
                maybe:function(v){return !!v},
                truthy:function(v){return !!v},
                falsy:function(v){return !v},
                empty:function(v){return !v||v.length===0||(typeof(v)=="object"&&!Object.keys(v).length)}

            }
             return api
        }
        var matrixctor=null
        function makeMatrix( el,props){
             if(!matrixctor){
                matrixctor=function(el,props){
                     this.el=el.wrapel;
                    this.matrix=this.el.getCTM()
                    this._count=0
                    if(props){
                        this.update(props,true)
                    }
                      this._saved={}
                }

                matrixctor.prototype={  _count:null, _saved:null,
                    refresh:function(){if(!(this.el&&this.el.getCTM)){return this}
                        var matrix=this.matrix||(this.matrix=this.el.getCTM()),
                            curr=this.el.getCTM(),
                            attr="abcdef";
                        if(curr){
                            for(var i=0,l=attr.split(""),ln=l.length,k;k=l[i],i<ln;i++){
                                if(curr[k]!=null&&curr[k]!=matrix[k])  {
                                    matrix[k]=curr[k]
                                }
                            }
                        }
                    },
                    skewX:function(x){
                        if(x>90){x=(x+90)%90}
                         return this.update({skewX:x})
                    },
                    skewY:function(y){
                        if(y>90){y=(y+90)%90}
                        return this.update({skewY:y})
                    },
                    translate:function(p){
                        return this.update({position:p})
                    },
                    scale:function(s){
                        return this.update({scale:s})
                    },
                    rotate:function(r){
                      return this.update({rotate:r})
                    },
                    getAll:function( ){
                             //this.refresh();

                            // calculate delta transform point
                            var matrix=this.el.getCTM()
                            var px =  {x:matrix.c,y:matrix.d} //{ x: 0, y: 1 } = { x: point.x * matrix.a + point.y * matrix.c + 0, y: point.x * matrix.b + point.y * matrix.d + 0 };
                             var py =  {x:matrix.a,y:matrix.b}  //{ x: 1, y: 0 } { x: point.x * matrix.a + point.y * matrix.c + 0, y: point.x * matrix.b + point.y * matrix.d + 0 };
                        //  px =  deltaTransformPoint(matrix,{ x: 0, y: 1 })
                       //   py =  deltaTransformPoint(matrix,{ x: 1, y: 0 })
                            // calculate skew

                            var skewY =  ((180 / Math.PI) * Math.atan2(px.y, px.x) - 90);//Math.atan(matrix.c/matrix.d)
                            var skewX =  ((180 / Math.PI) * Math.atan2(py.y, py.x));

                            return {
                                translateX: matrix.e,
                                translateY: matrix.f,
                                scaleX: Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b),
                                scaleY: Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d),
                                skewX: skewX,
                                skewY: skewY,
                                rotation: skewX // rotation is the same as skew x
                            };
                        }
                       ,
                    get:function(k){
                        return this.getAll()[k=="translate"?"position":k]
                    },
                    update:function(props,norefresh){
                        if(!(props&&typeof(props)=="object")){return this}
                      //   if(!norefresh){this.refresh()}
                        var matrix=this.matrix
                        if(!props.position&&props.translate){props.position=props.translate}
                        if(!props.position && props.x!=null){
                            props.position={x:props.x,y:props.y}
                        }
                        if(props.skewX!=null&&props.skewX===props.skewX+0&&props.skewX!=matrix.b){
                            this.matrix=matrix.skewX(props.skewX)
                            if(props.skewX==90){props.skewX=89.5}
                        }
                        if(props.skewY!=null&&props.skewY===props.skewY+0&&props.skewY!=matrix.d){
                            if(props.skewY==90){props.skewY=89.5}
                            this.matrix=matrix.skewY(props.skewY)
                         }
                        if(props.scale){
                            if(!isNaN(props.scale)){props.scale={x:Number(props.scale),y:Number(props.scale)}}
                            else if(typeof(props.scale)=="object"){
                                if(Array.isArray(props.scale)){props.scale={x:props.scale[0]||1,y:props.scale[1]||1}}
                            }
                            if("x" in props.scale&&props.scale.x>=1){
                                matrix.a = Math.max(1,props.scale.x||1)
                                matrix.d =  Math.max(1,props.scale.y||1)
                            }
                        }
                        if(props.position!=null){
                            if(typeof(props.position)=="object"&&"x" in props.position){
                                props.position.x+0===props.position.x&&(matrix.e =props.position.x);
                                props.position.y+0===props.position.y&&(matrix.f =props.position.y);
                            } else if(typeof(props.position)=="number"){
                                matrix.e=matrix.f=props.position
                            }
                        }
                        props.rotation=props.rotation==null?
                            props.angle==null?props.rotate:null
                            :null

                        if(props.rotation  !=null){
                            var num, x,y
                            if(!isNaN(props.rotation )){num=Number(props.rotation )}
                            else {num=Number(String(props.rotation).replace(/[\D]+$/g,""))||0 }
                            if(props.rotationPoint){
                                x=props.rotationPoint.x,y=props.rotationPoint.y
                            }
                            if(Math.abs(props.rotation)>=0){
                                if(x&&y){this.matrix=matrix.rotate(num,x,y)}
                                else{this.matrix=matrix.rotate(num)}
                            }


                        }
                        return this;
                    },
                    parse:function(str){
                        var mp=typeof(str)=="string"?JSON.parse(str):str;
                        this.update(str);
                        return this
                    },
                    toString:function(){return this.toJson()},
                    toJson:function(){return JSON.stringify(this.toMap())},
                    toMap:function(){
                        var attr="abcdef",res={},matrix=this.matrix;
                            for(var i=0,l=attr.split(""),ln=l.length,k;k=l[i],i<ln;i++){
                                if(matrix[k]!=null){
                                    res[k]=matrix[k]
                                }
                            }
                        return res;
                    },
                    getOwner:function(){
                        if(!(this._owner &&("createSVGTransform" in this._owner))){
                            this._owner=this.el.ownerSVGElement||document.querySelector("svg")
                        }
                        return (this._owner &&("createSVGTransform" in this._owner))?this._owner:null
                    },
                    transform:function( to,norefresh){
                        var o=this.getOwner();
                        if(!o){return this}
                        if(to && typeof(to)=="object"){this.update(to,norefresh)}
                        var transform  =o.createSVGTransformFromMatrix(this.matrix);
                        //var transform  =o.createSVGTransform()
                        //transform.setMatrix( this.matrix);
                        this.el.transform.baseVal.initialize(   transform   );
                        this._count++
                        return this
                    }
                }
            }

             //position   = SVG.createSVGPoint()
            //rotation   = 0,  //scale      = 1;
            // do every update, continuous use
            //scale=  [s,d];position=[e,f];rotation = Math.atan2( b, a ) * (180 / Math.PI)
            //matrix.a = scale.x; matrix.d = scale.y; matrix.e = position.x; matrix.f = position.y;
            //RAD2DEG = 180 / Math.PI;
            //rotation = Math.atan2( b, a ) * RAD2DEG;

           var nu=new matrixctor(el,props)
            return nu;
        }
            function matrix(el,props,matrix0,SVG0){
                if(!(props&&typeof(props)=="object")){return}

                var SVG=SVG0||el.ownerSVGElement||el,
                transform  = SVG.createSVGTransform(),
                    matrix     = matrix0||el.getCTM()||SVG.createSVGMatrix()
                    //position   = SVG.createSVGPoint()
                    //rotation   = 0,  //scale      = 1;
                     // do every update, continuous use
                    //matrix.a = scale.x;
                //matrix.d = scale.y; matrix.e = position.x; matrix.f = position.y;
                if(!props.position && "x" in props){
                    props.position={x:props.x,y:props.y}
                }
                props.rotation=props.rotation||props.angle
                if(props.rotation !=null){
                    var num, x,y
                    if(!isNaN(props.rotation )){num=Number(props.rotation )}
                    else {num=Number(String(props.rotation).replace(/[\D]+$/g,""))||0 }
                    if(props.rotationPoint){
                        x=props.rotationPoint.x,y=props.rotationPoint.y
                        }
                    if(x&&y){matrix.rotate(num,x,y)}
                    else{matrix.rotate(num)}

                }
                if(props.scale){
                    if(!isNaN(props.scale)){matrix.scale( Math.max(1,Number(props.scale)))}
                    else if(typeof(props.scale)=="object"){
                        if(Array.isArray(props.scale)){matrix.scaleNonUniform( props.scale[0]||1,props.scale[1]||1)}
                        if("x" in scale){matrix.scaleNonUniform( props.scale.x||1,props.scale.y||1)}
                    }
                }
                if(props.position&&typeof(props.position)=="object"&&"x" in props.position){
                    matrix.translate(props.position.x,props.position.y)
                } else if(typeof(position)=="number"){
                    matrix.translate(props.position)
                }
                transform.setMatrix( matrix );
                //flipX()
                //flipY()
                //inverse
                //multiply
                //rotateFromVector
                //createSVGTransformFromMatrix
                el.transform.baseVal.initialize( transform ); // clear then put


            }
        function _extendOne(trgt,src){
            if(!(src&&typeof(src)=="object")){return trgt}
            var isarr=Array.isArray(src);
            trgt||(trgt=isarr?[]:{});
            if(isarr){src.forEach(function(k,i){trgt[i]=k})}
            else{Object.keys(src).forEach(function(k,i){trgt[k]=src[k]})}
            return trgt
        }
        function _extend(trgt,src){
            if(arguments.length==1){return _extendOne(null,trgt);}
            return [].slice.call(arguments,1).reduce(_extendOne,trgt)
        }
        function _each(src0,fn,ctx){if(!src0){return}
            var src=src0
            if(typeof(src)=="string"){ src=src.split(/\s+/) }
            if(typeof(src)!="object"){return null}
            var isarr=Array.isArray(src)||(typeof(src)=="object"&&"length" in src && src.length>=0);
            if(isarr){[].forEach.call(src,fn,ctx)}
            else{Object.keys(src).forEach(function(k,i){fn.call(this,src[k],k,src)},ctx)}
            return src
        }
    function getBounds(el){
        if(!(el&&el.nodeType)){return}
        var v=el.getBoundingClientRect?el.getBoundingClientRect():0
        if(!(v&&(v.height+ v.width)>0)){  }  //??alt
        return v
    }
        function mousepos(e ){ var p= {}
            if("x" in e ) {p.x=e.x;p.y=e.y}
            else{
                if (!e) var e = window.event;
                if (e.pageX || e.pageY){   p.x = e.pageX; p.y = e.pageY;   }
                else if (e.clientX || e.clientY) 	{
                    p.x = e.clientX + bdy.scrollLeft +doc.scrollLeft;
                    p.y = e.clientY + bdy.scrollTop  + doc.scrollTop;
                }
            }
            p.p=hypot(p.x, p.y)
            return p
        }
        function hypot(x,y,rnd){return _round(Math.sqrt(Math.pow(x,2)+Math.pow(y,2)),rnd)}
    function _domprops(nu,attr,style,klass,content){
        if(attr && typeof(attr)=="object"){
            if(attr.klass){klass=attr.klass;delete attr.klass}
            if(attr.style){style=attr.style;delete attr.style}
            if(attr.content){content=attr.content;delete attr.content}
        }
        if(style&&typeof(style)=="object"){Object.keys(style).forEach(function(a){nu.style[a]=style[a];})}
        if(klass){String(klass).split(",").forEach(function(a){nu.classList.add(a.trim());})}
        if(attr&&typeof(attr)=="object"){Object.keys(attr).forEach(function(a){nu.setAttributeNS(null,a,attr[a]);})}
        if(content&&String(nu.nodeName).toLowerCase()=="text"){nu.appendChild(document.createTextNode(content))}
        return nu
    }
        function _copy(src,target){
            if(!(src&&typeof(src)=="object")){return target}
            var isarr=Array.isArray(src);
            target||(target=isarr?[]:{});
            if(isarr){src.forEach(function(k,i){target[i]=k})}
            else{Object.keys(src).forEach(function(k,i){target[k]=src[k]})}
            return target
        }
        var animframe=function(fn,ctx){if(!ctx&&!(self==this||!this)){ctx=this}
            if(!window.requestAnimationFrame){
                window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
                    function(callback) {  window.setTimeout(callback, 1000 / 60); };
            }
            return function(){var a=[].slice.call(arguments),c=ctx;if(!ctx&&!(self==this||!this)){c=this}
                window.requestAnimationFrame(Function.apply.bind(fn,c,arguments))
            }
        }
        function solveTriangle(e,t,n,r,i,s){function o(e){return e==null}function u(e){return e!=null}function v(e){return e.toPrecision(9)}function m(e){return e/180*Math.PI}function g(e){return e/Math.PI*180}function y(e,t,n){return Math.sqrt(e*e+t*t-2*e*t*Math.cos(m(n)))}function b(e,t,n){var r=(e*e+t*t-n*n)/(2*e*t);if(r>=-1&&r<=1){return g(Math.acos(r))}throw"No solution"}var a=u(e)+u(t)+u(n);var f=u(r)+u(i)+u(s);var l,c,h=Math.sin,p=Math.cos,d=Math.tan;if(a+f!=3){throw"Give exactly 3 pieces of information"}else if(a==0){throw"Give at least one side length"}else if(a==3){c="Side side side (SSS) case";if(e+t<=n||t+n<=e||n+e<=t){throw c+" - No solution"}r=b(t,n,e);i=b(n,e,t);s=b(e,t,n);var w=(e+t+n)/2;l=Math.sqrt(w*(w-e)*(w-t)*(w-n))}else if(f==2){c="Angle side angle (ASA) case";if(r==null)r=180-i-s;if(i==null)i=180-s-r;if(s==null)s=180-r-i;if(r<=0||i<=0||s<=0)throw c+" - No solution";var E=Math.sin(m(r));var S=Math.sin(m(i));var x=Math.sin(m(s));var T;if(u(e)){T=e/E;l=e*T*S*x/2}if(u(t)){T=t/S;l=t*T*x*E/2}if(u(n)){T=n/x;l=n*T*E*S/2}if(o(e)){e=T*E}if(o(t)){t=T*S}if(o(n)){n=T*x}}else if(u(r)&&o(e)||u(i)&&o(t)||u(s)&&o(n)){c="Side angle side (SAS) case";if(u(r)&&r>=180||u(i)&&i>=180||u(s)&&s>=180){throw c+" - No solution"}if(o(e))e=y(t,n,r);if(o(t))t=y(n,e,i);if(o(n))n=y(e,t,s);if(o(r))r=b(t,n,e);if(o(i))i=b(n,e,t);if(o(s))s=b(e,t,n);if(u(r)){l=t*n*Math.sin(m(r))/2}if(u(i)){l=n*e*Math.sin(m(i))/2}if(u(s)){l=e*t*Math.sin(m(s))/2}}else{c="Side side angle (SSA) case - ";var N,C,k;if(u(e)&&u(r)){N=e;C=r}if(u(t)&&u(i)){N=t;C=i}if(u(n)&&u(s)){N=n;C=s}k=u(e)&&o(r)?e:u(t)&&o(i)?t:u(n)&&o(s)?n:null;if(C>=180){throw c+"No solution"}var T=N/Math.sin(m(C)),L=k/T,A,O,M;if(L>1||C>=90&&N<=k){throw c+"No solution"}else if(L==1||N>=k){c+="Unique solution";A=g(Math.asin(L));M=180-C-A;O=T*Math.sin(m(M));l=N*k*Math.sin(m(M))/2}else{c+="Two solutions";var _=g(Math.asin(L)),D=180-_,P=180-C-_,H=180-C-D,B=T*Math.sin(m(P)),j=T*Math.sin(m(H)),A=[_,D],M=[P,H],O=[B,j];l=[N*k*Math.sin(m(P))/2,N*k*Math.sin(m(H))/2]}u(e)&&o(r)&&(r=A);u(t)&&o(i)&&(i=A);u(n)&&o(s)&&(s=A);if(o(e)&&o(r)){e=O;r=M}if(o(t)&&o(i)){t=O;i=M}if(o(n)&&o(s)){n=O;s=M}}return{aln:e,bln:t,cln:n,aa:r,ba:i,ca:s,area:l,status:c}};
        function klass(op,el,kls){
            var offset=2
            if(op&&typeof(op)=="object"&&op.nodeType){el=op;op=null;offset=1}
            op=op||"toggle";
             for(var i=0,l=[].concat.apply([],[].slice.call(arguments,offset));i<l.length;i++){
                if(typeof(l[i])!="string"){continue}
                el.classList[op](l[i])
            }
            return el
        }
        function holdMouse(delay,success,failure0){
            var ctx=this,offset=3,failure=failure0,args;
            //if failure call back is not provided then
            // in case failur succes is invoked with first arg as false
            if(typeof(failure)!="function"){
                failure=function(){success.apply(this,[false].concat([].slice.call(arguments)))};
                offset=2
            };
            args=[].slice.call(arguments,offset)
            var _worker=function _worker(waitfor,f,f1,a){
                var  _timer=0,_holdingmup=function _holdingmup(ev){if(_timer===-1){return}
                        Svg.Util.stopEv(ev)
                        _fn(true)
                },
                _fn=function _fn(mup){ if(_timer===-1){return}
                        if(_timer){clearTimeout(_timer)}
                        var fn=(mup===true)?f1:f;_timer=-1;
                        document.removeEventListener("mouseup",_holdingmup);
                        fn.apply(ctx,a)
                    }
                _timer=setTimeout(_fn,waitfor);
                //hold for waitfor sec
                document.addEventListener("mouseup",_holdingmup);
            }

        _worker(delay,success,failure,args);

        }
    var svgNS = "http://www.w3.org/2000/svg"
        function curry( fn0){var fn=fn0,a=[].slice.call(arguments,1);
            return function(){ return fn.apply(this, a.concat([].slice.call(arguments)))}
        }
        return {svgNS:svgNS,each:_each,extend:_extend,extendOne:_extendOne,
            removeEl:function removeEl(el){  return (el&&el.parentNode)?el.parentNode.removeChild(el):null},
            removeKlass:curry(klass,"remove"),
            toggleKlass:curry(klass,"toggle"),
            addKlass:curry(klass,"add"),
            createEl:function _makeEl(tag,attr,style,klass,content){
                var nu = _domprops(document.createElementNS(svgNS,tag),attr,style,klass,content);
                nu.appendTo=function(c){return c.appendChild(this)}.bind(nu)
                return nu
            },
            makeMatrix:makeMatrix,
            getBounds:getBounds,
            domprops:_domprops,
            animframe:animframe ,generatorFactry:generatorFactry,
             toDataURI:function(){
                 //url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1'   xmlns:xlink='http://www.w3.org/1999/xlink'></svg>"
             },
            getBase64FromImageUrl:function getBase64FromImageUrl(URL) {
            var img = new Image();
            img.src = URL;
            img.onload = function () {
                var canvas = document.createElement("canvas");
                canvas.width =this.width; canvas.height =this.height;
                 var ctx = canvas.getContext("2d");  ctx.drawImage(this, 0, 0);
                 var dataURL = canvas.toDataURL("image/png");
                 alert(  dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));

            }
        },
            solveTriangle:solveTriangle,//a,b,c A,B,C
            calcAngle:calcAngle,
            hypot:function(x,y,rnd){return _round(Math.sqrt(Math.pow(x,2)+Math.pow(y,2)),rnd)},
            getMidPoint:getMidPoint,    pointOnCircle:pointOnCircle,
            bezierControlPt:bezierControlPt,
            toDegrees:toDegrees,
            sidesOf90degTri:sidesOf90degTri, sidesOfTringle:sidesOf90degTri,
            fowlerAngle:FowlerAngle,
            degreeBet2Pts:degreeBet2Pts,
            radianBet2Pts:radianBet2Pts,
            toRadians:toRadians   ,
            round: _round ,holdMouse:holdMouse,
             addEv:function(el,ev,fn){el&&el.addEventListener&&el.addEventListener(ev,fn);    return el},
            removeEv:function(el,ev,fn){el&&el.removeEventListener&&el.removeEventListener(ev,fn); return el},
            stopEv:function(ev){
                ev.stopPropagation && ev.stopPropagation();
                ev.stopImmediatePropagation &&ev.stopImmediatePropagation();
                ev.preventDefault && ev.preventDefault();
            },
            setupDragger:function setupDragger(container1,selector1,onchange1,onstart1,onend1,ctx1,auto){
                var bdy=document.body,doc= document.documentElement,throttledlog=$.throttle(console.log.bind(console),50);
                     var targetel=null,selector=selector1,draglayer=(container1.parentNode||container1).querySelector(".draglayer");
                    if(selector1 && selector1.nodeType){targetel=selector1;selector=null};
                return (function _activate(container,selector,onchange,onstart,onend,ctx){
                      function _activate1(ev,m){
                         if(setupDragger.busy ){return};
                          var animationFrame = new AnimationFrame({useNative: true}) , frameId ;

                        var el
                        if(ev ){
                            if(!(ev.which==1||ev.button==1||ev.button===0)){return}
                            el=ev.target
                            if(selector){
                                var t=ev.target,all=[].slice.call(container.querySelectorAll(selector))
                                 if(all.indexOf(el)==-1){
                                     el=all.find(function(it){return it.contains(el)})
                                 }
                                if(!el){return}
                            };
                        }
                         var memo={
                             container:container,selector:selector,ctx:ctx,
                             qu:[],
                             box:new Svg.Bbox(),
                             onstart:isFn(onstart)?onstart.bind(ctx):noop,
                             onend:isFn(onend)?onend.bind(ctx):noop,
                             onchange:isFn(onchange)? onchange.bind(ctx):noop,
                             state:0,ts:+new Date(),
                             elst:getBounds(container),
                             evst:ev?Svg.Point(mousepos(ev)) :null
                         }
                         if(memo.evst){
                             memo.box.p1.to(memo.evst).minus(memo.elst.left,memo.elst.top);
                             memo.savedst=memo.box.p1.clone() ;
                             memo.savedend=memo.box.p1.clone() ;
                        }
                          if(m){
                              _each(m,function(v,k){memo[k]=v})
                           }
                         var Context=ctx;
                         if(draglayer){
                             memo.bboxol=draglayer.querySelector(".bboxol")
                         }

                         memo.state=0
                         if( memo.state===0&&memo.onstart){
                             memo.onstart.call(Context,ev,memo);
                             if(memo.stop===true){
                                 memo.state=-2;
                                 return
                             }
                            else {memo.state++}
                         }
                          if(memo.track){
                              memo.track.save()
                          }
                          //container.classList.add("noselection")
                          setupDragger.busy=1;
                          var sel=window.getSelection?window.getSelection():null
                          if(sel&&!sel.isCollapsed) {
                              sel.removeAllRanges();
                          }
                         Svg.Util.stopEv(ev)
                          var que=[]
                          function proc(){
                              if(!(que&&que[0]&&que[0].data)){return}
                              var ev=que.shift(),nu=ev.data;
                              frameId=0;
                              if(nu.x<0||nu.y<0){
                                  memo.box.p1.to(memo.savedst).plus(nu)
                              } else{memo.box.p2.to(memo.savedend).plus( nu.x , nu.y )}
                              if(!memo.box.p2.p()){memo.box.p2.to(memo.box.p1) ;}

                              if(memo.track){
                                  if(!memo.track._saved){memo.track.save()}
                                  memo.track.restore().plus(nu.x , nu.y)
                              }
                              //throttledlog(memo.box.anchor.x, memo.box.anchor.y, "   ",memo.box.p2.x, memo.box.p2.y,"  ",memo.box.w,memo.box.h)

                              if(memo.stop===true){
                                  memo.state=-1;
                                  return
                              }

                              memo.qu.push({x:nu.x,y:nu.y,box:memo.box.clone()})
                              if(!memo.selrem) {
                                  var sel = window.getSelection ? window.getSelection() : null
                                  if (sel && !sel.isCollapsed) {
                                      sel.removeAllRanges();
                                  }
                                  memo.selrem=true
                              }
                              memo.onchange(ev,memo)
                          }
                         var mv=function(ev){
                             if(memo.state<0){return}
                             if(!memo.evst){
                                 memo.evst=Svg.Point(mousepos(ev))
                                 if(!memo.box.p1.p()){
                                     memo.box.p1.to(memo.evst).minus(memo.elst.left,memo.elst.top);

                                }
                                 memo.selrem=0
                             }
                             if(!memo.box.p2.p()){memo.box.p2.to(memo.box.p1) ;}
                             if(!memo.savedst){memo.savedst=memo.box.p1.clone() ;}
                             if(!memo.savedend){memo.savedend=memo.box.p1.clone() ;}
                             if( memo.state===0&&memo.onstart){memo.onstart.call(Context,ev,memo);
                                 memo.state++ }
                             memo.ts=+new Date()
                             var nupt=mousepos(ev) //;nu.x-=memo.elst.left;nu.y-=memo.elst.top
                              que[0]=Object.create(ev,{data:{value:{x:nupt.x-memo.evst.x,y:nupt.y-memo.evst.y}}})
                             if(!frameId) {
                                 frameId=animationFrame.request(proc)
                             }


                         Svg.Util.stopEv(ev)
                     }
                      function chk(ev){
                          if( (memo.state<=0&& memo.state!=-2) ||(+new Date() -  memo.ts)>4000){ cleanup()} else{setTimeout(chk,5000)}
                      }
                     function cleanup(ev){setupDragger.busy=0;
                         if(ev){Svg.Util.stopEv(ev)}
                         if(memo.onup){document.removeEventListener("mouseup",memo.onup);memo.onup=null}
                         if(memo.onmove){container.removeEventListener("mousemove",memo.onmove);memo.onmove=null}
                         if(draglayer&&draglayer.style){memo.bboxol=null;
                             draglayer.innerHTML="";
                             draglayer.style.display="none"
                         }
                         if(frameId){animationFrame.cancel(frameId);frameId=null}

                         container.classList.remove("noselection")
                         memo.qu=[];
                         if( memo.state!=-2){   // memo.box.p1.clear();memo.box.p2.clear()
                             container.removeEventListener("mousemove",mv);
                              if(memo.onend){
                                 if(ev){ev.data=memo.box.d;memo.onend.call(Context,ev||{data:memo.box.d},memo);}
                             }
                          }
                          memo.state=-2;  memo.stop=true;
                         Object.freeze(memo)
                     }
                         if(draglayer&&draglayer.style){
                              draglayer.style.display=""
                         }
                     container.addEventListener("mousemove",memo.onmove=mv);
                     document.addEventListener("mouseup", memo.onup=cleanup  )
             }
             ;

                    if(auto!==false){
                        (targetel||container).addEventListener("mousedown",_activate1);
                    }
                     return {
                         activate:function(ev,memo){
                         _activate1(ev,memo);
                        }
                     }
        })(container1,selector,onchange1,onstart1,onend1,ctx1)

            },
            chainableSet:(function(){
                var _cache=[],CSet=null
                function noop(){}
                function _init(){
               if(CSet){    return CSet  }
                CSet=function(lst){
                    if(!(this instanceof CSet)){return new CSet(lst)}
                    if(!(lst===null)){this.init(lst);}
                }

                CSet.prototype={
                    __backingarray:null,
                    init:function(lst){
                        this.__backingarray=[]
                        this.__capacity=CSet._initialCapacity
                        if(lst && Array.isArray(lst)){
                            this.add(lst);
                        }
                        return this
                    },
                    min:function(){return Math.min.apply(Math,this.toArray())},max:function(){return Math.max.apply(Math,this.toArray())}};
                ["length", "toLocaleString", "join", "pop", "push", "concat", "reverse", "shift", "unshift", "slice", "splice", "sort", "filter", "forEach", "some", "every", "map", "indexOf", "lastIndexOf", "reduce", "reduceRight", "contains", "find"]
                    .forEach(function(it,i){
                        Object.defineProperty(CSet.prototype,it,(function(prop){
                            var desc={},m=prop
                            if(typeof(Array.prototype[m])=="function"){
                                var mutating=["pop","push","shift", "unshift", "splice"]
                                desc.value= mutating?
                                    function(){var res=Array.prototype[m].apply(this.__backingarray,arguments)
                                        this.checkCapacity();
                                        return res;
                                    }:
                                    function(){return Array.prototype[m].apply(this.__backingarray,arguments)}
                                desc.writable=false
                            } else{
                                desc.get=function(){return this.__backingarray[m]}
                                desc.set=function(){}
                            }
                            desc.enumerable=true
                            return desc
                        })(it))
                    });
                   for(var i=0;i<100;i++){
                       Object.defineProperty(CSet.prototype,i+"",{get:Function("return this.__backingarray["+i+"]"),set:Function("v","return this.__backingarray["+i+"]=v"),enumerble:true})
                   }
                    CSet._initialCapacity=100
                    CSet.prototype.exit=function(){this._cxtdata=null;return this}
                    CSet.prototype.enter=function(data){var d=data
                        if(!Array.isArray(d)){d=Array(this.size()+1).join("0").split("").map(function(){return data})}
                        this._cxtdata=d
                        return this
                    }
                   CSet.prototype.toArray=function(){return this.__backingarray}
                   CSet.prototype.subSet=function(fromIdx,toIdx){
                       var f=(fromIdx&&(Number(fromIdx)+1)>0)?fromIdx:0,t=(toIdx&&(Number(toIdx)+1)>0)?toIdx:0
                       if(f<0){f=this.size()+f}
                       var res=this.__backingarray.slice(f,t>f?t:undefined)
                       var nu= this.newInstance()
                       nu.add(res)
                       return  nu

                   }
                   CSet.prototype.groupsOf=function(cnt,eager,overlap,fn){
                       var r=this.__backingarray,nu=[],i=0,ln=this.size();
                       if(!fn&&typeof(overlap)=="function"){fn=overlap;overlap=null;}
                       fn=fn||function(a){return a}
                       overlap=Math.max(0,Number(overlap)||0)
                       cnt=Math.min(ln,Math.max(1,Number(cnt)||0))
                       while(i<ln){
                           i=(nu.push(fn(r.slice(i,i+cnt),nu.length))*(eager?1:cnt))-overlap
                       };
                       return nu
                   }
                   CSet.prototype.isComponentType=function(v){
                       if(!(v&&typeof(v)=="object")){return false}
                       if(!this._compovalidator){this._compovalidator=function(it){return it&&it.isPoint}}
                       if(this._compovalidator){return this._compovalidator(v)}
                       return v&&typeof(v)=="object"&&Object.getPrototypeOf(v)==this._componentProto}
                   CSet.prototype.createComponent=function(i){
                       if(!this._compocreator){this._compocreator=function compocreator(){return Point.create.apply(Point,arguments)}}
                       if(this._compocreator){return this._compocreator.apply(this,arguments)}
                       return i}
                   CSet.prototype._g=function(i){return this.__backingarray[i]}
                   CSet.prototype._s=function(i,v0){var v=v0 ,a=this.__backingarray,compoProto=this._componentProto
                       if(!this.isComponentType(v0)){ v=this.createComponent(v0)}
                       if(i>=a.length){
                           var d=a.push(v)-(this.__capacity||0);
                           if(d>=0){this.addCapacity(d+50)}
                       }
                       else if(i>=0){a[i]=v}
                   }
                   CSet.prototype.checkCapacity=function(){var diff=this.__backingarray.length-this.__capacity;
                       if(diff>0){this.addCapacity(diff+50)}
                       return this
                   }
                   CSet.prototype.addCapacity=function(num){if(!(num&&num>0)){return }
                       var i=this.__capacity  +1,nu=i+num,nup={},pr=CSet.prototype ;
                       while(i<=nu){var s=String(i)
                           if(!(s in pr)){
                               nup[s]={get:Function("return this._g("+i+")"),set:Function("v","this._s("+i+",v)")
                                   ,enumerble:true}
                           }
                           i++;
                       }
                       if(Object.keys(nup).length){
                           Object.defineProperties(CSet.prototype,nup)
                       }
                       CSet._initialCapacity=this.__capacity=i
                       return this
                   }
                   CSet.prototype.clear=function(){
                       this.__backingarray.length=0;
                       return this
                   }
                   CSet.prototype.getAt=function(i,deflt){
                       var l=this.size(true)
                       if(i<0){i=l+i}
                       if(i>=0&&i<l){return this._g(i)}
                       return deflt
                   }
                   CSet.prototype.setAt=function(i,val){var l=this.size(true)
                       if(i<0){i=l+i}
                       if(i>=l||val!==this._g(i)){this._s(i,val)}
                       return this
                   }
                   CSet.prototype.last=function(){return this._g(this.size()-1)}
                   CSet.prototype.discard=function(){
                       //this.__backingarray.forEach(function(it){Point._cache.push(it.clear());})
                   }
                    CSet.prototype.findAll=function(fn,nomutate){
                        var nu=this.__backingarray.filter(fn)
                        if(nomutate===true){return nu}
                        this.__backingarray.length=0;
                        [].push.apply(this.__backingarray,nu)
                        return this
                    };
                   CSet.prototype.size=function(recheck){
                       return this.__backingarray.length
                   };
                   CSet.prototype.add=function(){
                       var sz=this.size() ,l=[].slice.call(arguments),idx=sz
                       this.checkCapacity();
                       for(var i=0,ln=l.length;i<ln;i++){
                           if(Array.isArray(l[i])||(l[i]&&typeof(l[i])=="object"&&("length" in l[i])&&l[i].length>=0)){
                               var a=l[i],sz1=a.length
                               for(var i2=0,ln2=a.length;i2<ln2;i2++){
                                   this._s(idx++,a[i2])
                               }
                           } else{this._s(idx++,l[i])}
                       }
                       return this
                   };
                   CSet.prototype.toString=function(){return this.__backingarray.map(function(it){return it.toString()}).join(" ")}
                    CSet.prototype.tap=function(fn){
                        this.each(fn);
                        return this;
                    }
                    CSet.prototype.each=function(fn,ctx){this.__backingarray.forEach(fn,ctx||this);return this}
                    CSet.prototype.collect=function(fn0,ctx){
                        var res,fn=isFn(fn0)?fn0:generatorFactry().getPropValueOrInvoke(fn0);;
                            res=this.__backingarray.map(fn,ctx);
                            if(!this._reset(res)){return res;}

                        return this
                    }
                    CSet.prototype.invokeFor=function(fn,ctx){
                        var a=[].slice.call(arguments,2);
                        var res=[],_self=this,entered=this._cxtdata;
                        for(var i=0,l=this.__backingarray,ln=l.length,el;el=l[i],i<ln;i++){
                            if(el&&this.isComponentType(el)){  var a1=a.slice()
                                a1.unshift(el);
                                if(entered){a1.unshift(entered[i])}

                                res.push(fn.apply(ctx,a1))
                            }
                        }
                        if(!this._reset(res)){return res;}
                        return this

                    },
                        CSet.prototype._reset=function(nuarr,m,nocheck){
                            if(!Array.isArray(nuarr)){return null}
                            var _self=this;
                            if(Array.isArray(nuarr)&&nuarr.every(function(el){
                                return (m&&m.returnself)||(el==null)||(el&&typeof(el)=="object" && _self.isComponentType(el))}) ){
                                this.clear().add(nuarr.filter(function(it){return it}))
                                return this
                            }
                            return null
                        }
                    CSet.prototype.invoke=function(m0 ){
                       var m,a=[].slice.call(arguments,1),compoProto=this._componentProto;//Point.prototype
                       if(typeof(m0)=="string"){
                           var dexcriptor,proto=[this,this[0],compoProto].find(function(it){return it && m0 in it});
                           if(proto){dexcriptor=Object.getOwnPropertyDescriptor(proto,m0)}
                           if(dexcriptor){
                               if(isFn(dexcriptor.value)){
                                   m=dexcriptor.value;
                               } else{}
                           }
                           if((this[0]&& m0 in this[0])||m0 in compoProto){
                               m=(function(prop){var p=prop;return function(){return this[p]}})(m0)
                           } else if(m0 in this){var ds=Object.getOwnPropertyDescriptor(this,m0)||Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this),m0);
                               m= (ds&&typeof(ds.value||ds.get)=="function")?(ds.value||ds.get):null
                           }
                       } else{m=m0}
                       if(typeof(m)!=="function"){return null}
                        var res=[],_self=this,entered=this._cxtdata;
                       for(var i=0,l=this.__backingarray,ln=l.length,el;el=l[i],i<ln;i++){
                           if(el&&this.isComponentType(el)){  var a1=a.slice()
                               if(entered){a1.unshift(entered[i])}
                               res.push(m.apply(el,a1))
                           }
                       }
                        if(!this._reset(res,m)){return res;}
                        return this

                   };




                   CSet._mixin= function mixinTarget(targetProto,compocreator,compovalidator,returnSelf0){
                       var props={ }, returnSelf=returnSelf0||[] ,CSetprototype=Object.create(CSet.prototype);
                       Object.keys(targetProto).forEach(function(k0){
                           if(!(k0&&typeof(k0))=="string"){return}
                           var k=String(k0),
                               ds=Object.getOwnPropertyDescriptor(targetProto,k0)
                               ,inokable  ,
                               _wrap=function(val){return !val?null:(function(m){ return function(){ return this.invoke.apply(this,[m].concat([].slice.call(arguments))) } })( val)}
                           if(!ds||["toString","init","__proto__","constructor"].indexOf(k)>-1||k in CSetprototype ){return}

                           inokable=_wrap((ds&&typeof(ds.value||ds.get)=="function")?(ds.value||ds.get):null );
                           if(typeof(inokable)!="function"){
                               inokable=(function(prop){var p=prop;return function(){return this.__backingarray[p]}})(k)
                               inokable._arity=0 ;
                               var k1="get"+ k.charAt(0).toUpperCase()+ k.substr(1);
                               if(!(k1 in CSetprototype)){
                                   props[k1]={get:inokable,set:noop,enumerable:true,configurable:false}
                               }
                           }
                           if(typeof(inokable)!="function"){return}
                           if(returnSelf.indexOf(k)>=0){
                               inokable.returnself=true
                           }
                           if(!(k in CSetprototype)){
                               props[k]={value:inokable, enumerable:true,writable:false,configurable:false}
                           }
                           //CSetprototype[k]=inokable
                       })
                       Object.defineProperties(CSetprototype,props);
                       CSetprototype._compovalidator=compovalidator;
                       CSetprototype._compocreator=compocreator;

                       function ctor(lst){
                           if(!(this instanceof ctor)){return new ctor(lst)}
                            this.init(lst);
                       }
                       CSetprototype.constructor=ctor;
                       ctor.prototype=CSetprototype;
                       CSetprototype.newInstance=function(lst){ var ct=this.constructor;
                           var nu=new ct(lst)
                           nu._compocreator=compocreator
                           nu._compovalidator=compovalidator
                           return nu
                       }
                       return ctor;
                   }
               //) (Pointprototype,PointSet.prototype) ;
                    return CSet
                }


            return function(){
                _init();
                var compotypeproto=arguments[0],
                    compocreator=arguments[1],
                    compovalidator=arguments[2],
                    returnselflist=arguments[3];
                   var ctor=_cache.find(function(a){return a[0]==compotypeproto});
                   if(ctor){return ctor[1]}
               if(compotypeproto){
                  //if(typeof(target)=="function") {proto=target.prototype}
                  //else if(isPlain(target)) {proto=target}
                  //else{proto=Object.getPrototypeOf(target)}
                  var nuklass= CSet._mixin(compotypeproto,compocreator,compovalidator,returnselflist)
                   _cache.push([compotypeproto,nuklass])
                  return nuklass;
               }

            }
                
                
        })()

                
    }
}

 var util=utils()


        function _r(a,pres){return Math.round(Number(a)||0)}
        function _weakmap(){
            if(typeof(WeakMap)=="undefined"){
                var DEL={},NULL={nill:true,valueOf:function(){return null}}
                WeakMap=function(){
                    var _keys=[NULL],_vals=[NULL]
                    _getIndex=function(k,createifnot){if(!k){return 0}
                        var i=_keys.indexOf(k);
                        if(i<1&&createifnot===true){i=_keys.push(k)-1;_vals[i]=null;}
                        return i<1?0:i
                    };//0-if none and 1+ idfexists
                    this.get=function(k,deflt){var v=_vals[_getIndex(k)] ;return v===NULL?deflt:v}
                    this.set=function(k,v){var c=this.get(k ),i=_getIndex(k,!(v===DEL));
                        if(v===DEL && i){ _keys.splice(i,1);_vals.splice(i,1)}
                        else if(v!==c){  _vals[i]=v   }
                        return c===NULL?null:c
                    }
                    this["delete"]=function(k){return this.set(k,DEL)}
                    this.has=function(k){return !!_getIndex(k)}
                    this.clear=function(){while(_keys.length){_keys[0]=null;_vals[0]=null;}
                        _keys.length=0;_vals.length=0;
                        return this;
                    }
                }
            }
            return   new WeakMap();
        }

        function noop(){}
        function capitalize( s ){var str=String(s)+"  "
            return (str.charAt(0).toUpperCase()+ str.substr(1)).trim()
        }
        function rcurry( fn0){var fn=fn0,a=[].slice.call(arguments,1);
            return function(){return function(){ return fn.apply(this, [].slice.call(arguments).concat(a))}}
        }
        function konstruct(Cls){
            return konstruct_argarr(Cls,[].slice.call(arguments,1))
        }
        function konstruct_argarr(Cls,arr){
            return new (Function.bind.apply(Cls,[null].concat([].slice.call(arr))))()
        }
        function curry( fn0){var fn=fn0,a=[].slice.call(arguments,1);
            return function(){return function(){ return fn.apply(this, a.concat([].slice.call(arguments)))}}
        }
        function isNumber( v){
            return typeof(v)=="number" && !isNaN(v)&&(v===v+0)
        }
    function isFn( v){
        return typeof(v)=="function"
    }
    function falsy( v){
        return !v
    }
    function truthy( v){
        return !!v
    }
   var  _each=util.each,_extend=util.extend,_extendOne=util.extendOne
        function isPlain(a){return !!(a && typeof(a)=="object" && Object.getPrototypeOf(a)===Object.prototype) }
        function argArr(){var args=[]
            for(var i=0,l=arguments,ln=l.length,a;a=l[i],i<ln;i++){
                if(a &&a.toString && ({}).toString.call(a).indexOf("rguments")>0){
                    [].push.apply(args,argArr.apply(null,a));
                } else{args.push(a)}
            }
            while(args.length && typeof(args[args.length-1])==="undefined"){args.pop()}
            return args;
        }
        var WM
        function createklass(Super0,proto){
            var klass=function ctor(){ if(arguments[0]===0.11){return}
                if(!(this instanceof ctor)){return new ctor(arguments)}
                if(!WM){WM=_weakmap()}
                WM.set(this,Object.create(null));
                this.init.apply(this, arguments);
            }
            var Super=Super0||function(){}
            //      var construct = function () {},superpr=Object.getPrototypeOf(Super);
//        construct.prototype =  superpr;
            var construct = function () {};
            construct.prototype = Super.prototype;

            klass.prototype = new construct;
            klass.prototype.constructor = klass;
            if(typeof(proto.tap)!="function"){
                proto.tap=function(fn){
                    try{fn.apply(this,[this].concat([].slice.call(arguments,1)));} catch(e){console.error(e)}
                    return this
                }
            }
            if(typeof(proto.data)!="function"){
                proto.data=function data(k){  var d=WM.get(this)
                    if(k===null){_each(d,function(val,k){delete d[k]});return this}//clear
                    var a=argArr(arguments),ln=a.length ,noval=ln<2
                    return (!ln||k==null)?d:isPlain(k)?_extend(d,k):noval?d[k]:(d[k]=a[1],this);
                }
            }
            Object.keys(proto).forEach(function(k){
                var d =Object.getOwnPropertyDescriptor(proto,k)
                if(d.value && typeof(d.value)=="object" &&isFn(proto[k].set)&&isFn(proto[k].get)){
                    d=proto[k];
                }

                d&&Object.defineProperty(klass.prototype,k,d)
            })
            klass.prototype.isShape=true;
            klass.prototype.Super=Super.prototype
            if(proto.type||proto.tag){
                createklass.namelist[proto.type||proto.tag]=klass
            }
            return klass
        }

        createklass.namelist=Object.create(null);
        var SvgEl=createklass(null,{ isSvgEl:true,_attr:null,state:null,_kanvas:null,statics:{},
            _dispatch:function(type,k,v,o){
                if(!(this._l&& this._l.handlers&& this._l.handlers[type] &&!this._l._paused)){return }
                for(var l=this._l.handlers[type].slice(),ln=l.length,i=ln-1,f;f=l[i],i>=0;i--){
                    if(f.call(this,k,v,o)===false){
                        this._l.handlers[type].splice(i,1)
                    }
                }},

            getOuterViewPortDims:function(){
                 return this.setOuterViewPortDims()
            },
            setOuterViewPortDims:function(){
                var stt=this.statics;
                 if(!stt._outerviewport||stt._recalcouterviewport){
                    var el=this.wrapel||this.svg||(this.dom?this.dom.querySelector("svg,gp"):null);
                    if(el&&el.viewportElement){
                        stt._recalcouterviewport=!(stt._outerviewport=el.viewportElement.getBBox())
                    }
                    if(!stt._outerviewport){
                        var dom=this.dom||(this._kanvas?this._kanvas.dom:null);
                        if(dom){
                            stt._outerviewport=dom.getBoundingClientRect()
                            stt._recalcouterviewport=1
                        }
                    }
                }

                return stt._outerviewport
            },
            pause:function(flag){
                this._l||(this._l={handlers:{}});
                this._l._paused=!!(flag==null||flag) ; return this},
            on:function(type,fn){
                this._l||(this._l={handlers:{}});
                this._l.handlers[type]||(this._l.handlers[type]=[]);
                typeof(fn)=="function"&&this._l.handlers[type].push(fn.bind(this)); return this
            },
            domEv:function(type,hndl){
                this._attachEv(type)
                this._handles[type].handles.push(hndl)
                return this
            },
            toString:function(){
                return ""
            },
            getKanvas:function(){return this._kanvas},
            getState:function(nm){this.state||(this.state={});return this.state[nm]},
            setState:function(nm,val){this.state||(this.state={});this.state[nm]=val;return this;},
            isWritable:function(){
                return !this._readonly
            },
            prop:function(type){
                var k,v,el
                var args,isattr,isstyle,save=null

                if( ({}).toString.call(arguments[1]).indexOf("Arguments")>=0) {args=[].slice.call(arguments[1])}
                else{args=[].slice.call(arguments,1)}
                if(args[args.length-1]&&args[args.length-1].nodeType){
                    el=args.pop()
                }
                if(typeof(args[0])=="boolean"){save=args.shift()}
                el=el||this.svg


                var ret=this;
                if(args[0]=="klass"){type="klass"}
                if(type=="klass"&&args[0]!="klass"){k="klass"}
                else{k=args.shift();}
                if(!type&&typeof(k)=="string"&&el){
                    if(el.style && k in el.style){type="css"}
                    else if(k in el){type="attr"}
                }
                if(k!=null){
                     if(k && typeof(k)=="object"&&!Array.isArray(k)){
                        for(var i=0,l=Object.keys(k),ln=l.length, k1,v1;k1=l[i],v1=k[l[i]],i<ln;i++){
                            this.prop(type,k1,v1,el);
                        }
                        return this;
                       }

                    isstyle=(type=="style"||type=="css"||k=="style")
                    if(!args.length||(v=args.shift())==undefined){
                        ret=el?type=="klass"?[].slice.call(el.classList):
                            (isstyle?el.style[k]:el.getAttributeNS(null,k)):null
                    }else{
                        if(save || ( (el==null || el==this.svg) &&k.length>2&&!isstyle)){
                            this._attr[k]={type:type,val:v};
                        }
                        if(el){ var v1=v
                            if(v1 &&v1.type&&"val" in v1){
                                v1=v.val;
                            }
                            try{
                            if(type=="klass"){
                                  [].concat.apply([],Array.isArray(v1)?v1:String(v1).split(/\s+/)).forEach(
                                      function(v){
                                           if(typeof(v) =="string"){
                                               var op=""
                                               if(/^[!\+\-\/]/.test(v.trim())){
                                                   op=v.charAt(0);v=v.substr(1).trim()
                                               }
                                               if(op=="!"||op=="-"){ util.removeKlass(el, v)}
                                               else if(op=="/"){ el.classList.toggle(v)}
                                               else{util.addKlass(el,v)}
                                           }
                                      }
                                  )

                            }
                            else if(isstyle){el.style[k]=v1}
                            else{el.setAttributeNS(null,k,v1)}
                            } catch(e){}
                        }
                    }
                }
                 return ret
            },
            css:function(){
                return this.prop("css",arguments)
            },
            attr:function(){
                return this.prop("attr",arguments)
            },
            fill:function(clr){ if(!clr){return}
                this._kanvas&&this._kanvas.attr("fill",clr)
                return this.attr("fill",clr)
            },
            stroke:function(clr){
                if(!clr){return}
                this._kanvas&&this._kanvas.attr("stroke",clr)
                return this.attr("stroke",clr)
            }
        });


         var Pointprototype={type:"point", tag:"point" ,isPoint:true,_relative:null,_readonly:null,  time:null,
            init:function(){ if(arguments[0]===0.11){return}
                var arr=Point.parse.apply(this,arguments)
                if( !(this instanceof Point)){return Point.create(arr[0],arr[1],arr[2])}
                this.time=+new Date()
                this.reset(arguments)
            },
             velocityFrom : function (start) {
                 return (this.time !== start.time) ? this.distanceTo(start) / (this.time - start.time) : 1;
             },
            distanceTo : function (start) {
                return Math.sqrt(Math.pow(this.x - start.x, 2) + Math.pow(this.y - start.y, 2));
            },
             reset:function(){
                 var arr=Point.parse.apply(this,arguments),_readonly
                 if(typeof(arr[0])=="boolean"){_readonly=arr.shift()}
                 var id=this.id;
                 this.clear();
                 if(this._readonly){this._readonly=null}
                 this._v={x:null,y:null};
                 this.id=id||("id_"+ (++Point.__idcounter))
                 this.pos=""
                 if(arr[2]){this.m=arr[2]||"";
                     var a=String(arr[2]).split("_");
                     this.m=a.shift();
                     if(a[0]){this.pos=a[0]}
                 }
                 this.x=arr[0];
                 this.y=arr[1];
                 this._readonly=_readonly
             },
             clear:function(){
                 this._v={x:null,y:null};
                 if(this._relative){this._relative.clear()._noreset=false}
                 this._P=this._readonly=this.id=this.pos=this.m=null;this.data(null)
                 return this;
             },
            relativeTo:function(p){return this.clone().minus(p)},
            get:function(k){return "_v" in this?this._v[k]:null},
            set:function(k,v0,noev){ if(this._readonly){return}
                var v=util.round(v0,2)
                if(!("_v" in this )){return}
                var old=this._v[k];   if(this._relative){this._relative._noreset=false;}
                if(isNumber(v)&&v!==old){this._v[k]=v;
                    !noev && this._l && this._l.handlers["change"] && old && !this._l._paused&& this._dispatch("change",k,v,old)
                }
            },

            setPos:function(p,m){
                if(p&&!m){var arr=String(p).split(/[\s,\-_]/);
                    if(arr.length>1){p=arr[0];m=arr[1]}
                }
                this.pos=p;
                if(typeof(m)=="string"){this.m=m;}
                return this;
            } ,
            moveMarker:function(m){var nu=this.marker
                if(nu){m.marker=nu;nu.point=m;this.marker=null}
                return this;
            },
            clone:function(m){
                var nu=Point.create(this.x,this.y);
                nu.m=m||this.m;nu.pos=this.pos
                return nu;
            },
             angleTo:function angleTo(p02){
                 return this.calcAngle.apply(this,arguments);
             },
             calcAngle:function calcAngle(p02){
                 return util.calcAngle(this,Point.parse2.apply(this,arguments));
             },

            fromMap:function(mp){if(mp && isPlain(mp)){this.to(mp)}},
            toMap:function(k,v){return {x:this.x,y:this.y,m:this.m+"_"+this.pos}},
            toJson:function(k,v){return JSON.stringify(this.toMap())},

            toString:function(){  if(this._curve){return this._curve}
                if(this.x==null||this.y==null){return this.m||""}
                var str,s=[];if(this.m && this.m!="Z"){s.push(this.m)}
                s.push(this.x+", "+ this.y)
                if(this.m=="Z"){s.push("Z")}
                str=s.join(" ")
                return str
            },
            p:function(){if(this.x==null||this.y==null){return 0}
                if(!this._P || !this._back || (!this._readonly && !(this._P&&this._back[0]&&this._back[0]===this.x&&this._back[1]===this.y))){
                    this._back=[this.x,this.y];
                    this._P=Math.round(Math.sqrt(Math.pow(this.x,2)+Math.pow(this.y,2))*100)/100
                }
                return this._P
            },
            restore:function(ky){this._saved||(this._saved={});
                ky=ky||"_default"
                if(!this._readonly && this._saved[ky]){this.x=this._saved[ky][0];this.y=this._saved[ky][1];
                    this.m=this._saved[ky][2];
                }
                return this
            },
            isModified:function(ky){this._saved||(this._saved={});
                ky=ky||"_default"
                return this._saved[ky] && [this._saved[ky].x,this._saved[ky].y,this._saved[ky].m].join(" ")!=[this.x,this.y,this.m].join(" ");return this},
            save:function(ky){this._saved||(this._saved={});
                var rem=ky===null;ky=ky||"_default"
                this._saved[ky]=rem?null:[this.x,this.y,this.m];return this},
            minus:function(){var arr=Point.parse.apply(this,arguments)||[0,0];
                this.x-=arr[0];this.y-=arr[1];
                return this;
            },
            plus:function(){
                var arr=Point.parse.apply(this, arguments)||[0,0];
                this.x=this.x+(arr[0]||0);this.y=this.y+(arr[1]||0);
                return this;
            }, toArray:function(){ return [this.x,this.y]; },
            by:function(){ return this.plus.apply(this,arguments); },
            to:function(){var arr=Point.parse.apply(this,arguments);
                this.x=arr[0]||0;this.y=arr[1]||0;this.m=arr[2]||this.m;return this;
            },
            diff:function(){
                var p1=Point.parse (true, arguments) ;
                return p1.minus(this)
            },

            midPoint:function(){var p2=Point.parse(true,arguments),p1=this ;
                 return Point.create(util.round(p1.x+(p2.x-p1.x)/2),util.round(p1.y+(p2.y-p1.y)/2))
            },
            distanceFrom:function(){var p2=Point.parse(true,arguments),p1=this ;
                return util.round(Math.sqrt(Math.pow(p1.x-p2.x,2)+Math.pow(p1.y-p2.y,2)))
            },
             restoreCoordAnchor:function(){
                 var anch=this.getOuterViewPortDims()
                 if(!anch){return null}
                 return this.to(this.x,anch.height-this.y)
             },
             toBottomLeftAnchor:function(mutate){
                 var anch=this.getOuterViewPortDims()
                 if(!anch){return null}
                 return mutate?this.to(this.x,anch.height-this.y):Point.create(this.x,anch.height-this.y)
             },
            within:function(p,dis){return this.distanceFrom(p)<=dis},
            closest:function(arr0){
                var arr=arr0.map(Point.create1).filter(truthy),ln=arr.length,pt=this.p(),abs=Math.abs
                if(!ln)  {return null}
                if(ln==1){return arr[0]}
                if(ln==2){return arr[0]>arr[1]?arr[1]:arr[0]}
                return arr.sort(function(a,b){return abs(pt,a)>abs(pt,b)}).shift()

            },
             applyCss:function(el){var attr={}
                 if(el&&el.nodeType){var t=String(el.tagName||el.nodeName).toLowerCase()
                     if("cx" in el){attr.cx=this.x;attr.cy=this.y}
                     else if("x1" in el){attr.x1=this.x;attr.y1=this.y}
                     else {attr.x=this.x;attr.y=this.y}
                     this.attr(attr,el);
                 }
                 return this;
             },ensureRelative:function(){
                if(this._isrelative ){return this}
                if((!this._relative||(this._relative&&!this._relative._noreset)) &&this._v&&this._v.x!=null){
                    this._relative=this.clone().setPos(this.pos,this.m)
                    this._relative._isrelative=true
                    this._relative._noreset=false
                }
                return this._relative;
            },
             valueOf:function(){
                return this.p();
             }
        };
        Object.defineProperties(Pointprototype,{
            x:{ get:function(){return this.get('x')},
                set:function(v){ this.set('x',v) },
                configurable:false,enumerable:true
            },
            y:{ get:function(){return this.get('y')},
                set:function(v){ this.set('y',v) },
                configurable:false,enumerable:true
            },

            relative:{ get:function(){
                if(this._isrelative){return this}
                if(this._relative&&!this._relative._noreset){

                }
                return this._relative||this
            },
                set:function(v){
                    if(this._isrelative){return }
                    var r=this.ensureRelative();

                    if(r ){
                        r.to(v);  r._noreset=true
                    }
                },
                configurable:false,enumerable:true
            }
        });
        var Point=createklass(SvgEl,Pointprototype);
    Point.__idcounter=0
        var ArcPointSet=createklass(Bbox,{c:null,rot:null,sweep:null,largearc:null,
             init:function(st,end,c,rot,largearc,sweep){
                 this.reset(st);
                 this.p1=Point.create(c)
                 this.p2=Point.create(c)
                 this.ar=Point.create(c)
                 this.rot=rot||"0"
                 this.sweep=sweep||"1"
                 this.largearc=largearc||"0"

             } ,
            toString :function(){
                var s=["A",this.c.x,this.c.y,this.rot,this.largearc,this.sweep,this.x,this.y ];
                if(this.p1&&this.p1.p()){s.unshift("M"+this.p1.x+" "+this.p1.y)}
               return s.join(" ")
            }
        });
        Point.create1=function(a){return (a &&a.isPoint)?a:Point.create(a)}
        Point.create=function(){
            var nu=Point._cache.shift()
            if(nu){  nu.reset(arguments)}
            else{nu=new Point(arguments);}
             return nu
        }
        Point.addToCahce=function(pt){if(pt){Point._cache.push(pt.clear())}}
        Point._cache=[]
    var Transform=createklass(SvgEl,{type:"transform", tag:"transform",
        /*  a  b  c     sx b  tx
            d  e  f     d  sy  ty
            x  y  z     x  y  z
        */
        vals:null   ,_owner:null, defaults:{scale:{x:1,y:1},rotate:{x:"0",y:"0"} ,translate:null,skew:{x:"0",y:"0"}} ,
        init:function(){
             this.vals={scale:null,rotate:0,translate:null,skewX:null,skewY:null}
        } ,
        translate:function(x,y){ this.vals.translate=Point.create(arguments);return this },
        scale:function(x,y){
            this.vals.scale=Point.create(arguments);return this
        },
        rotate:function(a,x,y){
            this.vals.rotate=a  ;
           return this
         },
        skewX:function(a){this.vals.skewX=a  ;},
        skewY:function(a){this.vals.skewY=a  ;},
        setTo:function(el){el=el||this._owner
            if(el&&el.setAttribute){el.setAttribute("transform",this.build())}
            else if(typeof(el.attr)=="function"){el.attr("transform",this.build())}
            return this;
        },
        animate:function(el,dur,repeat){el=el||this._owner
            /*
             (function(id){
             var tot=0,i=5,iter=1,mn=0,mx=360*5,inc=5,timer=null,dir=1,el=app.kanvas.find(id),
             fn=Svg.Util.animframe(function(){   if(iter<=0){clearTimeout(timer);return}
             i=i+((dir?1:-1)*inc);
             if((dir&&i>=mx)||(!dir&&i<=mn)){if(timer){clearTimeout(timer);timer=null;} dir=dir?0:1
             iter--;
             if(iter<=0){clearTimeout(timer);return}
             }
             el.rotate(i)
             timer=setTimeout(fn,10)
             });
             timer=setTimeout(fn,10)

             */
            if(el&&el.animate) {var arr=[]
                _each(this.vals,function(v,k){
                    var curr={scale:{x:1,y:1},rotate:{x:0,y:0}  ,translate:null,skew:{x:0,y:0} }
                    if(v!=null){
                        if(k=="translate"){
                            curr.translate={
                                x:el.attr?el.attr("x"):el.getAttribute?el.getAttribute("x"):0,
                                y:el.attr?el.attr("y"):el.getAttribute?el.getAttribute("y"):0
                            }
                        }
                        arr.push({prop:k,from: curr[k],to:v})
                     }
                })
                this._animation=el.animate(arr).start()
            }

            return this
        },
        play:function( ){  return this.setTo.apply(this,arguments); },
        val:function(o,val){
            if(typeof(o)=="object"){
               _each(o,function(v,k){
                     if(String(k) in this){this[k](v)}
               },this)
            } else if(typeof(o)=="string"&&arguments.length>1){
                if(o in this){this[o](val)}
            }
            return this
        },


        clear:function(){this.init()},
            build:function(){ var arr=[];                           //translate(20, 50) scale(1, 1) rotate(-30 10 25)
            if(this.vals.translate ) {arr.push("translate("+this.vals.translate.x+", "+this.vals.translate.y+")")}
             if(this.vals.scale ) {arr.push("scale("+this.vals.scale.x+", "+this.vals.scale.y+")")}
            if(this.vals.rotate !=null) {arr.push("rotate("+this.vals.rotate+")")}
            if(this.vals.skewX) {arr.push("skewX("+this.vals.skewX+")")}
            if(this.vals.skewY) {arr.push("skewY("+this.vals.skewY+")")}
             return arr.join(" ")
        }



})
        var PointSet=function(lst){
            function compocreator(){return Point.create.apply(Point,arguments)}
            function compovalidator(v){return v &&v.isPoint}
          var kls=  util.chainableSet(Point.prototype,compocreator
                ,    compovalidator
                ["minus","plus","save","restore","angleTo","setPos","on","pause","_dispatch"]
            )
            kls.prototype.ensure=function(count,limit){
                while(this.size()<count){
                    this.add(Point.create())
                }
                if(limit&&this.size()>count){
                    this.splice(count,this.size()-count)
                }
                return this
            }
            //PointSet=kls
            var nu=new kls(lst);
            nu._compocreator=compocreator
            nu._compovalidator=compovalidator
            return nu
        }
            /*if(!(this instanceof PointSet)){return new PointSet(lst)}
             this.__backingarray=[]
            this.__capacity=PointSet._initialCapacity
            if(lst && Array.isArray(lst)){
                this.add(lst);
            }
        }
        PointSet.prototype={min:function(){return Math.min.apply(Math,this.toArray())},max:function(){return Math.max.apply(Math,this.toArray())}};
        ["length", "toLocaleString", "join", "pop", "push", "concat", "reverse", "shift", "unshift", "slice", "splice", "sort", "filter", "forEach", "some", "every", "map", "indexOf", "lastIndexOf", "reduce", "reduceRight", "contains", "find"]
            .forEach(function(it,i){
                Object.defineProperty(PointSet.prototype,it,(function(prop){
                    var desc={},m=prop
                    if(typeof(Array.prototype[m])=="function"){
                        var mutating=["pop","push","shift", "unshift", "splice"]
                        desc.value= mutating?
                            function(){var res=Array.prototype[m].apply(this.__backingarray,arguments)
                                this.checkCapacity();
                                return res;
                            }:
                            function(){return Array.prototype[m].apply(this.__backingarray,arguments)}
                        desc.writable=false
                    } else{
                        desc.getEntity=function(){return this.__backingarray[m]}
                        desc.set=function(){}
                    }
                    desc.enumerable=true
                    return desc
                })(it))
            });

        for(var i=0;i<100;i++){
            Object.defineProperty(PointSet.prototype,i+"",{getEntity:Function("return this.__backingarray["+i+"]"),set:Function("v","return this.__backingarray["+i+"]=v"),enumerble:true})
         }
    PointSet._initialCapacity=100
        PointSet.prototype.toArray=function(){return this.__backingarray}
    PointSet.prototype.subSet=function(fromIdx,toIdx){
        var f=(fromIdx&&(Number(fromIdx)+1)>0)?fromIdx:0,t=(toIdx&&(Number(toIdx)+1)>0)?toIdx:0
        if(f<0){f=this.size()+f}
        var res=this.__backingarray.slice(f,t>f?t:undefined)
        var nu=new PointSet()
        nu.add(res)
         return  nu

    }
    PointSet.prototype.groupsOf=function(cnt,eager,overlap,fn){
        var r=this.__backingarray,nu=[],i=0,ln=this.size();
        if(!fn&&typeof(overlap)=="function"){fn=overlap;overlap=null;}
        fn=fn||function(a){return a}
        overlap=Math.max(0,Number(overlap)||0)
        cnt=Math.min(ln,Math.max(1,Number(cnt)||0))
        while(i<ln){
            i=(nu.push(fn(r.slice(i,i+cnt),nu.length))*(eager?1:cnt))-overlap
        };
         return nu
    }
    PointSet.prototype._g=function(i){return this.__backingarray[i]}
    PointSet.prototype._s=function(i,v0){var v=v0 ,a=this.__backingarray
        if(!( Object(v) instanceof Point)){ v=Point.create(v0)}
        if(i>=a.length){
            var d=a.push(v)-(this.__capacity||0);
            if(d>=0){this.addCapacity(d+50)}
        }
        else if(i>=0){a[i]=v}
    }
        PointSet.prototype.checkCapacity=function(){var diff=this.__backingarray.length-this.__capacity;
            if(diff>0){this.addCapacity(diff+50)}
            return this
        }
        PointSet.prototype.addCapacity=function(num){if(!(num&&num>0)){return }
                var i=this.__capacity  +1,nu=i+num,nup={},pr=PointSet.prototype ;
             while(i<=nu){var s=String(i)
                 if(!(s in pr)){
                    nup[s]={getEntity:Function("return this._g("+i+")"),set:Function("v","this._s("+i+",v)")
                         ,enumerble:true}
                 }
                 i++;
              }
            if(Object.keys(nup).length){
                Object.defineProperties(PointSet.prototype,nup)
            }
            PointSet._initialCapacity=this.__capacity=i
            return this
        }
        PointSet.prototype.clear=function(){
            this.__backingarray.length=0;
            return this
        }
        PointSet.prototype.getAt=function(i,deflt){
            var l=this.size(true)
            if(i<0){i=l+i}
            if(i>=0&&i<l){return this._g(i)}
            return deflt
        }
        PointSet.prototype.setAt=function(i,val){var l=this.size(true)
            if(i<0){i=l+i}
            if(i>=l||val!==this._g(i)){this._s(i,val)}
            return this
        }
        PointSet.prototype.last=function(){return this._g(this.size()-1)}
        PointSet.prototype.discard=function(){
            this.__backingarray.forEach(function(it){Point._cache.push(it.clear());})
        }
        PointSet.prototype.size=function(recheck){
            return this.__backingarray.length
        };
        PointSet.prototype.add=function(){
            var sz=this.size() ,l=[].slice.call(arguments),idx=sz
            this.checkCapacity();
            for(var i=0,ln=l.length;i<ln;i++){
                if(Array.isArray(l[i])||(l[i]&&typeof(l[i])=="object"&&("length" in l[i])&&l[i].length>=0)){
                    var a=l[i],sz1=a.length
                    for(var i2=0,ln2=a.length;i2<ln2;i2++){
                        this._s(idx++,a[i2])
                    }
                } else{this._s(idx++,l[i])}
             }
            return this
        };
         PointSet.prototype.toString=function(){return this.__backingarray.map(function(it){return it.toString()}).join(" ")}
        PointSet.prototype.invoke=function(m0 ){
            var m,a=[].slice.call(arguments,1);
            if(typeof(m0)=="string"){
                var dexcriptor,proto=[this,this[0],Point.prototype].find(function(it){return it && m0 in it});
                if(proto){dexcriptor=Object.getOwnPropertyDescriptor(proto,m0)}
                if(dexcriptor){
                    if(isFn(dexcriptor.value)){
                        m=dexcriptor.value;
                    } else{}
                }
                if((this[0]&& m0 in this[0])||m0 in Point.prototype){
                    m=(function(prop){var p=prop;return function(){return this[p]}})(m0)
                } else if(m0 in this){var ds=Object.getOwnPropertyDescriptor(this,m0)||Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this),m0);
                    m= (ds&&typeof(ds.value||ds.getEntity)=="function")?(ds.value||ds.getEntity):null
                }
            } else{m=m0}
            if(typeof(m)!=="function"){return null}
            debugger;
            var res=[]
            for(var i=0,l=this.__backingarray,ln=l.length,el;el=l[i],i<ln;i++){
                if(el&&el instanceof Point){
                    res.push(m.apply(el,a))
                }
            }
            if(res.every(function(el){return el&&typeof(el)=="object" && el instanceof Point})||m.returnself){
                return this
            }
            return res;
        };

        (function(Pprototype,PointSetprototype){
            var props={ }
            Object.keys(Pprototype).forEach(function(k0){
                if(!(k0&&typeof(k0))=="string"){return}
                var k=String(k0),
                    ds=Object.getOwnPropertyDescriptor(Pprototype,k0)
                    ,inokable  ,
                    _wrap=function(val){return !val?null:(function(m){ return function(){ return this.invoke.apply(this,[m].concat([].slice.call(arguments))) } })( val)}
                if(!ds||["toString","init","__proto__","constructor"].indexOf(k)>-1||k in PointSetprototype ){return}

                inokable=_wrap((ds&&typeof(ds.value||ds.getEntity)=="function")?(ds.value||ds.getEntity):null );
                if(typeof(inokable)!="function"){
                    inokable=(function(prop){var p=prop;return function(){return this.__backingarray[p]}})(k)
                    inokable._arity=0 ;
                    var k1="getEntity"+ k.charAt(0).toUpperCase()+ k.substr(1);
                    if(!(k1 in PointSetprototype)){
                        props[k1]={getEntity:inokable,set:noop,enumerable:true,configurable:false}
                    }
                }
                if(typeof(inokable)!="function"){return}
                if(["minus","plus","save","restore","angleTo","setPos","on","pause","_dispatch"].indexOf(k)>=0){
                    inokable.returnself=true
                }
                if(!(k in PointSetprototype)){
                    props[k]={value:inokable, enumerable:true,writable:false,configurable:false}
                }
                //PointSetprototype[k]=inokable
            })
            Object.defineProperties(PointSetprototype,props);
        }) (Pointprototype,PointSet.prototype) ;
        */
        var Dim=createklass(Point,{type:"Dim", tag:"Dim",
            height:{get:function(){return this.y},set:function(v){isNumber(v)&&(this.y=v);}},
            width:{get:function(){return this.x},set:function(v,pause){isNumber(v)&&(this.x=v);}},
            h:{get:function(){return this.y},set:function(v){isNumber(v)&&(this.y=v);}},
            w:{get:function(){return this.x},set:function(v){isNumber(v)&&(this.x=v);}}
        });
        Point.parse2=function(){if(arguments[0] && typeof(arguments[0])=="object"&&arguments[0] instanceof Point){return arguments[0]}
            return Point.parse.apply(this,arguments);
        }
        Point.parse=function(){
            var a=argArr.apply(null,arguments),ln =a.length,retinst
            if(typeof(a[0])=="boolean"){retinst=a.shift()}
            ln =a.length
            var m=typeof(a[ln-1])=="string"?a.pop():"",    x=a[0],  y=a[1]
            if( !isNumber(x)){
                if(x && typeof(x)=="object"){
                    if(Array.isArray(x)){y=x[1];m=x[2]||"";x=x[0];}
                    else{
                        y=((this&&this instanceof Dim)? (x.height||x.h):null)||x.top||x.y||0;
                        x=((this&&this instanceof Dim)? (x.width||x.w):null)||x.left||x.x||0;
                    }
                }
            } else{if(a.length==1){y=x}}
            return retinst?Point.create(x,y,m):[x||0,y||0,m]
        }
       var Pointpair=createklass(
           SvgEl,{type:"pointpair", tag:"pointpair",
               init:function(){ },
               distance:function(){return Math.sqrt(this.x*this.x + this.y*this.y);},    // Find distance to mouse
               angle:function(){return 90+Math.atan2(this.y, this.x)*180/Math.PI; },   //Find angle to mouse in degrees
               makeCircle:function(){},
               makeRect:function(){},
               makePath:function(){},
               makeTriagle:function(){}
}
       )
        var Bbox=createklass(SvgEl,{type:"bbox", tag:"bbox",
            p1:null,p2:null ,shape:null,_c:null,isSquare:null, _squaredim:null ,
            reset:function(force){   if(!(force===true)){return}
                var sp=this.data("shape") ,el
                if(!(sp&& sp.wrapel)){return}
                el= sp.wrapel
                if(!el.ownerSVGElement){return}
                var b=util.getBounds(el),b2=util.getBounds(el.ownerSVGElement.parentNode)
                this.p1.pause().to(b.left-b2.left,b.top-b2.top)
                this.p2.pause().to(this.p1.x+b.width,this.p1.y+b.height)
                this.p2.pause(false);this.p1.pause(false);
            },
            toSvgRect:function(){
                var sp=document.querySelector("svg")

                if(!(sp&&sp.createSVGRect)){return null}
                var nu=sp.createSVGRect(),dims=this.dims;
                _each("x y height width",function(k){nu[k]=dims[k]},this)
                 return nu
            },
            init:function(){
                var a=[].slice.call(arguments)
                var p1,p2,tmp
                if(a.length==4&&a.every(isNumber)){
                    p1=Point.create(a.shift(),a.shift())
                    p2=Point.create(a.shift(),a.shift())
                }else{
                    if(isNumber(a[0]) && isNumber(a[1])){p1=Point.create(a.shift()&&a.shift())}
                    else if(a[0] && a[0].x!=null&& a[0].y!=null){p1=Point.create(a.shift())}
                    if(p1 ){
                        if(isNumber(a[0]) && isNumber(a[1])){p2=Point.create(a.shift()&&a.shift())}
                        else if(a[0] && a[0].x!=null&& a[0].y!=null){p2=Point.create(a.shift())}
                    }
                }
                // if(p1&&p2&&p1.p()>p2.p()){tmp=p2;p2=p1;p1=tmp}
                this.p1=p1||Point.create(0,0);this.p2=p2||Point.create(0,0)
                this.p1.setPos("anchor","M")
                this.p2.setPos("term")
             },
            getOrdered:function(mutate){
                var rvrse=this.p1>this.p2, w=this.width,h=this.height,
                    s=(rvrse?this.p2:this.p1).toMap(),e={x:s.x+w,y:s.y+h}
                var nu= mutate===true?this:new Bbox();
                nu.p1.to(s);nu.p2.to(e);
                return nu;
            },
            asSquare:function(){
                this.isSquare=true;
                (function(_slf,hndl){
                    // _slf.p2.on(hndl);
                    // _slf.p1.on(hndl);

                })(this,function(xy,val,old){ if(old==null||    !val){return}
                        //this._squaredim=this.p2[xy]-this.p1[xy] ;
                        //this.p2.pause()
                        // this.width=this.height=this._squaredim
                        // this.p2.pause(false);
                        //console.log(1,xy,old,this.p1[xy],this.p2[xy], this._squaredim)
                    }.bind(this));
                return this;
            },
            clone:function(){
                return new Bbox(this.p1.clone(),this.p2.clone())
            },
            moveTo:function(){
                var d=this.d,p=Point.parse(true,arguments);
                this.p1.to(p);
                this.p2.to(this.p1.toArray()).plus(d);
                return this
            },
            moveBy:function(p){
                this.p1.by(p);this.p2.by(p)
                return this
            },
            overlaps:function(p,partially){
                var p1=this.p1,p2=this.p2,pp1=p1.p(),pp2=p2.p(),
                    x1=pp1>pp2?p2.x:p1.x,
                    x2=pp1>pp2?p1.x:p2.x,y1=pp1>pp2?p2.y:p1.y,y2=pp1>pp2?p1.y:p2.y
                return p>=pp1&&p<=pp2&&x>=x1&&y>=y1&&x<=x2&&y<=y2
            },
            within:function(p){
                var pp=p.p(),p1=this.p1,p2=this.p2,pp1=p1.p(),pp2=p2.p(),
                    x1=pp1>pp2?p2.x:p1.x,
                    x2=pp1>pp2?p1.x:p2.x,y1=pp1>pp2?p2.y:p1.y,y2=pp1>pp2?p1.y:p2.y
                return pp>=pp1&&pp<=pp2&&p.x>=x1&&p.y>=y1&&p.x<=x2&&p.y<=y2
            },
            rel:function(){
                var nu=this.clone().moveTo(0,0);
                return nu
            } ,
            fromMap:function(mp){if(mp && isPlain(mp)){this.p1.to(mp.p1);this.p2.to(mp.p2);}},
            toMap:function(k,v){return {p1:this.p1&&this.p1.toMap?this.p1.toMap():{},p2:this.p2&&this.p2.toMap?this.p2.toMap():{}}},
            toJson:function(k,v){return JSON.stringify(this.toMap())},
            toString:function(k,v){
                return this.toJson()
            },
            asAttrSet:function(lst){var d=this.dims
                var s={};
               _each(typeof(lst)=="string"?lst.split(/[\s]+/):lst,function(a){
                     switch(a){
                         case "x":;case "x1":;case "left":s[a]=d.left;  break;
                         case "y":;case "y1":;case "top":s[a]=d.top;  break;
                         case "height":;case "h":s[a]=d.height;  break;
                         case "width":;case "w":s[a]=d.width;  break;
                         case "x2":s[a]=d.left+d.width;     break;
                         case "y2":s[a]=d.top+d.height;     break;
                         case "r":s[a]=d.height/2;         break;
                         case "cx":s[a]=d.left+d.width/2;   break;
                         case "cy":s[a]=d.top+d.height/2;  break;
                         case "rx":s[a]=d.width/2;        break;
                         case "ry":s[a]=d.height/2;       break;
                     }
                })
                return s
            },  applyCss:function(el){var d=this.dims;
                ["top","left","height","width"].forEach(function(k){el.style[k]=d[k]+"px"},this)
            },
            getPoints:function(k,v){
                var d=this.dims;
                return [[d.left, d.top],[d.left+ d.width, d.top],[d.left+ d.width, d.top+ d.height],[d.left, d.top+ d.height]].map(function(it){return Point.create(it)})
            },
            set:function(k,v){
                if(k in this && isNumber(v)){this[k]=v}
            }

        });
        Object.defineProperties(Bbox.prototype,{
                d:{get:function(){
                    return Point.create(Math.abs(this.p2.x-this.p1.x),Math.abs(this.p2.y-this.p1.y))
                },
                set:function( ){
                    var _d=Point.parse(true,arguments)
                    this.p2.x=this.p1.x+(_d.x||0);
                    this.p2.y=this.p1.y+(_d.y||0);}
                },
                diagonal:{get:function(){return this.p2.distanceFrom(this.p1)},set:noop },
                anchor:{get:function(){
                        return (this.p2.x<this.p1.x||this.p1.y>this.p2.y)?this.p2:this.p1
                },set:function(v){this.p1.to(v)}},
                term:{get:function(){
                    return (this.p2.x<this.p1.x||this.p1.y>this.p2.y)?this.p1:this.p2

                },set:function(v){this.p2.to(v)}},

                dims:{get:function(){var a=this.anchor
                    return {y: a.y,x: a.x,top: a.y,left: a.x,height:this.h,width:this.w}
                },set:function(){}},
                topleft:{get:function(){return this.anchor.setPos("topleft")},set:function(v){this.anchor.to(v)}},
                topright:{get:function(){return Point.create(this.anchor.x,this.term.y).setPos("topright")},
                    set:function(v){var p=Point.parse(v);this.anchor.x=p[0];
                    this.term.y=p[1]}
                },
                bottomright:{get:function(){return this.term.setPos("bottomright")},set:function(v){this.term.to(v)}},
                bottomleft:{
                    get:function(){return Point.create(this.anchor.y,this.term.x).setPos("bottomleft")},
                    set:function(v){var p=Point.parse(v);
                        this.anchor.y=p[1];
                        this.term.x=p[0]
                    }
                },
                bounds:{get:function(){
                    var revrse,//=this.p1.p()>this.p2.p(),
                        s=this[revrse?"p2":"p1"],e=this[revrse?"p1":"p2"]
                    var res=[s.clone().setPos("topleft"),Point.create(e.x,s.y).setPos("topright"),
                        e.clone().setPos("bottomright"),Point.create(s.x,e.y).setPos("bottomleft")
                    ]
                    res.forEach(function(it){res[it.pos]=it})
                    return res;
                },set:noop
                },
                c:{get:function(){this._c||(this._c=Point.create(0,0));
                    this._c.x=this.x+this.w/2;
                    this._c.y=this.y+this.h/2
                    return this._c
                },
                    set:function(p){var diff=this.c.diff(p);
                        this.p1.moveBy(diff);this.p2.moveBy(diff)
                    }
                },
                r:{get:function(){var d=this.d;
                        return Point.create(d.x/2,d.y/2)},
                    set:function(x,y){
                        if(arguments.length==1){
                            if(typeof(x)=="number"){y=x}
                            else if(Array.isArray(x)){y=x[1];x=[0]}
                            else if(x&&typeof(x)=="object"&& "x" in x){y=x.y;x=x.x}
                        }
                        if(isNumber(x)){this.width=x*2}
                        if(isNumber(y)){this.height=y*2}
                    }
                },
                x:{get:function(){return this.p1.x},set:function(v){isNumber(v)&&(this.p1.x=v);}},
                y:{get:function(){return this.p1.y},set:function(v){isNumber(v)&&(this.p1.y=v)}},
                x1:{get:function(){return this.x},set:function(v){isNumber(v)&&(this.p1.x=v);}},
                y1:{get:function(){return this.y},set:function(v){isNumber(v)&&(this.p1.y=v);}},
                x2:{get:function(){return this.p2.x},set:function(v){isNumber(v)&&(this.p2.x=v);}},
                y2:{get:function(){return this.p2.y},set:function(v){isNumber(v)&&(this.p2.y=v);}},
                height:{get:function(){return Math.abs(this.y2-this.y)},set:function(v){isNumber(v) && this.p2.set("y",this.p1.y+v);}},
                width:{get:function(){return Math.abs(this.x2-this.x)},set:function(v){isNumber(v)  && this.p2.set("x",this.p1.x+v);}},
                h:{get:function(){return this.height},set:function(v){ this.height= v ;}},
                w:{get:function(){return this.width},set:function(v){ this.width= v ;}}

            }
        )
        var Shape=createklass(SvgEl, {type:"shape", tag:"shape",array:null, multiPoint:null,bbox:null,config:null,
            _transform:null,
            x:{get:function(){return this.bbox.x}, set:function(v){this.bbox.x=v} },
            y:{get:function(){return this.bbox.y}, set:function(v){this.bbox.y=v} },
            resetBBox:function(){
                var  el=this
                var bb=el.wrapel.getBBox(),bb1=el.bbox;
                var  pp=el.getPoints()
                 var ar=pp.map(
                    function(p){
                        return  [p.x-bb1.p1.x,p.y- bb1.p1.y]
                    }
                )
                ar.forEach(
                    function(d,i){
                        pp[i].x=bb.x- d[0];
                        pp[i].y=bb.y- d[1];
                    }
                )
                el.bbox.reset()
                return this
            }   ,
            to:function(){
                var p=Point.create(arguments);
                if(!this.bbox.p1.p()) {
                    this.bbox.p1.to(p)
                } else{
                    this.bbox.p2.to(p)
                }
                if(this.multiPoint){
                    this.array.add(p);
                }

                return this
            },
            setConfig:function(k,v){
                if(k&&!(this.config[k]==v)){
                    var old=this.config[k]
                    this.config[k]=v
                    this._kanvas.fire("config",{el:this,key:k,value:v,old:old})
                 }
                return this
            },
            getConfig:function(k){return this.config[k]},
            init:function(cntnr){
                if(cntnr===0.11){return}
                this.array=new PointSet();this._handles=Object.create(null)
                this.bbox=new Bbox();
                this.config={}
                this.bbox.data("shape",this)
                this._attr=_extend({fill:"#f9f9f9", opacity:.4,stroke:"gray","stroke-width":"4"},this._attr||{});//defaults
                var args=[].slice.call(arguments)
                for(var l=args,ln=args.length,i=ln-1;i>=0;i--){
                    if(l[i]&&l[i].nodeType){
                        this.dom=l[i];args.splice(i,1)
                    }
                }
                if(args[0]&&(isNumber(args[0])||args[0].x!=null)){
                   this.bbox.p1=Point.create(args)
                }

                this.id=this.id||"path_"+(++Shape.__idcounter);
                this._markers=[];this._subs=[];

                this.initShape.apply(this,args)


            },
            getMiddlePoint:function(){
              return util.getMidPoint(this )
            },

            within:function(p){
                return true;
            },
            fade:function fade () {
                // getEntity the target's bounding box
                var target=this.svg,bounds = target.getBBox();
                var t_x = bounds.width / 2 + bounds.x;
                var t_y = bounds.height / 2 + bounds.y;
                // getEntity a pointer to the template animations
                var template_animations = document.getElementById('defs').getElementsByTagNameNS('http://www.w3.org/2000/svg', '*');
                // clone and append the animations
                var animations = [];
                for (var i = 0; i < template_animations.length; i++) {
                    var animation = template_animations.item(i).cloneNode(false);
                    animations.push(target.appendChild(animation));
                }
                // customize translations
                animations[0].setAttributeNS(null, 'from', t_x + ',' + t_y);
                animations[0].setAttributeNS(null, 'to', t_x + ',' + t_y);
                animations[3].setAttributeNS(null, 'from', (-t_x) + ',' + (-t_y));
                animations[3].setAttributeNS(null, 'to', (-t_x) + ',' + (-t_y));
                // launch animations
                for (var i = 0; i < animations.length; i++) {
                    animations[i].beginElement();
                }
            },
            animate:function(prop){//{from, to,dur,repeat}
                var lst=[] ,el=this.svg,def={attributeType:"XML", begin:"indefinite",
                    attributeName:"x",from:null, to:null,dur:"1s",repeatCount:"1",fill:"freeze"}
                if(Array.isArray(prop)){
                    prop.forEach(function(p){
                        lst.push(_extend({},def,p))
                    })
                } else if(isPlain(prop)){
                    lst.push(_extend({},def,prop))
                } else if(typeof(prop)=="string"){
                    lst.push({attributeName:prop})
                }
                var doms=[],animations=[], maxdur=0,ns="http://www.w3.org/2000/svg";
                animations.add=function(p){
                    if(p.prop){p.attributeName=p.prop;delete p.prop}
                    if(p.from==null){p.from =el.getAttributeNS(ns,p.attributeName)}
                    if(p.to==null){p.to=el.getAttributeNS(ns,p.attributeName)}
                    if(p.repeat||p.times){p.prepeatCount=p.repeat||p.times}
                    if(p.values && Array.isArray(p.values)){p.values        = p.values.join(";")}
                    if(p.keyTimes && Array.isArray(p.keyTimes)){p.keyTimes        = p.keyTimes.join(";")}
                    p.dur=String(p.duration||p.time||p.dur||"1").replace(/[\D]+$/,"")+"s"
                    if(p.values && Array.isArray(p.values)){p.values        = p.values.join(";")}
                    if(p.freeze) {p.fill="freeze"}
                    //additive      = "sum"accumulate    = "sum"
                    if(["rotate","skewX","skewY","scale","translate"].indexOf(p.attributeName)>=0){
                        p.type=p.attributeName
                        p.attributeName="transform"
                    }  else if (p.attributeName=="motion"){
                        //var f='<animateMotion dur="6s" repeatCount="indefinite"><mpath xlink:href="#theMotionPath"/></animateMotion>'
                    }  else if (p.attributeName=="color"){
                     }
                    var descrip=_extend({},def,p);
                    var animEl=document.createElementNS(ns,descrip.attributeName=="transform"?"animateTransform":"animate")
                    _each(descrip,function(v,k){animEl.setAttributeNS(null,k,v)})
                    doms.push(el.appendChild(animEl))
                    maxdur=Math.max(maxdur, Number(String(p.dur).replace(/[\D]+$/g,""))||1)
                    this.push(animEl);
                }
                lst.forEach(function(p){animations.add(p)});
                var ths=this,another=this.animate.bind(this),que=[]
                var cleanup=function(){
                   //setTimeout(function(){doms.forEach(util.removeEl);doms=[]},100);
                 }


                var _pending=[],complete=function(){
                    var idx=_pending.indexOf(this);if(idx>=0){_pending.splice(idx,1)}
                    if(!_pending.length){
                        que.forEach(function(it){it.call(ths);});que.length=0;
                    }
                }

                return {
                    start:function(){

                        animations.forEach(function(it){
                            it._onend =function(){complete.call(this)}
                            it.setAttributeNS(null,"onend","this._onend()")
                            _pending.push(it);
                              it.beginElement();return this
                         })
                        que.push(cleanup)
                         return this
                    },
                    add:function(p){ animations.add(p)},
                    then:function(fn){var ret=ths
                        if(typeof(fn)!="function"){ret=this.animate.apply(this,arguments);fn=function(){ret.start()}}
                        que.push(fn);
                        return ret;
                    }
                }

            }  ,
            updatePoints:function(marker){
                if(!(marker&&marker.point)){return}
                var pos=marker.point.pos,arr=this.array,last=this.array.last(),delta//=marker.delta||marker.point.delta
                if(marker.end){
                    this.__dragging=null
                }
                else {this.__dragging=true}

                if(!this.multiPoint&&(pos=="term"||pos==last.pos||marker.point==last)){
                    var nu=marker.point.clone()

                    if(!this.multiPoint){
                        this.bbox.p2.to(nu)
                        arr[arr.length-1].to(nu)
                    }
                    else{arr.add(nu)
                        arr.last().m=""
                        if(marker.end){this.data("_saved",null)}
                    nu.data("shape",this)
                    }
                } else if(!this.multiPoint&&(pos=="anchor"||pos=="join0"||marker.point==this.array[0])){
                    var nu=marker.point.clone();
                    if(!this.multiPoint){
                        this.bbox.p1.to(nu)
                        arr[0].to(nu)
                    }
                    else{arr.unshift(nu);
                    if(marker.end){this.data("_saved",null)}
                    arr[0].m="M"
                    nu.data("shape",this)
                    }
                } else{
                    if(marker.end){this.data("_saved",null)}

                    arr.filter(function(it){return it.pos==pos}).forEach(function(it){
                        it && (delta?it.by(delta):it.to(marker.point))
                        //this.setRelativePos(it)
                    },this);
                   // var x=Math.min.apply(Math,arr.map(function(it){return it.x})),
                  //      y=Math.min.apply(Math,arr.map(function(it){return it.y}))
                  //  debugger;
                   // if(x){this.bbox.p1.x=x}
                  //  if(y){this.bbox.p1.y=y}
                    this.setRelativePos(arr )
                }
                //this.bbox.reset()
                //this.setRelativePos(arr,this.wrapel.getBBox())
            },
            updatePoints2:function(marker){
                if(!(marker)){return}
                var pos=marker.point.pos,arr=this.array
                arr.forEach(function(it){
                    if(!it){return}
                    if( it.pos==pos){
                        //if(this.bbox && it!=this.bbox.p1 && (it._isanchor||it.pos=="anchor")){this.bbox.p1.to(marker.point)}
                        //else if(this.bbox && it!=this.bbox.p2 && (it._isterm||it.pos=="term")){this.bbox.p2.to(marker.point)}
                        it.to(marker.point)
                    }
                },this);


            },
            initShape:function(){},
            onChange:function(marker){
                if(!(marker&&marker.point)){return}
                if(marker.type=="move"&&marker.point){
                     this.moveTo(marker)
                    if(marker.end){
                       // this.bbox.reset()
                        this.getPoints()
                        //this.setRelativePos(this.array,this.bbox)
                       // this.build(true)
                    }
                    //var s= this.serialize()
                    //this.clear()
                    //this.parse(s)

                }  else{
                    var box=this.bbox
                    if(marker && marker.point.pos){
                        if(this.updatePoints(marker)===false){return};
                    }
                    this.build()
                    this._afterDraw()

                }
                return this;
            },
            drawMarkers:function(callback){
                this._kanvas && this._kanvas.drawMarkers(this,callback);return this;
            },


            setDefaultAttr:function(){
                if(this._attr){

                    _each(this._attr,function(v,k){
                         if(v &&v.type&&"val" in v){
                             this.prop(v.type,k, v.val)
                         } else{
                             this.prop("attr",k, v)
                         }
                    },this)
                }
                if(!this.attr("fill")){this.attr("fill","#f9f9f9")}
            },
            setRelativePos:function(pt,bbox){
                if(!pt){return}
                if(!(bbox&&bbox.x)){bbox=null}
                var bb=bbox||this.wrapel.getBBox()//this.bbox
                if(pt.length>1){
                    for(var i=0,l=pt,ln=l.length;i<ln;i++){var p=l[i]
                        //&& !(p._relative&&p._relative._noreset
                        p&&typeof(p)=="object"   && this.setRelativePos(p,bb)}
                    return pt
                }
                if(!pt.relative){bb=this.bbox}
                 //var bb=this.wrapel.getBoundingClientRect()//this.wrapel.getBBox()
                //if(pt._relative&&pt._relative._noreset) {return this}
                pt.relative={x:pt.x-bb.x,y:pt.y-bb.y}
                return this;
            },
            inspectPath:function(){  return

                if(!this.multiPoint&&this.bbox.p2&&this.bbox.p1&&this.bbox.p.p()>this.bbox.p2.p()){

                    this.build()
                    this._kanvas.drawMarkers(this)
                }
                return this;
            } ,

            getPathString:function(arr0){
                var arr=arr0==null?this.getPath():arr0
                if(typeof(arr)=="string"){return arr}
                if(Array.isArray(arr)||arr.length>0){
                    return arr.map(function(it){
                        return (String((it!=null&&it.relative)?it.relative:it))
                    }).join(" ")
                }
            },
            getPath:function(arr ){
                return arr||this.getPoints()
            } ,
            getPoints:function(){
                var ln=this.array.size(true)
                return this.array
            },
            build:function(ondrag){

                if(!this.wrapel){
                    this.wrapel = util.createEl("g")
                    this.wrapel.id=this.id+"_gp";
                    this.wrapel.classList.add("gp");
                    if(this.id!="root"){
                        this.wrapel.classList.add("subgp");
                    }
                }
                var arr=this.getPoints()
                this.setRelativePos(arr , ondrag?null:this.bbox);
                this._built=true
                 if(this.wrapel ){
                     this.wrapel.setAttributeNS(null,"transform","matrix(1,0,0,1,"+this.bbox.p1.x+","+this.bbox.p1.y+")")
                    //this.wrapel.setAttributeNS(null,"transform","translate("+this.bbox.p1.x+","+this.bbox.p1.y+")")
                 }

                this.render(arr);
                //if(!this.isworker){this.bbox.reset()}
                if(this.wrapel&&this.svg&&!this.wrapel.contains(this.svg)){
                    this.svg=this.wrapel.appendChild(this.svg );
                }
                this.setDefaultAttr()
                if(!this.attr("fill")){this.attr("fill","none")}
                if(!this.isworker){
                    this.drawMarkers( );
                }

                this.afterBuild(arr)
                return this.wrapel;
            },
            afterBuild:function(){ },
            render:function(arr){
                // this.beforeBuild()
                arr||(arr=this.array);

                if(this._kanvas&&!(this.svg&&this.svg.parentNode===this.wrapel)){
                    this.svg = this._kanvas.makeEl("path",{"id":this.id+"_path","d":"M 0,0"
                    }).appendTo(this.wrapel);
                    this.svg=this.wrapel.appendChild(this.svg );
                    this.svg.id=this.id+"_path";
                }
                if(!this.svg){return}
                var Shape=this.getPath(arr),
                    d=this.getPathString(Shape);
                if(d){
                    if(this.closeOnTerm){d+="Z"}
                    this.svg.setAttributeNS(null,"d",d);
                }
                return this.svg;
            } ,
            syncPoints:function(){},
            _afterDraw:function(act){
                 if(!this.svg){return}
                this.attr("visibility","visible")
                this.attr("visibility","visible",this.wrapel)

                this.wrapel.onmouseover||(this.wrapel.onmouseover=function(){
                    _each(this.querySelectorAll(".kanvas-el,.marker"),function(it){
                        if(it.classList.contains("kanvas-el")){it.setAttributeNS(null,"stroke-width","8")}
                        else{it.setAttributeNS(null,"r","8");it.setAttributeNS(null,"fill","black")}
                    })
                });
                this.wrapel.onmouseout||(this.wrapel.onmouseout=function(){
                    _each(this.querySelectorAll(".kanvas-el,.marker"),function(it){
                        if(it.classList.contains("kanvas-el")){it.setAttributeNS(null,"stroke-width","4")}
                        else{it.setAttributeNS(null,"r","4");it.setAttributeNS(null,"fill","none")      }
                    })
                });
               //var bb=this.wrapel.getBBox()
                //this.bbox.p1.x=bb.x;
               // this.bbox.p1.y=bb.y
               // this.bbox.p2.x=bb.x+bb.width;
               // this.bbox.p2.y=bb.y+bb.height;

                this.syncPoints()

                this._dispatch("afterdraw")
                if(this._kanvas){this._kanvas.fire("afterdraw",{el:this,act:act})}
                this.afterDraw(act)
                /*var cells=this._kanvas.grid.cellsInRange(this.bbox.p1,this.bbox.p2).filter(function(it){

                    var rect= svg.createSVGPoint();
                    rect.x= it[2]
                    rect.y= it[3];
                    if(pth.isPointInFill(rect)){console.log("y");return true}
                    return !1
                    *//*rect.width=rect.height= 1;
                     var hits= svg.getIntersectionList(rect, null);
                     if (hits.length>0){
                     var  element= hits[hits.length-1];
                     if(element==pth){
                     return true;
                     }

                     //console.log(hits)
                     }*//*
                    //return //_self.within(Point.create({x:it[2],y:it[3]}))
                });
                [].forEach.call(this._kanvas.grid.svg.querySelectorAll(".hilite"),function(it){it.classList.remove("hilite")})
                cells.map(d$).forEach(function(c){c&&c.classList.add("hilite");
                });*/

            },
            afterDraw:function(){},
            getBbox:function(){return ""},
            string:function(){return ""},

            toMap:function(noid){
                var res= {

                    tag:this.tag,
                    type:this.type,
                    bbox:this.bbox?this.bbox.toMap():{},
                    attr:_extend({},this._attr)
                }
                if(!noid){res.id=this.id}
                if(this.multiPoint&&this.array){
                    res.points=this.array.toArray().map(function(it){return it.toMap?it.toMap():null}).slice()
                 }
                return  res
            },
            toJson:function(){
                return JSON.stringify(this.toMap())
            },
            toString:function(){
                return this.toJson()
            },
            clearMarkers:function( nodebug){
                var el=this.wrapel||document.getElementById(this.id+"_gp")
                if(el&&el.parentNode){
                    if(this._markers){this._markers.forEach.call(function(it){
                        util.removeEl(it.markersvg)});
                    };
                    [].forEach.call(el.querySelectorAll("circle.marker"),util.removeEl)
                    it.markersvg.length=0;
                    util.removeEl(el)
                }
            },
            clear:function( nodebug){
                if(this.isworker||(this.dom&&this.dom.classList.contains("workerlayer"))){
                    if(this.dom){_each(this.dom.querySelectorAll(".subgp"),util.removeEl)}
                    else{var par=this.svg||this.wrapel
                        if(par){while(par.firstChild){util.removeEl(par.firstChild)}  }
                    }
                    return
                } else {
                    if(this.wrapel){
                        var par=this.wrapel
                        while(par.firstChild){util.removeEl(par.firstChild)}
                    }
                }

                return this
            },
            redraw:function( dom){
                util.removeEl(this.svg)
                util.removeEl(this.wrapel)
                this.draw(dom)
            },
            draw:function( dom){

                if(dom){this.dom=dom}
                if(!this.dom){
                    if(this._kanvas){
                        if(this.__loopcheck){this.__loopcheck=0;return this}
                        this.__loopcheck=1
                        this._kanvas.draw();
                        return this
                    }
                }
                var old=this.dom.querySelector("#"+this.id+"_wrap")
                if(!this.dom){return this}
                if(this.dom && !(this.svgroot && this.svgroot==this.dom.querySelector("svg"))){// width="100%" height="100%"
                    util.createEl("svg").appendTo(this.dom)

                    this.svgroot=this.dom.querySelector("svg")
                    this.svgroot.id=this.id+"_wrap"



                }
                var wrapel=this.build()
                if(wrapel){
                    this.attach();
                }
                this._attachEv(null);
                this._afterDraw()
                return this
            },
            attach:function(dom){ return this.appendTo(dom)},
            appendTo:function(dom){dom=dom||this.svgroot ||this.dom
                   if(this.wrapel&&dom && dom.appendChild){
                       dom.appendChild(this.wrapel);
                   }
                return this
            },
            _attachEv:function(k){
                if(k===null){
                    for(var k1 in this._handles){
                        this._attachEv(k1) ;
                    }
                    return this  ;
                }
                if(!this._handles[k]){this._handles[k]={fn:null,handles:[]}}
                if(!this.svg){return}
                if(this._handles[k].fn){this.svg.removeEventListener(k,this._handles[k].fn)}
                this.svg.addEventListener(k,this._handles[k].fn=this._responder.bind(this))
                return this
            },
            _responder:function(ev){var t=ev.type
                if(this._handles[t]){this._handles[t].handles.forEach(function(it){it.call(this,ev)},this);}
                return this
            },

            mousemove:function(hndl){ return  this.domEv("mousemove",hndl);   },
            mouseover:function(hndl){ return  this.domEv("mouseover",hndl) },
            click:function(hndl){ return  this.domEv("click",hndl) },
            rclick:function(hndl){ return  this.domEv("click",function(){}) },
            mousedown:function(hndl){ return  this.domEv("mousedown",hndl) },
            mouseup:function(hndl){ return  this.domEv("mouseup",hndl) },
            last:  function(){ return this.array?this.array.last():null;},
            setAt:function(i0,m,x,y ){var i=(i0==null||isNaN(i0))?-1:i0
                var data=  Point.create(x,y,m)
                if(!this.array){return}
                if(i==-1){this.array.push(data)} else{this.array.setAt(i,data);}
                return this
            },
            append:function(m,x,y ){this.setAt(-1,m,x,y ) ;   return this;},
            moveBy:function(x,y,notx){
                var p=Point.parse(arguments);if(!p){return}
                this.bbox.moveBy(p[0],p[1])
                if(!notx && this.wrapel){
                    this.transform({position:this.bbox.p1})
                     //this.wrapel.setAttributeNS(null,"transform","matrix(1,0,0,1,"+this.bbox.x+","+this.bbox.y+")")
                }
                this._afterDraw("move")
                return this
            },
            moveTo:  function(x,y,noTx){
                var p
                if(x &&x.point){
                    noTx=y; p=x.point
                }
                else{p=Point.create(arguments)}
                if(p&&p!=this.bbox.p1){
                    this.bbox.moveTo(p)
                    if(!noTx && this.wrapel){
                        this.transform({position:p})
                        this._afterDraw("move")
                    }
                }
                this.getPoints()

                return this;
            },
            setAnchor:function(x,y){
                this.bbox.p1.to(x,y);
                return this;
            },
            setTerm:function(x,y){
                this.bbox.p2.to(x,y);
                 return this;
            },
            transform:function(p,noreset){  if(!this.wrapel){return this}
                if(this._quu&&this._quu.length){
                    this._quu.push(function(p1,r1){
                        this.getMatrix().transform(p1,r1)
                    }.bind(this,p,noreset))
                    return;
                }
                this.getMatrix().transform(p,noreset)

                return this
             },
            translate:function(p){
                this.getMatrix().translate(Point.create(arguments));
                if(this._kanvas&&this.svg){this.transform()}
                return this
            },
             getMatrix:function(){
                return this.__matrix||(this.__matrix=util.makeMatrix( this ));
            },
            skewX:function(n){
                this.getMatrix().update({skewX:n})
                if(this._kanvas&&this.svg){this.transform()}
                return this
            },
            skewY:function(n){
                this.getMatrix().update({skewY:n})
                if(this._kanvas&&this.svg){this.transform()}
                return this
            },
            scale:function(n ){
                this.getMatrix().update({scale:n})
                if(this._kanvas&&this.svg){this.transform()}
                return this
            },
            rotate:function(n ,pt1){
                var all=this.getMatrix().getAll(),
                    pt=pt1==null?this.getMiddlePoint().plus(all.translateX,all.translateY):pt1,
                    bb=this.wrapel.getBoundingClientRect()

                this.getMatrix().update({rotate:n,rotationPoint:{x:pt.x ,y:pt.y } })
                pt={x:bb.left+bb.width/2,y:bb.top+bb.height/2}
                if(pt1!=null){pt.x=pt1.x-pt.x;pt.y=pt1.y-pt.y;}

                if(this._kanvas&&this.svg){
                     this.transform(null,true)
                          var bb2=this.wrapel.getBoundingClientRect() ;
                         var pt2={x:bb2.left+bb2.width/2,y:bb2.top+bb2.height/2}
                        if(pt1!=null){pt2.x=pt1.x-pt2.x;pt2.y=pt1.y-pt2.y;}
                         if(pt.x!=pt2.x||pt.y!=pt2.y){
                            this.getMatrix().transform({translate:{
                                x:all.translateX+(pt.x-pt2.x),
                                y:all.translateY+(pt.y-pt2.y)}},true)
                         }
                 }
                return this
            },
            text:function(txt,x,y,props0){
                var node,p= Point.create(x,y),props
                this.textNodes||(this.textNodes=[]);
                props=_extend(props0,
                    {"id":this.id+"_text"+(this.textNodes.length),readonly:"readonly",klass:"text",content:txt,fill:"black"
                    })
                if(this.wrapel){
                    node=this._kanvas.makeEl("text",props)
                    node.appendTo(this.wrapel)
                    this.textNodes.push(node)
                    node.addEventListener("click",function(){if(!this.getAttributeNS(null,"readonly") ){alert('edit text')}});
                }
                //props.content=txt;

                return node
            },
            lineTo            :  function(x,y,i){ this.setAt(i,'L',x ,y);   return this;},
            hLineTo           :  function(x,y){ this.append('H',x ,y);   return this;},
            vLineTo           :  function(x,y){ this.append('V',x ,y);   return this;},
            curveTo           :  function(x,y){ },
            smoothCurveTo     :  function(x,y){ this.append('S',x ,y);   return this;},
            qBzCurve          :  function(x,y,i ){
                this.setAt(i==null?-1:i,'Q',x ,y );
                return this;},
            smoothQBzCurveTo  :  function(x,y){ this.append('T',x ,y);   return this;},
            arcTo             :  function(arcPointSet){ //rx,ry xAxisRotate LargeArcFlag,SweepFlag x,y
                var st=konstruct_argarr(ArcPointSet,arguments)
                this.append(st);   return this;
            },
            closePath         :  function(x,y){ this.append('Z',x ,y);   return this;},
            reset:function(){}
        } );
        Shape.ANCHOROFFSET={x:10,y:10}
        Shape.__idcounter=0;
        //image  <image xlink:href="/files/2917/fxlogo.png" x="0" y="0" height="100" width="100" />
        var Text=createklass(Shape,{type:"text", tag:"text",content:null,

            render:function(){
                //<text x="250" y="150"font-family="Verdana"font-size="55">Hello, out there</text>
                var box=this.bbox.rel(),attr=this.bbox.asAttrSet("x y");
                if(!this.svg){
                    this.svg=util.createEl(this.tag )
                }
                return this.attr(attr)
            }
        });
    var Connector=createklass(Shape,{  type:"path", tag:"path",refs:null,type:null,
        initShape:function(s1,s2,type){
            this.refs=[]
            if(s1 && s1 instanceof Shape){
                this.refs.push(s1)
            }
            if(s2 && s2 instanceof Shape){
                this.refs.push(s2)
            }
            this.type=type||"join"
        },
        angleAt:function(){},
        joinPos:function(){ },
        getPathString:function(arr){

        }
    });
        var Path=createklass(Shape,{  _pts:null,type:"path", tag:"path",multiPoint:true,markerph:null,

            afterDraw:function(act){return
                if(act=="move"){return}
                var node = this.svg,points = [],pts=[];
                if(!(this.isworker|| this.__dragging)){
                    var ln=node.getTotalLength();
                    for (var i =0; i <ln ; i+=2 ) {
                        points.push(Point.create(node.getPointAtLength(i)));
                    }
                    var st=new PointSet(points),pts=[],last=-1
                    this._groupByAngle(st,7,function(ang,lst,i){
                        if(i>ln-7||last>0&&(i-last)<7){return false}
                        if(ang>20){last=i;pts.push(lst[4])}
                    });
                    try{
                    _each(this.wrapel.querySelectorAll(".anglemarker"),util.removeEl);
                    //this._pts=pts;
                      if(pts&&pts.length){
                            this.wrapel.ownerSVGElement.suspendRedraw()
                            var ps=new PointSet(),c=util.createEl("circle",{r:3,style:{opacity:.6},fill:"blue",klass:["anglemarker"]}),lst=[],gp=this.wrapel;
                            pts.forEach(function(it){ps.add(it)});
                            ps.forEach(function(it,i){
                              var nd=gp.appendChild(c.cloneNode(true))
                              var attr={}
                              it.applyCss(nd);
                              if(it._angle<120){attr.color="red"}
                              else if(it._angle<90){attr.color="yellow"}
                              nd.dataset&&(nd.dataset.ang=it._angle);
                              if(attr.color){
                                    nd.setAttributeNS(null,"fill",attr.color);
                                  //nd.onmouseover=function(){console.log(this.dataset.ang)}
                              }
                          })
                      }

                }catch(e1){}
                 finally{this.wrapel.ownerSVGElement.unsuspendRedraw()}
                }

            } ,
    _addPoint : function (point) {
        this.curvePoints||(this.curvePoints=[]);
        var points = this.curvePoints,
            c2, c3,
            curve, tmp;

        points.push(point);

        if (points.length > 2) {
            // To reduce the initial lag make it work with 3 points
            // by copying the first point to the beginning.
            if (points.length === 3) points.unshift(points[0]);

            tmp = this._calculateCurveControlPoints(points[0], points[1], points[2]);
            c2 = tmp.c2;
            tmp = this._calculateCurveControlPoints(points[1], points[2], points[3]);
            c3 = tmp.c1;
            curve = new Bezier(points[1], c2, c3, points[2]);
            this._addCurve(curve);

            // Remove the first element from the list,
            // so that we always have no more than 4 points in points array.
            points.shift();
        }
    },

    _calculateCurveControlPoints : function (s1, s2, s3) {
        var dx1 = s1.x - s2.x, dy1 = s1.y - s2.y,
            dx2 = s2.x - s3.x, dy2 = s2.y - s3.y,

            m1 = {x: (s1.x + s2.x) / 2.0, y: (s1.y + s2.y) / 2.0},
            m2 = {x: (s2.x + s3.x) / 2.0, y: (s2.y + s3.y) / 2.0},

            l1 = Math.sqrt(dx1*dx1 + dy1*dy1),
            l2 = Math.sqrt(dx2*dx2 + dy2*dy2),

            dxm = (m1.x - m2.x),
            dym = (m1.y - m2.y),

            k = l2 / (l1 + l2),
            cm = {x: m2.x + dxm*k, y: m2.y + dym*k},

            tx = s2.x - cm.x,
            ty = s2.y - cm.y;

        return {
            c1: new Point(m1.x + tx, m1.y + ty),
            c2: new Point(m2.x + tx, m2.y + ty)
        };
    },

    _addCurve : function (curve) {
        var startPoint = curve.startPoint,
            endPoint = curve.endPoint,
            velocity, newWidth;

        velocity = endPoint.velocityFrom(startPoint);
        this.velocityFilterWeight||(this.velocityFilterWeight=.7);
        velocity = this.velocityFilterWeight * velocity
            + (1 - this.velocityFilterWeight) * this._lastVelocity;

        newWidth = this._strokeWidth(velocity);
        this._drawCurve(curve, this._lastWidth, newWidth);

        this._lastVelocity = velocity;
        this._lastWidth = newWidth;
    },



    _drawCurve : function (curve, startWidth, endWidth) {
        var ctx = this._ctx,
            widthDelta = endWidth - startWidth,
            drawSteps, width, i, t, tt, ttt, u, uu, uuu, x, y;

        drawSteps = Math.floor(curve.length());
        ctx.beginPath();
        for (i = 0; i < drawSteps; i++) {
            // Calculate the Bezier (x, y) coordinate for this step.
            t = i / drawSteps;
            tt = t * t;
            ttt = tt * t;
            u = 1 - t;
            uu = u * u;
            uuu = uu * u;

            x = uuu * curve.startPoint.x;
            x += 3 * uu * t * curve.control1.x;
            x += 3 * u * tt * curve.control2.x;
            x += ttt * curve.endPoint.x;

            y = uuu * curve.startPoint.y;
            y += 3 * uu * t * curve.control1.y;
            y += 3 * u * tt * curve.control2.y;
            y += ttt * curve.endPoint.y;

            width = startWidth + ttt * widthDelta;
            this._drawPoint(x, y, width);
        }
        ctx.closePath();
        ctx.fill();
    },
            _drawPoint : function (x, y, size) {
                this.array.push(new Point(x,y))
                /*
                var ctx = this._ctx;
                ctx.moveTo(x, y);
                ctx.arc(x, y, size, 0, 2 * Math.PI, false);
                this._isEmpty = false;
                */
            },
            getPathString:function(arr,noopt){
                    arr=arr||this.array
                if(!arr){return ""}
                var str;
                noopt=true
                if(this.isworker||(noopt===true||this.__dragging)){
                    str=this.array.map(function(it,i){ if(i&&it.relative.m=="M"){it.relative.m=""}
                        return it.relative
                    }).join(" ")
                     str=str.replace(/\s*,\s*/g," ").replace(/\s+/g," ").trim();
                }else{str=this._processPoints(arr)

                }
                if(!str){return null}
                str=str.trim()
                if(str.indexOf("M")!=0){str="M"+str}
                return str;
            },
            _groupByAngle:function(pset,gpcnt,fn){
                var m=Math.floor(gpcnt/2),u=gpcnt-1 ,ignoretill=0,res=[]

                return pset.groupsOf(gpcnt,true,1,function(gp,i){
                   if(!(gp[m]&&gp[u])){return gp[0]}
                    var ang,  a=gp[u].distanceFrom(gp[0]),   b=gp[m].distanceFrom(gp[0]),c=gp[u].distanceFrom(gp[m])
                    var temp = (a * a + b * b - c * c) / (2 * a * b);
                    if (temp >= -1 && temp <= 1){ang=util.round(util.toDegrees(Math.acos(temp)),1);}
                    var r=fn(ang,gp,i,a);
                    if(r===false){return null}
                    r=r||gp[0]
                    res.push(r)
                    return  r;
                });

                return res;
             },

            _processPoints:function(arr){

                 var gps=[],nu=arr,ignoretill=-1;
              //  if(!this.isworker){

                    var curvest=0;
                var pts=[]
                   /* gps=this.array.groupsOf(2,false,function(g,i){var p=g[0].clone();
                        if(g.length==1){return g[0]}
                        p.plus((g[1].x-g[0].x)/2,(g[1].y-g[0].y)/2)
                        return p;
                    });
                    //this.array.clear().add(gps)
                 */
                var _saved,offset=0 ,nosave
                //if(this.isworker){
                    if(this.array&&this.array.length>15){
                        _saved=this.data("_saved")
                        if(_saved&&_saved.string){
                            offset=_saved.offset
                        }else{_saved=null}
                    }
               // }
                _saved=_saved||{offset:0,string:"",array:[]}

                if(!this.isworker&&this.array&&this.array.length-_saved.offset <5){
                    _saved.array=_saved.array||[]
                    _saved.offset=_saved.array.length
                    _saved.string =_saved.array.filter(function(it){return it}).join(" ").trim()
                    //_saved.offset=_saved.offset+5
                 }
                //this.setRelativePos(this.array,this.bbox)
                var _self=this,st=_saved.offset>0?this.array.subSet(_saved.offset  ):this.array
                if(!this.worker&&st.length<2){st=this.array;nosave=1}
                if(st.length<gpcnt){gps=st}
                else{
                     var largegpcnt=13,m=7,u=12,gps=this._groupByAngle(st,13,function(ang,g){
                        if(g && g[0]._ignore){return false}
                        var gp=g.map(function(it){return it.relative||it})
                        if(ang>30){//interpolate
                            var nu=gp[m];
                            nu._curve=[ "S",  gp[m].x,  gp[m].y, gp[u].x, gp[u].y,"L"+ gp[u].x, gp[u].y].join(" ");
                              return nu;
                            g.forEach(function(it,i){if(i!=m){it._ignore=true}})
                          return nu;
                        }
                    })
                 }
                var gpcnt=7
                this.setRelativePos(st,this.bbox)
                gps= this._groupByAngle(st.findAll(function(it){return !it._ignore}),gpcnt,
                    function(ang,g,i,a){
                        if(g[0]&&g[0]._curve){return g[0]._curve}
                        var gp=g.map(function(it){return it.relative}),m=Math.floor(gpcnt/2),u=gpcnt-1
                        if(ignoretill &&i<=ignoretill){return false}
                        ignoretill=i
                        if(i<2 || gp.length<gpcnt || (gp[0].x==gp[u].x && gp[0].x==gp[m].x) || (gp[0].y==gp[u].y&&gp[u].y==gp[m].y)){
                            return gp[0].x+" "+gp[0].y
                        }
                        var curve
                        if(gp.length==gpcnt&&gp[m]){
                            if(Math.abs(ang)>1){
                                if(ang<10&&a&&a<10   ) {
                                    ignoretill=i+u; return gp[m]
                                } else{
                                    gp[m]._angle=ang,gp[m]._w=a
                                    curve=[ "S",  gp[m].x,  gp[m].y, gp[u].x, gp[u].y,"L"+ gp[u].x, gp[u].y].join(" ");
                                    ignoretill=i+u
                                    return curve
                                }
                            }
                        }
                        return gp[0].x+" "+gp[0].y
                    }
                )
                /*gps= st.findAll(function(it){return !it._ignore}).groupsOf(gpcnt,true,1,function(g,i){
                    if(g[0]&&g[0]._curve){return g[0]._curve}
                        var gp=g.map(function(it){return it.relative}),m=Math.floor(gpcnt/2),u=gpcnt-1

                        if(ignoretill &&i<=ignoretill){return ""}
                        ignoretill=i
                        if(i<2 || gp.length<gpcnt || (gp[0].x==gp[u].x && gp[0].x==gp[m].x) || (gp[0].y==gp[u].y&&gp[u].y==gp[m].y)){
                            return gp[0].x+" "+gp[0].y
                        }
                        var curve
                        if(gp.length==gpcnt&&gp[m]){
                            var ang,
                                a=gp[u].distanceFrom(gp[0]),   b=gp[m].distanceFrom(gp[0]),c=gp[u].distanceFrom(gp[m])
                            var temp = (a * a + b * b - c * c) / (2 * a * b);
                            if (temp >= -1 && temp <= 1){ang=util.round(util.toDegrees(Math.acos(temp)),1);}
                            //gp._angle=ang||0
                            if(Math.abs(ang)>1){
                                if(ang<10&&a<10   ) {
                                    ignoretill=i+u; return gp[m]
                                } else{
                                    gp[m]._angle=ang,gp[m]._w=a
                                    curve=[ "S",  gp[m].x,  gp[m].y, gp[u].x, gp[u].y,"L"+ gp[u].x, gp[u].y].join(" ");
                                    ignoretill=i+u
                                    return curve
                                }
                            }
                        }
                        return gp[0].x+" "+gp[0].y
                })*/

                _saved.array=gps.slice(0,Math.max(0,gps.length-10))
                gps=gps.filter(function(it){return it&&!it._ignore});
                //if(gps.length!=st.length){alert(8)}
                this._pts||(this._pts=[]);
                //this._pts.length=0;

                [].push.apply(this._pts,pts);
                //gps.unshift(arr[0].relative.toString())
                //arr.push(arr[arr.length-1].relative.toString())
            //    } else{
             //       gps=arr.map(function(it){return it.relative.toString()})
              //  }

                var d=gps.map(function(it){return typeof(it)=="string"?it:it.relative}).join(" ");

                var str=d.replace(/\s*,\s*/g," ").replace(/\s+/g," ").trim();
                if(str.indexOf("M")==0){str=str.substr(1).trim()}
                if(!nosave&&_saved.string){
                    str=_saved.string.trim()+" "+str
                }
                str=str.trim();
               //if(this.isworker){
                if(!nosave){
                    _saved.string=str;_saved.offset=this.array.length;
                     _saved.pts=pts.slice()
                    this.data("_saved",_saved);
                }
                //}
                return  str.length>3?str:null

                /*var nu=arr.reduce(function(m,it,i,a){
                    var rl=it?it.relative:null,p=it.p?it.p(): 0,skip=0
                    if(!rl){return m}
                    if(rl && i>1){
                        var pr=m._prior||[a[i-1].relative.x,a[i-1].relative.y],
                            avg=[(rl.x-pr[0])/2 + pr[0],(rl.y-pr[1])/2 + pr[1]]
                            //if(pr[2]&&p-pr[2]>15){
                            //C 20 20, 40 20, 50 10
                            var curve=[ "Q",avg[0], avg[1], ",", rl.x,rl.y].join(" ");
                            //var curve=[ "A",avg[0], avg[1], "0 0 1", rl.x,rl.y].join(" ");
                            //A 20 30 0 0 1 120
                            m.push(curve)
                        //} else{skip=1}
                    } else{m.push(rl.toString())};
                    //m.push(it.relative)
                    if(!skip){
                        if(m._prior){m._prior[0]=rl.x;m._prior[1]=rl.y;m._prior[2]=p}
                        else{m._prior=[rl.x,rl.y,p]}
                    }
                    return m
                },[])*/

            },
            getPoints:function(formarkers){
                if(formarkers){
                    if(!(this.array&&this.array[0])){return []}
                   // this.array&&this.array[0].setPos("anchor")
                   // this.array.length&&this.array.last().setPos("term","")
                    return this.array.length?[this.array[0],this.array.last()]:[]
                }
                var arr=[],ignoretill=0
                if(this.array.length<2){
                    this.array.add(this.bbox.p1,this.bbox.p2)
                }
                this.array.forEach(function(it,i){arr.push(it.setPos("join"+i,""))})

              //  gps.sort(function(a,b){return a._angle- b._angle}).reverse()
                 if(this.isworker){
                  //  if(!(this.markerph &&this.markerph.length)){
                  //      this.markerph=[this.bbox.p1.clone(),this.bbox.p2.clone()]
                  //  }
                  //  this.markerph[0].to(this.bbox.p1)
                  //  this.markerph[1].to(this.bbox.p2)
                   // arr.unshift(this.markerph[0].setPos("anchor","M"))
                  //  arr.push(this.markerph[1].setPos("term",""))
                }
               if(arr[0]){ arr[0].setPos("anchor","M")}
                if(arr.length>1){ arr[arr.length-1].setPos("term","")}
                //this.setRelativePos(arr)
                return  arr
            }
        });

        var Arc=createklass(Shape,{type:"arc", tag:"arc",
            controlPoint:{get:function(){return this.cntrlpt||this._definedcntrlpt}, set:function(v){this._definedcntrlpt=Point.create(v )} },
            initShape:function(){

            },

             getPoints:function(formarker){
                if(formarker){ return  this.array  }
                var erkr=this.isworker,arr = this.array,  arr=this.array,ln=arr.size(true)
                if(this.isworker||arr.length<3||!arr[1]){
                    var pts=[this.bbox.p1.clone().setPos("anchor","M"),this.bbox.p1.clone().setPos("center","Q"),
                            this.bbox.p2.clone().setPos("term","")
                    ]

                    var dist=pts[0].distanceFrom(pts[2]),bz=this._definedcntrlpt||util.bezierControlPt([pts[0],pts[2]]);
                    var hyp=util.hypot(pts[0],pts[2]),X=Math.abs(pts[0].x-pts[2].x),Y=Math.abs(pts[0].y-pts[2].y)
                    if(X+Y>50){
                        if(X<=10){bz.y=Y/2;bz.x=Math.max(10,Math.sqrt(Math.pow(Y,2)/4));}
                        else if(Y<10){bz.x=X/2;bz.y=Math.max(10,Math.sqrt(Math.pow(X,2)/4));}
                    }
                    pts[1].plus( bz)
                    pts.forEach(function(it,i){
                        arr[i]||(arr[i]=it);
                        erkr && arr[i].to(it);
                        arr[i].setPos(it.pos,it.m)
                    });
                }
                this.cntrlpt=arr[1];
                return  arr
            },

            afterBuild:function(patharr){
                var pts=[patharr[0],patharr[2]]
                var deg=util.degreeBet2Pts(pts[0].x,pts[0].y,pts[1].x,pts[1].y)
                var hyp=Math.sqrt(Math.pow(pts[0].distanceFrom(pts[1]),2)/2)
                if(!this.textNodes || !(this.textNodes.length&&this.textNodes[0]&&this.textNodes[0].parentNode)){
                    this.text("Control Point "+deg+"  "+pts[0].distanceFrom(pts[1])+" "+util.round(hyp),this.cntrlpt.x+10,this.cntrlpt.y+5,{style:{"font-size":".7em"}})
                }

                var a=patharr[0].relative,t=patharr[2].relative,c=patharr[1].relative
                var dl=["M",a.x+5,",",a.y ," ","L",c.x ,",",c.y ," L",t.x+5,",",t.y ,""].join("")
                if(!this._dottedlines){
                    this._dottedlines= this._kanvas.makeEl("path",{d:dl,
                        "stroke-dasharray":"5,5",fill:"none",stroke:"gray"})
                    this._dottedlines.appendTo(this.wrapel)
                }
                this._dottedlines.setAttributeNS(null,"d",dl)
                this.textNodes[0].setAttributeNS(null,"x",c.x+10)
                this.textNodes[0].setAttributeNS(null,"y",c.y+5)
                return  this

            } ,
            render1:function(arr){
                var box=this.bbox.rel(),attr={points:this.getPoints().map(function(p){return p.relative.x+","+ p.relative.y}).join(" ")}
                if(!this.svg){
                    this.svg=util.createEl(this.tag )
                }
                return this.attr(attr)
                //<polygon points="200,10 250,190 160,210"/>
                // <polyline  points="20,100 40,60 70,80 100,20"/>
            }
        });
        var Polygon=createklass(Shape,  {type:"polygon", tag:"polygon",multiPoint:true,closeOnTerm:true,
              getPoints:function(formarkers){
                var arr=this.array||[]
               this.setRelativePos(arr,this.bbox)
                arr.forEach(function(it,i){
                     it.setPos("join"+i,i?"L":"M");
                } ,this);

                return arr;

            },
             render:function(arr){
                 if(this.svg&&this.svg.parentNode){
                     /*   var bb=this.svg.parentNode.getBBox();
                     this.bbox.p1.x=bb.x;
                     this.bbox.p1.y=bb.y
                     this.bbox.p2.x=bb.x+bb.width;
                     this.bbox.p2.y=bb.y+bb.height;

                     var p=this.array||[],mm=[].slice.call(this.svg.parentNode.querySelectorAll(".marker"));
                      if(mm.length== p.length){
                         mm.forEach(function(it,i){
                            p[i].x=Number(it.getAttribute("cx"))
                            p[i].y=Number(it.getAttribute("cy"))
                        })
                     }      */
                 }

                var pp=this.getPoints().map(function(p){return p.relative.x+","+ p.relative.y}).join(" ")
                var attr={points:pp}
                if(!this.svg){
                    this.svg=util.createEl(this.tag )
                }
                return this.attr(attr)
                //<polygon points="200,10 250,190 160,210"/>
                // <polyline  points="20,100 40,60 70,80 100,20"/>
            }
        });
        var Polyline=createklass(Polygon,  {type:"polyline", tag:"polyline",closeOnTerm:false})
        var Line=createklass(Shape,  {type:"line", tag:"line",constrain:null,
        initShape:function(p1,p2){
            if(p2&&typeof(p2)=="object") {this.bbox.p1.to(p1);this.bbox.p2.to(p2)}
            else{this.bbox.p1.to.apply(this.bbox.p1,arguments);}
        },
        x2:{get:function(){return this.bbox.x2}, set:function(v){this.bbox.x2=v} },
        y2:{get:function(){return this.bbox.y2}, set:function(v){this.bbox.y2=v} },
            intersect:function(pt,slope){
                return Point.create( pt.x - (pt.y * slope),pt.y - (pt.x * slope));
            },
            slope:function(perpend){
                var sl=(this.bbox.y2-this.bbox.y1) / (this.bbox.x2 - this.bbox.x1);
                return perpend?(-1 / sl):sl

            } ,
            afterDraw:function(formarkers){
                //console.log(this.bbox.dims)
                var ang=this.bbox.p1.angleTo(this.bbox.p2)

                 //console.log(ang)
            },
        getPoints:function(formarkers){
            var arr = this.array;
             arr[0]||(arr[0]=Point.create())  ;
            arr[1]||(arr[1]=Point.create());

             //if(this.isworker){
          arr[0].to(this.bbox.p1).setPos("anchor","M")
            arr[1].to(this.bbox.p2).setPos("term","L")
            //}
            if(this.constrain=="V"){arr[1].x=this.bbox.p2.x=this.bbox.p1.x=arr[0].x}
            else if(this.constrain=="H"){arr[1].y=this.bbox.p1.y=this.bbox.p2.y=arr[0].y}

            return arr
        }

    });
    var HLine=createklass(Line,  {type:"hline", tag:"line",constrain:"H"});
    var VLine=createklass(Line,  {type:"vline", tag:"line",constrain:"V"});
    var BbShape=createklass(Shape,{  type:"bbShape", tag:"bbShape",closeOnTerm:true,attrSet:null,
        initShape:function(x,y,h,w){
            this.initBb(x,y,h,w)
        },
       // resetBBox:function(){return this},
        initBb:function(x,y,h,w){
            if(isNumber(x)){this.bbox.x=x}
            if(isNumber(y)){this.bbox.y=y}
            if(isNumber(h)){this.height=h}
            if(isNumber(w)){this.width=w}
        },
        height:{get:function(){return this.bbox.height}, set:function(v){this.bbox.height=v} },
        width:{get:function(){return this.bbox.width}, set:function(v){this.bbox.width=v} },
        adjustbounds:function(pos,x,y,box){
            var dst
            switch(pos){
                case "top"   :;case "topleft"      :box.p1.to(x,y);dst=box.y2- y;break;
                case "right" :;case "topright"     :box.x2=x;box.y=y;dst=x-box.x ;break;
                case "bottom":;case "bottomright"  :box.p2.to(x,y);dst=y - box.y1;break;
                case "left"  :;case "bottomleft"   :box.x=x;box.y2=y;dst=box.x2-x;break;
            }
            return dst
        },
        updatePoints:function(marker){
            if(!(marker&&marker.point)){return}
            var p=Point.create(marker.point),box=this.bbox,dims=box.dims,pos,x=p.x ,y=p.y,dst
            pos=String(marker.point.pos);
             var dummy=new Bbox()
            dummy.p1.to(box.p1);dummy.p2.to(box.p2)
             this.adjustbounds(pos,p.x, p.y,dummy)
            if(dummy.x2<dummy.x1){
                pos=pos.replace(/left|right/g,function(a){return a=="left"?"right":"left"})
            }
            if(dummy.y2<dummy.y1){
                pos=pos.replace(/top|bottom/g,function(a){return a=="top"?"bottom":"top"})
            }

            this.applyOffset(p,pos,dummy,true);
             var dst=this.adjustbounds(pos, p.x, p.y,box)
            this.bbox._squaredim=dst

            //marker.point.pos=pos
            //this.syncPoints()


        },
        within:function(p){
            return this.bbox.within(p);
        },
        syncPoints:function(data){if(data){return}
             var d,i=0,box=this.bbox ,
                arr=[],rel,squaredim=box._squaredim ,lpos=["topleft","topright","bottomright","bottomleft"];

            arr=this.array
            if(box.isSquare ){
                if(this.isworker||!squaredim){
                    var cc=box.c
                    if(cc.p()-box.p1.p())
                        box._squaredim=(cc.p()-box.p1.p())*2
                    squaredim=box._squaredim
                }
                box.x2=box.x + squaredim   //- Shape.ANCHOROFFSET.x
                box.y2=box.y + squaredim   //- Shape.ANCHOROFFSET.x
            }

            var bounds=box.getPoints()
            arr.ensure(4,true).enter(bounds).to().enter(lpos).setPos()
            for(var i=0;i<4;i++) {
                this.applyOffset(this.array[i],lpos[i])
            }
        },
        getPoints:function(formarkers){
            var lpos=["topleft","topright","bottomright","bottomleft"];
            this.syncPoints()

            /*while(i<4){arr[i]||(arr[i]=Point.create());
                arr[i].to(bounds[i]).setPos(lpos[i],i)
                this.applyOffset(arr[i],lpos[i])
                i++
            } */
            return  this.array
        } ,
        applyOffset:function(pt,pos,revrse){return pt},
        render :function(arr){
        //    this.applyOffset(arr[i],lpos[i])
            var  dims=this.bbox.rel().dims,attr=this.bbox.rel().asAttrSet(this.attrSet)
            if(!this.svg){
                this.svg=util.createEl(this.tag)
            }
            this.attr(attr)
            //console.log(attr,box.x2,box.y2)
            //<rect x="10" y="10" width="100" height="100" rx="15" ry="15"/>
        }

    });
        var Rect=createklass(BbShape,{  type:"rect", tag:"rect",attrSet:"x y height width"  });

        var Square=createklass(Rect,{type:"square", tag:"rect",initShape:function(){ this.bbox.asSquare() }});
        var Ellipse=createklass(BbShape,{type:"ellipse", tag:"ellipse",attrSet:"cx cy rx ry",
            r:{get:function(){return this.bbox.r}, set:function(v){this.bbox.r=v} },
            c:{get:function(){return this.bbox.c}, set:function(v){this.bbox.c=v} },
            initShape:function(){ return this.initEllipse.apply(this,arguments)},
            initEllipse:function(){
                var c,r
                if(arguments[0]!=null){
                    if(arguments[0].x!=null){
                        c=Point.create(arguments[0])
                        r=arguments[1]
                    } else if(typeof(arguments[0])=="number"){
                        c=Point.create(arguments[0],arguments[1])
                        r=arguments[2]
                    }
                }
                if(r&&r.x==null&&typeof(r)=="number"){r={x:r,y:r}}
                if(c&&r&&r.x){
                    this.bbox.p1.to(c.x- r.x, c.y- r.y)
                    this.bbox.p2.to(c.x+ r.x, c.y+ r.y)

                }

                return this
            },
             within:function(p0){
                var h, k,c=this.bbox.c,p=Point.create(p0.x-this.bbox.x ,p0.y-this.bbox.y ),rel=this.bbox.rel() ,r=rel.c
                h=rel.width/2,k=rel.height /2
                var res= (Math.pow(p.x-h,2)/Math.pow(r.x,2))+ (Math.pow(p.y-k,2)/Math.pow(r.y,2))
                 return res<= 1
            } ,
            applyOffset:function(pt,pos,box0,revrse){
                var box=box0||this.bbox,b=box.dims,rx=b.width / 2,ry=b.height/2
                pos=pos||pt.pos
                 switch(pos){
                    case "left"  :;case "topleft"      :pt.x=pt.x + ((revrse?-1:1)*rx );break;
                    case "right" :;case "topright"     :pt.y=pt.y + ((revrse?-1:1)*ry );break;
                    case "bottom":;case "bottomright"  :pt.x=pt.x - ((revrse?-1:1)*rx );break;
                    case "left"  :;case "bottomleft"   :pt.y=pt.y - ((revrse?-1:1)*ry );break;
                }
                return pt
             }

        });
    var Circle=createklass(Ellipse,{ type:"circle", tag:"circle",attrSet:"cx cy r",radius:{
            get:function(){return this.bbox._squaredim||(this.bbox._squaredim=this.bbox.r.x)},
            set:function(v){this.bbox._squaredim=this.bbox.r=v}
        },
        initShape:function(){
            this.bbox.asSquare();this.radius=0;
            this.initEllipse.apply(this,arguments)

        },
        pointAtAngle:function(ang){util.pointOnCircle(ang,this.radius,this.cx,this.cy)}
        //a/sin A = b/sin B = c/sin C //Opposite / Hypotenuse
        //The Sine of angle θ is:he length of the side Opposite angle θ divided by the length of the Hypotenuse
        //tan(θ) = Opposite / Adjacent
     })
        var Triangle=createklass(Shape,{ type:"triangle", tag:"path",  ptdata:null,lines:null,
            initShape:function(p1,p2,p3){
                this.lines=[]

             this.ptdata={
                    a:Point.create(p1),b:Point.create(p2), c:Point.create(p3),//points
                    xa:0  ,ba:0  ,ca:0, //angles
                }
                this.ptdata.a._recalc=this.ptdata.b._recalc=true
                //this.calc.apply(this,arguments)

            },

            getPoints:function(forma){
                if(forma){return this.array;}
                //if(this.array.length!=3){
                    this.calc()
                //}

                return this.array
            },

             render:function(arr){
                 //if(!(this.wrapel&&this.getOuterViewPortDims())){return}
                 if(!(this.array&&this.array[2])){ }
                 arr=arr||this.getPoints() ;
                 if(!this.svg){
                    this.svg=util.createEl(this.tag )
                 }
                 this.array[0].setPos("a","M")
                 this.array[1].setPos("c","L")
                 this.array[2].setPos("b","L")
                 var d=this.array.map(function(it){return it.relative}).join(" ")+"Z";
                 if(d.charAt(0)!="M"){d="M"+d}
               this.attr({d:d})
               this.textNodes||(this.textNodes=[]);
               if(this.wrapel&&this.textNodes.length<6){
                   this.textNodes.length=0;
                   while(this.textNodes.length<=6){this.text("");this.text("")}
               }
             _each(this.wrapel.querySelectorAll("line"),util.removeEl)
                  this.svg.style.opacity=.5
               return  this.svg
            },
            afterDraw:function(){  if(!this.isworker){ }
                return
                var _attr=this.attr.bind(this),_tap=function(el,k,v){
                     return el
                },data=this.ptdata,a=data.a,b=data.b,z=data.c,vp=this.getOuterViewPortDims(),posmap={anchor:"a",term:"b" }
                //var mid=this.getMiddlePoint()
                var markers=this.array.reduce(function(m,it){
                    if(!(it && it.marker&&it.marker.markersvg)){return m}
                    var bb={x:Number(_attr("cx",it.marker.markersvg)),y:Number(_attr("cy",it.marker.markersvg))}
                    m.top=      ( bb.y < m.top[1]    )?[it.pos,bb.y,bb.x ,it.marker.markersvg, 1 ]:  m.top
                    m.bottom=   ( bb.y > m.bottom[1] )?[it.pos, bb.y,bb.x ,it.marker.markersvg,1  ]:  m.bottom
                    m.left=     ( bb.x <  m.left[2]   )?[it.pos, bb.y,bb.x ,it.marker.markersvg, 2 ]: m.left
                    m.right=    ( bb.x > m.right[2]  )?[it.pos, bb.y,bb.x ,it.marker.markersvg, 2]:  m.right;

                    return m;
                },{top:[null,9999,9999,""],left:[null,9999,9999,""],right:[null,-9999,-9999,""],bottom:[null,-9999,-9999,""]});
                 _each(markers,function( m1, k){  var idx=m1[5],bb={x:m1[2],y:m1[1]},m=markers[k];
                    if(!(m && m[0])){return }
                     markers[k]   =   (m1[idx] < m[idx]    )?m1 :  m
                 });
                    var lns=[{st:this.ptdata.a,end:this.ptdata.c,ln:this.ptdata.c.distanceFrom(this.ptdata.a),ang:this.ptdata.a.angleTo(this.ptdata.c)-90 }
                            ,{st:this.ptdata.c,end:this.ptdata.b,ln:this.ptdata.b.distanceFrom(this.ptdata.c),ang:this.ptdata.c.angleTo(this.ptdata.b)-90 }
                            ,{st:this.ptdata.b,end:this.ptdata.a,ln:this.ptdata.a.distanceFrom(this.ptdata.b),ang:this.ptdata.b.angleTo(this.ptdata.a)-90 }
                        ]
                for(var ii=0;ii<6;ii++){
                    var i=Math.floor(ii/2),ln=lns[i],it=ln.st,rel=it.relative,pos1=this.array[i].pos,
                        angle,pos=posmap[pos1]||pos1 ,x=rel.x,y=rel.y,  anglen,n
                    angle=data[pos+"a"]||0;

                    var marker,markernode=this.wrapel?this.wrapel.querySelector(".marker-"+pos1):null
                    if(markernode&&(marker=markers[Object.keys(markers).find(function(it){return markers[it] &&markers[it][3]===markernode})||"-"])){
                        x=marker[2]||x;
                        y=marker[1]||y
                    }

                        //anglen=it.angleTo(nxt)-90
                        //anglep=it.angleTo(prev)-90
                       // var anf=util.solveTriangle(Math.abs(nxt.y-y),Math.abs(nxt.x-x),Math.abs(nxt.p()-it.p()),null,null,null)
                    // if()
                    anglen=ln.ang>120?ln.ang+180:ln.ang
                    var attr={"font-size":".8em",style:{},x:x,y:y,stroke:"gray"} ,rot=anglen-angle/2
                    if(markers.left[0]==pos1){   attr.style["text-align"]="right"; }
                    if(markers.right[0]==pos1){  attr.style["text-align"]="left";attr["text-anchor"]="right";  }
                    if(markers.top[0]==pos1){    attr.style["text-align"]="center"}
                    if(markers.bottom[0]==pos1){ attr.style["text-align"]="center" }
                                                                 attr.transform="rotate("+[  rot, x, y ].join(",") +")"
                    this.textNodes[ii].textContent=".   @"+util.round(angle,1)  //+"  "+util.round(ln.ang);

                    this.attr(attr,this.textNodes[ii])
                    var cc=util.round(data[pos+"ln"]||0),mp=this.array[i].relative.midPoint(this.array[i>=2?0:i+1].relative)
                    ii=ii+1
                     if(this.textNodes[ii]&&this.textNodes[ii].nodeType==1){
                        this.textNodes[ii].textContent=  ln.ln
                        var attr={x:mp.x,y:mp.y ,"text-anchor":"middle", stroke:"gray","font-size":".8em",style:{"zIndex":100} }
                         this.attr(attr,this.textNodes[ii])

                        if(anglen){this.attr("transform","rotate("+[  anglen, mp.x, mp.y ].join(",") +")",this.textNodes[ii])}
                    }
                }

            },
            getMiddlePoint:function(){
                var d=this.ptdata
                this.calc();
                return Point.create((d.a.x+d.b.x+d.c.x)/3,(d.a.y+d.b.y+d.c.y)/3)
            },
            calc:function(){
                var data=this.ptdata,a=[].slice.call(arguments)
                if(!this.ptdata.a && !this.ptdata.b){
                    if(this.bbox.x){this.ptdata.a.to(this.bbox.p1)}
                    if(this.bbox.p2!=0){this.ptdata.b.to(this.bbox.p2)}
                }
                if(a.length==1&&a[0] && typeof(a[0])=="object"&& !(a[0] instanceof Point)){
                    _each(a[0],function(v,k){if(k in data){data[k]=v}})
                } else if (a.length){
                    if(a[0]){
                        if(a[0].x!=null){data.a.to(a[0])}
                        else if(typeof(a[0])=="number"){data.aa=a[0]}
                    }
                    if(a[1]){
                        if(a[1].x!=null){data.b.to(a[1])}
                        else if(typeof(a[1])=="number"){data.ba=a[1]}
                    }
                    if(a[2]){
                        if(typeof(a[2])=="number"){data.c=a[2]}
                    }
                }
                var vp=this.setOuterViewPortDims();
                var p1=this.bbox.p1>this.bbox.p2?this.bbox.p2:this.bbox.p1,
                    p2=this.bbox.p2>this.bbox.p1?this.bbox.p2:this.bbox.p1
                this.array[0]||(this.array[0]=Point.create(this.bbox.p1));
                //this.bbox.p1.to(this.array[0]);
                this.array[2]||(this.array[2]=Point.create(this.bbox.p2));
               // this.bbox.p2.to(this.array[2]);
               //this.array[2].to(this.bbox.p2);
                if(this.isworker || !this.array[2].p()){this.array[2].to(this.bbox.p2)}

                if(this.isworker || !this.array[0].p()){this.array[0].to(this.bbox.p1)}
                this.array[1]||(this.array[1]=Point.create());
                if(this.isworker || !this.array[1].p()){this.array[1].to(p1.x,p2.y)}
                if(vp){
                var inverse1=Point.create(this.array[0].x,vp.height-this.array[0].y)
                var inverse2=Point.create(this.array[2].x,vp.height-this.array[2].y)
                var inverse3=Point.create(this.array[1].x,vp.height-this.array[1].y)
                var tri, C,p1,p2, a, b,c
                this.ptdata.a1=inverse1.distanceFrom(inverse3)
                    this.ptdata.b1=inverse2.distanceFrom(inverse3)
                    this.ptdata.c1=inverse2.distanceFrom(inverse1)
                if(this.ptdata.a1&&this.ptdata.b1&&this.ptdata.c1){
                    //if(c<=0){alert(8);return}
                    try{
                        var p=util.solveTriangle(
                            this.ptdata.a1,
                            this.ptdata.b1,
                            this.ptdata.c1
                            ,null,null,null)

                        if(p && p.aln){
                            "aa ba ca aln bln cln".split(/\s/).forEach(function(it){
                                if(p[it]){this.ptdata[it]=p[it]  }
                            },this)

                            this.ptdata.aa=p.ba
                            this.ptdata.ba=p.aa
                            this.ptdata.bln=p.aln
                            this.ptdata.aln=p.bln
                         }
                    } catch(e){
                        //console.log(this.ptdata)
                    }
                }
                }
                this.ptdata.a=this.array[0].clone()
                this.ptdata.c=this.array[1].clone()
                this.ptdata.b=this.array[2].clone();
                this.setRelativePos([this.ptdata.a,this.ptdata.b,this.ptdata.c],this.bbox)
                this._data={}
                "a b c aa ba ca aln bln cln".split(/\s/).forEach(function(it){
                    this._data[it]=this.ptdata[it]
                },this)
                 //this.setOuterViewPortDims()
                this.setRelativePos(this.array,this.bbox)
                 //angles
                if(!console.trottled1){console.trottled1=$.throttle(console.log.bind(console))}
                var fn=util.generatorFactry().getObjValue(this.ptdata);
                console.trottled1("a1 b1 c1 aa ba ca a b c".split(/\s/).map(fn).join(" , "))


            },
            za:{get:function(){return this.ptdata.za||(this.ptdata.za=90)},set:function(v){this.ptdata.za=v}},
            aa:{get:function(){return this.anchorAngle},set:function(v){this.anchorAngle=v}},
            anchorAngle:{get:function(){ return this.ptdata.aa
                var d=this.ptdata,a=this.a,b=this.b,z=this.z,
                    aln=a.distanceFrom(z),bln=b.distanceFrom(z),cln=a.distanceFrom(b)
                if(aln&&cln&&bln) {
                    this.ptdata.aa = util.toDegrees(Math.acos((aln + cln) - bln)/(2*aln&cln))
                } else if(d.ba &&d.ca){
                    d.aa=180-(d.ba &&d.ca)
                } else if(d.b&&d.b.p()){
                    d.aa=toDegrees(Math.asin(d.b.y))
                }
                return d.aa
                },set:function(v){
                    this.ptdata.aa=v
                this.ptdata.c._recalc=true;this.ptdata.b._recalc=true
                     this.ptdata.ba=null;
                }
            },
            a:{get:function(){ return this.bbox.p1

            },
                set:function(v){
                    if(v!=this.bbox.p1){
                        this.bbox.p1.to(v);
                        this.ptdata.c._recalc=true;this.ptdata.ba=this.ptdata.aa=null;
                    }

            }},
            area:{get:function(){
                //K=12|xA(yB−yC)+xB(yC−yA)+xC(yA−yB)|
            }},
            centroid:{get:function(){
               // (x,y)=(xA+xB+xC3,yA+yB+yC3)
            }},
            z:{get:function(){
                if(!this.ptdata.c){
                    //Math.sqrt(Math.pow(276,2)+Math.pow(458,2) - (2*276*458*Math.cos(toRadians(90))))
                    var a=this.a,b=this.b
                    if(a&&b){
                        this.ptdata.c=Point(a.y,b.x)
                    }
                }
                return this.ptdata.c
            },
                set:function(v){this.ptdata.c=v;
                    this.ptdata.c._recalc=true;this.ptdata.ba=this.ptdata.ba=null;
                }
            },
            b:{get:function(){var b=this.bbox.p2
                if(!b|| b==0 || b._recalc){
                    var a=this.ptdata.a,b=this.ptdata.b,z=this.ptdata.c,
                        aln=a.distanceFrom(z),bln=b.distanceFrom(z),cln=a.distanceFrom(b)
                        if(aln&&cln&&bln) {
                            this.ptdata.ba = util.toDegrees(Math.acos((aln + cln) - bln)/(2*aln&cln))
                        }
                    if(!b && this.ptdata.aa&&this.ptdata.c) {
                        var v=this.ptdata.aa
                        b.y=Math.cos(v)*this.ptdata.c
                        b.x=Math.sin(v)*this.ptdata.c
                        b._recalc=0
                    }
                    if(!b && this.ptdata.a&&this.ptdata.ca) {
                        var v=this.ptdata.ca
                        b.y=Math.tan(v)*this.ptdata.c
                        b.x=Math.sin(v)*this.ptdata.c
                        b._recalc=0
                    }
                    this.ptdata.b=b;
                    this.bbox.p1.to(b)
                }
                return b
            },set:function(v){
                if(v!=this.bbox.p2){
                    this.bbox.p2.to(v);
                   this.ptdata.c._recalc=true;this.ptdata.ba=this.ptdata.aa=null;
                }
            }
            },
            ba:{get:function(){return this.farAngle},set:function(v){this.farAngle=v}},
            farAngle:{get:function(){return this.ptdata.ba
                var d=this.ptdata,a=this.a,b=this.b,z=this.c,
                    aln=a.distanceFrom(z),bln=b.distanceFrom(z),cln=a.distanceFrom(b)
                if(aln&&cln&&bln) {
                    this.ptdata.ba = util.toDegrees(Math.acos((aln + cln) - bln)/(2*aln&cln))
                } else if(d.aa &&d.ca){
                    d.ba=180-(d.aa &&d.ca)
                } else if(d.b&&d.b.p()){
                    d.ba=toDegrees(Math.acos(d.b.x))
                }
                return d.ba
            },set:function(v){  this.ptdata.aa=v
                this.bbox.p2.to(v);   this.ptdata.b._recalc   =!0
                this.ptdata.c._recalc=true;this.ptdata.ba= null;
            }
        }
        });
         Triangle.Right=function(pt,anchor){
             anchor||(anchor=Point.create(0,0));
             var nu=new Triangle({a:anchor,b:pt,ca:90});
             return nu;
         }
        Triangle.Isosceles =function(){}
    var Lasso=createklass(Rect,{  type:"lasso", tag:"rect",attrSet:"x y height width",selected:null,
    initShape:function(){
        this.selected=[]
       this.attr({
           "stroke-width":1,
           "stroke":"blue"  ,
           "fill":"rgba(0,0,240,.3)"
        })
        this.prop("klass","lasso");
        this.prop("style",{"z-index":100});
    }
    });
    var Bezier = function (startPoint, control1, control2, endPoint) {
        this.startPoint = startPoint;
        this.control1 = control1;
        this.control2 = control2;
        this.endPoint = endPoint;
    };

    // Returns approximated length.
    Bezier.prototype.length = function () {
        var steps = 10,
            length = 0,
            i, t, cx, cy, px, py, xdiff, ydiff;

        for (i = 0; i <= steps; i++) {
            t = i / steps;
            cx = this._point(t, this.startPoint.x, this.control1.x, this.control2.x, this.endPoint.x);
            cy = this._point(t, this.startPoint.y, this.control1.y, this.control2.y, this.endPoint.y);
            if (i > 0) {
                xdiff = cx - px;
                ydiff = cy - py;
                length += Math.sqrt(xdiff * xdiff + ydiff * ydiff);
            }
            px = cx;
            py = cy;
        }
        return length;
    };

    Bezier.prototype._point = function (t, start, c1, c2, end) {
        return          start * (1.0 - t) * (1.0 - t)  * (1.0 - t)
            + 3.0 *  c1    * (1.0 - t) * (1.0 - t)  * t
            + 3.0 *  c2    * (1.0 - t) * t          * t
            +        end   * t         * t          * t;
    };
        var _kanvas=function(panel,config0){
            var _emitter,_base=null,_state={}  ,config=config0||{},_self;
            var svgNS = "http://www.w3.org/2000/svg",  _subs=[],
                divXY,divY,divX,_dragging=0 ,container=null, lyr=null,   msg =null,
                draglayer=null,  gridlayer=null,_wrkrlyr=null,_uilayer=null,  _uilayer0=null,
                pulselayer,ellayer=null,  grid ;
            config.designmode=1
            function _setupDrag(){
                var cntnr=_self.dom.parentNode,_paused=0;
                var markerdragger= util.setupDragger(cntnr,null,
                    function change(ev,memo){
                        var data=memo.qu.pop(),t=memo.track;if(!(t&&data)){return}
                        memo.p.to(t);
                          memo.target.setAttribute("cx", t.x) ; memo.target.setAttribute("cy", t.y)
                        if(memo.callback){memo.callback( {bbox:memo.box,data:data,point:memo.p} ); }

                    } ,
                    function start(ev,memo){
                        _self.setActiveEl(memo.el);
                        if(memo.el.wrapel){memo.el.wrapel.classList.add("mouse-drag")}
                        if(memo.p){
                            memo.track=memo.p.clone()
                         }

                        //memo.circlest.save()
                    } ,
                    function end(ev,memo){
                        memo.logentry&&_self&&_self.addLogEntry(memo.logentry)
                        memo.logentry=null;
                       if(memo.el.wrapel){memo.el.wrapel.classList.remove("mouse-drag")}

                         if(memo.callback){
                             memo.callback( {bbox:memo.box,data:memo.data,point:memo.p,end:true},true );
                        }
                        this.state.dragger=null
                    } ,
                    _self,false
                ) ;
                var mover= util.setupDragger(cntnr,null,
                     function change(ev,memo){
                         memo.el.onChange({type:"move",point:memo.track.clone()}) ;
                    },
                    function start(ev,memo){
 if(memo.el.wrapel){memo.el.wrapel.classList.add("mouse-drag")}
                        memo.el.resetBBox()
                        if(cntnr){cntnr.classList.add("noselection")}
                        var el=memo.el ;document.body.style.cursor="move"
                                    memo.track=memo.el.bbox.p1.clone()
                        if(!el || !el.svg||el._subs.length){return}
                        memo.logentry=this.createLogEntry(el,"move");
                    },
                    function end(ev,memo){
                       if(memo.el.wrapel){memo.el.wrapel.classList.remove("mouse-drag")}
                        memo.el.resetBBox()
                         memo.el.onChange({type:"move",point:memo.track.clone(),end:true}) ;
                        this.state.dragger=null;document.body.style.cursor="auto"
                         if(cntnr){cntnr.classList.remove("noselection")}
                    } ,_self,false
                ),
             _lasso=util.setupDragger (cntnr,null,
                    function _change(ev,memo){
                        if(this.state.dragger!==_lasso||!memo.el.isLasso){return}
                        var x=ev.data.x,y=ev.data.y
                        memo.el.moveTo(memo.track)
                        if(memo.el.selections&&memo.el.selections.length){
                            memo.el.selections.forEach(function(it){if(!it||it.__deleteted)  {return}
                                it.bbox.p1.restore("lasso");
                                it.moveTo(it.bbox.p1.x+x,it.bbox.p1.y+y)})
                        }
                     },function _start(ev,memo){
                        memo.track=memo.el.bbox.p1.clone();
                     },function(ev,memo){
                       this.state.dragger=null
                 },_self,false
                     );

                _self.dragHandles={mover:mover,lasso:_lasso,marker:markerdragger}

                var start=function(ev,memo){
                     var dolasso=0,elatpt
                     if(_paused||this.state.dragger){return}
                     //this.dom.style.display="none"
                       try{
                           elatpt=document.elementFromPoint(Math.round(ev.x),Math.round(ev.y))||ev.target

                       } catch(e){}
                        this.dom.style.display=""
                     if(elatpt && elatpt.classList.contains("lasso")){
                         dolasso=1
                     }
                     if(this.state.ctor){
                         dolasso=0 ;this.unsetActiveEl();
                      } else {
                         if(ev.target.classList.contains("marker") || ev.target.classList.contains("kanvas-el")){
                             //unsetActiveEl
                             if(ev.target.classList.contains("marker")){
                                 this.state.lasso=null;
                                 memo.stop=true;
                                 var marker,target=ev.target,el=_self.find(target.getAttributeNS(null,"ref"))
                                 if((el&&el._markers)){
                                     marker=el._markers.find(function(it){return it.markersvg==target})
                                     var m={ target:target,logentry:_self.createLogEntry(el,"attribute") ,
                                         p:marker.point.clone(),   el:el ,callback:marker.onDrag.bind(marker)
                                     };                 //target:memo.target ,
                                 }
                                 this.setActiveEl(el)
                                 this.state.dragger=markerdragger

                                // el.bbox.reset(true)
                                // el.build()

                                  setTimeout(markerdragger.activate.bind(markerdragger,ev,m),10);

                             } else {

                                 if(ev.target.classList.contains("kanvas-el")) {
                                     var marker,target=ev.target,el=_self.find(target)
                                     memo.stop=true;
                                     if(el&&!this.isActiveEl(el)){
                                         this.setActiveEl(el);
                                     };_paused=1
                                     util.holdMouse(50,function(a){var p=_paused;_paused=0
                                         if((a!==false&&p===1)){

                                             mover.activate(a.event,{el: a.el})
                                         }  },{event:ev,el:el})

                                 }
                             }
                             memo.stop=true;
                         } else {
                             this.unsetActiveEl();
                             if(dolasso &&this.state.lasso){
                                 memo.stop=true;
                                 this.state.lasso._kanvas=this
                                 if(this.state.dragger!=_lasso){
                                     //if(!this.state.lasso ){}
                                     //this.state.lasso.unselectElements()
                                     _lasso.activate(ev,{el:this.state.lasso })
                                 }
                                 this.state.dragger =_lasso;
                             }
                         }
                     }

                    if(this.state.dragger !=_lasso&&this.state.lasso){
                        _wrkrlyr.style.display="none"
                        this.state.lasso.unselectElements()
                    }
                    if(memo.stop){return}
                        _each(_wrkrlyr.querySelectorAll(".subgp"),util.removeEl);
                     _wrkrlyr.style.display=""
                     var ctor=this.state.ctor, wrkr;
                         this.state.lasso=false;
                     if(ctor){  wrkr=new ctor(_wrkrlyr);wrkr.isLasso=false;}
                     else {wrkr=new Lasso(_wrkrlyr)
                         this.state.lasso=wrkr   ;wrkr.isLasso=true;
                         wrkr._kanvas=this
                         wrkr.unselectElements=function(clr){if(!this.isLasso){return}
                             var curr=[]
                             if(this.selections){
                                 curr=(this.selections||[]).slice()
                                 this.selections.length=0
                             }
                             if(curr.length){
                                 curr.forEach(function(it){it._dispatch("unlassoed") })
                                 this._kanvas.fire("elementsunlassoed",curr)
                             }
                         }
                         wrkr.selectElements=function(){      if(!this.isLasso){return}
                             this.selections||(this.selections=[]);
                             var lst=this._kanvas.findInsections(this.bbox),
                                 curr=this.selections.slice().filter(function(it){return it&&!it.__deleted});
                             //this.unselectElements(true);
                             this.selections.length=0;
                              lst.forEach(function(it){  if(!(it &&!it.__deleted)){return}
                                  var idx=curr.indexOf(it);
                                 if(idx==-1){
                                    it.bbox.p1.save("lasso")
                                    it._dispatch("lassoed")
                                 } else{curr.splice(idx,1)}
                                 this.selections.push(it)
                             },this)
                              if(curr.length){
                                 curr.forEach(function(it){it._dispatch("unlassoed") })
                                 this._kanvas.fire("elementsunlassoed",curr)
                             }

                             if(this.selections.length){
                                this._kanvas.fire("elementslassoed",this.selections)
                             }
                          }

                         wrkr.afterDraw=function(act){
                             if(act!="move"){
                              this.selectElements()
                             }
                         }
                         //memo.stop=true;
                         //return
                     }
                        if(this.state.clear){this.state.clear()}

                     memo.lastts=+new Date()
                     wrkr.dom=_wrkrlyr;
                     wrkr._kanvas=_self
                     wrkr.isworker=true
                     memo.dur=wrkr.tag=="path"?50:500
                     memo.worker=wrkr
                     wrkr.bbox.p1.to(memo.box.p1.clone() )
                     if(wrkr.multiPoint ){
                         wrkr.array.push(memo.box.p1.clone() )
                     }
                },change=function(ev,memo){
                         var  wrkr=memo.worker, d=+new Date(),o=memo.box  ,dims=memo.box.dims,ct=d-memo.lastts
                          var nu=wrkr.bbox.p1.clone().plus(ev.data.x,ev.data.y)
                         wrkr.bbox.p2.to(nu)
                      //  var dims=    wrkr.bbox.dims
                          if(wrkr.multiPoint ){
                            if(wrkr.array.length<2||memo.box.diagonal>5){
                                 if(((wrkr.type=="polyline"||wrkr.type=="polygon"))){
                                    if(memo.box.diagonal>30&&wrkr.array.length<2||ct > memo.dur){
                                        wrkr.array.push(nu.clone()  )
                                    }
                                    else{
                                        wrkr.array.last().to(nu)
                                    }
                                } else {
                                    wrkr.array.push(nu.clone()  )
                                }
                            }
                            memo.lastts=d;
                         } else{
                             wrkr.bbox.p1.to(dims.left,dims.top)//.//.pause(!1)
                             wrkr.bbox.p2.to(dims.left+dims.width,dims.top+dims.height)//.
                         }

                         if(memo.box.diagonal>2){
                          //   wrkr.bbox.p1.to( memo.box.p1)
               //               wrkr.bbox.h=dims.height;
              //              wrkr.bbox.w=dims.width ;
                            _self.draw(wrkr);
                        }
                    }
                ,end=function(ev,memo){
                     var wrkr=memo.worker, o,tot;
                     if(!wrkr){return}
                     o=memo.box ;
                     tot=wrkr.svg&&wrkr.svg.getTotalLength?wrkr.svg.getTotalLength():0 ;
                    if( (tot&&tot<5)
                        && !(_self.isActiveEl(wrkr) && _self.state.type && wrkr.bbox.diagonal >5 && wrkr.bbox.p2.x>0&&wrkr.bbox.p2.y>0)){
                        _wrkrlyr.style.display="none"
                        return
                    }
                    wrkr.isworker=true;
                     var sub=new wrkr.constructor(),dims=memo.box.dims;

                    sub.bbox.data("shape",sub)
                    var before//=wrkr.bbox.p2.p()<wrkr.bbox.p1.p()
                    if(!wrkr.multiPoint){
                        var dims=    wrkr.bbox.dims
                        sub.bbox.p1.to(dims.left,dims.top)//.//.pause(!1)
                        sub.bbox.p2.to(dims.left+dims.width,dims.top+dims.height)//.
                    } else{
                    sub.bbox.p1.to(o.p1.clone())//.//.pause(!1)
                     sub.bbox.p2.to(o.p2.clone())//.pause(!1)
                    }
                    if(wrkr.bbox.isSquare){
                        sub.bbox.square=true;
                        sub.bbox._squaredim=wrkr.bbox._squaredim
                    }
                    sub._kanvas=_self
                    sub.r=wrkr.r
                     if(wrkr.multiPoint&&wrkr.array.length&&wrkr.array[0]){
                       // if(wrkr.array[0]&&wrkr.array[0].pos=="anchor"){
                        //    wrkr.array.shift()
                        //}
                         sub.array.clear();
                         var lst=[]
                         wrkr.array.forEach(function(it){
                             if(lst.indexOf(it.p())>=0){return}
                             lst.push(it.p())
                             sub.array.add(it.clone())
                         })
                       }
                     if(!_self.state.lasso)    {
                         this.addEl(sub);
                         wrkr.clear(1);
                         this.draw( );
                         this.setActiveEl(sub)
                        //wrkr.clear(1);
                        _wrkrlyr.style.display="none"
                     }
                };

                _self.dragHandles.element=util.setupDragger(cntnr,null,change,start,end,_self )

            }
            var _colorpick=(function ( ){
                var _picker=null,_vw=null,_active={},
                  updatePrev=function( color,nohide){
                    var t=_active.target;
                    if(t &&t.nodeType){
                        var prev=t.querySelector(".color-preview")
                        if(!prev){prev=t.appendChild(document.createElement("div"));
                             prev.style.cssText="position:absolute;bottom:-3px;height:4px;width:"+( t.clientWidth-22 )+"px;left:2px;"
                        }
                        prev.style.backgroundColor=color+""
                        if(_picker&&!nohide){_picker.hide()}
                    }
                    var el=_self.getActiveEl();
                    if( _active.mode){
                        _self.attr(_active.mode,color.toString())
                        if(el){
                            _self.addLogEntry(_self.createLogEntry(el,"attribute",_active.mode))
                            if(el[_active.mode]){el[_active.mode](color.toString())}
                        }
                    }
                };
                return function _colorpick(mode,el){
                     _active.el=el
                    if(_picker ){
                        _picker._vw.config.anchor=el
                        _active.mode=mode
                        _active.target=el
                        _picker.activate(el,_self.attr(mode))
                        return
                    }

                    ZModule.get("ColorPicker",function(c){
                        if(!c){c=ZModule.getWrapper("ColorPicker").value}
                        if(!c){return}
                        _picker=new   c(updatePrev)

                        _active.mode=mode
                        _active.target=el

                        _picker.activate(el,_self.attr(mode))
                     })

                }
            })();

            function _makeEl(tag,attr,style,klass,content){
                 return util.createEl(tag,attr,style,klass,content)
            }
            function makegrid(dom,h,w){
                h=h||10;w=w||10;var color="#ccc",yArr=[],xArr=[]
                if(!divY){
                    divY=document.createElement("div");
                    divX=document.createElement("div");
                    divXY=document.createElement("div");
                    divY.style.cssText="position:relative;background-color:transparent;left:0;width:100%;height:10px;max-height:10px;overflow:hidden;border-left:1px solid "+color+";border-top:1px solid "+color+";";
                    divX.style.cssText="position:absolute; top:0;height:10px;width:10px;max-width:10px;overflow:hidden;border-left:1px solid "+color+";";
                    divXY.style.cssText="position:absolute;z-index:1;color:#111;font-size:.8em;white-space:nowrap;border-radius:4px;top:0;height:10px;width:10px;max-width:10px;background-color:rgba(255,0,0,.4);";
                    divX.className="g-cell"
                    divY.className="g-row"
                }
                var all=[],i=0,j=0,rnngx=w,rnngy=h,yarr=[],ht=dom.offsetHeight ,wd=dom.offsetWidth ,frag=document.createElement("div"),
                    fragY=divY
                var nu=fragY;//frag.appendChild(divY.cloneNode(false));
                rnngx=0 ;rnngy=0,i=0,j=0
                while(rnngx<=wd){
                    var nu=fragY.appendChild(divX.cloneNode(false));
                    nu.dataset.cx=++i
                    nu.style.left=rnngx+"px";xArr.push(rnngx);;rnngx+=w
                }
                rnngy=0
                while(rnngy<=ht){
                    var dm=frag.appendChild(fragY.cloneNode(true));
                    dm.dataset.cy=++j;
                    [].forEach.call(dm.children,function(it){it.dataset.cy=j,x=it.dataset.cx;
                        var id="gc_"+x+"_"+ j,p=Math.round(Math.sqrt(Math.pow((j)*h,2)+Math.pow((x)*w,2))*10)/10;
                        it.dataset.p=p
                        it.id=id
                        all.push([id,p,((x-1)*w) + w/2,((j-1)*h) + h/2,x,j])
                    });
                    all.sort(function(a,b){return a[1]-b[1]})
                    yarr.push(dm)
                    rnngy+=h
                }
                //while(rnngx<=wd){}

                dom.innerHTML=frag.innerHTML;
                divXY=dom.appendChild(divXY)
                divXY.style.display="none"
                var bnd=dom.getBoundingClientRect(),ellist=yarr,timer,msg=[],
                    cellAtPoint=function cellAtPoint(ex,ey,applyoffset){
                        var x, y=Math.floor((ey-(applyoffset?bnd.top:0))/h),el
                        if(ellist[y]){
                            x=Math.floor((ex-(applyoffset?bnd.left:0))/w)
                            el=ellist[y].children[x]
                        }
                        return el?[el,x*w,y*h]:null
                    },
                    cellsInRange=function cellsInRange(p1,p2){
                        var pp1=p1.p(),pp2=p2.p(),x1=pp1>pp2?p2.x:p1.x,
                            x2=pp1>pp2?p1.x:p2.x,y1=pp1>pp2?p2.y:p1.y,y2=pp1>pp2?p1.y:p2.y
                        return all.filter(function(it){var x=it[2],y=it[3],p=it[1];
                            return p>=pp1&&p<=pp2&&x>=x1&&y>=y1&&x<=x2&&y<=y2})
                    }
                dom.parentNode.addEventListener("mousemove",function(ev){
                    var d=this,ex=ev.x,ey=ev.y,trgt=ev.target;
                    if(timer){return}
                    timer=1
                    $d.util.animframe(function(){
                        setTimeout(function(){timer=0},50);
                        var el=cellAtPoint(ex,ey,1);
                        if(!el){return}
                        if(d._last){
                            if(d._last==el[0]){return}
                            //d._last.style.backgroundColor=""
                        }
                        if(msg.length){
                            divXY.innerHTML="-    :"+msg.pop()
                            divXY.style.left=(el[1]*w)+"px";divXY.style.top=(el[2]*h)+"px";
                            divXY.style.display=""
                        }
                        d._last =el[0];
                    });
                    //el.style.backgroundColor="red"
                })
                return {w:w,h:h,x:xArr,y:yArr,dom:dom,showMsg:function(m){msg.push(String(m))},cellAtPoint:cellAtPoint,cellsInRange:cellsInRange}
            }
            function _makeLayer(klass,style){
                var nu=container.appendChild(lyr.cloneNode(true))
                if(klass){String(klass).split(/[\s,]/).forEach(function(it){nu.classList.add(it.trim())})  }
                if(style&&!isNaN(style)&&style>=0){nu.style.zIndex=style  }
                else if(typeof(style)=="color"){nu.style.cssText=style}
                else if(style && typeof(style)=="object"){Object.keys(style).forEach(function(k){nu.style[k]=style[k]})}
                return nu
            }
            function  marker(pt,pos,par){var RADIUS=2;
                this.r=RADIUS
                this.onDrag=null
                this.init=function(pt,pos,par){
                    this.point=pt;this.pos=pos||pt.pos;
                    if(pt.x==null|pt.y==null){return;}
                    par&&par.nodeType&&(this.par=par);
                    var fn,args=[].slice.call(arguments),marker=this;
                    if(typeof(args[args.length-1])=="function"){fn=args.pop()}
                    //var r=args.shift(),par=args.shift(),pos=args.shift() ,ths=pt,svg=pt.svg
                    if(pt.nomarker){return}
                    if(!( marker.point===this)){
                        util.removeEl(  marker.svg)
                    }
                    marker.addListener(fn).draw( par)
                    return this ;
                }

                this.draw=function(par,pt0){var r= this.r||5
                    //  if(this._busy){return}
                    this.r=r
                    if(par && par instanceof Shape){this.par=par}
                    if(!this.par){
                        if(this.point&&this.point.data("shape")){
                            this.par=this.point.data("shape")
                        }
                    }

                    par=this.par;
                    marker._idcounter||(marker._idcounter=0);
                    pt=(pt0&&pt0.x)?pt0:this.point
                    var relat=pt.relative||pt
                    if(this.markersvg&&this.markersvg.parentNode){
                        this.markersvg.setAttributeNS(null,"cx", relat.x) ;
                        this.markersvg.setAttributeNS(null,"cy", relat.y)
                    } else{
                        util.removeEl(this.markersvg)
                        var id=this.point.id+"_marker",tmp=document.getElementById(id) ;
                        util.removeEl(tmp )

                        var myCircle = _makeEl("circle",{cx:relat.x,cy:relat.y,r:RADIUS,fill:"none",stroke:"#ccc","stroke-width":"1",
                                id:id,ref: par.id},{},["marker","marker-"+this.pos]
                        ).appendTo(par.wrapel)
                        this._id=marker._idcounter
                        this.markersvg=myCircle
                        var target=this.markersvg
                        //setupdragger marker
 }
                    if(!pulselayer){
                        var div=document.createElement("div");div.innerHTML='<div class="holder" style="position:absolute;height:20px;width:20px;overflow:hidden;background:transparent;"><div class="pulse"></div></div>'
                        pulselayer=container.appendChild(util.removeEl( div.firstChild))
                        pulselayer.sync=function(el){var dom=this ,offset=util.getBounds(this)
                            if(!util.getBounds(el)){if(dom){dom.style.display="none"} return}
                            msg.innerHTML=offset.height+" "+offset.width
                            var bb=util.getBounds(el); "top left height width".split(/\s/).forEach(function(k){dom.style[k]=bb[k]+"px"})
                            dom.style.display="block";   dom.style.zIndex=1000;
                        }
                    }
                    pulselayer.sync();

                    return this
                }
                this.addListener=function(fn){
                    if(typeof(fn)=="function"){
                        this.onDrag=fn ;}
                    return this
                }
                this.init(pt,pos,par )
            }
            marker._idcounter=0
            function insertGlyph(shape,cntnr){
                var  svgNS = "http://www.w3.org/2000/svg",s=document.createElementNS(svgNS,"svg"),
                    p=s.appendChild(document.createElementNS(svgNS,"path"));
                p.setAttributeNS(null,"d","M5,5 l5,5 l5,-5 Z");
                s.style.height="20px";
                p.setAttributeNS(null,"fill","#ccc");
                if(cntnr){
                    cntnr.appendChild(s)
                }
                return s
            }
            function XY(p,bb){
                var x1=Math.round(Number(p.x)-bb.left) ,y1=Math.round(Number(p.y)-bb.top),x=x1,y=y1
                var el=grid.cellAtPoint(x1,y1)

                //grid.x.some(function(it,i,arr){if(arr[i+1]>x1){return x = it+grid.w/2}})
                //grid.y.some(function(it,i,arr){if(arr[i+1]>y1){return y=it+grid.h/2}})
                return {x:el[1],y:el[2]}
            }
            function _render(panel){
                var map={fill:{mthd:_colorpick.curry("fill"),cmd:1},
                        stroke:{mthd:_colorpick.curry("stroke"),cmd:1},
                        shapes:{mthd:
                            function(  target,ev){

                                var b= target.getBoundingClientRect()
                                if(!map.shapes.dom){
                                    var d=document.createElement("ul");
                                    d.className="def-content-style option-list fxtx_25";
                                    d.style.cssText="position:absolute;width:150px;"
                                    var menu=buttonsshapes.map(function(k){
                                        return "<li data-key='"+k+"' style='line-height:1.8;border-bottom:1px solid #444'>"+capitalize(k)+"</li>"
                                        //return "<button class='ui-button small svgbutton dopath combo-button' style='display:block;width:100%;clear:both;' data-key='"+k+"'>"+capitalize(k)+"</button>"
                                    }).join("")
                                    menu="<li class='msg' style='opacity:.5;padding:0 5px;height:1.4em; line-height:1.2;z-index:200;'>"+capitalize(k)+"</li>"+menu
                                    d.innerHTML=menu
                                    //menu='<div class="ui-button-bar ui-button-bar-vertical" style="overflow:hidden;box-shadow:2px 2px 2px #999;position:relative;width:100px;">'+menu+'</div>'
                                    //d.innerHTML="<div class='ui-button-msg msg' style='opacity:.5;padding:0 5px;height:1.4em; line-height:1.2;z-index:200;border-radius:4px;box-shadow:2px 2px 2px #999'></div>"+menu
                                    var contb=container.getBoundingClientRect()
                                    map.shapes.dom=container.appendChild(d);
                                    map.shapes.dom.style.top=(b.bottom-contb.top)+"px"

                                    map.shapes.menu=map.shapes.dom
                                    map.shapes._ht=map.shapes.menu.scrollHeight
                                    map.shapes.dom.style.height=".1px"
                                    map.shapes.dom.addEventListener("click",function(ev){
                                        var st=hndl(ev);if(!st){return}

                                        map.shapes.msg.style.display=""
                                        map.shapes.msg.innerHTML="Draw a "+st.type+" on canvas"
                                        map.shapes.dom.style.height=map.shapes._msght+"px"
                                        map.shapes.dom.style.width="auto"
                                    })
                                    map.shapes.msg=map.shapes.dom.querySelector(".msg")
                                    map.shapes._msght=map.shapes.msg.offsetHeight||20
                                }
                                map.shapes.target=target
                                map.shapes.msg.style.display="none"
                                var contb=container.getBoundingClientRect()
                                util.domprops(map.shapes.dom,{style:{//(b.bottom-contb.top)+
                                    height:map.shapes._ht+"px",top:"0",left:(b.left-contb.left)+"px",width:"150px",display:""}
                                });
                                if(map.shapes.docmup){document.removeEventListener("mouseup",map.shapes.docmup);map.shapes.docmup=null}
                                map.shapes.docmup=function(){
                                    if(!map.shapes.dom.contains(ev.target)){
                                        if(map.shapes.docmup){document.removeEventListener("mouseup",map.shapes.docmup);}
                                        map.shapes.docmup=null;
                                        if(map.shapes){map.shapes.dom.style.height=map.shapes.msg.offsetHeight+"px"}
                                    }
                                }
                                setTimeout(
                                    function(){
                                        if(map.shapes.docmup){document.addEventListener("mouseup",map.shapes.docmup)}
                                    },500
                                );
                            }
                        },
                        undo:{mthd:function(){
                            _self.undo()
                        },cmd:1},
                        redo:{mthd:function(){
                            _self.redo()
                        },cmd:1},save:{mthd:function(){
                            var str=_self.serialize()
                            localStorage.setItem("__svgserialized",str)
                        },cmd:1},
                        load:{mthd:function(){
                            var str=localStorage.getItem("__svgserialized")
                            _self.parse(str)
                        },cmd:1},
                        clear:{mthd:function(){_self.clear()},cmd:1},
                        slot:{mthd:function(){

                        }}
                    },
                    buttons="stroke fill shapes | slot clear save load | undo redo".split(/\s+/),
                    buttonsshapes="path arc triangle line hline vline ellipse circle rect square polygon polyline".split(/\s+/)
                var buttonshtml=buttons.map(function(k,i){
                    var cls='ui-button   svgbutton dopath';if(i<3){cls+=' combo-button'}
                    if(k=="|") {return "<span class='ui-button-sep'>|</span>"}
                    return "<span class='"+cls+"' data-key='"+k+"' style='padding-top:2px;padding-bottom:2px;padding-bottom:2px;'>"+(k[0].toUpperCase()+ k.substr(1))+"</span>"
                }).join("")

                var html="\
                 <div style='height:99%;margin:5px;margin-top:0; position: relative;' class='kanvas'>\
                    <div class='lyr' style='position:absolute;top:0;left:0;height:100%;width:100%;z-index:10'>\
                    </div>\
                </div>\
                "

                var hndl=  function(ev){
                    var target=ev.target;
                    if(!(target&&target.dataset)){return}
                    if(!target.dataset.key){target=$d.up(target,"[data-key]")}
                    if(!target){return}
                    var k=target.dataset.key,m=map[k];
                    if(!m && createklass.namelist[k]){
                        map[k]=m={ctor:createklass.namelist[k]}
                    }
                    if(!m){alert(k+" "+createklass.namelist[k]);return};
                    [].forEach.call(target.parentNode.querySelectorAll(".selected"),function(it){it.classList.remove("selected")} );
                    if(!target.classList.contains("ui-button-combo")){target.classList.add("selected")}
                    //
                    if(m.mthd && typeof(m.mthd)=="function"){

                        m.mthd.call(_self.state, target,ev)
                    } else if(m.ctor&&_self.state.type!=k){
                            _self.state.target=target
                            _self.state.type= k;
                            _self.state.ctor=createklass.namelist[k]
                            _self.state.clear=function(){
                                this.type=this.ctor=null;if(!this.target){return}
                                _each(this.target.parentNode.querySelectorAll(".selected"),
                                    function(it){
                                        util.removeKlass(it,"selected")
                                    } );
                            }.bind(_self.state)


                    }
                    return _self.state
                }

                panel.config.barlocation="header";
                 var bb=new $.View.ButtonBar({ klass:"compact"})
                bb.el.addClass("compact")
                buttons.forEach(function(k,i){
                    var but=bb.addButton(k )
                    but.on("select",hndl)
                    if(but&&i<3){but.config.ascombo=true}
                })

               panel.el.q(".floor-layout").insert(html)

                if(panel.headerbar ){
                    panel.headerbar.add(bb);
                    bb.layout()
                }
                panel.layout()
                 var bar=panel.buttonBar||panel.el.q(".ui-button-bar");

                if(bar){
                    if(panel.headerbar){
                       // panel.buttonBar=bar=$d.append(panel.headerbar.el,bar)
                    }
                     bar.addClass("ui-button-group").append("<div style='position:absolute;text-align:right;right:10px;top:0;height:20px;color:#ccc;font-size:.8em;' class='kanvas-msg'></div>");
                   // bar.st(".ui-button-bar-el").css("h",26)
                }
                //container.innerHTML=html;
                /* [].forEach.call(container.querySelectorAll(".combo-button"),function(it){
                 it.innerHTML="<span class='button-text' style='margin-right:10px;'>"+it.textContent+"</span><span class='combo-glyph' style='display:inline-block; border-left:1px solid #999;width:16px;float:right;'></span>"
                 var g=it.querySelector(".combo-glyph")
                 if(g){ it.style.height="1.4em";it.style.paddingRight="5px"
                 it.querySelector(".button-text").style["float"]="left"
                 insertGlyph("",g)
                 }
                 })*/
                //container.querySelector(".svgbuttonbar").addEventListener("click",hndl);

            }
            function _dims(){
                var h=container.parentNode.clientHeight,w=container.parentNode.clientWidth;
                container.style.height=(h-(container.offsetTop+10))+"px"
                container.style.width=(w-10)+"px"
                //container.querySelectorAll(".lyr")
            }
            function _init(panel){
                _render(panel)
                container=panel.el.querySelector(".kanvas")
                _dims()
                lyr=container.querySelector(".lyr")
               // _uilayer0=_makeLayer("uilayer0",{style:{zIndex:0}})
                _wrkrlyr=_makeLayer("workerlayer")
                ellayer=_makeLayer("ellayer")
                _uilayer=ellayer
                draglayer=_makeLayer("draglayer")
                _self.dom=ellayer;
                msg=panel.el.querySelector(".msg")
                grid=makegrid(_makeLayer("nocontent gridlayer"))
                grid.dom.style.zIndex=1
                _self.grid=grid;
                _setupDrag()
                var ofst =util.getBounds(ellayer)
                /*panel.contentWrap.on("mousemove", $.throttle(
                    function(ev){
                        if(!ofst.top){ofst =util.getBounds(ellayer)}
                        this.msg(""+Math.round(ev.x-ofst.left)+" , "+Math.round(ev.y-ofst.top))
                    }.bind(_self)
                ));*/

            }
            function drawMarkers(elem,callbackfn){
                var ths=elem,dom=ths.svg,all=ths.getPoints(true)
                ths._markers=[];
                if(!dom){return}
                var curr=[].slice.call(dom.parentNode.querySelectorAll("circle.marker"));
                ths.getPoints(true).forEach(function(it,i,arr){
                    if(ths._markers.length<i+1||ths._markers[i].point!=it){
                        if(ths._markers[i]){
                            util.removeEl(ths._markers[i].markersvg)
                            ths._markers[i].markersvg=null;
                        }
                    }
                    var pt=it.relative
                    if(it.marker&&it.marker.markersvg){
                        it.marker.markersvg.setAttributeNS(null,"cx",pt.x)
                        it.marker.markersvg.setAttributeNS(null,"cy",pt.y)
                        var idx=curr.indexOf(it.marker.markersvg)
                        if(idx>=0){curr.splice(idx,1)}
                        this._markers.push(it.marker)

                        return
                    }
                    it.dom=this.wrapel;
                    var  fn=this.onChange.bind(this)  ,nu
                    if(it.pos&&!it.nomarker) {it.data("shape",ths)
                        nu=new marker (it,it.pos ,this).addListener(fn)
                        if(nu){
                            nu&&this._markers.push(nu);
                            it.marker=nu   ;
                            var idx=curr.indexOf(nu.markersvg)
                            if(idx>=0){curr.splice(idx,1)}
                            nu.draw()
                        }
                    }
                },ths);
                curr.forEach(util.removeEl)


            }
            function build( wrkr,svg){
                var ths=_self,wrapel=svg.querySelector("g"),isw=!! wrkr;
                if(!wrapel) {
                    wrapel=_makeEl("g")
                    wrapel.id=(isw?"worker":"")+"root_gp";
                    wrapel.classList.add("gp");
                    if(wrapel.id=="root_gp"){
                        wrapel.style.height="100%"
                        wrapel.style.width="100%"
                    }
                }
                if(wrkr){
                    var frg=wrkr.build();
                    frg&&wrapel.appendChild(frg);
                    wrkr.setDefaultAttr();
                } else if(_subs&&_subs.length){
                    _subs.forEach(function(it){
                         var frg=it.build();
                        it.setDefaultAttr();
                        if(frg){
                            it.wrapel= wrapel.appendChild(frg);
                        }
                    } );

                }

                return wrapel;
            }
            function draw( iswrkr ){
                var ths=_self,svg,dom=iswrkr?iswrkr.dom:ellayer;
                if(!dom){return ths}
                //this.clear();
                if( !( svg=dom.querySelector("svg"))){// width="100%" height="100%"
                    dom.innerHTML='<svg  xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">\
                    <defs> \
                    <filter id="dropshadow" >\
                       <feGaussianBlur in="SourceAlpha" color="green" stdDeviation="3"/> \
                        <feOffset dx="2" dy="2" result="offsetblur"/> \
                         <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>\
                    </filter>\
                    <filter id="dropshadow1">\
                    <feOffset result="offOut" in="SourceGraphic" dx="2" dy="2" />\
                        <feGaussianBlur result="blurOut" in="offOut" stdDeviation="3" />\
                        <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />\
                         </filter>\
                   </defs>\
                    </svg>\
                    '.trim()
svg=dom.querySelector("svg")
                    svg.id=(iswrkr?"worker":"el")+"_wrap"

                  //  _uilayer=ellayer.insertBefore(_makeLayer("uilayer"),ellayer.firstChild)

                }
                var svgchildren=build(iswrkr,svg)
                //this.svg=this.dom.querySelector("svg")
                svg.appendChild(svgchildren);
                _self.svgsvg=svg;
                //  ths._attachEv(null);
                if(!iswrkr){
                    if(_subs.length){
                        _subs.forEach(function(it){
                             it._afterDraw();
                        })

                    }
                } else {iswrkr._afterDraw();}

                return ths
            }

            var _redolog=[],_undolog=[],_globalAttr={}

            var api= {
                init:_init,  makeEl:_makeEl,  drawMarkers:drawMarkers,state:{},
                grid:grid,
                elements:_subs,
                attr:function(k,v){_globalAttr[k]=v},
                findAllByType:function(srch){srch=String(srch).toLowerCase();
                    return _subs.filter(function(el){return el.type==srch})
                },
                 deActivateView:function(){

                 },
             activateView:function(){

            },
                findInsections:function(box,topel){
                    var lst=[],rect,topgp=topel||this.dom.parentNode.querySelector(".ellayer svg")
                    if(!topgp){return []}
                     rect=  box.toSvgRect(); rect.x=rect.x-15;
                    lst=[].filter.call(topgp.getIntersectionList(rect,null),function(it){
                        return (it && it.classList && !it.classList.contains("marker"))
                    })//.map(function(it){return (String(it.nodeName)!="g")?it.parentNode:it})
                    lst=this.elements.filter(function(it){return lst.indexOf(it.wrapel)>=0||lst.indexOf(it.svg)>=0});

                    return lst;
                },
                find:function(srch){if(srch==null){return null}
                    var el
                    if(typeof(srch)=="object"){
                        if(srch.nodeType){el=_subs.find(function(el){return el.svg==srch|| el.wrapel==srch})}
                        else {var i=_subs.indexOf(srch);if(i>=0){el=_subs[i]}}
                    } else if(typeof(srch)=="string"){
                        el=_subs.find(function(el){return el===srch || el.id==srch|| (el.svg&&el.svg.id==srch)|| (el.wrapel&&el.wrapel.id==srch)})
                    }
                    if(!el){
                        if(typeof(srch)=="string"){
                            var arr=srch.split("#"),i=((Number(arr[1]||"0")+1)||1)-1
                            var all=this.findAllByType(arr[0])//_subs.find(function(el){return el.type==srch})
                            el=i==-1?all.pop():all[i]
                        } else if(typeof(srch)=="number"){
                            el=_subs[srch]
                        }
                    }
                    return el;
                },
                remove:function(e){
                   var el=this.find(e)
                    if(el){
                        el.clear()
                    }
                    util.removeEl(el.wrapel||el.svg);
                    return this
                },
                getUILayer:function(){return _uilayer},
                msg:function(s){
                    this._msgdom||(this._msgdom=this.panel.el.querySelector(".kanvas-msg"))
                  if(this._msgdom){
                      s=s||""
                      this._msgdom.innerHTML=s;
                  }
                },
                dup:function(el,props){var nu,elem=this.find(el)
                    if(!elem){return}
                    nu=this.append(elem.tag,el.toMap(true))
                     nu.draw().moveBy(20)
                    return nu
                },
                append:function(tag,props){
                    var nu=this.getShape(tag)
                    this.parseEl(nu,props)
                    this.addEl(nu)
                    this._lastappended=nu;
                    return nu
                },
                redo:function(elem,txt){
                    if(_redolog.length){
                        var entry=_redolog.pop()||[],undo=entry[2];
                        var el=_subs.find(function(it){return it.id==entry[0]})
                        if(!el){
                            if(undo&&undo.length&&undo[1]=="NEW"){
                                var sh=entry[1]
                                if(sh && sh.type){var tag=sh.type;delete sh.type;
                                    this.append(tag,sh)
                                    this.draw()
                                }
                            }
                            return
                        }
                        if(undo){_undolog.push(undo)}
                        el.clear()
                        this.parseEl(el,entry[1])
                        this.draw()
                    }
                } ,
                undo:function(){
                    if(_undolog.length){
                        var entry=_undolog.pop();
                        var el=_subs.find(function(it){return it.id==entry[0]})
                        if(!el){return}
                        _redolog.push([el.id,el.toMap(),entry])

                        el.clear()
                        if(entry[1]=="NEW"){
                            var idx=_subs.indexOf(el)
                            util.removeEl(el.wrapel);
                            _subs.splice(idx,1)
                        } else{this.parseEl(el,entry[1])}

                        this.draw()
                    }

                },
                createLogEntry:function(elem,txt){return [elem.id,elem.toMap(),txt]},
                addLogEntry:function(entry){
                    _undolog.push(entry);
                    return this
                },
                loggableAction:function(elem,txt){
                    _undolog.push([elem.id,elem.toMap(),txt])},
                on:function(type,fn,optns){_emitter.on(type,fn,optns);return this},
                fire:function(type,args){_emitter.fire.apply(_emitter,arguments);return this},
                unsetActiveEl:function(el){
                       return this.setActiveEl(null);
                },
                setActiveEl:function(el){
                    if(el=="null"){el=null}
                    if(this.state.el=="null"||(this.state.el&&this.state.el.__deleted)){this.state.el=null}
                    var curr=this.state.el
                    if(curr&&el&&curr==el){return}
                    this.state.el=el;
                    if(curr&&curr._active){curr._active=false;}
                    if(el){
                        el._active=true
                    }
                    if(curr){
                        this.fire("elementunselected",curr)
                        curr._dispatch("unselected")
                    }
                    if(el){

                        if(_uilayer0){
                            var sh=_uilayer0.querySelector(".shadow-box")
                           if(!_uilayer0.querySelector(".shadow-box")) {
                               sh=_uilayer0.appendChild(document.createElement("div"));
                               var msgbx=sh.appendChild(document.createElement("div"))
                               sh.className="shadow-box"
                               _self.msgbox=msgbx
                               msgbx.style.cssText='font-size:.75em;color:#333;position:absolute;top:-14px;;width:100px;white-space:nowrap;left:100%;text-align:right;overflow:visible;'
                               var offset=_uilayer0.getBoundingClientRect()
                               this.on("elementunselected",function(ev){
                                    sh.style.display="none"
                               });

                               this.on("afterdraw elementselected",function(ev){var el=(ev.el||ev.data)
                                   if(el.isLasso||el.isWorker){sh.style.display="none";return}
                                    var st=sh.style,b=el.svg.getBoundingClientRect(),
                                        w=Math.max(0,Number(el.attr( "stroke-width"))||0 - 2)
                                    st.display=""
                                   st.left=(b.left-(w/2+offset.left))+"px";st.top=(b.top-(w/2+offset.top))+"px";
                                   st.width=(b.width+w)+"px";st.height=(b.height+w)+"px"

                               })

                           }
                        }
                        this.fire("elementselected",el)
                        el._dispatch("selected")
                    }

                    return this
                },
                isActiveEl:function(el){return el && this.getActiveEl()===el},
                getActiveEl:function(){
                    if(!this.state.el || this.state.el=="null"){this.state.el=null}
                    return this.state.el
                },
                getState:function(){return this.state},
                updateState:function(nm,val){this.state[nm]=val;return this},
                removeEl:function(el){
                    var elem=this.find(el),idx=this.elements.indexOf(elem)
                    if(idx>=0){
                        elem.clear();
                        if(elem.wrapel&&elem.wrapel.parentNode){elem.wrapel.parentNode.removeChild(elem.wrapel )}
                        if(this.state.el==elem){this.state.el=null}
                        this.elements.splice(idx,1)
                        elem.__deleted=true
                    }
                    return this
                },
                addEl:function(el,props){
                    _self.addLogEntry([el.id,"NEW","new element"])
                    el._kanvas=this;
                    _subs.push(el);
                    if(_globalAttr&&Object.keys(_globalAttr).length){
                        Object.keys(_globalAttr).forEach(function(k){
                            el.attr(k,_globalAttr[k])
                        })
                    }
                    el.prop("klass",true,"kanvas-el")
                    return this
                },toDataURL: function (imageType, quality) {
                    var canvas = this._canvas;
                    return canvas.toDataURL.apply(canvas, arguments);
                },
                fromDataURL :function (dataUrl) {
                    var self = this,
                        image = new Image();

                    this._reset();
                    image.src = dataUrl;
                    image.onload = function () {
                        self._ctx.drawImage(image, 0, 0, self._canvas.width, self._canvas.height);
                    };
                    this._isEmpty = false;
                },

                serialize:function(){
                    var map={shapes:_subs.map(function(it){return it.toMap()})}
                    return JSON.stringify(map)

                },
                clear:function( nodebug){
                    _subs.length=0;
                    if(this.dom){
                        var arr=[].forEach.call(this.dom.querySelectorAll(".subgp"),util.removeEl);
                    }
                    return this
                },
                parseEl:function(nu,str){
                    var sh =typeof(str)=="string"?JSON.parse(str):str
                    if(nu){
                        nu._kanvas=this
                        if(Array.isArray(sh)){
                            sh={points:sh}
                        }
                        if(sh && typeof(sh)=="object" && Object.keys(sh).length==2&&("x" in sh)){
                            nu.bbox.p1=Point.create(sh)
                        } else {
                             _each(sh,function(v,k){

                                if(k=="id"&&v){
                                    nu.id=v;
                                }
                                if(k=="bbox"&&v){
                                    //  sh.bbox.p1=null;sh.bbox.p2=null
                                    nu.bbox._squaredim=null;
                                    nu.bbox.fromMap(v)
                                }
                                if(k=="attr"&&v){
                                    // nu._attr={}
                                    nu.attr(v)
                                }
                                if(k=="points"&&v&&v.length){
                                    nu.array.clear()
                                    v.map(function(it){return Point.create(it) }).filter(function(it){return it && it.setPos}).forEach(
                                        function(it){nu.array.add(it)}
                                    )
                                    if(!nu.multiPoint){
                                        nu.bbox.p1=Point.create(v[0])
                                        if(v.length>1){nu.bbox.p2=Point.create(v[1])}
                                    }
                                }

                            },nu)
                        }



                    }

                },
                parse:function(str){
                    var map=typeof(str)=="string"?JSON.parse(str):str
                    if(map && isPlain(map)&&Array.isArray(map.shapes)){
                        for(var i=0,l=map.shapes,ln=l.length,sh;sh=l[i],i<ln;i++){
                            if(sh && sh.type){
                                var nu=this.getShape(sh.type)
                                this.parseEl(nu,sh)
                                this.addEl(nu)
                            }

                        }
                        this.draw()
                    }

                },
                draw:draw,
                redraw:function(target){if(target&&target.draw){target.draw()};return this},
                render1:function(){} ,

                getShape:function(nm,options){
                    return createklass.namelist[nm]?
                        konstruct_argarr(createklass.namelist[nm],[].slice.call(arguments,1)):null
                }
            }
            for(var k in createklass.namelist){
                !(k in api) && ( api[capitalize(k)]=(function(ctor){
                    return function(){
                        var nu=konstruct_argarr(ctor,arguments);
                        this.addEl(nu)
                         return nu;
                    }

                })(createklass.namelist[k]));
            }
            _emitter=$.emitter(api,"change");
            _emitter.on("change",function(ev){
                var el=_self.getActiveEl();
                if(el && ev.data.type=="move"){
                   el.moveTo(ev.data.point)
                } else {el.onChange(ev.data)}

            });
            _self=api;
            _self.panel=panel;
            _init(panel);
            return api;
        }

    var toret={}
    Svg.createCanvas=function(panel,config ){return _kanvas(panel,config )}
    for(var k in createklass.namelist){
        !(k in Svg) && ( Svg[capitalize(k)]=konstruct.curry(createklass.namelist[k]));
    }
    Svg.PointSet=PointSet
    Svg.Util=util
module.exports=Svg

 /*









 function solveTriangle(a, b, c, A, B, C) {
  function Nil(a){return a==null}
  function NTnil(a){return a!=null}
     var sides  = (NTnil(a)) + (NTnil(b)) + (NTnil(c));  // Boolean to integer conversion
     var angles = (NTnil(A)) + (NTnil(B)) + (NTnil(C));  // Boolean to integer conversion
     var area, status,sin=Math.sin,cos=Math.cos,tan=Math.tan;
     function formatNumber(x) { return x.toPrecision(9); }
     function degToRad(x) { 	return x / 180 * Math.PI; }
     function radToDeg(x) { 	return x / Math.PI * 180; }
     function solveSide(a, b, C) {  return Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(degToRad(C))) }// Returns side c using law of cosines
     function solveAngle(a, b, c) {  // Returns angle C using law of cosines
         var temp = (a * a + b * b - c * c) / (2 * a * b);
         if (temp >= -1 && temp <= 1){return radToDeg(Math.acos(temp));}
         throw "No solution";
     }

     if (sides + angles != 3){ throw "Give exactly 3 pieces of information";
     }else if (sides == 0){  throw "Give at least one side length";
     }else if (sides == 3) {
         status = "Side side side (SSS) case";
         if (a + b <= c || b + c <= a || c + a <= b){ throw status + " - No solution";}
         A = solveAngle(b, c, a);
         B = solveAngle(c, a, b);
         C = solveAngle(a, b, c);
          var s = (a + b + c) / 2;// Heron's formula
         area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
      } else if (angles == 2) {
         status = "Angle side angle (ASA) case";
         // Find missing angle
         if (A == null) A = 180 - B - C;
         if (B == null) B = 180 - C - A;
         if (C == null) C = 180 - A - B;
         if (A <= 0 || B <= 0 || C <= 0) throw status + " - No solution";
         var sinA = Math.sin(degToRad(A));
         var sinB = Math.sin(degToRad(B));
         var sinC = Math.sin(degToRad(C));
         // Use law of sines to find sides
         var ratio;  // side / sin(angle)
         if (NTnil(a)) { ratio = a / sinA; area = a * ratio * sinB * sinC / 2; }
         if (NTnil(b)) { ratio = b / sinB; area = b * ratio * sinC * sinA / 2; }
         if (NTnil(c)) { ratio = c / sinC; area = c * ratio * sinA * sinB / 2; }
         if (Nil(a))      {a = ratio * sinA;}
         if (Nil(b)) {b = ratio * sinB;}
         if (Nil(c)) {c = ratio * sinC;}
      } else if (NTnil(A) && Nil(a) || NTnil(B) && Nil(b) || NTnil(C) && Nil(c)) {
         status = "Side angle side (SAS) case";
         if (NTnil(A) && A >= 180 || NTnil(B) && B >= 180 || NTnil(C) && C >= 180){throw status + " - No solution";}
         if (Nil(a)) a = solveSide(b, c, A);
         if (Nil(b)) b = solveSide(c, a, B);
         if (Nil(c)) c = solveSide(a, b, C);
         if (Nil(A)) A = solveAngle(b, c, a);
         if (Nil(B)) B = solveAngle(c, a, b);
         if (Nil(C)) C = solveAngle(a, b, c);
         if (NTnil(A)) {area = b * c * Math.sin(degToRad(A)) / 2;}
         if (NTnil(B)) {area = c * a * Math.sin(degToRad(B)) / 2;}
         if (NTnil(C)) {area = a * b * Math.sin(degToRad(C)) / 2;}

     } else {
         status = "Side side angle (SSA) case - ";
         var KS, KA, PS;
         if  (NTnil(a) && NTnil(A)) { KS = a; KA = A; }
         else if (NTnil(b) && NTnil(B)) { KS = b; KA = B; }
         else if (NTnil(c) && NTnil(C)) { KS = c; KA = C; }

         PS = NTnil(a) && Nil(A) ?a: (NTnil(b) && Nil(B)? b : (NTnil(c) && Nil(C) ? c:null))

         if (KA >= 180){ throw status + "No solution";}
         var ratio = KS / Math.sin(degToRad(KA)),  temp = PS / ratio,  // sin(PA)
             PA, US, UA;
         if (temp > 1 || KA >= 90 && KS <= PS){			throw status + "No solution";
         }else if (temp == 1 || KS >= PS) { status += "Unique solution";
             PA = radToDeg(Math.asin(temp));
             UA = 180 - KA - PA;
             US = ratio * Math.sin(degToRad(UA));  // Law of sines
             area = KS * PS * Math.sin(degToRad(UA)) / 2;
         } else {
             status += "Two solutions";
             var PA0 = radToDeg(Math.asin(temp)),
                 PA1 = 180 - PA0,
                 UA0 = 180 - KA - PA0,
                 UA1 = 180 - KA - PA1,
                 US0 = ratio * Math.sin(degToRad(UA0)),  // Law of sines
                 US1 = ratio * Math.sin(degToRad(UA1)),  // Law of sines
                 PA = [PA0, PA1], UA = [UA0, UA1], US = [US0, US1];
             area = [KS * PS * Math.sin(degToRad(UA0)) / 2,   KS * PS * Math.sin(degToRad(UA1)) / 2];
         };
         (NTnil(a) && Nil(A)) && (A = PA);
         (NTnil(b) && Nil(B)) && (B = PA);
         (NTnil(c) && Nil(C)) && (C = PA);
         if(Nil(a) && Nil(A)) { a = US; A = UA; }
         if(Nil(b) && Nil(B)) { b = US; B = UA; }
         if(Nil(c) && Nil(C)) { c = US; C = UA; }
     }
     return {a:a, b:b, c:c, A:A, B:B, C:C, area:area, status:status};
 }

    function(id){
var c=Svg.Point(50,50),rd=50,inc=5,st0=5,r=[];

    function(p1,p2){
    var ang=st,xy=[],nu=null,st=st0;

	if(st>90){if(st<180){ang=180-st} else if(st<270){ang=  st-180} else {ang= 360-st}}

	st0=st0+inc;
 	try{ nu=Svg.Util.solveTriangle(null,null,rd,ang,null,90);} catch(e){console.log("error",st0,st)}
	if(!nu){ xy=[c.x+(st==180?-1:st==90?0:st==270?0:1)*rd,c.y+(st==180?0:st==90?-1:st==270?1:0)*rd] }
	 else{xy=[Math.round(nu.bln),Math.round(nu.aln)]
	 if(st<=90){ xy[0]=c.x+xy[0];xy[1]=c.y-xy[1]}
	 else if(st<=180){xy[0]= c.x-xy[0];xy[1]= c.y-xy[1]}
	else if(st<=270){xy[0]=c.x-xy[0];xy[1]=c.y+xy[1];}
	else {xy[0]=2*rd-(c.x-xy[0]);xy[1]=2*rd-(c.y-xy[1]);}
}
	r.push(xy);
 	console.log(ang, r[r.length-1]+"");
};
var p=r.map(function(a){return a[0]+" "+a[1]}).join(" ")
document.getElementById(id).setAttributeNS(null,"d","M" +p)
})("path_172_path")
*/