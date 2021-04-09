#!/bin/bash

# Test the image upload
export callContentType="Content-Type: application/json"
export callurlbase="http://127.0.0.1:3000"
export callurl="$callurlbase/stylize"
echo "Calling $callurl"
#curl --header  "$callContentType"  --request POST   --data @$requestFile $callurl --output $responseFile
file=request-test.json
responseFile=response-test.json
#curl "$callurlbase/up"
sleep 2
echo "Posting some data..."
curl --header  "$callContentType"  --request POST   --data @$file $callurl --output $responseFile