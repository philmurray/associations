#!/bin/bash

#text file is from http://www.wordfrequency.info/intro.asp

cat "$1" | tail -n+4 | cut -f 1-4 | sed "s/'/\'\'/g" | awk '{ print "INSERT INTO words(text,lemma,pos,rank) VALUES ('\''" $2 "'\'','\''" $3 "'\'','\''" $4 "'\''," $1 ");" }'

# ./import_words.sh "the word frequency text file" | psql -h 192.168.1.100 -p 5433 -U associations_dbuser -d associations
