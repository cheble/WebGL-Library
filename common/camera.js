function Camera(canvas) {
  var self = this;

  // Projection transformation properties
  this.fovy = 45.0;
  this.aspect = canvas.width * 1.0 / canvas.height;
  this.zNear = 0.1;
  this.zFar = 1000.0;

  this.projM = perspective(this.fovy, this.aspect, this.zNear, this.zFar);

  // Rotation properties
  this.rAngle = 0.0;
  this.rAxis = [];

  // Camera control properties
  this.trackingMove = false;
  this.scalingMove = false;
  this.lastPos = [];
  this.curtX = null;
  this.curtY = null;
  this.startX = null;
  this.startY = null;
  this.curtQuat = [1, 0, 0, 0];
  this.scale = 1.0;

  canvas.addEventListener("mousedown", function(e){ self.cameraStart(e); });
  canvas.addEventListener("touchstart", function(e){ self.cameraStart(e); });

  canvas.addEventListener("mousemove", function(e){ self.cameraMove(e); });
  canvas.addEventListener("touchmove", function(e){ self.cameraMove(e); });

  canvas.addEventListener("mouseup", function(e) { self.cameraStop(e); });
  canvas.addEventListener("touchend", function(e) { self.cameraStop(e); });
}

Camera.prototype.setAspect = function(theCanvas) {
  this.aspect = theCanvas.width * 1.0 / theCanvas.height;
  this.projM = perspective(this.fovy, this.aspect, this.zNear, this.zFar);
}

Camera.prototype.cameraStart = function(e) {
  var pos = getPointEventPos(e, canvas);
  var x = pos[0];
  var y = pos[1];

  if (e.button == 0 || e.touches) {
    this.startMotion(x, y);
  } else if (e.button == 1) {
    this.startScale(x, y);
  }

  // requestAnimFrame( render );
  e.preventDefault();
}

Camera.prototype.cameraMove = function(e) {
  var pos = getPointEventPos(e, canvas);
  var x = pos[0];
  var y = pos[1];

  var curPos = [];
  var dx, dy, dz;

  /* compute position on hemisphere */
  trackball_ptov(x, y, curPos);

  if(this.trackingMove)
  {
    /*
    * compute the change in position on the hemisphere
    */
    dx = curPos[0] - this.lastPos[0];
    dy = curPos[1] - this.lastPos[1];
    dz = curPos[2] - this.lastPos[2];
    if (dx || dy || dz)
    {
      /* compute theta and cross product */
      this.rAngle = 90.0 * Math.sqrt(dx*dx + dy*dy + dz*dz) / 180.0 * Math.PI;
      this.rAxis = cross(this.lastPos, curPos);

      var q = trackball_vtoq(this.rAngle, this.rAxis);

      this.curtQuat = multiplyQuat(q, this.curtQuat);

      /* update position */
      this.lastPos[0] = curPos[0];
      this.lastPos[1] = curPos[1];
      this.lastPos[2] = curPos[2];
    }
  }

  if (this.scalingMove) {
    if (this.curtX != x || this.curtY != y) {

      this.scale += (this.curtY * 1.0 - y)/2.0 * 1.3 * this.scale; // 2.0 -
      // the
      // windows
      // height
      if (this.scale <= 0.0) {
        this.scale = 0.00000001;
      }

      this.curtX = x;
      this.curtY = y;
    }
  }

  if (this.scalingMove || this.trackingMove) {
    // requestAnimFrame( render );
  }
  e.preventDefault();
}

Camera.prototype.cameraStop = function(e) {
  var pos = getPointEventPos(e, canvas);
  var x = pos[0];
  var y = pos[1];
  if (e.button == 0 || e.touches) {
    this.stopMotion(x, y);
  } else if (e.button == 1) {
    this.stopScale(x, y);
  }
  e.preventDefault();
}

Camera.prototype.startMotion = function(x, y) {
  this.trackingMove = true;
  this.startX = x;
  this.startY = y;
  this.CurtX = x;
  this.curtY = y;
  trackball_ptov(x, y, this.lastPos);
}


Camera.prototype.stopMotion = function(x, y) {
  this.trackingMove = false;

  /* check if position has changed */
  if (this.startX == x && this.startY == y) {
    this.rAngle = 0.0;
  }
}

Camera.prototype.startScale = function(x, y) {
  this.scalingMove = true;
  this.curtX = x;
  this.curtY = y;
}

Camera.prototype.stopScale = function(x, y) {
  this.scalingMove = false;
}

function getPointEventPos(e, canvas)
{
  var ePos = {x:0, y:0};
  ePos.x = e.clientX || e.touches[0].clientX || e.changedTouches[0].clientX;
  ePos.y = e.clientY || e.touches[0].clientY || e.changedTouches[0].clientY;

  var client_x_r = ePos.x - canvas.offsetLeft;
  var client_y_r = ePos.y - canvas.offsetTop;
  var clip_x = -1 + 2 * client_x_r / canvas.width;
  var clip_y = -1 + 2 * (canvas.height - client_y_r) / canvas.height;
  var t = vec2(clip_x, clip_y);

  return t;
}

function resizeCanvas(theCamera, theCanvas) {
   // only change the size of the canvas if the size it's being displayed
   // has changed.
   var width = theCanvas.clientWidth;
   var height = theCanvas.clientHeight;
   if (theCanvas.width != width ||
     theCanvas.height != height) {
     // Change the size of the canvas to match the size it's being displayed
     theCanvas.width = width;
     theCanvas.height = height;
     theCamera.setAspect(theCanvas);
   }

}
