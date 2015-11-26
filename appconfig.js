{
    "mode":"development",
     "common":{
        "vars":{
         },
    "resourcelib":"$servicebaseUrl/resources/libs",

        "apptitle":"Garagemate",
        "appname":"garagemate",
        "appversion":".55",
        "apptheme":"theme-parcmate",
            "deploypath":"D:\\ws1\\garagemateui",
        "applibs":[

            ],
        "appResources":[  "qrcodecapture"  ],
        "servicePath":"/router",
        "basePath":"D:/ws1/garagemate/"
},
    "development":{
        "rootUrl":"http://localhost:8095/",
        "contextPath":"",
        "servicebaseUrl":"http://localhost:8080/parcmate_serv"
     },"edge":{
    "rootUrl":"http://parcmate.com",
        "contextPath":"garagemateedge",
        "servicebaseUrl":"http://parcmate.com/parcmate_service_edge"
},"qa":{
    "rootUrl":"http://parcmate.com",
        "contextPath":"garagemateqa",
        "servicebaseUrl":"http://parcmate.com/parcmate_service_qa"
},
    "production":{
         "rootUrl":"http://parcmate.com",
        "contextPath":"garagemateqa",
        "servicebaseUrl":"http://parcmate.com/parcmate_service_qa"
    },
    "publish":{
        "rootUrl":"http://54.86.2.170",
            "contextPath":"",
        "servicebaseUrl":"http://54.86.2.170/parcmate_service_edge"
    }
}


