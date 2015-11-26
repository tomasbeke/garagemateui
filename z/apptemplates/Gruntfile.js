

module.exports = function(grunt) {
    //var fs=require("fs")
    grunt.file.defaultEncoding = 'utf8';
    grunt.file.preserveBOM = false;
    var CSSPreprocessor,moduleScanner
    try{var cntnt=grunt.file.read("z/js/libs/csspreprocessor.js",{encoding:"utf8"});
        var f=Function("module,fs",cntnt);
        var m={};
        Object.defineProperty(m,"exports",{set:function(v){//console.log(v)
            CSSPreprocessor=v},get:function(){}})

        f(m,grunt.file);
    } catch(e){console.error(e)}
    try{
        var cntnt=grunt.file.read("z/js/libs/modulescanner.js",{encoding:"utf8"});
        var f=Function("module,fs",cntnt);
        var m={};
        Object.defineProperty(m,"exports",{set:function(v){//console.log(v)
            moduleScanner=v
        },get:function(){}})

        f(m);
    } catch(e){console.error(e)}
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
    var appconfig={}
    grunt.initConfig({
        jasmine : {
            src : [ 'js/core.js','js/workertemplate.js','js/workertemplate.js','js/application<%=appconfig.appversion%>.js','js/app.js'],
            options : {
                specs : 'specs/**/*.js',
                helpers : ['helpers/*.js']
            }
        },
        concurrent: {
            dev: [  "nodemon" ],
            options: {
                logConcurrentOutput: true
            }
        },
        version:+(new Date()),
        appconfig:{},
        stagedfolder:"wrk\\staged\\",
        splashcontent:"",
        pkg: grunt.file.readJSON('package.json'),
        nodemon: {
            dev: {
                script: 'app.js',
                options: {
                    /** Environment variables required by the NODE application **/
                    env: {
                        "NODE_ENV": "development"
                        , "NODE_CONFIG": "dev"
                    },
                    watch: ["server"],
                    delay: 300,

                    callback: function (nodemon) {
                        nodemon.on('log', function (event) {
                            console.log(event );
                        });

                        /** Open the application in a new browser window and is optional **/
                        nodemon.on('config:update', function () {
                            // Delay before server listens on port
                            setTimeout(function() {
                                require('open')('http://127.0.0.1:8090');
                            }, 1000);
                        });

                        /** Update .rebooted to fire Live-Reload **/
                        nodemon.on('restart', function () {
                            // Delay before server listens on port
                            setTimeout(function() {
                                require('fs').writeFileSync('.rebooted', 'rebooted');
                            }, 1000);
                        });
                    }
                }
            }
        },
        shell: {
            options: {
                stderr: false
            },
            copytodeploy:{
                command: [
                    'ERASE /F /Q /S  <%=appconfig.deploypath%>\\js\\*.*',
                    'ERASE /F /Q /S  <%=appconfig.deploypath%>\\app\\*.*',
                    'ERASE /F /Q /S  <%=appconfig.deploypath%>\\theme\\*.*' ,
                    'xcopy  out\\<%=mode%>  <%=appconfig.deploypath%>\\ /E /S /Y'
                ].join(" && ")
            },
            copytostaged: {
                command: [
                    "copy z\\js\\libs\\workertemplate.js wrk\\staged\\js\\workertemplate.js",
                    "xcopy z\\theme\\fonts wrk\\staged\\theme\\fonts  /E /S /Y",
                    "xcopy z\\theme\\img wrk\\staged\\theme\\img /E /S /Y",
                    "copy app\\js\\app.js wrk\\staged\\js\\app.js",
                    "xcopy app\\theme wrk\\staged\\app\\theme  /E /S /Y",
                    "del wrk\\staged\\app\\theme\\*.less"
                ].join(" && ")
            },
            deployable: {

                command: [
                    '"C:\\Program Files\\7-Zip\\7z.exe" a -tzip wrk\\<%=appconfig.contextPath%>.zip ' +
                    '<%=appconfig.deploypath%>\\index.html ' +
                    '<%=appconfig.deploypath%>\\favicon.ico ' +
                    '<%=appconfig.deploypath%>\\app\\ ' +
                    '<%=appconfig.deploypath%>\\js\\  ' +
                    '<%=appconfig.deploypath%>\\theme\\',
                    'move /Y wrk\\\<%=appconfig.contextPath%>.zip ' +
                    '<%=appconfig.deploypath%>\\\<%=appconfig.contextPath%>.war'

                ].join(" && ")
            },
            deployaws: {

                command: [
                    '"C:/Program Files (x86)/WinSCP/pscp.exe" -C   -l root -pw Xxxzzz <%=appconfig.deploypath%>\\\<%=appconfig.contextPath%>.war root@64.22.106.178:/var/tomcat735/webapps/<%=appconfig.contextPath%>.war'
                ].join(" && ")
            },
            deploy: {

                command: [
                    '"C:/Program Files (x86)/WinSCP/pscp.exe" -C   -l root -pw Xxxzzz <%=appconfig.deploypath%>\\\<%=appconfig.contextPath%>.war root@64.22.106.178:/var/tomcat735/webapps/<%=appconfig.contextPath%>.war'
                ].join(" && ")
            },
            copydev: {
                command: 'copy  wrk\\staged\\js\\* js  && copy  wrk\\staged\\theme\\* theme  && copy  wrk\\staged\\index.html .'
            },

            copyout: {
                command: 'ERASE /F /Q /S  out\\<%=mode%>\\*.* && xcopy   wrk\\staged  out\\<%=mode%>\\ /E /S /Y'
            },

            publish: {
                command:  'call  gitpush.bat'
            }

        },


        parsecss: {
            files:   ['z/theme/<%=appconfig.apptheme%>.css','z/theme/theme-base.css','z/theme/layout.css','z/theme/calendar.css','app/theme/app.css']
        } ,
        cssmin: {
            minify: {
                src:  '<%=stagedfolder%>theme/site.css' ,
                dest: '<%=stagedfolder%>theme/site.css'
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            css: {
                src: [ 'wrk/<%=appconfig.apptheme%>.css','wrk/theme-base.css','wrk/layout.css','wrk/app.css'],
                dest: 'wrk/prep/theme/site.css'
            },
            less: {
                src: [ 'z/theme/globals.less','z/theme/<%=appconfig.apptheme%>.less','app/theme/app-imports.less','z/theme/theme-base.less','z/theme/layout.less' ,'z/theme/calendar.less','app/theme/app.less',"app/data/*.less"],
                dest: '<%=stagedfolder%>site.less'
            },
            core: {
                src: [
                    "promise", "objectobserve","weakmap","polyfills","bootstrap","baseModel",
                    "fn",  "callbacks", "emitter", "collections",  "DomScanner", "Controller",
                    "base", "templates", "templates", "viewport",  "module",  "date", "simpleModel", "Klass","model",
                    "StateMachine",  "data",
                    "dom/css","dom/dom2","dom/query","dom/collection","dom/events","dom/insertion","dom/props","dom/anim","dom/mutation",
                    "dom/touchEvents", "dom/registerElement", "dom/util",
                    "appfactory","geometry","resourceurl","router", "utils",//,"layout"
                    "xhr2","domUI" , "widget", "NumberFormat"
                ].map(function(a){

                        return "z/js/core/"+a+".js"}),
                dest: '<%=stagedfolder%>js/core.js'
            }
        },
        less: {
            development: {
                options: {
                    paths: ["app/data","z/theme"],
                    plugins: [
                        new (require('less-plugin-autoprefix'))({}),
                        // new (require('less-plugin-clean-css'))({}),
                        new (require('less-plugin-functions'))({})
                    ],
                    functions: {
                        pxtorem: function(px) {
                            if(px && Math.abs(Number(px))>2){
                                return (Number(px)/10).toFixed(1)+"rem"
                            }
                            return px;
                        }
                    }
                },
                files: {
                    "<%=stagedfolder%>theme/site.css": "<%=stagedfolder%>site.less"
                }
            },
            production: {
                options: {
                    ieCompat:true,
                    paths: ["app/data","z/theme"],
                    plugins: [
                        new (require('less-plugin-autoprefix'))({}),
                        new (require('less-plugin-clean-css'))({}),
                        new (require('less-plugin-functions'))({})
                    ],
                    modifyVars: {
                        imgPath1: '"http://mycdn.com/path/to/images"',
                        bgColor1: 'red'
                    }
                },
                files: {
                    "<%=stagedfolder%>/theme/site.css": "<%=stagedfolder%>site.less"
                }
            },
            publish: {
                options: {
                    ieCompat:true,
                    paths: ["app/data","z/theme"],
                    plugins: [
                        new (require('less-plugin-autoprefix'))({}),
                        new (require('less-plugin-clean-css'))({}),
                        new (require('less-plugin-functions'))({})
                    ],
                    modifyVars: {
                        imgPath1: '"http://mycdn.com/path/to/images"',
                        bgColor1: 'red'
                    }
                },
                files: {
                    "<%=stagedfolder%>/theme/site.css": "<%=stagedfolder%>site.less"
                }
            }
        },
        uglify: {
            //my_target: {files: [{ expand: true,cwd: 'src/js',src: '**/*.js',dest: 'dest/js' }]}
            options: {
                sourceMap:false,
                compress:{
                    negate_iife:false,
                    sequences:false
                },
                negate_iife:false,
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
                //,mangle: {except: ['jQuery', 'Backbone']}
            },
            fw: {
                files: {
                    'wrk/staged/js/core.js': ['<%=concat.core.dest %>']
                }
            }
        },

        jshint: {
            files: ['Gruntfile.js',  '**/*.js', 'test/**/*.js'],//exclude
            options: {
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            }
        },
        watchq: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'qunit']
        }
    });

    function getFileContent(path,fs,utf){
        fs= fs||getFS()
        if (!fs.existsSync(path)) {return ""}

        return (fs.readFileSync(path,utf)||"").toString()
    }
    function setFileContent(path,content,fs,optns){
        fs= fs||getFS()
        //if (!fs.existsSync(path)) {return}
        return fs.writeFileSync(path,content,optns)
    }
    function removeFiles(path,fs){
        if (!fs.existsSync(path)) {return}
        var stat=fs.statSync(path);

        if(stat.isDirectory()) {
            var files = fs.readdirSync(path) || []
            files.forEach(function (a) {
                var nm = String(a.name || a)
                var filepath = fixpath(path, nm)
                removeFiles(filepath, fs)
            });
            //fs.remove(path, "utf8")
        } else {
            fs.unlinkSync(path, "utf8")
        }
    }
    function clearstaged(fs){
        fs= fs||getFS()
        var filepath="wrk/staged"
        removeFiles(filepath,fs);
        ensureFolder("wrk","staged")
        ensureFolder(filepath,"app")
        ensureFolder(filepath,"js")
        ensureFolder(filepath,"theme")

        //fs.mkdirSync(filepath)
    }
    function ensureFolder(path,nm,fs){
        fs = fs||getFS()
        var filepath = fixpath(path, nm)
        if (!fs.existsSync(filepath)) {
            fs.mkdir(filepath)
        }
    }
    function copyfiles(fromfilepath,tofilepath,fs){
        fs = fs||getFS()
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


    function copytostaged( target){
        var fs=getFS()
        target=target||"staged"
        ensureFolder("wrk/"+target,"theme")
        ensureFolder("wrk/"+target,"js")
        ensureFolder("wrk/"+target,"app")
        ensureFolder("wrk/"+target+"/app","theme")
        grunt.task.run([ 'shell:copytostaged'])

        var appres=grunt.config.get("appconfig").appResources
        if(appres && appres.length){
            appres.forEach(
                function(k){
                    copyfiles("app/"+k,"wrk/"+target+"/app/"+k,fs)
                }
            )
        }
    }
    function _writetoStaged(){
        var fs=getFS(),config=grunt.config.get("appconfig")
        clearstaged(fs);
        CSSPreprocessor.setup(config)
        processCss();
        processcorejs();
        var data=moduleScanner.processModules(fs,["z/data","app/js","z/js/libs", "app/data"], config)
        var ugly=  grunt.config.get("mode")!="development"
        if(ugly) {
            var UglifyJS = require("uglify-js");
            var result = UglifyJS.minify(data, {
                fromString: true,
                outSourceMap: false,//"application.js.map"
                compress: {drop_debugger: true},
                mangle: {
                    except: ['module']
                }
            });
            data = result.code
            //setFileContent('wrk/staged/js/application'+appconfig.appversion+'.js.map',result.map||"",fs);
        }
        setFileContent('wrk/staged/js/application'+appconfig.appversion+'.js',data,fs);
        copytostaged()
        _prepIndexFile(fs)

    }
    function _resolveContent(content,scope){
        return content.replace(/\{\{([\w]+)\}\}/g,"{$1}").replace(/\{([\w]+)\}/g,function (a,b){
            b= b.trim()
            var val= scope[b]
            if(val==null){console.log("not found",b);return b=="splashcontent" || b=="pagecontent"?"":a}
            if(Array.isArray(val)){val=val.join("")}
            return val
        });
    }
    function _prepIndexFile(fs){
        fs = fs||getFS()
        var h=[],indexcontent=getFileContent('app/index.html.template',fs)||getFileContent('z/data/index.html.template',fs),
            scope=_extend(_extend({},grunt.config.data),grunt.config.data.appconfig);

        indexcontent=_resolveContent(indexcontent,scope)

        setFileContent('wrk/staged/index.html',indexcontent,fs);
    }
    function _readConfig(mode){
        var fs=getFS()
        var appconfig1=grunt.file.readJSON('appconfig.js')
        mode=mode||appconfig1.mode||"development"
        var commonvars=(appconfig1.common||{}).vars
        var modevars=_extend({},(appconfig1.common||{}).vars,(appconfig1[mode]||{}).vars)

        _extend(appconfig ,appconfig1.common||{});
        _extend(appconfig ,appconfig1[mode]);
        for(var k in appconfig){
            if(typeof(appconfig[k])=="string" && /\$\w+/.test(appconfig[k])){
                appconfig[k]=appconfig[k].replace(/\$([\w]+)/g,function(a,b){return appconfig[b]||a})
            }
        }
        appconfig.vars=modevars;
        if(appconfig.rootUrl){
            appconfig.rootUrl=appconfig.rootUrl.replace(/\/$/,"")
        }
        if(appconfig.rootUrl && appconfig.contextPath){
            if(appconfig.rootUrl.lastIndexOf(appconfig.contextPath)<(appconfig.rootUrl.length-appconfig.contextPath.length) && appconfig.contextPath!="ROOT"){
                appconfig.rootUrl=appconfig.rootUrl+"/"+appconfig.contextPath
            }
        }
        var dt=new Date();
        appconfig.buildnumber=[dt.getFullYear(),dt.getMonth()+1,dt.getDate(),"-",dt.getHours()].join("")
        appconfig.serviceurl=String(appconfig.servicebaseUrl||"").replace(/[\/\\]$/,"")+"/"+(appconfig.servicePath||"").replace(/^[\/\\]/,"")
        appconfig.splashcontent=getFileContent("app/data/splash.html",fs, "utf8") || ""
        appconfig.pagecontent=getFileContent("app/data/pagecontent.html",fs, "utf8") || ""
        appconfig.mode=mode;
        grunt.config.set("mode",mode)
        _extend(grunt.config.data.appconfig,appconfig);
        return appconfig
    }
    function _setupmode(mode,initsetup){
        _readConfig(mode)
        if(!initsetup) {
            _writetoStaged();
        }
    }
    function processcorejs(){
        grunt.task.run([ 'concat:core'])
        if(grunt.config.get("mode")!="development"){
            grunt.task.run([ 'uglify'])
        }

    }

    function processCss() {
        var fs= getFS(),concatcss = grunt.config.get("stagedfolder")+"site.less"
        /*  console.log('ddddd2')
         grunt.task.run([ 'concat:less'])
         var allcss=getFileContent(concatcss ,fs, "utf8" )||"";
         var themefile= appconfig.apptheme+".less"
         setFileContent( concatcss,"@import "+themefile+";\n"+ allcss,fs, "utf8" )||"";*/
        console.log(2)
        grunt.task.run(['concat:less'])
        var allcss=getFileContent(concatcss ,fs, "utf8" )||"";
        setFileContent( concatcss,allcss.replace(/([\.\-\d]+)px/g,function(a,b){
            if(Math.abs(b)>2){return "pxtorem("+b+")"}
            return a
        }),fs, "utf8" );
        console.log(2)
        grunt.task.run(['less:'+grunt.config.get("mode")])
        //   console.log('ddddd')
        //   removeFiles( concatcss,fs);
    }

    function fixpath(dir,name){
        var path=dir.replace(/\\/g,"/")
        if(name){
            path=path+"/"+name
        }
        return String(path).replace(/\/\//g,"/");
    }

    function getFS(){
        return require('fs')
    }

    //_setupmode(null,true)


    function replaceScope(line,scopere,scopere2){
        return line.trim().replace(scopere,function(a,b){return "&"})
            .replace(scopere2,function(a,b){return ", &"})
    }


    grunt.loadNpmTasks("grunt-nodemon");
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks("grunt-concurrent")
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-zip');

    grunt.loadNpmTasks('grunt-contrib-less');
    //grunt.loadNpmTasks('grunt-jasmine-runner');
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    grunt.registerTask('default', ['concat', 'uglify','parsecss','cssmin']);
    grunt.registerTask('parsecss', 'css vars', processCss);
    grunt.registerTask('processcorejs', 'css vars', processcorejs);


    grunt.registerTask('dev', 'dev', function(file) {
        _setupmode("development")
        grunt.task.run([ 'shell:copydev','concurrent'])//'uglify',
    })
    grunt.registerTask('prod', 'prod', function(file) {
        _setupmode("production")
        grunt.task.run([  'shell:copyout'])
    })
    grunt.registerTask('deployable', 'deployable', function(file) {
        _setupmode("production")
        grunt.task.run(['prod'])
        grunt.task.run(['shell:copytodeploy','shell:deployable'])
    })
    grunt.registerTask('deploypublish', 'push to git', function(file) {
        _setupmode("publish")
        grunt.task.run([ 'shell:copyout','shell:copytodeploy'])
    })
    //grunt.registerTask('default', ['parsecss']);
};