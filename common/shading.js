function Shading() {
  /** Vector representing the light position */
  this.lightPosition = vec4(2.0, 0.0, 0.0, 1.0 );
  /** Ambient Reflection Constant */
  this.ka = 0.25;
  /** Diffuse Reflection Constant */
  this.kd = 0.5;
  /** Specular Reflection Constant */
  this.ks = 0.5;
  /**  Material Shininess Constant */
  this.shininess = 100.0;

}
