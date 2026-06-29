"use client";

import { useState } from "react";
import Scanner from "@/component/Scanner";
import Cart from "@/component/Cart";

import {
  getProductByBarcode,
  getProducts,
  saveProducts,
  addBill,
} from "@/lib/storage";

export default function BillingPage() {
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState([]);
  const [showScanner, setShowScanner] = useState(false);

  function addToCart(code) {
    const scanCode = code || barcode;

    if (!scanCode.trim()) return;

    const product = getProductByBarcode(scanCode);

    if (!product) {
      alert("Product not found.");
      return;
    }

    if (product.stock <= 0) {
      alert("Out of Stock");
      return;
    }

    setCart((prev) => {
      const exists = prev.find(
        (item) => item.barcode === scanCode
      );

      if (exists) {
        return prev.map((item) =>
          item.barcode === scanCode
            ? {
                ...item,
                qty: item.qty + 1,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          qty: 1,
        },
      ];
    });

    setBarcode("");
  }

  function generateBill() {
    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }

    const total = cart.reduce(
      (sum, item) =>
        sum + item.qty * item.sellingPrice,
      0
    );

    addBill({
      id: Date.now(),
      date: new Date().toLocaleString(),
      items: cart,
      total,
    });

    const products = getProducts();

    const updatedProducts = products.map((product) => {
      const cartItem = cart.find(
        (item) => item.barcode === product.barcode
      );

      if (!cartItem) return product;

      return {
        ...product,
        stock: product.stock - cartItem.qty,
      };
    });

    saveProducts(updatedProducts);

    alert("Bill Generated");

    setCart([]);
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Billing
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT */}

          <div className="space-y-6">

            <div className="bg-white rounded-2xl shadow-xl border p-6">

              <h2 className="text-xl font-bold mb-5">
                Scan Product
              </h2>

              <div className="flex gap-3">

                <input
                  value={barcode}
                  onChange={(e) =>
                    setBarcode(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addToCart();
                    }
                  }}
                  placeholder="Scan or Enter Barcode"
                  className="flex-1 border rounded-xl p-3"
                />

                <button
                  onClick={() => setShowScanner(true)}
                  className="bg-amber-500 text-white rounded-xl px-4"
                >
                  📷
                </button>

              </div>

              <button
                onClick={() => addToCart()}
                className="mt-4 w-full bg-blue-600 text-white rounded-xl py-3"
              >
                Add Product
              </button>

            </div>

            {showScanner && (

              <div className="bg-white rounded-2xl border p-5">

                <Scanner
                  onDetected={(barcode) => {
                    setBarcode(barcode);

                    addToCart(barcode);

                    setShowScanner(false);
                  }}
                />

                <button
                  onClick={() =>
                    setShowScanner(false)
                  }
                  className="mt-4 w-full bg-red-500 text-white rounded-xl py-2"
                >
                  Close Scanner
                </button>

              </div>

            )}

          </div>

          {/* RIGHT */}

          <div className="lg:col-span-2">

            <Cart
              cart={cart}
              setCart={setCart}
              generateBill={generateBill}
            />

          </div>

        </div>

      </div>

    </main>
  );
}