"use client";

import { useEffect, useMemo, useState } from "react";
import { deleteProduct, getProducts, updateProduct } from "@/lib/storage";

export default function ProductTable({ refresh }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    loadProducts();
  }, [refresh]);

  const loadProducts = () => {
    setProducts(getProducts());
  };

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const value = search.toLowerCase();

      return (
        item.name.toLowerCase().includes(value) ||
        item.barcode.includes(value) ||
        item.brand.toLowerCase().includes(value) ||
        item.category.toLowerCase().includes(value)
      );
    });
  }, [products, search]);

  const saveEdit = () => {
    updateProduct(editing);
    loadProducts();
    setEditing(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border">
      {/* Header */}

      <div className="p-5 border-b flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <h2 className="text-2xl font-bold">Products</h2>

        <input
          placeholder="Search Product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-xl px-4 py-2 w-full md:w-80"
        />
      </div>

      {/* Table */}

      <div className="overflow-x-auto">
        <table className="min-w-[1200px] w-full">
          <thead className="sticky top-0 bg-slate-100">
            <tr className="text-sm">
              <th className="text-left p-4">Barcode</th>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">Brand</th>
              <th className="text-center p-4">Unit</th>
              <th className="text-right p-4">Purchase</th>
              <th className="text-right p-4">Selling</th>
              <th className="text-center p-4">GST</th>
              <th className="text-center p-4">Stock</th>
              <th className="text-center p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-10 text-slate-500">
                  No Products Found
                </td>
              </tr>
            )}

            {filteredProducts.map((item, index) => (
              <tr
                key={item.id}
                className={`border-b hover:bg-blue-50 ${
                  index % 2 === 0 ? "bg-white" : "bg-slate-50"
                }`}
              >
                <td className="p-4 font-mono whitespace-nowrap">
                  {item.barcode}
                </td>

                <td className="p-4">
                  {editing?.id === item.id ? (
                    <input
                      value={editing.name}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          name: e.target.value,
                        })
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    item.name
                  )}
                </td>

                <td className="p-4">{item.category}</td>

                <td className="p-4">{item.brand}</td>

                <td className="p-4 text-center">{item.unit}</td>

                <td className="p-4 text-right">₹{item.purchasePrice}</td>

                <td className="p-4 text-right font-semibold">
                  ₹{item.sellingPrice}
                </td>

                <td className="p-4 text-center">{item.gst}%</td>

                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.stock <= item.lowStock
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.stock}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    {editing?.id === item.id ? (
                      <button
                        onClick={saveEdit}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditing(item)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg"
                      >
                        Edit
                      </button>
                    )}

                    <button
                      onClick={() => {
                        deleteProduct(item.id);
                        loadProducts();
                      }}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
