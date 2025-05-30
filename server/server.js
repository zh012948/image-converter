const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static files from root-level dist folder
app.use(express.static(path.join(__dirname, "..", "dist")));

// Multer for file upload (in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Supported image formats
const supportedFormats = ["jpeg", "png", "webp", "avif", "tiff"];

// API to handle image conversion
app.post("/convert", upload.single("image"), async (req, res) => {
  try {
    const format = req.body.format;
    const originalName = req.file.originalname;
    const originalExt = path.extname(originalName).substring(1).toLowerCase();

    if (!supportedFormats.includes(format)) {
      return res.status(400).json({ error: "Unsupported format" });
    }

    if (originalExt === format) {
      return res.status(400).json({ error: "Image is already in selected format" });
    }

    const convertedBuffer = await sharp(req.file.buffer)[format]().toBuffer();

    const newFileName = `${Date.now()}.${format}`;
    const outputDir = path.join(__dirname, "converted");

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const filePath = path.join(outputDir, newFileName);
    fs.writeFileSync(filePath, convertedBuffer);

    res.download(filePath, () => {
      setTimeout(() => fs.unlink(filePath, () => { }), 5000); // auto delete after 5s
    });
  } catch (err) {
    console.error("Conversion error:", err);
    res.status(500).json({ error: "Conversion failed" });
  }
});

// Fallback for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
