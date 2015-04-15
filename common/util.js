function util() {

}

/**
 *  Calculate normal values based on faces and vertices.
 *
 *  Assumes the face vertices are in CW front-facing order.
 */
util.calcNormals = function(data){
  var tmpNormals = []; // array of arrays of vertex normals
  for (i=0; i<data["polygons"].length; i+=3) {
    // create vector object
    var face = [];
    for (j=i; j<i+3; j++) {
      var startVIndex = data["polygons"][j]*3;
      // console.log(startVIndex);
      var x = data["vertices"][startVIndex];
      var y = data["vertices"][startVIndex+1];
      var z = data["vertices"][startVIndex+2];
      face.push(vec3(x, y, z));
    }

    // Counter-Clockwise vertex order
    //  0--2
    //  | /
    //  |/
    //  1

    // calculate the face normal and add it to each of the vertices
    var polygonNormal = cross(subtract(face[1], face[0]), subtract(face[2], face[0]));

    for (j=0; j<3; j++) {
      if (!(data["polygons"][i]+j in tmpNormals)) {
        tmpNormals[data["polygons"][i]+j] = [];
      }
      tmpNormals[data["polygons"][i]+j].push(polygonNormal);
    }
  }

  // mix each set of vertex normals and set them to the data object
  data["normals"] = [];
  for (i=0; i<(data["vertices"].length)/3; i++) {
    var aggregateNorm = vec3(0.0, 0.0, 0.0);
    if (i in tmpNormals) {
      for (j=0; j<tmpNormals[i].length; j++) {
        aggregateNorm = add(aggregateNorm, scalev((1.0/tmpNormals[i].length), tmpNormals[i][j]));

      }
    } else {
      console.log("missing normal after calculation...");
    }

    data["normals"][3*i] = aggregateNorm[0];
    data["normals"][3*i+1] = aggregateNorm[1];
    data["normals"][3*i+2] = aggregateNorm[2];
  }
}
