var debug = false;
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: __dirname + '/uploads/images' });
const axios = require('axios');
const { request } = require('express');

var fs = require('fs');
var stylizelapihost = "http://127.0.0.1";
var stylizelapiport = "9002";
var stylizelapiport2 = "9003";
var stylizelapiroute = "/stylize";
var styliZERlapiroute = "/stylizer";
var stylizeapiurl = stylizelapihost + ":" + stylizelapiport + stylizelapiroute;

const app = express();
const PORT = 3000;
app.get("up", function (req, res, next) {
    console.log("Up tested");
})
app.use(express.static('public'));
function mapModelIdToPort(modelid)
{
    var basePort = 9000;
    return basePort + parseInt(modelid);
    
}
function buildstylizeapiurl(port)
{
    var r = 
    stylizelapihost + ":" + port + stylizelapiroute;
    console.log("Built API Call URL: " + r);
    return r;
}
app.post("/stylizer/:modelid?", function (req, res, next) {
    console.log("Receiving data..."
        + `//@STCGoal Transparently this stylize using another host service
    `);
    var r = new Object();
    r.message = "Connected";
    r.status = 0;
    var portMap = 9000;
    if (hasProp(req.params, "modelid")) {
        var modelid = req.params.modelid;
       portMap = mapModelIdToPort(modelid);
       console.log("Using  port: " + portMap);
    }
    else console.log("Using default port: " + portMap);

    let body = "";

    var c = 0;
    req.on("data", chunk => {
        console.log("Receiving chuck..." + c++);
        body += chunk.toString(); // convert Buffer to string
        // console.log(".");
    });


    // var contentImageAsStyle
    req.on("end", () => {
        console.log("Content image received :");
        console.log("   Getting inference from stylization model server");



        var contentJson = JSON.parse(body); //grab the request body and parse it to a var as JSON
        if (hasProp(contentJson, "contentImage")) {
            console.log
                ("Valid format received.");
            console.log("Style server is being called : " + stylizeapiurl);

            r.message = "Received a valid format";
            axios
                .post(
                    buildstylizeapiurl(portMap),
                    body
                    // {
                    //     contentImage: contentJson.contentImage
                    // }
                )
                .then((res2) => {
                    console.log(`statusCode: ${res2.statusCode}`);
                    console.log(
                        Object.keys(res2)
                    );
                    console.log(
                        Object.keys(res2.data)
                    );


                    if (debug) {
                        var jsonContentResponse2 = JSON.stringify(res2.data);
                        fs.writeFile('err.txt', jsonContentResponse2, function (err) {
                            if (err) return console.log(err);
                            console.log('err.txt saved');
                        });
                    }
                    if (hasProp(res2.data, "stylizedImage")) {
                        r.stylizedImage = res2.data['stylizedImage'];
                        console.log("We received a Stylized image, YAHOUUU.");

                        r.message = "We received a Stylized image, YAHOUUU.";
                        r.status = 1;

                    } else {
                        

                        try {

                        } catch (error) {
                            console.log(error);
                            console.log("error writing error file, not getting better ;(");
                            console.log(
                                Object.keys(error)
                            );
                            
        
                        }


                        console.log("Something did not work, above might help");

                        r.message = "NOT received file ok";
                        r.status = -1;

                    }

                    res.end(JSON.stringify(r));
                    // console.log(res2)`;`
                }).catch((error) => {
                    r.message = "there were errors";
                    r.error = error;
                    r.status = -2;
                    res.end(JSON.stringify(r));
                    console.error(error);
                })
                ;

        }




    });

});






// V1 Stylize


