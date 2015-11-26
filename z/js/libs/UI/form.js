
self.UI||(self.UI={});

    var fieldtemplate="<label class='field-wrap' data-key=$name' for='$name'>" +
            "<span class='ui-ip-label'>$label</span>" +
            "<span class='ipwrap'>" +
                "$iff (iptype is  select ){<select name='$name' style='$ipstyle' class='ui-ip' placeholder='$placeholder'><option> $placeholder </option></select>} " +
                "$else{<input type='$iptype' name='$name' style='$ipstyle' class='ui-ip'  placeholder='$placeholder'/>}" +
            "</span>" +
        "</label>",


        parsedtemplate,parsedtemplate_multiline
var _worker
    var _tmplt=function(field,multiline){
        //if(!parsedtemplate){parsedtemplate=$d.template(fieldtemplate)}
         var t=parsedtemplate||(parsedtemplate=$.template(fieldtemplate))
        if(multiline===true){
            t=parsedtemplate_multiline||(parsedtemplate_multiline=$d.template(fieldtemplate.replace(/input/,"textarea")))
        }
        var name=field.name,label=field.label||titleize(name),iptype=field.hasLookup?"select":(field.iptype||"text"),ipstyle="",placeholder=String(field.placeholder||titleize(label)||"").trim()
        if(field.label =="_"||field.label =="-"){label =""}
        if(!_worker){
            _worker=document.createElement("div")
        }
        _worker.innerHTML=t({name:name,label:label,iptype:iptype,ipstyle:ipstyle,placeholder:placeholder}).trim();
        var el=_worker.removeChild(_worker.firstElementChild)
        //var el1=document.
        if(!label ){$d.addClass(el,"nolabel")}
        return el
     },
        titleize=function(s){ if(!s || s.length<3){return s}
         return String(s).replace(/[_\.]/g," ").replace(/([A-Z])/g," $1").replace(/([a-z])name/g,"$1 Name").replace(/^[a-z]/g,function(a){return a.toUpperCase()}).trim()
    }

    function _addValidation(fldmodel){

    }
     function _parseTemplate(tmpl,meta){
         var tp="z"
         if(typeof(tmpl)!="string"){return}
         tmpl=tmpl.trim().replace(/[\r]/g,"").trim()

         if(/^[\.]+\n/.test(tmpl)){
             var arr=[],widths=[],rows,cols=0,cellwd
                 tmpl=String(tmpl).replace(/\{\{([\w:]+)\}\}/gm,function(a,b){widths.push(1);return "!"+arr.push(b)+"!`"})
                 rows=String(tmpl).replace(/[\r]/mg,"").split(/\n|\[NL\]/gm).map(function(it){return it.trim()}).filter(function(it){return it.trim()})
                 if(/^[\.\s]+$/.test(rows[0])){
                     cols=rows[0].split(/\s*\.\s*/).length-1;rows.shift()
                 }
                 cellwd=Math.round((1/cols )*100)
                 var mm=rows.map(function(r){
                     var l=r.replace(/\s*\.\s*/,"||").split(/\|/),mrkup=[],widths=[],cells=l.length ,cellwd1=Math.round((1/cells)*100);
                     l.forEach(function(cl,i){
                         cl.replace(/!(\d+)!`/g,function(a,b){
                              var i=mrkup.push("<cell!>")-1
                             var idx=Number(b)-1
                             widths[idx]=1
                             var arr1=arr[idx].split(":")
                             if(arr1.length==2){widths[idx]=Number(arr1[1]||1);arr[idx]=arr1[0]}
                             var nm=arr[idx],ff={name:nm},w=widths[idx]||1;;
                             //var f=meta.findField(nm),ffif(!f){return ""}
                             // ff=f.properties.toMap();
                             // ff.iptype=ff.iptype||(ff.name=="id"?"hidden":ff.type=="date"?"date":"text"); //>(span.ui-ip-label{$label}+span.ipwrap>ip[type=$iptype ; name=$name].ui-ip)
                             mrkup[i]='<label class="field-wrap2" style="width:'+(cellwd*w)+'%" data-key="$name" for="$name"></label>'.replace(/\$([\w]+)/g,function(a,b){return ff[b]||b})

                         })

                     });
                     mrkup=mrkup.join("").replace(/(<cell!>)+/g,function(a,b){var r=a.split("!").length ; ;return "<span class='form-row-cell' style='width:"+(r*cellwd1)+"%'></span>"})
                     return mrkup
                     //
                 });


                 return  mm.join("\n")

         }else{
             var optns={
             abbr:{
                 ofw:"field-wrap2",
                 flr:"form-layout-row",fwr:"field-wrap2",
                 lblstyle:"display: block; clear: both; margin: 6px 0px;",
                 iplblstyle:"display: inline-block; width: 120px;",
                 ipstyle:"width: 300px; line-height: 2;"
             }};
             var ftmplt='label.field-wrap2[-key=$name;for=$name]'
             tmpl=String(tmpl).replace(/\{\{([\w:_]+)\}\}/gm,function(a,nm){
                 var w=0
                 if(nm.indexOf(":")>0){var ar=nm.split(":");w=Number(ar[1]);nm=ar[0]}
                 var f=meta.findField(nm),ff
                 if(!f){return ""}
                 if(w){f.ui.width=w; }
                 ff={name: f.name};
                 return ftmplt.replace(/\$([\w_]+)/g,function(a,b){return ff[b]||""})
             })
             rows=String(tmpl).replace(/[\r]/mg,"").split(/\n|\[NL\]/gm).map(function(it){return it.trim()})
                 .filter(function(it){return it.trim()})
                 .map(function(it){return "div.form-layout-row>("+it.trim()+")"})
             if(/^Z!/i.test(tmpl)){
                   var holder=document.createElement("div")
                 rows.map(function(t){
                     $d.template(t.trim(), $.clone(optns)).render( ).appendTo(holder)
                 });
                 return holder
             } else{
             return rows.map (function(t){
                   var flds=t.replace(/\[([\w_]+)\]/g,function(a,b){
                     return "<span class='field-wrap2' data-key='"+b+"'></span>"
                 });
                 return "<div class='form-layout-row'>"+flds+"</div>"
         }).join("");
             }
         }
      }

    var EDITSTATE={NOTMODIFIED:0,MODIFIED:1,RESET:-1} ,initval={}

   var  _form=self.Klass("UI.Form",{
       defaultCriteria:null,
       _fields:{},fieldKlass:null,formDom:null,dom:null,meta:null,layoutTemplate:null,dataHandle:null,
       bindings:null,dataRecord:null, layoutmode:{},  editmode:null,
       errordom:null, panel:null,model:null,ui:{},

       initialize:function  (){
           this.state={NEW:false, EDIT:false,  NOTINVIEW:false}

               if(arguments.length&&!$.isPlain(arguments[0])){
               this.meta=arguments[0];
               this.columnConfig=arguments[1];
               this.layoutTemplate=arguments[2];
               this.dataRecord=arguments[3];
               if(arguments[4]&&$.isPlain(arguments[4])){
                   this.updateProperties(arguments[4])
               }
           }
           this.config=this.config||{}
           if(!this.fieldKlass){this.fieldKlass=Data.UIField}
           this.fieldset=List.from([]).chainable(this.fieldKlass)

           if(this.dom||this.el){
               this.formDom=this.el||this.dom
           }
           var columnConfig=[]
           if(this.formDom){
               $d.qq(this.formDom,"input,textarea,select").forEach(
                   function(ip){
                       columnConfig.push(ip.name|| $.d.domdata(ip,"name")|| $.d.domdata(ip,"key")|| ip.id)
                   }
               )
           } else {
               columnConfig=this.columnConfig
           }
            if(!columnConfig&&this.meta){
                columnConfig=this.meta.items.findAll(function(it){
                        return it && !(it.hidden||it.viewonly==true||(it.ui&&it.ui.hidden ))
                    }).sort(
                        function(a,b){return a.index-b.index
                    }).collect("name")
              // this.columnConfig=this.meta.getNames().filter(function(it){
              //     if(!it||(it.hidden||(it.ui&&it.ui.hidden))){return false};
              // return true}).sort(function(a,b){return a.index-b.index})

           }
           this.columnConfig=columnConfig

           this.bindings=[]
           var hasrecord= this.dataRecord
           if(!this.dataRecord&&this.meta){
               this.dataRecord=this.meta.createRecord()
           }
           this.model=this.model ||$.model((this.meta||{}).name);
           this.make(this.columnConfig)
           this.setupEvents();
           if(hasrecord){
               this.reset(hasrecord.toMap());
           }
       },

       getProvider:function(){
           if(this.dataHandle&&this.dataHandle.store&&this.dataHandle.store.provider){
               return this.dataHandle.store.provider
           }
           if(this.dataRecord&&this.dataRecord.provider){
               return this.dataRecord.provider
           }
           if(this.meta){
               return this.meta.getProvider()
           }
        } ,
       save:function(){
           var  pr=Promise.deferred()
            if(!this.checkValidity()){
                pr.reject({error:"validation failed"})
               return pr
           }
           var m=this.model, provider,store,dataHandle=this.dataHandle,
               rec=this.dataRecord||((dataHandle&&dataHandle.record)?dataHandle.record:null),data ;
           this.each(function(k,f){
               f.sync&&f.sync(m)
           });
           var mods=this.getModValues()

             data=mods //datarec.mod().reduce(function(m,k){m[k]=datarec.get(k);return m},{}),pr,
           provider=this.getProvider()
           data.id= m.id
           if(dataHandle && dataHandle.record && dataHandle.record.id){
               data.id=dataHandle.record.id;
           }
            if(!data.id && rec){
                data.id=rec.id
            }

           if(data.id>0){var id=data.id
               data=this.dataRecord?$.disjoint(data,this.dataRecord.toMap(true) ):data;
               data.id=id;
           } else{
               data=$.compact(this.model.toMap());

           }

           if(rec && rec.meta){
               rec.meta.eachItem(function(c,nm){
                   if(c.defaultValue  && data[c.name]==null){
                       data[c.name]=typeof(c.defaultValue)=="function"?c.defaultValue():c.defaultValue
                   }
               })
           }
            if(this.defaultCriteria){
                $.extend(data,this.defaultCriteria)
            } else if(rec.store && $.isPlain(rec.store.defaultCriteria)){
                $.extend(data,rec.store.defaultCriteria)
            }
           this.fire("beforesave",data);

           if(provider){
               data.tmzoffset=(location.href.indexOf("localhost")>=0 || location.href.indexOf("127.0.0.1")>=0)?0: (new Date()).getTimezoneOffset()/60;
                      if(data.id>0){
                       pr=  provider.update(data)
                       pr.then(function(data){
                            if(dataHandle&&dataHandle.record) {dataHandle.record.update(data)}

                       },function(error){
                       })
                   } else{
                       pr=  provider.insert(data)
                   }
            }
             return pr;
        },
       getModValues:function(nonulls,unwrap){
           var map={},dataHandle=this.dataHandle;
           var props=this.model, rec=this.dataRecord||((dataHandle&&dataHandle.record)?dataHandle.record:null) ;
           if(this.editmode==="new"){
               map=this.model.toMap(true)
               $.each(props.keys(),function(k) {
                   var desc=props.getDescriptor(k),dv=desc.defaultValue
                   if(map[k]==null&&dv!=null){
                       map[k]=dv;
                   }

               })
           } else{
               this.each(function(k,m) {
                   var val=props.getItem(k),desc=props.getDescriptor(k)
                   if(rec && rec[k]!==val){
                       map[k]=val;
                   }
                   if(desc && desc.defaultValue!=null&&(map[k]==null )){
                       map[k]=desc.defaultValue;
                   }
                });
           }
           return map;
       } ,
       getValues:function(nonulls,unwrap){
            return this.model.toMap();
       }  ,
       setValues:function(vals){
           if(!vals){return}
            return this.reset(vals)
       }   ,
        reset:function(data ) {
            this.state.resetMode=true
           // if(!this.model.isPaused()){this.model.pause();}
            this.formDom&&this.formDom.el.reset();
            var largevals=[]
            this.each(function(k,f){
                f.wasvalid=false;  f.ip&&f.ip.val("");
                f.setValue("")
                f.value="";
                f.ip && (f.ip.dataset.val="");
                if(f.actualtype=="clob"||f.actualtype=="blob"){
                    largevals.push(f)
                }
                if(data&&!(k in data)){data[k]=""}
            });
            if(this.errordom){this.errordom.hide()}
          //  $.each(this.formDom.elements,function(it){if($d.hasClass(it,"noform")){return}
          //      $d.trigger(it,"change")})
            this.fire("reset")
           // this.model.reset()//.resume();
             this.state.resetMode=false;
            if(data&&typeof(data)=="object"){
                var model=this.model;
                this.each(function(k,v){
                   if(k in data){
                       model.setItem(k,data[k])
                       v.setValue(data[k])
                   }
                });

            }
            if(largevals.length&&this.editmode!="new"){
                var toget=[]
               if(data) {
                   toget=largevals.filter(function(it){return !data[it.name]||String(data[it.name]).indexOf("link:")==0})
               }
                if(toget.length&&data.id&&this.meta){  var nm=this.meta.name,model=this.model,p=this.getProvider()
                    toget.forEach(function(f){
                        p.getValue(data.id, f.name).then(function(a){
                            model[f.name]=a
                        })
                    })
                }
            }
              return this;
         },
        each:function(fn) { for(var k in this._fields){fn(k,this._fields[k])}   },
       addComponent:function(nm,specs){  },
       findIp:function(name){
           return this.formDom?this.formDom.q("input[data-key='"+name+"'],textarea[data-key='"+name+"'],select[data-key='"+name+"'],input[name='"+name+"'],textarea[name='"+name+"'],select[name='"+name+"']")  :null
       },
       getField:function(name){
           return this._fields[name]||this._fields[String(name).toLowerCase()]
       },
       getIpList:function(){
            return this.formDom?this.formDom.qq("input[data-key],textarea[data-key],select[data-key='"+name+"']")  :[]
       },
       setupEvents:function( ){
           var $form=this
           for(var i=0,l=$.keys(this._fields),ln=l.length;i<ln;i++){
               var inst=    this._fields[l[i]],nm=l[i]
               var model=inst,ip=inst.ip
              $d.on(ip,"change",function(ev){
                   if($form.state.resetMode){return}
                   var inpt=ev.target,v=$d.val(inpt);
                     $form.checkValidity(inpt,v)
                    $form.model[inpt.name]=v
                    return;
               });

       }
       },
       addField:function(nm,specs){
         if(typeof(nm)!="string"){return}
        var  fld=this.meta.findField(nm);
         if(!fld||(fld.hidden||(fld.ui&&fld.ui.hidden))){return}
        var inst=fld.getUIInstance()
           inst.statics||(inst.statics={});
           inst.statics.fieldTemplate=_tmplt
           inst.statics.notifyValidationError=  function(rec){ }

           return inst.build(this,specs)

    },
       checkValidity:function(fld,val){
          /* $.findAll(this.formDom.elements,function(it){if($d.hasClass(it,"noform")){return}
               return !it.checkValidity()}).forEach(
               function(it){if($d.hasClass(it,"noform")){return}
                   $d.trigger(it,"invalid")}
           )*/
           return true
       },
       makeField:function(meta) { },
        make:function(allspecs) {
            var fldmap={}  ,ths=this,template,layout=this.layoutTemplate
            template=layout?_parseTemplate(layout,this.meta):null

            this.dom=document.createDocumentFragment();
             var form=$d(this.dom.appendChild(document.createElement("form")));
            this.errordom=$d("Z:div.fxtx_5[pos:a;top:99%;right:0;font-size:.8em;height:1px;overflow:hidden;fontSize:.7em;color:maroon]{A valid value is required.}")
            this.errordom=form.append(this.errordom).css({opacity:0})
            form.style.cssText='padding:4px;position:relative;display:block;overflow:auto;'
             if(this.layoutmode.klass){
                form.addClass(this.layoutmode.klass)
            }
            form.el.onsubmit=function(ev){
                var activeEl=document.activeElement
                if(!activeEl || activeEl==document.body){activeEl=[].slice.call(document.querySelectorAll(":hover")).pop()}
                if(!activeEl || (activeEl.type!="image")) {
                    if (this.checkValidity()) {
                        this.save()
                        return
                    }
                }
                ev.stopPropagation&&ev.stopPropagation();
                   // ev.preventDefault&&ev.preventDefault();
                    return false;
            }.bind(this)
            this.formDom=form
            if(template){
               if(template.nodeType){
                   var copynodes=function copynodes(src,trgt){
                       while(src.firstChild){
                           var to,from=src.removeChild(src.firstChild)
                           if(from&&from.cloneNode){
                                to=trgt.appendChild(from.cloneNode(false) )
                                copynodes(from,to)
                           }
                       }
                   }
                   if(template.nodeType==1){
                       copynodes(template.el||template,form.el.el||form.el )
                    }
                   else{
                       var nu=form.appendChild(template )
                    }
               } else{form.html(String(template));}
            }
            var isarr=$.isArray(allspecs)
                $.each(allspecs,function(v,k){var nm=(k&&typeof(k)=="string")?k:(typeof(v)=="string"?v:v.name)
                     //||this.layoutmode.labelwidth
                    var inst=this.addField(nm,typeof(v)=="string"?{}:v);
                    if(inst){
                        this._fields[nm]=inst
                    }
                ;
            },this);
            if(this.ui.labelwidth){
                $d.css.addRule("#"+this.formDom.id+" .ui-ip-label","width:"+this.ui.labelwidth+"px")
            }
            if(this.ui.labeltop){
                this.formDom.addClass("label-top")
            }


            return this;
        },

       adjustFieldWidths:function() {
           if(this._fields && this.formDom && !this.config.noadjustwidth){
               var dom=$d(this.formDom),inner=dom.innerWidth()-20;
               var lblwidth=dom.st(".ui-ip-label").width().max()||0
               var av= inner-lblwidth
               if(inner<100||!lblwidth||av < 150){return}
               $.values(this._fields).filter(function(f){return (f && f.ip && !f.width && !f.inline)}).forEach(
                   function(f){ f.ip.el.style.width=av+"px"  },this
               )
           }
       },
         appendTo:function(cntnr0){  var cntnr=cntnr0
             if(!cntnr){return}

             if(cntnr&&(cntnr.contentWrap )){if(!this.panel){this.panel=cntnr}
                 cntnr=cntnr.contentWrap||cntnr.el}
             var cntnrel=$d(cntnr);
            if(this._fields && this.dom){
                var _setDims=function(e){
                    if(cntnrel.is("._hidden")||(cntnrel.parentNode && cntnrel.parentNode.classList.contains("_hidden"))){return}
                    var par=$d(this.form).parent()
                     var outer= par.innerHeight()
                    if(outer){
                        this.form.style.height=outer+"px";
                            //(cntnrel.clientHeight-(this.form.offsetTop+5))+"px";
                    }
                    this.adjustFieldWidths()
                }.bind(this)
                $d(cntnrel).insert(this.dom);
                if(cntnr.isComponent){
                    cntnr.on("afterlayout",function(){
                        _setDims()
                    })
                } else{
                    cntnrel.on("resize",_setDims)
                }
                this.form=$d( $d.qq(cntnrel,"form").pop() );
                _setDims();
                setTimeout(_setDims,500)
               // cntnrel.watchDimensions();
                cntnrel.on("resize",_setDims)
              }
            return this
        }
 });
    _form.defaultFieldTemplate=_tmplt



    _form.models={
        datalist:{
            render:function(model,form,list){
                var PopupView=$.require("PopupView")
                var cb=function(l){
                    if(model.ip && /SELECT/i.test(model.ip.tagName)){
                        $d.addOptions(model.ip, l.list||l)
                        $d.val(model.ip,form.model[model.name])

                    } else{
                        model._lkuplist= PopupView.lookupList({anchor:model.ip, height:200,list:l,  addEvent:true,nonative:true,bottomAligned:false,
                                ascombo:model.ui.combo
                            },function(k,lbl){
                                form.model[model.name]=k
                                //this.fire("uivaluechange",{name:model.name,value:k,newValue:k,valueLabel:lbl})
                            }.bind(model)
                        )
                    }

                }
                if($.isArray(list)){cb(list)}
                else if(!model.readonly&&model.hasLookup ){
                    if(form.meta&&model.primaryEntity){

                        app.getEntity(model.primaryEntity).then(
                            function(ent){
                                 if(ent.findField(form.meta.name+"_id")){

                                     if(form.model["id"]){
                                         form.model.watch("id",function(r){
                                             if(r.value){
                                                 model.getDynaLookupList(r.value  ,cb)
                                             }
                                         })}     else{
                                         model.getDynaLookupList( form.model["id"]   ,cb)
                                    }} else{
                                     model.getLookupList().then( cb);
                                 }

                            },
                            function(ent){
                                model.getLookupList().then( cb);
                            }
                        )
                    } else{model.getLookupList().then( cb);}


                    /*$d(model.ip).on("mousedown",function(evt){
                         this.getLookupList().then(
                         function(l){
                             this.listvw.layout().show(l,evt.target);}.bind(this));
                        }.bind(model))*/
                }
                if(model.ip && /SELECT/i.test(model.ip.tagName)){
                    model.setValue=function(a){
                        if(this.name=="operator_id"){
                            this.__value=a;

                        }
                        if(this.ip){
                            $d.val(this.ip.el,a+"");
                        }
                    }
                }
                if(model.ip){
                    if(model.ui.combo){model.ip.type="search";}
                    else if(model.ip && !/SELECT/i.test(model.ip.tagName)){ model.ip.readOnly=true}
                }

            }
        },
        hidden:{
            name:"id",
            render:function(model,form){
                model.hidden=true;
                 model.ip.type="hidden"
            }
        },
        color:{ "type":"color",
           render:function(model,form){
               if(!model.ip || model.ip.data("_colorpicker")){return}
               model.ip.prop("readonly",true)
               model.setValue=function(a){
                    if(String(a).length==6 && /^[A-F0-9]+$/.test(a)){a="#"+a}
                     model.ip.css("backgroundColor",a)
               }
               model.hasPopup=true


               $.require("ColorPicker",function(ColorPicker){
                   function onselect(color,nohide) {
                       var val = color.getColorName()
                       if (!val){
                           val = String(color.toHex()).replace(/^\#/, "")
                        }
                        form.model[model.name]=val
                        if(!nohide){_picker.hide()  }
                   }
                   var _picker=new ColorPicker(onselect,onselect)
                   model.ip && model.ip.on("mousedown",function(evt){
                     _picker.activate(model.ip)

                   })
                   model.ip && model.ip.data("_colorpicker",_picker)
               })
           }
        } ,
        date:{"type":"date",
            render:function(model,form){
                 if(model.asIP){

                }
                model.hasPopup=true
                var PopupView=$.require("PopupView")
                if(model.actualtype=="time"){
                     var l=List.create().fill(0,0,24).collect(function(l,i){var v= i,s=i==0?"12":((v>12?(v-12):v)+""),ap=(v>=12?"pm":"am") ;return [s+":00"+ap,s+":15"+ap,s+":30"+ap,s+":45"+ap]}).flatten();
                    model._lkuplist= PopupView.lookupList(l.toArray(), {
                            anchor: model.ip, height: 200,
                            callback: function (rec) {
                                form.model[model.name] = $.typeInfo.TIME.coerce(rec.id)
                                //this.fire("uivaluechange",{name:model.name,value:k,newValue:k,valueLabel:lbl})
                            }.bind(model)
                        }
                    );
                    model.ip &&  model.ip.on("mousedown",function(evt){
                        model._lkuplist.show();
                    });
                    return
                };
                $.require("UI.Calendar",function(cal){
                    var calmodel=null;
                    model.ip &&  model.ip.on("mousedown",function(evt){
                         var ip=evt.target;
                        if(!calmodel){
                            calmodel=cal(null,{ ip:ip,
                                onselect:function(k,lbl){
                                    form.model[model.name]=k
                                    //model.fire("uivaluechange",{name:model.name,value:k,newValue:k,valueLabel:lbl})
                                    calmodel.view.hide()
                                }
                            });
                         //    model.ui.calvw.el.css({border:"1px solid #666"})
                         //   model.ui.calvw.setConfig("anchor",ip).layout().show();
                      }
                      calmodel.view&&calmodel.view.show();
                      calmodel.render( model.val||new Date()   );
                });
                    model.ip &&  model.ip.prop("readonly",true)
                });
            }
        },
        "radioset":{"type":"radioset",
            init:function(model,form){

            } ,render:function(model,form){
                if(model.ip){model.ip.el.type="text"

                    var el=$d.template("label.toggle-switch>span.aa[-on:yes;-off=no]>div.bb{.}+strong").render().el
                    el.setAttribute("for",model.ip.id)
                    el.setAttribute("forLabel",model.ip.id)
                    el.insertBefore(model.ip.el,el.firstChild)
                    var wrap=model.wrapel?model.wrapel.q(".ipwrap"):null
                    if(!wrap && !$d.is(model.ip,"input")){wrap=model.ip}
                    wrap&&wrap.append(el);
                 }
            }
        },
        "boolean":{"type":"boolean",
            init:function(model){

            } ,render:function(model,form){
                if(model.ip){
                    if(!$d.is(model.ip,"input")){
                        return _form.models.datalist.render(model,form,[{label:"Yes",id:1},{label:"No",id:0}])
                    }

                    model.ip.el.type="checkbox"
                    var el=$d.template("div.toggle-switch>span.aa[-on:yes;-off=no]>div.bb{.}+strong").render().el
                    el.style.position="relative"
                    $d(el).on("click",function(){
                        if($d.is(model.ip,'input[type="checkbox"]')) {
                            model.ip.checked = !model.ip.checked
                            form.model[model.name] = model.ip.checked ? 1 : 0
                        }  else  {
                            form.model[model.name]= form.model[model.name]?0:1
                        }
                     });
                    //el.setAttribute("for",model.ip.id)
                    //el.setAttribute("forLabel",model.ip.id)
                     el.insertBefore(model.ip.el,el.firstChild)
                    var wrap=model.wrapel?model.wrapel.q(".ipwrap"):null
                    if($d.isFormInput(model.ip )){
                        wrap.append(el);
                    }

                  }
            }
        },
        rte:{
            init:function(){
             } ,
            render:function(model,form){
                var _pending
                $.require("rte", function(r){
                     $d.onAttach (model.ip, function(){
                         model.R=self.rte.setup(model.ip)
                         if(_pending){
                             model.R.setContent(_pending)
                             _pending=null
                         }
                     })
                 })

                model.sync=function(rec){if(!this.R){return}
                    rec[this.name]= (this.R.getContent()||"").trim()
                }
                model.setValue=function(a){
                    if(this.R){
                        this.R.setContent(String(a ))
                    } else{_pending=String(a )}


                }
            }
        } ,
        rtf:{
           init:function(){

           } ,
            render:function(model,form){
                function _setup(wysihtml5){
                    var r=$d.template("<ul class='wyshtml-toolbar' >$each{<li data-wysihtml5-command='$name'  class='command' title='$title'>$label</li>}</ul>")
                    function _cap(a){return a.charAt(0).toUpperCase()+ a.substr(1)}
                    var data="bold,createLink,fontSize,foreColor,formatBlock,formatInline,insertHTML,insertImage,insertLineBreak,insertOrderedList,insertUnorderedList,italic,justifyCenter,justifyLeft,justifyRight,underline".split(/\,/).map(function(a){return {name:a,title:a,label:_cap(a)}})
                    //var toolbar=$d("div").html(r(data))
                    var toolbar= model.ip.before(r(data))
                    new wysihtml5.Editor(model.ip.el, { // Could also pass a DOM node instead of an ID
                        name:                 model.name,// Give the editor a name, the name will also be set as class name on the iframe and on the iframe's body
                        style:                true, // Whether the editor should look like the textarea (by adopting styles)
                          toolbar:              toolbar.el,// Id of the toolbar element or DOM node, pass false value if you don't want any toolbar logic
                        autoLink:             true,// Whether urls, entered by the user should automatically become clickable-links
                        // Object which includes parser rules to apply when html gets inserted via copy & paste
                        // See parser_rules/*.js for examples
                        parserRules:          { tags: { br: {}, span: {}, div: {}, p: {} }, classes: {} },
                        parser:               wysihtml5.dom.parse, // Parser method to use when the user inserts content via copy & paste
                        composerClassName:    "wysihtml5-editor",// Class name which should be set on the contentEditable element in the created sandbox iframe, can be styled via the 'stylesheets' option
                        bodyClassName:        "wysihtml5-supported",// Class name to add to the body when the wysihtml5 editor is supported
                        useLineBreaks:        true,// By default wysihtml5 will insert a <br> for line breaks, set this to false to use <p>
                        stylesheets:          [], // Array (or single string) of stylesheet urls to be loaded in the editor's iframe
                        //  placeholderText:      undef,// Placeholder text to use, defaults to the placeholder attribute on the textarea element
                        supportTouchDevices:  true,// Whether the rich text editor should be rendered on touch devices (wysihtml5 >= 0.3.0 comes with basic support for iOS 5)
                        cleanUp:              true// Whether senseless <span> elements (empty or without attributes) should be removed/replaced with their content
                    });
                }
                $.require("wysihtml5",function(wysihtml5){
                 $d.onAttach(model.ip,function(){_setup(wysihtml5)})

              })


            }
        } ,
        "img":{"type":"image", defaultValue:location.href.split("/").slice(0,4).join("/")+"/theme/img/noimg.png",
        init:function(model,form){
            if(!model.ip){   return}
                model.ip.type="image"
                model.ip.addEventListener("mousedown",function(ev){
                    ev.preventDefault&&ev.preventDefault()
                  //  return false;
                    var bar,  updlbl=model.wrapel,
                        uploadbutton=this ,img=this,wd ; model.hasPopup=true
                    $.require(["$File"],function(){
                    model._img=img;
                    var ip=null,b=updlbl.el.getBoundingClientRect(),mousepos=$d.util.mousePos  ,
                    d=document.createElement("div") ,iptemplate
                    d.innerHTML="<input class='noform' type='image' style='width:5px;height:5px;background-color:transparent;border:none;z-index:20;position: absolute;opacity:.1' name='upload-file' id='upload-file' type='file'/>",
                        iptemplate= d.removeChild(d.firstChild) ;
                    updlbl.on("mousemove",function(ev){
                        if(!wd){wd=(uploadbutton.offsetWidth+5);updlbl.style.width=wd+"px";
                            b=updlbl.el.getBoundingClientRect();
                        }
                        if(!ip || !updlbl.querySelector("input")){
                            ip=updlbl.insertBefore(iptemplate.cloneNode(true),uploadbutton.el)
                            $File.setupIp(ip,{type:'image',reader:"dataURL",
                                complete:function(pr){
                                    form.model[model.name]= this.result
                                //    model.fire("uivaluechange",{name:model.name,value:this.result,newValue:this.result})
                                    if(ip){updlbl.removeChild(ip);ip=null;}
                                }})
                        }
                        if(b.top==0){b=updlbl.el.getBoundingClientRect(); }
                        var pos=mousepos(ev )
                        pos.x=(pos.x- (b.left+3));pos.y=(pos.y- (b.top+3));
                        if(pos.y<=0 || pos.x<=0 || pos.y> b.height || pos.x>wd){return}
                        ip.style.top=pos.y+"px";ip.style.left=pos.x+"px"
                    })
                })
                    return false;
            });
            /*function _setVal(a){if(a==null){return}
                 var v=typeof(a)=="string"?a:a.value
                var val=String(v)
                if(val.indexOf("data:")!=0&&val.indexOf("//")==-1){val="//"+val}
                this.ip.setAttribute("src", val)
                this.ip.setAttribute("value", val)
                this.ip.value=val
                this.ip.dataset.val=val
            }*/


         //   model.on("value",_setVal)
            model.setValue=function(a){
                if(a){
                    if(this.reader){
                        a=this.reader(a)
                    }
                }
                var val=String(a )
                if(val.indexOf("data:")!=0&&val.indexOf("//")==-1){val="//"+val}
                this.ip.setAttribute("src", val)
             }
         }

        },
        "attachment": (function(){
             var attachmentsStore
            function _setup(model, form,store){
                if(!app.attachmentsStore) {app.attachmentsStore=store;}
                //$d.hide(model.ip)

                var bar, updlbl=model.wrapel.q(".ipwrap"),    wd;
                model.hasPopup=true
                var ip=null,iptemplate, b=updlbl.el.getBoundingClientRect (), mousepos=$d.util.mousePos  , $file, d=document.createElement ("div") , iptemplate
                d.innerHTML="<input class='noform ipfileworker' style='width:5px;height:5px;background-color:transparent;border:none;z-index:20;position: absolute;opacity:.1' name='upload-file' id='upload-file' type='file'/>",
                    iptemplate=d.removeChild (d.firstChild);
                $.require(["$File"], function(){
                    $file=$File
                })
                function mv(ev){
                    var  uploadbutton=model.ip ;
                    if(!wd) {
                        wd=(uploadbutton.offsetWidth + 5);
                        if($d.css(updlbl,"display")!="block") {
                            updlbl.style.width=wd + "px";
                        }
                        b=updlbl.el.getBoundingClientRect ();
                    }
                    if( !updlbl.querySelector (".ipfileworker")) {
                        ip=updlbl.el.appendChild (iptemplate.cloneNode (true))
                         $File.setupIp (ip, {type: 'doc', reader: "dataURL",//dataURL
                             progress: function(n){
                                 if(n.percent<=1){model.ip.val("");}
                                 model.ip.placeholder="loading .."+ n.percent+"%"
                             },
                             complete: function(result){
                                updlbl.off("mousemove", mv);
                                 model.ip.placeholder="uploading .."
                                var info=this.info,type=info.type,mtype=info.type
                                 store.provider.insert({nm: info.name, isbase64:1,filename: info.name, sz: info.sz, mimetype: info.mimetype,
                                    lastts: +info.lastmodified,type: info.type, data: result
                                }).then(
                                    function(d){
                                        form.model[model.name]=d.id
                                          updlbl.on("mousemove", mv);
                                    }
                                )
                                // model.fire("uivaluechange",{name:model.name,value:this.result,newValue:this.result})
                                if(ip) {
                                    updlbl.removeChild (ip);
                                    ip=null;
                                }
                            }})

                    }
                    //if(b.top == 0) {
                        b=updlbl.el.getBoundingClientRect ();
                    //}
                    var pos=mousepos (ev)
                    pos.x=(pos.x - (b.left + 3));
                    pos.y=(pos.y - (b.top + 3));
                    if(pos.y<=0||pos.x<=0||pos.y>b.height||pos.x>wd) {
                        return
                    }
                    ip.style.top=pos.y + "px";
                    ip.style.left=pos.x + "px"
                }
                updlbl.on ("mousemove", mv);
                if( model.ip){
                    if(!model.ip.placeholder){model.ip.placeholder="Click to select a file"}
                    model.ip.type="text"
                    $d.prop (model.ip, "readonly", true)
                }



             }
            return {"type": "attachment",
                init: function(model, form){
                    if(!model.ip) {
                        return
                    }
                    if(!attachmentsStore) {
                        app.getEntity ("attachments").then (function(a){
                            attachmentsStore=a.createStore ()
                            _setup (model, form, attachmentsStore)
                        })
                    }else {
                        _setup (model, form, attachmentsStore)
                    }

                }

            }
        })()
         ,
        "file":{"type":"file",
            init:function(model,form){
                if(!model.ip){   return}
                //$d.hide(model.ip)
                var bar,  updlbl=model.wrapel,
                    uploadbutton=this ,img=this,wd ; model.hasPopup=true
                var ip=null,b=updlbl.el.getBoundingClientRect(),mousepos=$d.util.mousePos  ,
                    $file,d=document.createElement("div") ,iptemplate
                d.innerHTML="<input class='noform ipfileworker' style='width:5px;height:5px;background-color:transparent;border:none;z-index:20;position: absolute;opacity:.1' name='upload-file' id='upload-file' type='file'/>",
                    iptemplate= d.removeChild(d.firstChild) ;
                $.require(["$File"],function(){
                    $file=$File
                })
                updlbl.on("mousemove",function(ev){
                    if(!wd){wd=(uploadbutton.offsetWidth+5);updlbl.style.width=wd+"px";
                        b=updlbl.el.getBoundingClientRect();
                    }
                    if(!ip || !updlbl.querySelector("input")){
                        ip=updlbl.insertBefore(iptemplate.cloneNode(true),uploadbutton.el)
                        $File.setupIp(ip,{type:'doc',reader:"dataURL",
                            complete:function(result){
                                var info=this.info
                                form.model[model.name]= JSON.stringify({name:info.name,sz:info.sz,type:info.type,data:result})
                                //    model.fire("uivaluechange",{name:model.name,value:this.result,newValue:this.result})
                                if(ip){updlbl.removeChild(ip);ip=null;}
                            }})
                    }
                    if(b.top==0){b=updlbl.el.getBoundingClientRect(); }
                    var pos=mousepos(ev )
                    pos.x=(pos.x- (b.left+3));pos.y=(pos.y- (b.top+3));
                    if(pos.y<=0 || pos.x<=0 || pos.y> b.height || pos.x>wd){return}
                    ip.style.top=pos.y+"px";ip.style.left=pos.x+"px"
                })
                if(model.ip){
                    model.ip.type="text"
                    $d.prop(model.ip,"readonly",true)
                    model.setValue=function(a){
                        if(!a){return this.ip.prop("value", "")}

                        var json=$.isJsonString(a)
                        if(json){
                            this.ip.prop("value", json.name||json.filename)
                        }else{ this.ip.prop("value", String(a ))
                        }
                    }
                }

            }

        },
        pic:{"name":"pic","type":"string", defaultValue:location.href.split("/").slice(0,4).join("/")+"/theme/img/noimg.png",
            reader:{read:function(val0){var val=null;
                if(typeof(val0)=="string"){
                    val=String(val0).replace(/^["\\]|["\\]$/g,"");
                    if(val.indexOf("data")!=0){
                        val=null
                    }

                }
                return val
            }
            },
            render:function(mdl,form){
                var src="",wd=mdl.ui.width?Math.max(100,mdl.ui.width):200    ,DEFAULTIMG=app?(app.contextPath+"theme/img/pictures.png"):"",
                ht=mdl.ui.height?Math.max(100,mdl.ui.height):(wd*.75)
                mdl.hasPopup=true
                $d(mdl.ip).insert("" +
                    "<span class=' ' style='position:relative;  display: inline-block;'>" +
                    "<img data-key='snap' style='width:"+wd+"px;height:"+ht+"px;' src='"+src+"'/>" +
                    "<div  class='pic-bar' style='text-align: center'>" +
                    "   <button class='ui-button small smaller' style='margin:0' type='button' data-key='snap'>Snap</button>" +
                    "   <span class='for-upload-file' style='position:relative;overflow:hidden;margin-left:-8px'>" +
                    "    <button  class='ui-button small smaller'type='button' data-key='upload' style='z-index:1;border-top-left-radius:0;border-bottom-left-radius:0;'>upload</button>" +
                    "   </span>" +
                    "</div>" +
                    "</span>"
                    ,"before") ;
                mdl.ip.type="hidden" ;
                if(!mdl.label&&mdl.labelel) {
                    mdl.labelel.hide();
                } else{
                         $.timer.when(function( ){ return mdl.wrapel.height() > 50  },
                            function( ){
                                var ht=mdl.wrapel.height();
                                if(ht&&ht>100) {
                                    mdl.labelel&&mdl.labelel.css ({lineHeight: ht+"px"})
                                }
                            },
                            {dur:200,maxduration:5})
                 }
                //mdl.wrap.querySelector(".field-label").style.verticalAlign="top";

                var d=document.createElement("div") ,iptemplate
                d.innerHTML="<input style='width:5px;height:5px;background-color:transparent;border:none;z-index:20;position: absolute;opacity:.1' name='upload-file' id='upload-file' type='file'/>",
                    iptemplate= d.removeChild(d.firstChild);d=null;
                mdl.setValue=function(rec){
                    if(!rec||rec=="null"){rec="";$d.addClass(mdl._img,"default-picture")}
                    else{$d.removeClass(mdl._img,"default-picture")}
                    mdl._img.el.src=rec ;
                    mdl._img.dataset.key=''
                }
                mdl.onUpdate=function(dataurl){
                    form.model[mdl.name]= dataurl
                  //  this.fire("uivaluechange",{name:this.name,value:dataurl,newValue:dataurl})
                }

                /*mdl.on("value",function(rec){
                    this._img.el.src=rec.value;
                    this._img.dataset.key=''
                });*/
                var bar=$d(mdl.wrapel).q(".pic-bar"),updlbl=bar.q(".for-upload-file"),
                    uploadbutton=$d.q(updlbl,"button") ,img=$d.q(mdl.wrapel,"img"),wd ;
                mdl._img=img;


                var ip=null,b=updlbl.el.getBoundingClientRect(),mousepos=$d.util.mousePos

                updlbl.on("mousemove",function(ev){
                    if(!ip){return}
                    if(!wd){wd=(uploadbutton.offsetWidth+5);updlbl.style.width=wd+"px";
                        b=updlbl.el.getBoundingClientRect();
                    }

                    if(b.top==0){b=updlbl.el.getBoundingClientRect(); }
                    var pos=mousepos(ev )
                    pos.x=(pos.x- (b.left+3));pos.y=(pos.y- (b.top+3));
                    if(pos.y<=0 || pos.x<=0 || pos.y> b.height || pos.x>wd){return}

                    ip.style.top=pos.y+"px";ip.style.left=pos.x+"px"
                });
                var snapshot
                function _snap(ev){
                    if(!($d.is(ev.target,"button")||$d.is(ev.target,"img"))){return}
                    var el=$d(ev.target)
                    if(el.dataset.key=="snap"&&UI.snapshot){
                        var img=$d.q(this.parentNode,"img"),b=img.getBoundingClientRect()

                         snapshot=UI.snapshot(null,{width:Math.max(180, b.width),top: b.top  ,left: b.left-10 ,callback:function(resultimg,canvas,cntnr){
                            if(resultimg){img.el.src=resultimg.src
                                mdl.onUpdate( resultimg.src    )
                            }
                        }})
                        if(snapshot&&snapshot.moveTo&&form&&form.panel){form.panel.on("afterlayout",  function(){
                            if(mdl._img){
                                setTimeout(function(){
                                    var b=$d.bounds(mdl._img);
                                    snapshot.moveTo(b.left, b.top)
                                },100)
                            }
                        })}
                    }
                 }

                $.require(["UI.snapshot","$File"],function(snapshot,$File){
                    var bar=$d(mdl.wrapel).q(".pic-bar")
                    if(!ip || !updlbl.querySelector("input")){
                        ip=updlbl.insertBefore(iptemplate.cloneNode(true),uploadbutton)
                        $File.setupIp(ip,{type:'image',reader:"dataURL",
                            complete:function(pr){
                                mdl.onUpdate(this.result)
                                if(ip){updlbl.removeChild(ip);ip=null;}
                            }})
                    }

                    bar.on("click",_snap);
                });


            }
        }

    }
UI.Form=_form;



module.exports=UI.Form