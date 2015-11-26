/**
 * Created by Atul on 5/20/2015.
 */
function _resolveArgs(){
    var mthd,callback,optns={},url,fns=[],strings=[],
        a=/arguments/i.test(({}).toString.call(arguments[0]))?
            [].concat.apply($.makeArray(arguments[0]),$.makeArray(arguments,1)):
            $.makeArray(arguments);

    for(var l=a.length,i= l-1;i>=0;i--){
        if(a[i]==null){continue}
        var t=typeof(a[i]);
        if(t=="function") {
            fns.unshift(a.splice(i, 1))
        }else if(t=="string"){
            strings.unshift(a.splice(i, 1))
            $.extend(optns,a.splice(i,1)[0]);
            break;
        }
    }
    if(typeof(a[0])=="object"&&self.ResURL&&ResURL.isURI(a[0])){
        optns.URI= a.shift();
    }
    else if(a.length==1 && typeof(a[0])=="object"){
        return a[0]||{}
    }
    for(var i= 0;i<a.length;i++){
        if(a[i] && typeof(a[i])=="object"&&!optns.length){
            $.extend(optns,a.splice(i,1)[0]);
            break;
        }
    }
    while(a.length){var b=a.shift();
        if(b==null){continue}
        if(typeof(b)=="function"&&!callback){optns.callback= b}
        else if(typeof(b)=="object"){
            if(!optns.args){optns.args= b}

        }else if(typeof(b)=="boolean"){
            optns.sync= b
        } else if(typeof(b)=="string"){
            if(/^(get|post|put|delete)$/i.test(b)){optns.method=b}
            else if(!optns.url){optns.url=b}
        }
    }
    if(optns.async!=null&&optns.sync==null){optns.sync=!optns.async}
    if((optns.args &&optns.args.params)||(optns.params)){optns.args=optns.params||optns.args.params}

    if(optns.url){optns.url=ZModule.ResourceURL(optns.url)}

    optns.args=optns.args||optns.params||optns.pars||optns.parameters
    if(optns.args&&optns.args.data ){
        optns.data= $.extend(optns.data||{},optns.args.data);
        delete optns.args.data;
    }
    return optns
}