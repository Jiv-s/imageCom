
const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Store uploaded images temporarily in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error("Only JPG, PNG, and WebP images are allowed."));
    }
  },
});

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Image compression API
app.post("/api/compress", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload an image." });
    }

    const quality = Math.min(
      90,
      Math.max(10, Number(req.body.quality) || 60)
    );

    const compressedImage = await sharp(req.file.buffer)
      .rotate()
      .jpeg({ quality })
      .toBuffer();

    res.set({
      "Content-Type": "image/jpeg",
      "Content-Disposition": 'attachment; filename="compressed-image.jpg"',
      "X-Original-Size": req.file.size,
      "X-Compressed-Size": compressedImage.length,
    });

    res.send(compressedImage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Image compression failed." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
