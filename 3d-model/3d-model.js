
/************ GLOBALS ************/
var canvas;
var shading;
var camera;

var modelVBOPoints;
var modelVertexIndexBuffer;
var the3dModelProgram;

/************ END GLOBALS ************/


window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert( "WebGL isn't available" );
  }
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.getExtension("EXT_frag_depth");

  shading = new Shading(canvas);
  camera = new Camera(canvas);

  resizeCanvas(camera, canvas);

  // Configure WebGL
  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.clearColor(0.95, 0.95, 0.95, 1.0 );

  // init objects
  initModel();

  render();

}

function initModel() {
  // Load shaders and initialize attribute buffers
  the3dModelProgram = initShaders(gl, "3d-model-vertex-shader", "3d-model-fragment-shader");
  gl.useProgram(the3dModelProgram);

  // Create VBOs and load the data into the VBOs

  // buffer vertex data
  modelVBOPoints = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, modelVBOPoints);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(horse_data["vertices"]), gl.STATIC_DRAW);


  modelVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelVertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(horse_data["faces"]), gl.STATIC_DRAW);
  console.log(horse_data["faces"].length);

}

function drawModel(p, mv, inverseMV) {
  gl.useProgram(the3dModelProgram);

  // send camera variables
  gl.uniformMatrix4fv( gl.getUniformLocation(the3dModelProgram, "projectionMatrix"),false, flatten(p));
  gl.uniformMatrix4fv( gl.getUniformLocation(the3dModelProgram, "modelViewMatrix"),false, flatten(mv));
  gl.uniformMatrix4fv( gl.getUniformLocation(the3dModelProgram, "invMV"),false, flatten(inverseMV));

  // send shading variables
  gl.uniform1f( gl.getUniformLocation(the3dModelProgram, "ka"), shading.ka);
  gl.uniform1f( gl.getUniformLocation(the3dModelProgram, "kd"), shading.kd);
  gl.uniform1f( gl.getUniformLocation(the3dModelProgram, "ks"), shading.ks);
  gl.uniform4fv( gl.getUniformLocation(the3dModelProgram, "lightPosition"),flatten(shading.lightPosition) );
  gl.uniform1f( gl.getUniformLocation(the3dModelProgram, "shininess"), shading.shininess );

  // Associate out shader variables with our data buffer
  var vPosition = gl.getAttribLocation(the3dModelProgram, "vPosition");
  gl.bindBuffer(gl.ARRAY_BUFFER, modelVBOPoints);
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  //draw
  // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelVertexIndexBuffer);
  // gl.drawElements(gl.TRIANGLES, 39592/3, gl.UNSIGNED_SHORT, 39592/2);

  gl.drawArrays(gl.POINTS, 0, 100);
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

function render() {
  gl.clear( gl.COLOR_BUFFER_BIT );

  // modelview matrix
  var t = translate(0.0, 0.0, -10.0);
  var s = scale(camera.scale, camera.scale, camera.scale);
  var r = buildRotationMatrix(camera.curtQuat);
  var mv = mat4();
  mv = mult(t, mv);
  mv = mult(mv, s);
  mv = mult(mv, r);

  var inverseMV = mat4();
  inverseMV = inverseMatrix(mv);

  drawModel(camera.projM, mv, inverseMV);

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