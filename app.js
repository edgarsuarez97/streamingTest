var express = require('express');
const { fork } = require("child_process");
var fileUpload = require('express-fileupload');
const path = require('path');

var app = express();

app.use(express.urlencoded({extended: true}));

app.post('/upload',
    fileUpload({ createParentPath:true }), 
    (req, res) => {
        const files = req.files
        console.log(files)
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
                res.status(statusCode).send(text);
            });
        })
        
        // return res.json({status: 'success', message: Object.keys(files).toString() })
    }
  );

const runApp=(port)=>{
    app.listen(port);
    console.log('Example app listening on port:',port);
};

runApp(process.env.PORT || 3000);