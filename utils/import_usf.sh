#!/bin/bash

urls[0]="http://w3.usf.edu/FreeAssociation/AppendixA/Cue_Target_Pairs.A-B"
urls[1]="http://w3.usf.edu/FreeAssociation/AppendixA/Cue_Target_Pairs.C"
urls[2]="http://w3.usf.edu/FreeAssociation/AppendixA/Cue_Target_Pairs.D-F"
urls[3]="http://w3.usf.edu/FreeAssociation/AppendixA/Cue_Target_Pairs.G-K"
urls[4]="http://w3.usf.edu/FreeAssociation/AppendixA/Cue_Target_Pairs.L-O"
urls[5]="http://w3.usf.edu/FreeAssociation/AppendixA/Cue_Target_Pairs.P-R"
urls[6]="http://w3.usf.edu/FreeAssociation/AppendixA/Cue_Target_Pairs.S"
urls[7]="http://w3.usf.edu/FreeAssociation/AppendixA/Cue_Target_Pairs.T-Z"


for p in "${urls[@]}"
do
	curl "$p" | tail -n+5 | head -n-3 | cut -d , -f 1-2,4-5 | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/,[-]*/ /g' | sed "s/'/\'\'/g" | awk '{ print "INSERT INTO usf_norms VALUES ('\''" $1 "'\'','\''" $2 "'\''," $3 "," $4 ");" }'
done

# ./import_usf.sh | psql -h 192.168.1.100 -p 5433 -U associations_dbuser -d associations
