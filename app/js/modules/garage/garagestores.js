

var reservestore,reserveStorePending=1,reserveStorePromise=null,reserveStoreReservedPending=1,reserveStoreReservedPromise=null,reservestoreReserved=null;
function refreshReserveStore(callback){
    if(!reserveStorePending) {
        reserveStorePending = 1
        reserveStorePromise = null;
    }
    getReserveStore(callback)
}
function getReserveStore(callback){
    if(!reserveStorePromise){reserveStorePromise=Promise.deferred()}
    if(callback){reserveStorePromise.then(callback)}
    if(reserveStorePending>0&&reserveStorePending<4) {
        app.getEntity("facility_reserveusers").then(function (ent) {

            ent.updateFields({
                date_from: {type: "date", label: "Date"},
                time_from: {type: "time", label: "Time", cellui: {style: {whiteSpace: "nowrap"}}},
                reserve_num: {label: "Num"},
            });
            reservestore = ent.createStore()
            app.Xreservestore = reservestore;
            reservestore.pager.sortcol = "id"
            reservestore.pager.sortdir = "d"
            reservestore.provider.includelookups = false;
            reservestore.pager.pagesize = -1
            reservestore.defaultCriteria = "facility_id=" + app.user.facility.id + " and resstatus < 99"
            reservestore.load(true).then(function () {
                    reserveStorePending = 0
                    reserveStorePromise.resolve(reservestore)
                },
                function () {
                    reserveStorePending++
                    setTimeout(getReserveStore, 0)
                })
        });
    }
    return reserveStorePromise
}
var checkedInStore,checkedInStoreActivePromise
function getCheckedInStore(callback){
    if(!checkedInStore){
        app.getEntity("facility_reserveusers").then(function (ent) {
            checkedInStore= ent.createStore()
            checkedInStore.pager.sortcol = "id"
            checkedInStore.pager.sortdir = "d"
            checkedInStore.provider.includelookups = false;
            checkedInStore.pager.pagesize = -1
            checkedInStore.defaultCriteria = "facility_id=" + app.user.facility.id + " and resstatus = 2"
        })
    }
    if(checkedInStoreActivePromise){checkedInStoreActivePromise.then(callback)}
    checkedInStoreActivePromise=Promise.deferred()
    checkedInStore.load(true).then(function () {
            checkedInStoreActivePromise.resolve(reservestore)
            checkedInStoreActivePromise=null;
        },
        function () {
            checkedInStoreActivePromise.resolve(reservestore)
            checkedInStoreActivePromise=null;
        });
}

function refreshReserveStoreReserved(callback){
    if(!reserveStoreReservedPending) {
        reserveStoreReservedPending = 1
        reserveStoreReservedPromise = null;
    }
    getReserveStoreReserved(callback)
}
function getReserveStoreReserved(callback){
    if(!reserveStoreReservedPromise){reserveStoreReservedPromise=Promise.deferred()}
    if(callback){reserveStoreReservedPromise.then(callback)}
    if(reserveStoreReservedPending>0&&reserveStoreReservedPending<4) {
        app.getEntity("facility_reserveusers").then(function (ent) {

            ent.updateFields({
                date_from: {type: "date", label: "Date"},
                time_from: {type: "time", label: "Time", cellui: {style: {whiteSpace: "nowrap"}}},
                reserve_num: {label: "Num"},
            });
            reservestoreReserved = ent.createStore()
            reservestoreReserved.pager.sortcol = "id"
            reservestoreReserved.pager.sortdir = "d"
            reservestoreReserved.provider.includelookups = false;
            reservestoreReserved.pager.pagesize = -1
            reservestoreReserved.defaultCriteria = "facility_id=" + app.user.facility.id + " and resstatus = 1"
            reservestoreReserved.load(true).then(function () {
                    reserveStoreReservedPending = 0
                    reserveStoreReservedPromise.resolve(reservestoreReserved)
                },
                function () {
                    reserveStoreReservedPending++
                    setTimeout(getReserveStoreReserved, 0)
                })
        });
    }
    return reserveStoreReservedPromise
}

var refstores={
    refreshReserveStore:refreshReserveStore,
    getCheckedInStore:getCheckedInStore,
    getReserveStore:getReserveStore,
    getReserveStoreReserved:getReserveStoreReserved,
    refreshReserveStoreReserved:refreshReserveStoreReserved
}
module.exports=refstores
