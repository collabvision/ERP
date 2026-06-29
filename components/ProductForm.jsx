"use client";

import { useState } from "react";
import Scanner from "./Scanner";
import { getProducts, addProduct } from "@/lib/storage";

const initialState = {
  barcode: "",
  name: "",
  category: "",
  brand: "",
  unit: "PCS",
  purchasePrice: "",
  sellingPrice: "",
  stock: "",
  lowStock: "",
  gst: "18",
};

export default function ProductForm({ onSaved }) {
  const [product, setProduct] = useState(initialState);
  const [showScanner, setShowScanner] = useState(false);

  const changeHandler = (e) => {
    setProduct((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const save = () => {
    if (!product.barcode.trim())
      return alert("Enter barcode.");

    if (!product.name.trim())
      return alert("Enter product name.");

    const products = getProducts();

    if (
      products.some(
        (p) => p.barcode === product.barcode
      )
    ) {
      return alert("Barcode already exists.");
    }

    addProduct({
      id: Date.now(),
      ...product,
      purchasePrice: Number(product.purchasePrice),
      sellingPrice: Number(product.sellingPrice),
      stock: Number(product.stock),
      lowStock: Number(product.lowStock),
      gst: Number(product.gst),
      createdAt: new Date().toISOString(),
    });

    setProduct(initialState);

    onSaved?.();

    alert("Product Added");
  };

 return (
  <div className="rounded-2xl border bg-white shadow-lg">

    {/* Header */}
    <div className="border-b p-5">
      <h2 className="text-2xl font-bold">Add Product</h2>
      <p className="mt-1 text-sm text-slate-500">
        Enter product details or scan the barcode.
      </p>
    </div>

    <div className="p-5 space-y-5">

      {/* Barcode */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Barcode
        </label>

        <div className="flex flex-col sm:flex-row gap-3">

          <input
            name="barcode"
            value={product.barcode}
            onChange={changeHandler}
            placeholder="Scan or Enter Barcode"
            className="flex-1 rounded-xl border px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          />

          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="rounded-xl bg-amber-500 px-5 py-3 text-white hover:bg-amber-600 transition"
          >
            📷 Scan
          </button>

        </div>
      </div>

      {/* Scanner */}

      {showScanner && (
        <div className="rounded-2xl border bg-slate-50 p-4">

          <Scanner
            onDetected={(barcode) => {
              setProduct((prev) => ({
                ...prev,
                barcode,
              }));

              setShowScanner(false);
            }}
          />

          <button
            onClick={() => setShowScanner(false)}
            className="mt-4 w-full rounded-xl bg-red-500 py-3 text-white hover:bg-red-600"
          >
            Close Scanner
          </button>

        </div>
      )}

      {/* Product Name */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Product Name
        </label>

        <input
          name="name"
          value={product.name}
          onChange={changeHandler}
          placeholder="Enter Product Name"
          className="w-full rounded-xl border px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        />
      </div>

      {/* Category & Brand */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <label className="mb-2 block text-sm font-medium">
            Category
          </label>

          <input
            name="category"
            value={product.category}
            onChange={changeHandler}
            placeholder="Category"
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Brand
          </label>

          <input
            name="brand"
            value={product.brand}
            onChange={changeHandler}
            placeholder="Brand"
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

      </div>

      {/* Prices */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <label className="mb-2 block text-sm font-medium">
            Purchase Price
          </label>

          <input
            type="number"
            name="purchasePrice"
            value={product.purchasePrice}
            onChange={changeHandler}
            placeholder="Purchase Price"
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Selling Price
          </label>

          <input
            type="number"
            name="sellingPrice"
            value={product.sellingPrice}
            onChange={changeHandler}
            placeholder="Selling Price"
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

      </div>

      {/* Stock */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <label className="mb-2 block text-sm font-medium">
            Opening Stock
          </label>

          <input
            type="number"
            name="stock"
            value={product.stock}
            onChange={changeHandler}
            placeholder="Opening Stock"
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Low Stock Alert
          </label>

          <input
            type="number"
            name="lowStock"
            value={product.lowStock}
            onChange={changeHandler}
            placeholder="Low Stock"
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

      </div>

      {/* Unit & GST */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <label className="mb-2 block text-sm font-medium">
            Unit
          </label>

          <select
            name="unit"
            value={product.unit}
            onChange={changeHandler}
            className="w-full rounded-xl border px-4 py-3"
          >
            <option>PCS</option>
            <option>BOX</option>
            <option>PACK</option>
            <option>KG</option>
            <option>GM</option>
            <option>LTR</option>
            <option>ML</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            GST
          </label>

          <select
            name="gst"
            value={product.gst}
            onChange={changeHandler}
            className="w-full rounded-xl border px-4 py-3"
          >
            <option value="0">0%</option>
            <option value="5">5%</option>
            <option value="12">12%</option>
            <option value="18">18%</option>
            <option value="28">28%</option>
          </select>
        </div>

      </div>

    </div>

    {/* Footer */}

    <div className="sticky bottom-0 border-t bg-white p-5">

      <button
        onClick={save}
        className="w-full rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white transition hover:bg-blue-700"
      >
        Save Product
      </button>

    </div>

  </div>
);
}