!function(scope,factory){
    scope.Slider= factory

}(

    self.UI||(self.UI={}),
        function(){
            var template=("                                       \
                <div class='slider-wrap origin-lb'>              \
                    <div class='slider-track rotate-val'>        \
                        <div class='slider-handle-line'></div>   \
                        <div class='slider-handle' ></div>       \
                    </div>                                       \
                    <div class='slider-marker'> </div>           \
                     <input class='slider-focus-ip'/>             \
                </div> " ).replace(/\>\s+/gm,">").replace(/\d+\</gm,"<").trim()
                function _bounds(e){
                    return e.getBoundingClientRect()
                }
            var animationFrame=window.requestAnimationFrame = window.requestAnimationFrame ||window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
                function(callback) {
                    window.setTimeout(callback, 1000 / 60);
                };

                function _slider(optns){

                    if(optns.container){
                       $d(optns.container).append(template)
                    }
                    var _listeners=[],maxval=optns.max||100,minval=optns.min||0,step=optns.step||10,span=maxval-minval
                    function _render( api){
                        var w=optns.container.querySelector(".slider-wrap") ,_mx=Math.max,_mn=Math.min,_round=Math.round
                        var h=w.querySelector(".slider-handle")
                        var ip=w.querySelector("input")
                        var t=w.querySelector(".slider-track")
                        var bb={height:20,width:20},dir=w.classList.contains("slider-ver")?"y":"x"
                        var wedge=document.createElement("div");wedge.className="slider-marker-wedge"
                        var markerval=document.createElement("div");markerval.className="slider-marker-val"
                        var marker=w.querySelector(".slider-marker")
                        var posmap={x:"left",y:"left"},dimmap={x:"offsetWidth",y:"offsetWidth"},dimmap2={x:"offsetLeft",y:"offsetLeft"},
                            max=t[dimmap[dir]]  , min=0-(bb.height/2)

                        var _data={threshold:(step *.66)*(max/span),offset:bb.height/2, dir:dir, dim:posmap[dir] ,max:{x:max,y:max},init:{x:0,y:0},curr:{x:0,y:0},valuestep:step,step:_round((max/span)*step) }
                        try{ip.focus()} catch(e){}
                        function _onchange(v){
                            _listeners.forEach(function(it){it(_data.val )})
                            marker.innerHTML= _data.val
                        }
                        function _setValue(v ){
                             var val=  ((v/span)*_data.max[dir]) - _data.offset
                            _data.init.x=_data.init.y=0
                            _update(val)
                        }
                        function _getValue(v ){
                            return _data.val
                        }
                        function _setValue(v ){
                            var val=  ((v/span)*_data.max[dir]) - _data.offset
                            _data.init.x=_data.init.y=0
                            _update(val)
                        }
                        function _update(delta , prev,dir){dir=dir||[_data.dir]

                            var df, val=_data.init[dir]+delta[dir],s=_data.valuestep
                            //if((_data.max[dir]-val +1) <(_data.threshold)){val=_data.max[dir]}
                            //else if((val-min+1) <(_data.threshold)){val=min}
                            //else{
                            val=_mn(_data.max[dir],_mx(min ,val))
                            //}

                            // if(val &&prev&&val==prev[dir]){ return }
                            var val2 =_round(((val )/_data.max[dir])*span)
                            df=(val2 )>s?((val2 )%s):(val2 )
                            val2 -= df;
                            _data.val=val2
                            //   val=  ((val2/span)*_data.max[dir]) - _data.offset

                            animationFrame(function(){ var v1=val+_data.offset
                                var df=(v1)>_data.step?(v1%_data.step):v1
                                h.style[_data.dim]=(val - df ) +"px"
                                _data.curr[_data.dir]=val
                                _onchange(val )
                            })
                            return val
                        }

                        function setPos(delta , prev){
                            if(typeof(delta)==="number"){var v=delta
                                delta={x:v,y:v};
                            }
                            _update(delta,prev)
                         }

                        h.addEventListener("mousedown",
                            function (ev){
                                _data.ignoreClick=true
                                var _d={x:ev.x,y:ev.y,  prev:{x:0,y:0}}
                                _data.init.x=_data.init.y=h.offsetLeft

                                function mv(ev){
                                    var p=_pos(ev),delta={x:p.x-_d.x,y:p.y-_d.y}
                                    setPos(delta,_d.prev)
                                    _data.prev=_data.curr;
                                }
                                function mup(){   ip.focus()
                                    w.removeEventListener("mousemove",mv)
                                    document.removeEventListener("mouseup",mup)
                                }
                                setTimeout(function(){
                                    w.addEventListener("mousemove",mv)
                                    document.addEventListener("mouseup",mup)

                                },1)

                            }
                        );
                        function _mousewheel(ev){
                            if(ev.wheelDelta){
                                if(_mousewheel.timer){return}
                                _mousewheel.timer=setTimeout(function(){
                                    _data.init.x=_data.curr.x;_data.init.y=_data.curr.y
                                    setPos( (1+ _data.step)*(ev.wheelDelta>0?-1:1))
                                    _mousewheel.timer=0
                                },100)
                            }
                            ev.stopPropagation && ev.stopPropagation();
                            ev.stopImmediatePropagation && ev.stopImmediatePropagation();
                        };
                        w.addEventListener("mousewheel",_mousewheel)
                        ip.addEventListener("mousewheel",_mousewheel)
                        ip.addEventListener("keydown",function(ev){
                            var b=_bounds(t), d,v=_data.step +1
                            switch(ev.keyCode){
                                case 38:d=0-v;break;//up
                                case 39:d=v;break;//right
                                case 40:d=v;break;//dn
                                case 37:d=0-v;break;//left
                                case 36:d={x:0-_data.curr.x,y:0-_data.curr.y};break;//home
                                case 35:d={x:_data.max.x-0.1,y:_data.max.y-0.1};break;//end
                                case 33:d=v*-2;break;//pageup
                                case 34:d=v*2;break;//pagedn
                            }
                            if(d){ _data.init.x=_data.curr.x;_data.init.y=_data.curr.y
                                setPos(d)
                            }

                            ev.preventDefault&&ev.preventDefault()
                        });
                        h.addEventListener("dragstart",function(ev){ev.preventDefault&&ev.preventDefault()});
                        t.addEventListener("click",function(ev){if(_data.ignoreClick){_data.ignoreClick=0;return}
                            _data.init.x=0; _data.init.y=0;
                            var b=_bounds(t),p=_pos(ev),nu={x: p.x-b.left-bb.height/2,y: p.y-b.top-bb.height/2}
                            setPos( nu )
                            try{ip.focus()} catch(e){}
                        });
                        var x=minval;
                        var widthspan=w.appendChild(document.createElement("span"));widthspan.className="slider-widthspan"
                        var values=[]
                        while(x<=_data.max.x){
                            values.push(x)
                            x=x+_data.valuestep
                        }
                        x=0;
                        while(x<=_data.max.x){
                            var nu=t.insertBefore(wedge.cloneNode(true),h)
                            nu.style.left=(x=x+_data.step-.5)+"px"

                        }
                        var ofst=_data.step//-_data.offset
                        values.forEach(function(it,i){
                            var nu=t.insertBefore(markerval.cloneNode(true),h)
                            nu.innerHTML=widthspan.innerHTML=it+""

                            nu.style.left=((ofst*i) - (widthspan.scrollWidth/2))+"px"
                        })
                        widthspan.parentNode.removeChild(widthspan)

                        api.setValue=_setValue
                        api.getValue=_getValue
                        return api
                    }


                    var _api={
                     render:function(){return _render(_api);},
                     setValue:function(){},getValue:function(){},
                     onchange:function(fn){
                        if(typeof(fn)=="function"&&_listeners.indexOf(fn)==-1){_listeners.push(fn)}
                         return this;
                     }

                 }
                    return _api
                }
            return _slider;
        });