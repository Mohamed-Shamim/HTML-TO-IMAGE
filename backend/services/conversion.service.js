const puppeteer = require("puppeteer");
const { convertFramesToGif } = require("./gif.service");
const path = require("path");
const fs = require("fs");

const framesDir = path.join(__dirname, "../frames");
if (!fs.existsSync(framesDir)) {
  fs.mkdirSync(framesDir, { recursive: true });
}

// Add Chrome flags for Windows compatibility
const PUPPETEER_OPTIONS = {
  headless: "new",
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu'
  ],
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || 
                 (process.platform === 'win32' 
                  ? process.env.CHROME_BIN 
                  : puppeteer.executablePath())
};

// Fix file URL formatting for Windows
const formatFilePath = (filePath) => {
  if (process.platform === "win32") {
    // Remove any existing file:// prefixes and normalize path
    const cleanPath = filePath.replace(/^file:\/+/i, "").replace(/\\/g, "/");
    return `file:///${cleanPath}`;
  }
  return `file://${filePath}`;
};

exports.convertHtmlToImage = async (htmlPath, outputPath, options) => {
  const browser = await puppeteer.launch(PUPPETEER_OPTIONS);

  try {
    const page = await browser.newPage();
    const targetPath = htmlPath.startsWith("http")
      ? htmlPath
      : formatFilePath(htmlPath);

    console.log("Attempting to load:", targetPath); // Debug logging

    await page.goto(targetPath, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });
    // Add delay for CSS animations
    if (options.waitForAnimation) {
      await page.waitForTimeout(options.animationDuration || 1000);
    }

    // Capture screenshot
    const screenshotOptions = {
      path: outputPath,
      type: options.type || "jpeg",
      quality: options.quality || 100,
      fullPage: true,
      omitBackground: true,
    };

    // PNG doesn't support quality parameter
    if (screenshotOptions.type === "png") {
      delete screenshotOptions.quality;
    }

    await page.screenshot(screenshotOptions);
  } catch (error) {
    console.error("Conversion failed:", error);
    throw new Error(`Failed to load HTML: ${error.message}`);
  } finally {
    await browser.close();
  }
};

exports.convertHtmlToGif = async (htmlPath, outputPath, options) => {
  const browser = await puppeteer.launch(PUPPETEER_OPTIONS);

  try {
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({
      width: options.width || 1400,
      height: options.height || 800,
      deviceScaleFactor: options.scale || 1,
    });

    // Load HTML content
    await page.goto(htmlPath, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    // Calculate frame parameters
    const duration = options.duration || 3000;
    const fps = options.fps || 10;
    const frameCount = Math.floor((duration / 1000) * fps);
    const interval = 1000 / fps;
    const framePaths = [];

    // Capture frames
    for (let i = 0; i < frameCount; i++) {
      const framePath = path.join(framesDir, `frame-${i}.png`);
      await page.screenshot({ path: framePath });
      framePaths.push(framePath);
      await page.waitForTimeout(interval);
    }

    // Convert frames to GIF
    await convertFramesToGif(framePaths, outputPath, fps);

    // Cleanup frames
    framePaths.forEach((frame) => {
      try {
        fs.unlinkSync(frame);
      } catch (err) {
        console.error(`Error deleting frame ${frame}:`, err);
      }
    });
  } finally {
    await browser.close();
  }
};
