var debug = false;
var verbose = 1;
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: __dirname + '/uploads/images' });
const axios = require('axios');
const { request } = require('express');

var fs = require('fs');
const Buffer = require('safer-buffer').Buffer;
const path = require('path');
//decode_base64(stylizedImage, target);
var Jimp = require('jimp');



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
function mapModelIdToPort(modelid) {
    var basePort = 9000;
    return basePort + parseInt(modelid);

}
function buildstylizeapiurl(port) {
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
                    if (verbose > 1) {
                        console.log(`statusCode: ${res2.statusCode}`);
                        console.log(
                            Object.keys(res2)
                        );
                        console.log(
                            Object.keys(res2.data)
                        );
                    }


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

                    r.contentImage = contentJson.contentImage;
                    writeResultHTML(r,"result-stylizer-" + portMap + ".html");
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

var keepTrack = true;
app.post("/composer/:modelid?/:modelid2?", function (req, res, next) {

    console.log("composer::Receiving data..."
        + `//@STCGoal Transparently this stylize using another host service.
            //@a This route is called to compose two inference. 
    `);

    var r = new Object();
    r.message = "Connected";
    r.status = 0;
    var portMap = 9002; //default style 1
    var portMap2 = 9003; //default style 2

    if (hasProp(req.params, "modelid")) {
        var modelid = req.params.modelid;
        portMap = mapModelIdToPort(modelid);
        console.log("Using style1 port: " + portMap);
    }
    else console.log("Using default style1 port: " + portMap);

    if (hasProp(req.params, "modelid2")) {
        var modelid2 = req.params.modelid2;
        portMap2 = mapModelIdToPort(modelid2);
        console.log("Using style2 port: " + portMap2);
    }
    else console.log("Using default style2 port: " + portMap2);

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
        console.log("   Getting inference from stylization model servers");



        var contentJson = JSON.parse(body); //grab the request body and parse it to a var as JSON
        if (hasProp(contentJson, "contentImage")) {
            console.log
                ("Valid format received.");
            console.log("Style server is being called : " + stylizeapiurl);

            if (keepTrack) r.contentImage = contentJson.contentImage;

            r.message = "Received a valid format";

            getInferenceFromServer(body, portMap)
                .then(r2 => {
                    //stuff on success
                    if (keepTrack) r.stylizedImage1 = r2.stylizedImage;

                    //@STCGoal Get another Inference from PortMap2
                    var req2 = new Object();
                    req2.contentImage = r2.stylizedImage; // getting our result as input for the second pass
                    var body2 = JSON.stringify(req2);

                    console.log("---------------------------------------------");

                    getInferenceFromServer(body2, portMap2)
                        .then(r3 => {
                            //stuff on success
                            r.stylizedImage = r3.stylizedImage;
                            try {
                                writeResultHTML(r, "result-composer-" + portMap + "-"+ portMap2 + ".html");

                            } catch (error) {

                            }

                            res.end(JSON.stringify(r));
                        }).catch(r3 => {
                            //stuff on error
                            res.end(JSON.stringify(r3));

                        }
                        );

                })
                .catch(r => {
                    //stuff on error
                    res.end(JSON.stringify(r));

                });

        }

    });

});

