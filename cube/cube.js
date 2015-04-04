function Cube() {

  /** Cube Center Position */
  this.center = vec3(0.0, 0.0, 0.0);
  /** Cube Up Vector */
  this.up = vec3(0.0, 0.0, 0.0);
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
var theCubeProgram;

var cubes = [];

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

  initBaseSphere();
  initCube();

  render();

}

function initBaseSphere() {
  // Load shaders and initialize attribute buffers
  theSphereProgram = initShaders(gl, "sphere-vertex-shader", "sphere-fragment-shader");
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
