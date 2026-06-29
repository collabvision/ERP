"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Package, ShoppingCart } from "lucide-react";
import { useState } from "react";

const menus = [
  {
    name: "Products",
    href: "/products",
    icon: Package,
  },
  {
    name: "Billing",
    href: "/billing",
    icon: ShoppingCart,
  },
];

export default function Navbar() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">

        <Link
          href="/"
          className="text-2xl font-bold text-blue-600"
        >
        Software 2
        </Link>

        {/* Desktop */}

        <nav className="hidden md:flex items-center gap-2">

          {menus.map((menu) => {
            const Icon = menu.icon;

            const active = pathname === menu.href;

            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 transition
                ${
                  active
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-100"
                }`}
              >
                <Icon size={18} />

                {menu.name}
              </Link>
            );
          })}

        </nav>

        {/* Mobile */}

        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg border p-2 md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

      </div>

      {/* Mobile Menu */}

      {open && (
        <div className="border-t bg-white md:hidden">

          <nav className="flex flex-col p-3">

            {menus.map((menu) => {
              const Icon = menu.icon;

              const active = pathname === menu.href;

              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  onClick={() => setOpen(false)}
                  className={`mb-2 flex items-center gap-3 rounded-xl px-4 py-3
                  ${
                    active
                      ? "bg-blue-600 text-white"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <Icon size={18} />

                  {menu.name}
                </Link>
              );
            })}

          </nav>

        </div>
      )}
    </header>
  );
}