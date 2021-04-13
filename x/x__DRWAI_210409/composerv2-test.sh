#!/bin/bash

# Test the image stylizel / composer
export callContentType="Content-Type: application/json"
export callurlbase="http://127.0.0.1:3000"
export route=composerv2
export callurl="$callurlbase/$route/$1/$2"
echo "Calling $callurl"
#curl --header  "$callContentType"  --request POST   --data @$requestFile $callurl --output $responseFile
file=request-test.json
responseFile=response-test-$route.json
#curl "$callurlbase/up"


echo "Posting some data..."
curl --header  "$callContentType"  --request POST   --data @$file $callurl --output $responseFile
