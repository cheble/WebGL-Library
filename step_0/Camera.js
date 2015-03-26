
/**
* @constructor
*/
var Camera = function() {

  this.projM = new J3DIMatrix4();

  //this.modelViewM = new J3DIMatrix4();
  this.eye = new J3DIVector3(0.0, 5.0, 0.0);
  this.center = new J3DIVector3(0.0, 0.0, 0.0);
  this.up = new J3DIVector3(0.0, 0.0, 1.0);
};

/** @const */ Camera.DEFAULT_FOVY = 45.0;
/** @const */ Camera.DEFAULT_ASPECT = 1.0;
/** @const */ Camera.DEFAULT_ZNEAR = 0.1;
/** @const */ Camera.DEFAULT_ZFAR = 100.0;

/**
* @param {float} fovy
* @param {float} aspect
* @param {float} zNear
* @param {float} zFar
*/
Camera.prototype.setProjection = function(fovy, aspect, zNear, zFar) {
  this.projM = this.projM.perspective(fovy, aspect, zNear, zFar);
};

/**
*
*/
Camera.prototype.getModelViewMatrix = function() {

  var mvArray = buildRotationMatrix(theCurtQuat)

  var mv = new J3DIMatrix4(flatten(mvArray));

  return mv;
  // return mv.lookat(this.eye, this.center, this.up);
};

Camera.prototype.init = function(canvas) {

  var aspect = canvas.width * 1.0 / canvas.height;
  this.setProjection(Camera.DEFAULT_FOVY, aspect, Camera.DEFAULT_ZNEAR, Camera.DEFAULT_ZFAR);

  canvas.addEventListener("mousedown", function(e){
    var pos = getMousePos(e, this);
    var x = pos[0];
    var y = pos[1];

    if (e.button == 0) {
      startMotion(x, y);
    } else if (e.button == 1) {
      startScale(x, y);
    }

    // render();
  });

  canvas.addEventListener("mousemove", function(e){
    var pos = getMousePos(e, this);
    var x = pos[0];
    var y = pos[1];

    var curPos = [];
    var dx, dy, dz;

    /* compute position on hemisphere */
    trackball_ptov(x, y, curPos);

    if(theTrackingMove)
    {
      /*
      * compute the change in position on the hemisphere
      */
      dx = curPos[0] - theLastPos[0];
      dy = curPos[1] - theLastPos[1];
      dz = curPos[2] - theLastPos[2];
      if (dx || dy || dz)
      {
        /* compute theta and cross product */
        theAngle = 90.0 * Math.sqrt(dx*dx + dy*dy + dz*dz) / 180.0 * Math.PI;
        theAxis = cross(theLastPos, curPos);

        var q = trackball_vtoq(theAngle, theAxis);

        if (theInit) {
          theCurtQuat = q;
          theInit = false;
        } else {
          theCurtQuat = multiplyQuat(q, theCurtQuat);
        }

        /* update position */
        theLastPos[0] = curPos[0];
        theLastPos[1] = curPos[1];
        theLastPos[2] = curPos[2];
      }

      // render();
    }

    if (theScalingMove) {
      if (theCurtX != x || theCurtY != y) {

        theScale += (theCurtY * 1.0 - y)/2.0 * 1.3 * theScale; // 2.0 -
        // the
        // windows
        // height
        if (theScale <= 0.0) {
          theScale = 0.00000001;
        }

        theCurtX = x;
        theCurtY = y;
      }

      // render();
    }

  });

  canvas.addEventListener("mouseup", function(e) {
    var pos = getMousePos(e, this);
    var x = pos[0];
    var y = pos[1];

    if (e.button == 0) {
      stopMotion(x, y);
    } else if (e.button == 1) {
      stopScale(x, y);
    }
  });
}


// Rotation parameters
var theAngle = 0.0;
var theAxis = [];

var theTrackingMove = false;
var theScalingMove = false;

var	theLastPos = [];
var	theCurtX, theCurtY;
var	theStartX, theStartY;
var	theCurtQuat = [1, 0, 0, 0];
var	theScale = 1.0;
var theInit = true;

// Rotation related functions
function trackball_ptov(x, y,  v)
{
  var d, a;

  /*
  * project x,y onto a hemisphere centered within width, height, note z is up
  * here
  */
  v[0] = x;
  v[1] = y;
  d = v[0] * v[0] + v[1] * v[1];
  if (d > 1) {
    v[2] = 0.0;
  } else {
    v[2] = Math.sqrt(1.0 - d);
  }

  a = 1.0 / Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
  v[0] *= a;
  v[1] *= a;
  v[2] *= a;
}

function trackball_vtoq(angle, axis)
{
  var c = Math.cos(angle/2.0);
  var s = Math.sin(angle/2.0);
  var a = 1.0 / Math.sqrt(axis[0]*axis[0] + axis[1]*axis[1] + axis[2]*axis[2]);

  var quat = [];

  quat[0] = c;
  quat[1] = axis[0] * a * s;
  quat[2] = axis[1] * a * s;
  quat[3] = axis[2] * a * s;

  return quat;
}

function multiplyQuat(a, b)
{
  var quat = [];

  quat[0] = a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3];
  quat[1] = a[0] * b[1] + b[0] * a[1] + a[2] * b[3] - b[2] * a[3];
  quat[2] = a[0] * b[2] - a[1] * b[3] + b[0] * a[2] + b[1] * a[3];
  quat[3] = a[0] * b[3] + a[1] * b[2] - b[1] * a[2] + b[0] * a[3];

  return quat;
}

function buildRotationMatrix(q)
{
  var m = mat4(1-2*q[2]*q[2]-2*q[3]*q[3], 2*q[1]*q[2]+2*q[0]*q[3],   2*q[1]*q[3]-2*q[0]*q[2],   0,
    2*q[1]*q[2]-2*q[0]*q[3],   1-2*q[1]*q[1]-2*q[3]*q[3], 2*q[2]*q[3]+2*q[0]*q[1],   0,
    2*q[1]*q[3]+2*q[0]*q[2],   2*q[2]*q[3]-2*q[0]*q[1],   1-2*q[1]*q[1]-2*q[2]*q[2], 0,
    0,                         0,                         0,                         1);

    m = transpose(m);

    return m;
  }

  function invq(a)
  {
    return( scalev( 1.0/dot(a, a) , vec4(a[0], negate(a.slice(1,4)))) );
  }

  function getMousePos(e, canvas)
  {
    var event = e || window.event;
    var client_x_r = event.clientX - canvas.offsetLeft;
    var client_y_r = event.clientY - canvas.offsetTop;
    var clip_x = -1 + 2 * client_x_r / canvas.width;
    var clip_y = -1 + 2 * (canvas.height - client_y_r) / canvas.height;
    var t = vec2(clip_x, clip_y);

    return t;
  }

  function startMotion(x, y)
  {
    theTrackingMove = true;
    theStartX = x;
    theStartY = y;
    theCurtX = x;
    theCurtY = y;
    trackball_ptov(x, y, theLastPos);
  }


  function stopMotion(x, y)
  {
    theTrackingMove = false;

    /* check if position has changed */
    if (theStartX == x && theStartY == y) {
      theAngle = 0.0;
    }
  }

  function startScale(x, y)
  {
    theScalingMove = true;
    theCurtX = x;
    theCurtY = y;
  }

  function stopScale(x, y)
  {
    theScalingMove = false;
  }
