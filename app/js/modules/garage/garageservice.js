var app=$.require("app")

function doCheckIn( data,callback) {
    return app.remoteDirective("docheckin",{ sel: data },callback)

}
function doReserve( data,callback) {
    return app.remoteDirective("confirmreserve",{ sel: data },callback)
}
function doCheckOut(data,callback ) {
    return app.remoteDirective("docheckout",{ sel: data },callback)
}


module.exports={
    doCheckOut:doCheckOut,
    doReserve:doReserve,
    doCheckIn:doCheckIn

}
