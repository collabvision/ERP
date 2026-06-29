"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function Scanner({ onDetected }) {
  const scannerRef = useRef(null);
  const stoppedRef = useRef(false);

  const [borderColor, setBorderColor] = useState("border-yellow-400");

  useEffect(() => {
    let scanner;

    const startScanner = async () => {
      scanner = new Html5Qrcode("reader");

      scannerRef.current = scanner;

      stoppedRef.current = false;

      try {
        await scanner.start(
          {
            facingMode: "environment",
          },
          {
            fps: 12,
            qrbox: {
              width: 250,
              height: 120,
            },
          },
          async (decodedText) => {
            if (stoppedRef.current) return;

            stoppedRef.current = true;

            setBorderColor("border-green-500");

            if (navigator.vibrate) {
              navigator.vibrate(100);
            }

            try {
              await scanner.stop();
            } catch {}

            try {
              await scanner.clear();
            } catch {}

            onDetected(decodedText);
          },
          () => {},
        );
      } catch (err) {
        console.error(err);
      }
    };

    startScanner();

    return () => {
      stoppedRef.current = true;

      if (scannerRef.current?.isScanning) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current?.clear().catch(() => {});
          });
      }
    };
  }, []);

  return (
    <div
      className={`border-4 ${borderColor} rounded-2xl overflow-hidden transition-all`}
    >
      <div id="reader" />
    </div>
  );
}
