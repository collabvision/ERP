"use client";

import { useState } from "react";
import { useZxing } from "react-zxing";

export default function BarcodeScanner() {
  const [barcodeList, setBarcodeList] = useState([]);
  const [borderColor, setBorderColor] = useState("#FFD700");

  const onResult = (result) => {
    if (!result) return;

    const code = result.getText();

    // Prevent duplicate scan
    if (barcodeList.some((item) => item.barcode === code)) return;

    setBorderColor("#22c55e");

    setTimeout(() => {
      setBorderColor("#FFD700");
    }, 1000);

    setBarcodeList((prev) => [
      ...prev,
      {
        id: Date.now(),
        barcode: code,
      },
    ]);

    if (navigator.vibrate) {
      navigator.vibrate(150);
    }
  };

  const { ref } = useZxing({
    onDecodeResult: onResult,
    paused: false,
  });

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "30px auto",
        textAlign: "center",
      }}
    >
      <h2>Barcode Scanner</h2>

      <video
        ref={ref}
        style={{
          width: "100%",
          border: `6px solid ${borderColor}`,
          borderRadius: 15,
          transition: "0.3s",
        }}
      />

      <h3 style={{ marginTop: 20 }}>Scanned Barcodes</h3>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 15,
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                border: "1px solid #ddd",
                padding: 10,
              }}
            >
              #
            </th>

            <th
              style={{
                border: "1px solid #ddd",
                padding: 10,
              }}
            >
              Barcode
            </th>
          </tr>
        </thead>

        <tbody>
          {barcodeList.map((item, index) => (
            <tr key={item.id}>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: 10,
                }}
              >
                {index + 1}
              </td>

              <td
                style={{
                  border: "1px solid #ddd",
                  padding: 10,
                  fontFamily: "monospace",
                }}
              >
                {item.barcode}
              </td>
            </tr>
          ))}

          {barcodeList.length === 0 && (
            <tr>
              <td
                colSpan={2}
                style={{
                  padding: 20,
                }}
              >
                No Barcode Scanned
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <button
        onClick={() => setBarcodeList([])}
        style={{
          marginTop: 20,
          padding: "12px 25px",
          background: "#ef4444",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          cursor: "pointer",
        }}
      >
        Clear List
      </button>
    </div>
  );
}