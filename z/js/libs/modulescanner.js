var alldeps=[]
var mods={
	View:["libs/layout.js",{as:"View" } ],
	"View.DataGrid": "libs/UI/Grid.js" ,
	"DataGrid": "libs/UI/Grid.js" ,
	"QRCode":"libs/qrcode.js" ,
	"UI.Form":"libs/UI/form.js" ,
	"Starz":"libs/module-Starz.js" ,
	"snapshot":"libs/ui/snapshot.js" ,
	"GraphWidget":"libs/module-GraphWidget.js" ,
	"UI.Calendar":"libs/UI/calendar.js" ,
	"UI.snapshot":"libs/UI/snapshot.js",
	"UI.SvgChart":"libs/UI/svgchart.js",
	ColorPicker: "libs/UI/colorpicker.js",
	"zSelector3": "libs/zSelector3.js",
	"$File": "libs/fileapi.js" ,
	"FILE": "libs/fileapi.js" ,
	Svg: ["libs/svg.js"],
	"$.AUTH": "libs/auth.js",
	ace:{url:["libs/ace/ace.js","libs/ace/mode-javascript.js"]},
	Editor:["libs/editor.js", ["ace","DomCore"]],
	wysihtml5:{url:["libs/wysihtml5-0.4.0pre.min.js","libs/wysihtml.css"]},
	rte: {url: "libs/rtf.js"},
	Angular:["http://code.angularjs.org/1.2.13/angular.min.js"],
	CoffeeScript:["http://coffeescript.org/extras/coffee-script.js"],
	bootstraplib:["http://getbootstrap.com/dist/js/bootstrap.js",{
		dependencies:["http://code.jquery.com/jquery-latest.min.js","../css/bootstrap.css!#position:top"],resolver:"function(){if(self.jQuery){self.jQuery.noConflict() }}"
	} ],
	traceur:["https://traceur-compiler.googlecode.com/git/bin/traceur.js"],

	"$.S":"libs/string.js"
}
function fixModuleData(data){
	var data1="function(module){\n"+ data.trim( ) +"\n}"
	return data1
}
function fileExt(name){
	return String(name).split(".").pop();
}
function fixpath(dir,name){
	var path=dir.replace(/\\/g,"/")
	if(name){
		path=path+"/"+name
	}
	return String(path).replace(/\/\//g,"/");
}
function __init(fs, r){
	r=r||{};
	var all=mods
	for(var k in all) {
		if(typeof(k) == "string"&&all[k]&&k.indexOf ("_") != 0) {
			var name=k,config={}
			if(typeof(all[k])=="object"&&!Array.isArray(all[k])){
				config=all[k]
				//if(config.url){url=config.url;delete config.url}
			}
			else {
				var arr=Array.isArray (all[k]) ? all[k] : [all[k]]
				config=(Array.isArray (arr[1]) ? {dependancies: arr[1]} : arr[1])||{}
				config.url=arr[0];
			}
			if(typeof(config.url) == "string" && config.url.indexOf("module")>=0){
				config.asexports=true
			}
			if(typeof(all[k]) == "string" && /\.js$/.test(all[k])){
				/*if(all[k].indexOf("http")==-1){
				 try {
				 var data = fs.readFileSync(all[k], "utf8") || "";
				 config.type="js"
				 var UglifyJS = require("uglify-js");
				 var result = UglifyJS.minify(data, {fromString: true});
				 config.content=result.code
				 } catch(e){
				 //console.log(e)
				 }
				 }*/


			}


			r[k]=config

		}
	}
	return r
}
var toIgnore=["gruntHelper","modulescanner","cssprocessor","cssprocessorv1","cssprocessorv2"]
function scanForModules(fs,basepath,relpath,holder){
	if(!/\/$/.test(basepath)){basepath=basepath+"/"}
	relpath=relpath||"";

	var fullpath=fixpath(basepath,relpath)
	var files=fs.readdirSync(fullpath)||[]
	var appjs=holder.__appjs||(holder.__appjs=[]);
	var apphtml=holder.__apphtml||(holder.__apphtml=[]);
	if(!appjs.length){
		appjs.push("self.__bootstrap__||(self.__bootstrap__={modules:{},cssvarmap:{},templates:{}});");
	}
	var parentname="",isappmodule
	if(relpath){
		parentname=relpath.split("/").pop()

	}
	files.forEach(function(a){
		var nm=String(a.name||a)
		var filepath=fixpath(fullpath,nm)
		var stat=fs.statSync(filepath);
		var rpath=nm
		if(relpath){rpath=relpath+"/"+rpath}
		var content,isappmodule
		isappmodule=rpath.split("/").indexOf("app")>=0

		if(stat.isDirectory()){

			scanForModules(fs,basepath,rpath,holder )
		} else {
			var arr=rpath.split("/")

			var ext=fileExt(nm)
			if(ext=="css"||ext=="less"){return}
			var path = nm, ismodule, modulename = nm.trim()
			if(toIgnore.filter(function(a){return nm.indexOf(a)==0}).length){
				return
			}
			var data = fs.readFileSync(filepath, "utf8")||"";
			if(ext=="js") {
				if (!isappmodule && arr[0] == "modules" && arr.length > 2) {
					modulename=arr.splice( 1).join("/");
					ismodule =   true
				}  else if(!isappmodule){
					var match=data.match(/\bmodule\.exports\s*\=\s*([a-zA-Z][\w\-\.]+)?/)
					if(match && match.length==2 && match[1]){
						modulename=match.pop() ;
						ismodule =   true
					}
				} else if(isappmodule && parentname!="app"){

					modulename=arr.splice(arr.indexOf("app")+1).join("/");
				} else{
					if (nm.indexOf("app-") == 0) {
						isappmodule = true
					}
					if (relpath && relpath!="modules") {
						modulename = relpath + "/" + modulename
					}
				}
			}
			if((ext=="html"||ext=="htm" || ext=="svg"|| ext=="json") && filepath.indexOf("/data")>0) {//console.log(filepath)
				data=data.replace(/\r/g,"").replace(/\n/g,"[NL]").replace(/\[NL\]\s+/g,"[NL] ").replace(/"/g,"`").replace(/(<\/?)script/g,"$1Xcr ipt");
				appjs.push('__bootstrap__.templates["'+filepath+'"] = "'+ data+'"')
				holder.html||(holder.html={});
				holder.html[filepath]=data
			}
			else if(ismodule){
				if(modulename && ext) {
					modulename = modulename.replace(new RegExp("\\."+ext+"$"), "").trim()
				}


				if(data){
					var deps=[]
					//"require('".replace(/(^|[^\.\w\-\;'"\{])require\s*\(\s*(['"])/g,function(a,b,c){ return (b||"") + "$.require("+(c||"")})
					if(ext=="js"){
						data.replace(/(\$\.)?require\s*\(\s*['"]([^'"]+?)['"]/g,function(a,b,c){
							//c=c.substr(0,c.length-1);
							if(c){deps.push(c);alldeps.indexOf(c)==-1 && alldeps.push(c)}
							return a
						})

						//var result = UglifyJS.minify(data, {fromString: true});
						//data=result.code
						var data1=fixModuleData(data)
						appjs.push('__bootstrap__.modules["'+modulename+'"] = '+ data1  )
					} else {
						if(ext=="html"){
							data=data.replace(/\@include\s*\(?(["'\w\.\-]+)\s*\)?/g,function(a,b){
								var nm=b.replace(/['"]/g,"").trim()
								return  a
							}).replace(/\{{\s*\>\s*([\w\.\-_]+)\s*}}/g,function(a,b){
								var nm=b.trim()
								return a
							});
							data=data.replace(/\r/g,"").replace(/\n/g,"[NL]").replace(/"/g,"`").replace(/script/g,"Xcr ipt");
							appjs.push('__bootstrap__.templates["'+modulename+'"] = "'+ data+'"')
						}
					}
					//data=data.replace(/\r/gm,"").replace(/\n/gm,"[NL]")
					var model={path:filepath, type:ext,isappmodule:isappmodule,modulename:modulename,dependencies:deps,ts:+stat.mtime}//,content:data
					if(holder[modulename]){
						holder[modulename+"."+ext]=model
					}
					else {
						holder[modulename]=model
					}
				}



			}

		}


	});

}