//---------------------------------------------------------------------
app.post("/composerv2/:modelid?/:modelid2?", function (req, res, next) {

    console.log("composerV2::Receiving data..."
        + `//@STCGoal Transparently this stylize using another host service.
            //@a This route is called to compose two inference. 
            //@STCGoal Upscale before infering the second image
    `);

    var r = new Object();
    r.message = "Connected";
    r.status = 0;
    var portMap = 9002; //default style 1
    var portMap2 = 9003; //default style 2

    if (hasProp(req.params, "modelid")) {
        var modelid = req.params.modelid;
        portMap = mapModelIdToPort(modelid);
        console.log("Using style1 port: " + portMap);
    }
    else console.log("Using default style1 port: " + portMap);

    if (hasProp(req.params, "modelid2")) {
        var modelid2 = req.params.modelid2;
        portMap2 = mapModelIdToPort(modelid2);
        console.log("Using style2 port: " + portMap2);
    }
    else console.log("Using default style2 port: " + portMap2);

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
        console.log("   Getting inference from stylization model servers");



        var contentJson = JSON.parse(body); //grab the request body and parse it to a var as JSON
        if (hasProp(contentJson, "contentImage")) {
            console.log
                ("Valid format received.");
            console.log("Style server is being called : " + stylizeapiurl);

            r.message = "Received a valid format";
            r.contentImage = contentJson.contentImage; //@db Keeping the content image for the return

            getInferenceFromServer(body, portMap)
                .then(r2 => {
                    //stuff on success


                    //@STCGoal Get another Inference from PortMap2
                    var req2 = new Object();

                    //@STCGoal Increase size of content image before posting it.

                    var tmpContent = r2.stylizedImage;
                    var tmpContentDecoded = decode_base64ToString(r2.stylizedImage);
                    var tmpFilename = "_composetmp.jpg";
                    var tmpFilename2 = "_composetmpResized.jpg";

                    fs.writeFile('_tmpContent.txt', tmpContent, function (err) {
                        if (err) console.log(err);
                        console.log('saved');
                    });

                    fs.writeFile('_tmpContentDecoded.jpg', tmpContentDecoded, function (err) {
                        if (err) console.log(err);
                        console.log('saved');
                    });

                    decode_base64(tmpContent, tmpFilename);

                    //@a

                    // open a file called "lenna.png"
                    Jimp.read(tmpFilename, (err3, lenna) => {
                        if (err3) console.log(err3);
                        var w = 800;
                        var h = 1024; var q = 90;

                        lenna
                            .resize(w, Jimp.AUTO) // resize
                            .quality(q) // set JPEG quality
                            .write(tmpFilename2); // save


                        /* Image Manipulation Methods (Default Plugins)
    blit - Blit an image onto another.
    blur - Quickly blur an image.
    color - Various color manipulation methods.
    contain - Contain an image within a height and width.
    cover - Scale the image so the given width and height keeping the aspect ratio.
    displace - Displaces the image based on a displacement map
    dither - Apply a dither effect to an image.
    flip - Flip an image along it's x or y axis.
    gaussian - Hardcore blur.
    invert - Invert an images colors
    mask - Mask one image with another.
    normalize - Normalize the colors in an image
    print - Print text onto an image
    resize - Resize an image.
    rotate - Rotate an image.
    scale - Uniformly scales the image by a factor.
    
    https://github.com/oliver-moran/jimp#image-manipulation-methods-default-plugins
     */


                        var resizedNewStylizedContent = encode_base64_v3_toString(tmpFilename2);

                        req2.contentImage = resizedNewStylizedContent; // getting our result as input for the second pass


                        var body2 = JSON.stringify(req2);


                        getInferenceFromServer(body2, portMap2, r2)
                            .then(r3 => {
                                //stuff on success

                                res.end(JSON.stringify(r3));
                            }).catch(r3 => {
                                //stuff on error
                                res.end(JSON.stringify(r3));

                            }
                            );

                    }).catch(r => {
                        //stuff on error
                        res.end(JSON.stringify(r));

                    }
                    );

                });

        }

    });

});


