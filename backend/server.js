require("dotenv").config();
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const apiRouter = require("./routes/api");

const app = express();

// =============================================
// 1. Directory Setup
// =============================================
const directories = [
  path.join(__dirname, "uploads"),
  path.join(__dirname, "output"),
  path.join(__dirname, "frames"),
];

// Create required directories if they don't exist
directories.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// =============================================
// 2. Middleware Configuration
// =============================================
app.use(
  cors({
    origin: "http://localhost:5173" || "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    abortOnLimit: true,
    responseOnLimit: "File size exceeds the 50MB limit",
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "temp"),
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// =============================================
// 3. Static File Serving
// =============================================
app.use(
  "/output",
  express.static(path.join(__dirname, "output"), {
    setHeaders: (res) => {
      res.set("Cache-Control", "no-store");
    },
  })
);

// =============================================
// 4. API Routes
// =============================================
app.use("/api", apiRouter);

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    directories: directories.map((dir) => ({
      path: dir,
      exists: fs.existsSync(dir),
      writable: fs.accessSync(dir, fs.constants.W_OK) === undefined,
    })),
    dependencies: {
      ffmpeg: process.env.FFMPEG_PATH || "system",
    },
  });
});

// =============================================
// 5. Error Handling
// =============================================
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.stack);

  // Clean up temporary files on error
  if (req.files) {
    Object.values(req.files).forEach((file) => {
      if (file.tempFilePath) {
        fs.unlink(file.tempFilePath, () => {});
      }
    });
  }

  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// =============================================
// 6. Server Startup
// =============================================
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`
  Server running in ${process.env.NODE_ENV || "development"} mode
  Listening on port ${PORT}
  Available endpoints:
  - POST /api/convert
  - GET /health
  - GET /output/:filename
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server terminated");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server terminated");
    process.exit(0);
  });
});
