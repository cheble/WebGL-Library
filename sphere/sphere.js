function Shading() {
  /** Vector representing the light position */
  this.lightPosition = vec4(10.0, 0.0, 0.0, 1.0 );
  /** Ambient Reflection Constant */
  this.ka = 0.9;
  /** Diffuse Reflection Constant */
  this.kd = 0.9;
  /** Specular Reflection Constant */
  this.ks = 0.5;
  /**  Material Shininess Constant */
  this.shininess = 100.0;

}

function Camera(canvas) {
  var thisCamera = this;

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

  canvas.addEventListener("mousedown", function(e){
    var pos = getMousePos(e, this);
    var x = pos[0];
    var y = pos[1];

    if (e.button == 0) {
      thisCamera.startMotion(x, y);
    } else if (e.button == 1) {
      thisCamera.startScale(x, y);
    }

    // requestAnimFrame( render );
  });

  canvas.addEventListener("mousemove", function(e){
    var pos = getMousePos(e, this);
    var x = pos[0];
    var y = pos[1];

    var curPos = [];
    var dx, dy, dz;

    /* compute position on hemisphere */
    trackball_ptov(x, y, curPos);

    if(thisCamera.trackingMove)
    {
      /*
      * compute the change in position on the hemisphere
      */
      dx = curPos[0] - thisCamera.lastPos[0];
      dy = curPos[1] - thisCamera.lastPos[1];
      dz = curPos[2] - thisCamera.lastPos[2];
      if (dx || dy || dz)
      {
        /* compute theta and cross product */
        thisCamera.rAngle = 90.0 * Math.sqrt(dx*dx + dy*dy + dz*dz) / 180.0 * Math.PI;
        thisCamera.rAxis = cross(thisCamera.lastPos, curPos);

        var q = trackball_vtoq(thisCamera.rAngle, thisCamera.rAxis);

        thisCamera.curtQuat = multiplyQuat(q, thisCamera.curtQuat);

        /* update position */
        thisCamera.lastPos[0] = curPos[0];
        thisCamera.lastPos[1] = curPos[1];
        thisCamera.lastPos[2] = curPos[2];
      }
    }

    if (thisCamera.scalingMove) {
      if (thisCamera.curtX != x || thisCamera.curtY != y) {

        thisCamera.scale += (thisCamera.curtY * 1.0 - y)/2.0 * 1.3 * thisCamera.scale; // 2.0 -
        // the
        // windows
        // height
        if (thisCamera.scale <= 0.0) {
          thisCamera.scale = 0.00000001;
        }

        thisCamera.curtX = x;
        thisCamera.curtY = y;
      }
    }

    if (thisCamera.scalingMove || thisCamera.trackingMove) {
      // requestAnimFrame( render );
    }

  });

  canvas.addEventListener("mouseup", function(e) {
    var pos = getMousePos(e, this);
    var x = pos[0];
    var y = pos[1];

    if (e.button == 0) {
      thisCamera.stopMotion(x, y);
    } else if (e.button == 1) {
      thisCamera.stopScale(x, y);
    }
  });
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

function Sphere() {

  /** Sphere Center Position */
  this.center = vec3(0.0, 0.0, 0.0);
  /** Sphere Radius */
  this.radius = 1.0;
  /** Sphere 2-D Texture Source */
  this.textureSrc = null;
  /** Sphere 2-D Texture */
  this.texture = null;

}

/************ GLOBALS ************/
var canvas;
var shading;
var camera;

var theSphereVBOPoints;
var theSphereProgram;

var spheres = [];

var sphereVertices = [
  vec4( 0.0,  0.0,  0.0, 1.0 ),
  vec4( 1.0,  0.0,  0.0, 1.0 ),
  vec4( 2.0,  0.0,  0.0, 1.0 ),
  vec4( 3.0,  0.0,  0.0, 1.0 )
];

var squareVertices = [
  vec4( 0.3, 0.3, 0.0, 1.0 ),
  vec4( 0.3, 1.0, 0.0, 1.0 ),
  vec4( 1.0, 1.0, 0.0, 1.0 ),
  vec4( 1.0, 0.3, 0.0, 1.0 )
];

/************ END GLOBALS ************/


window.onload = function init() {
  canvas = document.getElementById("gl-canvas");
  shading = new Shading(canvas);
  camera = new Camera(canvas);

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert( "WebGL isn't available" );
  }

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.getExtension("EXT_frag_depth");

  // Configure WebGL
  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.clearColor(0.95, 0.95, 0.95, 1.0 );

  // init objects

  var sphere1 = new Sphere();
  sphere1.center = vec3(0.0, 0.0, 0.0);
  sphere1.radius = 1.0;
  sphere1.textureSrc = "earthmap2k.jpg";
  spheres.push(sphere1);
  var sphere2 = new Sphere();
  sphere2.center = vec3(3.0, 0.0, 0.0);
  sphere2.radius = 0.5;
  sphere2.textureSrc = "moonmap1k.jpg";
  spheres.push(sphere2);
  initTextures();

  initSphere();
  initCube();

  render();

}

