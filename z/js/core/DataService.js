/**
 * Created by Atul on 8/13/2015.
 */

importScripts("workertemplate.js")
function parseData(data){
	if(typeof(data)=="string"){
		return JSON.parse(data)
	}
	return data
}

var config={}


function readDataset(data){
	var res=[]
	if(data && data.content && data.content.data){
		var fields=data.content.fields||[],dataset=data.content.data,fln=fields.length
		for(var i=0,ln=dataset.length,row;row= dataset[i ],i<ln;i++) {
			var rowdata={}
			if(!row){continue}
			if(Array.isArray(row)){
				for(var r= 0,k;k= fields[r],r<fln;r++) {
					if(k &&  row[r]!=null){
						rowdata[k]=row[r]
 					} ;
 				}
			} else if(typeof(row)=="object"){
				rowdata=row;
			}
			res.push(rowdata);
		}
 			return {
				data:res,
				page:data.content.page,
				fields:data.content.fields
			}
 	}
	return res
}
addHandler("config",function(data){
		if(data && data.config && typeof(data.config)=="object"){
			for(var k in data.config){
				config[k]=data.config[k]
			}
		}

})
addHandler("loaddata",function(data){
	var entity=data.entity;
	var url=config.servicepath
	var args={}
	if(entity){
		args.entity=entity
	}
	if(data.args){
		if(typeof(data.args)=="string" ){
			if(data.args.indexOf("http")!=0) {
				args.criteria = data.args;
			} else{
				url=data.args;
			}
		} else if(typeof(data.args)=="object"){
			for(var k in data.args){
				args[k]=data.args[k]
			}
		}
	}
	var urlq=Object.keys(args).reduce(function(m,k){
		m.push(k+"="+args[k])
		return m
	},[]).join("&")
	if(urlq){url=url+(url.indexOf("?")>0?"&":"?")+urlq}
	var res=readDataset(load(url))
	return res;
})