"use client";

import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Home() {
  const [view, setView] = useState('billing');
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
      const itemTaxable = (item.price * item.qty) * (1 - discount / 100);
      return sum + (itemTaxable * (item.taxRate / 100));
    }, 0);
    const cgst = totalTax / 2;
    const sgst = totalTax / 2;
    const finalTotal = taxableAmount + totalTax;
    return { subtotal, discountAmount, taxableAmount, cgst, sgst, finalTotal };
  }, [cart, discount]);

  const handleSaveItem = () => {
    if (!editingItem.name || editingItem.price <= 0) { setError("Invalid Product Details"); return; }
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

  const closeModal = () => { setModalType(null); setEditingItem(null); setItemToDelete(null); };

  const addToCart = (product) => {
    if (product.quantity <= 0) { setError(`${product.name} is Out of Stock!`); setTimeout(() => setError(null), 3000); return; }
    const existing = cart.find(item => item.id === product.id);
    if (existing) return;
    setCart([...cart, { ...product, qty: 1 }]);
    setSearchTerm('');
  };

  const handleQtyChange = (id, val) => {
    const qty = Math.max(0, parseInt(val) || 0);
    const stock = inventory.find(i => i.id === id).quantity;
    if (qty > stock) {
      setError(`Stock limit: ${stock}`); setTimeout(() => setError(null), 2000);
      setCart(cart.map(c => c.id === id ? { ...c, qty: stock } : c));
    } else {
      setCart(cart.map(c => c.id === id ? { ...c, qty } : c));
    }
  };

  const finalizeBill = () => {
    const newBill = { billId: `V9-INV-${Date.now().toString().slice(-6)}`, date: new Date().toLocaleString('en-IN'), customer: { ...customer }, items: [...cart], ...billingSummary };
    setInventory(inventory.map(inv => { const sold = cart.find(c => c.id === inv.id); return sold ? { ...inv, quantity: inv.quantity - sold.qty } : inv; }));
    setHistory([newBill, ...history]);
    setIsDone(true);
  };

  const generatePDF = (bill) => {
    const doc = new jsPDF();
    doc.setFontSize(22); doc.text("ERP_Lite PRO SYSTEMS", 14, 20);
    doc.setFontSize(10); doc.setTextColor(100); doc.text("GSTIN: 27AAAAA0000A1Z5 | Kolhapur, Maharashtra", 14, 28);
    doc.setTextColor(0);
    doc.text(`Invoice: ${bill.billId}`, 14, 40); doc.text(`Date: ${bill.date}`, 14, 46);
    doc.text(`Customer: ${bill.customer.name || 'Walk-in'}`, 14, 52); doc.text(`Phone: ${bill.customer.phone || 'N/A'}`, 14, 58);
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
    });
    doc.save(`${bill.billId}.pdf`);
  };

  return (
    <div style={{ background: '#008080', minHeight: '100vh', padding: '4px', fontFamily: 'Tahoma, MS Sans Serif, Arial, sans-serif', fontSize: '11px' }}>

      {/* ERROR TOAST - Win2000 style message box */}
      {error && (
        <div className="win-overlay" style={{ background: 'transparent', pointerEvents: 'none', zIndex: 300 }}>
          <div className="win-toast" style={{ pointerEvents: 'auto', zIndex: 301 }}>
            <span style={{ fontSize: '20px' }}>⚠</span>
            <span style={{ fontWeight: 'bold' }}>{error}</span>
          </div>
        </div>
      )}

      {/* MODAL SYSTEM */}
      {modalType && (
        <div className="win-overlay">
          <div className="win-window" style={{ width: '420px' }}>
            {/* Title bar */}
            <div className="win-titlebar">
              <span className="win-titlebar-icon">🖥</span>
              <span className="win-titlebar-text">
                {modalType === 'confirm_delete' ? 'Confirm Deletion' : modalType === 'add_inventory' ? 'Add New Product' : 'Edit Product'}
              </span>
              <button className="win-titlebar-btn" onClick={closeModal} title="Close">✕</button>
            </div>

            <div style={{ padding: '16px' }}>
              {(modalType === 'edit_inventory' || modalType === 'add_inventory') && (
                <div>
                  {/* Product Name */}
                  <div className="win-groupbox" style={{ marginBottom: '8px' }}>
                    <span className="win-groupbox-label">Product Information</span>
                    <div style={{ marginBottom: '6px' }}>
                      <label className="win-label" style={{ display: 'block', marginBottom: '2px' }}>Product Name:</label>
                      <input className="win-input" style={{ width: '100%' }} value={editingItem?.name || ''} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label className="win-label" style={{ display: 'block', marginBottom: '2px' }}>HSN Code:</label>
                        <input className="win-input" style={{ width: '100%' }} value={editingItem?.hsn || ''} onChange={e => setEditingItem({ ...editingItem, hsn: e.target.value })} />
                      </div>
                      <div>
                        <label className="win-label" style={{ display: 'block', marginBottom: '2px' }}>Tax Rate (%):</label>
                        <select className="win-input" style={{ width: '100%' }} value={editingItem?.taxRate || 18} onChange={e => setEditingItem({ ...editingItem, taxRate: parseInt(e.target.value) })}>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="win-groupbox" style={{ marginBottom: '12px' }}>
                    <span className="win-groupbox-label">Stock &amp; Pricing</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label className="win-label" style={{ display: 'block', marginBottom: '2px' }}>Stock Level:</label>
                        <input type="number" className="win-input" style={{ width: '100%' }} value={editingItem?.quantity || 0} onChange={e => setEditingItem({ ...editingItem, quantity: parseInt(e.target.value) || 0 })} />
                      </div>
                      <div>
                        <label className="win-label" style={{ display: 'block', marginBottom: '2px' }}>Base Price (Ex. GST):</label>
                        <input type="number" className="win-input" style={{ width: '100%' }} value={editingItem?.price || 0} onChange={e => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })} />
                      </div>
                    </div>
                  </div>

                  <div className="win-hr" />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '8px' }}>
                    <button className="win-btn win-btn-primary" onClick={handleSaveItem}>OK</button>
                    <button className="win-btn" onClick={closeModal}>Cancel</button>
                  </div>
                </div>
              )}

              {modalType === 'confirm_delete' && (
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div className="win-msgbox-icon">🗑</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 8px', fontWeight: 'bold' }}>Delete Product?</p>
                    <p style={{ margin: '0 0 16px', fontSize: '11px' }}>
                      Are you sure you want to permanently remove <strong>&ldquo;{itemToDelete?.name}&rdquo;</strong> from the product database?
                    </p>
                    <div className="win-hr" />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '8px' }}>
                      <button className="win-btn win-btn-primary" onClick={confirmDelete}>Yes</button>
                      <button className="win-btn" onClick={closeModal}>No</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAIN APPLICATION WINDOW */}
      <div className="win-window" style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Title Bar */}
        <div className="win-titlebar">
          <span className="win-titlebar-icon">📊</span>
          <span className="win-titlebar-text">ERP_Lite Pro Systems - Point of Sale Terminal v2.0</span>
          <button className="win-titlebar-btn" title="Minimize">_</button>
          <button className="win-titlebar-btn" title="Maximize">□</button>
          <button className="win-titlebar-btn" title="Close" style={{ marginLeft: '2px', background: '#c0c0c0' }}>✕</button>
        </div>

        {/* Menu Bar */}
        <div className="win-menubar">
          {['File', 'Edit', 'View', 'Inventory', 'Reports', 'Tools', 'Help'].map(m => (
            <span key={m} className="win-menu-item">{m}</span>
          ))}
        </div>

        {/* Toolbar */}
        <div className="win-toolbar">
          <button className="win-toolbar-btn" title="New Invoice" onClick={() => { setCart([]); setCustomer({ name: '', phone: '' }); setIsDone(false); setDiscount(0); setView('billing'); }}>
            <span>📄</span> New
          </button>
          <div className="win-separator" />
          <button className="win-toolbar-btn" title="Generate PDF" onClick={() => history[0] && generatePDF(history[0])}>
            <span>🖨</span> Print
          </button>
          <button className="win-toolbar-btn" title="Export">
            <span>💾</span> Save
          </button>
          <div className="win-separator" />
          <button className="win-toolbar-btn" title="Refresh">
            <span>🔄</span> Refresh
          </button>
          <div className="win-separator" />
          <span style={{ fontSize: '11px', color: '#444', marginLeft: '4px' }}>
            GSTIN: 27AAAAA0000A1Z5 | Kolhapur, Maharashtra
          </span>
        </div>

        {/* Tab Control */}
        <div style={{ padding: '6px 6px 0', background: '#d4d0c8', borderBottom: '1px solid #808080' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            {[
              { key: 'billing', label: '🧾 Billing' },
              { key: 'inventory', label: '📦 Inventory' },
              { key: 'history', label: '📋 History' },
            ].map(tab => (
              <button
                key={tab.key}
                className={`win-tab${view === tab.key ? ' active' : ''}`}
                onClick={() => { setView(tab.key); setIsDone(false); }}
                style={{ border: '1px solid #808080', borderBottom: view === tab.key ? '1px solid #d4d0c8' : '1px solid #808080', fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '11px', background: view === tab.key ? '#d4d0c8' : '#c0bcb4', cursor: 'pointer', padding: view === tab.key ? '3px 12px 4px' : '2px 12px 3px' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ padding: '8px', background: '#d4d0c8' }}>

          {/* --- BILLING VIEW --- */}
          {view === 'billing' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '8px', alignItems: 'start' }}>

              {/* Left Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

                {/* Customer Details */}
                <div className="win-groupbox">
                  <span className="win-groupbox-label">Customer Details</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '4px' }}>
                    <div>
                      <label className="win-label" style={{ display: 'block', marginBottom: '2px' }}>Customer Name:</label>
                      <input className="win-input" style={{ width: '100%' }} value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} placeholder="Walk-in Customer" />
                    </div>
                    <div>
                      <label className="win-label" style={{ display: 'block', marginBottom: '2px' }}>Mobile Number:</label>
                      <input className="win-input" style={{ width: '100%' }} value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                    </div>
                  </div>
                </div>

                {/* Product Search */}
                {!isDone && (
                  <div className="win-groupbox" style={{ position: 'relative' }}>
                    <span className="win-groupbox-label">Product Search</span>
                    <div style={{ display: 'flex', gap: '4px', paddingTop: '4px' }}>
                      <input
                        type="text"
                        placeholder="Type product name or HSN code..."
                        className="win-input"
                        style={{ flex: 1 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <button className="win-btn">Find</button>
                    </div>
                    {searchTerm.length >= 2 && (
                      <div className="win-window" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, marginTop: '2px', maxHeight: '180px', overflowY: 'auto' }}>
                        {inventory.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.hsn.includes(searchTerm)).map(item => (
                          <div
                            key={item.id}
                            onClick={() => addToCart(item)}
                            style={{ padding: '4px 8px', cursor: 'default', borderBottom: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#0a246a'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#000'; }}
                          >
                            <div>
                              <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                              <div style={{ fontSize: '10px', color: 'inherit' }}>HSN: {item.hsn} | Stock: {item.quantity}</div>
                            </div>
                            <div style={{ fontWeight: 'bold', fontFamily: 'Courier New, monospace' }}>Rs.{item.price.toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Cart Table */}
                <div className="win-groupbox" style={{ opacity: isDone ? 0.5 : 1, pointerEvents: isDone ? 'none' : 'auto' }}>
                  <span className="win-groupbox-label">Billing Cart</span>
                  <div style={{ paddingTop: '4px', border: '1px solid #808080', boxShadow: 'inset 1px 1px 0 #404040, inset -1px -1px 0 #fff' }}>
                    <table className="win-table">
                      <thead>
                        <tr>
                          <th style={{ width: '40%' }}>Description</th>
                          <th>Rate (Rs.)</th>
                          <th>Qty</th>
                          <th style={{ textAlign: 'right' }}>Taxable Amt (Rs.)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map(item => (
                          <tr key={item.id}>
                            <td>
                              <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                              <div style={{ fontSize: '10px', color: '#555' }}>HSN: {item.hsn} | GST: {item.taxRate}%</div>
                            </td>
                            <td style={{ fontFamily: 'Courier New, monospace' }}>{item.price.toFixed(2)}</td>
                            <td>
                              <input
                                type="number"
                                className="win-input"
                                style={{ width: '50px', textAlign: 'center' }}
                                value={item.qty}
                                onChange={(e) => handleQtyChange(item.id, e.target.value)}
                              />
                            </td>
                            <td style={{ textAlign: 'right', fontFamily: 'Courier New, monospace', fontWeight: 'bold' }}>
                              {(item.price * item.qty).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        {cart.length === 0 && (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#808080', fontStyle: 'italic' }}>
                              No items in cart. Use product search to add items.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Panel: Settlement */}
              <div>
                <div className="win-groupbox">
                  <span className="win-groupbox-label">Invoice Summary</span>
                  <div style={{ paddingTop: '8px' }}>

                    {/* Summary Table */}
                    <div className="win-sunken" style={{ background: '#fff', padding: '4px 8px', marginBottom: '8px' }}>
                      <table style={{ width: '100%', fontSize: '11px', fontFamily: 'Tahoma, Arial, sans-serif', borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: '2px 0', color: '#444' }}>Subtotal:</td>
                            <td style={{ textAlign: 'right', fontFamily: 'Courier New, monospace' }}>Rs.{billingSummary.subtotal.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '2px 0', color: '#008000' }}>Discount (%):</td>
                            <td style={{ textAlign: 'right' }}>
                              <input
                                type="number"
                                className="win-input"
                                style={{ width: '50px', textAlign: 'right' }}
                                value={discount}
                                onChange={e => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '2px 0', color: '#008000' }}>Discount Amt:</td>
                            <td style={{ textAlign: 'right', fontFamily: 'Courier New, monospace', color: '#008000' }}>-Rs.{billingSummary.discountAmount.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '2px 0' }}>CGST (9%):</td>
                            <td style={{ textAlign: 'right', fontFamily: 'Courier New, monospace' }}>Rs.{billingSummary.cgst.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '2px 0' }}>SGST (9%):</td>
                            <td style={{ textAlign: 'right', fontFamily: 'Courier New, monospace' }}>Rs.{billingSummary.sgst.toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Grand Total */}
                    <div className="win-raised" style={{ background: '#000080', color: '#fff', padding: '8px', textAlign: 'center', marginBottom: '10px' }}>
                      <div style={{ fontSize: '10px', marginBottom: '2px', fontFamily: 'Tahoma, Arial, sans-serif', color: '#a0c0ff' }}>NET PAYABLE AMOUNT</div>
                      <div style={{ fontSize: '22px', fontWeight: 'bold', fontFamily: 'Courier New, monospace', letterSpacing: '1px' }}>
                        Rs.{billingSummary.finalTotal.toFixed(2)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {!isDone ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <button
                          className="win-btn win-btn-primary"
                          style={{ width: '100%', height: '28px', fontSize: '11px', fontWeight: 'bold' }}
                          onClick={finalizeBill}
                          disabled={cart.length === 0}
                        >
                          Generate Invoice
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <button
                          className="win-btn"
                          style={{ width: '100%', height: '28px', background: '#d4ffd4', fontWeight: 'bold' }}
                          onClick={() => generatePDF(history[0])}
                        >
                          📄 Download Tax Invoice
                        </button>
                        <button
                          className="win-btn"
                          style={{ width: '100%', height: '28px' }}
                          onClick={() => { setCart([]); setCustomer({ name: '', phone: '' }); setIsDone(false); setDiscount(0); }}
                        >
                          New Session
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* System info panel */}
                <div className="win-groupbox" style={{ marginTop: '8px' }}>
                  <span className="win-groupbox-label">System Info</span>
                  <div style={{ paddingTop: '6px', fontSize: '10px', color: '#444', lineHeight: '1.6' }}>
                    <div>Version: ERP_Lite 2.0</div>
                    <div>User: Administrator</div>
                    <div>Terminal: POS-01</div>
                    <div style={{ color: cart.length > 0 ? '#008000' : '#808080' }}>
                      Cart: {cart.length} item(s)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- INVENTORY VIEW --- */}
          {view === 'inventory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

              {/* Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { label: 'Product Master', value: inventory.length, color: '#000080' },
                  { label: 'Low Stock Alerts', value: inventory.filter(i => i.quantity < 10).length, color: '#cc0000' },
                  { label: 'Stock Value (Ex. Tax)', value: `Rs.${inventory.reduce((s, i) => s + (i.price * i.quantity), 0).toLocaleString('en-IN')}`, color: '#006400', small: true },
                ].map((metric, idx) => (
                  <div key={idx} className="win-groupbox">
                    <span className="win-groupbox-label">{metric.label}</span>
                    <div className="win-sunken" style={{ background: '#fff', padding: '8px', textAlign: 'center', marginTop: '8px' }}>
                      <span style={{ fontSize: metric.small ? '16px' : '28px', fontWeight: 'bold', fontFamily: 'Courier New, monospace', color: metric.color }}>{metric.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#d4d0c8', padding: '4px 0' }}>
                <div className="win-toolbar" style={{ flex: 1, border: 'none', borderBottom: 'none', padding: '0' }}>
                  <button
                    className="win-btn win-btn-primary"
                    onClick={() => { setModalType('add_inventory'); setEditingItem({ name: '', quantity: 0, price: 0, hsn: '', taxRate: 18 }); }}
                  >
                    + Add New Product
                  </button>
                </div>
                <span style={{ fontSize: '11px', color: '#555' }}>Master Database — {inventory.length} record(s)</span>
              </div>

              {/* Inventory Table */}
              <div className="win-sunken" style={{ overflow: 'hidden' }}>
                <table className="win-table">
                  <thead>
                    <tr>
                      <th>Product Details</th>
                      <th>Tax Specs</th>
                      <th>Quantity</th>
                      <th>Unit Price (Rs.)</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                          <div style={{ fontSize: '10px', color: '#555' }}>SKU: V9-PRO-{item.id.toString().slice(-4)}</div>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'Courier New, monospace', fontSize: '10px', background: '#e8e8e8', padding: '1px 4px', border: '1px solid #808080' }}>
                            HSN:{item.hsn} ({item.taxRate}%)
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.quantity < 10 ? '#ff0000' : '#008000', display: 'inline-block', border: '1px solid #404040' }}></span>
                            <span style={{ fontFamily: 'Courier New, monospace', color: item.quantity < 10 ? '#cc0000' : '#000', fontWeight: item.quantity < 10 ? 'bold' : 'normal' }}>
                              {item.quantity} Units
                            </span>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'Courier New, monospace', fontWeight: 'bold', color: '#000080' }}>
                          {item.price.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="win-btn"
                            style={{ marginRight: '4px', fontSize: '10px', minWidth: '50px', height: '20px', padding: '1px 6px' }}
                            onClick={() => { setModalType('edit_inventory'); setEditingItem(item); }}
                          >
                            Edit
                          </button>
                          <button
                            className="win-btn"
                            style={{ fontSize: '10px', minWidth: '50px', height: '20px', padding: '1px 6px', color: '#cc0000' }}
                            onClick={() => { setModalType('confirm_delete'); setItemToDelete(item); }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- HISTORY VIEW --- */}
          {view === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px', color: '#000080' }}>
                Transaction Archives — {history.length} record(s)
              </div>

              {history.length === 0 && (
                <div className="win-sunken" style={{ background: '#fff', padding: '32px', textAlign: 'center', color: '#808080', fontStyle: 'italic' }}>
                  No historical records found. Generate a bill to see transaction history.
                </div>
              )}

              {history.map((bill) => (
                <div key={bill.billId} className="win-raised" style={{ background: '#fff', padding: '0', overflow: 'hidden' }}>
                  {/* Mini title bar for each record */}
                  <div style={{ background: '#d4d0c8', borderBottom: '1px solid #808080', padding: '2px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '10px', color: '#000080' }}>Invoice #{bill.billId}</span>
                    <span style={{ fontSize: '10px', color: '#555' }}>{bill.date}</span>
                  </div>
                  <div style={{ padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{bill.customer.name || 'Walk-in Customer'}</div>
                      <div style={{ fontSize: '10px', color: '#555' }}>
                        {bill.customer.phone || 'No phone'} — {bill.items.length} item(s)
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: '#808080' }}>GRAND TOTAL</div>
                        <div style={{ fontFamily: 'Courier New, monospace', fontWeight: 'bold', fontSize: '16px', color: '#000080' }}>
                          Rs.{bill.finalTotal.toFixed(2)}
                        </div>
                      </div>
                      <button
                        className="win-btn"
                        style={{ fontSize: '10px', height: '22px', padding: '1px 8px' }}
                        onClick={() => generatePDF(bill)}
                      >
                        📄 Export PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="win-statusbar">
          <div className="win-statusbar-pane" style={{ flex: 1 }}>
            Ready
          </div>
          <div className="win-statusbar-pane" style={{ minWidth: '120px' }}>
            Items in cart: {cart.length}
          </div>
          <div className="win-statusbar-pane" style={{ minWidth: '120px' }}>
            Products: {inventory.length}
          </div>
          <div className="win-statusbar-pane" style={{ minWidth: '140px' }}>
            {new Date().toLocaleDateString('en-IN')}
          </div>
        </div>
      </div>
    </div>
  );
}
