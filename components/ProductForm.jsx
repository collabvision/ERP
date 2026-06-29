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
    <div className="rounded-2xl border bg-white shadow-xl p-6 space-y-5">

      <h2 className="text-2xl font-bold">
        Add Product
      </h2>

      {/* Barcode */}

      <div>

        <label className="block mb-2 font-medium">
          Barcode
        </label>

        <div className="flex gap-2">

          <input
            name="barcode"
            value={product.barcode}
            onChange={changeHandler}
            placeholder="Scan or Enter Barcode"
            className="flex-1 border rounded-xl p-3"
          />

          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-5 rounded-xl"
          >
            📷
          </button>

        </div>

      </div>

      {/* Scanner */}

      {showScanner && (
        <div className="border rounded-2xl p-4 bg-slate-50">

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
            className="mt-4 w-full rounded-xl bg-red-500 py-2 text-white"
          >
            Close Scanner
          </button>

        </div>
      )}

      <input
        name="name"
        value={product.name}
        onChange={changeHandler}
        placeholder="Product Name"
        className="w-full border rounded-xl p-3"
      />

      <div className="grid grid-cols-2 gap-4">

        <input
          name="category"
          value={product.category}
          onChange={changeHandler}
          placeholder="Category"
          className="border rounded-xl p-3"
        />

        <input
          name="brand"
          value={product.brand}
          onChange={changeHandler}
          placeholder="Brand"
          className="border rounded-xl p-3"
        />

      </div>

      <div className="grid grid-cols-2 gap-4">

        <input
          type="number"
          name="purchasePrice"
          value={product.purchasePrice}
          onChange={changeHandler}
          placeholder="Purchase Price"
          className="border rounded-xl p-3"
        />

        <input
          type="number"
          name="sellingPrice"
          value={product.sellingPrice}
          onChange={changeHandler}
          placeholder="Selling Price"
          className="border rounded-xl p-3"
        />

      </div>

      <div className="grid grid-cols-2 gap-4">

        <input
          type="number"
          name="stock"
          value={product.stock}
          onChange={changeHandler}
          placeholder="Opening Stock"
          className="border rounded-xl p-3"
        />

        <input
          type="number"
          name="lowStock"
          value={product.lowStock}
          onChange={changeHandler}
          placeholder="Low Stock Alert"
          className="border rounded-xl p-3"
        />

      </div>

      <div className="grid grid-cols-2 gap-4">

        <select
          name="unit"
          value={product.unit}
          onChange={changeHandler}
          className="border rounded-xl p-3"
        >
          <option>PCS</option>
          <option>BOX</option>
          <option>PACK</option>
          <option>KG</option>
          <option>GM</option>
          <option>LTR</option>
          <option>ML</option>
        </select>

        <select
          name="gst"
          value={product.gst}
          onChange={changeHandler}
          className="border rounded-xl p-3"
        >
          <option value="0">0%</option>
          <option value="5">5%</option>
          <option value="12">12%</option>
          <option value="18">18%</option>
          <option value="28">28%</option>
        </select>

      </div>

      <button
        onClick={save}
        className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
      >
        Save Product
      </button>

    </div>
  );
}