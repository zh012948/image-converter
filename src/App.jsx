import React, { useRef, useState } from "react";
import "./App.css";

function App() {
  const fileInputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const [format, setFormat] = useState("jpeg");

  const handleDropClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log("File selected:", file.name);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) return alert("Please upload a file.");
    const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
    if (fileExtension === format) {
      return alert("Uploaded file is already in selected format.");
    }

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("format", format);

    try {
      const response = await fetch("https://image-converter-backend-40aq.onrender.com/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const { error } = await response.json();
        return alert(error || "Conversion failed.");
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `converted.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Conversion failed:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="app">
      <header>
        <div className="logo">ZTools</div>
        <nav>
          <button><i className="fa-solid fa-plus"></i> Add Tool</button>
          <button><i className="fa-solid fa-star"></i> Starred</button>
        </nav>
      </header>

      <h1 className="headline">Convert Your <span>Image</span></h1>

      <div className="upload-section">
        <div className="controls">
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="jpeg">Convert to JPEG</option>
            <option value="png">Convert to PNG</option>
            <option value="webp">Convert to WebP</option>
            <option value="avif">Convert to AVIF</option>
            <option value="tiff">Convert to TIFF</option>
          </select>
        </div>

        <div className="drop-zone" onClick={handleDropClick}>
          {selectedFile ? selectedFile.name : "Click or drag file here to upload"}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        <button className="convert-btn" onClick={handleConvert}>
          Convert
        </button>
      </div>

      <section className="supports">
        <h3>Popular Tools</h3>
        <div className="cards">
          <div className="card">JPG to PNG<span>Image Converter</span></div>
          <div className="card">File Compressor<span>PDF, ZIP, etc.</span></div>
          <div className="card">Resize Image<span>by pixels</span></div>
          <div className="card">PDF Splitter<span>separate pages</span></div>
        </div>
      </section>

      <footer>
        Made with 💜 by Zeeshan • <a href="#">GitHub</a> • <a href="#">Contact</a>
      </footer>
    </div>
  );
}

export default App;
