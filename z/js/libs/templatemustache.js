var DELIM=" `` ";
//supports = {{name}}
// {{#name}} ... {{/name}}
// {{^name}} ... {{/name}}
// {{!name}} ... {{/name}}

function parseVars(blockcontent,holder){
	var arr=blockcontent.replace(/\{\{([\w]+)\}\}/g,function (a,b){
		b= b.trim()
 		return DELIM+b+DELIM
	}).split(DELIM)
		.map(
		function(a,i){
			if(!(i%2)){
				if(/^\!\d+\!$/.test(a)){return a}
				return "'"+ a.replace(/'/g,"\\'").replace(/"/g,'\\"')+"'"
			}
			return a
		}
	)
	return "["+ arr.join(" , ") +"].join(blank)";
}
function parse(blockcontent,scope){
	var holder=[]
	var content=blockcontent
		.replace(/\{\{\s*([\/\#\^])\s*/g,"{{$1") //remove unnecessary white space
		.replace(/\{\{\s+(\w)/g,"{{$1")
		.replace(/\s+\}\}/g,"}}")
		.replace(/\r/g,"")
		.replace(/\t/g,"    ")  //replace tab with 4 spaces
		.replace(/\n/g,"\t")  //replace new line  with tab
		.replace(/'/,"\\'")   //escape quote
		//process blocks
		.replace(/\{\{([\#\^])([\w]+)\}\}(.*)\{\{\/\2\}\}/mg,function(a,op,name,content){
			var ret="",parsed=parseVars(content)
 			if(op=="#"){ret= '(function(x){ return x?eval(\\"with(Object(x)){ '+parsed+' }\\" ):blank})('+ name +')' }
			else if(op=="^"){ret= name+'?blank:'+parsed + " `` "}
			if(ret){
				holder.push(ret)
				ret=DELIM+"!"+(holder.length)+"!"+DELIM
			}

			return ret||parsed
		})
	//process snippets
	content=parseVars(content,holder) //
		.replace(/\!(\d+)\!/g,function(a,b){
			return holder[Number(b)-1]||""
		});
	//create fn body
	var bdy="var blank='';return (eval(\"with(_){"+content+"}\"))"
	var fn=Function("_",bdy)
	return function(){
		var result=fn(arguments[0]||{})
		if(result){
			return result.replace(/\t/g,"\n")//? replace tab back to new line
		}
		return ""
	}



}
