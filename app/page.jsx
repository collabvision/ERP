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

  // Modal States
  const [modalType, setModalType] = useState(null); // 'edit_inventory', 'add_inventory', 'confirm_delete'
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // --- 1. REAL WORLD TAX CALCULATIONS ---
  const billingSummary = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discountAmount = (subtotal * discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    
    // In real-world GST, products might have different tax rates. 
    // Here we calculate based on the individual items in the cart.
    const totalTax = cart.reduce((sum, item) => {
        const itemTaxable = (item.price * item.qty) * (1 - discount/100);
        return sum + (itemTaxable * (item.taxRate / 100));
    }, 0);

    const cgst = totalTax / 2;
    const sgst = totalTax / 2;
    const finalTotal = taxableAmount + totalTax;

    return { subtotal, discountAmount, taxableAmount, cgst, sgst, finalTotal };
  }, [cart, discount]);

  // --- 2. INVENTORY CRUD LOGIC ---
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

  // --- 3. BILLING & CART LOGIC ---
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
    // Deduct stock
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
    doc.setTextColor(100);
    doc.text("GSTIN: 27AAAAA0000A1Z5 | Kolhapur, Maharashtra", 14, 28);
    
    doc.setTextColor(0);
    doc.text(`Invoice: ${bill.billId}`, 14, 40);
    doc.text(`Date: ${bill.date}`, 14, 46);
    doc.text(`Customer: ${bill.customer.name || 'Walk-in'}`, 14, 52);
    doc.text(`Phone: ${bill.customer.phone || 'N/A'}`, 14, 58);

    autoTable(doc, {
      startY: 65,
      head: [['Product', 'HSN', 'Rate', 'Qty', 'GST%', 'Total']],
      body: bill.items.map(i => [i.name, i.hsn, i.price.toFixed(2), i.qty, i.taxRate + '%', (i.price * i.qty).toFixed(2)]),
      foot: [
        ['', '', '', '', 'Subtotal', `Rs. ${bill.subtotal.toFixed(2)}`],
        ['', '', '', '', 'Discount', `- Rs. ${bill.discountAmount.toFixed(2)}`],
        ['', '', '', '', 'CGST (9%)', `Rs. ${bill.cgst.toFixed(2)}`],
        ['', '', '', '', 'SGST (9%)', `Rs. ${bill.sgst.toFixed(2)}`],
        ['', '', '', '', 'GRAND TOTAL', `Rs. ${bill.finalTotal.toFixed(2)}`]
      ],
      theme: 'grid',
      headStyles: { fillStyle: [37, 99, 235] },
      footStyles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [0,0,0] }
    });
    doc.save(`${bill.billId}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      
      {/* ERROR TOAST */}
      {error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-red-600 text-white px-8 py-4 rounded-2xl font-black shadow-2xl animate-bounce">
          ⚠️ {error}
        </div>
      )}

      {/* --- CENTRAL MODAL SYSTEM --- */}
      {modalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* ADD / EDIT FORM */}
            {(modalType === 'edit_inventory' || modalType === 'add_inventory') && (
              <div className="space-y-4">
                <h2 className="text-2xl font-black mb-6 uppercase text-blue-600 italic">Configure Product</h2>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Product Name</label>
                    <input className="w-full bg-slate-100 p-4 rounded-2xl outline-none border-2 focus:border-blue-500 font-bold" value={editingItem?.name || ''} onChange={e => setEditingItem({...editingItem, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">HSN Code</label>
                        <input className="w-full bg-slate-100 p-4 rounded-2xl outline-none border-2 focus:border-blue-500 font-bold" value={editingItem?.hsn || ''} onChange={e => setEditingItem({...editingItem, hsn: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Tax Rate (%)</label>
                        <select className="w-full bg-slate-100 p-4 rounded-2xl outline-none border-2 focus:border-blue-500 font-bold" value={editingItem?.taxRate || 18} onChange={e => setEditingItem({...editingItem, taxRate: parseInt(e.target.value)})}>
                            <option value="5">5%</option><option value="12">12%</option><option value="18">18%</option><option value="28">28%</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Stock Level</label>
                        <input type="number" className="w-full bg-slate-100 p-4 rounded-2xl outline-none border-2 focus:border-blue-500 font-bold" value={editingItem?.quantity || 0} onChange={e => setEditingItem({...editingItem, quantity: parseInt(e.target.value) || 0})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Base Price (Ex. GST)</label>
                        <input type="number" className="w-full bg-slate-100 p-4 rounded-2xl outline-none border-2 focus:border-blue-500 font-bold text-blue-600" value={editingItem?.price || 0} onChange={e => setEditingItem({...editingItem, price: parseFloat(e.target.value) || 0})} />
                    </div>
                </div>
                <button onClick={handleSaveItem} className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-blue-200 mt-4 transition hover:bg-blue-700">Update Master Database</button>
              </div>
            )}

            {/* DELETE CONFIRMATION */}
            {modalType === 'confirm_delete' && (
              <div className="text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🗑️</div>
                <h2 className="text-2xl font-black mb-2">Delete Product?</h2>
                <p className="text-slate-500 mb-8">This will permanently remove <span className="font-bold text-slate-800">"{itemToDelete?.name}"</span> from your stock records.</p>
                <div className="flex gap-4">
                  <button onClick={closeModal} className="flex-1 bg-slate-100 py-4 rounded-2xl font-bold text-slate-500">Cancel</button>
                  <button onClick={confirmDelete} className="flex-1 bg-red-600 py-4 rounded-2xl font-bold text-white shadow-lg shadow-red-100 hover:bg-red-700 transition">Delete Item</button>
                </div>
              </div>
            )}

            {modalType !== 'confirm_delete' && (
              <button onClick={closeModal} className="w-full mt-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest py-2">Close Modal</button>
            )}
          </div>
        </div>
      )}

      {/* HEADER NAVIGATION */}
      <nav className="bg-white border-b h-20 flex items-center px-8 justify-between sticky top-0 z-50 shadow-sm">
        <h1 className="text-2xl font-black text-blue-600 tracking-tighter italic">ERP_Lite <span className="not-italic text-[10px] text-slate-300 ml-2">PRO ERP</span></h1>
        <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem]">
          {['billing', 'inventory', 'history'].map((v) => (
            <button key={v} onClick={() => {setView(v); setIsDone(false);}} className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === v ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}>{v}</button>
          ))}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto mt-10 px-6">
        
        {/* --- BILLING VIEW --- */}
        {view === 'billing' && (
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8 space-y-6">
              
              {/* Customer CRM Bar */}
              <div className="bg-white p-6 rounded-[2.5rem] border-2 border-blue-50 grid grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Customer Name</label>
                    <input className="w-full bg-slate-50 p-4 rounded-2xl outline-none border focus:border-blue-400 font-bold" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} placeholder="Walk-in Customer" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Mobile Number</label>
                    <input className="w-full bg-slate-50 p-4 rounded-2xl outline-none border focus:border-blue-400 font-bold" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>

              {/* Advanced Search */}
              {!isDone && (
                <div className="relative">
                  <input type="text" placeholder="Search by name, category or HSN..." className="w-full p-6 rounded-[2.5rem] border-2 border-slate-200 outline-none focus:border-blue-600 shadow-sm text-xl transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  {searchTerm.length >= 2 && (
                    <div className="absolute top-full left-0 right-0 bg-white border rounded-[2rem] shadow-2xl mt-2 z-50 overflow-hidden">
                      {inventory.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.hsn.includes(searchTerm)).map(item => (
                        <button key={item.id} onClick={() => addToCart(item)} className="w-full p-6 text-left hover:bg-blue-50 flex justify-between border-b last:border-0 items-center transition-colors">
                          <div>
                            <p className="font-black text-slate-800">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold">HSN: {item.hsn} | Stock: <span className={item.quantity < 5 ? 'text-red-500' : 'text-slate-500'}>{item.quantity} available</span></p>
                          </div>
                          <span className="text-blue-600 font-black text-xl">₹{item.price.toFixed(2)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Billing Cart Table */}
              <div className={`bg-white rounded-[3rem] shadow-sm border overflow-hidden transition-opacity ${isDone ? 'opacity-40 pointer-events-none' : ''}`}>
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b">
                    <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      <th className="p-8">Description</th>
                      <th className="p-8">Rate</th>
                      <th className="p-8">Qty</th>
                      <th className="p-8 text-right">Taxable Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map(item => (
                      <tr key={item.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="p-8">
                          <p className="font-black text-slate-800">{item.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">HSN: {item.hsn} | GST: {item.taxRate}%</p>
                        </td>
                        <td className="p-8 font-bold text-slate-600">₹{item.price.toFixed(2)}</td>
                        <td className="p-8">
                          <input type="number" className="w-16 border-2 border-slate-100 rounded-xl p-2 text-center font-black focus:border-blue-500 outline-none" value={item.qty} onChange={(e) => handleQtyChange(item.id, e.target.value)} />
                        </td>
                        <td className="p-8 text-right font-black text-lg">₹{(item.price * item.qty).toFixed(2)}</td>
                      </tr>
                    ))}
                    {cart.length === 0 && <tr><td colSpan="4" className="p-32 text-center text-slate-300 italic font-medium text-lg">Your billing cart is empty.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT SIDE: SETTLEMENT PANEL */}
            <div className="lg:col-span-4 sticky top-28">
              <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl border-t-[12px] border-blue-600">
                <div className="space-y-4 mb-10 text-xs font-bold uppercase tracking-widest">
                   <div className="flex justify-between text-slate-500"><span>Taxable Subtotal</span><span>₹{billingSummary.subtotal.toFixed(2)}</span></div>
                   <div className="flex justify-between text-emerald-400 items-center bg-emerald-400/5 p-3 rounded-xl border border-emerald-400/10">
                     <span>Discount (%)</span>
                     <input type="number" className="bg-transparent border-b-2 border-emerald-400/30 w-12 text-right outline-none font-black text-lg" value={discount} onChange={e => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))} />
                   </div>
                   <div className="flex justify-between text-slate-400"><span>CGST (9%)</span><span>₹{billingSummary.cgst.toFixed(2)}</span></div>
                   <div className="flex justify-between text-slate-400"><span>SGST (9%)</span><span>₹{billingSummary.sgst.toFixed(2)}</span></div>
                   <div className="h-px bg-white/10 my-4"></div>
                   <p className="text-center text-blue-400 mb-2">Net Payable Amount</p>
                   <h2 className="text-6xl font-black text-center text-white tracking-tighter">₹{billingSummary.finalTotal.toFixed(0)}</h2>
                </div>
                
                {!isDone ? (
                  <button onClick={finalizeBill} disabled={cart.length === 0} className="w-full bg-blue-600 py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-blue-900/40 hover:bg-blue-500 transition-all active:scale-95">Generate Invoice</button>
                ) : (
                  <div className="space-y-4">
                    <button onClick={() => generatePDF(history[0])} className="w-full bg-emerald-500 py-5 rounded-2xl font-black uppercase shadow-xl shadow-emerald-900/20">Download Tax Invoice</button>
                    <button onClick={() => {setCart([]); setCustomer({name:'', phone:''}); setIsDone(false); setDiscount(0);}} className="w-full text-slate-500 font-bold uppercase text-[10px] tracking-widest">Start New Session</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- INVENTORY VIEW (FULL CRUD) --- */}
        {view === 'inventory' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
             
             {/* 1. Dashboard Metrics */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-10 rounded-[3rem] border-2 border-blue-50 shadow-sm group hover:border-blue-500 transition-all">
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Product Master</p>
                   <p className="text-5xl font-black text-slate-800">{inventory.length}</p>
                </div>
                <div className="bg-white p-10 rounded-[3rem] border-2 border-red-50 shadow-sm group hover:border-red-500 transition-all">
                   <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mb-2">Low Stock Alerts</p>
                   <p className="text-5xl font-black text-red-600">{inventory.filter(i => i.quantity < 10).length}</p>
                </div>
                <div className="bg-white p-10 rounded-[3rem] border-2 border-emerald-50 shadow-sm group hover:border-emerald-500 transition-all">
                   <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2">Stock Value (Ex. Tax)</p>
                   <p className="text-4xl font-black text-emerald-600">₹{inventory.reduce((s, i) => s + (i.price * i.quantity), 0).toLocaleString('en-IN')}</p>
                </div>
             </div>

             {/* 2. Actions Bar */}
             <div className="flex justify-between items-center bg-white p-8 rounded-[3rem] border shadow-sm">
               <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800">Master Database</h2>
               <button onClick={() => {setModalType('add_inventory'); setEditingItem({name:'', quantity:0, price:0, hsn:'', taxRate: 18})}} className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black shadow-xl shadow-blue-200 hover:scale-105 transition active:scale-95">ADD NEW PRODUCT</button>
             </div>

             {/* 3. Inventory Table (READ / UPDATE / DELETE) */}
             <div className="bg-white rounded-[3.5rem] border shadow-sm overflow-hidden">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b">
                   <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                     <th className="p-8">Product Details</th>
                     <th className="p-8">Tax Specs</th>
                     <th className="p-8">Quantity</th>
                     <th className="p-8">Unit Price</th>
                     <th className="p-8 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {inventory.map(item => (
                     <tr key={item.id} className="hover:bg-slate-50 transition border-b last:border-0 group">
                       <td className="p-8">
                         <p className="font-black text-slate-800 text-lg">{item.name}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SKU: V9-PRO-{item.id.toString().slice(-4)}</p>
                       </td>
                       <td className="p-8">
                         <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black font-mono">HSN: {item.hsn} ({item.taxRate}%)</span>
                       </td>
                       <td className="p-8">
                         <div className="flex items-center gap-3">
                           <div className={`h-2.5 w-2.5 rounded-full ${item.quantity < 10 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                           <p className={`font-black text-lg ${item.quantity < 10 ? 'text-red-500' : 'text-slate-700'}`}>{item.quantity} Units</p>
                         </div>
                       </td>
                       <td className="p-8 font-black text-blue-600 text-xl">₹{item.price.toFixed(2)}</td>
                       <td className="p-8 text-right space-x-3">
                         <button onClick={() => {setModalType('edit_inventory'); setEditingItem(item)}} className="bg-blue-50 text-blue-600 p-4 rounded-2xl font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition shadow-sm">Edit</button>
                         <button onClick={() => {setModalType('confirm_delete'); setItemToDelete(item)}} className="bg-red-50 text-red-600 p-4 rounded-2xl font-black text-[10px] uppercase hover:bg-red-600 hover:text-white transition shadow-sm">Delete</button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {/* --- SALES HISTORY VIEW --- */}
        {view === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-10 text-slate-400">Transaction Archives</h2>
            {history.map((bill) => (
              <div key={bill.billId} className="bg-white p-10 rounded-[3.5rem] border-2 border-transparent hover:border-blue-500 transition-all shadow-sm flex flex-col md:flex-row justify-between items-center gap-10 group">
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-black text-slate-300 uppercase mb-2 tracking-widest"># {bill.billId}</p>
                  <p className="font-black text-2xl text-slate-800">{bill.date}</p>
                  <p className="text-[10px] text-blue-500 font-bold uppercase mt-1 tracking-tighter">Billed to: {bill.customer.name || 'Walk-in Customer'}</p>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Total Settled</p>
                    <p className="text-4xl font-black text-blue-600 tracking-tighter">₹{bill.finalTotal.toFixed(2)}</p>
                  </div>
                  <button onClick={() => generatePDF(bill)} className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition shadow-xl shadow-slate-200">Export PDF</button>
                </div>
              </div>
            ))}
            {history.length === 0 && <div className="p-32 text-center text-slate-300 italic text-xl border-4 border-dashed rounded-[3rem]">No historical records found.</div>}
          </div>
        )}
      </div>
    </div>
  );
}