function initSphere() {
  // Load shaders and initialize attribute buffers
  // theSphereProgram = initShaders(gl, "sphere-vertex-shader", "sphere-fragment-shader");
  // var myUtils = utils;
  theSphereProgram = utils.addShaderProg(gl, 'sphere_vertex.shader', 'sphere_frag.shader');
  gl.useProgram(theSphereProgram);

  // Create VBOs and load the data into the VBOs
  theSphereVBOPoints = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, theSphereVBOPoints);

  // buffer vertex data
  gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereVertices), gl.STATIC_DRAW);

}

function initTextures() {

  for (i in spheres) {
    var image = new Image();
    image.sphereIndex = i;

    image.onload = function() {
      var sphere = spheres[this.sphereIndex];
      sphere.texture = gl.createTexture();
  	  gl.bindTexture( gl.TEXTURE_2D, sphere.texture );

  		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  	  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this );
  	  gl.generateMipmap( gl.TEXTURE_2D );
  	  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
  	  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
  	};

  	image.src = spheres[i].textureSrc;
  }

}

function drawSphere(p, mv, inverseMV, sphere) {
  gl.useProgram(theSphereProgram);

  // send camera variables
  gl.uniformMatrix4fv( gl.getUniformLocation(theSphereProgram, "projectionMatrix"),false, flatten(p));
  gl.uniformMatrix4fv( gl.getUniformLocation(theSphereProgram, "modelViewMatrix"),false, flatten(mv));
  gl.uniformMatrix4fv( gl.getUniformLocation(theSphereProgram, "invMV"),false, flatten(inverseMV));

  // send shading variables
  gl.uniform1f( gl.getUniformLocation(theSphereProgram, "ka"), shading.ka);
  gl.uniform1f( gl.getUniformLocation(theSphereProgram, "kd"), shading.kd);
  gl.uniform1f( gl.getUniformLocation(theSphereProgram, "ks"), shading.ks);
  gl.uniform4fv( gl.getUniformLocation(theSphereProgram, "lightPosition"),flatten(shading.lightPosition) );
  gl.uniform1f( gl.getUniformLocation(theSphereProgram, "shininess"), shading.shininess );

  // send object variables
  gl.uniform3fv( gl.getUniformLocation(theSphereProgram, "center"), flatten(sphere.center));
  gl.uniform1f( gl.getUniformLocation(theSphereProgram, "radius"), sphere.radius);
  // Associate out shader variables with our data buffer
  var vPosition = gl.getAttribLocation(theSphereProgram, "vPosition");
  gl.bindBuffer(gl.ARRAY_BUFFER, theSphereVBOPoints);
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);
  // Set texture
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, sphere.texture);
	gl.uniform1i(gl.getUniformLocation(theSphereProgram, "texture"), 0);

  // draw
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function inverseMatrix(mat) {
	dest = mat4();

	var a11 = mat[0][0], a12 = mat[0][1], a13 = mat[0][2], a14 = mat[0][3];
	var a21 = mat[1][0], a22 = mat[1][1], a23 = mat[1][2], a24 = mat[1][3];
	var a31 = mat[2][0], a32 = mat[2][1], a33 = mat[2][2], a34 = mat[2][3];
	var a41 = mat[3][0], a42 = mat[3][1], a43 = mat[3][2], a44 = mat[3][3];

	var d = a11*a22*a33*a44 + a11*a23*a34*a42 + a11*a24*a32*a43;
	d    += a12*a21*a34*a43 + a12*a23*a31*a44 + a12*a24*a33*a41;
	d    += a13*a21*a32*a44 + a13*a22*a34*a41 + a13*a24*a31*a42;
	d    += a14*a21*a33*a42 + a14*a22*a31*a43 + a14*a23*a32*a41;
	d    -= a11*a22*a34*a43 + a11*a23*a32*a44 + a11*a24*a33*a42;
	d    -= a12*a21*a33*a44 + a12*a23*a34*a41 + a12*a24*a31*a43;
	d    -= a13*a21*a34*a42 + a13*a22*a31*a44 + a13*a24*a32*a41;
	d    -= a14*a21*a32*a43 + a14*a22*a33*a41 + a14*a23*a31*a42;

	if (d == 0.0) { console.log("no inverse"); return dest; }
	var id = 1/d;


	dest[0][0] = id*(a22*a33*a44 + a23*a34*a42 + a24*a32*a43 - a22*a34*a43 - a23*a32*a44 - a24*a33*a42);
	dest[0][1] = id*(a12*a34*a43 + a13*a32*a44 + a14*a33*a42 - a12*a33*a44 - a13*a34*a42 - a14*a32*a43);
	dest[0][2] = id*(a12*a23*a44 + a13*a24*a42 + a14*a22*a43 - a12*a24*a43 - a13*a22*a44 - a14*a23*a42);
	dest[0][3] = id*(a12*a24*a33 + a13*a22*a34 + a14*a23*a32 - a12*a23*a34 - a13*a24*a32 - a14*a22*a33);

	dest[1][0] = id*(a21*a34*a43 + a23*a31*a44 + a24*a33*a41 - a21*a33*a44 - a23*a34*a41 - a24*a31*a43);
	dest[1][1] = id*(a11*a33*a44 + a13*a34*a41 + a14*a31*a43 - a11*a34*a43 - a13*a31*a44 - a14*a33*a41);
	dest[1][2] = id*(a11*a24*a43 + a13*a21*a44 + a14*a23*a41 - a11*a23*a44 - a13*a24*a41 - a14*a21*a43);
	dest[1][3] = id*(a11*a23*a34 + a13*a24*a31 + a14*a21*a33 - a11*a24*a33 - a13*a21*a34 - a14*a23*a31);

	dest[2][0] = id*(a21*a32*a44 + a22*a34*a41 + a24*a31*a42 - a21*a34*a42 - a22*a31*a44 - a24*a32*a41);
	dest[2][1] = id*(a11*a34*a42 + a12*a31*a44 + a14*a32*a41 - a11*a32*a44 - a12*a34*a41 - a14*a31*a42);
	dest[2][2] = id*(a11*a22*a44 + a12*a24*a41 + a14*a21*a42 - a11*a24*a42 - a12*a21*a44 - a14*a22*a41);
	dest[2][3] = id*(a11*a24*a32 + a12*a21*a34 + a14*a22*a31 - a11*a22*a34 - a12*a24*a31 - a14*a21*a32);

	dest[3][0] = id*(a21*a33*a42 + a22*a31*a43 + a23*a32*a41 - a21*a32*a43 - a22*a33*a41 - a23*a31*a42);
	dest[3][1] = id*(a11*a32*a43 + a12*a33*a41 + a13*a31*a42 - a11*a33*a42 - a12*a31*a43 - a13*a32*a41);
	dest[3][2] = id*(a11*a23*a42 + a12*a21*a43 + a13*a22*a41 - a11*a22*a43 - a12*a23*a41 - a13*a21*a42);
	dest[3][3] = id*(a11*a22*a33 + a12*a23*a31 + a13*a21*a32 - a11*a23*a32 - a12*a21*a33 - a13*a22*a31);

	return dest;
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

function render() {
  gl.clear( gl.COLOR_BUFFER_BIT );

  // modelview matrix
  var t = translate(0.0, 0.0, -5.0);
  var s = scale(camera.scale, camera.scale, camera.scale);
  var r = buildRotationMatrix(camera.curtQuat);
  var mv = mat4();
  mv = mult(t, mv);
  mv = mult(mv, s);
  mv = mult(mv, r);

  var inverseMV = mat4();
  inverseMV = inverseMatrix(mv);

  for (i in spheres) {
    var sphere = spheres[i];
    drawSphere(camera.projM, mv, inverseMV, sphere);
  }

  drawCube(camera.projM, mv);

  requestAnimFrame( render );
}


// cube stuff


var theCubeVBOPoints;
var theCubeProgram;
var theWireCubePoints = [];

var theCubeVertices = [
  vec4( -1.0, -1.0,  1.0, 1.0 ),
  vec4( -1.0,  1.0,  1.0, 1.0 ),
  vec4(  1.0,  1.0,  1.0, 1.0 ),
  vec4(  1.0, -1.0,  1.0, 1.0 ),
  vec4( -1.0, -1.0, -1.0, 1.0 ),
  vec4( -1.0,  1.0, -1.0, 1.0 ),
  vec4(  1.0,  1.0, -1.0, 1.0 ),
  vec4(  1.0, -1.0, -1.0, 1.0 )
];

function wireQuad(a, b, c, d)
{
  theWireCubePoints.push(theCubeVertices[a]);
  theWireCubePoints.push(theCubeVertices[b]);
  theWireCubePoints.push(theCubeVertices[c]);
  theWireCubePoints.push(theCubeVertices[d]);
}

function wireCube()
{
  wireQuad( 1, 0, 3, 2 );
  wireQuad( 2, 3, 7, 6 );
  wireQuad( 3, 0, 4, 7 );
  wireQuad( 6, 5, 1, 2 );
  wireQuad( 4, 5, 6, 7 );
  wireQuad( 5, 4, 0, 1 );
}

function initCube()
{
  // initialize the cube
  wireCube();

  // Load shaders and initialize attribute buffers
  theCubeProgram = initShaders(gl, "cube-vertex-shader", "cube-fragment-shader");
  gl.useProgram(theCubeProgram);

  // Create VBOs and load the data into the VBOs
  theCubeVBOPoints = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, theCubeVBOPoints);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(theWireCubePoints), gl.STATIC_DRAW);
}

function drawCube(p, mv)
{
  gl.useProgram(theCubeProgram);

  gl.uniformMatrix4fv( gl.getUniformLocation(theCubeProgram, "projectionMatrix"),
  false, flatten(p));

  gl.uniformMatrix4fv( gl.getUniformLocation(theCubeProgram, "modelViewMatrix"),
  false, flatten(mv));

  // Associate out shader variables with our data buffer
  var vPosition = gl.getAttribLocation(theCubeProgram, "vPosition");
  gl.bindBuffer(gl.ARRAY_BUFFER, theCubeVBOPoints);
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

// TESTING: just draw z side
  for (var i = 3/*0*/; i < 4/*6*/; i++) {
    gl.drawArrays(gl.LINE_LOOP, i * 4, 4);
  }
}