app.post("/stylizerv2/:modelid?", function (req, res, next) {

    console.log("stylizerv2::Receiving data..."
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

            getInferenceFromServer(body, portMap, r, function (r) {
                //stuff on success
                res.end(JSON.stringify(r));

            },
                function (r) {
                    //stuff on error
                    res.end(JSON.stringify(r));

                }
            );

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









//-----------API CAller of the Backends Style model server

/**
 * Get inferences from Model server
 * 
 * sample use :getInferenceFromServer(body, portMap, r, function (r) {
                //stuff on success
                res.end(JSON.stringify(r));            },
                function (r) {
                    //stuff on error
                    res.end(JSON.stringify(r));      }        );
 * @param {*} body 
 * @param {*} portMap 
 * @param {*} r 
 * @param {*} callbackSuccess 
 * @param {*} callbackError 
 */
function getInferenceFromServer(body, portMap) {
    var r = new Object();
    // Return new promise 
    return new Promise(function (resolve, reject) {
        // Do async job


        axios
            .post(
                buildstylizeapiurl(portMap),
                body
            )
            .then((res2) => {


                if (hasProp(res2.data, "stylizedImage")) {
                    r.stylizedImage = res2.data['stylizedImage'];
                    console.log("We received a Stylized image, YAHOUUU.");

                    r.message = "We received a Stylized image, YAHOUUU.";
                    r.status = 1;
                    r.success = true;
                    return resolve(r);

                } else {


                    console.log("Something did not work, above might help");

                    r.message = "NOT received file ok (bad response structure)";
                    r.success = false;
                    r.status = -1;
                    return reject(r);
                }

                // console.log(res2)`;`
            }).catch((error) => {
                r.message = "there were errors";
                r.error = error;
                r.success = false;
                r.status = -2;
                if (verbose > 1)
                    console.error(error);

                console.log("");
                return reject(r);
            })
            ;
    });
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



//----------------


/**
 * @param  {string} base64str
 * @param  {string} filename
 */
function decode_base64(base64str, filename) {
    var r = "" + base64str;
    var buf = Buffer.from(r
        .replace(/^data:image\/png;base64,/, "")
        .replace(/^data:image\/jpeg;base64,/, "")
        , 'base64');

    fs.writeFileSync(filename, buf);

}

/**
 * @param  {string} base64str
 * @param  {string} filename
 */
function decode_base64ToString(base64str) {
    var r = "" + base64str;
    return Buffer.from(r
        .replace(/^data:image\/png;base64,/, "")
        .replace(/^data:image\/jpeg;base64,/, "")
        , 'base64');
}

//-------------------create request encoded image

/**
 * @param  {string} filename
 * @param  {string} targetJsonFile
 */
function encode_base64_v3(filename, targetJsonFile) {

    fs.writeFileSync(targetJsonFile,
        encode_base64_v3_toString(filename)
    );

}

/**
 * @param  {string} filename
 * @param  {string} targetJsonFile
 */
function encode_base64_v3_toString(filename) {
    var base64Raw = fs.readFileSync(filename, 'base64');

    var base64 = base64Raw;
    var ext = path.extname(filename).replace(".", "");
    if (ext == "jpg" || ext == "JPG" || ext == "JPEG") ext = "jpeg";
    if (ext == "pneg" || ext == "PNG" || ext == "Png") ext = "png";


    if (base64Raw.indexOf("data:") == -1) //fixing the string
        base64 = `data:image/${ext};base64,`
            + base64Raw;

    //console.log(base64);
    var jsonRequest = new Object();
    jsonRequest.contentImage = base64;
    var jsonData = JSON.stringify(jsonRequest);

    return jsonData;
}




//------------------Write results-------------





function writeResultHTML(r, filename) {
    var s =
        `<table><tr><td>Content</td><td>Final</td></tr>
    <tr>
    <td><img src="${r.contentImage}"></td>
    <td><img src="${r.stylizedImage}"></td>
    </tr>
    `

    if (hasProp(r, "stylizedImage1"))
        s =
            `<table><tr><td>Content</td><td>Intermediate</td><td>Final</td></tr>
    <tr>
    <td><img src="${r.contentImage}"></td>
    <td><img src="${r.stylizedImage1}"></td>
    <td><img src="${r.stylizedImage}"></td>
    </tr>
    `
    fs.writeFile(filename, s, function (err) {
        if (err) return console.log(err);
        console.log('err.txt saved');
    });
}