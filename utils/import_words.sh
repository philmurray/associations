#!/bin/bash

#scowl.txt from http://app.aspell.net/create?max_size=50&spelling=US&max_variant=0&diacritic=strip&special=hacker&download=wordlist&encoding=utf-8&format=inline

grep -hv "'s" wordlists/*

# ./import_words.sh | psql -h 192.168.1.100 -p 5433 -U associations_dbuser -d associations -c "copy words from STDIN DELIMITERS ',' CSV;"
