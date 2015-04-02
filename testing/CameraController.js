
/**
 * @constructor
 */
function CameraController() {

  this.viewM = null;
  this.modelM = null;

  this.zoom = 1.0;
  this.vertDelta = 0.0;
  this.horizDelta = 0.0;

  this.lastX = null;
  this.lastY = null;

  this.deltaX = 0.0;
  this.deltaY = 0.0;

  this.rquat = vec4(1.0, 0.0, 0.0, 0.0);

  this.mouseDown = false;

}

/** @const */ CameraController.TWO_PI = 6.2831853071795864769252866;


CameraController.prototype.init = function(canvas) {

  this.viewM = new J3DIMatrix4();

  this.modelM = new J3DIMatrix4();
  this.modelM.translate(0.0, 0.0, -5.0);

  var controller = this;

    //event listeners for mouse
    canvas.onmousedown = function (e) {
      controller.lastX = e.clientX;
      controller.lastY = e.clientY;
      controller.mouseDown = true;
    };
    document.onmouseup = function () {
      controller.mouseDown = false;
      var mv = controller.getModelViewMatrix();
      console.log(mv);
    };
    document.onmousemove = function (e) {
    	if(controller.mouseDown){
        var posX = e.clientX;
        var posY = e.clientY;
        controller.deltaX = posX - controller.lastX;
        controller.deltaY = posY - controller.lastY;
        controller.lastX = posX;
        controller.lastY = posY;
    	}
    }
    document.onkeydown = function (e){
    	switch (e.keyCode) {
      	case 87:		// w
          controller.vertDelta = + .005;
      		break;
      	case 65:		// a
          controller.horizDelta = - .005;
      		break;
      	case 83:		// s
          controller.vertDelta = - .005;
      		break;
      	case 68:		// d
          controller.horizDelta = + .005;
      		break;
      	case 16:		// shift
          controller.zoom = Math.min( controller.zoom + .005, 100);
      		break;
      	case 32:		// space
          controller.zoom = Math.max( controller.zoom - .005, .01);
      		break;
    	}
    }
    document.onkeyup = function (e){
    	switch (e.keyCode) {
      	case 87:		// w
          controller.vertDelta = 0.0;
      		break;
      	case 65:		// a
          controller.horizDelta = 0.0;
      		break;
      	case 83:		// s
          controller.vertDelta = 0.0;
      		break;
      	case 68:		// d
          controller.horizDelta = 0.0;
      		break;
      	case 16:		// shift
          controller.zoom = 0.0;
      		break;
      	case 32:		// space
          controller.zoom = 0.0;
      		break;
    	}
    }

};

CameraController.prototype.getModelViewMatrix = function() {

  // set base axis
  // var invViewM = this.viewM;
  // invViewM.invert();
  var xAxis = new J3DIVector3(1.0, 0.0, 0.0);
  xAxis.multVecMatrix(this.viewM);
  var yAxis = new J3DIVector3(0.0, 1.0, 0.0);
  yAxis.multVecMatrix(this.viewM);

  // zoom
  // this.modelViewMatrix.scale(this.zoom, this.zoom, this.zoom);
  // translate
  // this.modelViewMatrix.translate(-this.horizDelta, -this.vertDelta, 0.0);

	if(this.mouseDown){
		var thetaX = this.deltaX*0.5; 	//
    var thetaY = this.deltaY*0.5; 	//

	  // var c1 = Math.cos(this.thetaX);		//heading
    // var s1 = Math.sin(this.thetaX);		//heading
    // var c2 = Math.cos(0.0);		      	//altitude
    // var s2 = Math.sin(0.0);		       	//altitude
    // var c3 = Math.cos(this.thetaY);		//bank
    // var s3 = Math.sin(this.thetaY);		//bank
    // var c1c2 = c1*c2;
    // var s1s2 = s1*s2;
    // var w =c1c2*c3 - s1s2*s3;
  	// var x =c1c2*s3 + s1s2*c3;
		// var y =s1*c2*c3 + c1*s2*s3;
		// var z =c1*s2*c3 - s1*c2*s3;
		// var quat = vec4(w, x, y, z);
    //
    // this.rquat = multq(this.rquat, quat);
    this.deltaX = 0.0;
    this.deltaY = 0.0;
    // console.log(yAxis);
    // rotate
    this.viewM.rotate(thetaX, yAxis.getAsArray());
    this.viewM.rotate(thetaY, xAxis.getAsArray());
	}

  var mv = new J3DIMatrix4();
  mv.multiply(this.modelM);
  mv.multiply(this.viewM);

  return mv;
};
