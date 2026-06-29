"use client";

import { useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScanner() {
  const [barcode, setBarcode] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const codeReader = new BrowserMultiFormatReader();

  const scanImage = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setLoading(true);

    try {
      const result = await codeReader.decodeFromImageUrl(
        URL.createObjectURL(file)
      );

      setBarcode(result.getText());
    } catch (err) {
      alert("No barcode found in image");
      console.log(err);
      setBarcode("");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        width: 400,
        margin: "40px auto",
        textAlign: "center",
      }}
    >
      <h2>Scan Barcode from Image</h2>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={scanImage}
      />

      {preview && (
        <img
          src={preview}
          alt="preview"
          style={{
            width: "100%",
            marginTop: 20,
            borderRadius: 10,
            border: "2px solid #ccc",
          }}
        />
      )}

      {loading && <h3>Scanning...</h3>}

      {barcode && (
        <div
          style={{
            marginTop: 20,
            background: "#d4edda",
            padding: 15,
            borderRadius: 10,
            border: "2px solid green",
          }}
        >
          <h3>✅ Barcode Found</h3>
          <h2>{barcode}</h2>
        </div>
      )}
    </div>
  );
}