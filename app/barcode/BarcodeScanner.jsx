"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScanner() {
  const videoRef = useRef(null);

  const [barcode, setBarcode] = useState("");
  const [found, setFound] = useState(false);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();

    let controls;

    async function startCamera() {
      controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result) => {
          if (result) {
            setBarcode(result.getText());
            setFound(true);
          } else {
            setFound(false);
          }
        }
      );
    }

    startCamera();

    return () => {
      if (controls) controls.stop();
    };
  }, []);

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "40px auto",
        textAlign: "center",
      }}
    >
      <h2>Scan Barcode</h2>

      <div
        style={{
          border: `6px solid ${found ? "#16a34a" : "#facc15"}`,
          borderRadius: 16,
          overflow: "hidden",
          transition: "0.2s",
          position: "relative",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            display: "block",
          }}
        />

        {!found && (
          <div
            style={{
              position: "absolute",
              bottom: 15,
              left: 0,
              right: 0,
              color: "#fff",
              fontWeight: "bold",
              textShadow: "0 0 8px black",
            }}
          >
            Point camera at barcode
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: 20,
          padding: 15,
          borderRadius: 12,
          background: found ? "#dcfce7" : "#fef9c3",
          border: `2px solid ${found ? "#16a34a" : "#eab308"}`,
        }}
      >
        <h3>
          {found ? "✅ Barcode Found" : "🔍 Waiting for barcode..."}
        </h3>

        <h2
          style={{
            fontFamily: "monospace",
            letterSpacing: 2,
          }}
        >
          {barcode || "--------"}
        </h2>
      </div>
    </div>
  );
}