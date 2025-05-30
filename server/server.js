const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, "..", "dist")));

// Multer setup for in-memory uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Supported output formats
const supportedFormats = ["jpeg", "png", "webp", "avif", "tiff"];

// Convert endpoint
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
    const filePath = path.join(outputDir, newFileName);

    // Ensure converted folder exists
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    fs.writeFileSync(filePath, convertedBuffer);

    res.download(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).json({ error: "File sending failed" });
      }

      // Optional: Clean up after download
      setTimeout(() => fs.unlink(filePath, () => { }), 5000);
    });
  } catch (err) {
    console.error("Conversion error:", err);
    res.status(500).json({ error: "Conversion failed" });
  }
});

// All other routes → serve index.html (React router support)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
