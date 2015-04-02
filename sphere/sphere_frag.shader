precision mediump float;

#extension GL_EXT_frag_depth : enable

varying vec3 fPosition;
varying vec3 fCenter;
varying float fRadius;
varying vec3 L, E;

uniform float scale;
uniform float ka;
uniform float kd;
uniform float ks;
uniform float shininess;
uniform samplerCube texMap;
uniform mat4 modelViewMatrix;
uniform mat4 invMV;
uniform mat4 projectionMatrix;
uniform sampler2D texture;

void
main()
{
  gl_FragDepthEXT = gl_FragCoord.z;

  vec4 fColor = vec4(1.0, 0.0, 0.0, 1.0);

  vec3 dif = fPosition - fCenter;
  float distance = length(dif);              // distance from the center of the circle

  if (distance > fRadius) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);      // point is outside of the circle
    discard;
    return;
  }

  float x = fPosition.x - fCenter.x;
  float y = fPosition.y - fCenter.y;
  float z = - sqrt(fRadius*fRadius - x * x - y * y);

  vec3 norm = normalize(vec3(x, y, z));          // normal vector of the circle



  // Text Cube???
  // vec4 spherePos = vec4(fPosition.x, fPosition.y, z, 1.0);
  //
  // vec4 posEye = projectionMatrix * vec4(fPosition, 1.0);
  // //posEye.z = z;
  // vec4 centerEye = projectionMatrix * vec4(fCenter, 1.0);
  //
  // vec4 normTexture = (invMV) * posEye - (invMV) * centerEye;
  // //normTexture = vec4(norm, 1.0) * (invMV) - vec4(fCenter, 1.0) * (invMV);
  // normTexture = normalize(normTexture);
  //
  // fColor = vec4(1.0, 1.0, 1.0, 1.0);
  // vec4 texColor = textureCube(texMap, norm);
  // if(texColor.a == 1.0){
  //   fColor = texColor;
  // }



  /**************** 2D TEXTURE ****************/
  /* texture parameters */
  float pi = radians(180.0);

  // Convert fragment position to object coordinates
  vec3 texVec = ( invMV * vec4(fCenter + vec3(x, y, -z), 1.0)).xyz;
  // Convert sphere center positionn to object coordinates
  vec3 tempCenter = (invMV * vec4(fCenter, 1.0)).xyz;
  // Vector from sphere surface position to sphere center
  texVec = texVec - tempCenter;
  texVec = normalize(texVec);

  // Calculate the s and t coordinates for texture mapping
  float sCoord = 0.5 + (atan(texVec.x,texVec.z))/(2.0*pi);
  float tCoord = 0.5 - asin(texVec.y)/(pi);
  vec2 texCoord = vec2(sCoord, tCoord);

  fColor = texture2D( texture,  texCoord);
  /************** END 2D TEXTURE **************/

  vec3 LL = normalize(L);
  vec3 EE = normalize(E);

  vec3 H = normalize( LL + EE );
  float ambient = ka;

  float diffuse = kd * max( dot(LL, norm), 0.0 );
  float specular = ks * pow( max(dot(norm, H), 0.0), shininess );

  if( dot(LL, norm) < 0.0 ) specular = 0.0;

  fColor = fColor * (ambient + diffuse) + vec4(1.0) * specular;
  fColor.a = 1.0;

  gl_FragColor = fColor;


}
