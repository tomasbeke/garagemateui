

    /*
     fitLayout
     pageSize
     resizable
     colresizable
     sortable
     highlightcolumn
     */
    var         //gridLayout="FIT",
        cntntwrapLayout  = (
                "<div class='grid-frame-header'>" +
                    "<div class='grid-info'><span class='grid-tools grid-title'></span><span class='grid-tools page-info'></span><span class='grid-tools columns-info'></span><span class='grid-tools grid-edit-menu'></span><span class='grid-tools grid-layout-menu'></span><span class='grid-tools'></span></div>" +
                    "<div class='ui-button-bar   ui-button-bar-right clear-fix'></div>" +
                "</div>" +
                "<div class='gridwrap'>" +
                    "$content" +
                "</div>" +
                "<div class='grid-footer'>" +
                    "<span class='msg'></span>" +
                "</div>"
            ),
        cntntLayout  = (
            "<table class='grid-tab'>" +
                "<colgroup>$colset</colgroup>" +
                "<caption>$caption</caption>" +
                "<thead class='grid-header'>" +
                "<tr class='grid-row'>$headercells</tr>" +
                "</thead>" +
                "<tbody class='grid-rowset'></tbody>" +
                "</table>"
            ),
        blockcntntLayout  = (
            "<div class='grid-tab'>" +
                "<span>$colset</span>" +
                "<caption>$caption</caption>" +
                "<div class='grid-rowset'></div>" +
                "</div>"
            ),
        landmarks={
                cols:"title,item,top,stub,img,lat,lng,tpe,thumb".split(/\,/)  ,
            url:"js/nyclandmarks.json"
        },
        pagerparts={
            firstpage:"<button data-key='1' type='button' title='first page'>&lt;&lt;</button>",
            lastpage:"<button data-key='-1' type='button' title='last page'>&gt;&gt;</button>",
            priorpage:"<button data-key='previous' type='button' title='previous page'>&lt;</button>",
            nextpage:"<button data-key='next' type='button' title='next page'>&gt;</button>",
            pageno:"<input value='$pageno' style='width:25px;'/>",
           loadmsg:"<img class='fxtx2 loadericon' style='float:left;visibility:hidden;margin-left:20px;margin-right:20px;height:32px;width:32px;' src='theme/img/bx_loader.gif'/>" +
                "<span class='fxtx2 loadmsg' style='margin-left:20px;float:left;min-width:20px;width:auto;'></span>"},
        pagertemplate  = (
            "<div class='grid-pager'>" +
                "$firstpage $priorpage $pageno $nextpage $lastpage of $totalpages ,rows $startrow to $endrow of $totalrows $loadmsg".split(/\s+/).map(function(it){
                     var ky=it.replace(/\$/,"");
                    return ("<span  class='grid-pager-text grid-pager-text-"+ky+"'>"+(it=="$"?"":it)+"</span>")
                        .replace(/\$([\w]+)/g,function(a,b){return pagerparts[b]||a})
                }).join("&nbsp;")+
                //replace(/\$([\w]+)/g,"<span class='grid-pager-text grid-pager-text-$1'>$1</span>") +
                "</div>"

            );

    var rowht=23 ,Core,Dom ,_gridoverlay,hdrwdoffst= 2,_arrayEach=function(clctn,fn){
        [].forEach.call(clctn,fn);
    },ZINDEX={BUTTONBAR:2,FILTER:1,FREEZEOVERLAY:1,FREEZEOVERLAYHDR:1,FREEZEBODY:1,FOOTERBAR:2,HDRCLONE:1,FRAMEHDR:1,GRIDHEADER:1   }
    function getOverlay(trgt){
        var rbnd=trgt.getBoundingClientRect();
        if(!_gridoverlay){
            _gridoverlay=document.body.appendChild(document.createElement("div"));
            _gridoverlay.style.cssText="background-color:#ccc;position:absolute;display:block;z-index:21;opacity:.1;left:"+rbnd.left+"px;top:"+rbnd.top+"px;height:"+rbnd.height+"px;width:"+rbnd.width+"px;"
        }
        _gridoverlay.style.cssText+="left:"+rbnd.left+"px;top:"+rbnd.top+"px;height:"+rbnd.height+"px;width:"+rbnd.width+"px;"
        return _gridoverlay;
    }
    function _rowModel(grid){
        var rowModelKlass=null,_grid=grid
        function _resolve(val){
            var id,ctx={}
            if(val) {
                if (val.__isgridcontext) {
                    ctx = val
                }
                else {
                    if (typeof(val)=="number") {ctx.id=val }
                    else if (!val.nodeType && val.id) {
                        ctx.id=val.id

                    }else if (val.nodeType ) {
                        ctx.row  = $d.selfOrUp(val,".grid-row");
                     }
                    if(!ctx.id&&ctx.record) {
                        ctx.id=ctx.record.id
                    }
                    if(ctx.id&&!ctx.row) {
                        ctx.row = _grid.domcomponents.gridWrap.q(".grid-row[data-id='" + ctx.id + "']");
                    }
                    if(!ctx.id&&ctx.row) {
                        ctx.id=ctx.row.domdata("id")
                    }
                    if(ctx.id&&!ctx.record) {
                        ctx.record=_grid.store.getList(true).findById(ctx.id)
                    }
                }
            }
            return ctx
        }
        return function rowModel(rw){
            if(!rowModelKlass){
                rowModelKlass=$.model.make({
                        record:null,el:null,
                        row:{get:function(){return this.el&&this.el.selfOrUp(".grid-row")}},
                        table:{get:function(){return this.el&&this.el.up(".grid-tab")}},
                        id:{get:function(){return this.record&&this.record.id}},
                        grid:null,
                        meta:{get:function(){return this.record&&this.record.meta }}
                    },{
                    findDomRow:function(id){
                        if(!id){return null}
                        if (typeof(id)=="number") {
                            return this.grid.domcomponents.gridWrap.q(".grid-row[data-id='" + id + "']");
                        }
                        else if (id.nodeType ) {
                            return  $d.selfOrup(id,".grid-row");
                        }
                    },
                    init:function(ctx){
                        this.grid=_grid
                        //if(!dom){return}
                        if(!(ctx&&ctx.row&&ctx.record)){return }//throw new Error("invaled row specs")}

                        this.record=ctx.record
                        this.el=$d(ctx.row)
                        $d.data(this.el,"_rowwidget",this)
                    } ,
                    clear:function(dom,grid,meta){
                        this.el= this.record =null
                        return this
                    },
                    isRendered:function(){
                        return this.el&&this.el.isAttached()
                    },
                    getCell:function(cel){
                        return this.grid._cellWidget(
                            this.grid.getContext(cel,{record:this.record,row:this.el,row:this.record?this.record.id:0})
                        );
                     },
                    getCells:function(cel){
                        var cells=[],meta=this.meta,cellWidget=this.grid._cellWidget.bind(this.grid)
                        if(this.row){
                            cells=$d.qq(this.row,".grid-cell")
                        }
                        if(cells.length){
                           return $d.qq(this.grid.domcomponents.gridWrap,".grid-col").map(function(c,i){
                               return cellWidget(cells[i],meta.find($d.domdata(c,"name")))
                           })
                        }
                    },
                    isInView:function(){
                        return this.el&&this.el.isInView()
                    },
                    refresh:function(data,andrender){
                        if(this.record){var ths=this
                            this.record.refresh( ).then(
                                function(){
                                    if(andrender){
                                        ths.render()
                                    }
                                }
                            )
                        }
                    },
                    save:function(data,andrender){
                        if(this.record){var ths=this
                            this.record.update(data).save().then(
                                function(){
                                    if(andrender){
                                        ths.render()
                                    }
                                }
                            )
                        }
                    },
                    render:function( ){
                        if(this.meta.size()<100 ){var rec=this.record
                            this.getCells().forEach(function(cl){
                                cl.render(rec.get(cl.name))
                            });
                            return
                        }
                         this.grid._renderer.renderSingleRow(this.record)
                        return this
                    }

                })
            }


            if(rw instanceof  rowModelKlass){return rw}
            var ctx=_resolve(rw)
            if(ctx && ctx.row && $d.data(ctx.row,"_rowwidget")){return $d.data(ctx.row,"_rowwidget")}
            if(!(ctx && ctx.row)){return null}
            var nu=new rowModelKlass(ctx,_grid )
            if(nu.row){
                nu.el=nu.row
                $d.data(nu.row,"_rowwidget",nu)
            }

            return nu
        }
        rowModel.resolve=_resolve
        return rowModel;
    }
    function _cellWidget(grid,contentclass){
        var kls=null,_grid=grid
        return function(cl0,meta){
            if(!kls){
                kls=Klass({
                    properties:{
                        meta:null
                        ,content:{get:function(){return (this.el&&contentclass)?this.el.selfOrDown(contentclass):this.el}},
                        row:{get:function(){return this.el&&this.el.up(".grid-row")}},
                        cell:{get:function(){return this.el}},
                        tab:{get:function(){return this.el&&this.el.up(".grid-tab")}},
                        container:null,
                        record:{get:function(){
                            if(this.__record){return this.__record}
                            if(this.container&&this.container.getRow) {
                                var rowmodel = this.container.getRow(this.row||this.el.parent())
                                if (rowmodel && rowmodel.record) {
                                    return rowmodel.record
                                }
                            }
                            return null
                        },set:function(v){this.__record=v}},
                        name:{get:function(){return this.meta&&this.meta.name}}
                    },
                    init:function(dom,container,meta){
                        var ctx=null;
                        this.container=container
                        if(dom&&(dom.meta||dom.column)&&dom.cell){ctx=dom;ctx.meta=ctx.meta||ctx.column}
                        else if(dom&&dom.__isgridcontext){ctx=dom}
                        else{ctx=container.getContext(dom)}
                        if(ctx&&ctx.column&&!ctx.meta){ctx.meta=ctx.column}
                        if(!(ctx&&ctx.cell&&ctx.meta)){
                            return
                            //throw new Error("invaled cell specs")
                        }
                         this.container=container
                        this.el=$d( ctx.cell)
                        this.meta=ctx.meta||ctx.column
                        if(typeof(this.meta)=="string"|| $.isPlain(this.meta)){
                            this.meta=new Data.Column(this.meta)
                        }
                        this.columnIndex=ctx.columnIndex
                    } ,
                    clear:function( ){
                        this.el= this.column=this.meta= null
                        this.columnIndex=-1
                        return this
                    },
                    getValue:function(){
                        var record=this.record
                        if( record){
                            return  record.get(this.name)
                        }
                    },
                    setValue:function(v){
                        var record=this.record
                        if( record){
                            return  record.set(this.name,v)
                        }
                        return this
                    },
                    update:function(val,andrender){
                        this.container._renderer&&this.container._renderer.pause()
                        this.setValue(this.name,val)
                        this.container._renderer&&this.container._renderer.resume()
                         if(andrender) {
                            this.render(val)
                        }
                        return this
                    },
                    render:function(val){
                        val=val==null?this.getValue():val
                        var c=this.meta?this.meta.getDisplayValue(val):val
                        if(this.meta&&this.meta.cellRenderer){
                            c=this.meta.cellRenderer(c)
                        }
                        this.content.html(c)
                        return this
                    }

                })
            }
            if(cl0&&cl0.nodeType&&$d.data(cl0,"_cellwidget")){return cl0.data("_cellwidget")}
            if(cl0 instanceof  kls){return cl0}
            return new kls(cl0,_grid,meta)
        }
    }

    var _rukesadded=0
    function addRules(){if(_rukesadded){return}
        $d.css.addRules("grid",

            {".gridtable":"overflow:hidden;",
                ".gridtable .grid-tab":"table-layout: fixed;border-collapse: collapse; min-width:99%;",
                ".gridtable.viewmode-tile .grid-header":"display:none;",
                ".gridtable.viewmode-tile tbody,.gridtable.viewmode-tile table":"display:block;",
            ".gridtable.viewmode-tile .grid-row":"  cursor: pointer; line-height:1.6;display:inline-block;vertical-align: top;padding:4px;height:auto;border:1px solid #ccc;margin:4px;border-radius:4px;overflow:hidden;",
            ".gridtable .grid-row pre":"margin:1px 0;white-space: pre-wrap;",
            ".gridtable.viewmode-block .gridwrap .grid-tab .grid-rowset .grid-row":"display: block;  padding:2px 4px;margin-bottom:10px;border-top:none;clear: both;",
            ".gridtable.viewmode-block .grid-row h2":"font-size:1.4em;line-height: 1.6;margin:0 0 2px 0;padding:0;font-weight:bold;",
            ".gridtable.scrollable .gridwrap":"position:absolute;width:100%;height:95%;top:30px;left:0;overflow:auto; ",
            ".gridtable .gridwrap .scroll-fit":"z-index:-1;position:absolute;right:0;top:0;width:1px;max-width:1px;",
            ".gridtable .gridwrap .scroll-fit div":"position:absolute;left:0;width:100%;height:20px; ",
                ".gridtable .grid-cell,.gridtable .grid-header-cell":" padding-left:2px;padding-right:0;box-sizing:border-box;",
                ".gridtable .headerclone .grid-header-cell,.gridtable thead .grid-header-cell":"height:2em",
                ".headerclone":"position:absolute;top:1px;height: 2em;z-index:1;left:0;width:auto;",
                ".gridtable .grid-frame-header,.gridtable .grid-footer":"height:30px;font-size:.9em;line-height:1.6;padding-left:5px;position:relative",
                ".gridtable.scrollable .grid-frame-header,.gridtable.scrollable .grid-footer":"position:absolute;width:100%;left:0;",
            ".gridtable.scrollable .grid-footer":"bottom:0",
            ".gridtable .grid-frame-header":"top:0;padding:2px 0;height:3em;",
            ".gridtable dl":"display:block;clear:both;padding-top:1px;position:relative;margin-bottom:2px;",
            ".gridtable dl dt":"color:gray;text-align:right;padding-right:10px;font-weight:bold;clear:left;float:left;width:150px;",
            ".gridtable dl dd":"display:block;margin-right :20px  ",
                ".gridtable .layout-options":"display:inline-block;height:24px;border-left:1px solid #ccc;margin-left:5px;padding-left:5px;float:right;",
                ".gridtable .layout-option":"cursor:pointer;",
            ".gridtable .layout-option-tile1":"background:url(../../theme/img/blockview.gif) center center no-repeat",
                ".gridtable .layout-option-table1":"background:url(../../theme/img/gridview.gif) center center no-repeat",
            ".gridtable dl dd,.gridtable  dl dt":"overflow:hidden;white-space:nowrap;text-overflow:ellipsis;height:1.6em;line-height:1.6; ",
             ".gridtable dl.cell-object-data":"width:90%; margin-left:0;margin-top:0;margin-right :0 ",
            ".gridtable dl.cell-object-data dd":"margin-right :0;  ",
            ".gridtable dl.cell-object-data dt":" max-width:50%;  ",
            ".gridtable .grid-row-wrap":" margin-bottom:5px;",
            ".gridtable.fixedheight .grid-cell .cell-content":"height:20px;max-height:20px;overflow:hidden;text-overflow: ellipsis;white-space: nowrap;",
            ".gridtable .grid-header-cell":"overflow:hidden;text-overflow: ellipsis;white-space: nowrap;border-bottom:1px solid #111",
                ".gridtable.issortable  .grid-header-cell":"cursor:pointer",
            ".col-resize-shadow":"position:absolute;z-index:20; opacity:.4;cursor:col-resize;",
            ".grid-fitLayout table":"max-width:100%  !important;min-width:98% ;width:98% ;table-layout:fixed;  ",
            ".gridtable .grid-frame-header .grid-title":"position:absolute;left:15px;top:2px;font-weight:bold;font-size: 1.2rem;",
            ".gridtable .grid-frame-header .ui-button-bar":"width:200px;position:relative;min-height:30",
            ".gridtable.zebra-col .grid-rowset .grid-row .grid-cell:nth-child(odd)":"background:$hilite-cell",
             ".gridtable.zebra-row .grid-rowset .grid-row:nth-child(odd)":"background:$zebra-row",

            ".grid-columnfreeze-overlay":"overflow: hidden; ",
            ".grid-columnfreeze-overlay .grid-row  .grid-header-cell":"border-left:none;margin-left:-1px  ; ",
                ".ui-toolbar-status-message":"font-size:.8rem;color:#666;",
                // ".gridtable .gridwrap .edit-active,.gridtable .gridwrap .edit-active .cell-content":"background-color:white;color:#111",//outline:2px solid green
          //  ".gridtable .gridwrap .edit-active-row":"background-color:#ffffee !important ",
           // ".gridtable .gridwrap .edit-active-row .edit-active .cell-content":"color:#333",
            ".gridtable .rownum":"width:20px;max-width:20px;min-width:20px;",
            ".grid-filter":"display:block;position:absolute; top:0;height:100%;width:100%;",
            ".grid-filter .grid-filter-stub":"background-image:url(  theme/filter.png);background-size:cover; width:45px;margin:3px;margin-right:15px;overflow:hidden; float:left;height: 85%; text-align: center;",
            ".grid-filter .grid-filter-content":"width:100%; height: 100%;text-align: left;cursor: pointer",
            ".grid-filter .grid-filter-content .filter-elem-wrap":"height:100%;display:inline-block;position:relative;float:left;margin:1px;margin-right:6px; min-width:60px;width:auto; border:none;overflow:hidden;white-space:nowrap; ",
            ".grid-filter .grid-filter-content .filter-elem-wrap  .filter-elem, .grid-filter .grid-filter-content .filter-elem-wrap .filter-elem_ph":"cursor:pointer;margin-right:5px;text-overflow:ellipsis;text-align:center;white-space:nowrap;z-index:1;display:block;bottom:0; line-height:1.4;padding:0 10px 0 5px;border-radius:4px;border:1px solid #ccc;",
            ".grid-filter .grid-filter-content .filter-elem-wrap  .filter-elem":"z-index:1;position:relative;visibility: hidden;max-width:150px;min-width:50px;margin-top: 12px;text-overflow: ellipsis;white-space: nowrap;overflow: hidden; ",
            ".grid-filter .grid-filter-content .filter-elem-wrap .filter-elem_ph":"z-index:2;max-width:200px;position:absolute;opacity:.8;  margin-right:30px;   line-height: 1.2;height: 1.4em;font-weight:bold;     border: none;  box-shadow: none;     text-align: left;  color:#428bca;  top:0px;left:-4px;z-index:10; font-size:.9em;width:auto; margin-left:0; background-color: transparent;background: transparent;    letter-spacing: .5em;",
            ".grid-filter .grid-filter-content .filter-elem-wrap .filter-elem_phX":"line-height: 1.2;height: 1.4em;font-weight:bold;     border: none;  box-shadow: none;     text-align: left;  color:#428bca;  top:-2px;left:-2px;z-index:10; font-size:.9em;width:auto; margin-left:0; background-color: transparent;background: transparent;    letter-spacing: .5em;",
            ".grid-filter .grid-filter-content .filter-elem-wrap.has-value.hide-ph .filter-elem_ph":"display: none !important;",
            ".grid-filter .grid-filter-content .filter-elem-wrap.has-value .filter-elem":"display:block;float:left;opacity: 1;visibility: visible",
            ".viewmode-table .grid-row":" height:2em;line-height:1.6; " ,
            ".gridwrap.nowrap table":"table-layout: auto; width:auto;",
                ".gridwrap .grid-cell":"overflow:hidden;",
            ".gridwrap.nowrap .grid-cell,.gridwrap.nowrap .grid-cell .cell-content":"white-space: nowrap;",
            ".gridtable .nodata-msg":"position:absolute; width:160px;text-align: center;padding:0;left:50%;top:50%;margin-left:-80px;margin-top:-30px",
            ".gridtable   .nodata-msg .content":"border:2px outset #333;height:40px;line-height:35px; vertical-align: middle",
            ".filter-elem-wrap .filter-elem-remove":"opacity:.1;display:block;position:absolute;color:red;cursor:pointer;text-align:right;right:2px;top:1px;line-height:8px;height:8px;width:8px;z-index:20;",
            ".filter-elem-wrap:hover .filter-elem_ph:hover .filter-elem-remove":"opacity:1",
            ".filter-elem-wrap .filter-elem_ph .filter-elem-remove":"font-size:1.2em;",
            ".filter-elem-wrap .filter-elem:hover .filter-elem-remove":"opacity:1" ,
                ".filter-elem-wrap:hover .filter-elem-add":"opacity:1" ,
                ".filter-elem-wrap .filter-elem-add":"z-index:1;float:left;position:relative;margin-top: 2px;text-align:center;color:green;font-weight:bold;font-size:1.1em;opacity:.3;width:14px; height:14px;",
                ".grid-column-selected":"background:$ui-darker",
                ".edit-modified":"color:blue"
        }   )
    }
    var GridRenderer=function(grid, optns){
        this.grid=grid; this.gridoptns=optns||{};
        var _saveColList,_rendered,lastRender=null
        this.isRendered=function(){return !!lastRender}
        this.pause=function pause(){this._paused=true}
        this.resume=function pause(){this._paused=false}
        this.render=function render(recs0,outer){
            if(this._paused){return}
            var g=this.grid,gridoptns=this.gridoptns,bindings={
                colset:(gridoptns.rownum?"<col/>":"")+g.cols.map(function(it){return "<col class='grid-col' data-name='"+it.dataIndex+"'/>"}).join(""),
                caption:"",
                headercells:(gridoptns.rownum?"<th class='grid-header-cell rownum'>#</th>":"")+g.cols.map(function(it){return "<th class='grid-header-cell'><div class='cell-content'>"+it.label+"</div></th>"}).join(""),
                rows:""  ,title:gridoptns.title||"Grid"

            } ,cmpo=this.grid.domcomponents;
            if(!cmpo.outer){
                cmpo.outer= $d(outer);
            }
            if(gridoptns.fitLayout){cmpo.outer.classList.add("grid-fitLayout")}
            var cntnt=(gridoptns.viewmode!="table"?blockcntntLayout:cntntLayout).replace(/\$([\w]+)/g,function(a,b){return bindings[b]||""})

            if(!cmpo.gridWrap){
                cmpo.outer.el.innerHTML=cntntwrapLayout.replace(/\$content/,cntnt ).replace(/`/g,",")
            }  else {
                cmpo.gridWrap.el.innerHTML=cntnt.replace(/`/g,",")
            }


            cmpo.gridWrap.st("li").addClass("list-row");
            //g._resize();  // cmpo.tab.style.width=cmpo.gridWrap.clientWidth+"px"
            //this.redraw()
            //setTimeout(this.grid.fire.bind(this.grid,"render"),500);
            //  cmpo.outer.style.display=""  ;
            g.observer.fireAsync("afterbuild")
        }
        this.wrapTemplate=function(content,tag){tag=tag||"div" ;var stl=""

            if(tag!="tr"){
                stl="display: block;clear:both;position: relative;border-bottom:none;"
                //width:"+((this.grid.domcomponents.gridWrap||this.grid.domcomponents.outer||{}).offsetWidth||"800")+"px"
                /*this.grid.on("afterrender resize",function(){
                    var w=this.domcomponents.gridWrap;
                    if(!this.isVisible()){this._needsRedraw=true;return}
                    w&&  w.st(".grid-row").css( {"width":w.offsetWidth+"px" })
                })*/
            }
            return ("<$tag style='"+stl+"' class='grid-row' data-id='$id'>"+ content +"</$tag>").replace(/\$tag/g,tag)
        }
        this.wrapRowTemplate=function(content,tag){tag=tag||"tr"
            if(String(content).trim().indexOf("grid-row")>-1){return content}
            return "<"+tag+" class='grid-row' data-id='$id'>"+content+"</"+tag+">"
        }
        this.getRowTemplate=function(){
            var tag="tr",tmpl= this.grid.config.viewmode=="table"?null:this.grid.config.rowtemplate
            if(!tmpl){
                tmpl= (this.gridoptns.rownum?"<td class='rownum'>$rownum</td>":"")+
                    grid.cols.map(
                        function(it){return "<td class='grid-cell'><div class='cell-content'>$"+it.dataIndex+"</div></td>"}
                    ).join("")
            } else{
                if(tmpl=="formview"){var labelwidth=this.grid.config.formlabelwidth||150
                    this.grid.config.rowtemplate=tmpl= this.grid.cols.map(function(it){
                        return "<label class='' style='float:left;width:"+(labelwidth)+"px;margin-bottom:5px;overflow:hidden;'>"+it.label+"</label><div style='margin-bottom:5px;max-width:90%'>$"+it.name+"</div>"
                    }).join("");
                }
                if(this.grid.config.wrapfieldsintemplate){
                    var m=this.grid.store.meta,fldtmpl="<$tag class='grid-cell' data-name='#name'><div class='cell-content'>$#name</div></$tag>"
                    this.grid.config.rowtemplate=  tmpl= tmpl.replace(/\$([\w]+)/g,function(a,b){
                        if(b=="id"){return a}
                        var f=m.findField(b)||{name:b}
                        if(f){var tag="div"
                            if(f.titlefield){tag="h2"}
                            return fldtmpl.replace(/#name/g, f.name).replace(/\$tag/g,tag)
                        }
                        return a
                    })
                     this.grid.config.wrapfieldsintemplate=null
                }


                tag=this.grid.config.rowtag||"div"}

            return this.wrapRowTemplate(tmpl,tag);
        }
        this.clear=function clear(rowset){if(this._paused){return}
            var bdy= rowset||this.grid.domcomponents.rowset
            var chldrn1=$.makeArray(bdy.children)
            while(chldrn1.length ){
                bdy.removeChild(chldrn1.pop())
            }
        }
        this.showNoDataMessage=function showNoDataMessage( ){
            if(this._currentcount){
                this.grid.domcomponents.gridWrap.show();return
            }
                 var msg=this.grid.config.noDataMessage||"No data found"
                if(!this.grid.nodatamsg){
                    this.grid.domcomponents.gridWrap.before("<div class='def-popup-style nodata-msg'><div class='content'></div></div>")
                    this.grid.nodatamsg=this.grid.domcomponents.outer.q('.nodata-msg')
                }
                    var st=this.grid.domcomponents.toolbar_status
                    if(st){st.clear();}
                    this.grid.domcomponents.loadmsg&& this.grid.domcomponents.loadmsg.html("&nbsp;");
                    if(this.grid.domcomponents.loadericon){
                        this.grid.domcomponents.loadericon.css("opacity",.01)
                        //this.domcomponents.loadericon.hide()
                    }

                //this.grid.domcomponents.gridWrap.hide();
                this.grid.nodatamsg.show().q(".content").html(msg)
            }
        this.renderRows=function renderRows(recs0,appnd,nothrottled){
            if(this._paused){return}
            nothrottled=true;
            var recs=recs0||this.grid.pager.getPageRecords() ,grid=this;
            if(recs && recs.data){
                recs=recs.data
            }
            if(!recs||!recs.length||(recs.length==1&&!recs[0])){
                this._currentcount=0;
                recs=[]
                this.clear();
                //this.showNoDataMessage (  )
            }
            else {
                if(this.grid.nodatamsg){this.grid.nodatamsg.hide()}
                this.grid.domcomponents.gridWrap.show();
                if(lastRender&&lastRender.length){}
                 var pr=this.grid.data("_lookupsresolve_promise")
                if(pr){
                    pr.then(function(r){
                        if(nothrottled){this.renderRows_inner(r);}
                        else{this.renderRows_inner_throttled(r);}

                        if(this.grid.nodatamsg){this.grid.nodatamsg.hide()}
                        lastRender=r
                    }.bind(this,recs)
                );
                } else {
                    this.renderRows_inner(recs);
                }
            }
            this.grid.fire("viewupdate",this.grid.pager);
        }
        this.renderRows_inner=function renderRows(recs,appnd){
            if(this._paused){return}
            var data,tmpl=this.getRowTemplate(),grid=this;;
             this._currentcount=0;
              if(recs&&recs.length){
                this._currentcount=recs.length;
                var tmpl=this.grid.store.StoreRecordProto.prepTemplate(tmpl)

                this._lastusedRowTemplate=tmpl
                data= recs.map(function(r,i){
                    if(r){r.rownum=i+1}
                    return r.applyTemplate(tmpl);
                }).join("")
                    .replace(/nan|undefined|\[object object\]|null/ig,"")


                if(!data.trim()){data=""}
                var bdy= this.grid.domcomponents.rowset ;
                var cln=document.createElement(bdy.tagName),prev=bdy.previousSibling,
                    next=bdy.nextSibling, par=bdy.parentNode,bdy1=bdy.el;//par.removeChild(bdy.el)
                var display=$d.css(par,"display");
                //
                if(!(appnd===true)){
                    this.clear(bdy1)
                }
                _rendered=1
                cln.innerHTML=data;
                var chldrn=$.makeArray(cln.children)
                par.style.display="none";
                try{
                    while(chldrn.length ){
                        bdy1.appendChild( chldrn.shift() )
                    }
                } finally{

                    par.style.display=display;
                }
                cln=null;

             }            // par.insertBefore(bdy1,next)
           // par.style.display=display||"";
            this.grid.domcomponents.outer.classList.add("viewmode-"+this.grid.config.viewmode)
              _saveColList=this.grid.cols.map(function(it){return it.name});


           this.grid.domcomponents.rowset.st(".grid-row").addClass("selectable")
            var grid=this.grid
            grid.cols.forEach(function(c){
                if(c.cellui && !$.is.empty(c.cellui)){
                    var ui=c.cellui,parstyle=null
                    if(ui.style && ui.style.background){
                        //parstyle={background:ui.style.background}
                    }
                    grid.getColumnCells(c,false,true,true).forEach(function(el){
                        $d.prop(el,ui)
                         if(parstyle){
                            $d.css($d.parent(el),parstyle)
                         }

                    });
                }
            });

              this.grid.afterRender() ;

            this.grid.fire("afterpageload",this.grid.pager);

            return this
        }//,{ delay:5 }) ;
        this.renderRows_inner_throttled=$.throttle( this.renderRows_inner.bind(this),true)
        this.findRow=function(rec){
            var id= 0,rw
            if(typeof(rec)=="number"){id=rec}
            else if(rec&&rec.nodeType){return $d.selfOrUp(".grid-row")}
            else if(rec){id=rec.id}
            if(id){
                rw= this.grid.domcomponents.gridWrap.q(".grid-row[data-id='"+id+"']");
                //var rwrec=this.grid.store.findById(id)

            }
            return rw
        }
        this.renderSingleRow=function renderSingleRow(recs){
            if(this._paused){return}
            var rec=Array.isArray(recs)?recs[0]:recs    ;if(!(rec&&rec.id>=0)){return}
            var html,ctx= this.grid.getRow(rec);
             if(ctx&&ctx.record){rec=ctx.record}
            if(ctx.row){
                if(this._lastusedRowTemplate){
                    html=this._lastusedRowTemplate.fn(rec)
                 }
                else{
                    html=rec.applyTemplate(this.getRowTemplate(),ctx.row.domIndex()+1)
                }
                var div=document.createElement("div")
                div.innerHTML="<table>"+html+"</table>"
                var nu=ctx.row.parent().insertBefore(div.querySelector("tr"),ctx.row)
                ctx.row.remove();
                ctx.row=$d(nu).addClass("selectable")
                //ctx.row.insert(html.replace(/nan|undefined|\[object object\]|null/ig,""),"replace")
            }
            this.grid.fire("viewupdate",this.grid.pager);
            return
        }
        this.redraw=function(clear){
            clear===true && this.clear();
            this.renderRows() ;
            return this
        }
        this.addrows =function _addrows( ){if(this._paused){return}
            //   var diff=this._lastDiff||0;if(!diff  ){return}
            var _all=[] , blanks=Math.min(this.pager.totalrows,Math.floor(diff/rowht))
            while(_all.length<blanks){[].push.apply(_all,this.pager.next()) }
             this.renderRows( _all,true);
        }
    }  ;
    //store selectedRecord cols
    var DataGrid=(function(){
        var _domC=function(){
            var  domcomponents={}
            Object.defineProperties(domcomponents,{
                grid:{value:this},
                outer:{value:null,writable:true,enumerable:true},
                gridWrap:{get:function(){return this.outer&&this.outer.q(".gridwrap")},set:function(){},enumerable:true},
                tabheader:{get:function(){return this.outer&&this.outer.q(".grid-header")},set:function(){},enumerable:true},
                tabheaderrow:{get:function(){return this.tabheader&&this.tabheader.tab.q(".grid-row")},set:function(){},enumerable:true},
                frameheader:{get:function(){return this.outer&&this.outer.q(".grid-frame-header")},set:function(){},enumerable:true},
                toolbar:{get:function(){if(!this.frameheader){return null}
                    var t=this.frameheader.q(".ui-button-bar")||this.frameheader.append("<div class='ui-button-bar ui-button-bar-right clear-fix' style='position: absolute; right: 1px; top: 0;    width: auto; minWidth:250,minHeight:30,text-align: right;  overflow: hidden; z-index: 1;'></div>")
                    return t
                },set:function(){},enumerable:true},

                toolbar_status:{get:function(){return this.outer&&this.outer.q(".ui-toolbar-status-message")},set:function(){},enumerable:true},
                headerclone:{get:function(){return this.outer&&this.outer.q(".headerclone")},set:function(){},enumerable:true},
                framefooter:{get:function(){return this.outer&&this.outer.q(".grid-footer")},set:function(){},enumerable:true},
                tab:{get:function(){return this.gridWrap&&this.gridWrap.q(".grid-tab")},set:function(){},enumerable:true},
                rowset:{get:function(){return this.tab&&this.tab.q(".grid-rowset")},set:function(){},enumerable:true},
                row:{value:function(idx){return this.rowset&&this.rowset.q(".grid-row:nth-child("+(idx+1)+")")},enumerable:true},
                rows:{value:function(idx){return this.rowset&&this.rowset.st(".grid-row")},enumerable:true },
                colset:{get:function(){return this.tab&&this.tab.st("col")},set:function(){},enumerable:true} ,
                loadmsg:{get:function(){return this.pagerwrap&&this.pagerwrap.q(".loadmsg")},set:function(){},enumerable:true} ,
                loadericon:{get:function(){return this.outer.q(".grid-footer .loadericon")},set:function(){},enumerable:true} ,

            pagerwrap:{get:function(){return this.outer.q(".grid-footer .msg")},set:function(){},enumerable:true} ,
                hdrInfo  :{value:function(){   var tabhdr=(this.headerclone||this.tabheader), b1=tabhdr?tabhdr.getBoundingClientRect():{},b={top: b1.top||0,height:b1.height||0,bottom:b1.bottom||0}
                    if(b.height<5&& this.tabheader && this.tabheader.dataset.savedht){b.height=+this.tabheader.dataset.savedht;b.bottom= b.top+ b.height}
                    var tt=this.outer.getBoundingClientRect().top,fr=this.frameheader,frht=fr?fr.offsetHeight: 0,
                        btm=frht?(frht+b.height):b.bottom-this.outer.getBoundingClientRect().top;
                    if(this.tabheader&&b.height>5&&!this.tabheader.dataset.savedht){this.tabheader.dataset.savedht= b.height}

                    return{
                        bottom:btm,
                        height:b.height,top:btm-b.height
                    }
                    } ,enumerable:true
                } ,
                resetscroll:{value:function resetscroll(){ var cmp=this
                    cmp.gridWrap.scrollTop=0; cmp.gridWrap.scrollLeft=0;
                    this.grid.pager.pageno=1
                },enumerable:true},
                setwidths:{value:function (st,w){ if(w&&w!="0px"&&w!="0"){st.maxWidth=st.minWidth=st.width=w}},enumerable:true},

                scrollTreshold:{value:-50},
                handleheaderSel:{value:function(ev){
                    //colresize sort or move
                    var gridctx=this.grid ,cmp=this
                    if(!(gridctx.colresizable||gridctx.sortable||gridctx.colMove)){return}
                    if($d.hasClass(cmp.outer,"resizing")){return}

                    var el=$d.hasClass(ev.target,"cell-content")?$d.parent(ev.target):ev.target,
                        dm=el.getBoundingClientRect(),act=0;
                             if(gridctx.colMove || gridctx.sortable) {
                                ev.stopPropagation && ev.stopPropagation()
                                //ev.stopImmediatePropagation && ev.stopImmediatePropagation()
                                 var sorted=0
                                $d.holdMouse2(el,{timeout:300,endonmousemove:true,
                                    onmove:function(ev){
                                        if(gridctx.sortable) {sorted=1
                                            gridctx.sortable.activate (ev,el);
                                        }
                                    },
                                    onend:function(){
                                        if(sorted){return}
                                        if(gridctx.colMove){
                                            gridctx.colMove.activate (ev,el)
                                        } else{
                                            if(gridctx.sortable) {
                                                gridctx.sortable.activate (ev,el);
                                            }
                                        }

                                     }
                                })
                             }
                         if(act) {
                            cmp.outer.classList.add("resizing")
                            $d(document).on("mouseup",function _mmup(ev){
                                cmp.outer.classList.remove("resizing");
                                $d(document).off("mouseup",_mmup);
                            })
                        }
                }
                }
            });


            this.domcomponents=domcomponents;
        }
        var _proto={panel:null,store:null,el:null}
        _proto.init= function( store,optn ){
            addRules();
            var gridOptns=Object.create(null),optns=Object(optn||{});
            this._cellWidget=_cellWidget(this,".cell-content")
            this._rowModel=_rowModel(this)
            this.store=store;
            var pager=this.store.pager.properties.toMap()
            if(pager.pagesize==-1){pager.pagesize=optns.pagesize||40}
            this.pager=new Data.pager(store)
            this.pager.updateProperties(pager)
            //    this.domContainer=DomCore.wrap(cntnr)


            this.pager.on("update",function(){
                this.loadPage()
            });
            _domC.call(this);
            _domC.call(this);
            if(optns.rowTemplate){optns.rowtemplate=optns.rowTemplate};
            ("sorttable colresizable colmove highlightcolumn rowHeight columns title headerFilter rowtemplate wrapfieldsintemplate viewmode  entityForm inlineEditor popupEditor inlneEditor columnFreeze zebraRow editoptions zebraColumn nowrap scrolling pagesize pagination fitLayout showlayoutoptions").split(/\s+/).forEach(
                function(k0){var k=String(k0);if(!(k in optns)&&(k.toLowerCase() in optns)){k=k.toLowerCase()}
                    if(k in optns){gridOptns[k0]=optns[k];}//delete optns[k]
                }
            );

            //pagination /scrolling
            if(gridOptns.scrolling==null){gridOptns.scrolling=30}
            if(gridOptns.scrolling==-1){
                gridOptns.rowHeight=gridOptns.rowHeight||20;
                if(gridOptns.scrolling>0){
                    gridOptns.pagesize= gridOptns.pagesize||gridOptns.scrolling;
                }
            }
            var ent=store.meta, collist

            if(gridOptns.pagesize && store) {pager.pagesize=gridOptns.pagesize}
            //columns

            if(gridOptns.columns){
                collist=gridOptns.columns.map(function(it){
                    return ent.findField(it)||{label:it,name:it,dataIndex:it}}).filter(function(it){
                        return it && !(it.name=="id"||it.hidden||(it.ui && it.ui.hidden))
                    }
                )
            } else{
                collist=ent.findAll(function(it){return !(it.name=="id"||it.hidden||(it.ui && it.ui.hidden))})
            }
             this.cols=collist;
            this.config=this.config||{};
            //this.initComponent([optn])
            for(var k in gridOptns){this.config[k]=gridOptns[k]}
            this.config.gridoptns=gridOptns


            //this.cols=collist.map(function(it){ return ent.columns[it] });
            if(!this.config.viewmode && (this.config.rowtemplate &&!this.config.showlayoutoptions)) {
                this.config.viewmode ="block"
            }
            if(!this.config.viewmode){this.config.viewmode="table"}
            //rendering
            this._renderer=new GridRenderer(this,this.config);
            this.setupDataEvents()
             var c=this.getController()
            c.mixin({
                edit:function(){
                    if(!this.entityForm){ this.entityForm= DataGrid.plugins.entityForm(this).setup()}
                    if(this.selectedRecord && this.selectedRecord.id){
                        this.entityForm.setupForm(this.selectedRecord,true);
                    }
                },
                addrow:function(){
                    if(!this.entityForm){ this.entityForm= DataGrid.plugins.entityForm(this).setup()}
                    this.entityForm.setupForm(null,true);
                },

                del:function(){
                    if(this.selectedRecord && this.selectedRecord.id){
                        var id=this.selectedRecord.id
                        this.store.provider.delete(id).then(
                            function(){
                                this.store.remove({id:id})
                                this._renderer.redraw()
                            }.bind(this)
                        );
                    }
                },
                refresh:function(){

                    var st=this.domcomponents.toolbar_status
                    if(st){
                        st.html("Refreshing ...")
                        this.observer.once("afterrender",function(){
                            st.clear();
                            //st.html("last refreshed: "+ $.date().format("hh:nn tt"))
                        })
                    }
                    this.pager.loadPage()
                    //this._renderer.redraw()
                }
            },true);


            this.observer.once("afterbuild.evts",function(){
                this.on("resize",this.resize);
                var _lastCtx={} ,r=this.domcomponents.outer,ths=this,Dom=DomCore;
                this.domcomponents.gridWrap.__onscroll||
                this.domcomponents.gridWrap.on("scroll",this.domcomponents.gridWrap.__onscroll=function(ev){
                    ths.fire("scroll",ev)
                });

                var gridWrap=this.domcomponents.gridWrap
                this.domcomponents.outer.on("click",function(ev){
                    var cx = null
                    var rw=  Dom.selfOrUp(ev.target,".grid-row")
                    if(rw){
                        cx=ths.getRow(rw);
                    }
                    if(!(cx && cx.record)){return}
                    var rowdom=rw
                    if(rowdom && !rowdom.is(".selected")){
                        _lastCtx.row=null;
                    }
                    if(!(_lastCtx.row &&  _lastCtx.row.id===cx.id ) ) {
                            _lastCtx.row = cx;
                        rw.parent().qq(".selected").removeClass("selected")
                        rw.parent().qq('.grid-row[data-id="' + (cx.id) + '"]').addClass("selected")
                             cx.index = Dom.domIndex(cx.el)
                            ths.fire("rowselected", cx)

                    }
                    if( Dom.selfOrUp(ev.target,".grid-cell") ){
                        var cl=cx.getCell(Dom.selfOrUp(ev.target,".grid-cell"))
                        if(cl&&(!_lastCtx.cell || !(_lastCtx.cell &&  _lastCtx.cell.name===cl.name&&  _lastCtx.cell.el===cl.el)) ) {
                            _lastCtx.cell=cl
                            ths.fire("cellselected", cl)
                        }
                    }
                    if($d.is(ev.target,"[data-cmd]")){
                        //ths.getController().invoke(ev.target.dataset.cmd,[]);
                    }
                }) ;
                this.config.viewmode||(this.config.viewmode="grid")



                if(this.config.entityForm){
                    this.config.editable=this.config.entityForm;
                }
                if(this.config.editable){
                    this.config.entityForm=this.config.editable
                }
                if(this.domcomponents.toolbar){
                    this.buttonBar=this.domcomponents.toolbar.css({position:"absolute",r:1,t:"1px",  w:"auto",minWidth:150, textAlign:"right",overflow:"hidden",
                        zIndex:ZINDEX.BUTTONBAR});
                    if(this.config.entityForm){
                        if(!this.entityForm){
                            this.editable=this.entityForm=   DataGrid.plugins.entityForm(this).setup()
                        }
                        this.editable.addLinks(this.config.editable)
                        this.buttonBar.css("minWidth",Math.max(Number(String(this.buttonBar.css("min-width")).replace(/\D/g,"")),this.buttonBar.scrollWidth))
                        this.on("save",function(rec){
                            // this._renderer.renderSingleRow(rec)
                        })
                    }
                }
                if(this.config.title){
                    var dom=this.domcomponents.outer.q(".grid-title")
                    if(dom){
                        dom.html(this.config.title)
                    }
                }
               });

             this.observer.once("afterrender",function(){

                 setTimeout(this.resize.bind(this),500);
                  this._built=true
                 this.pager.on("pageloadstart.pager",function(){
                     this.domcomponents.loadmsg&& this.domcomponents.loadmsg.html("loading . .");
                     this.domcomponents.loadericon&&this.domcomponents.loadericon.show().css("opacity",1)
                     var st=this.domcomponents.toolbar_status
                      if(st){st.html("Loading ...")}
                      this.pager.observer.once("pageloadend" ,function(){
                         st && st.clear();
                         this.domcomponents.loadmsg&& this.domcomponents.loadmsg.html("&nbsp;");
                         if(this.domcomponents.loadericon){
                             this.domcomponents.loadericon.css("opacity",.01)
                             //this.domcomponents.loadericon.hide()
                         }
                     }.bind(this))

                 }.bind(this))

                 var plugins= DataGrid.plugins,gropts=this.config||{};
                  //grid-frame-header
                 if(!this.config.viewmode||this.config.viewmode=="grid"||this.config.viewmode=="table"){
                     this.colresizable =     plugins.colResize(this)
                      this.sortable     =     plugins.sortable(this)
                       if(this.config.scrollable!==false ) {
                            this.scrollable = plugins.scrollable(this)
                      }
                     if(this.config.columnFreeze){this.ColumnFreeze=  plugins.ColumnFreeze(this).setup()}
                 }  else {
                     this.domcomponents.tabheader && this.domcomponents.tabheader.hide()
                 }
                 if(this.config.infiniteScroll){this.infiniteScroll=  plugins.infiniteScroll(this).setup() ;this.pager.pagesize=200  }
                 if(this.sortable) {this.sortable.setup();}
                 if(this.scrollable) {this.scrollable.setup()}
                 if(this.config.showlayoutoptions&&this.config.rowtemplate){
                     this.layoutoptions=  plugins.layoutoptions(this).activate()
                 }
                 if( this.config.colmove||this.colmove){
                     this.colMove      =     plugins.colMove(this)}


                 var cn=this.config.filterContainer||this.domcomponents.frameheader
                 if(this.config.headerFilter&&cn){
                     this.config.filterContainer= cn
                     plugins.headerFilter(this).setup()
                    // cn.style.height="40px"
                 }
                 if(this.config.zebraColumn) {this.domcomponents.outer.addClass("zebra-col")}
                 if(this.config.zebraRow) {this.domcomponents.outer.addClass("zebra-row")}
                 if(this.config.nowrap) {this.domcomponents.gridWrap.addClass("nowrap")}
                    if(this.config.editoptions){
                        if(this.config.editoptions.add!=null){

                        }
                    }

                 if(this.ColumnFreeze) {this.ColumnFreeze.activate()}
                 if(this.colresizable) {this.colresizable.activate()}
                 if(this.colMove) {this.colMove.setup()}
                 if(this.config.popupEditor){
                     this.popupEditor=  plugins.popupEditor(this).setup()
                 }
                 if(this.config.inlineEditor){
                     this.inlineEditor=  plugins.inlineEditor(this).setup()
                 }
                  if(this.config.highlightcolumn&&this.config.viewmode!="block"){

                     this.on("cellselected",function(cx){
                         if(cx.columnIndex!=null&&cx.columnIndex>=0){
                             this.domcomponents.outer.st(".grid-column-selected").removeClass("grid-column-selected").
                                root(".grid-cell:nth-child("+(cx.columnIndex+1)+")").addClass("grid-column-selected")
                         }
                     })
                 }
                 this.domcomponents.framefooter.style.zIndex=ZINDEX.FOOTERBAR
                 this.domcomponents.frameheader.style.zIndex=ZINDEX.FRAMEHDR
                // plugins.gridMenu(this).setup();
                 this.domcomponents.tabheader &&  this.domcomponents.tabheader.on( "mousedown",
                     this.domcomponents.handleheaderSel.bind(this.domcomponents)
                 );
                 $d.addBoundsListener(this.domcomponents.outer,this.resize.bind(this));

             });
            var pr=Promise.deferred();
            this.data("_lookupsresolve_promise",pr)


              if(this.store){   var p=[]
                 this.cols.forEach(function(it){
                     if(it && !it.hidden&&it.hasLookup){
                         var pr=it.getLookupValueMap();
                         if(pr){p.push(pr)}
                     }
                 });
                 if(p.length){
                     var _resolved=0
                     Promise.all(p).then(function(){_resolved=1;
                         pr.resolve()
                      }.bind(this));
                     setTimeout(function(){
                         if(!_resolved){_resolved=1;
                             pr.resolve()
                      }}.bind(this),5000)

                 }else{ pr.resolve()  }
             }


        }
        _proto.addPlugin=function(id,optns){
            if( DataGrid.plugins[id]&&!(id in this)){
                this[id]= DataGrid.plugins[id](this);
                this[id].setup();
            }
            this[id] && this[id].activate && this[id].activate( optns )
        }
        _proto.removePlugin=function(id){
            if( DataGrid.plugins[id]&&!(id in this)){
                this[id].remove && this[id].remove();
            }
        }
        _proto.build=function(panel,recs){
            var dom;
            if(panel&&panel.nodeType){dom=panel;panel=null}
            else if(panel.contentWrap){this.panel=panel;dom=panel.contentWrap}
            else{dom=panel;panel=null}
            this.el=this.domcomponents.outer=$d(dom)

            if(!this.domcomponents.outer.hasClass("gridtable")){this.domcomponents.outer.addClass("gridtable")}
            if(this.config.rowHeight && this.config.rowHeight!="auto"){
                dom.classList.add("fixedheight")
            }
            dom.classList.add("unselectable")
            //this.domcomponents.frameheader && (this.domcomponents.frameheader.style.height="60px");
            if(panel){
                panel.on("resize afterlayout",$.throttle(function(){
                 this.fire("resize")}.bind(this),500))
            }
            //if(this.store){
                this.pager.observer.on("pageloadend",function(recs){
                     this._renderer.renderRows(this.store.getList() )
                    var st=this.domcomponents.toolbar_status
                    if(st){
                        //st.html("last refreshed: "+ $.date().format("hh:nn tt"))
                        }
                    this.updateMsg()
                }.bind(this))


            //}
            this._renderer.render( )
            if(this.store.records.size()&&this.store.records[0]){
                this._renderer.renderRows( )
            }else {var grid=this;
                this.store.observer.once("dataloadcompleted",function(){
                    var map=this.pager.properties.toMap()
                    delete map.pagesize
                    grid.pager.properties.update(map)
                    //grid._renderer.renderRows( )

                })
            }
            if(recs===true){
                this.pager.loadPage()
            }

            return this;
        }
        _proto.render=function( panel){

               if(!this._renderer.isRendered()&&panel ){

                   if(this.store && !this.store.size(true)){
                        this.pager.loadPage().then(function(){
                           this.build(panel)
                       }.bind(this))
                   } else{this.build(panel)    }

               } else{this._renderer.renderRows();}

             return this;
        }
        _proto.getStore=function(){return this.store}
        _proto.nav=function(mthd ){
            if(mthd && typeof(this.pager[mthd])=="function"){
                this.pager[mthd].apply(this.pager,$.makeArray(arguments,1))
            }
        }
        _proto.getColumnCells=function(name,allcells,safe,getcontentwrap){
            var colpos= 0,grid=this
            if(!name){return safe?[]:null}
            if(typeof(name)=="number"){colpos=name}
            else {
                var colmeta=$.is(name,Data.Column)?name:null
                if(!colmeta) {
                    var meta = this.store ? this.store.meta : this.meta, tofind = name
                    if (meta) {
                        tofind = (meta.find(name) || {}).name || name
                    }
                    colmeta = this.cols.find(function (c) {
                        return c.name == tofind
                    })
                }
                if (!colmeta) {
                    return safe?[]:null
                }
                var col = grid.domcomponents.tab.q('.grid-cell[data-name="' + colmeta.name + '"]')
                if (!col) {
                    col = this.domcomponents.gridWrap.q('col[data-name="' + colmeta.name + '"]')
                }
                if(col){colpos=col.at()+1}
            }
            if(colpos){var sel='.grid-cell:nth-child('+colpos+')'+(getcontentwrap?" .cell-content":"")
                if(allcells){
                    sel=sel+',.grid-header-cell:nth-child('+colpos+')'+(getcontentwrap?" .cell-content":"")+',.grid-footer-cell:nth-child('+colpos+')'+(getcontentwrap?" .cell-content":"")
                }
                return (allcells?grid.domcomponents.gridWrap:grid.domcomponents.rowset).st(sel)
            }
            return safe?[]:null
        }
        _proto.showStateMsg=function showStateMsg(msg,delay ){
            if(delay >0){
                setTimeout(showStateMsg.bind(this,msg),delay)
                return this
            }
               var d=this.domcomponents.loadmsg
                if(d){
                    if(!msg){d.css({opacity:0.01})}
                    else{d.show().html(String(msg)).css({opacity:1})}
                }
            return this
            }
        _proto.updateMsg= $.throttle(function _updateMsg( ){//
            var gridctx=this,d=gridctx.domcomponents.pagerwrap,store=this.store,pager=this.pager;
            if(!d||pager.pagesize<=0){return}
             if(!pager.totalrows || !pager.pageno){
                pager.recalc( store.size()) ;
             }
            pager.properties.recalcAll()

            if(!d.q(".grid-pager-text-pageno")){
                d.el.innerHTML=pagertemplate.replace(/\$([\w]+)/g,function(a,b){return pager[b]||""});//store.pager.toString( );
                d.on("click.gridpager",function(ev){ var key=$d.domdata(ev.target,"key");key && this.nav(Number(key)||key)}.bind(this)
                ,".grid-pager-text button")
                d.q("input").on("change",function(evt){ this.nav("nav",Number(evt.target.value)) }.bind(this))
             }   else{
                "startrow totalrows endrow totalpages pageno".split(/\s+/).forEach(function(k){
                    var el=d.q(".grid-pager-text-"+k);
                    if(!el){return}
                        if(k!="pageno"){el.html(pager[k])}
                        else{d.down("input").val(pager[k])}
                })
            }


        },{tailend:true});


        _proto.getContext=function _getContext(cel,rw ){

            var  cx={__isgridcontext:true}
            if(!(cel||rw)){return }
            if(cel && cel.__isgridcontext){
                return cel
            }
            if(rw && rw.__isgridcontext){
                cx=rw;
            }
            if(cel && cel.type&&cel.target&&cel.target.nodeType){
                cel=cel.target
            }
            if(cel && cel.nodeType){

                rw=$d.selfOrUp(cel,".grid-row");
                cel=$d.selfOrUp(cel,".grid-cell");
            }
            if( !(rw || cel)){return }
            if(rw) {
                if (rw === "first") {
                    cx.row = this.domcomponents.rowset.q('.grid-row')
                    cx.id = $d.domdata(cx.row, "id")
                }
                else if (rw && rw.__record__) {
                    cx.record = rw
                    cx.id = cx.record.id
                }
                else if ($.isPlain(rw)) {
                    cx.record = rw.record || rw;
                    cx.id = rw.id || cx.record.id
                    cx.row = rw.row
                    cx.column = rw.column
                    cx.cell = rw.cell
                    cx.columnname = rw.columnname
                }
                else if (rw && typeof(rw) != "object" && Number(rw) > 0) {
                    cx.record = this.store.getList().findById(rw)
                }
                else if (rw && rw.nodeType && $d.is(rw, ".grid-row")) {
                    cx.row = rw;
                }
            }
            if(cx.record&&!cx.id) {
                cx.id = cx.record.id;
            }
            if(!cx.id&&cx.row){
                cx.id = $d.domdata(cx.row, "id")
            }
            if(cx.id&&!cx.record&&this.store){
                cx.record=this.store.getList().findById(cx.id)
            }

            if(cx.id&&!cx.row&&this.domcomponents.rowset) {
                cx.row=this.domcomponents.rowset.q('.grid-row[data-id="'+cx.id+'"]')
            }
            if(typeof(cel)=="string"){
                cx.column=cx.column||this.store.meta.findField(cel)
                if(!cx.cell&&(cx.row&&cx.column)){
                    var col = grid.domcomponents.tab.q('.grid-cell[data-name="'+cx.column.name+'"]')
                    if(!col){
                        col=this.domcomponents.gridWrap.q('col[data-name="'+cx.column.name+'"]')
                        if(col){
                            cx.cell=cx.row.qq(".grid-cell")[col.at()]
                        }
                    }
                    else{cx.cell=col}

                }
            }
            if(!cel&&cx.cell){cel=cx.cell}
            if(cel&&cel.nodeType){
                if(!cx.cell){cx.cell=$d.selfOrUp(cel,".grid-cell")}
                if(!cx.column){
                    var name=$d.domdata(cx.cell,"name")
                    if(!name){
                        var idx=cx.columnIndex
                        if((idx==null || isNaN(idx)||idx<0) &&cx.cell&&!cx.column&&cx.cell.is("td")){
                            idx=$d.domIndex(cx.cell)
                        }
                        if(idx>=0){
                            cx.columnIndex=idx;
                            var col=this.domcomponents.gridWrap.q("col:nth-child("+(idx+1)+")")
                            if(col){name=$d.domdata(col,"name")}
                        }
                    }
                    if(name){
                        cx.column=this.store.meta.findField(name)
                    }
                }
          }

            if(cx.record ){return cx}
        }

        _proto.afterRender=function  afterRender( ){
              this.updateMsg();
             this.resize();
            //ths.domcomponents.gridWrap.scrollTop=0;
            if(this.config.viewmode=="block"){
                this.domcomponents.gridWrap.css({overflow:"auto"})
            }
            this.fire("afterrender");

        }
        _proto._resize= function _resize(w,h){
            var gridctx=this,Dom=$d,outer=gridctx.domcomponents.outer,
                rdm=outer.getBoundingClientRect(),
                wr= gridctx.domcomponents.gridWrap,
                ftr=outer.q(".grid-footer"),
                 hd=outer.q("table thead"),
                  clnhdr=gridctx.domcomponents.headerclone,
            info=gridctx.domcomponents.hdrInfo()
            var oht=rdm.height;
            //if(!outer.el.style.height && gridctx.domcomponents._h){oht=gridctx.domcomponents._h}
            if(oht &&wr ){
                var t=0//clnhdr?(info.bottom-4):info.top;
                var css={w: (rdm.width-8)}
                //if(gridctx.scrollable && gridctx.domcomponents._h!==oht){
                var frhd=outer.q(".grid-frame-header")
               if(frhd){t=frhd.offsetHeight}
                if(clnhdr){t += clnhdr.offsetHeight}
                if(t){css.top=t;}
                     //css.top=t;
                     css.h=oht-((ftr?ftr.offsetHeight:0)+(t))
                      gridctx.domcomponents._h=rdm.height
                    if(!outer.el.style.height){
                         //outer.el.style.height=$d.css(outer,"height")
                    }
             }
                Dom.css(   wr,css)
               if(clnhdr){
                  /// clnhdr.css({top:info.top,width:rdm.width-8,overflow:"hidden"})
               }



            if(this.config.viewmode=="tile"){
                this.domcomponents.rowset.css("width",this.domcomponents.gridWrap.width())
            }
            // if(wr.scrollHeight>wr.offsetHeight){wd=wd-14}
            //if(dm.width){Dom.css(tab,{width:(dm.width )+"px"});}
            var hndl=this.fire("afterresize")
        }
        _proto.getRow= function getRow(row){
            return this._rowModel(row)
        }
        _proto.findRow= function findRow(row){
            var model=this.getRow(row)
            if(model){
                return model.row
            }

        }
        _proto.cellAsWidget= function cellAsWidget(row,cell){
            var cl,c0l,row= this.getRow(row)
            if(row){
                return row.getCell(cell)
            }

         }
        _proto.resize= function _resize (w,h){
            if(!this.domcomponents.outer.isVisible(true)){this._needsRedraw=true;return}
            this._resize()}
        _proto.syncColWidths=function(){
            var tabhdr=this.domcomponents.gridWrap.q(".grid-tab .grid-header");
            var clonehdr=this.domcomponents.outer.q(".headerclone")||this.domcomponents.tabheader;
            clonehdr.style.overflow="hidden" ;//clonehdr.style.width=wr.style.width
            var clonehdrrow=clonehdr.firstElementChild
            //var hdrcell=this.domcomponents.gridWrap.q(".grid-tab .grid-header .grid-row .grid-header-cell:nth-child("+($d.at(t)+1)+")").el
            var clonecells=clonehdr.querySelectorAll(".grid-header-cell"),
                cells=tabhdr.querySelectorAll(".grid-header-cell")

            if(clonehdrrow && tabhdr.offsetWidth>0 && tabhdr.offsetWidth!=clonehdrrow.offsetWidth){

                _arrayEach(cells,function(it,i){
                    if(!it.offsetWidth){return}
                    clonecells[i].style.minWidth= clonecells[i].style.maxWidth=clonecells[i].style.width= (it.offsetWidth )+"px"
                })  ;
                //clonehdrrow.style.width=gridctx.domcomponents.tab.scrollWidth+"px"
                if(tabhdr.offsetWidth!=clonehdrrow.offsetWidth){
                    setTimeout(function(){
                        _arrayEach(cells,function(it,i){if(!it.offsetWidth){return}
                            clonecells[i].style.minWidth= clonecells[i].style.maxWidth=clonecells[i].style.width= (it.offsetWidth )+"px"
                        })  ;
                     },500)
                }
            }
        }
        _proto.setupDataEvents=function(){
            var store=this.store
            //Evnts
            store.on("dataloadprogress.gridloadobserver",this.updateMsg.bind(this));

            if(!this.config.infiniteScroll){
                /*this.pager.on("update", function(){
                    var res=this.pager.getPage(function(d){
                        this._renderer.renderRows(this.store.records);
                    }.bind(this))

                }.bind(this));
                */

            }


            store.on("data",function(ev){
                var type=ev.action||ev.type,bult=this._built
                 if(type=="load") {
                    this._renderer.renderRows();
                } else if((type=="delete"||type=="insert"||type=="update")) {
                     if (!bult) {return }

                     if(!(ev.record&& ev.record.id)){
                         console.log("no id for record")
                         return
                     }

                    this.store.applySortAndFilter(this.pager)
                     if (type == "delete" && this.store.findById(ev.record.id)){
                         //this.store
                     }

                    if (type == "delete" || type == "insert") {

                        this._renderer.renderRows();
                    } else if (type == "update" && ev.record) {
                        var r = this.getRow(ev.record);
                        if (! (r && r.row)) {
                            this._renderer.redraw()
                        }
                        else if(!this.config.ignoreupdate){
                            r.render();
                        }
                    }

                }

            }.bind(this));
            this.on("rowselected",function(cx){
                this.selectedRecord=cx.record;
            });
            this.on("viewupdate afterpageload",this.updateMsg.bind(this));

        }
        _proto.updateCell=function(rec,fld){
            var r=this.getRow(rec,fld)
            if(r&&fld){
                var cl=r.getCell(fld)
                //var cl=r.down('.grid-cell[data-datakey="'+fld+'"]')
                if(!cl){return}
                var f=this.store.meta.findField(cl.name)
                if(f&&cl.content){
                    var s= f.getDisplayValue(r.record.get(f.name))
                    if(s){
                        cl.content.html(s)
                    }
                }
            }
        }


        return Klass("View.DataGrid" ,_proto);
    })();


    /*Layout.impl.DataGrid=Klass("DataGrid",Layout.impl.base,{priority:10,
     setup:function(){

     },
     layout:function(){

     }

     }) ;
     */






//plugins
     DataGrid.plugins={
        layoutoptions:function(grid){
            var gridctx=grid,Dom=DomCore,_isactive=false,blocktemplate

            function onSelect(t){
                var k=$d.domdata(t,"key"),curr=gridctx.config.viewmode
                if(k&&k!=gridctx.config.viewmode){
                    gridctx.config.viewmode=k;
                    if(k=="table"){
                        blocktemplate=blocktemplate||gridctx.config.rowtemplate
                        gridctx.config.rowtemplate=null
                    }  else{
                        gridctx.config.rowtemplate=blocktemplate
                    }
                    gridctx.domcomponents.outer.hide().css("opacity",0.1).show()
                    gridctx.domcomponents.outer.removeClass("viewmode-"+curr)
                    gridctx.domcomponents.outer.addClass("fxtx")
                    setTimeout(function(){
                        gridctx.domcomponents.outer.css ("opacity", 1)
                         gridctx._renderer.renderRows(null,false,true)
                               setTimeout (function(){
                                 gridctx.domcomponents.outer.removeClass ("fxtx")
                             }, 1000)

                    },1)
                }
            }
            return {   label:"Loayout Options",
                setup:function(){


                    return this},
                activate:function(ev,el){
                    if(!_isactive){

                        _isactive=true;
                        blocktemplate=gridctx.config.rowtemplate
                        gridctx.config.rowtemplate=null

                        var dom=gridctx.domcomponents.toolbar.append("<span class='layout-options'><img valign='center'  src='theme/img/gridview.gif' class='layout-option' data-key='table' title='Grid View' /><img valign='center' src='theme/img/blockview.gif' class='layout-option' title='Tile View' data-key='tile'/></span>")
                        dom.st("img").css({border:"1px solid #ccc", margin:"0 2px"})
                        dom.on("click",function(ev,el){
                            el&&el.is(".layout-option")&&onSelect.call(gridctx,el)
                        },".layout-option")

                    }
                },
                remove:function(){_isactive=false;}
            };
        },
        colMove  :function(grid){
            var gridctx=grid,Dom=DomCore,_isactive=false,sel=".grid-header-cell",tracker=null
            return {   label:"Move Columns",
                setup:function(){

                    _isactive=true
                },
                activate:function(ev,el ){
                    var maxz=0,elhdr=gridctx.domcomponents.headerclone||gridctx.domcomponents.tabheader
                   var  optns= {
                       target:el,
                       start: function start(ev) {
                            var t = ev.el, dm = t.bounds()
                            var trgt = t.data("_sh"), l = t.offsetLeft
                            if (!trgt) {
                                var wr = gridctx.domcomponents.gridWrap, dm = t.bounds(), rdm = wr.getBoundingClientRect()
                                var sh = document.createElement("div");
                                sh.classList.add("col-resize-shadow");
                                $d.css(sh, {
                                    left: dm.left + "px",
                                    top: dm.top + "px",
                                    height: (rdm.bottom - (dm.top)) + "px",
                                    w: dm.width + "px",
                                    cursor: "col-resize"
                                });
                                sh = $d(document.body.appendChild(sh));
                                t.data("_sh", sh)
                                trgt = sh;
                            }
                            if (!maxz) {
                                $d.css(document.body, {cursor: "move"}).addClass("noselection");
                                maxz = elhdr.qq(sel).reduce(function (z, it) {
                                    return Math.max(z, Number($d.css(it, "zIndex")) || 0)
                                }, maxz || 0)
                                $d.css(trgt, "zIndex", ++maxz);
                            }
                        },
                        move: function move(ev) {
                            var el=ev.el
                             var trgt = el.data("_sh"), l = el.offsetLeft
                            if (!trgt) {
                                return
                            }

                            $d.css(trgt, "left", l + ev.data.delta.x)
                            var t1, b = $d.bounds(trgt), t, delta = ev.data.delta;
                            $d(trgt).hide()
                            t = document.elementFromPoint(b.left, b.top);
                            if (t) {
                                t1 = elhdr.qq(sel).filter(function (a) {
                                    return a.contains(t)
                                })[0];
                            }
                            ;
                            if (!t1) {
                                t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
                                t1 = elhdr.qq(sel).filter(function (a) {
                                    return a.contains(t)
                                })[0];
                            }
                            $d(trgt).show();
                            $d.data(this, "_current", t1 || null)

                        },
                        end: function end(ev) {var el=ev.el
                            var trgt = el.data("_sh")
                            var _current = $d.data(el, "_current"), s = $d.data(el, "_start");
                            $d.data(el, "_start", null);
                            $d.data(el, "_current", null)
                            $d.data(el, "_sh", null)
                            $d(document.body).css({cursor: "auto"})
                            if (trgt) {
                                $d.remove(trgt)
                            }
                            maxz = 0
                            if (_current) {
                                var nuidx = _current.at();

                                var idx = el.at();
                                if (nuidx == idx) {
                                    return
                                }
                                (gridctx.getColumnCells(idx + 1, true, true) || []).forEach(
                                    function (it) {
                                        //var t=it.parent().q(".grid-header-cell:nth-child("+nuidx+"),.grid-cell:nth-child("+nuidx+")")
                                        var t = it.sibling(nuidx - idx)
                                        if (!t) {
                                            return
                                        }
                                        it.parent().el.insertBefore(it.el, t.el.nextSibling)
                                    }
                                )

                            }
                        }
                    }
                    $d.on(el,"mousedown.mousetracker",function(){
                        $d.trackMouse(optns)
                    })
                  
                },
                remove:function(){_isactive=false;}
            };
        },
        colResize  :function(grid){
            var gridctx=grid,Dom=DomCore,_isactive=false,domhandle=null,dragging=0

            function onSelect(ev,t){
                if( !t ){
                    $d.css(document.body,{cursor:"auto"});
                    return
                }
                t= t.el||t
                var   wr= gridctx.domcomponents.gridWrap,dm=t.getBoundingClientRect(),rdm=  wr.getBoundingClientRect(),
                    st={x:ev.clientX,y:ev.clientY};
                // Dom.css(getOverlay(wr),{display:"block"}); ;

                Dom.css(document.body,{cursor:"col-resize"}).addClass("noselection");
                var tabhdr=gridctx.domcomponents.gridWrap.q(".grid-tab .grid-header");
                var clonehdr=gridctx.domcomponents.outer.q(".headerclone")||gridctx.domcomponents.tabheader;
                clonehdr.style.overflow="hidden" ;//clonehdr.style.width=wr.style.width
                var clonehdrrow=clonehdr.firstElementChild
                var hdrcell=gridctx.domcomponents.gridWrap.q(".grid-tab .grid-header .grid-row .grid-header-cell:nth-child("+($d.at(t)+1)+")").el
                var clonecells=clonehdr.querySelectorAll(".grid-header-cell"),
                    cells=tabhdr.querySelectorAll(".grid-header-cell");;
                tabhdr.st(".grid-header-cell").css("color",tabhdr.css("backgroundColor"))
                 var maxz=0
                  $d.on(t,"mousedown.mousetracker",function(){
                        $d.trackMouse(
                            {target:t,
                        start:function(ev){
                            dragging=1
                            var t=ev.el,dm=t.bounds()
                            var trgt=ev.el.data("_sh"),l=t.offsetLeft
                            if(!trgt) {//var t=this;
                                var wr=gridctx.domcomponents.gridWrap, dm=t.bounds (), rdm=wr.getBoundingClientRect ()
                                trgt=document.createElement ("div");
                                trgt.classList.add ("col-resize-shadow");

                                $d.css (trgt, {left: dm.left + "px", top: dm.top + "px", height: (rdm.bottom - (dm.top)) + "px", w: dm.width + "px", cursor: "col-resize"});
                                t.data ("_sh", trgt=$d (document.body.appendChild (trgt)))
                            }
                            if(!maxz) {
                                $d.css(document.body,{cursor:"move"}).addClass("noselection");
                                $d.toFront(trgt);
                            }
                        }
                        ,move:function(ev){
                            var trgt=ev.el.data("_sh"),l=t.offsetWidth
                            if(trgt&&ev&&ev){
                                $d.css (trgt,{left:dm.left,top:dm.top,width:Math.max(10,(l+ev.delta.x))}).toFront()
                            }

                        },
                        end:function(ev){
                            $d.css(document.body,{cursor:"auto"});
                            try{   var Dom=$d
                                var sh=ev.el.data("_sh")
                                ev.el.data("_sh",null)
                                if(!sh){dragging=0;return}
                                var idx,outer=gridctx.domcomponents.outer,p= t.parentNode,div= t.firstElementChild,wd=sh.offsetWidth ,
                                    _setwidths=gridctx.domcomponents.setwidths;
                                for(var i= 0,l=$.makeArray(p.children);i< l.length;i++){if(l[i]===t){idx=i;break;}} ;
                                if(idx>=0){
                                    //,td:nth-child("+(idx+1)+") .cell-content
                                    _arrayEach( outer.querySelectorAll(".grid-header-cell:nth-child("+(idx+1)+") ,col:nth-child("+(idx+1)+"),td:nth-child("+(idx+1)+")"),function(it){
                                        _setwidths(it.style,(wd-hdrwdoffst)+"px");
                                    })  ;
                                }
                                //gridctx.domcomponents.tab.scrollWidth&&$d.css({width:gridctx.domcomponents.tab.scrollWidth})
                                gridctx.syncColWidths()
                                //gridctx.domcomponents.tab.scrollWidth&&$d.css(clonehdrrow,{width:gridctx.domcomponents.tab.scrollWidth})

                            } finally{  dragging=0
                                // if(wr){wr.style.display=""}
                                //  Dom.css(getOverlay(wr),{display:"none"}) ;
                                if(sh){ sh.remove();sh=null;   }
                                $d.removeClass(document.body,"noselection")
                                $d.removeClass(gridctx.domcomponents.outer,"resizing")
                                _isactive=false;
                            }

                        }
                    })
           
                     })
                     

            }
            return {   label:"Resize Columns",
                setup:function(){
                    grid.on("render",function(){})
                    return this},
                activate:function(ev,el){
                    if(!_isactive){
                        var _last=null,compo=gridctx.domcomponents,header=compo.headerclone||compo.tabheader
                        if(!domhandle){
                            domhandle= header.append("<div>").addClass("col-resize-handle").css({position:"absolute",height:20,width:12,cursor:"col-resize",background:"url(theme/img/colresize_handle.png) no-repeat"})
                            domhandle.on("mousedown",function(ev){
                                if($d(this.data("_cell"))){
                                    $d(this.data("_cell")).up(".gridtable")
                                    onSelect(ev,$d(this.data("_cell")))
                                    _last=null
                                    ev.stopPropagation()
                                }
                            })
                        }
                        var offset=null
                        domhandle.hide()
                        _isactive=true;

                        header.on("mousemove",function(ev){
                            if(dragging){domhandle.hide();return}
                            if(!offset){
                                var par=$d.getOffsetParent(domhandle);
                                if(!par){return}
                                offset=header.bounds().top-par.bounds().top
                            }
                            var cell=$d(ev.target).selfOrUp(".grid-header-cell");
                            if(cell&&cell.id&&cell.id!==_last){  _last=cell.id
                                var b1=header.bounds(),b=cell.bounds()
                                domhandle.css({top:offset +   (b.height-20)/2,left: (b.right-b1.left)-6}).show().data("_cell",cell.id)
                             }

                         })
                     }
                },
                remove:function(){_isactive=false;}
            };
        },
        sortable:function(grid){
            var gridctx=grid   ,Dom=DomCore, _isactive =0
            function handleSort(ev,checked){
                if(!_isactive){return}
                var t=Dom.is(ev.target,".grid-header-cell")?$d(ev.target):Dom.up(ev.target,".grid-header-cell"),p,idx;
                if(!t){return}

                p=t.parentNode;idx=Dom.domIndex(t)
                var tab=Dom.up(t,".gridtable");if(!tab){return}
                var c=tab.q(".grid-tab col:nth-child("+(idx+1)+")");
                var nm=c? $d.domdata(c,"name"):"";

                if(nm){
                    gridctx.on("afterrender",function(){
                        gridctx.domcomponents.outer.qq(".grid-header-cell.sort-a,.grid-header-cell.sort-d").removeClass(["sort-d","sort-a"])
                        t.addClass("sort-"+gridctx.pager.sortdir)
                    },{once:true})
                    gridctx.pager.applySort(nm);
                    if(gridctx.pager.isCachedLocal){
                        gridctx.domcomponents.resetscroll()
                        gridctx._renderer.renderRows();
                    }


                    //c.addClass()
                }
            }
            return {   label:"Sort Columns",
                setup:function(){
                    if(_isactive){return}
                    _isactive=true;
                    gridctx.domcomponents.outer.addClass("issortable")
                    //grid.domcomponents.outer.on("click",
                    /*grid.domcomponents.outer.on("click.grid-header-cell",
                        function(ev,el){
                             handleSort.call(el,ev,true ) ;
                        },".grid-header-cell" );
                        */
                    return this;
                },
                activate:function( ev,el){
                    handleSort.call(el,ev,true ) ;
                },
                remove:function(){_isactive=false;}
            };

        },
        scrollable:function scrollable(grid){
            var   _isactive=0,cmp=grid?grid .domcomponents:null,Dom=DomCore,rowhdrht=0;
            function sethdht(){
                var hd=this
                var setStyle=$d.css.setStyle
                if(hd){
                    Dom.qq(hd,".grid-header-cell,.grid-row").forEach(function(c){

                        setStyle(c,"lineHeight","1px")
                        setStyle(c,"height","1px")
                        //c.style.lineHeight= "1px";c.style.height= "1px";
                        c.style.overflow= "hidden"
                    })

                        setTimeout(function(){
                            var b=grid.domcomponents.tab.bounds(),d=grid.domcomponents.tab.parent().bounds().left-b.left;
                            if(grid.domcomponents.headerclone){
                                $d.css(grid.domcomponents.headerclone,{left:( 1-d)})//,width: b.width
                            }
                        },10)



                    // hd.style.marginTop="-"+hd+"px";
                    //   hd.style.position="absolute"
                }
            }
            function onresize(){  if(!_isactive){return}
                if(grid.domcomponents.headerclone){
                    synchdrwidths( );
                }
                proc()
            }
            function setwidths(st,w){ if(w&&w!="0px"&&w!="0"){st.maxWidth=st.minWidth=st.width=w}}
            function synchdrwidths (hd0,cl0){   if(!_isactive){return}
                 var gridctx= grid,   Dom=$d, cmp=gridctx.domcomponents,_setwidths=setwidths, hd=hd0||cmp.tabheader, cl=cl0||cmp.headerclone;
                var firstrow=cmp.row(0);
                if(!(firstrow&&cl)){return}
                try{
                    var setStyle=$d.css.setStyle
                    hd.style.display="";hd.visibility="visible"
                    var cls=[];
                    [].forEach.call(firstrow.querySelectorAll(".grid-cell"),
                        function(it,i){
                            cls.push({width:Number(Dom.css(it,"width").replace(/[\D]+$/,""))})
                        }
                    );

                     _arrayEach(cl.querySelectorAll(".grid-header-cell .cell-content,.rownum"),
                        function(it,i){
                             if(!it.classList.contains("rownum") && cls[i]) {
                                 var par=it.parentNode
                                 setStyle(par, "width"  , cls[i].width + "px")
                                 setStyle(par, "minWidth", cls[i].width + "px")
                                 setStyle(par, "maxWidth", cls[i].width + "px")
                             }
                                 //cls[i] && _setwidths(it.parentNode.style,(cls[i].width )+"px");}
                         }
                    );

                    if(cls.length){
                        firstrow.classList.add("_widthadjusted");
                        _arrayEach(firstrow.querySelectorAll(".grid-cell .cell-content,.rownum"),
                            function(it,i){if(cls[i]==null){return}
                                //_setwidths(it.style,(cls[i].width)+"px");
                                var par=it.parentNode
                                setStyle(par, "width", cls[i].width + "px")
                                setStyle(par, "minWidth", cls[i].width + "px")
                                setStyle(par, "maxWidth", cls[i].width + "px")
                                //_setwidths(it.parentNode.style,(cls[i].width)+"px");
                            });
                        cmp.colset.forEach(function(it,i){
                            setStyle(it, "width", cls[i].width + "px")
                            //it.css({w:(cls[i].width)+"px"})
                        });
                    }

                } finally{
                    if(!rowhdrht&&hd.offsetHeight>10){rowhdrht=hd.offsetHeight; }

                    hd.style.visibility="hidden";
                 }
             }
            function proc(refresh){  if(!_isactive){return}
                var gridctx=grid,cmp=gridctx.domcomponents,
                    hd=cmp.tabheader,
                    hdcln=cmp.outer.querySelector(".headerclone"),
                    cl

                if(!cmp.gridWrap.querySelector(".grid-rowset .grid-row .grid-cell")){
                    return}
                cmp.gridWrap.css({overflow: "auto",position:"relative"})

                if(!hdcln){refresh=0}
                if(refresh===true){
                    if(hdcln) {hdcln.parentNode.removeChild(hdcln)}
                    hdcln=null;
                }
                if(hdcln||!hd){
                    if(hd){sethdht.call(hd)}
                    return
                }

                //Dom.st(cl,".grid-header-cell" )
                var   hi=cmp.hdrInfo() ;
                cl= cmp.outer.appendChild(hd.clone(true,true));
                cl.classList.add("headerclone")  ; cl.style.display="" ;
                hd.style.display="";
                var bg=Dom.css(hd,"backgroundColor")
                var setStyle=$d.css.setStyle
                $d(hd).qq(".grid-header-cell").forEach(function(it){setStyle(it,"color",bg)});
                Dom.css(cl,{visibility:"visible", z:50,l:"0",w:"auto"});//t:hi.top+"px",h: (hi.height)+"px",
                setStyle(cl,"top",hi.top+"px")
                setStyle(cl,"height",hi.height+"px")
                Dom.qq(cl,".grid-header-cell").forEach(function(c){
                    setStyle(c,"lineHeight",hi.height+"px")
                    setStyle(c,"height",hi.height+"px")
                    //c.style.lineHeight= c.style.height= hi.height+"px";
                });
                var h2=hi.height+4
                Dom.qq(cl,".grid-row").forEach(function(c){
                    setStyle(c,"lineHeight",h2+"px")
                    setStyle(c,"height",h2+"px")
                    //c.style.lineHeight= c.style.height= (hi.height+4)+"px";
                })
                setStyle(cl,"height",h2+"px")
                //cl.style.height=(hi.height+4)+"px";
                 var hdrrow=hd.firstElementChild;
                hdrrow.style.overflow="hidden";
                //hdrrow.style.height="1px";   //hdrrow.style.lineHeight=hd.style.lineHeight= d.style.height= "1px";
                setStyle(hdrrow,"height","1px")
                Dom(cl).on( "mousedown",
                    gridctx.domcomponents.handleheaderSel.bind(gridctx.domcomponents)
                );

                if(!refresh){
                    grid.on("scroll",function(ev){
                        sethdht.call(cmp.tabheader)
                    });
                    //ths.domcomponents.gridWrap.scrollTop=0;

                    sethdht.call(cmp.tabheader)
                    gridctx.on("viewupdate afterpageload ",function(){
                        sethdht.call(this.domcomponents.tabheader)
                    });
                } else{sethdht.call(cmp.tabheader)}
                //cmp.gridWrap.style.top=hi.bottom+"px"  ;
                synchdrwidths( hd,cl)
                return cl
            }

            return {    label:"Scrollable",
                setup:function(){
                    this.activate();
                    grid.on("pageload",function(){ proc(true) })
                    return this;
                },
                activate:function(){    _isactive   =1
                    onresize()
                    grid.domcomponents.gridWrap.css({overflow: "auto",position:"relative"})
                     grid.domcomponents.outer.addClass("scrollable")
                    grid.on("viewupdate afterrender afterresize", onresize );


                },
                remove:function(){_isactive=false;}
            };

        },
        headerFilter: function setupHeaderFilter(grid){
            var _isactive=0,filterholder=null,config=grid.config.headerFilter;
            if(!$.isPlain(config)){config={}}
            function setup(){
                if(grid.config.filterContainer && !$d.q(grid.config.filterContainer,".grid-filter")){
                    var filters=grid.filters||(grid.filters=[]),
                        tip="<span class='grid-filter-tip' style='float:left;margin-top:0;margin-left:20px;padding:0 3px;border: 1px solid #ccc;color:#666;font-size:.9rem;background-color:white;'>Add filter</span>";
                    var  colLkupMap={},Core=self.CoreUtils      , eltemplateEl, eltemplate="" +
                        "<span class='filter-elem-wrap'> " +
                        "  <div class='filter-elem_ph'></div>" +
                        "  <div class='filter-elem'></div>" +
                        "  <div class='filter-elem-add'>+</div>" +
                        "</span>";

                    grid.config.filterContainer.insert("<div class='ui-lighter grid-filter'>" +
                        "  <div class='bluegrdnt grid-filter-stub'> </div>" +
                        "  <div class='content grid-filter-content  ui-lighter'>"+tip+"</div>" +
                        "</div>").q(".grid-filter-content")
                    var wrap=grid.config.filterContainer.q(".grid-filter-content")
                    filterholder=new Data.criteria({meta:grid.store.meta});
                    var PopupView= $.require("PopupView")
                    var controller={
                        removeElement:function(fltritem,v,anchor){
                            filterholder.remove(fltritem.col,v )
                        },
                        showColList:function(fltritem,v,anchor){

                            var vw= null//wrap.data("_colpopup")
                            if(!vw){
                                vw=PopupView.lookupList(
                                    {keyname:"name",labelname:"label",

                                        list:grid.store.meta.collect(function(it){return {name:it.name,label:it.label}}).slice()
                                        .filter(function(a){return a.name != "id" && a.label && a.label.length>1 && (!config.filterColumns || config.filterColumns.indexOf(a.name)>=0 ) && (!config.ignoreColumns || config.ignoreColumns.indexOf(a.name)==-1 )})
                                    },
                                    {maxWidth:250,minWidth:100,
                                    anchor:anchor,
                                        callback:function(rec){var ky=rec.name,lbl=rec.label

                                            if(!filterholder.findElement(ky)){filterholder.append(ky)}
                                            var fltritem=filterholder.findElement(ky);
                                            //var anchor=$d.selfOrUp(([].slice.call(document.querySelectorAll(":hover"))).pop(),".list-item")
                                            controller.showValList(fltritem,ky,anchor,lbl )
                                            vw.hide();
                                            //filterholder.append(ky,"","=",lbl,true);
                                            //controller.updateView(fltritem,v,anchor,function(){
                                            //    controller.showValList(ky,v,vw.config.anchor )
                                            //})

                                        }
                                });

                                wrap.data("_colpopup",vw)
                                /*wrap.data("_colpopup",vw=View.lookupList({anchor:anchor,width:150,height:200, bottomAligned:true ,
                                    keyname:"name",labelname:"label" ,list:{list:grid.store.meta.collect(function(it){return {name:it.name,label:it.label}}).slice().filter(function(a){return a.name != "id" && a.label && a.label.length>1})}
                                },function(ky,lbl){
                                    if(!filterholder.findElement(ky)){filterholder.append(ky)}
                                    fltritem=filterholder.findElement(ky)
                                    controller.showValList(fltritem,v,vw.config.anchor )
                                    //filterholder.append(ky,"","=",lbl,true);
                                    //controller.updateView(fltritem,v,anchor,function(){
                                    //    controller.showValList(ky,v,vw.config.anchor )
                                    //})

                                }))*/
                            }
                            if(vw.config.options){vw.config.options.anchor=anchor}
                            else{vw.config.anchor=anchor}
                            vw.show( ) ;
                        },
                        showValList:function(fltritem,v,anchor,lbl){
                            //b,col,upd
                            //var vw= wrap.data("_wrappopup"),k= fltritem.col;
                            //if(!vw){
                                var vw=PopupView.lookupList([],
                                    {alignAnchor:"below" ,maxWidth:250,minWidth:150,
                                        callback:function(rec){
                                        var v=rec.name||rec.id,lbl=rec.label
                                        if(v==null){return}
                                        var col= vw.config.col,idx=vw.config.isupdate[0],lkupdata=vw.lkupdata;
                                        if(lkupdata && !lbl){
                                            for(var i= 0,l=lkupdata.list||lkupdata ,ln=l.length||0;i<ln;i++){
                                                if(l[i].id==v ){
                                                    lbl=l[i].label||l[i].value||v
                                                }
                                            }

                                        }
                                        if(idx>=0){
                                            filterholder.update(col,v,lbl,idx)
                                        }
                                        else{
                                            filterholder.append( col,v,null,lbl)
                                        }
                                            vw.hide()
                                        //var fltritem2=filterholder.findElement(col)
                                        //controller.updateView( fltritem2,idx,null,null)
                                    }}
                                )
                                /*wrap.data("_wrappopup",vw=View.lookupList({uiklass:"nowrap",anchor:anchor,width:250,height:200, bottomAligned:true},
                                    function(v,lbl){if(v==null){return}
                                        var col= vw.config.col,idx=vw.config.isupdate[0],lkupdata=vw.lkupdata;
                                        if(lkupdata && !lbl){
                                                for(var i= 0,l=lkupdata.list||lkupdata ,ln=l.length||0;i<ln;i++){
                                                    if(l[i].id==v ){
                                                        lbl=l[i].label||l[i].value||v
                                                    }
                                                }

                                        }
                                        if(idx>=0){
                                            filterholder.update(col,v,lbl,idx)
                                        }
                                        else{
                                            filterholder.append( col,v,null,lbl)
                                        }
                                        //var fltritem2=filterholder.findElement(col)
                                        //controller.updateView( fltritem2,idx,null,null)
                                    }))
                            }*/
                            vw.contentWrap.css("backgroundColor","#f9f9f9")
                            vw.config.col=fltritem.col;
                            vw.config.isupdate= [typeof(v)=="number"&&v>=0?v:-1];
                            $d.html(vw.config.header,"<h4>"+(fltritem.title||lbl||v||"")+"</h4><input type='search' style='width:100px;' class='search-box'/><span style='display: inline-block;margin-left:10px;' class='item-count'></span>")
                            var srchbox=$d(vw.config.header).q(".search-box")
                            srchbox.on("click",function(ev){
                                var val=this.val()
                                if(val){
                                    if(this.bounds().right-ev.x <20){
                                        this.val("");
                                        var items=this.up(".popup-view").qq(".list-item")
                                        items.css("display","block");
                                        this.up(".popup-view").q(".item-count").html(items.length)
                                    }
                                }
                            })
                            srchbox.on("keyup",function(ev){
                                var cnt= 0,val=this.val(),items=this.up(".popup-view").qq(".list-item")
                                if(val){val=val.toLowerCase()
                                    items.each(function(a){
                                        var vis=$d.text(a).toLowerCase().indexOf(val)>=0
                                        vis && cnt++;
                                        a.css("display",vis?"block":"none")
                                    })
                                } else{
                                    items.css("display","block")
                                    cnt=items.length
                                }
                                this.up(".popup-view").q(".item-count").html(cnt)
                            })
                            if(vw.config.options){vw.config.options.anchor=anchor}
                            else{vw.config.anchor=anchor}
                            var f=grid.store.meta?grid.store.meta.findField(fltritem.col):null
                            var crit
                            if(f&& !( f.primaryEntity)){
                                crit=grid.store.defaultCriteria
                            }
                            filterholder.getLookupList(fltritem.col,false,crit ).then(function(data){
                                vw.renderList(data,{anchor:anchor})
                                var list=data.data||data.list||data
                                vw.el.q(".item-count") && vw.el.q(".item-count").html(list.length)
                                //vw.lkupdata=data
                                vw.show( ) ;//data,anchor

                            });
                        },
                        updateView:function( fltritem,v,anchor,cb){

                            var  curr=grid.pager.filter||"";
                             var redrw=false;
                            if(filterholder.empty()){
                                grid.pager.filter="_clear_" ;
                                grid.pager.loadPage()
                            } else {
                                var js=grid.pager.isCachedLocal?filterholder.toJs(grid.pager.isCachedLocal):filterholder.toSql();
                                 if(grid.pager.update({filter:js})){
                                     grid.pager.loadPage()
                                }
                            }
                            //  if(redrw){ grid._renderer.redraw()  }
                            wrap.clear();
                            filterholder.collect(function(k,mdl){
                                if(mdl==null||mdl==""){return}
                                var nu=wrap.q("[data-key='"+k+"']")
                                var val=mdl.val,title=String(  mdl.title||k).trim()
                                var lst=[]
                                if(  val &&val.length){
                                    val=val.filter(function(it){return !(it.value==null||it.value=="undefined")})
                                    val.elem=nu;
                                    lst=val
                                }
                                if(  !lst.length ){
                                    return;
                                }
                                 if(!nu){
                                    if(!eltemplateEl){ eltemplateEl=$d(eltemplate) }


                                    nu=addel?addel.before(eltemplateEl.el.cloneNode(true)):wrap.append(eltemplateEl.el.cloneNode(true))
                                    nu.dataset.key=k   ; //nu.dataset.index=idx;
                                    nu.q(".filter-elem_ph").html(title )//.append("<div class='filter-elem-remove'>x</div>")
                                }


                                    var addel=nu.q(".filter-elem-add"),lkup;
                                    filterholder.getLookupList(k).then(function(data){
                                        lkup=data
                                    });
                                     lst.forEach(function(v){if(v==""||v==null){return}
                                        if(typeof(v)!="object"){v={value:v,label:v}}
                                        var el=nu.q(".filter-elem")||$d(nu.append("<div class='filter-elem'></div>"));
                                        var v1=v.value,cln=el.el.cloneNode(true),lbl=String(  v.label||v1).trim();cln.id="";
                                         if(addel){cln=addel.before(cln)}
                                        else{cln=  nu.append(cln );}


                                        cln.html(lbl);
                                        cln.append("<div class='filter-elem-remove'>x</div>")
                                        cln.title=cln.dataset.val=v1
                                    });
                                    var all=nu.qq(".filter-elem");
                                    if(all.length>1){all.forEach(function(it){if(!String(it.textContent).trim()){nu.el.removeChild(it.el||it)}})}
                                    nu.addClass("has-value") ;
                                    // nu.addClass("has-value").q(".filter-elem").html(  lbl)
                                //} else{ nu&&nu.removeClass("has-value")}
                                return nu
                            })  ;

                            wrap.append(tip)
                            grid.fire("viewupdate" );
                            wrap.qq(".filter-elem-wrap").forEach(function(it){if(it.scrollWidth-it.offsetWidth>0){it.style.width=(it.scrollWidth+1)+"px"}})
                            if(typeof(cb)=="function"){cb()}
                        }
                    }
                    filterholder.on("change",function(){
                        controller.updateView();
                    })
                     wrap.on("mousedown",function(evt){
                        if(evt.which==3||!_isactive){return}
                         var act,idx,fltritem,r=UI.Rect.create(evt),v=null;
                        r.top=wrap.bounds().bottom
                        var elem=$d.selfOrUp(evt.target,".filter-elem-wrap")
                        if(elem && elem.contains(evt.target)){
                            var k=elem.dataset.key , el=elem

                            var c=filterholder.meta.findField(k)
                            if(c){fltritem=filterholder.findElement(c.name)}
                            if(!fltritem){
                                filterholder.append(c.name)
                                fltritem=filterholder.findElement(c.name)
                                if(!fltritem){return}
                            }
                            var felem=$d.selfOrUp(evt.target,".filter-elem");
                            if(felem){
                                v=felem.dataset.val;
                                var arr=[].concat(fltritem.val)
                                if(!v){return}
                                idx=arr.indexOf(arr.find(function(it){return it.value==v}))
                                if(idx>=0&&$d.selfOrUp(evt.target,".filter-elem-remove")){
                                    v=idx;
                                     act=controller.removeElement
                                } else{   v=idx>=0?idx:v;
                                    act=controller.showValList;
                                }

                            } else {
                                if($d.selfOrUp(evt.target,".filter-elem-remove")){
                                    act=controller.removeElement
                                } else{act=controller.showValList}
                            }
                        } else{act=controller.showColList}
                        if(act){act.call(controller,fltritem,v, evt.target)}

                    })
                }
                grid.headerFilter=this;
            }
            return {   label:"Header Filter",
                getCriteriaHolder:function(){return filterholder},
                setup:function(){
                    this.activate();
                    return this;
                },
                activate:function(){  _isactive=1
                    setup.call(this)
                },
                remove:function(){_isactive=false;}
            };
        } ,
        infiniteScroll:function setupInfiniteScroll(grid){  var _isactive=0;
            //wr wrap
            function setup(){
                var wrp=grid.domcomponents.gridWrap,doc=document,clht=wrp.clientHeight, store=grid.store , rowht=20,
                    _addrowsbound=grid._renderer.addrows.bind(wrp._renderer), tab=grid.domcomponents.tab,rowset=grid.domcomponents.rowset,lasrscroll=0
                    var pageCache={}
                    if(rowset.q(".activepage")){return}
                    var _firstlastview=function(){
                        var b=wrp.getBoundingClientRect()
                        var top,top1=doc.elementFromPoint(b.left+30,b.top+15),//,".grid-row"),
                            last=doc.elementFromPoint(b.left+30,b.bottom-15),curr={};
                        if(top1&&!top1.classList.contains("grid-row")){top1=$d.up(top1,".grid-row")}
                        if(last&&!last.classList.contains("grid-row")){last=$d.up(last,".grid-row")}
                        return {top:top1,last:last}
                    }
                    var _handle=function(){
                         //if(tdif>1000){
                        var pr=Promise.deferred(),grid=this ,msg=grid.domcomponents.loadmsg,
                            lastrow=grid.domcomponents.tab.querySelector(".grid-rowset .grid-row:last-child")

                        grid.pager.next()
                        var scrtp=wrp.scrollTop
                        grid.pager.getPage(false,function(records){
                            grid.observer.once("afterpageload",function(){
                               if( grid.pager.pageno==grid.pager.totalpages){
                                    if(cmp.rowset.tagName!="TBODY"){
                                        cmp.rowset.style.height="auto"
                                    }
                                }
                                 if(msg){msg.html("...")};pr.resolve()
                            });
                            grid._renderer.renderRows(records,true)
                            //if(lastrow&&lastrow.scrollIntoView){
                               // lastrow.scrollIntoView(false);lastrow.classList.add("selected")
                           // }

                        })
                            return pr;
                        //}
                    }.bind(grid);
                var cmp=grid.domcomponents,scrollTreshold=  50  ,pageheight=0 ,totalheight=0
                function _onscroll (ev){

                    var grid=this,store=grid.store,cmp=grid.domcomponents,wrp=grid.domcomponents.gridWrap,tab=cmp.tab,nw=Date.now(),tdif=nw-lasrscroll,
                        tp=wrp.scrollTop,oldtp=wrp._scrollTop  ,pager=this.pager
                    wrp._scrollTop=tp;
                    if((oldtp && oldtp>tp) || pager.pageno>=pager.totalpages){return}
                    var vw=_firstlastview()

                     if(oldtp && oldtp>tp){return}//if moving up return
                    var  pr,t=tab.offsetHeight,ch=wrp.clientHeight,tot=tp+ ch,
                        last=tab.querySelector(".grid-rowset .grid-row:last-child"),t1=0,b;
                    if(!last) {return}
                    b=last.getBoundingClientRect()
                    t1=(b.top+b.height+10) -  wrp.getBoundingClientRect().top
                    wrp._lastDiff= tot-t1;lasrscroll=nw;
                     if(t1<(2*ch) ){
                         pr=_handle();
                     }

                    if(wrp._scrollLeft===tp){return}
                    wrp._scrollLeft=tp ;

                    cmp.headerclone&&(cmp.headerclone.style.left=(1-wrp.scrollLeft)+"px");
                    return pr
                };
                if(!pageheight) {pageheight=cmp.rowset.offsetHeight}
                if(pager.totalpages){
                    totalheight=pageheight*pager.totalpages
                    if(cmp.rowset.tagName!="TBODY"){
                        cmp.rowset.style.height=totalheight+"px"
                    }
                }
                grid.on("scroll", $.throttle(_onscroll,10))
                if(pager.totalrows*rowht> wrp.offsetHeight){
                    // var el=wrp.insertBefore(document.createElement("div"),tab); el.classList.add("scroll-fit")
                    //    DomCore.css(el,{ h:( store.pager.totalrows*rowht)+"px"})
                }
            }
            return {    label:"Infinite Scroll",
                setup:function(){
                    this.activate();
                    return this;
                },
                activate:function(){
                    setup.call(this)
                },
                remove:function(){_isactive=false;}
            };
        },
        ColumnFreeze:function(grid){
            var _isactive= 0,wrp,numofcols= 2,outer,Dom=DomCore,optns={},gwrp,colcnt,bdy,wrphdrht= 0,hdr;
            var lastctx={},  doc=document
            function proc(){ if(!_isactive){return}
                var headerclone=grid.domcomponents.headerclone,
                    headerrow=headerclone?headerclone.q(".grid-row"):grid.domcomponents.tabheader.q(".grid-row"),ifo=grid.domcomponents.hdrInfo(),
                    wrpbdy= wrp?wrp.querySelector(".grid-rowset"):null,
                    wrp_hdr= wrpbdy?wrpbdy.previousElementSibling:null;
                var b=gwrp.getBoundingClientRect()    ,w10=(wrp?wrp.offsetWidth: b.width)+10
                var top,top1=doc.elementFromPoint(b.left+w10,b.top+15),//,".grid-row"),
                    last=Dom.up(doc.elementFromPoint(b.left+w10,b.bottom-15),".grid-row"),curr={};

                if(wrpbdy){[].forEach.call(wrpbdy.querySelectorAll(".grid-row"),function(r){curr[r.dataset.id]=r});}
                if(gwrp.scrollTop<20){
                    top=bdy.el.firstElementChild;
                } else if(top1 && !Dom.up(top1,".grid-rowset")){
                    top1.style.display="none";
                    top=Dom.up(doc.elementFromPoint(b.left+w10,b.top+15),".grid-row")
                    top1.style.display="";
                } else{top=Dom.up(top1,".grid-row")}

                if(headerclone && gwrp.scrollLeft>0) {headerclone.el.style.marginLeft=(0-gwrp.scrollLeft)+"px"}
                var i= 5,mx=150;
                while(!last){i=i+15;if(i>mx){break;}
                    last=Dom.up(doc.elementFromPoint(b.left+w10,b.bottom-i),".grid-row")
                }

                if(top && last){//top.style.backgroundColor="red";last.style.backgroundColor="red"
                    if(lastctx.top===top && lastctx.last===last  ) {return}
                    lastctx.top=top ;lastctx.last=last
                    last=last.nextElementSibling    ||last
                    last=last.nextElementSibling    ||last
                    var w= [],rw=top,idx=-1,//clrows=$.makeArray(wrpbdy.children),
                        tofset= top.getBoundingClientRect().top - headerrow.getBoundingClientRect().bottom ;

                    //   _syncset(hdr,wrp_hdr)
                    var nurows=[], ccnt=colcnt ,nunu=[]
                    while(rw){var _id=rw.dataset.id||"";
                        if( !w.length){
                            for(var i=0;i<ccnt;i++){w.push(rw.children[i].offsetWidth)}
                        }
                        if(_id && curr[_id]){   curr[_id].className=rw.className
                            nurows.push(curr[_id]);
                            delete curr[_id]
                        }
                        else {
                            var rw1=rw.cloneNode(false);  rw1.id="";
                            rw1.className=rw.className      ;  rw1.classList.add("grid-clone-row") ;
                            rw1.style.height=rw.offsetHeight+"px"
                            for(var i=0;i<ccnt;i++){ var c=rw.children[i];if(!(w[i] && c)){continue;}
                                var nu= c.cloneNode(true) ,stl=nu.style ;
                                stl.minWidth=stl.maxWidth=stl.width=w[i]+"px"//Dom.css(c,"width");
                                rw1.appendChild(nu)
                            }
                            nunu.push([rw1,rw])
                            nurows.push(rw1);
                        }
                        //_syncset(rw,rw1)
                        if(rw===last){break;}
                        rw=rw.nextElementSibling;
                    }
                    for(var k in curr){curr[k].parentNode && curr[k].parentNode.removeChild(curr[k])}
                    while(nurows.length){wrpbdy.appendChild(nurows.shift());}
                    for(var i=0;i<ccnt;i++){ var c=wrp_hdr.children[i];if(!(w[i] && c)){continue;}
                        var  stl=c.style ;
                        stl.minWidth=stl.maxWidth=stl.width=w[i]+"px"//Dom.css(c,"width");
                    }
                    wrpbdy.style.marginTop=Math.min(0,tofset )+"px";
                    var  ww= w.reduce(function(m,it){return m+it},0) ;
                    if(ww>50){wrp.style.width=ww+"px" ;}
                    wrp.style.top=headerclone.style.top ;
                    wrp.style.height=(gwrp.offsetHeight+wrphdrht)+"px" ;


                }
            } ;
            function setup( num,refresh){   if(num>0){numofcols=num;}
                // var gridwr,outer
                outer=grid.domcomponents.outer ;
                gwrp=grid.domcomponents.gridWrap;
                colcnt=Number(numofcols)||Number(grid.config.columnFreeze)|| 1;
                bdy=grid.domcomponents.rowset ;
                hdr=gwrp.q(".grid-tab .grid-header .grid-row");
                if(!Dom){return}
                if(optns.rownum){colcnt++}
                if(!(bdy && bdy.el.childElementCount)){return}
                wrp=outer.q(".grid-columnfreeze-overlay")
                var
                    wrpbdy= wrp?wrp.querySelector(".grid-rowset"):null,
                    wrp_hdr= wrpbdy?wrpbdy.previousElementSibling:null ,
                    headerclone=grid.domcomponents.headerclone,
                    headerrow=headerclone?headerclone.q(".grid-row"):null,ifo=grid.domcomponents.hdrInfo();
                if(!headerclone){return}

                if(headerclone && (refresh===true||!wrp)){
                    //  gwrp.style.top=ifo.bottom+"px";
                    wrp=wrp||Dom(outer.appendChild(document.createElement("div")));wrp.className="grid-columnfreeze-overlay"
                    wrp.clear();
                    wrpbdy=wrp.appendChild(bdy.el.cloneNode(false));
                    Dom.css(wrp ,{l:1,w:0,position:"absolute",overflow:"hidden",borderTop:"none"})
                    wrp_hdr=wrp.insertBefore((hdr.el||hdr).cloneNode(false),wrpbdy)
                    wrp_hdr.style.borderTop="none";wrp_hdr.style.borderTop="#666"; wrp_hdr.style.left="1px";
                    wrp_hdr.style.top="-1px";    wrp_hdr.style.zIndex=ZINDEX.FREEZEOVERLAYHDR;
                    wrp_hdr.style.position="absolute";   wrp_hdr.style.display="block";

                    Dom.css(wrpbdy,{overflow:"hidden",padding:0,borderTop:"none",margin:0,position:"absolute",l:0,w:"100%",
                        zIndex:ZINDEX.FREEZEBODY});
                    for(var i=0;i<colcnt;i++){
                        wrp_hdr.appendChild(hdr.children[i].cloneNode(true));
                    }
                    wrphdrht=Number(String((headerclone||hdr).q(".grid-row").css("height")).replace(/[^\d\.]/g,""))
                    wrpbdy.style.height=gwrp.offsetHeight  +"px";wrpbdy.style.top=(wrphdrht+2)  +"px"
                    wrp_hdr.style.lineHeight= wrp_hdr.style.height  =wrphdrht+"px";
                    Dom.qq(wrp_hdr,".grid-header-cell,.grid-row").forEach(function(c){c.style.lineHeight= c.style.height= wrphdrht+"px";})
                }

                this.domcomponents.gridWrap.__onscroll||
                this.domcomponents.gridWrap.on("scroll",this.domcomponents.gridWrap.gridWrap.__onscroll=function(ev){
                    grid.fire("scroll",ev)
                });
                if(!refresh){
                    grid.on("scroll afterpageload aftercolresize", $.throttle(proc, {immediate:true,delay:10} ) );
                    grid.on("afterresize uireset", function(){if(_isactive){setup(0,true)} });


                }
                //wrp.onscroll=function(){setTimeout(cb,100)} ;
                proc()
                setTimeout(proc,10)  ; setTimeout(proc,50)
            }
            return {
                label:"Freeze Columns",
                optns:["number_of_Columns"],
                setup:function(){  return this;   },
                activate:function(num){
                    if(_isactive){return}
                    _isactive=1;
                    setTimeout(setup.bind(this),100,num)   ;
                    grid.on("render",function(){ if(_isactive){setup(0,true);setTimeout(proc,100);} })
                    return this;

                },
                remove:function(){
                    if(wrp && wrp.parentNode){wrp.parentNode.removeChild(wrp.el||wrp)}
                    _isactive=false;
                }
            };
        },
        /*gridMenu:function(g){
            var featurelist,link,popupvw,_isactive,grid= g,optns={};
            return {
                setup:function(){
                    if(g.buttonBar&&!g.buttonBar.q(".icon-cog")){
                    link= g.buttonBar.append("<button><a class='icon-cog'></a></button>")
                        .on("click",function(){this.activate()}.bind(this)).hide()
                    }
                    return this;
                },
                activate:function(val){
                    if(!popupvw){
                        var meta=grid.store.meta,collist=meta.getNames();
                        var plugins= DataGrid.plugins,list
                        plugins.nowrap||(plugins.nowrap=function(g){
                            var grid=g;
                            return {
                                setup:function(){grid.nowrap=this;
                                    this.activate()},
                                activate:function(){
                                grid.domcomponents.gridWrap.classList.add("nowrap")
                                grid.domcomponents.gridWrap.classList.remove("fitLayout")
                                grid.domcomponents.gridWrap.st(".grid-cell,.grid-header-cell").css({maxWidth:"-delete-",minWidth:"-delete-",width:"auto"})

                            },remove:function(){
                                grid.domcomponents.gridWrap.classList.remove("nowrap")
                                grid.domcomponents.gridWrap.classList.add("fitLayout")
                            },label:"No wrap"}
                        });
                        list=Object.keys( plugins).reduce(
                            function(m,k){var p=plugins[k](grid),l=p.label;
                                if(l){m.push({id:k,label:l,optns: p.optns})}return m;
                            },[]);
                        popupvw=View.popup({anchor:link,width:400,height:300, hideOnBlur:true,
                            panels:[ "columns","Sort","features"]

                        });
                        popupvw.addLayout("tab");
                        //
                         featurelist=View.lookupList({aspanel:true  , list:{list:list ,keyname:"id",
                                labelprovider:function(v){
                                    return ("<label style='position:relative;margin-left:30px;display:block' for='lookup_"+v.id+"'>" +
                                        "<input id='lookup_"+ v.id+"' value='"+v.id+"'"+(grid[v.id]?"checked='checked'":"")+" type='checkbox'/>"+( v.label)
                                        +
                                        (v.optns?"<div class='icon-arrow-down optn-expand' style='position:absolute;top:5px;right:2px;cursor:pointer:z-index:10'> </div>":"")
                                        +"</label>")}  }
                            },function(k,lbl){ var v=list.find(function(it){return it.id==k}),
                                ip=document.getElementById("lookup_"+ k)
                                if(v && v.optns){
                                    var nu,lbl,nu,ip=document.getElementById("lookup_"+ k)
                                    if(ip){lbl=ip.parentNode}
                                    if(lbl&&!(nu=lbl.nextElementSibling)){
                                        nu=$d.after(lbl,"<div style='line-height:2em'></div>")
                                    }
                                    nu=$d(nu);//nu.clear();
                                    if(!nu.q(".optnstext")){    var  _id=k;
                                        v.optns.map(function(k){
                                            nu.append("<label>"+String(k).replace(/^\w|_\w/g,function(a){return " "+a.split("").pop().toUpperCase()}).trim()+"<input class='optnstext' data-ref='"+k+"'data-name='"+k+"' style='width:60px;'/></label>")
                                            nu.q("input").el.onchange=function(evt){
                                                var el=this,ip=el.parentNode.parentNode.previousElementSibling.querySelector("input"),id=ip.value
                                                optns[id]=el.value;
                                                if(ip && plugins[id]){
                                                    if(ip.checked){
                                                        if(!grid[id]){grid[id]=plugins[id](grid)}
                                                        else{grid[id].remove && grid[id].remove()}
                                                        grid[id].activate(el.value)
                                                    }
                                                }}
                                        });
                                    }
                                }
                                ip.onchange=function(evt){
                                    var ip=this,id=ip.value
                                    if(plugins[id]){
                                        if(ip.checked){
                                            if(!grid[id]){grid[id]=plugins[id](grid);
                                                grid[id].setup( optns[id])
                                            }
                                            grid[id]&&grid[id].activate( optns[id])

                                        } else if(grid[id]) {grid[id].remove()}
                                    }
                                }


                            }
                        );


                        var curr=grid.cols.map(function(it){return it.name}),allcols=collist.map(function(it){return meta.findField(it)||{name:it,label:it}}),
                            list1={ keyname:"id",labelname:"label",list:allcols.map(function(it){return {id:it.name,label:(it.label=="-")||(it.label=="/")?it.name:it.label}})},
                            lbl=$.template(
                                $d.template(
                                    "label[style=d:b].col>input[type=checkbox][value=`id].chx+span{`label}"
                                ).render().html().replace(/`/g,"$"))
                        var columnlist=View.lookupList({aspanel:true ,list:list1,labelprovider:lbl})
                        var sortlist=View.lookupList({aspanel:true ,list:list1});
                        popupvw.columns.addLayout("frame");popupvw.columns.config.hideHeader=true ;
                        popupvw.columns.on("beforeshow",function(){this.contentWrap.qq("label.col .chx").forEach(function(it){it.checked=curr.indexOf(it.value)>=0})});
                        popupvw.columns.addButton("Apply","footer",function(){
                            var nu=this.contentWrap.qq("label.col .chx").filter(function(it){return !!it.checked}).map(function(it){return meta.findField(it.value)})
                            grid.cols.length=0;
                            [].push.apply(grid.cols,nu);
                            grid._renderer.render() ;
                        } )
                        popupvw.Sort.addLayout("frame");
                        popupvw.Sort.config.hideHeader=true;
                        popupvw.Sort.addButton("Apply","footer",function(){})

                        popupvw.columns.contentWrap.css("overflow","hidden")
                        popupvw.features.add(featurelist)
                        popupvw.columns.add( columnlist)
                        popupvw.Sort.add(sortlist)

                     }
                    popupvw.show()
                    popupvw.features.show();//
                    popupvw.el.st(".ui-button-bar").up().toFront();

                    // Popupvw.sort1.show();
                    return this;

                },
                remove:function(){_isactive=false;}
            };
        },*/
        inlineEditor:function(g){
            g.config.ignoreupdate=true
            var config=g.config.inlineEditor;
            if(!$.isPlain(config)){config={}}
            var form= DataGrid.plugins.entityForm(g) ,_isactive,_menu=null,_ctx,wdspan,  _enabled=false, _model=null,_rowmodel
                ,_activeCell,
                _setTabidx=function(){
                     g.domcomponents.tab.st(".grid-rowset .grid-row .grid-cell .cell-content").prop("tabIndex",function(tabidx){return ++tabidx.i},{i:0})
                },

                    _save=function( ){ var cx=_rowmodel
                         if(cx&& cx.record&&cx.id){
                             if(config.onrowblur){
                                 config.onrowblur.call(g,_rowmodel,_activeCell,"save")
                             }
                             _cancel(false)
                                 g.showStateMsg("saving..")
                                var rec=cx.record,del=g.store.stats.deleted;
                                 rec.save().then(function(){
                                    this.showStateMsg("saved..").showStateMsg("",1000)
                                     rec.resetStatus( )
                                     _rowmodel&&_rowmodel.el&&_rowmodel.el.st(".edit-modified").removeClass("edit-modified")
                                 }.bind(g),
                                     function(msg){var m=((msg&&msg.error)?msg.error:msg);
                                         if(m){m="<span style='color:red'>"+m+"</span>"}
                                         this.showStateMsg(m||"error").showStateMsg("",1500)
                                     }.bind(g)
                                 )
                        }
                 } ,
                _cancel=function(norestore ){
                           if(_activeCell&&_activeCell.el) {
                              _activeCell.el.removeClass("edit-active")

                                if(!norestore ){
                                      if(_rowmodel&&_rowmodel.datamodel){
                                         _rowmodel.datamodel[_activeCell.name]=_activeCell.content.val()
                                          _activeCell.content.addClass("edit-modified")
                                      }

                             }

                            _activeCell.content.contentEditable = false;
                        }
                 } ,
                _delete=function(el,ev){  var cx=_rowmodel
                    if(cx&& cx.record&&cx.id){
                        g.store.provider.delete(cx.record).then(function(){
                            this.showStateMsg("deleted..").showStateMsg("",1000)
                                if(_menu){_menu.hide()}
                         }.bind(g)
                        );
                        if(config.onrowblur){
                            config.onrowblur.call(g,_rowmodel,_activeCell,"delete")
                        }
                        _cancel(true); _activeCell=null
                    }
                } ,

                _positionMenu=function(){
                    var cx=_rowmodel
                     if(_menu&&cx){
                         var b=cx.el.q(".cell-content").getBoundingClientRect(),offset=_menu.parent().getBoundingClientRect(),scroll=g.domcomponents.gridWrap.scrollTop;

                         var top=0
                         if(b.top > offset.top){top=((b.top-offset.top) ) }
                         if(b.top < offset.top|| (b.top+ b.height/2)>offset.bottom){
                             _menu.hide();
                         }
                         else{
                             _menu.css({top:top + b.height ,l: (b.right-offset.left)}).show()
                         }

                    }

                },
                _changeRow=function(nu){
                    if(_rowmodel&&_rowmodel===nu){return}
                    if(_rowmodel&&_rowmodel.el){
                        $d.removeClass(_rowmodel.el,"edit-active-row")
                    }
                    var old=_rowmodel;

                    _rowmodel=nu;
                     if(!_rowmodel.datamodel&&_rowmodel.record) {
                             _rowmodel.datamodel = _rowmodel.record//.makeModel(false,true);
                             //_rowmodel.el.data("_model", _rowmodel.datamodel)
                      }
                    if(config.onrowblur){
                        config.onrowblur.call(g,old)
                    }
                    if(config.onrowfocus){
                        config.onrowfocus.call(g,old,_rowmodel)
                    }
                    $d.addClass(_rowmodel.el,"edit-active-row")
                    setTimeout(_positionMenu,10)
            },
                _activate=function(celctx){
                    if(!_enabled||!_rowmodel){return}
                    var curr=_activeCell=cx,cx= celctx,el=celctx.el

                     if(cx&&cx.el&&!cx.el.hasClass("edit-active")){
                        _cancel(true )

                        _activeCell=cx
                        if(!cx.meta){return}
                             el.addClass("edit-active")
                            _rowmodel.el.addClass("edit-active-row")
                            $d.domdata(cx.el,"currval",$d.val(cx.content))
                             var m=_rowmodel.datamodel
                            if(!m ){
                              return
                            }
                            var inst=cx.meta.getUIInstance( )
                             inst.ip=cx.content
                            inst.build({model :m})
                            inst.setValue=cx.render.bind(cx)
                            cx.model=m
                            _ctx=cx
                            if(!inst.hasLookup ){
                                cx.content.contentEditable=true;
                                cx.content.on("blur.inline",function(ev){
                                    if(_rowmodel&&_rowmodel.el&&_rowmodel.el.contains(ev.target)){
                                        var cell=$d.selfOrUp(ev.target,".grid-cell")
                                        if(cell){
                                            var name=$d.domdata(cell,"name")
                                            if(name){
                                                _rowmodel.datamodel[name]=$d.text(ev.target)
                                            }
                                        }
                                    }
                                    _cancel(false );
                                    _activeCell=null
                                });
                             } else{
                                setTimeout(function(){inst.ip.trigger("mousedown")},10);
                            }
                         if(config.onrowblur){
                             config.onrowblur.call(g,_rowmodel,_activeCell)
                         }
                          setTimeout(_positionMenu,10)

                    }
                }

            return {   label:"Inline Cell Editor",
                setup:function(){   _setTabidx()
                    if(!_menu){
                        _menu=$d.template("div.inline-editor-menu.ui-button-group.fxtx_5[abs;opacity:.9;height:20;width:200;]>" +
                            "span.ui-button.small.green[-key:save;display:inline-block;]{Save}+" +
                            "span.ui-button.small.danger[-key:del;display:inline-block;]{Delete}" +""
                            //"span.ui-button.small.danger[-key:cancel;display:inline-block;]{Cancel}"
                        ).render().appendTo(g.domcomponents.gridWrap).q(".inline-editor-menu")
                        _menu.on("click",function(ev,el){var k=el.domdata("key")
                            if(k=="save"){_save()}
                            else if(k=="cancel"){_cancel(true);_activeCell=null}
                            else if(k=="del"){_delete();}

                        },"span")
                        _menu.hide()
                        _enabled=true;
                        g.on("viewupdate",_cancel);
                        g.on("afterrender",_setTabidx)
                        g.on("rowselected.inlineeditor",function(ev){
                            _changeRow(ev)
                        })
                        g.domcomponents.rowset.on("mousedown",function(ev,el){
                            var nur=g.getRow($d.selfOrUp(el,".grid-row"));
                            if(nur){
                                _changeRow(nur)
                                var celctx=nur.getCell(el)
                                celctx&&_activate(celctx)
                            }
                         },".grid-cell")
                        g.domcomponents.gridWrap.on("scroll",_positionMenu)

                    }
                    return this;
                },
                activate:function(){
                    form.activate();
                    return this;

                },
                remove:function(){_isactive=false;}
            };
        },
        popupEditor:function(g){
            var form= DataGrid.plugins.entityForm(g) ,_isactive
            return {   label:"Popup Editor",
                setup:function(){
                    form.setup();
                    return this;
                },
                activate:function(){
                    form.activate();
                    return this;

                },
                remove:function(){_isactive=false;}
            };
        },
        entityForm:function(g){
            var grid= g,formView,_rowActions=[],_isactive,_buttons={edit:null,add:null},
                _formInst=null,spec=g.config.entityForm ||{},_temmplateformInst={},
                _formClass=null,
                _panel=spec.panel,isDialog;
            if(g.data("entityForm")){return}
             g.data("entityForm",1)
             function newForm(){editForm()}
            function setupForm(rec,callback){


                if(callback===true){callback=editForm}
                callback=typeof(callback)=="function"?callback:function(){}
                if(spec.setUp){
                    _formInst=spec.setUp(g,rec)
                    formView=_formInst._view
                    callback(rec,_formInst)
                } else {
                    var template = spec.template, vw = formView, store = grid.store;
                    var currentrec = rec ? rec.clone() : g.store.StoreRecordProto.constructor.newInstance()
                    if (typeof(spec.template) == "function") {
                        template = spec.template(rec)
                    }
                    _formInst = _temmplateformInst[template || "_default"]
                    if (!vw) {
                        vw = _panel || g.config.formPanel || spec.panel
                        if (!vw) {
                            var PopupView = $.require("PopupView")
                            vw = new PopupView({
                                resizable: true,
                                centered: true,
                                title: $.titleize(spec.title || g.store.meta.name || ""),
                                height: spec.height || 400,
                                width: spec.width || 500
                            })//,layouts:"panel",footer:{height:40}})
                            isDialog = true
                            vw.observer.on("beforehide", function (el) {
                                if (el && $d.selfOrUp(el, ".popup-view")) {
                                    return false;
                                }

                            })
                        }
                        ;

                    }
					if(vw){formView = vw}
                }
               // if(vw.hasLayout("popup")){isDialog=true}
                formView && formView.show();
                if(!_formInst){
                    $.require("UI.Form",function(f){
                        currentrec.clear()
                             var opts={meta:store.meta,layoutTemplate:template,dataRecord:currentrec,panel:formView}
                        var props=f.classMeta.defaultProperties
                        $.each(spec,function(v,k){
                            if(k in props&&typeof(v)!=="undefined"){
                                opts[k]=v
                            }
                        })
                        opts.panel=opts.panel||formView
                          _formInst=f(opts);
                            _temmplateformInst[template||"_default"]=_formInst
                        _formInst.panel=vw
                          if(spec.oncreate){
                              spec.oncreate(_formInst)
                          }
                         vw.form=_formInst    ;
                             vw.contentWrap.clear();
                        _formInst.appendTo(vw.contentWrap)
                            .on("update",function(data){   });
                        _formInst.dataHandle={store:store}
                        _formInst.dataRecord.reset();
                        if(!spec.nobuttons) {
                            vw.addButton({
                                name: "Save",
                                location: spec.barlocation || (isDialog ? "footer" : "header"),
                                align: "center",
                                callback: function () {
                                    _formInst.save().then(function () {
                                        if (isDialog) {
                                            vw.hide()
                                        }
                                        g.pager.loadPage()
                                        g.fire("save", currentrec)
                                    })
                                }
                            });
                            vw.addButton({
                                name: "Cancel",
                                location: spec.barlocation || (isDialog ? "footer" : "header"),
                                align: "center",
                                callback: function () {
                                    vw.hide()
                                    g.fire("formcancel")
                                }
                            });
                            vw.layout();
                        }

                        g.fire("entityform",_formInst)
                        if(_formInst&&rec){_formInst.reset(rec.toMap())}
                             setTimeout( callback,0,rec,_formInst)
                        })
                } else {
                    _formInst.reset(rec?rec.toMap():null)
                    callback(rec,_formInst)
                }
            }
            function editForm(rec,fi){
                var vw= formView,store=grid.store,editmode=rec?"edit":"new" ;
                vw.record=rec||"null"
                vw.show();
                if(fi){
                    fi.editmode=editmode
                    fi.dataRecord =rec
                    rec && fi.reset(rec.toMap())
                } else{
                    setupForm(rec,function(rec,formInst){
                        if(formInst){
                            formInst.editmode=editmode
                            formInst.dataRecord=rec
                            rec && formInst.reset(rec.toMap())
                   // _formInst.reset((rec && rec.id)?rec.toMap():null)
                } else{ }

                    })
                }
                vw.setTitle&&vw.setTitle(
                    ($.titleize(spec.title||store.meta.name) +": "+(rec?rec.lbl:"")||"").replace(/undefined/,"")
                )


            }
            function _addLinks(config ){
                var links=(config||{}).links||[ "refresh","sep","addrow","edit","del","sep","settings"],opts=grid.config.editoptions||{}
                if(!spec.readonly){
                    if(opts.add!=null && !opts.add && links.indexOf("addrow")>=0){links.splice(links.indexOf("addrow"),1)}
                    if(opts.edit!=null && !opts.edit && links.indexOf("edit")>=0){links.splice(links.indexOf("edit"),1)}
                     if(opts.export){
                        opts.export= $.isPlain(opts.export)?opts.export:{}
                         opts.export.text=opts.export.text||"Export"
                        links.push( "export" )
                    }
                    if(opts.del!=null && !opts.del && links.indexOf("del")>=0){links.splice(links.indexOf("del"),1)}
                    if(!grid.domcomponents.toolbar.q("[data-cmd='edit']")) {
                        grid.iconBar=DataGrid.IconBar(grid,{floatable:true})
                        links.forEach(function(a){
                            grid.iconBar.add(a,opts[a])
                        })
                        grid.iconBar.getBar().prepend("<span class='ui-toolbar-status-message'></span>")
                        grid.iconBar.appendTo(grid.domcomponents.toolbar)

                        /*grid.domcomponents.toolbar.append ("<span class='ui-toolbar-status-message'></span>"+
                            links.map(function(a){return "<span data-cmd='$key' title='$key' class='ui-button-gl gl-icon-$key'></span>".replace(/\$key/g,a)}).join("")
                        )*/
                    }
 /*
                     if(!_buttons.add){
                        _buttons.add=grid.addButton({name:"Add",location:"header",callback:setupForm.bind(null,null,editForm )} );
                    }
                    if(!_buttons.edit){
                        _buttons.edit=grid.addButton({
                            name:"Edit", location:"header", callback:function(){
                                this.selectedRecord && this.selectedRecord.id && setupForm(this.selectedRecord,editForm);
                            }
                        });
                        _rowActions.push(_buttons.edit)
                    }
                    if(!_buttons.del){
                        _buttons.del=grid.addButton({
                            name:"Remove", location:"header", callback:function(){
                                this.selectedRecord && this.selectedRecord.id && this.store.provider[ "delete"](this.selectedRecord.id);
                            }
                        });
                        _rowActions.push(_buttons.del)
                    }*/
                    }
                return this
                }
            function _setup( ){
                if(grid.data("_formbutons")){return}

                if(spec.buttons){
                    $.each(spec.buttons,function(v,k){
                        var nm=typeof(k)=="string"?k:v.name
                        if(nm&&!_buttons[nm]&&v.callback){
                            _buttons[nm]=grid.addButton({name: v.label||nm,location:"header", klass: v.klass,style: v.style,callback: v.callback.bind(g,editForm )} );
                            if(v.rowaction){
                                _rowActions.push(_buttons[nm])
                            }
                        }
                    })
                }
                //if(!_buttons.add){setTimeout(_setup,500)}
                //else{

                    grid.on("viewupdate",function(pager){
                        _rowActions.forEach(
                            function(v,k){v.disable()}
                        );
                     });
                    grid.on("rowselected",function(r){
                        _rowActions.forEach(
                            function(v,k){v.enable()}
                        );
                    });
                grid.on("colselected",function(r){

                });
                grid.data("_formbutons",1)
                 if(grid.domcomponents.frameheader.q(".ui-button")){
                        return
                }
                if(grid.buttonBar){$d.toFront(grid.buttonBar)}


            }
            return {   label:"  Editor",
                getFormInst:function(){return _formInst},
                setPanel:function(p){_panel=p;return this},
                getPanel:function(){return formView||_panel},
                setupForm:setupForm,
                setup:function(){
                    this.activate();

                    grid.on("afterrender.grid",_setup)
                     return this;
                },
                activate:function( ){
                    _setup.call(this )    ;
                    return this;

                },
                addLinks:_addLinks,
                remove:function(){_isactive=false;}
            };
        } ,
        groupView: function(grid){
            return {
                label   :"Group View",
                setup   :function(){

                },
                activate:function(){

                },
                clear   :function(){

                }
            }
        },
        facetView: function(grid){
            var _isactive= 0,facetcols;
            return {   label:"Facet View",
                setup:function(){
                    this.activate();
                    return this;
                },
                activate:function(){
                    if(_isactive){return}
                    _isactive=1;
                    facetcols||(facetcols=grid.store.meta.findAll(function(it){return it.name!="id"}));
                    var facetList=new View("facetList","accordion",{width:200,location:"left"}),recs=grid.store.records
                    var facetPanels=facetcols.map(function(it){var nm=it.name;
                        var ll=recs.pluck(it.name).collect(function(it){ return it.format?it.format():String(it)}).uniq().sort();
                        var PopupView= $.require("PopupView")
                        return PopupView.lookupList(ll, {
                            id: it.name, label: it.label, aspanel: true, callback: function (rec) {
                                if (rec && rec.row && rec.row.classList) {
                                    if (rec.row.classList.contains("selected")) {
                                        rec.row.classList.remove("selected");
                                    } else {
                                        rec.row.classList.add("selected")
                                    }

                                    var fltr = [].map.call(facetList.contentWrap.querySelectorAll(".listbox-container"), function (f) {
                                        return [].map.call(f.querySelectorAll(".selected"), function (r) {
                                            return "it." + nm + " = '" + r.dataset.key + "'"
                                        }).join(" or ")
                                    }).filter(function (it) {
                                        return it.trim()
                                    }).join(") and (");
                                    fltr = "(" + fltr + ")"

                                    grid.pager.update({filter: fltr});
                                    grid._renderer.redraw(true)
                                }
                            }.bind(it)
                        }
                        ) });

                    facetPanels.forEach(function(it){facetList.add(it)});
                    if(grid.panel._parent){
                        var vw=grid.panel._parent;
                        grid.panel.config.location="center"
                        vw.add(facetList); grid.panel.removeLayout("fill");
                        vw.addLayout("border");
                        vw.layout();
                    }
                    return this;

                },
                remove:function(){_isactive=false;}
            };
        }
    }

    DataGrid.generateTemplate=function(config){
        var cols=config.cols||[],rowname=config.rowname||"row"

        var hdrs=[],names=[],cellklass=((config.cellklass||"")+" grid-cell").trim();
        cols.forEach(function(a){if(!a){return}
            var name=typeof(a)=="string"?a: a.name,lbl=a.label|| $.titleize(name||"")
            if(!name){return}
            hdrs.push("<th  class='grid-header-cell'>"+lbl+"</th>")
            names.push("<td class='"+cellklass+"'>$"+name+"</td>")
        })
        var tmplate="<div class='gridtable viewmode-table'><table class='grid-tab'><thead class='grid-header'><tr class='grid-row'>"+hdrs.join("")+"</tr></thead><tbody class='grid-rowset'>$each("+rowname+"){<tr class='grid-row' data-id='$id'>"+names.join("")+"</tr>}</tbody></table></div>"
         return $.template(tmplate)
    }
if(typeof(View)!="undefined"){
    View.DataGrid=DataGrid
}
    DataGrid.IconBar=function(view,opts){
        if(!opts&& $.isPlain(view)){opts=view;view=null}
        var _bar=null,els={},_lastel=null,options= $.extend({floatable:false,controller:null,style:null,listener:null,template:null,basclass:"ui-button-gl"},opts||{})
        if(typeof(options.listener)!=="function"){options.listener=null}

        if(options.controller&&typeof(options.controller.invoke)!=="function"){options.controller=null}
        if(!options.controller&&view && view.getController ){
            options.controller=view.getController();
        }


        var api={
            getBar:function(){
                if(!_bar){
                    _bar=$d("<div/>").css({ w:"auto" ,overflow:"hidden",paddingBottom: "2px"})
                    _lastel=_bar.append('<span class="ui-button-gl ignore-link1 edge-handle"></span>')
                    if(options.style){_bar.css(options.style)}

                    _bar.on("mousedown",function(ev){
                        ev.stopPropagation&&ev.stopPropagation()
                        var memo={b:_bar.bounds()}
                        if(_bar.parent().el!=document.body||!_bar.data("_origparent")){
                            var bp=UI.Rect.from(memo.b ,true),bp2=_bar.parent().bounds() ;
                            bp.left=Math.min(bp2.left,bp.left-15)
                            bp.top=Math.min(bp2.top,bp.top-15)
                            bp.right=Math.max(bp2.right,bp.right+15)
                            bp.bottom=Math.max(bp2.bottom,bp.bottom+15)

                            _bar.data("_origparent",_bar.parent().id)
                            _bar.data("_origbounds", bp)
                            _bar.data("_orignext",( _bar.next()||{}).id)
                            _bar=_bar.appendTo(document.body)
                            _bar.addClass("layout-floating")
                            _bar.css({top:  memo.b.top,left:  memo.b.left,h:  memo.b.height,width: memo.b.width,position:"fixed"}).toFront(true)
                        }

                        $d.trackMouse({
                            target:_bar,
                            memo:memo ,
                            start:function(ev,memo){memo.point=UI.Point.from(true,memo.b.left,memo.b.top)  },
                            move:function(ev,memo){
                                memo.point.save().plus(ev.delta).applyCss(_bar.el).restore();
                            },end:function(ev,memo){memo.b.refresh()
                                var origpar=$d(_bar.data("_origparent"))
                                if(origpar && !_bar.parent().is(origpar)){
                                    var  bp=_bar.data("_origbounds")
                                    if(bp&&bp.contains(memo.b )) {
                                        var _orignext=$d(_bar.data("_orignext"))
                                        if(_orignext&&_orignext.parent().is(origpar)){_bar=_orignext.before(_bar)}
                                        else{_bar=origpar.append(_bar)}
                                        _bar.data("_origparent",null)
                                        if(!origpar.isAnimating()){origpar.highlight();}
                                        _bar.removeClass("layout-floating")
                                    } else{
                                        _bar.addClass("layout-floating")
                                    }

                                }
                            }

                        })
                    },".gl-icon-draghandle")
                    _bar.pointerselect(function(ev){
                        if(ev&&ev.target&&$d.is(ev.target,".ui-button-gl")){
                            var nm=ev.target.dataset.cmd
                            if(nm==="sep"||nm==="text"||ev.target.classList.contains("disabled") ||ev.target.classList.contains("ignore-link1")){return}
                            var el=els[nm];
                            if(el){
                                if(options.listener){
                                    options.listener(nm,ev)
                                }
                                if(options.controller){
                                    options.controller.invoke(nm,[ev])
                                }
                                if(el.callback){
                                    el.callback(ev)
                                }
                            }
                        }
                    })
                    if(options.floatable){
                        _lastel.addClass("gl-icon-draghandle")
                    } else{
                        _lastel.addClass("gl-icon-blank")
                    }
                }
                return _bar
            },
            getLink:function(nm){
                if(typeof(nm)=="string"){
                    return els[nm]
                } else if(typeof(nm)=="number"){
                    //
                }
            },
            addText:function(txt,pos){this.add("text",{text:txt,pos:pos});return this},
            addSep:function(txt){this.add("sep");return this},
            add:function(nm,detail,pos){

                if(Array.isArray(nm)){
                    nm.forEach(function(k){this.add(k)},this)
                    return this;
                }
                var data={}
                if($.isPlain(detail)){data=detail}
                else if(typeof(detail)=="function"){data.callback=detail}
                else if(typeof(detail)=="string"){data.text=detail}
                else if(typeof(detail)=="number"){data.pos=detail}
                if(typeof(pos)=="number"){data.pos=pos}
                if(nm.indexOf("text")==0){data.key=data.key||nm;nm="textwrap"}
                if(nm.indexOf("sep")==0&&nm!="sep"){data.key=data.key||nm;nm="sep"}
                data.key=data.key||nm

                if(nm!="sep" && nm!="textwrap" &&els[data.key]){return els[data.key]}
                if(data.pos=="top"){data.pos=0}
                var klas="gl-icon-"+nm
                if(!options.template){
                    var dom=$d("<span class='ui-button-gl'></span>")
                    options.template=dom.el.cloneNode(true)
                    dom.remove();
                }
                var bar=this.getBar()

                var nu
                if(nm=="text"){
                    nu=$d("<span/>")
                    if(data.text){
                        nu.text(data.text)
                    }
                }
                else {
                    nu = options.template.cloneNode(true)
                }
                nu.dataset.cmd = data.key
                var before=_lastel
                if(typeof(data.pos)=="number"){
                    if(data.pos==0){before=bar.down()}
                    else {
                        before=bar.down(data.pos)
                    }
                } else if(typeof(data.pos)=="string") {
                    if (els[data.pos]) {
                        before = els[data.pos].el
                    }
                }
                before=before||_lastel
                nu=before.before(nu)
                nu.addClass(klas)
                if(data.klass||data.className){
                    nu.addClass(data.klass||data.className)
                }
                var wdgt={el: nu, name: nm}
                if(nm!="sep" && nm!="textwrap") {
                    if (typeof(data.callback) == "function") {
                        wdgt.callback = data.callback
                    }
                    els[nm]=wdgt
                } else{
                    nu.addClass("disabled")
                }
                if(data.text){
                    nu.html(data.text).css({width: "auto"})
                }
                return wdgt

            },
            enable:function(nm){
                [].concat(nm||[]).forEach(
                    function(k){
                        if(els[k]){
                            els[k].el.removeClass("disabled")
                        }
                    }
                )
                return this;
            },
            disable:function(nm){
                [].concat(nm||[]).forEach(
                    function(k){
                        if(els[k]){
                            els[k].el.addClass("disabled")
                        }
                    }
                )
                return this;
            },
            setConfig:function(nm,val){
                options[nm]=val;
            },
            appendTo:function(dom){
                _bar=$d(dom).append(this.getBar())

                return this;
            }

        }
        return api;
    }

module.exports=DataGrid