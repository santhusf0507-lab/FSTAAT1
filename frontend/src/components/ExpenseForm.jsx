import React, { useEffect, useState } from "react";
const initial = { title:"", amount:"", category:"Food", date:new Date().toISOString().slice(0,10), paymentMethod:"UPI", notes:"" };
export default function ExpenseForm({ selected, onSave, onCancel }) {
  const [form,setForm] = useState(initial);
  useEffect(()=>setForm(selected ? {...selected, amount:String(selected.amount), date:new Date(selected.date).toISOString().slice(0,10)} : initial),[selected]);
  const change = e => setForm({...form,[e.target.name]:e.target.value});
  const submit = e => { e.preventDefault(); onSave({...form,amount:Number(form.amount)}); setForm(initial); };
  return <form className="expense-form" onSubmit={submit}>
    <div className="form-grid">
      <label>Expense name<input name="title" value={form.title} onChange={change} placeholder="e.g. Lunch" required maxLength="100"/></label>
      <label>Amount (₹)<input name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={change} placeholder="0.00" required/></label>
      <label>Category<select name="category" value={form.category} onChange={change}>{["Food","Transport","Education","Shopping","Bills","Health","Other"].map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Date<input name="date" type="date" value={form.date} onChange={change} required/></label>
      <label>Payment method<select name="paymentMethod" value={form.paymentMethod} onChange={change}>{["UPI","Cash","Card","Bank Transfer"].map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Notes<input name="notes" value={form.notes} onChange={change} placeholder="Optional note" maxLength="300"/></label>
    </div>
    <div className="form-actions"><button className="btn primary" type="submit">{selected?"Update expense":"Add expense"}</button>{selected&&<button type="button" className="btn secondary" onClick={onCancel}>Cancel</button>}</div>
  </form>;
}
