'use strict';
var debug = false;
var verbose = 1;
var composeResizeWidth = 1280;
var composeResizeQual = 90;
const PORT = 3000;

const express = require('express');
const multer = require('multer');
const upload = multer({ dest: __dirname + '/uploads/images' });
const lastMulter = multer({ dest: __dirname + '/data/last' });
const logDir = multer({ dest: __dirname + '/log' });
const htmlBaseDir = __dirname + '/html';
const htmlResultDir = multer({ dest: htmlBaseDir });
const last = __dirname + '/data/last';
const axios = require('axios');
const { request } = require('express');

var fs = require('fs');
const Buffer = require('safer-buffer').Buffer;
const path = require('path');
//decode_base64(stylizedImage, target);
var Jimp = require('jimp');



var stylizelapihost = "http://orko.guillaumeisabelle.com";
var stylizelapiport = "9002";
var stylizelapiport2 = "9003";
var stylizelapiroute = "/stylize";
var styliZERlapiroute = "/stylizer";
var stylizeapiurl = stylizelapihost + ":" + stylizelapiport + stylizelapiroute;

const app = express();
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
    if (debug) console.log("Built API Call URL: " + r);
    return r;
}


app.get("/last/:svctag?", function (req, res, next) {
    var svctag = "stylizer";
    if (hasProp(req.params, "svctag")) {
        svctag = req.params.svctag;
    }

    //@STCGoal return the desired file of last result.

    var fileToRead = getLastFullPath(svctag);


    let rawdata = fs.readFileSync(fileToRead);

    res.end(rawdata);

});

