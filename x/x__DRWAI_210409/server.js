const express = require('express');
const multer = require('multer');
const upload = multer({ dest: __dirname + '/uploads/images' });


var stylizelapihost = "http://127.0.0.1";
var stylizelapiport = "9000";
var stylizelapiroute = "/stylize";
var stylizeapiurl = stylizelapihost + ":" + stylizelapiport + stylizelapiroute;

const app = express();
const PORT = 3000;
app.get("up", function (req, res, next) {
    console.log("Up tested");
})
app.use(express.static('public'));
app.post("/stylize", function (req, res, next) {
    console.log("Receiving data..."
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


    });

});
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
        var contentJson = JSON.parse(body); //grab the request body and parse it to a var as JSON


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