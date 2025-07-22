const fs = require("fs");
const path = require("path");

module.exports = {
  ensureDirectoryExists: (dirPath) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  },
  cleanDirectory: (dirPath) => {
    if (fs.existsSync(dirPath)) {
      fs.readdirSync(dirPath).forEach((file) => {
        fs.unlinkSync(path.join(dirPath, file));
      });
    }
  },
};
