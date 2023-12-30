var express = require('express');
const { fork } = require("child_process");
var fileUpload = require('express-fileupload');
const fs = require("fs");

const path = require('path');

var app = express();
app.use(express.static(__dirname + '/public'));

app.use(express.urlencoded({extended: true}));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/upload.html'))
});

app.get('/video', function(req, res) {
    res.sendFile(path.join(__dirname + '/video.html'))
});

app.post('/upload',
    fileUpload({ createParentPath:true }), 
    (req, res) => {
        const files = req.files
        const child = fork("./video_compression/video");

        Object.keys(files).forEach(key =>{
            const filepath = path.join(__dirname,'files', files[key].name)
            files[key].mv(filepath, (err) => {
                if (err) return res.status(500).json({ status: 'error', 
                message: err})
            })

            child.send({filePath: filepath, name: files[key].name});
            child.on("message", (message) => {
                const { statusCode, text } = message;
                res.status(statusCode).json({status: 'Success', message: text});
            });
        })
        
        // return res.json({status: 'success', message: Object.keys(files).toString() })
    }
);

app.get('/stream', function(req, res) {
        var filepath = path.join(__dirname,'files')
        const files = fs.readdirSync(filepath)
        for(var i in files) {
            if(files[i] !== null && files[i] !== '') {
                filepath = path.join(__dirname,'files',files[i]);
                break;
            }
        }
        const stat = fs.statSync(filepath)
        const fileSize = stat.size
        const range = req.headers.range
        
        if (range) {
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1]
        ? parseInt(parts[1], 10)
        : fileSize-1
        
        const chunksize = (end-start)+1
        const file = fs.createReadStream(filepath, {start, end})
        const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
        }
        
        res.writeHead(206, head)
        file.pipe(res)
        } else {
        const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        }
        res.writeHead(200, head)
        fs.createReadStream(filepath).pipe(res)
        }
    }
);

const runApp=(port)=>{
    app.listen(port);
    console.log('Example app listening on port:',port);
};

runApp(process.env.PORT || 3000);