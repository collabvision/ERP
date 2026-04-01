import "./globals.css";

export const metadata = {
  title: "ERP_Lite Pro Systems - Point of Sale Terminal",
  description: "ERP Lite Point of Sale and Inventory Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
