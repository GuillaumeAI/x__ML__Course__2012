#!/bin/bash

# Test the image upload
export callContentType="Content-Type: application/json"
export callurlbase="http://127.0.0.1:3000"
export callurl="$callurlbase/stylizer/$1"
echo "Calling $callurl"
#curl --header  "$callContentType"  --request POST   --data @$requestFile $callurl --output $responseFile
databasedir=./tests
file=$databasedir/request-test.json
responseFile=$databasedir/response-test-stylizer.json
#curl "$callurlbase/up"


echo "Posting some data..."
curl --header  "$callContentType"  --request POST   --data @$file $callurl --output $responseFile