app.post("/stylize", function (req, res, next) {
    console.log("stylizeV1::Receiving data..."
        + `//@STCGoal Transparently this stylize using another host service
    `);

    let body = "";

    var c = 0;
    req.on("data", chunk => {
        console.log("Receiving chuck..." + c++);
        body += chunk.toString(); // convert Buffer to string
        // console.log(".");
    });


    // var contentImageAsStyle
    req.on("end", () => {
        console.log("Content image received :");
        console.log("   Getting inference from stylization model server");


        var r = new Object();
        r.message = "initialized";
        r.status = 0;


        var contentJson = JSON.parse(body); //grab the request body and parse it to a var as JSON
        if (hasProp(contentJson, "contentImage")) {
            console.log
                ("Valid format received.");
            console.log("Style server is being called : " + stylizeapiurl);

            r.message = "Received a valid format";
            axios
                .post(
                    stylizeapiurl,
                    body
                    // {
                    //     contentImage: contentJson.contentImage
                    // }
                )
                .then((res2) => {
                    console.log(`statusCode: ${res2.statusCode}`);
                    console.log(
                        Object.keys(res2)
                    );
                    console.log(
                        Object.keys(res2.data)
                    );


                    if (debug) {
                        var jsonContentResponse2 = JSON.stringify(res2.data);
                        fs.writeFile('err.txt', jsonContentResponse2, function (err) {
                            if (err) return console.log(err);
                            console.log('err.txt saved');
                        });
                    }
                    if (hasProp(res2.data, "stylizedImage")) {
                        r.stylizedImage = res2.data['stylizedImage'];
                        console.log("We received a Stylized image, YAHOUUU.");

                        r.message = "We received a Stylized image, YAHOUUU.";
                        r.status = 1;

                    } else {
                        console.log();

                        try {

                        } catch (error) {
                            console.log("error writing error file, not getting better ;(");
                            console.log(error);
                        }


                        console.log("Something did not work, above might help");

                        r.message = "NOT received file ok";
                        r.status = -1;

                    }

                    res.end(JSON.stringify(r));
                    // console.log(res2)`;`
                }).catch((error) => {
                    r.message = "there were errors";
                    r.error = error;
                    r.status = -2;
                    res.end(JSON.stringify(r));
                    console.error(error);
                })
                ;

        }




    });

});






//


















app.post("/upload", function (req, res, next) {
    console.log("Receiving data...");

    let body = "";

    var c = 0;
    req.on("data", chunk => {
        console.log("Receiving chuck..." + c++);
        body += chunk.toString(); // convert Buffer to string
        // console.log(".");
    });



    req.on("end", () => {
        console.log("end receiving");
        // console.log(body);

        var contentJson = JSON.parse(body);
        //grab the request body and parse it to a var as JSON
        if (hasProp(contentJson, "contentImage")) {
            console.log("Valid format received.");
        }



        // console.log(
        //     Object.keys(body)
        // ); 
        // console.log(
        //     Object.keys(contentJson)
        // );

        var r = new Object();
        r.message = "received file ok";
        r.status = 1;
        res.end(JSON.stringify(r));
    });


});


// app.post('/upload', upload.single('contentImage'), (req, res) => {
//     console.log("Receiving uploads...");
//     if(req.file) {
//         res.json(req.file);
//     }
//     else throw 'error';
// });

app.listen(PORT, () => {
    console.log('Listening at http://127.0.0.1:' + PORT);
});









//-----------API CAller

function getInferenceFromServer(body,portMap,r,callbackSuccess,callbackError)
{
    axios
    .post(
        buildstylizeapiurl(portMap),
        body
    )
    .then((res2) => {
        console.log(`statusCode: ${res2.statusCode}`);
        console.log(
            Object.keys(res2)
        );
        console.log(
            Object.keys(res2.data)
        );


    
        
        if (hasProp(res2.data, "stylizedImage")) {
            r.stylizedImage = res2.data['stylizedImage'];
            console.log("We received a Stylized image, YAHOUUU.");

            r.message = "We received a Stylized image, YAHOUUU.";
            r.status = 1;

        } else {
            

            try {

            } catch (error) {
                console.log(error);
                console.log("error writing error file, not getting better ;(");
                console.log(
                    Object.keys(error)
                );
                

            }


            console.log("Something did not work, above might help");

            r.message = "NOT received file ok";
            r.status = -1;

        }

        callbackSuccess(r);
        // console.log(res2)`;`
    }).catch((error) => {
        r.message = "there were errors";
        r.error = error;
        r.status = -2;
        console.error(error);
        callbackError(r);
    })
    ;
}

//------------UTIL------------

/** tells if an object has a prop of that name
 *
 * @param {*} o
 * @param {*} p
 */
function hasProp(o, p) {

    if (o != null)
        return o.hasOwnProperty(p);
    else return false;
}
