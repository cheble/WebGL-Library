BEGIN {
	printf "%s", "var data = {\n";
  SECTION="";
  V=0;
  F=0;
}  # begin section 

# Vertices
/^v/ {
  if (SECTION=="") {
    printf "\"vertices\": [%f,%f,%f", $2, $3, $4;
    SECTION="POINTS";
  } else {
    printf ",%f,%f,%f", $2, $3, $4;
  }
}

# Polygons
/^f/ {
  if (SECTION=="POINTS") {
    printf "],\n\"polygons\": [%d,%d,%d", ($2-1), ($3-1), ($4-1);
    SECTION="POLYGONS";
  } else {
    printf ",%d,%d,%d", ($2-1), ($3-1), ($4-1);
  }
}

END{
  # end array
  printf "%s", "]\n";
 	print "}; //"NR;
}     # end section