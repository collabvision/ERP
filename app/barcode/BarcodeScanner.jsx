"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function BarcodeScanner() {
  const scannerRef = useRef(null);

  const [borderColor, setBorderColor] = useState("#facc15");
  const [products, setProducts] = useState([]);

  const fetchProduct = async (barcode) => {
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}`
      );

      const data = await res.json();

      if (data.status === 1) {
        const p = data.product;

        return {
          barcode,
          name: p.product_name || "Unknown Product",
          brand: p.brands || "-",
          quantity: p.quantity || "-",
          image: p.image_front_small_url || "",
        };
      }

      return {
        barcode,
        name: "Product Not Found",
        brand: "-",
        quantity: "-",
        image: "",
      };
    } catch {
      return {
        barcode,
        name: "API Error",
        brand: "-",
        quantity: "-",
        image: "",
      };
    }
  };

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
        async (decodedText) => {
          if (products.some((p) => p.barcode === decodedText)) return;

          setBorderColor("#22c55e");

          if (navigator.vibrate) {
            navigator.vibrate(100);
          }

          const product = await fetchProduct(decodedText);

          setProducts((prev) => [...prev, product]);

          setTimeout(() => {
            setBorderColor("#facc15");
          }, 800);
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
  }, [products]);

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "30px auto",
      }}
    >
      <h2>Barcode Scanner</h2>

      <div
        style={{
          border: `5px solid ${borderColor}`,
          borderRadius: 15,
          overflow: "hidden",
        }}
      >
        <div id="reader"></div>
      </div>

      <h2 style={{ marginTop: 25 }}>
        Products
      </h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 20,
        }}
      >
        <thead>
          <tr>
            <th>#</th>
            <th>Image</th>
            <th>Barcode</th>
            <th>Name</th>
            <th>Brand</th>
            <th>Qty</th>
          </tr>
        </thead>

        <tbody>
          {products.map((item, index) => (
            <tr key={item.barcode}>
              <td>{index + 1}</td>

              <td>
                {item.image ? (
                  <img
                    src={item.image}
                    width="50"
                    height="50"
                    alt={item.name}
                  />
                ) : (
                  "-"
                )}
              </td>

              <td>{item.barcode}</td>

              <td>{item.name}</td>

              <td>{item.brand}</td>

              <td>{item.quantity}</td>
            </tr>
          ))}

          {products.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: 20 }}>
                Scan a barcode...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}