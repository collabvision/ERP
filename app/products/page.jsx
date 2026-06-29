"use client";

import { useState } from "react";
import ProductForm from "@/components/ProductForm";
import ProductTable from "@/components/ProductTable";

export default function ProductsPage() {
  const [refresh, setRefresh] = useState(0);

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Product Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Add, edit and manage your inventory.
            </p>
          </div>

          <div className="rounded-xl border bg-white px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Module
            </p>
            <p className="font-semibold">Inventory</p>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Product Form */}
          <div className="xl:col-span-4">
            <div className="sticky top-6">
              <ProductForm onSaved={() => setRefresh((prev) => prev + 1)} />
            </div>
          </div>

          {/* Product Table */}
          <div className="xl:col-span-8">
            <ProductTable refresh={refresh} />
          </div>
        </div>
      </div>
    </main>
  );
}
