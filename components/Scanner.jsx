"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function Scanner({
  onDetected,
  continuous = false,
}) {
  const scannerRef = useRef(null);

  const runningRef = useRef(false);

  const lastBarcode = useRef("");

  const lastScan = useRef(0);

  const [border, setBorder] = useState("border-yellow-400");

  useEffect(() => {
    let cancelled = false;

    const startScanner = async () => {
      const reader = document.getElementById("reader");

      if (!reader) return;

      reader.innerHTML = "";

      const scanner = new Html5Qrcode("reader");

      scannerRef.current = scanner;

      try {
        await scanner.start(
          {
            facingMode: "environment",
          },
          {
            fps: 15,

            qrbox: {
              width: 260,
              height: 120,
            },
          },

          async (decodedText) => {
            const now = Date.now();

            if (
              decodedText === lastBarcode.current &&
              now - lastScan.current < 1000
            ) {
              return;
            }

            lastBarcode.current = decodedText;

            lastScan.current = now;

            setBorder("border-green-500");

            navigator.vibrate?.(80);

            onDetected(decodedText);

            setTimeout(() => {
              if (!cancelled) {
                setBorder("border-yellow-400");
              }
            }, 250);

            if (!continuous) {
              runningRef.current = false;

              try {
                await scanner.stop();
              } catch {}

              try {
                await scanner.clear();
              } catch {}
            }
          },

          () => {}
        );

        runningRef.current = true;
      } catch (err) {
        console.error(err);
      }
    };

    startScanner();

    return () => {
      cancelled = true;

      const scanner = scannerRef.current;

      if (!scanner) return;

      if (!runningRef.current) return;

      runningRef.current = false;

      scanner
        .stop()
        .catch(() => {})
        .finally(() => {
          scanner.clear().catch(() => {});
        });
    };
  }, []);

  return (
    <div
      className={`rounded-2xl border-4 ${border} overflow-hidden transition-all duration-300`}
    >
      <div
        id="reader"
        style={{
          width: "100%",
          minHeight: "320px",
        }}
      />
    </div>
  );
}