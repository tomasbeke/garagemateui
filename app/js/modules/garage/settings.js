var app=$.require("app")
var stores=$.require("garage/garagestores")
var utils=$.require("garage/garageutils")
var DataGrid= $.require("DataGrid")


function controller(el){

 }

var garage_settings=app.defineView( {id:"garagecontact" , template:"garagesettings",selector:".garagecontact" ,model:null,title:"Settings",controller:controller});

module.exports=garage_settings