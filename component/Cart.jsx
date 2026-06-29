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
      prev.filter(
        (item) => item.barcode !== barcode
      )
    );
  };

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + item.qty * item.sellingPrice,
    0
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl border">

      <div className="p-5 border-b">

        <h2 className="text-2xl font-bold">
          Cart
        </h2>

      </div>

      <div className="divide-y">

        {cart.length === 0 && (

          <div className="p-10 text-center text-slate-500">

            No Products Added

          </div>

        )}

        {cart.map((item) => (

          <div
            key={item.barcode}
            className="flex justify-between items-center p-5"
          >

            <div>

              <h3 className="font-semibold">

                {item.name}

              </h3>

              <p className="text-sm text-slate-500">

                {item.barcode}

              </p>

            </div>

            <div className="flex items-center gap-3">

              <button
                onClick={() =>
                  decreaseQty(item.barcode)
                }
                className="w-8 h-8 rounded bg-red-100"
              >
                -
              </button>

              <span className="font-bold">

                {item.qty}

              </span>

              <button
                onClick={() =>
                  increaseQty(item.barcode)
                }
                className="w-8 h-8 rounded bg-green-100"
              >
                +
              </button>

            </div>

            <div>

              ₹{item.sellingPrice}

            </div>

            <div className="font-bold">

              ₹
              {item.qty *
                item.sellingPrice}

            </div>

            <button
              onClick={() =>
                removeItem(item.barcode)
              }
              className="text-red-500"
            >
              Delete
            </button>

          </div>

        ))}

      </div>

      <div className="border-t p-5">

        <div className="flex justify-between mb-3">

          <span>Total</span>

          <span className="font-bold">

            ₹{subtotal}

          </span>

        </div>

        <div className="grid grid-cols-2 gap-3">

          <button
            onClick={() => setCart([])}
            className="bg-red-500 text-white rounded-xl py-3"
          >
            Clear Cart
          </button>

          <button
            onClick={generateBill}
            className="bg-blue-600 text-white rounded-xl py-3"
          >
            Generate Bill
          </button>

        </div>

      </div>

    </div>
  );
}