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
import { Toaster } from "react-hot-toast";

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
           <Toaster
    position="top-right"
    toastOptions={{
      duration: 1500,
    }}
  />
  <main className="min-h-screen bg-slate-100">
    <div className="mx-auto w-full max-w-[1700px] px-3 py-4 sm:px-5 lg:px-6">

      {/* Header */}

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl xl:text-4xl">
            Billing
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Scan products and generate invoices
          </p>

        </div>

        <div className="rounded-xl border bg-white px-5 py-3 shadow-sm">

          <div className="text-xs uppercase tracking-wider text-slate-500">
            POS
          </div>

          <div className="font-semibold">
            Billing Counter
          </div>

        </div>

      </div>

      {/* Content */}

      <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">

        {/* LEFT */}

        <aside className="space-y-5">

          <div className="xl:sticky xl:top-5 space-y-5">

            {/* Scanner */}

            <section className="overflow-hidden rounded-2xl border bg-white shadow">

              <div className="border-b px-5 py-4">

                <h2 className="text-lg font-bold">
                  Live Scanner
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Camera remains active during billing
                </p>

              </div>

              <div className="p-4">

                <Scanner
                  continuous
                  onDetected={(barcode) =>
                    addProduct(barcode, true)
                  }
                />

              </div>

            </section>

            {/* Manual Barcode */}

            <section className="overflow-hidden rounded-2xl border bg-white shadow">

              <div className="border-b px-5 py-4">

                <h2 className="font-semibold">
                  Manual Barcode
                </h2>

              </div>

              <div className="space-y-3 p-5">

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
                  className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                />

                <button
                  onClick={() => addProduct()}
                  className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Add Product
                </button>

              </div>

            </section>

          </div>

        </aside>

        {/* RIGHT */}

        <section className="min-w-0">

          <Cart
            cart={cart}
            setCart={setCart}
            generateBill={generateBill}
          />

        </section>

      </div>

    </div>
  </main>

    </>
  );
}