function getLastFullPath(svctag) {
    var p = last + "/" + "last-" + svctag + ".json";
    if (debug) console.log("DEBUG:getLastFullPath(svctag)" + p);
    return p;

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
            var callUrl = buildstylizeapiurl(portMap);
            axios
                .post(callUrl, body) //@a Post the Data
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
                        writeError('err.txt', jsonContentResponse2, function (err) {
                            if (err) return console.log(err);
                            console.log('err.txt saved');
                        });
                    }

                    //------------------------------------------------------
                    //@a Processing Responses -----------------------------
                    if (hasProp(res2.data, "stylizedImage")) {
                        r.stylizedImage = res2.data['stylizedImage'];
                        console.log("We received a Stylized image, YAHOUUU.");

                        r.message = "We received a Stylized image, YAHOUUU.";
                        r.status = 1;

                    } else {

                        console.log("Something did not work, above might help");

                        r.message = "NOT received file ok";
                        r.status = -1;

                    }

                    r.contentImage = contentJson.contentImage;
                    var htmlResultFile = "result-stylizer-" + portMap + ".html";
                    writeResultHTML(r, htmlResultFile);
                    r.resulthtml = htmlResultFile;
                    saveLastResult(r, "stylizer");
                    res.end(JSON.stringify(r));
                    // console.log(res2)`;`
                }).catch((error) => {
                    r.message = "there were errors";
                    r.error = error;
                    r.status = -2;
                    res.end(JSON.stringify(r));
                    logError(error, "There was error");

                })
                ;

        }




    });

});
function saveLastResult(r, svctag) {
    var filename = getLastFullPath(svctag);
    fs.writeFileSync(filename, JSON.stringify(r));
}

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
                                writeResultHTML(r, "result-composer-" + portMap + "-" + portMap2 + ".html");

                            } catch (error) {

                            }

                            saveLastResult(r, "compose");

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

                    if (keepTrack) r.stylizedImage1 = r2.stylizedImage;

                    //@STCGoal Get another Inference from PortMap2
                    var req2 = new Object();

                    //@STCGoal Increase size of content image before posting it.

                    // var tmpContent = r2.stylizedImage;
                    // var tmpContentDecoded = decode_base64ToString(r2.stylizedImage);
                    // var tmpFilename = "_composetmp.jpg";
                    // var tmpFilename2 = "_composetmpResized.jpg";

                    console.log("Processing the first style as input for a second iteration...");
                    //decode the file we will resize
                    // decode_base64(tmpContent, tmpFilename); //@Status OK

                    console.log("Decoded...");
                    //@a Rezise





                    var cleanString = cleanBase64String(r2.stylizedImage);
                    fs.writeFileSync("_debug-cleanString" + ".json", cleanString);
                    decode_base64(cleanString, "_debug_cleanString.jpg");
                    // open a file called "lenna.png"
                    // jimpBase64Reader(r2.stylizedImage)
                    Jimp.read(getBase64BufferFrom(cleanString),
                        (err3, lenna) => {
                            if (err3) console.log(err3);

                            console.log("Read by Jimp");

                            lenna
                                .resize(composeResizeWidth, Jimp.AUTO) // resize
                                .quality(composeResizeQual) // set JPEG quality
                                .getBase64(Jimp.AUTO, (errL, resL) => {

                                    fs.writeFileSync("_debug-resizegetbase64_jimp" + ".json", JSON.stringify(resL));
                                    decode_base64(resL, "_debug_resizeByBase64.jpg");
                                    //@RESOLVING --USING Base64 as output



                                    exitApp(r, res, "Still developing");








                                });
                            //   .write(tmpFilename2); //@STATUS Ok



                            console.log("Resized");

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


                            //@STCIssue HAPPENS OVER HERE - We get an empty string
                            // var resizedNewStylizedContent = encodeFile_to_base64String_v3(tmpFilename2);
                            var resizedNewStylizedContent =
                                encode_base64_v3_to_JSONRequestFile(tmpFilename2, "_debug_tabarnak.json");
                            ;
                            //  console.log(resizedNewStylizedContent);


                            console.log("Recoded");
                            req2.contentImage = resizedNewStylizedContent.contentImage; // getting our result as input for the second pass
                            fs.writeFileSync("_debug-resizedNewStylizedContent" + ".json", JSON.stringify(resizedNewStylizedContent));

                            if (keepTrack)
                                r.stylizedImage1 = resizedNewStylizedContent.contentImage;

                            var body2 = JSON.stringify(req2);


                            console.log("Entering service call...");
                            getInferenceFromServer(body2, portMap2)
                                .then(r3 => {

                                    console.log("SEcond iteration completing...");
                                    //stuff on success
                                    //if (keepTrack) 

                                    r.stylizedImage = r3.stylizedImage;
                                    try {
                                        var fname = "result-composerv2-" + portMap + "-" + portMap2 + ".html";
                                        console.log("----------Writting results: " + fname);
                                        writeResultHTML(r, fname);
                                        saveLastResult(r, "composerv2");

                                    } catch (error) {

                                    }
                                    res.end(JSON.stringify(r));

                                }).catch(r3 => {
                                    //stuff on error
                                    logError(r3);
                                    res.end(JSON.stringify(r3));

                                }
                                );

                        }).catch(err3 => {
                            //stuff on error
                            logError(err3);
                            res.end(JSON.stringify(err3));

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

            //@STCISsue CHANGE FOR Promise code
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
 * sample use :getInferenceFromServer(body, portMap) .then (r => {}).catch (err => {});
 * @param {*} body 
 * @param {*} portMap 
 */
function getInferenceFromServer(body, portMap) {
    var r = new Object();
    // Return new promise 
    return new Promise(function (resolve, reject) {
        // Do async job
        try {
            fs.writeFileSync("_debug-" + portMap + ".req.json", body);

        } catch (error) {
            console.log("we tried to write debug stuff but it failed");
        }

        axios
            .post(
                buildstylizeapiurl(portMap),
                body
            )
            .then((res2) => {


                if (hasProp(res2.data, "stylizedImage")) {
                    r.stylizedImage = res2.data['stylizedImage'];
                    console.log("We received a Stylized image, YAHOUUU. PortMap: " + portMap);

                    r.message = "We received a Stylized image, YAHOUUU.";
                    r.status = 1;
                    r.success = true;
                    resolve(r);

                } else {


                    console.log("Something did not work, above might help");

                    r.message = "NOT received file ok (bad response structure)";
                    r.success = false;
                    r.status = -1;
                    reject(r);
                }

                // console.log(res2)`;`
            }).catch((error) => {
                r.message = "there were errors";
                r.error = error;
                r.success = false;
                r.status = -2;
                if (verbose > 1)
                    console.error(error);

                console.error(error.message);
                console.log("wow there is a catch...");
                reject(r);
            })
            ;
    });
}

//------------UTIL------------

function jimpBase64Reader(input) {
    if (input.indexOf('base64') != -1) {
        return Jimp.read(Buffer.from(
            cleanBase64String(input)
            , 'base64')
        );
    } else {
        // handle as Buffer, etc..
        return Jimp.read(Buffer.from(input), 'base64');
    }
}
function cleanBase64String(s) {
    if (s.indexOf('base64') != -1) {
        return s.replace(/^data:image\/png;base64,/, "")
            .replace(/^data:image\/jpeg;base64,/, "");
    } else {
        // handle as Buffer, etc..
        return s;
    }
}
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

function getBase64BufferFrom(base64) {
    return Buffer.from(base64, 'base64');
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
 * Encode a file to base64 contentImage request
 * @param  {string} filename
 * @param  {string} targetJsonFile
 */
function encodeFile_to_base64ContentRequestFile_v3(filename, targetJsonFile) {

    fs.writeFileSync(targetJsonFile,
        encodeFile_to_base64String_v3Request(filename)
    );

}


/**
 * @param  {string} filename
 * @param  {string} targetJsonFile
 */
//@STCIssue NOT WORKING, READS nothing in the file
function encode_base64_v3o_to_JSONRequest(filename) {
    var base64Raw = fs.readFileSync(filename, 'base64');
    // console.log(base64Raw);

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
    //console.log("Should have saved :" + targetJsonFile);

}


/**
 * Encode an image file into base64 JSON request file 
 * @param  {string} filename
 * @param  {string} targetJsonFile
 */
function encode_base64_v3_to_JSONRequestObject(filename) {
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
    return jsonRequest;

    //console.log("Should have saved :" + targetJsonFile);

}


/**
 * Encode an image file into base64 JSON request file 
 * @param  {string} filename
 * @param  {string} targetJsonFile
 */
function encode_base64_v3_to_JSONRequestFile(filename, targetJsonFile) {
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

    fs.writeFileSync(targetJsonFile, jsonData);
    //console.log("Should have saved :" + targetJsonFile);

}

/**
 * @param  {string} filename
 * @param  {string} targetJsonFile
 */
function encodeFile_to_base64String_v3(filename) {
    console.log(`Encoding file (${filename}) to base64 string`);

    var base64Raw = fs.readFileSync(filename, 'base64');

    var base64 = base64Raw;
    var ext = path.extname(filename).replace(".", "");
    if (ext == "jpg" || ext == "JPG" || ext == "JPEG") ext = "jpeg";
    if (ext == "pneg" || ext == "PNG" || ext == "Png") ext = "png";


    if (base64Raw.indexOf("data:") == -1) //fixing the string
        base64 = `data:image/${ext};base64,`
            + base64Raw;

    return base64;
}


/**
 * @param  {string} filename
 * @param  {string} targetJsonFile
 */
function encodeFile_to_base64String_v3Request(filename) {


    var base64 = encodeFile_to_base64String_v3(filename);


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
    `;

    if (hasProp(r, "stylizedImage1"))
        s =
            `<table><tr><td>Content</td><td>Intermediate</td><td>Final</td></tr>
    <tr>
    <td><img src="${r.contentImage}"></td>
    <td><img src="${r.stylizedImage1}"></td>
    <td><img src="${r.stylizedImage}"></td>
    </tr>
    `;

    fs.writeFileSync(htmlBaseDir + "/" +filename, s);

}

var errorFile = "log/error.txt";
function logError(error, consoleErrorMessage = "An error was logged") {
    console.log(consoleErrorMessage + ", see :" + errorFile);
    fs.writeFileSync(errorFile, error);
}



//-----------------------
/**
 * Exit the app for a reason and advise client and server console.
 * @param {*} r 
 * @param {*} res 
 * @param {*} reason 
 */
function exitApp(r, res, reason) {
    console.log("EXTING APP: " + reason);
    r.message = "App exited:" + reason;
    res.end(JSON.stringify(r));
    process.exit(0);
}


function writeError(errFileName,content,callback)
{
    var outfile =__dirname + "/" + errFileName;
    fs.writeFile(outfile, content, function (err) {
        if (err) 
        {
            callback(err);
        }
        console.log(outfile +' saved');
    });
}