function Cube() {

  /** Cube Center Position */
  this.center = vec3(0.0, 0.0, 0.0);
  /** Cube Up Vector */
  this.up = vec3(0.0, 1.0, 0.0);
  /** Cube Front Vector */
  this.front = vec3(0.0, 0.0, 1.0);
  /** Side Length */
  this.length = 1.0;
  /** Cube 2-D Texture Source */
  this.textureSrc = null;
  /** Cube 2-D Texture */
  this.texture = null;

}

/************ GLOBALS ************/
var canvas;
var shading;
var camera;

var theCubeVBOPoints;
var theCubeVBOIndexBuffer;
var theCubeProgram;

var cubes = [];

/*
   2 ---- 3
   |\     |\
   | 6 ---- 7
   0 |--- 1 |
    \|     \|
     4 ---- 5
*/

var baseCubeVertices = [
  vec3(-1.0, -1.0, -1.0),
  vec3( 1.0, -1.0, -1.0),
  vec3(-1.0,  1.0, -1.0),
  vec3( 1.0,  1.0, -1.0),
  vec3(-1.0, -1.0,  1.0),
  vec3( 1.0, -1.0,  1.0),
  vec3(-1.0,  1.0,  1.0),
  vec3( 1.0,  1.0,  1.0)
];

var baseCubeFaces = [
  1, 2, 3,
  1, 0, 2,
  0, 6, 2,
  0, 4, 6,
  4, 7, 6,
  4, 5, 7,
  5, 3, 7,
  5, 1, 3,
  6, 3, 2,
  6, 7, 3,
  0, 5, 4,
  0, 1, 5
];

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
  shading.lightPosition = vec4(1.0, 0.5, 1.0, 1.0 );
  shading.ka = 0.2;
  camera = new Camera(canvas);

  resizeCanvas(camera, canvas);

  // Configure WebGL
  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.clearColor(0.05, 0.05, 0.05, 1.0 );

  // init objects
  // initTextures();
  initBaseCube();

  // test objects
  var cube1 = new Cube();
  cube1.center = vec3(0.0, 0.25, 0.0);
  cube1.length = 0.5;
  cubes.push(cube1);
  var cube2 = new Cube();
  cube2.center = vec3(2.0, 0.5, 0.0);
  cube2.length = 1.0;
  cubes.push(cube2);
  var cube3 = new Cube();
  cube3.center = vec3(shading.lightPosition);
  cube3.length = 0.05;
  cubes.push(cube3);
  var cube4 = new Cube();
  cube4.center = vec3(0.0, -5.0, 0.0);
  cube4.length = 10.0;
  cubes.push(cube4);

  render();

}

function initBaseCube() {
  // Load shaders and initialize attribute buffers
  theCubeProgram = initShaders(gl, "cube-vertex-shader", "cube-fragment-shader");
  gl.useProgram(theCubeProgram);

  // Create VBOs and load the data into the VBOs
  theCubeVBOPoints = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, theCubeVBOPoints);

  // buffer vertex data
  gl.bufferData(gl.ARRAY_BUFFER, flatten(baseCubeVertices), gl.STATIC_DRAW);

  theCubeVBOIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, theCubeVBOIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(baseCubeFaces), gl.STATIC_DRAW);

}

// function initTextures() {
//
//   for (i in cubes) {
//     var image = new Image();
//     image.cubeIndex = i;
//
//     image.onload = function() {
//       var cube = cubes[this.cubeIndex];
//       cube.texture = gl.createTexture();
//   	  gl.bindTexture( gl.TEXTURE_2D, cube.texture );
//
//   		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
//   	  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this );
//   	  gl.generateMipmap( gl.TEXTURE_2D );
//   	  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
//   	  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
//   	};
//
//   	image.src = cubes[i].textureSrc;
//   }
//
// }

function drawCube(p, mv, inverseMV, cube) {
  gl.useProgram(theCubeProgram);

  // send camera variables
  gl.uniformMatrix4fv( gl.getUniformLocation(theCubeProgram, "projectionMatrix"),false, flatten(p));
  gl.uniformMatrix4fv( gl.getUniformLocation(theCubeProgram, "modelViewMatrix"),false, flatten(mv));
  gl.uniformMatrix4fv( gl.getUniformLocation(theCubeProgram, "invMV"),false, flatten(inverseMV));

  // send shading variables
  gl.uniform1f( gl.getUniformLocation(theCubeProgram, "ka"), shading.ka);
  gl.uniform1f( gl.getUniformLocation(theCubeProgram, "kd"), shading.kd);
  gl.uniform1f( gl.getUniformLocation(theCubeProgram, "ks"), shading.ks);
  gl.uniform4fv( gl.getUniformLocation(theCubeProgram, "lightPosition"),flatten(shading.lightPosition) );
  gl.uniform1f( gl.getUniformLocation(theCubeProgram, "shininess"), shading.shininess );

  // send object variables
  gl.uniform3fv( gl.getUniformLocation(theCubeProgram, "center"), flatten(cube.center));
  gl.uniform3fv( gl.getUniformLocation(theCubeProgram, "up"), flatten(cube.up));
  gl.uniform3fv( gl.getUniformLocation(theCubeProgram, "front"), flatten(cube.front));
  gl.uniform1f( gl.getUniformLocation(theCubeProgram, "length"), cube.length);
  // Associate out shader variables with our data buffer
  var vPosition = gl.getAttribLocation(theCubeProgram, "vPosition");
  gl.bindBuffer(gl.ARRAY_BUFFER, theCubeVBOPoints);
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);
  // Set texture
	// gl.activeTexture(gl.TEXTURE0);
	// gl.bindTexture(gl.TEXTURE_2D, cube.texture);
	// gl.uniform1i(gl.getUniformLocation(theCubeProgram, "texture"), 0);

  // draw
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, theCubeVBOIndexBuffer);
  gl.drawElements(gl.TRIANGLES, baseCubeFaces.length, gl.UNSIGNED_SHORT, 0);
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

  for (i in cubes) {
    var cube = cubes[i];
    drawCube(camera.projM, mv, inverseMV, cube);
  }

  requestAnimFrame( render );
}
