/**
 * Created by Atul on 10/2/2015.
 */


function _extend(src,target){src=src||{}
	var l=[].slice.call(arguments,1)
	for(var i= 0,ln= l.length,o;o=l[i],i<ln;i++){
		if(!(o && typeof(o)=="object")){continue}
		for(var k in o){
			if(o.hasOwnProperty(k)){
				src[k]=o[k]
			}
		}
	}
	return src
}
function fixpath(dir,name){
	var path=dir.replace(/\\/g,"/")
	if(name){
		path=path+"/"+name
	}
	return String(path).replace(/\/\//g,"/");
}
function ensureFolder(path,nm,filesys){var fs=getFs(filesys)
 	var filepath = fixpath(path, nm)
	if (!fs.existsSync(filepath)) {
		fs.mkdir(filepath)
	}
}
function getFileContent(path,filesys,utf){var fs=getFs(filesys)
 	if (!fs.existsSync(path)) {return ""}

	return (fs.readFileSync(path,utf)||"").toString()
}
function setFileContent(path,content,fs,optns){
 	return fs.writeFileSync(path,content,optns)
}
function removeFiles(path,filesys){
	var fs=getFs(filesys)
	if (!fs.existsSync(path)) {return}
	var stat=fs.statSync(path);

	if(stat.isDirectory()) {
		var files = fs.readdirSync(path) || []
		files.forEach(function (a) {
			var nm = String(a.name || a)
			var filepath = fixpath(path, nm)
			removeFiles(filepath, fs)
		});
 	} else {
		fs.unlinkSync(path, "utf8")
	}
}
function getFs(val){
	return val||gruntHelper.FS
}
function copyfiles(fromfilepath,tofilepath,filesys){
	var fs=getFs(filesys)
 	var stat=fs.statSync(fromfilepath);
	if(stat.isDirectory()) {
		if (!fs.existsSync(tofilepath)) {
			fs.mkdir(tofilepath)
		}
		var files = fs.readdirSync(fromfilepath) || []
		files.forEach(function (a) {
			var nm = String(a.name || a)
			var filepath = fixpath(fromfilepath, nm)
			copyfiles(filepath, fixpath(tofilepath, nm), fs)
		});
	} else {
		var data = getFileContent(fromfilepath,fs, "utf8") || "";
		setFileContent(tofilepath,data ,fs );
	}
}
var gruntHelper=  {
	FS:module.fs,
	extend:_extend,
	getFileContent:getFileContent,
	removeFiles:removeFiles,
	fixpath:fixpath,
	ensureFolder:ensureFolder,
	copyfiles:copyfiles,
	setFileContent:setFileContent,
	readConfig: function ( mode,appconfig1,filesys) {var fs=getFs(filesys)
		var appconfig  = {}
		mode = mode || appconfig1.mode || "development"
		var common = appconfig1.common || {},
			modeConfig = appconfig1[mode] || {}
		var commonvars = common.vars
		var modevars = _extend({}, common.vars, modeConfig.vars)
		var applibs = common.applibs || []
		if (modeConfig.applibs && modeConfig.applibs.length) {
			applibs = modeConfig.applibs.concat(applibs)
		}
		_extend(appconfig, appconfig1.common || {});
		_extend(appconfig, appconfig1[mode]);
		appconfig.applibs = applibs;
		appconfig.vars = modevars;
		if (appconfig.rootUrl) {
			appconfig.rootUrl = appconfig.rootUrl.replace(/\/$/, "")
		}
		if (appconfig.rootUrl && appconfig.contextPath) {
			if (appconfig.rootUrl.lastIndexOf(appconfig.contextPath) < (appconfig.rootUrl.length - appconfig.contextPath.length) && appconfig.contextPath != "ROOT") {
				appconfig.rootUrl = appconfig.rootUrl + "/" + appconfig.contextPath
			}
		}
		var dt = new Date();
		appconfig.buildnumber = [dt.getFullYear(), dt.getMonth() + 1, dt.getDate(), "-", dt.getHours()].join("")

		for (var k in appconfig) {
			if (typeof(appconfig[k]) == "string" && appconfig[k].indexOf("$") >= 0) {
				appconfig[k] = appconfig[k].replace(/\$([\w]+)/g, function (a, b) {
					return appconfig[b] == null ? a : appconfig[b]
				})
			}
		}
		appconfig.serviceurl = String(appconfig.servicebaseUrl || "").replace(/[\/\\]$/, "") + "/" + (appconfig.servicePath || "").replace(/^[\/\\]/, "")
		appconfig.splashcontent = getFileContent("app/data/splash.html", fs, "utf8") || getFileContent("z/data/splash.html", fs, "utf8") || ""
		appconfig.pagecontent = getFileContent("app/data/pagecontent.html", fs, "utf8") || getFileContent("z/data/pagecontent.html", fs, "utf8") || ""
		appconfig.mode = mode;

		return appconfig
	}
}
module.exports= gruntHelper