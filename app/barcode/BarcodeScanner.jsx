
"use client"
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScanner() {
  const videoRef = useRef(null);

  const [barcode, setBarcode] = useState("");
  const [isScanned, setIsScanned] = useState(false);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let controls;

    async function startScanner() {
      controls = await codeReader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result) => {
          if (result) {
            setBarcode(result.getText());
            setIsScanned(true);

            // Stop scanning after first success
            controls.stop();
          }
        }
      );
    }

    startScanner();

    return () => {
      if (controls) controls.stop();
    };
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        style={{
          width: 500,
          border: isScanned ? "5px solid green" : "5px solid gray",
          borderRadius: 10,
        }}
      />

      <h2>Barcode: {barcode}</h2>

      {isScanned && (
        <div
          style={{
            marginTop: 20,
            padding: 15,
            background: "#d4edda",
            color: "#155724",
            border: "2px solid green",
            borderRadius: 8,
            fontWeight: "bold",
            width: 300,
          }}
        >
          ✅ Barcode Scanned Successfully
        </div>
      )}
    </div>
  );
}