//sample-http-request

import http.requests.*;

//GET

GetRequest get = new GetRequest("http://httprocessing.heroku.com");
get.send();
println("Reponse Content: " + get.getContent());
println("Reponse Content-Length Header: " + get.getHeader("Content-Length"));

//POST
PostRequest post = new PostRequest("http://httprocessing.heroku.com");
post.addData("name", "Rune");
post.send();
println("Reponse Content: " + post.getContent());
println("Reponse Content-Length Header: " + post.getHeader("Content-Length"));

//To authenticate requests using a Basic Access authentication scheme, include the following in your requests:

get.addUser("username", "password");
post.addUser("username", "password");

//To add a header to your request, including the following:

 //method: addHeader(name,value)
 get.addHeader("Accept", "application/json");
 post.addHeader("Content-Type", "application/json");


 //@URIR https://github.com/runemadsen/HTTP-Requests-for-Processing

 