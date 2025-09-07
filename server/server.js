const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

// For Health Checing 
app.get("/", (req, res) => {
  res.status(200).send("Backend is running!");
});



app.use(cors());
app.use(express.json());

// Storage setup for uploaded files
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Supported formats
const supportedFormats = ["jpeg", "png", "webp", "avif", "tiff"];

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
    const filePath = path.join(__dirname, "converted", newFileName);

    // Ensure converted directory exists
    if (!fs.existsSync("converted")) fs.mkdirSync("converted");

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
