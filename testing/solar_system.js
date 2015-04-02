var gl;
var canvas;

// Shading
var lightPosition = vec4(0.0, 0.0, 5.0, 1.0 );
var ka = 0.6;//0.3;
var kd = 0.7;
var ks = 0.5;
var shininess = 100.0;

// Texture
var texture;



// ============================================================================
// Sphere related data structures and functions
// ============================================================================
var theSphereVBOPoints;
var theSphereProgram;
var theSpherePoints = [];

var theQuadVertices = [
	vec4(  0.0,  -0.5,  0.0,  1.0 ),
	vec4(  1.0,  -0.5,  0.0,  1.0 ),
	vec4(  2.0,   0.5,  0.0,  1.0 ),
	vec4(  3.0,   0.5,  0.0,  1.0 )
];

function sphereQuad(a, b, c, d)
{

	theSpherePoints.push(theQuadVertices[a]);
	theSpherePoints.push(theQuadVertices[b]);
	theSpherePoints.push(theQuadVertices[c]);
	theSpherePoints.push(theQuadVertices[d]);
}

function initSphere()
{
	// initialize the square
	sphereQuad(0, 1, 2, 3);

	// Load shaders and initialize attribute buffers
	theSphereProgram = initShaders(gl, "sphere-vertex-shader", "sphere-fragment-shader");
	gl.useProgram(theSphereProgram);

	// Create VBOs and load the data into the VBOs
	theSphereVBOPoints = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, theSphereVBOPoints);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(theSpherePoints), gl.STATIC_DRAW);
}

function drawSphere(theProgram, p, mv, invMV, center, radius)
{

	gl.uniformMatrix4fv( gl.getUniformLocation(theProgram, "projectionMatrix"),false, p.getAsFloat32Array() );

	gl.uniformMatrix4fv( gl.getUniformLocation(theProgram, "modelViewMatrix"),false, mv.getAsFloat32Array() );

	gl.uniformMatrix4fv( gl.getUniformLocation(theProgram, "invMV"),false, invMV.getAsFloat32Array() );

	gl.uniform1f( gl.getUniformLocation(theProgram, "ka"), ka);

	gl.uniform1f( gl.getUniformLocation(theProgram, "kd"), kd);

	gl.uniform1f( gl.getUniformLocation(theProgram, "ks"), ks);

	gl.uniform4fv( gl.getUniformLocation(theProgram, "lightPosition"),flatten(lightPosition) );

	gl.uniform1f( gl.getUniformLocation(theProgram, "shininess"), shininess );

	gl.uniform3fv( gl.getUniformLocation(theProgram, "center"), center.getAsArray() );

	gl.uniform1f( gl.getUniformLocation(theProgram, "radius"), radius );

	// Associate out shader variables with our data buffer
	var vPosition = gl.getAttribLocation(theProgram, "vPosition");
	gl.bindBuffer(gl.ARRAY_BUFFER, theSphereVBOPoints);
	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	// gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	gl.drawArrays(gl.POINTS, 0, 4);
}

// ============================================================================
// WebGL Initialization
// ============================================================================
var camera;

window.onload = function init()
{
	canvas = document.getElementById("gl-canvas");

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
	gl.clearColor(0.0, 0.0, 0.0, 1.0 );

	// init
	var controller = new CameraController();
	controller.init(canvas);

	camera = new Camera(controller);
	camera.init(canvas);

	console.log(camera);

	initTexture();
	initSphere();

	render();

};

// TODO use J3DIMath instead
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
};

function initTexture() {
	var image = new Image();
	image.onload = function() {
		texture = gl.createTexture();
	  gl.bindTexture( gl.TEXTURE_2D, texture );

		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
	  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image );
	  gl.generateMipmap( gl.TEXTURE_2D );
	  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
	  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
	}
	image.src = PLANETS_PATH + "earthmap2k.jpg";


}

// ============================================================================
// Rendering function
// ============================================================================
function render()
{
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

	var modelViewM = camera.getModelViewMatrix();
	var projM = camera.projM;
	var invModelViewM = new J3DIMatrix4(modelViewM);
	invModelViewM.invert();


	// projection matrix
	// var  p = perspective(Camera.DEFAULT_FOVY, Camera.DEFAULT_ASPECT, Camera.DEFAULT_ZNEAR, Camera.DEFAULT_ZFAR);

	// modelview matrix
	// var mv = lookAt(eye, at, up);


	// var invMV = inverseMatrix(mv);

	// modelViewM = new J3DIMatrix4(flatten(mv));
	// projM = new J3DIMatrix4(flatten(p));
	// invModelViewM = new J3DIMatrix4(flatten(invMV));

	gl.useProgram(theSphereProgram);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(gl.getUniformLocation(theSphereProgram, "texture"), 0);

	var center = new J3DIVector3(0.0, 0.0, 5.0);
	var radius = 1;
	drawSphere(theSphereProgram, projM, modelViewM, invModelViewM, center, radius);

	requestAnimFrame( render );
}
