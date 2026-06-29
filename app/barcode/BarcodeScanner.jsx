"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function BarcodeScanner() {
  const scannerRef = useRef(null);

  const [barcodes, setBarcodes] = useState([]);
  const [borderColor, setBorderColor] = useState("#facc15");

  useEffect(() => {
    const scanner = new Html5Qrcode("reader");

    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: {
            width: 250,
            height: 120,
          },
        },
        (decodedText) => {
          setBorderColor("#22c55e");

          setTimeout(() => {
            setBorderColor("#facc15");
          }, 800);

          setBarcodes((prev) => {
            if (prev.some((x) => x.barcode === decodedText)) return prev;

            return [
              ...prev,
              {
                id: Date.now(),
                barcode: decodedText,
              },
            ];
          });

          if (navigator.vibrate) {
            navigator.vibrate(100);
          }
        },
        () => {}
      )
      .catch(console.error);

    return () => {
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {});
    };
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: "30px auto" }}>
      <div
        style={{
          border: `5px solid ${borderColor}`,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div id="reader" />
      </div>

      <h3 style={{ marginTop: 20 }}>Scanned Barcodes</h3>

      <table
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
              <td colSpan={2}>No Barcode Scanned</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}