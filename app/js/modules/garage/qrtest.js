/**
 * Created by Atul on 7/13/2015.
 */
function controller(el){

	document.addEventListener("deviceready", loaded, false);
	function loaded() {
		pictureSource = navigator.camera.PictureSourceType;
		destinationType = navigator.camera.DestinationType;
		$d(".camera-control").on("click",capturePhoto)
	}

	function capturePhoto() {
		navigator.camera.getPicture(getPhoto, onFail, {
			quality : 50
		});
	}
	function getPhoto(imageData) {
 		var smallImage = document.getElementById('cameraPic');
		smallImage.style.display = 'block';
		smallImage.src = "data:image/jpeg;base64," + imageData;
	}
	function onFail(message) {
		alert('Failed because: ' + message);
	}

}

var qrtest=app.defineView({id:"qrtest",layout:"fill", selector:".qrtest", template:"qrtest", title:"qrtest",controller:controller});

module.exports=qrtest