// backend/services/gif.service.js
const { spawn } = require("child_process");
const path = require("path");

exports.convertFramesToGif = (framePaths, outputPath, fps) => {
  return new Promise((resolve, reject) => {
    const inputPattern = path.join(path.dirname(framePaths[0]), "frame-%d.png");
    const ffmpeg = spawn("ffmpeg", [
      "-y",
      "-framerate",
      String(fps),
      "-i",
      inputPattern,
      "-filter_complex",
      "[0:v] scale=trunc(iw/2)*2:trunc(ih/2)*2",
      "-r",
      String(fps),
      "-f",
      "gif",
      outputPath,
    ]);

    ffmpeg.stderr.on("data", (data) => {
      console.error(`FFMPEG Error: ${data}`);
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFMPEG process exited with code ${code}`));
      }
    });
  });
};