function getAllModules(fs,folders){

	var holdermods=__init(fs)||{}
	var holder={}
	holder.__appjs=[]
	folders.forEach(
		function(k){
			scanForModules(fs,k,"",holder)
		}
	)

	Object.keys(holdermods).forEach(
		function(a){
			if(holder[a]){
				delete holdermods[a];
			}
		});
	var pending=[]
	alldeps.forEach(
		function(a){
			if(!holder[a]){
				if(holdermods[a] && holdermods[a].url){

					if(typeof(holdermods[a].url)=="string") {
						var url=holdermods[a].url
						if (url && url.indexOf("libs/") == "0") {
							url = "z/js/" + url
						}
						if (url) {
							var data = fixModuleData(fs.readFileSync(url, "utf8") || "");
							holder.__appjs.push('__bootstrap__.modules["' + a + '"] = ' + data)
							delete holdermods[a];
							return
						}
					}
				}
				pending.push(a)

			}
		}
	)
	if(pending.length){

	}
	holder.__holdermods=holdermods;
	return holder
}

function alltemplates(fs,folders,config){
	var all,html,appjs
	var llm = getAllModules(fs,folders) || {}
	html=llm.html;
	delete llm.html;
//,"z/js/libs"
	appjs=llm.__appjs
	delete llm.__appjs;
	all = JSON.stringify(llm)
	var  templates1=[]
	appjs.push("__bootstrap__.cachedtemplates="+ JSON.stringify(llm.__holdermods) );
	config.cssvarmap && appjs.push("__bootstrap__.cssvarmap="+ config.cssvarmap);
	config.calcmap && appjs.push("__bootstrap__.calcmap="+ config.calcmap);
	//grunt.config.set("splashcontent",String(html['app/data/splash.html']).replace(/\[NL\]/g,"\n").replace(/`/g,'"').replace(/Xcr ipt/g,"script"))
	//grunt.config.set("pagecontent",String(html['app/data/pagecontent.html']).replace(/\[NL\]/g,"\n").replace(/`/g,'"').replace(/Xcr ipt/g,"script"))
	var data=appjs.join("\n")
	return data

	//fs.writeFileSync('application_templates.js',"self.__bootstrap__||(self.__bootstrap__={modules:{},cssvarmap:{},html:{}});self.__bootstrap__.templates="+JSON.stringify(html||""));
}
module.exports= {
	processModules:alltemplates
}