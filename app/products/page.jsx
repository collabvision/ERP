"use client";

import { useState } from "react";
import ProductForm from "@/component/ProductForm";
import ProductTable from "@/component/ProductTable";

export default function ProductsPage() {
  const [refresh, setRefresh] = useState(0);

  return (
    <main className="min-h-screen bg-slate-100 p-8">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Product Management
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left */}

          <div className="lg:col-span-1">

            <ProductForm
              onSaved={() => setRefresh((prev) => prev + 1)}
            />

          </div>

          {/* Right */}

          <div className="lg:col-span-2">

            <ProductTable refresh={refresh} />

          </div>

        </div>

      </div>

    </main>
  );
}