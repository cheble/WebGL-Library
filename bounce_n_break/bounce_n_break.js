var BALL_COLOR = vec4(0.0, 0.0, 0.0, 1.0);
var BALL_TEXTURE = null;
var BALL_RADIUS = 0.2;

BrickType = {
  UNBREAKABLE: 0,
  NORMAL : 1,
  STRONG : 2,
  HEALTH_UP : 3,
  ATTACK_UP : 4,
  SLIT : 5
}

function Ball() {
  /** Ball Center Position */
  this.center = vec3(0.0, 0.0, 0.0);
  /** Ball Velocity Vector */
  this.velocity = vec3(0.0, 0.0, 0.0);
  /** Ball Health */
  this.health = 3;
}

function Brick() {
  /** Brick Center Position */
  this.center = vec3(0.0, 0.0, 0.0);
  /** Brick Up Vector */
  this.up = vec3(0.0, 1.0, 0.0);
  /** Brick Width */
  this.width = 1;
  /** Brick Height */
  this.height = 1;
  /** Brick Health */
  this.health = 1;
  /** Brick Type */
  this.type = BrickType.NORMAL;
}

function detectBrickCollision(ball, brick){
  // http://www.metanetsoftware.com/technique/tutorialA.html
  // TODO ---- I am assuming brick.up is normalized
  topEdge = scale((brick.height), brick.up);
  right = vec3(-brick.up[0], brick.up[1], brick.up[2]);
  rightEdge = scale((brick.width), right);

  // find closest vertex to ball center
  // create an axis parallel to the line from this vertex to the ball center

  // project the brick vertices onto the axis
  // project the ball edge onto the axis

  // check if brick vertices and the ball edge overlaps on the axis

  // if overlap
    // find out which voronoi region the ball center is in
    // calculate reflecting velocity based on region


  // return reflocting velocity vector.

}

function detectWallCollision(ball, bounds){

}
