/**
 * Created by pc5 on 10/31/2014.
 */
Util.random=(function(){
    var impl=null
    function _setup( ){
        if(!impl){
            if(!(typeof(chance)=="object" && typeof(chance.string)=="function")){
                ZModule.require("chance","/boom/Resource?repo=chance").value
            }
            impl=chance
            Object.keys(Object.getPrototypeOf(impl)).forEach(function(k){
                if(!(k in api) && typeof(impl[k])=="function"){
                    api[k]= impl[k].bind(impl )
                }
            }) ;

        }
    }
    function ch(mthd){ impl||_setup();
        if(impl && typeof(impl[mthd])=="function"){
            return impl[mthd].apply(impl,$.makeArray(arguments,1))
        }

    }


    var api= {
        setup:function(cnt){_setup();return this },
        string:function(cnt){return ch("string",{length: cnt||10})},
        number:function(from,to){return ch("integer",{min:from||0,max:to||999999999})},
        name:function(type){return ch(type||"name")},
        of:function(){return ch.apply(this,arguments)}
    }
    return api

})();
