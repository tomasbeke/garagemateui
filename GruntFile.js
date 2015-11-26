

module.exports = function(grunt) {
    //var fs=require("fs")
    function getFS(){
        return require('fs')
    }
    var G=global
    function setGlobal(nm,val){
        G[nm]=val
    }
    function getGlobal(nm){
        return G[nm]
    }
    function readModule(file,fs,callback){
        try{var  f=Function("module,fs",grunt.file.read(file,{encoding:"utf8"})), m={fs:fs};
            Object.defineProperty(m,"exports",{  set:callback, get:function(){}})
            f(m,grunt.file);
        } catch(e){console.error(e)}
    }
    grunt.file.defaultEncoding =   'utf8';
    grunt.file.preserveBOM = false;
    var CSSPreprocessor,moduleScanner,gruntHelper
    var fs=getFS()
    readModule("z/js/libs/gruntHelper.js",fs,function(v){gruntHelper=v;  })
    readModule("z/js/libs/csspreprocessor.js",fs,function(v){CSSPreprocessor=v})
    readModule("z/js/libs/modulescanner.js",fs,function(v){moduleScanner=v})


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
                            var P= 8095

                            setTimeout(function() {
                                require('open')('http://127.0.0.1:'+P);
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
                    '<%=appconfig.deploypath%>\\assets\\  ' +
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
                command: 'copy  wrk\\staged\\js\\* js  && xcopy /Y /E wrk\\staged\\theme\\* theme  && copy  wrk\\staged\\index.html .'
            },

            copyout: {
                command: 'ERASE /F /Q /S  out\\<%=mode%>\\*.* && xcopy   wrk\\staged  out\\<%=mode%>\\ /E /S /Y  && xcopy  assets  out\\<%=mode%>\\assets /E /S /Y && del  out\\<%=mode%>\\site.less'
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
                    "promise", "objectobserve","weakmap","polyfills","bootstrap","base", "baseModel",
                    "fn",  "callbacks", "emitter", "collections",  "DomScanner", "Controller",
                    "templates", "viewport",  "module",  "date", "simpleModel", "Klass","model",
                    "StateMachine",  "data",
                    "dom/css","dom/dom2","dom/query","dom/collection","dom/events","dom/insertion","dom/props","dom/anim","dom/mutation",
                    "dom/touchEvents", "dom/registerElement", "dom/util",
                    "appfactory","geometry","resourceurl","router", "utils",//,"layout"
                    "xhr2","domUI" , "widget", "NumberFormat","SimpleView","PopupView"
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


    function clearstaged(fs){
        fs= fs||getFS()
        var filepath="wrk/staged"
        gruntHelper.removeFiles(filepath,fs);
        gruntHelper.ensureFolder("wrk","staged",fs)
        gruntHelper.ensureFolder(filepath,"app",fs)
        gruntHelper.ensureFolder(filepath,"js",fs)
        gruntHelper.ensureFolder(filepath,"theme",fs)

        //fs.mkdirSync(filepath)
    }



    function copytostaged( target){
        var fs=getFS()
        target=target||"staged"
        gruntHelper.ensureFolder("wrk/"+target,"theme",fs)
        gruntHelper.ensureFolder("wrk/"+target+"/theme","img",fs)

        gruntHelper.ensureFolder("wrk/"+target,"js",fs)
        gruntHelper.ensureFolder("wrk/"+target,"app")
        gruntHelper.ensureFolder("wrk/"+target+"/app","theme",fs)
        gruntHelper.ensureFolder("wrk/"+target+"/app/theme","assets",fs)

        grunt.task.run([ 'shell:copytostaged'])

        var appres=grunt.config.get("appconfig").appResources
        if(appres && appres.length){
            appres.forEach(
                function(k){
                    gruntHelper.copyfiles("app/"+k,"wrk/"+target+"/app/"+k,fs)
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
        var data=moduleScanner.processModules(fs,["z/data","app/js" , "app/data"], config)
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
            //gruntHelper.setFileContent('wrk/staged/js/application'+appconfig.appversion+'.js.map',result.map||"",fs);
        }
        gruntHelper.setFileContent('wrk/staged/js/application'+appconfig.appversion+'.js',data,fs);
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
        var h=[],indexcontent=gruntHelper.getFileContent('app/index.html.template',fs)||gruntHelper.getFileContent('z/data/index.html.template',fs),
            scope=gruntHelper.extend(gruntHelper.extend({},grunt.config.data),grunt.config.data.appconfig);

        indexcontent=_resolveContent(indexcontent,scope)

        gruntHelper.setFileContent('wrk/staged/index.html',indexcontent,fs);
    }

    function _setupmode(mode,effectivemode){
        var fs=getFS()
        gruntHelper.FS=fs
        gruntHelper.ensureFolder("wrk","",fs)
        var appconfig1=grunt.file.readJSON('appconfig.js')
        appconfig=gruntHelper.readConfig(mode,appconfig1,fs)
        grunt.config.set("mode",mode)
        grunt.config.set("effectivemode",effectivemode||mode)

        setGlobal("appport",String(appconfig.port||appconfig1.port||""))
        gruntHelper.extend(grunt.config.data.appconfig,appconfig);
        _writetoStaged();
    }
    function processcorejs(){
        grunt.task.run([ 'concat:core'])
        if(grunt.config.get("mode")!="development"){
            grunt.task.run([ 'uglify'])
        }

    }
    function fixCssContent2(str){
        //replace all px with rem except background pos and media queries
        return str.replace(/\r/g,"")
            .replace(/\bcalc\(\s*([^\~][\S]+)\s*([\-\+\/\\\*]+)\s*([^\)]+\))/g,function(a,b,c,d){
                return ' calc(~"'+b +" "+c+' "'+d
            }) //calc(100% - 40) - > calc(~"100% - " 40)
            .replace(/([\w\-\-]+)\s*:\s*([^;\}\n]+)/g,function(a,b,c){
                if(b.trim().indexOf("background")==-1 && b.trim()!="font-size" && c.indexOf("px")>0) {
                    c= c.replace(/([\.\-\d]+)px/g,function(a1,b1){
                        if(Math.abs(b1)>2){return "pxtorem("+b1+")"}
                        return a1
                    })
                    return b+":"+c;
                }
                return a
            })

    }
    function fixCssContent(str){
        return str.replace(/([\.\-\d]+)px/g,function(a,b){
            if(Math.abs(b)>2){return "pxtorem("+b+")"}
            return a
        })

    }
    function processCss() {
        var fs= getFS(),concatcss = grunt.config.get("stagedfolder")+"site.less"
        /*  grunt.task.run([ 'concat:less'])

         var allcss=gruntHelper.getFileContent(concatcss ,fs, "utf8" )||"";
         var themefile= appconfig.apptheme+".less"
         gruntHelper.setFileContent( concatcss,"@import "+themefile+";\n"+ allcss,fs, "utf8" )||"";*/
        //grunt.task.run(['concat:less'])
        //var allcss=gruntHelper.getFileContent(concatcss ,fs, "utf8" )||"";


        //concat all less content and merge in a single file
        // put aside globals.less to avoid 'cssfixing'
        var appimports
        var allcss=grunt.config.get("concat").less.src.map(function(a){
            if(a.indexOf("*")>0){
                var path=a.split("*").shift()
                var files = fs.readdirSync(path) || []
                return files.filter(function (a1) {
                    var nm = String(a1.name || a1)
                    return /\.less$/.test(nm)
                }).map(function (a1) {
                    var nm = String(a1.name || a1)
                    var filepath =  gruntHelper.fixpath(path, nm)
                    var content = gruntHelper.getFileContent(filepath, fs, "utf8")||""
                    if(nm=="globals.less"){
                        appimports=content;
                        return ""
                    }
                    return content

                }).join("\n");
            }
            var content = gruntHelper.getFileContent(a ,fs, "utf8" )||""
            if(!appimports && a.indexOf("globals.less")>=0){
                appimports=content;
                return ""
            }
            return content
        }).join("\n")
        var allcontent=fixCssContent2(allcss)
        if(appimports){
            allcontent=appimports+"\n"+allcontent
        }
        gruntHelper.setFileContent( concatcss,allcontent,fs, "utf8" );
        grunt.task.run(['less:'+(grunt.config.get("effectivemode")||grunt.config.get("mode"))])
        //   console.log('ddddd')
        //   gruntHelper.removeFiles( concatcss,fs);
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
        grunt.task.run('devrefresh','concurrent')
    })
    grunt.registerTask('devrefresh', 'devrefresh', function(file) {
        gruntHelper.ensureFolder("js","",fs)
        gruntHelper.ensureFolder("theme","",fs)
        _setupmode("development")
        grunt.task.run([ 'shell:copydev'])//'uglify',
    })
    grunt.registerTask('prod', 'prod', function(file) {
        gruntHelper.ensureFolder("out","")
        gruntHelper.ensureFolder("out",grunt.config.get("mode"))
        gruntHelper.ensureFolder("out/"+grunt.config.get("mode"),"assets")

        grunt.task.run([  'shell:copyout'])
    })
    grunt.registerTask('deployable', 'deployable', function(file) {
        _setupmode("production")
        grunt.task.run(['prod'])
        grunt.task.run(['shell:copytodeploy','shell:deployable'])
    })
    grunt.registerTask('edge', 'edge deployable', function(file) {
        _setupmode("edge","production")
        grunt.task.run(['prod'])
        grunt.task.run(['shell:copytodeploy','shell:deployable'])
    })
    grunt.registerTask('qa', 'qa deployable', function(file) {
        _setupmode("qa","production")
        grunt.task.run(['prod'])
        grunt.task.run(['shell:copytodeploy','shell:deployable'])
    })
    grunt.registerTask('deploypublish', 'push to git', function(file) {
        _setupmode("publish")
        grunt.task.run([ 'shell:publish'])
    })
    //grunt.registerTask('default', ['parsecss']);
};