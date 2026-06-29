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
import Navbar from "../../components/Navbar";

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
      const index = prev.findIndex((item) => item.barcode === value);

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
      0,
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
        (cartItem) => cartItem.barcode === product.barcode,
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
    <>
      {" "}
      <Navbar />
      <main className="min-h-screen bg-slate-100">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                Billing
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Scan products and generate customer bills.
              </p>
            </div>

            <div className="rounded-xl border bg-white px-4 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                POS
              </p>

              <p className="font-semibold">Billing Counter</p>
            </div>
          </div>

          {/* Layout */}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            {/* Left */}

            <div className="space-y-6 xl:col-span-4">
              <div className="sticky top-6 space-y-6">
                {/* Scanner */}

                <div className="rounded-2xl border bg-white shadow-lg">
                  <div className="border-b p-5">
                    <h2 className="text-xl font-bold">Live Scanner</h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Scan barcode using your camera
                    </p>
                  </div>

                  <div className="p-4">
                    <Scanner continuous onDetected={addProduct} />
                  </div>
                </div>

                {/* Manual Barcode */}

                <div className="rounded-2xl border bg-white shadow-lg">
                  <div className="border-b p-5">
                    <h2 className="text-lg font-semibold">Manual Barcode</h2>
                  </div>

                  <div className="p-5">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        ref={inputRef}
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            addProduct();
                          }
                        }}
                        placeholder="Enter Barcode"
                        className="flex-1 rounded-xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />

                      <button
                        onClick={addProduct}
                        className="rounded-xl bg-blue-600 px-8 py-3 font-medium text-white transition hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right */}

            <div className="xl:col-span-8">
              <Cart cart={cart} setCart={setCart} generateBill={generateBill} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
