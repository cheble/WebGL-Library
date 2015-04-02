attribute vec4 vPosition;

varying vec3 fPosition;
varying vec3 fCenter;
varying float fRadius;
uniform float radius;
varying vec3 L;
varying vec3 E;

uniform vec4 lightPosition;

precision mediump float;
uniform vec3 center;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void
main()
{
  vec3 pPrime = (modelViewMatrix * vec4(center, 1.0)).xyz;    // point of center after mv transformation

  vec3 v = vec3(0.0, 0.0, 0.0) - pPrime;                       // vector from center to eye

  vec3 vPrime;
  if (v == vec3(0.0, 0.0, 0.0) || v.z == 0.0) {
    vPrime = vec3(0.0, 0.0, 1.0);
  } else {
    vPrime = vec3(1, 1, -1.0 * (v.x + v.y) / v.z);      // vector orthagonal to v
  }

  if(vPosition.x == 1.0){

    vPrime = cross(v, vPrime);              // orthagonal to v and coplanar to previous vPrime

  } else if (vPosition.x == 2.0){

    vPrime = cross(v, vPrime);
    vPrime = cross(v, vPrime);              // orthagonal to v and coplanar to previous vPrimes

  } else if (vPosition.x == 3.0){

    vPrime = cross(v, vPrime);
    vPrime = cross(v, vPrime);
    vPrime = cross(v, vPrime);              // orthagonal to v and coplanar to previous vPrimes

  }

  vec3 t = pPrime + normalize(vPrime)*radius*sqrt(2.0);// vertex position of the square

  vec4 tPrime = projectionMatrix * vec4(t, 1.0);      // vertex position with the projection applied

  gl_Position = tPrime;

  vec3 cirEdge = normalize(vPrime)*radius;
  fRadius = length(cirEdge);

  fPosition = t;                      // vertex position without projection
  fCenter = pPrime;                    // center position without projection

  E = normalize( - (tPrime).xyz);              // vertex from the position to the eye
  L = normalize((projectionMatrix * modelViewMatrix * lightPosition).xyz - (tPrime).xyz);  // vetex position of the light
}
