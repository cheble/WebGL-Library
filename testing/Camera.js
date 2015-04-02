
/**
* @constructor
*/
function Camera(controller) {

  this.projM = null;

  // this.modelViewM = new J3DIMatrix4();
  // this.eye = new J3DIVector3(0.0, 5.0, 0.0);
  // this.center = new J3DIVector3(0.0, 0.0, 0.0);
  // this.up = new J3DIVector3(0.0, 0.0, 1.0);

  this.controller = controller;
}

/** @const */ Camera.DEFAULT_FOVY = 45.0;
/** @const */ Camera.DEFAULT_ASPECT = 1.0;
/** @const */ Camera.DEFAULT_ZNEAR = 0.1;
/** @const */ Camera.DEFAULT_ZFAR = 100.0;


Camera.prototype.init = function(canvas) {
  var aspect = canvas.width * 1.0 / canvas.height;

  this.projM = new J3DIMatrix4();
	this.projM.perspective(Camera.DEFAULT_FOVY, aspect, Camera.DEFAULT_ZNEAR, Camera.DEFAULT_ZFAR)
};

Camera.prototype.getModelViewMatrix = function() {

  return this.controller.getModelViewMatrix();
  
};
