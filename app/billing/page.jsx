"use client";

import { useRef, useState } from "react";
import Scanner from "@/components/Scanner";
import Cart from "@/components/Cart";
import {
  addBill,
  getProductByBarcode,
  getProducts,
  saveProducts,
} from "@/lib/storage";

export default function BillingPage() {
  const inputRef = useRef(null);

  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState([]);

  const addProduct = (code = barcode) => {
    const value = code.trim();

    if (!value) return;

    const product = getProductByBarcode(value);

    if (!product) {
      alert("Product not found");
      return;
    }

    if (product.stock <= 0) {
      alert("Out of stock");
      return;
    }

    setCart((prev) => {
      const index = prev.findIndex(
        (item) => item.barcode === value
      );

      if (index !== -1) {
        const updated = [...prev];

        updated[index].qty++;

        return updated;
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

    inputRef.current?.focus();
  };

  const generateBill = () => {
    if (!cart.length) {
      alert("Cart is empty.");
      return;
    }

    const total = cart.reduce(
      (sum, item) => sum + item.qty * item.sellingPrice,
      0
    );

    addBill({
      id: Date.now(),
      date: new Date().toLocaleString(),
      items: cart,
      total,
    });

    const products = getProducts();

    const updated = products.map((product) => {
      const item = cart.find(
        (cartItem) =>
          cartItem.barcode === product.barcode
      );

      if (!item) return product;

      return {
        ...product,
        stock: product.stock - item.qty,
      };
    });

    saveProducts(updated);

    alert("Bill Generated");

    setCart([]);
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          Billing
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Scanner */}

          <div className="space-y-5">

            <Scanner
              continuous
              onDetected={addProduct}
            />

            <div className="bg-white rounded-2xl border shadow p-5">

              <h2 className="font-semibold mb-3">
                Manual Barcode
              </h2>

              <div className="flex gap-2">

                <input
                  ref={inputRef}
                  value={barcode}
                  onChange={(e) =>
                    setBarcode(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addProduct();
                    }
                  }}
                  placeholder="Enter Barcode"
                  className="flex-1 border rounded-xl p-3"
                />

                <button
                  onClick={() => addProduct()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl"
                >
                  Add
                </button>

              </div>

            </div>

          </div>

          {/* Cart */}

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