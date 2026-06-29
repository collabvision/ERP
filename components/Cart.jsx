"use client";

export default function Cart({
  cart,
  setCart,
  generateBill,
}) {
  const increaseQty = (barcode) => {
    setCart((prev) =>
      prev.map((item) =>
        item.barcode === barcode
          ? {
              ...item,
              qty: item.qty + 1,
            }
          : item
      )
    );
  };

  const decreaseQty = (barcode) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.barcode === barcode
            ? {
                ...item,
                qty: item.qty - 1,
              }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (barcode) => {
    setCart((prev) =>
      prev.filter((item) => item.barcode !== barcode)
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.qty * item.sellingPrice,
    0
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl border">

      {/* Header */}

      <div className="p-5 border-b flex justify-between items-center">

        <h2 className="text-2xl font-bold">
          Billing Cart
        </h2>

        <span className="text-sm text-slate-500">
          {cart.length} Item(s)
        </span>

      </div>

      {/* Responsive Table */}

      <div className="overflow-x-auto">

        <table className="min-w-[900px] w-full">

          <thead className="bg-slate-100 sticky top-0">

            <tr>

              <th className="p-4 text-left">Product</th>

              <th className="p-4 text-center">
                Qty
              </th>

              <th className="p-4 text-right">
                Price
              </th>

              <th className="p-4 text-right">
                Total
              </th>

              <th className="p-4 text-center">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {cart.length === 0 && (

              <tr>

                <td
                  colSpan={5}
                  className="text-center py-12 text-slate-500"
                >
                  No Products Added
                </td>

              </tr>

            )}

            {cart.map((item, index) => (

              <tr
                key={item.barcode}
                className={`border-b hover:bg-blue-50 ${
                  index % 2 === 0
                    ? "bg-white"
                    : "bg-slate-50"
                }`}
              >

                <td className="p-4">

                  <div>

                    <div className="font-semibold">
                      {item.name}
                    </div>

                    <div className="text-xs text-slate-500 font-mono">
                      {item.barcode}
                    </div>

                  </div>

                </td>

                <td className="p-4">

                  <div className="flex justify-center items-center gap-3">

                    <button
                      onClick={() =>
                        decreaseQty(item.barcode)
                      }
                      className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200"
                    >
                      −
                    </button>

                    <span className="font-bold w-8 text-center">
                      {item.qty}
                    </span>

                    <button
                      onClick={() =>
                        increaseQty(item.barcode)
                      }
                      className="w-8 h-8 rounded-lg bg-green-100 hover:bg-green-200"
                    >
                      +
                    </button>

                  </div>

                </td>

                <td className="p-4 text-right">
                  ₹{item.sellingPrice}
                </td>

                <td className="p-4 text-right font-bold text-blue-600">
                  ₹{item.qty * item.sellingPrice}
                </td>

                <td className="p-4 text-center">

                  <button
                    onClick={() =>
                      removeItem(item.barcode)
                    }
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* Footer */}

      <div className="border-t p-6 bg-slate-50">

        <div className="flex justify-between mb-3">

          <span className="font-medium">
            Subtotal
          </span>

          <span className="font-bold">
            ₹{subtotal}
          </span>

        </div>

        <div className="flex justify-between mb-6">

          <span className="text-xl font-bold">
            Grand Total
          </span>

          <span className="text-2xl font-bold text-blue-600">
            ₹{subtotal}
          </span>

        </div>

        <div className="grid grid-cols-2 gap-4">

          <button
            onClick={() => setCart([])}
            className="rounded-xl bg-red-500 hover:bg-red-600 text-white py-3 font-semibold"
          >
            Clear Cart
          </button>

          <button
            onClick={generateBill}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold"
          >
            Generate Bill
          </button>

        </div>

      </div>

    </div>
  );
}