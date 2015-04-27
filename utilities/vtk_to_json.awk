BEGIN {
	print "var woman_data = {";
	SECTION="HEADER";
	VERTICES=0;
  POLYGONS=0;
}  # begin section 
{
  if ($0 ~ /^[^\-[:digit:]]/ && (SECTION == "POINTS" || SECTION == "NORMALS" || SECTION == "POLYGONS")) {
    # end array
    printf "%s", "],\n";
    SECTION = "";
  }
	if ($1 == "POINTS") {
		VERTICES=$2;
		SECTION="POINTS";

		getline;
		printf "%s", "\"vertices\": [";
		printf "%s", $1;
		for (i=2; i<NF; i++) {
			printf "%s", ","$i;
		}
    next;
	} else if ($1 == "POLYGONS") {
    POLYGONS=$2;
    SECTION="POLYGONS";

    getline;
    printf "%s", "\"polygons\": [";
    printf "%s", $2;
    for (i=3; i<NF; i++) {
      printf "%s", ","$i;
    }
    next;
	} else if ($1 == "NORMALS") {
    SECTION="NORMALS";

    getline;
    printf "%s", "\"normals\": [";
    printf "%s", $1;
    for (i=2; i<NF; i++) {
      printf "%s", ","$i;
    }
    next;
	}

  if ($0 ~ /^[\-[:digit:]]/) {
    if (SECTION == "POINTS" || SECTION == "NORMALS") {
      for (i=1; i<NF; i++) {
        printf "%s", ","$i;
      }
    } else if (SECTION == "POLYGONS") {
      for (i=2; i<NF; i++) {
        printf "%s", ","$i;
      }
    }
  }

	
}   # loop section
END{
  if (SECTION == "POINTS" || SECTION == "NORMALS" || SECTION == "POLYGONS") {
    # end array
    printf "%s", "]\n";
    SECTION = "";
  }
	print "}; //"NR;
}     # end section