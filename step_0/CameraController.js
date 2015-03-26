
/**
* @constructor
*/
var CameraController = function() {

  this.zoomDelta = 0.0;
  this.vertDelta = 0.0;
  this.horizDelta = 0.0;
  this.modelViewMatrix = mat4();

  this.lastX = null;
  this.lastY = null;

  this.deltaX = 0.0;
  this.deltaY = 0.0;

  this.rquat = vec4(1.0, 0.0, 0.0, 0.0);

  this.mouseDown = false;

};

/** @const */ CameraController.TWO_PI = 6.2831853071795864769252866;


CameraController.prototype.init = function(canvas) {

    //event listeners for mouse
    canvas.onmousedown = function (e) {
    	lastX = e.clientX;
    	lastY = e.clientY;
    	mouseDown = true;
    };
    document.onmouseup = function () {
        mouseDown = false;
    };
    document.onmousemove = function (e) {
    	if(mouseDown){
            var posX = e.clientX;
            var posY = e.clientY;
        	deltaX = posX - lastX;
        	deltaY = posY - lastY;
        	lastX = posX;
        	lastY = posY;
    	}
    }
    document.onkeydown = function (e){
    	switch (e.keyCode) {
    	case 87:		// w
    		vertDelta = + .005;
    		break;
    	case 65:		// a
    		horizDelta = - .005;
    		break;
    	case 83:		// s
    		vertDelta = - .005;
    		break;
    	case 68:		// d
    		horizDelta = + .005;
    		break;
    	case 16:		// shift
    		zoomDelta = + .005;
    		break;
    	case 32:		// space
    		zoomDelta = - .005;
    		break;
    	}
    }
    document.onkeyup = function (e){
    	switch (e.keyCode) {
    	case 87:		// w
    		vertDelta = 0.0;
    		break;
    	case 65:		// a
    		horizDelta = 0.0;
    		break;
    	case 83:		// s
    		vertDelta = 0.0;
    		break;
    	case 68:		// d
    		horizDelta = 0.0;
    		break;
    	case 16:		// shift
    		zoomDelta = 0.0;
    		break;
    	case 32:		// space
    		zoomDelta = 0.0;
    		break;
    	}
    }

}

CameraController.prototype.getModelViewMatrix = function() {

	if(this.mouseDown){
		var thetaX = this.deltaX*0.005;	//
    var thetaY = this.deltaY*0.005;	//

	  var c1 = Math.cos(this.thetaX);		//heading
    var s1 = Math.sin(this.thetaX);		//heading
    var c2 = Math.cos(0.0);		   	//altitude
    var s2 = Math.sin(0.0);		   	//altitude
    var c3 = Math.cos(this.thetaY);		//bank
    var s3 = Math.sin(this.thetaY);		//bank
    var c1c2 = c1*c2;
    var s1s2 = s1*s2;
    var w =c1c2*c3 - s1s2*s3;
  	var x =c1c2*s3 + s1s2*c3;
		var y =s1*c2*c3 + c1*s2*s3;
		var z =c1*s2*c3 - s1*c2*s3;
		var quat = vec4(w, x, y, z);

    this.rquat = multq(this.rquat, quat);
    this.deltaX = 0.0;
    this.deltaY = 0.0;
	}

	// zoom
	modelViewMatrix[0][0] += this.zoomDelta;	//x
	modelViewMatrix[1][1] += this.zoomDelta;	//y
	modelViewMatrix[2][2] += this.zoomDelta;	//z
    // translate
	modelViewMatrix[0][3] -= this.horizDelta;	//x
	modelViewMatrix[1][3] -= this.vertDelta;	//y
	modelViewMatrix[2][3] = 0.0;	//z

  return modelViewMatrix;
}
