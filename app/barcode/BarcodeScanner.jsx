"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [barcodes, setBarcodes] = useState([]);

  const reader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    let stream;

    async function startCamera() {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
      });

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }

    startCamera();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const captureAndScan = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0);

    try {
      const result = await reader.current.decodeFromCanvas(canvas);

      const code = result.getText();

      setBarcodes((prev) => {
        if (prev.find((b) => b.barcode === code)) return prev;

        return [
          ...prev,
          {
            id: Date.now(),
            barcode: code,
          },
        ];
      });
    } catch (err) {
      alert("Barcode not found");
    }
  };

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "30px auto",
      }}
    >
      <h2>Barcode Scanner</h2>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: "100%",
          border: "4px solid orange",
          borderRadius: 12,
        }}
      />

      <canvas
        ref={canvasRef}
        style={{
          display: "none",
        }}
      />

      <button
        onClick={captureAndScan}
        style={{
          width: "100%",
          marginTop: 20,
          padding: 15,
          fontSize: 18,
          cursor: "pointer",
        }}
      >
        📸 Capture & Scan
      </button>

      <h3 style={{ marginTop: 30 }}>
        Scanned Barcodes
      </h3>

      <table
        border="1"
        cellPadding="10"
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th>#</th>
            <th>Barcode</th>
          </tr>
        </thead>

        <tbody>
          {barcodes.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.barcode}</td>
            </tr>
          ))}

          {barcodes.length === 0 && (
            <tr>
              <td colSpan="2" align="center">
                No Barcode Scanned
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}