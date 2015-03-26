
var canvas;
var gl;


var TWO_PI = 6.2831853071795864769252866;

var N = 9;
var D = 0.5;
var H = 3.5;

var arrayDim = Math.pow(2,N)+1;
var numIndicies = (arrayDim-1)*(arrayDim-1)*6;

var fractArray;

var vertices = [];
var indices = [];
var vertexColors = [];
var vertexNormals = [];

var zoomDelta = 0.0;
var vertDelta = 0.0;
var horizDelta = 0.0;
var modelViewMatrix = mat4();


var lightPosition = vec4(0.0, 0.0, 2.0, 0.0 );	// x, y, z, p
var lightAmbient = vec4(0.4, 0.4, 0.4, 1.0 );
var lightDiffuse = vec4( 0.6, 0.6, 0.6, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialSpecular = vec4( 0.5, 0.5, 0.5, 1.0 );
var materialShininess = 100.0;

var lastX = null;
var lastY = null;

var deltaX = 0.0;
var deltaY = 0.0;

var thetaX = 0.0;
var thetaY = 0.0;

var rquat = vec4(1.0, 0.0, 0.0, 0.0);

var rquatLoc;
var modelViewMatrixLoc;

var mouseDown = false;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);
    gl.getExtension("OES_element_index_uint");		//allows for Uint32Array instead of Uint16Array..

    createFractal();
    
	for(var i=0; i<arrayDim; i++){
		for(var j=0; j<arrayDim; j++){
			var x = j/(arrayDim-1) - 0.5;
			var y = i/(arrayDim-1) - 0.5;
			var z = fractArray[i][j];
			var vertex = vec4(x, y, z, 1.0);
			vertices.push(vertex);
		}
	}
	var c = 0;
	// calculate normals
	for(var i=0; i<arrayDim; i++){
		for(var j=0; j<arrayDim; j++){
			var normal = vec4(0, 0, 1.0, 1.0);
			if(i == 0){
			} else if(i == arrayDim-1){
			} else if(j == 0){
			} else if(j == arrayDim-1){
			} else {
				var center = vertices[i*arrayDim + j];
				var up = vertices[(i-1)*arrayDim + j];
				var right = vertices[i*arrayDim + (j+1)];
				var down = vertices[(i+1)*arrayDim + j];
				var left = vertices[i*arrayDim + (j-1)];
				
				var sum = vec3();
				sum = add(sum, getNormal(center, right, up));
				sum = add(sum, getNormal(center, up, left));
				sum = add(sum, getNormal(center, left, down));
				sum = add(sum, getNormal(center, down, right));
				
				normal = vec4(sum);
				c = c+1;
				//console.log(normal);
			}
			vertexNormals.push(normalize(normal));
		}
	}
	console.log(c);
	console.log(arrayDim*arrayDim);
	
	var count = 0;
	for(var i=0; i<arrayDim-1; i++){
		for(var j=0; j<arrayDim-1; j++){
			indices.push(i+j*arrayDim);
			indices.push((i+1)+j*arrayDim);
			indices.push(i+(j+1)*arrayDim);

			indices.push(i+(j+1)*arrayDim);
			indices.push((i+1)+j*arrayDim);
			indices.push((i+1)+(j+1)*arrayDim);
		}
	}


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
    
    // array element buffer
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);

    // vertex array attribute buffer
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexNormals), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    rquatLoc = gl.getUniformLocation(program, "rquat");
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    
    //event listeners for mouse
    canvas.onmousedown = function (e) {
    	lastX = e.clientX;
    	lastY = e.clientY;
    	mouseDown = true;
    };
    document.onmouseup = function () {
        mouseDown = false;
    };
    document.onmousemove = function (e) {
    	if(mouseDown){
            var posX = e.clientX;
            var posY = e.clientY;
        	deltaX = posX - lastX;
        	deltaY = posY - lastY;
        	lastX = posX;
        	lastY = posY;
    	}
    }
    document.onkeydown = function (e){
    	switch (e.keyCode) {
    	case 87:		// w
    		vertDelta = + .005;
    		break;
    	case 65:		// a
    		horizDelta = - .005;
    		break;
    	case 83:		// s
    		vertDelta = - .005;
    		break;
    	case 68:		// d
    		horizDelta = + .005;
    		break;
    	case 16:		// shift
    		zoomDelta = + .005;
    		break;
    	case 32:		// space
    		zoomDelta = - .005;
    		break;
    	}
    }
    document.onkeyup = function (e){
    	switch (e.keyCode) {
    	case 87:		// w
    		vertDelta = 0.0;
    		break;
    	case 65:		// a
    		horizDelta = 0.0;
    		break;
    	case 83:		// s
    		vertDelta = 0.0;
    		break;
    	case 68:		// d
    		horizDelta = 0.0;
    		break;
    	case 16:		// shift
    		zoomDelta = 0.0;
    		break;
    	case 32:		// space
    		zoomDelta = 0.0;
    		break;
    	}
    }
    
    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct) );
	gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct) );
	gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"),flatten(specularProduct) );	
	gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition) );
	gl.uniform1f( gl.getUniformLocation(program, "shininess"),materialShininess );
        
    render();
}

