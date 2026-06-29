export const PRODUCT_KEY = "products";
export const BILL_KEY = "bills";

/* ---------------- Products ---------------- */

export const getProducts = () => {
  if (typeof window === "undefined") return [];

  return JSON.parse(localStorage.getItem(PRODUCT_KEY) || "[]");
};

export const saveProducts = (products) => {
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
};

export const addProduct = (product) => {
  const products = getProducts();

  products.push(product);

  saveProducts(products);
};

export const updateProduct = (updatedProduct) => {
  const products = getProducts().map((product) =>
    product.id === updatedProduct.id ? updatedProduct : product
  );

  saveProducts(products);
};

export const deleteProduct = (id) => {
  const products = getProducts().filter(
    (product) => product.id !== id
  );

  saveProducts(products);
};

export const getProductByBarcode = (barcode) => {
  return getProducts().find(
    (product) => product.barcode === barcode
  );
};

/* ---------------- Bills ---------------- */

export const getBills = () => {
  if (typeof window === "undefined") return [];

  return JSON.parse(localStorage.getItem(BILL_KEY) || "[]");
};

export const saveBills = (bills) => {
  localStorage.setItem(BILL_KEY, JSON.stringify(bills));
};

export const addBill = (bill) => {
  const bills = getBills();

  bills.unshift(bill);

  saveBills(bills);
};