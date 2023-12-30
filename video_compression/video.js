const fs = require("fs");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);
process.on("message", (payload) => {
    const { filePath, name } = payload;
    const endProcess = (endPayload) => {
        const { statusCode, text } = endPayload;

        const files = fs.readdirSync('./files')

        //remove all other files
        for(var i in files) {
          if(files[i] != `compressed${name}`){
            fs.unlink(path.join('./files',files[i]), (err) => {
              if (err) {
                process.send({ statusCode: 500, text: err.message });
              }
            });
          }
        }

        // Remove temp file
        // fs.unlink(filePath, (err) => {
        //   if (err) {
        //     process.send({ statusCode: 500, text: err.message });
        //   }
        // });
        // Format response so it fits the api response
        process.send({ statusCode, text });
        // End process
        process.exit();
      };
    ffmpeg(filePath)
    .fps(30)
    .addOptions(["-crf 28"])
    .on("end", () => { 
      endProcess({ statusCode: 200, text: "File updated successfuly!" });
    })
    .on("error", (err) => {
      endProcess({ statusCode: 500, text: err.message });
    }).save(`./files/compressed${name}`);
});