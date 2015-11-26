//setupApp -> factory -> setupUserView

(function _app( ) {
    var
        AppInitConfig=$.require("common/AppInitConfig"),
        layoutHelper=$.require("common/layoutHelper"),
        UserDetails=$.require("common/UserDetails")

    function setupApp(callback ) {
          var app = self.app = self.appFactory.create("app", ["UI.Form"])
         app.modules.push( "manager" )
         app.on("init", function () {
             var app = this, user = AppInitConfig(app)
             if($.browser.phantomjs){
                 app.authenticate("phantomjsuser","phantomjs").then(function(){
                     callback(app)
                 })
             } else if(!(user && user.id)) {

                 app.promptLogin(function () {
                     callback(app);
                 });
             } else {
                 if(user.sessiontoken){
                     app.authenticateSession(user.sessiontoken).then(function(){
                         callback(app)
                     })
                     return;
                 }
                 app.setUpSession()
                 callback(app);
                 //app.promptLogin(function () {  callback(app);});
            }
        })
    }
    var app_setip=false
    function setupView(app){
        $d.hide(".splash-outer");
        $d.show(".page-content")

         var rolevw = "garage"
        // if($.browser.phantomjs ){
            if(app.router.getHash()=="claimcheck"){
                return app.showClaimCheck(app.router.getLocationArgs())
            } else if(app.router.getHash()=="receipt"){
                return app.showReceipt(app.router.getLocationArgs())
            }

       // }
        AppInitConfig(app)
        if(layoutHelper){
            layoutHelper(app);
        }
        if(app.user && !app.user.facility_id){
            if(app.user.facility && app.user.facility.id){
                app.user.facility_id=    app.user.facility.id
            }
        }
        Data.loadEntityMeta(function(entitydata){
            this.messages=(entitydata.messages||[]).reduce(function(m,k){
                m[k.message_id]= k.message;
                return m;
            },{});
        }.bind(app))

        app_setip || app.loadModule(rolevw.toLowerCase() ).then(function(mod){
            if(mod){
                mod.init();
                app.fire("viewready")
            }
            },function(a){
                $.handleEx("Promise.reject",a)
        });
        app_setip=true;
    }

    setupApp(setupView );

})();

