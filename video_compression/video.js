const fs = require("fs");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
process.on("message", (payload) => {
    const { filePath, name } = payload;
    const endProcess = (endPayload) => {
        const { statusCode, text } = endPayload;
        // Remove temp file
        fs.unlink(filePath, (err) => {
          if (err) {
            process.send({ statusCode: 500, text: err.message });
          }
        });
        // Format response so it fits the api response
        process.send({ statusCode, text });
        // End process
        process.exit();
      };
    ffmpeg(filePath)
    .fps(30)
    .addOptions(["-crf 28"])
    .on("end", () => { 
      endProcess({ statusCode: 200, text: "Success" });
    })
    .on("error", (err) => {
      endProcess({ statusCode: 500, text: err.message });
    }).save(`./files/compressed${name}`);
});

 