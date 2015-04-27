function Model() {

  /** Cube Center Position */
  this.center = vec3(0.0, 0.0, 0.0);
  /** Cube Up Vector */
  this.up = vec3(0.0, 1.0, 0.0);
  /** Cube Front Vector */
  this.front = vec3(0.0, 0.0, 1.0);
  /** Scale */
  this.scale = 1.0;
  /** Data */
  this.data = null;
  /** Cube 2-D Texture Source */
  this.textureSrc = null;
  /** Cube 2-D Texture */
  this.texture = null;

}

/************ GLOBALS ************/
var canvas;
var shading;
var camera;

var modelVBOPoints;
var modelVBONormals;
var modelVertexIndexBuffer;
var the3dModelProgram;

var models = [];

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
  shading.lightPosition = vec4(0.0, 200.0, 0.0, 1.0);
  shading.ka = 0.5;
  camera = new Camera(canvas);

  resizeCanvas(camera, canvas);

  // Configure WebGL
  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.clearColor(0.95, 0.95, 0.05, 1.0 );

  // init objects
  // initTextures();
  initModels();

  // test objects
  var model1 = new Model();
  model1.center = vec3(0.0, 0.25, 0.0);
  model1.scale = 0.3;
  model1.data = data;
  models.push(model1);
  var model2 = new Model();
  model2.center = vec3(2.0, 0.5, 0.0);
  model2.scale = 1.0;
  model2.data = data;
  models.push(model2);

  render();

}

function initModels() {

  // Load shaders and initialize attribute buffers
  the3dModelProgram = initShaders(gl, "3d-model-vertex-shader", "3d-model-fragment-shader");
  gl.useProgram(the3dModelProgram);


  // TODO: this should be done for each model in models[]
  // TODO: VBOPoints, VBONormals, and VertexIndexBuffer should be properties of Model

  // Calculate normals if they are not given
  if (!("normals" in data)) {
    util.calcNormals(data);
  }

  // Create VBOs and load the data into the VBOs

  // buffer vertex data
  modelVBOPoints = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, modelVBOPoints);
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(horse_data["vertices"]), gl.STATIC_DRAW);
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bool_data["vertices"]), gl.STATIC_DRAW);
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(woman_data["vertices"]), gl.STATIC_DRAW);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data["vertices"]), gl.STATIC_DRAW);
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lion_data["vertices"]), gl.STATIC_DRAW);

  modelVBONormals = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, modelVBONormals);
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(horse_data["normals"]), gl.STATIC_DRAW);
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bool_data["normals"]), gl.STATIC_DRAW);
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(woman_data["normals"]), gl.STATIC_DRAW);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data["normals"]), gl.STATIC_DRAW);
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lion_data["normals"]), gl.STATIC_DRAW);

  modelVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelVertexIndexBuffer);
  // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(horse_data["polygons"]), gl.STATIC_DRAW);
  // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(bool_data["polygons"]), gl.STATIC_DRAW);
  // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(woman_data["polygons"]), gl.STATIC_DRAW);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data["polygons"]), gl.STATIC_DRAW);
  // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(lion_data["polygons"]), gl.STATIC_DRAW);
}

function drawModel(p, mv, inverseMV, model) {
  // TODO: use model object variables: model.vboPoints, model.vboNormals, ...
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

  // send object variables
  // gl.uniform3fv( gl.getUniformLocation(theCubeProgram, "center"), flatten(model.center));
  // gl.uniform3fv( gl.getUniformLocation(theCubeProgram, "up"), flatten(model.up));
  // gl.uniform3fv( gl.getUniformLocation(theCubeProgram, "front"), flatten(model.front));
  // gl.uniform1f( gl.getUniformLocation(theCubeProgram, "scale"), model.scale);
  // Associate out shader variables with our data buffer
  var vPosition = gl.getAttribLocation(the3dModelProgram, "vPosition");
  gl.bindBuffer(gl.ARRAY_BUFFER, modelVBOPoints);
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);
  var vNormal = gl.getAttribLocation(the3dModelProgram, "vNormal");
  gl.bindBuffer(gl.ARRAY_BUFFER, modelVBONormals);
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);

  //draw
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelVertexIndexBuffer);
  // gl.drawElements(gl.TRIANGLES, 7024*3, gl.UNSIGNED_SHORT, 0); //woman
  gl.drawElements(gl.TRIANGLES, 60000, gl.UNSIGNED_SHORT, 0); // centaur
}

function render() {
  gl.clear( gl.COLOR_BUFFER_BIT );

  // modelview matrix
  var t = translate(0.0, 0.0, -300.0);
  var s = scale(camera.scale, camera.scale, camera.scale);
  var r = buildRotationMatrix(camera.curtQuat);
  var mv = mat4();
  mv = mult(t, mv);
  mv = mult(mv, s);
  mv = mult(mv, r);

  var inverseMV = mat4();
  inverseMV = inverseMatrix(mv);

  for (i in models) {
    var model = models[i];
    drawModel(camera.projM, mv, inverseMV, model);
  }

  requestAnimFrame( render );
}
