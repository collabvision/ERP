"use client";

import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Home() {
  const [view, setView] = useState('billing'); // 'billing', 'inventory', 'history'
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Logitech Wireless Mouse', quantity: 50, price: 1059.32, hsn: '8471', taxRate: 18 },
    { id: 2, name: 'Mechanical Keyboard RGB', quantity: 30, price: 3813.56, hsn: '8471', taxRate: 18 },
    { id: 3, name: 'Dell 24" IPS Monitor', quantity: 15, price: 10169.49, hsn: '8528', taxRate: 18 },
  ]);

  const [cart, setCart] = useState([]);
  const [history, setHistory] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [discount, setDiscount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState(null);

  const [modalType, setModalType] = useState(null); 
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const billingSummary = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discountAmount = (subtotal * discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    
    const totalTax = cart.reduce((sum, item) => {
        const itemTaxable = (item.price * item.qty) * (1 - discount/100);
        return sum + (itemTaxable * (item.taxRate / 100));
    }, 0);

    const cgst = totalTax / 2;
    const sgst = totalTax / 2;
    const finalTotal = taxableAmount + totalTax;

    return { subtotal, discountAmount, taxableAmount, cgst, sgst, finalTotal };
  }, [cart, discount]);

  const handleSaveItem = () => {
    if (!editingItem.name || editingItem.price <= 0) {
        setError("Invalid Product Details");
        return;
    }
    if (modalType === 'add_inventory') {
      setInventory([...inventory, { ...editingItem, id: Date.now() }]);
    } else {
      setInventory(inventory.map(i => i.id === editingItem.id ? editingItem : i));
    }
    closeModal();
  };

  const confirmDelete = () => {
    setInventory(inventory.filter(item => item.id !== itemToDelete.id));
    setCart(cart.filter(item => item.id !== itemToDelete.id));
    closeModal();
  };

  const closeModal = () => {
    setModalType(null);
    setEditingItem(null);
    setItemToDelete(null);
  };

  const addToCart = (product) => {
    if (product.quantity <= 0) {
      setError(`${product.name} is Out of Stock!`);
      setTimeout(() => setError(null), 3000);
      return;
    }
    const existing = cart.find(item => item.id === product.id);
    if (existing) return;
    setCart([...cart, { ...product, qty: 1 }]);
    setSearchTerm('');
  };

  const handleQtyChange = (id, val) => {
    const qty = Math.max(0, parseInt(val) || 0);
    const stock = inventory.find(i => i.id === id).quantity;
    if (qty > stock) {
        setError(`Stock limit: ${stock}`);
        setTimeout(() => setError(null), 2000);
        setCart(cart.map(c => c.id === id ? {...c, qty: stock} : c));
    } else {
        setCart(cart.map(c => c.id === id ? {...c, qty} : c));
    }
  };

  const finalizeBill = () => {
    const newBill = {
      billId: `V9-INV-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleString('en-IN'),
      customer: { ...customer },
      items: [...cart],
      ...billingSummary
    };
    setInventory(inventory.map(inv => {
      const sold = cart.find(c => c.id === inv.id);
      return sold ? { ...inv, quantity: inv.quantity - sold.qty } : inv;
    }));
    setHistory([newBill, ...history]);
    setIsDone(true);
  };

  const generatePDF = (bill) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("ERP_Lite PRO SYSTEMS", 14, 20);
    doc.setFontSize(10);
    doc.text("GSTIN: 27AAAAA0000A1Z5 | Kolhapur, Maharashtra", 14, 28);
    doc.text(`Invoice: ${bill.billId} | Date: ${bill.date}`, 14, 40);
    autoTable(doc, {
      startY: 50,
      head: [['Product', 'HSN', 'Rate', 'Qty', 'Total']],
      body: bill.items.map(i => [i.name, i.hsn, i.price.toFixed(2), i.qty, (i.price * i.qty).toFixed(2)]),
      foot: [['', '', '', 'Total', `Rs. ${bill.finalTotal.toFixed(2)}`]],
    });
    doc.save(`${bill.billId}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 lg:pb-20">
      
      {error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-2xl animate-bounce text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* --- MODAL --- */}
      {modalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 lg:p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
            {(modalType === 'edit_inventory' || modalType === 'add_inventory') && (
              <div className="space-y-4">
                <h2 className="text-xl font-black uppercase text-blue-600 italic">Product Master</h2>
                <input className="w-full bg-slate-100 p-4 rounded-xl outline-none border-2 focus:border-blue-500 font-bold" placeholder="Product Name" value={editingItem?.name || ''} onChange={e => setEditingItem({...editingItem, name: e.target.value})} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input className="w-full bg-slate-100 p-4 rounded-xl outline-none border-2 focus:border-blue-500 font-bold" placeholder="HSN" value={editingItem?.hsn || ''} onChange={e => setEditingItem({...editingItem, hsn: e.target.value})} />
                    <select className="w-full bg-slate-100 p-4 rounded-xl outline-none border-2 focus:border-blue-500 font-bold" value={editingItem?.taxRate || 18} onChange={e => setEditingItem({...editingItem, taxRate: parseInt(e.target.value)})}>
                        <option value="5">5% GST</option><option value="12">12% GST</option><option value="18">18% GST</option><option value="28">28% GST</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="number" className="w-full bg-slate-100 p-4 rounded-xl outline-none border-2 focus:border-blue-500 font-bold" placeholder="Stock" value={editingItem?.quantity || 0} onChange={e => setEditingItem({...editingItem, quantity: parseInt(e.target.value) || 0})} />
                    <input type="number" className="w-full bg-slate-100 p-4 rounded-xl outline-none border-2 focus:border-blue-500 font-bold text-blue-600" placeholder="Price" value={editingItem?.price || 0} onChange={e => setEditingItem({...editingItem, price: parseFloat(e.target.value) || 0})} />
                </div>
                <button onClick={handleSaveItem} className="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg mt-2 transition hover:bg-blue-700">Save Product</button>
              </div>
            )}

            {modalType === 'confirm_delete' && (
              <div className="text-center p-4">
                <h2 className="text-xl font-black mb-2">Confirm Delete</h2>
                <p className="text-slate-500 mb-6 text-sm">Delete "{itemToDelete?.name}" permanently?</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={closeModal} className="flex-1 bg-slate-100 py-3 rounded-xl font-bold">Cancel</button>
                  <button onClick={confirmDelete} className="flex-1 bg-red-600 py-3 rounded-xl font-bold text-white">Delete</button>
                </div>
              </div>
            )}
            <button onClick={closeModal} className="w-full mt-4 text-slate-400 font-bold text-[10px] uppercase">Dismiss</button>
          </div>
        </div>
      )}

      {/* --- NAV --- */}
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm px-4 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-xl font-black text-blue-600 italic">ERP_Lite <span className="text-[8px] not-italic text-slate-400 border px-1 rounded ml-1">PRO</span></h1>
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {['billing', 'inventory', 'history'].map((v) => (
            <button key={v} onClick={() => {setView(v); setIsDone(false);}} className={`flex-1 sm:flex-none px-4 lg:px-8 py-2 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap ${view === v ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>{v}</button>
          ))}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto mt-6 lg:mt-10 px-4 lg:px-6">
        
        {/* --- BILLING VIEW --- */}
        {view === 'billing' && (
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-10">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-[2rem] border grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input className="w-full bg-slate-50 p-4 rounded-xl outline-none border focus:border-blue-400 text-sm font-bold" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} placeholder="Customer Name" />
                <input className="w-full bg-slate-50 p-4 rounded-xl outline-none border focus:border-blue-400 text-sm font-bold" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} placeholder="Mobile Number" />
              </div>

              {!isDone && (
                <div className="relative">
                  <input type="text" placeholder="Search products..." className="w-full p-4 lg:p-6 rounded-2xl border-2 outline-none focus:border-blue-600 shadow-sm text-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  {searchTerm.length >= 2 && (
                    <div className="absolute top-full left-0 right-0 bg-white border rounded-2xl shadow-2xl mt-2 z-50 overflow-hidden">
                      {inventory.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                        <button key={item.id} onClick={() => addToCart(item)} className="w-full p-4 text-left hover:bg-blue-50 flex justify-between border-b items-center">
                          <span className="font-bold text-sm">{item.name}</span>
                          <span className="text-blue-600 font-black">₹{item.price.toFixed(0)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className={`bg-white rounded-2xl border overflow-hidden ${isDone ? 'opacity-50' : ''}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b">
                        <tr className="text-[10px] font-black uppercase text-slate-400">
                        <th className="p-4">Item</th>
                        <th className="p-4">Qty</th>
                        <th className="p-4 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.map(item => (
                        <tr key={item.id} className="border-b last:border-0">
                            <td className="p-4">
                                <p className="font-bold leading-tight">{item.name}</p>
                                <p className="text-[9px] text-slate-400">₹{item.price.toFixed(2)} + {item.taxRate}%</p>
                            </td>
                            <td className="p-4">
                                <input type="number" className="w-12 border rounded p-1 text-center font-bold" value={item.qty} onChange={(e) => handleQtyChange(item.id, e.target.value)} />
                            </td>
                            <td className="p-4 text-right font-black">₹{(item.price * item.qty).toFixed(0)}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                {cart.length === 0 && <p className="p-10 text-center text-slate-300 italic">Cart is empty</p>}
              </div>
            </div>

            {/* SIDEBAR / FOOTER SUMMARY */}
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <div className="bg-slate-900 text-white p-6 lg:p-8 rounded-3xl lg:rounded-[2.5rem] shadow-xl">
                <div className="space-y-3 mb-6 text-[10px] uppercase font-bold tracking-widest">
                   <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>₹{billingSummary.subtotal.toFixed(2)}</span></div>
                   <div className="flex justify-between text-emerald-400 items-center">
                     <span>Discount %</span>
                     <input type="number" className="bg-slate-800 rounded px-2 py-1 w-12 text-right outline-none" value={discount} onChange={e => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))} />
                   </div>
                   <div className="flex justify-between text-slate-400"><span>GST (CGST+SGST)</span><span>₹{(billingSummary.cgst + billingSummary.sgst).toFixed(2)}</span></div>
                   <div className="h-px bg-white/10 my-2"></div>
                   <h2 className="text-4xl lg:text-5xl font-black text-center py-2">₹{billingSummary.finalTotal.toFixed(0)}</h2>
                </div>
                
                {!isDone ? (
                  <button onClick={finalizeBill} disabled={cart.length === 0} className="w-full bg-blue-600 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 disabled:opacity-50">Confirm Bill</button>
                ) : (
                  <div className="space-y-3">
                    <button onClick={() => generatePDF(history[0])} className="w-full bg-emerald-500 py-4 rounded-xl font-black uppercase">Download PDF</button>
                    <button onClick={() => {setCart([]); setCustomer({name:'', phone:''}); setIsDone(false); setDiscount(0);}} className="w-full text-slate-400 font-bold uppercase text-[10px] text-center">New Bill</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- INVENTORY VIEW --- */}
        {view === 'inventory' && (
          <div className="space-y-6">
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                   <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Products</p>
                   <p className="text-3xl font-black">{inventory.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm border-red-100">
                   <p className="text-red-400 text-[10px] font-black uppercase mb-1">Low Stock</p>
                   <p className="text-3xl font-black text-red-600">{inventory.filter(i => i.quantity < 10).length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                   <p className="text-emerald-400 text-[10px] font-black uppercase mb-1">Stock Value</p>
                   <p className="text-2xl font-black">₹{inventory.reduce((s, i) => s + (i.price * i.quantity), 0).toLocaleString('en-IN')}</p>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border">
               <h2 className="text-xl font-black uppercase">Stock Manager</h2>
               <button onClick={() => {setModalType('add_inventory'); setEditingItem({name:'', quantity:0, price:0, hsn:'', taxRate: 18})}} className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm">ADD PRODUCT</button>
             </div>

             <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b">
                        <tr className="text-[10px] font-black text-slate-400 uppercase">
                        <th className="p-4">Item Details</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4">Price</th>
                        <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventory.map(item => (
                        <tr key={item.id} className="border-b last:border-0 hover:bg-slate-50">
                            <td className="p-4">
                                <p className="font-bold">{item.name}</p>
                                <p className="text-[9px] text-slate-400">HSN: {item.hsn} | {item.taxRate}%</p>
                            </td>
                            <td className="p-4">
                                <span className={`font-bold ${item.quantity < 10 ? 'text-red-500' : ''}`}>{item.quantity}</span>
                            </td>
                            <td className="p-4 font-bold text-blue-600">₹{item.price.toFixed(0)}</td>
                            <td className="p-4 text-right space-x-2">
                                <button onClick={() => {setModalType('edit_inventory'); setEditingItem(item)}} className="text-blue-600 font-bold text-[10px] uppercase">Edit</button>
                                <button onClick={() => {setModalType('confirm_delete'); setItemToDelete(item)}} className="text-red-600 font-bold text-[10px] uppercase">Del</button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
             </div>
          </div>
        )}

        {/* --- HISTORY VIEW --- */}
        {view === 'history' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase text-slate-400 mb-6">Recent Sales</h2>
            {history.map((bill) => (
              <div key={bill.billId} className="bg-white p-5 rounded-2xl border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-[8px] font-black text-slate-300 uppercase mb-1"># {bill.billId}</p>
                  <p className="font-bold text-sm">{bill.date}</p>
                  <p className="text-[10px] text-blue-500 font-bold uppercase">{bill.customer.name || 'Walk-in'}</p>
                </div>
                <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-slate-300 uppercase">Total</p>
                    <p className="text-xl font-black text-blue-600">₹{bill.finalTotal.toFixed(0)}</p>
                  </div>
                  <button onClick={() => generatePDF(bill)} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase">PDF</button>
                </div>
              </div>
            ))}
            {history.length === 0 && <div className="p-20 text-center text-slate-300 italic border-2 border-dashed rounded-2xl">No sales found.</div>}
          </div>
        )}
      </div>
    </div>
  );
}