function createFractal()
{
	fractArray = new Array(arrayDim)
	for(var i=0; i<arrayDim; i++){
		fractArray[i] = new Float32Array(arrayDim);
	}
	fractArray[0][0] = 0.0;
	fractArray[0][arrayDim-1] = 0.0;
	fractArray[arrayDim-1][arrayDim-1] = 0.0;
	fractArray[arrayDim-1][0] = 0.0;
	fractalR([0,arrayDim-1], [arrayDim-1,arrayDim-1], [arrayDim-1,0], [0,0], 1);
}

function fractalR(a, b, c, d, i) 
{
	var ab = fractalLine(a, b, i);
	var bc = fractalLine(b, c, i);
	var cd = fractalLine(c, d, i);
	var da = fractalLine(d, a, i);
	var mid = fractalMid(ab, bc, cd, da, i);
    if(i < N){
    	fractalR(a, ab, mid, da, i+1);// top left
    	fractalR(ab, b, bc, mid, i+1);// top right
    	fractalR(mid, bc, c, cd, i+1);// bottom right
    	fractalR(da, mid, cd, d, i+1);// bottom left
    }
}

function fractalLine(a, b, i){
	var x = (a[0] + b[0])/2.0;
	var y = (a[1] + b[1])/2.0;
	if(fractArray[x][y] == 0.0){
		var avg = (fractArray[a[0]][a[1]] + fractArray[b[0]][b[1]])/2.0;
		var d_i = Math.pow(0.5, i*H/2.0) * D;
		var r = generateGaussianNoise(d_i);
		fractArray[x][y] = avg + r;
	}
	
	return [x, y];
}

function fractalMid(a, b, c, d, i){
	var x = (a[0] + c[0])/2.0;
	var y = (a[1] + c[1])/2.0;
	
	var avg = (fractArray[a[0]][a[1]] + fractArray[b[0]][b[1]] + fractArray[c[0]][c[1]] + fractArray[d[0]][d[1]])/4;
	var d_i = Math.pow(0.5, i*H/2.0) * D;
	var r = generateGaussianNoise(d_i);
	fractArray[x][y] = avg + r;
	
	return [x, y];
}

function generateGaussianNoise(variance)
{
	var rand1;
	var rand2;
 
	rand1 = Math.random()
	if(rand1 < 1e-100){ rand1 = 1e-100; }
	rand1 = -2 * Math.log(rand1);
	rand2 = Math.random() * TWO_PI;
 
	var result = Math.sqrt(variance * rand1) * Math.cos(rand2);
	return result;
}

function getNormal(a, b, c){
	var normal = cross(subtract(c, a), subtract(b, a));
	return normal;
}

function render()
{
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	if(mouseDown){
		thetaX = deltaX*0.005;	// 
		thetaY = deltaY*0.005;	// 
		
		var c1 = Math.cos(thetaX);		//heading
	    var s1 = Math.sin(thetaX);		//heading
	    var c2 = Math.cos(0.0);			//altitude
	    var s2 = Math.sin(0.0);			//altitude
	    var c3 = Math.cos(thetaY);		//bank
	    var s3 = Math.sin(thetaY);		//bank
	    var c1c2 = c1*c2;
	    var s1s2 = s1*s2;
	    var w =c1c2*c3 - s1s2*s3;
	  	var x =c1c2*s3 + s1s2*c3;
		var y =s1*c2*c3 + c1*s2*s3;
		var z =c1*s2*c3 - s1*c2*s3;
		var quat = vec4(w, x, y, z);
		
	    rquat = multq(rquat, quat);
	    deltaX = 0.0;
	    deltaY = 0.0;
	}
	
	// zoom
	modelViewMatrix[0][0] += zoomDelta;	//x
	modelViewMatrix[1][1] += zoomDelta;	//y
	modelViewMatrix[2][2] += zoomDelta;	//z
    // translate
	modelViewMatrix[0][3] -= horizDelta;	//x
	modelViewMatrix[1][3] -= vertDelta;	//y
	modelViewMatrix[2][3] = 0.0;	//z
	
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	gl.uniform4fv(rquatLoc, rquat);
	
    gl.drawElements( gl.TRIANGLES, numIndicies, gl.UNSIGNED_INT, 0 );		//change to UNSIGNED_SHORT if Uint16Array.. indicies

    requestAnimFrame( render );
}
