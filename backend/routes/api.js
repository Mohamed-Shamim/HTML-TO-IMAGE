// backend/routes/api.js
const express = require("express");
const router = express.Router();
const {
  convertHtmlToImage,
  convertHtmlToGif,
} = require("../services/conversion.service");
const fs = require("fs");
const path = require("path");

// Create necessary directories (ensure these are handled by server.js or elsewhere as well)
const uploadDir = path.join(__dirname, "../uploads");
const outputDir = path.join(__dirname, "../output");
const framesDir = path.join(__dirname, "../frames");

[uploadDir, outputDir, framesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

router.post("/convert", async (req, res) => {
  let htmlPath;
  let outputFilename;
  let outputPath;

  try {
    if (!req.files?.htmlFile && !req.body?.htmlUrl) {
      return res.status(400).json({
        error: "No input provided",
        details: "Please provide either a file upload or URL",
      });
    }

    const options = req.body.options ? JSON.parse(req.body.options) : {};
    const outputFormat = options.type || "jpeg"; // Default to jpeg if not specified

    if (req.files?.htmlFile) {
      const file = req.files.htmlFile;
      const uniqueFilename = `${Date.now()}-${file.name}`;
      const uploadPath = path.join(uploadDir, uniqueFilename);

      await file.mv(uploadPath);
      htmlPath = uploadPath;
    } else {
      htmlPath = req.body.htmlUrl;
    } // If it's a file path, ensure it exists before proceeding (for uploaded files)

    if (!htmlPath.startsWith("http") && !fs.existsSync(htmlPath)) {
      return res.status(400).json({
        error: "File not found",
        details: `The file ${htmlPath} does not exist.`,
      });
    } // Generate output filename based on type

    const baseName = `converted-${Date.now()}`;
    if (outputFormat === "gif") {
      outputFilename = `${baseName}.gif`;
    } else {
      // For JPG/PNG
      outputFilename = `${baseName}.${outputFormat}`;
    }
    outputPath = path.join(outputDir, outputFilename); // Perform the conversion based on the requested output format

    if (outputFormat === "gif") {
      await convertHtmlToGif(htmlPath, outputPath, options);
    } else {
      // Default to image conversion (jpeg/png)
      await convertHtmlToImage(htmlPath, outputPath, options);
    } // Return result

    res.json({
      success: true,
      downloadUrl: `/output/${outputFilename}`,
      filename: outputFilename,
      format: outputFormat,
      dimensions: {
        width: options.width,
        height: options.height,
        scale: options.scale,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      error: "Conversion failed",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  } finally {
    // Clean up the uploaded HTML file if it was a file upload
    if (req.files?.htmlFile && htmlPath && fs.existsSync(htmlPath)) {
      try {
        fs.unlinkSync(htmlPath);
        console.log(`Cleaned up uploaded file: ${htmlPath}`);
      } catch (unlinkErr) {
        console.error(`Error deleting uploaded file ${htmlPath}:`, unlinkErr);
      }
    }
  }
});

module.exports = router;
