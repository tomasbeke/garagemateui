/**
 * Created by Atul on 5/20/2015.
 */

$.inspectArgs=(function( ){
    var infocache={},resusecache=[]
    var toStr=Object.prototype.toString,argStr="[object Arguments]",primitives=["number","string","boolean"]
    function _done(){
        var obj=this;
        for(var j= 0,l1=obj.types,l1n=l1.length;j<l1n;j++){
            var k=l1[j]
            if(obj[k]){
                obj[k].length=0
            };
        }
        obj.args.length=0;  obj.types.length=0;  obj.count=0;
        obj.first=obj.last=null;
        resusecache.push(obj)
    };
    var toRet= function parse( ) {
        var toret =resusecache.shift(),curr={},l= arguments,ln= l.length
        if(!toret ){
            toret ={args:[],types:[],count:0,first:null,last:null};
            toret.cache=_done.bind(toret);
            toret.each=function(typ,fn){
                if(!fn && typeof(typ)=="function"){fn=typ;typ=null}
                var obj=this,a=obj.args.slice();
                if(typ){
                    var UC=String(typ).toUpperCase(),isfn=typeof(typ)
                    a= a.filter(function(it){
                        if(isfn){
                            return it.info.typeInfo.ctorfn==typ
                        }
                        return it.info.type==typ || it.info.klass==typ || it.info[typ]===true || it.info[UC]===true})
                }
                if(a.length){
                    a.forEach(fn)
                }

            }
        }
        if(arguments.length===1 && toStr.call(arguments[0])===argStr){ return parse.apply(null,arguments[0])}
        for(var i= 0;i<ln;i++){
            var val=l[i],kls=toStr.call(val),klsname=kls.substr().substr(8,kls.length-9),typ=typeof(val),k=typ.substr(0,3),info=infocache["_"+klsname]

            if(kls===argStr){
                var part=parse.apply(null,val)
                if(ln==1){toret=part}
                else if(part.count){
                    toret.count+=part.count
                    for(var j= 0,l1=part.types,l1n=l1.length;j<l1n;j++){
                        var k=l1[j]
                        if(!toret[k]){
                            toret.types.push(k)
                            toret[k]=[]
                        };
                        [].push.apply(toret[k],part[k]||[]);
                    }
                    toret.first=toret.first||part.first;
                    [].push.apply(toret.args,part.args||[]);
                    part.cache();
                }
            }  else{
                if(!toret[k]){
                    toret.types.push(k)
                    toret[k]=[]
                }
                if(!info){
                    info={klass:klsname,type:typ,primitive:primitives.indexOf(klsname.toLowerCase())>=0}
                    if(l[i]!=null&&l[i].constructor!==Object&&l[i].constructor!==Function){
                        info.ctor=l[i].constructor;
                    }
                    if($.typeInfo){
                        info.typeInfo=$.typeInfo(info.ctor||info.klass||info.type)
                    }

                    info[k]=info[typ.toUpperCase()]= info[klsname.toUpperCase()]=true;
                    if(!$.isPlain(val)){
                        info=infocache["_"+klsname]=Object.freeze(info)
                    }

                }
                var curr={index:toret.args.length,info:info,val:val}
                toret[k].push(curr)
                toret.args.push(curr)
                if(i===0){toret.first=curr}
                //if(primitives.indexOf(kls.toLowerCase())>=0){curr.primitive=true}

            }
        }
        toret.count=toret.args.length
        return toret;
    }

    return toRet;
})();