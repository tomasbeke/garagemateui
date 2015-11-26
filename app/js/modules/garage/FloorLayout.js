 function floorLayout(){
    var ths=garageVendorView,panel=this
    if(panel.$content().q(".floor-layout")){return}
    $d("<div><div style='position:absolute;top:0;left:0;width:99.5%;height:99.5%;box-shadow:inset 3px 3px 8px #111,inset -3px -3px 8px #111;background-color:#f3f3f3' class='floor-layout'></div></div>"
    ).appendTo(panel.$content())
    function _init(s){
        if(app.kanvas){return}
        this.state=this.state||{}
        var kanvas=s.createCanvas(panel )
        var _elmenu,_opmenu,offset=kanvas.getUILayer().getBoundingClientRect(),
            _hideMenu=function(){
                _elmenu&&(_elmenu.style.display="none")
                _opmenu&&(_opmenu.style.display="none")
            }
        kanvas.state=kanvas.state||{}
        app.kanvas=kanvas;
        kanvas.on("el-added el-deleted clear",function(ev){      _hideMenu()  })
        kanvas.on("config",function(ev){
            if(ev.data.key=="spaceavailable"){
                ev.el.prop("klass",(ev.data.value?"":"!")+"space-not-available")
            }
        })
        kanvas.on("elementslassoed",function(ev){
            _hideMenu();
            [].concat(ev.data||[]).forEach(function(it){it && it.wrapel&& it.wrapel.classList.add("lassoed-el")})
        })
        kanvas.on("elementsunlassoed",function(ev){//_hideMenu();
            [].concat(ev.data||[]).forEach(function(it){it && it.wrapel&& it.wrapel.classList.remove("lassoed-el")})
        })
        kanvas.on("elementunselected",function(ev){_hideMenu();
            [].concat(ev.data||[]).forEach(function(it){it && it.wrapel&& it.wrapel.classList.remove("active-el")})
        });
        kanvas.on("remove",function(ev){this.removeEl(ev.data||this.state.el);_hideMenu(); })
        kanvas.on("duplicate",function(ev){this.dup(ev.data||this.state.el); })
        var _syncpos=function _syncpos(ev){var el=ev.el
            if(!(el&&el._active)){return false}
            if(!_elmenu){return}
            _elmenu.style.display="";
            var b=el.svg.getBoundingClientRect()   ,b2=_elmenu.getBoundingClientRect()
            _elmenu.style.top=(b.top-(offset.top+(b2.height||18)+5))+"px"
            _elmenu.style.left=(b.left+ b.width-(offset.left+b2.width||70))+"px"
        }
        kanvas.on("afterdraw", $.throttle(_syncpos,{immediate:true,delay:10}))
        kanvas.on("elementselected",function(ev){
            var el=ev.data ,target
            if(!(el && el.wrapel)){return}
            [].forEach.call(this.dom.parentNode.querySelectorAll(".active-el"),function(it){
                it && it.classList.remove("active-el")
            })
            target=el.wrapel
            target.classList.add("active-el") ;


            var _self=this ;
            if(!_elmenu){
                _elmenu=this.getUILayer().appendChild(document.createElement("div"))
                _elmenu.style.cssText="position:absolute;width:70px;font-size:.75em;height:18px;border:1px solid #666;box-shadow:2px 2px 2px #666;border-radius:5px;background-color:#333;cursor:pointer;opacity:.8;color:ivory;padding:0 0 0 5px;z-index:200;"
                _elmenu.innerHTML="Options <span class='mover' style='cursor:move'>: : :</span>";
                _elmenu.className="def-content-style option-list fxtx_25 noselection"

                _opmenu=this.getUILayer().appendChild(document.createElement("ul"))
                $d(_opmenu).css({width:150}).addClass("def-content-style  option-list").html("...");
                $d(_opmenu).css({display:"none"})
                this._eloptions={
                    availability:function(elem){
                        var k="spaceavailable";
                        elem.setConfig(k,!elem.getConfig(k))
                    }
                }
                _elmenu.addEventListener("mousedown",function(ev){
                    var elem=this.getActiveEl()
                    ev.stopPropagation&&ev.stopPropagation();
                    if(!(elem )){return}
                    if(ev.target.classList.contains("mover")){
                        setTimeout(this.dragHandles.mover.activate.bind(this.dragHandles.mover,ev,{el:elem}),10);
                        return
                    } else{
                        var  b=ev.target.getBoundingClientRect()
                        _opmenu.style.top=(b.bottom-offset.top)+"px"
                        _opmenu.style.left=(b.left-offset.left)+"px"
                        _opmenu.style.display=""
                        _opmenu.style.height=(_opmenu._ht||_opmenu.scrollHeight)+"px"

                        _opmenu.classList.add("fxtx_25")
                        var av=elem.getConfig("spaceavailable")
                        _opmenu.innerHTML=["" ,
                            "<li class='icon-thumbs-up' data-key='availability'><span class='glyph "+(av?'good':'danger')+"'>"+(String.fromCharCode(av?10003:10008))+"</span>Mark as "+(av?"un":"")+"available</li>",
                            "<li data-key='remove'>Remove</li>",
                            "<li data-key='copy'>Copy</li>",
                            "<li data-key='cut'>Cut</li>",
                            "<li data-key='duplicate'>Duplicate</li>",
                            ""
                        ].join("") ;


                        setTimeout(function(){
                            if(_opmenu.style.display=="none"){return}
                            _opmenu._ht=(_opmenu.scrollHeight);
                            _opmenu.style.height=_opmenu._ht+"px"
                            function _hndl(ev){if(_hndl._processed){return }
                                var target=ev.target;
                                _opmenu.style.height=".1px"
                                setTimeout(function(){_opmenu.classList.remove("fxtx_25");
                                    _opmenu.style.display="none"},600)
                                _opmenu.removeEventListener("mousedown",_hndl);
                                document.removeEventListener("mousedown",_hndl);
                                if(target && _opmenu.contains(target)&&target.dataset &&target.dataset.key){
                                    var k=target.dataset.key,elem=_self.getActiveEl();
                                    if(_self._eloptions[k]){_self._eloptions[k].call(this,elem)}
                                    _self.fire(k,elem)
                                    //elem._dispatch(k)
                                }
                                _hndl._processed=1
                            }
                            _opmenu.addEventListener("mousedown",_hndl)
                            document.addEventListener("mousedown",_hndl)
                        },100);
                    }
                }.bind(this))
            }

            _syncpos({data:{el:el}});

        })
    }
    ;
    _init(Svg)
}