// QRCODE reader Copyright 2011 Lazar Laszlo
// http://www.webqr.com

var gCtx = null;
var gCanvas = null;
var c=0;
var stype=0;
var gUM=false;
var webkit=false;
var moz=false;
var videoElement=null;

var imghtml='<div id="qrfile"><canvas id="out-canvas" width="320" height="240"></canvas>'+
    '<div id="imghelp">drag and drop a QRCode here'+
	'<br>or select a file'+
	'<input type="file" onchange="handleFiles(this.files)"/>'+
	'</div>'+
'</div>';

var vidhtml = '<video id="videoElement" autoplay></video>';


function initCanvas(w,h)
{
    gCanvas = document.getElementById("qr-canvas");
    gCanvas.style.width = w + "px";
    gCanvas.style.height = h + "px";
    gCanvas.width = w;
    gCanvas.height = h;
    gCtx = gCanvas.getContext("2d");
    gCtx.clearRect(0, 0, w, h);
}


function captureToCanvas() {
    if(stype!=1)
        return;
    if(gUM)
    {
        try{
            gCtx.drawImage(videoElement,0,0);
            try{
                qrcode.decode();
            }
            catch(e){       
                console.log(e);
                setTimeout(captureToCanvas, 500);
            };
        }
        catch(e){       
                console.log(e);
                setTimeout(captureToCanvas, 500);
        };
    }
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function read(a)
{
    var html=" ";
    if(a.indexOf("http://") === 0 || a.indexOf("https://") === 0)
        html+="<a target='_blank' href='"+a+"'>"+a+"</a><br>";
    html+="<b>"+htmlEntities(a)+"</b>";
    document.getElementById("result").style.opacity=1
     document.getElementById("result").innerHTML=html;
    window.top.postMessage('{"result":"'+a+'","type":"qrcode"}',"*")
    setTimeout(function(){document.getElementById("result") && (document.getElementById("result").style.opacity=.3)})

}	

function isCanvasSupported(){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}
function success(stream) {
    videoElement = document.querySelector('#videoElement')
    if(!videoElement){return}
    if(webkit)
        videoElement.src = window.webkitURL.createObjectURL(stream);
    else
    if(moz)
    {
        videoElement.mozSrcObject = stream;
        videoElement.play();
    }
    else{
       // videoElement.src = stream;
        videoElement.src = window.webkitURL.createObjectURL(stream);
    }
    try{
        videoElement.play();
    }
    catch(e){}
    gUM=true;
    setTimeout(captureToCanvas, 500);
}
		
function error(error) {
    gUM=false;
    return;
}

function load()
{
	if(isCanvasSupported() && window.File && window.FileReader)
	{
		initCanvas(800, 600);
		qrcode.callback = read;
		document.getElementById("mainbody").style.display="inline";
        setwebcam();
	}
	else
	{
		document.getElementById("mainbody").style.display="inline";
		document.getElementById("mainbody").innerHTML='<p id="mp1">QR code scanner for HTML5 capable browsers</p><br>'+
        '<br><p id="mp2">sorry your browser is not supported</p><br><br>'+
        '<p id="mp1">try <a href="http://www.mozilla.com/firefox"><img src="firefox.png"/></a> or <a href="http://chrome.google.com"><img src="chrome_logo.gif"/></a> or <a href="http://www.opera.com"><img src="Opera-logo.png"/></a></p>';
	}
}

function setwebcam()
{


    var videoSelect = document.querySelector('#videoSource');
    var videoElement = document.querySelector('video');


	document.getElementById("result").innerHTML="- scanning -";
    if(stype==1)
    {
        setTimeout(captureToCanvas, 500);    
        return;
    }
    var n=navigator;
    document.getElementById("outdiv").innerHTML = vidhtml;
    videoElement=document.getElementById("videoElement");

    /*if(n.getUserMedia)
        n.getUserMedia({video: true, audio: false}, success, error);
    else
    if(n.webkitGetUserMedia)
    {
        webkit=true;
        n.webkitGetUserMedia({video:true, audio: false}, success, error);
    }
    else
    if(n.mozGetUserMedia)
    {
        moz=true;
        n.mozGetUserMedia({video: true, audio: false}, success, error);
    }*/
    function gotSources(sourceInfos) {
        videoSelect = document.querySelector('#videoSource')

        for (var i = 0; i !== sourceInfos.length; ++i) {
            var sourceInfo = sourceInfos[i];
            if (sourceInfo.kind === 'video' && videoSelect) {
                var option = document.createElement('option');
                 option.value = sourceInfo.id;
                option.text = sourceInfo.label || 'camera ' + (videoSelect.length + 1);
                videoSelect.appendChild(option);
            } else {
                console.log('Some other kind of source: ', sourceInfo);
            }
        }
    }

    if (typeof MediaStreamTrack === 'undefined' ||
        typeof MediaStreamTrack.getSources === 'undefined') {

    } else {
        MediaStreamTrack.getSources(gotSources);
    }
    function start() {
        if (!!window.stream) {
            videoElement && (videoElement.src = null);
            window.stream.stop();
        }

        var videoSource = videoSelect.value;
         var constraints = {
            audio: false,
            video: {
                optional: [{
                    sourceId: videoSource
                }]
            }
        };
        if(n.getUserMedia)
            n.getUserMedia(constraints, success, error);
        else
            if(n.webkitGetUserMedia)
            {
                webkit=true;
                n.webkitGetUserMedia(constraints, success, error);
            }
            else
            if(n.mozGetUserMedia)
            {
                moz=true;
                n.mozGetUserMedia(constraints, success, error);
            }
       // navigator.getUserMedia(constraints, successCallback, errorCallback);
    }
     videoSelect.onchange = start;
    //document.getElementById("qrimg").src="qrimg2.png";
    //document.getElementById("webcamimg").src="webcam.png";
    //document.getElementById("qrimg").style.opacity=0.2;
    //document.getElementById("webcamimg").style.opacity=1.0;
    start();

    //UT
   // window.top.postMessage('{"result":"'+"35929-8067-1657"+'","type":"qrcode"}',"*")
    stype=1;
    setTimeout(captureToCanvas, 500);
}
function setimg()
{
	document.getElementById("result").innerHTML="";
    if(stype==2)
        return;
    document.getElementById("outdiv").innerHTML = imghtml;
    //document.getElementById("qrimg").src="qrimg.png";
    //document.getElementById("webcamimg").src="webcam2.png";
    //document.getElementById("qrimg").style.opacity=1.0;
    //document.getElementById("webcamimg").style.opacity=0.2;
    var qrfile = document.getElementById("qrfile");
    stype=2;
}
