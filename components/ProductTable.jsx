"use client";

import { useEffect, useMemo, useState } from "react";
import { getProducts, updateProduct, deleteProduct } from "@/lib/storage";

export default function ProductTable({ refresh }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const [editing, setEditing] = useState(null);

  const loadProducts = () => {
    setProducts(getProducts());
  };

  useEffect(() => {
    loadProducts();
  }, [refresh]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const value = search.toLowerCase();

      return (
        p.name.toLowerCase().includes(value) ||
        p.barcode.includes(value) ||
        p.brand.toLowerCase().includes(value) ||
        p.category.toLowerCase().includes(value)
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
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>

        <input
          placeholder="Search..."
          className="border rounded-xl px-4 py-2 w-72"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-auto">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">Barcode</th>

              <th>Name</th>

              <th>Brand</th>

              <th>Category</th>

              <th>Stock</th>

              <th>Price</th>

              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b hover:bg-slate-50">
                <td className="p-3 font-mono">{item.barcode}</td>

                <td>
                  {editing?.id === item.id ? (
                    <input
                      className="border rounded px-2"
                      value={editing.name}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          name: e.target.value,
                        })
                      }
                    />
                  ) : (
                    item.name
                  )}
                </td>

                <td>{item.brand}</td>

                <td>{item.category}</td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.stock <= item.lowStock
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.stock}
                  </span>
                </td>

                <td>₹{item.sellingPrice}</td>

                <td>
                  <div className="flex gap-2">
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

            {!filtered.length && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-500">
                  No Products Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
