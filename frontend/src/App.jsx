import React, { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import ExpenseForm from "./components/ExpenseForm.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const categories = ["Food","Transport","Education","Shopping","Bills","Health","Other"];
const colors = ["#727bff","#45b89a","#f5a65b","#ee7c9a","#57a9df","#9a7ce5","#8b9aa8"];
const money = n => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(Number(n)||0);
const seed = [
 {id:"demo-1",title:"Lunch",amount:120,category:"Food",date:new Date().toISOString().slice(0,10),paymentMethod:"UPI",notes:"College canteen"},
 {id:"demo-2",title:"Bus pass",amount:350,category:"Transport",date:new Date(Date.now()-86400000).toISOString().slice(0,10),paymentMethod:"UPI",notes:"Travel"},
 {id:"demo-3",title:"Notebook",amount:85,category:"Education",date:new Date(Date.now()-2*86400000).toISOString().slice(0,10),paymentMethod:"Cash",notes:"Study supplies"}
];

export default function App() {
 const [expenses,setExpenses] = useState(seed);
 const [connected,setConnected] = useState(false);
 const [view,setView] = useState("Overview");
 const [month,setMonth] = useState(new Date().toISOString().slice(0,7));
 const [search,setSearch] = useState("");
 const [category,setCategory] = useState("All");
 const [showForm,setShowForm] = useState(false);
 const [editing,setEditing] = useState(null);
 const [notice,setNotice] = useState("");
 const [budget,setBudget] = useState(10000);
 async function load(){
   try { const r=await fetch(API+"/api/expenses"); if(!r.ok) throw Error(); setExpenses(await r.json()); setConnected(true); }
   catch { setConnected(false); }
 }
 useEffect(()=>{load()},[]);
 const monthRows = expenses.filter(e=>String(e.date).slice(0,7)===month);
 const total = monthRows.reduce((s,e)=>s+Number(e.amount),0);
 const filtered = expenses.filter(e=>(category==="All"||e.category===category)&&`${e.title} ${e.category} ${e.notes||""}`.toLowerCase().includes(search.toLowerCase()));
 const byCategory = categories.map(c=>({name:c,value:monthRows.filter(e=>e.category===c).reduce((s,e)=>s+Number(e.amount),0)})).filter(x=>x.value>0);
 const daily = Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);const key=d.toISOString().slice(0,10);return {day:d.toLocaleDateString("en-IN",{weekday:"short"}),amount:expenses.filter(e=>new Date(e.date).toISOString().slice(0,10)===key).reduce((s,e)=>s+Number(e.amount),0)}});
 function flash(s){setNotice(s);setTimeout(()=>setNotice(""),2600)}
 async function save(data){
   if(connected){try{const url=editing?`${API}/api/expenses/${editing.id}`:`${API}/api/expenses`;const r=await fetch(url,{method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});if(!r.ok)throw Error((await r.json()).message);await load()}catch(e){flash(e.message||"API unavailable");return}}
   else {if(editing)setExpenses(old=>old.map(x=>x.id===editing.id?{...x,...data}:x));else setExpenses(old=>[{...data,id:crypto.randomUUID()},...old])}
   setEditing(null);setShowForm(false);flash(editing?"Expense updated":"Expense added");
 }
 async function remove(e){
   if(connected){try{const r=await fetch(`${API}/api/expenses/${e.id}`,{method:"DELETE"});if(!r.ok)throw Error();await load()}catch{flash("Could not delete expense");return}}
   else setExpenses(old=>old.filter(x=>x.id!==e.id));
   flash("Expense deleted");
 }
 function exportCSV(){const rows=[["Title","Amount INR","Category","Date","Payment Method","Notes"],...filtered.map(e=>[e.title,e.amount,e.category,new Date(e.date).toISOString().slice(0,10),e.paymentMethod,e.notes||""])];const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="student-expenses.csv";a.click();URL.revokeObjectURL(a.href)}
 return <div className="app-shell">
  <aside className="sidebar"><div className="brand"><span className="brand-icon">₹</span><span>pocket<span className="brand-light">wise</span><small>STUDENT FINANCE</small></span></div>
   <div className="nav-label">WORKSPACE</div>{["Overview","Transactions","Analytics"].map((x,i)=><button key={x} onClick={()=>setView(x)} className={`nav-item ${view===x?"active":""}`}><span>{["▦","↕","◔"][i]}</span>{x}</button>)}
   <div className="sidebar-bottom"><div className="budget-mini"><b>Monthly budget</b><p>Keep your spending on track.</p><div className="track"><i style={{width:`${Math.min(100,total/budget*100)}%`}}/></div><small>{money(total)} of {money(budget)}</small></div><div className="profile"><div className="avatar">SK</div><div><b>Student Account</b><small>Personal workspace</small></div></div></div>
  </aside>
  <main className="main"><header className="topbar"><div><span className="breadcrumb">Workspace / </span><b>{view}</b></div><div className="top-actions"><span className={`status ${connected?"online":""}`}>{connected?"API connected":"Demo mode"}</span><button className="btn primary small" onClick={()=>{setEditing(null);setShowForm(!showForm)}}>＋ Add expense</button></div></header>
   <div className="page-content"><div className="welcome"><div><div className="eyebrow">YOUR MONEY, IN FOCUS</div><h1>{view==="Overview"?"Good day, student 👋":view}</h1><p>Understand your spending. Make every rupee count.</p></div><label className="month-select">Month <input type="month" value={month} onChange={e=>setMonth(e.target.value)}/></label></div>
   {notice&&<div className="toast">{notice}</div>}
   {showForm&&<section className="panel form-panel"><div className="section-heading"><div><h2>{editing?"Edit expense":"Add a new expense"}</h2><p>Record your spending details below.</p></div><button className="icon-btn" onClick={()=>{setShowForm(false);setEditing(null)}}>×</button></div><ExpenseForm selected={editing} onSave={save} onCancel={()=>setEditing(null)}/></section>}
   {view==="Overview"&&<><div className="stats-grid"><div className="stat-card"><span>Total spent this month</span><div className="stat-value">{money(total)}</div><small>Across {monthRows.length} transactions</small></div><div className="stat-card"><span>Monthly budget</span><div className="stat-value">{money(budget)}</div><div className="track"><i style={{width:`${Math.min(100,total/budget*100)}%`}}/></div><small>Budget used</small></div><div className="stat-card"><span>Average per transaction</span><div className="stat-value">{money(monthRows.length?total/monthRows.length:0)}</div><small>Monthly average spend</small></div><div className="stat-card"><span>Top category</span><div className="stat-value">{byCategory.sort((a,b)=>b.value-a.value)[0]?.name||"—"}</div><small>Highest spending category</small></div></div>
   <div className="charts-grid"><section className="panel"><div className="section-heading"><div><h2>Spending activity</h2><p>Recent 7-day overview</p></div></div><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><BarChart data={daily}><XAxis dataKey="day"/><YAxis/><Tooltip formatter={v=>money(v)}/><Bar dataKey="amount" fill="#727bff" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div></section><section className="panel"><div className="section-heading"><div><h2>Spending by category</h2><p>Where your money goes</p></div></div><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>{byCategory.map((x,i)=><Cell key={x.name} fill={colors[categories.indexOf(x.name)]}/>)}</Pie><Tooltip formatter={v=>money(v)}/></PieChart></ResponsiveContainer></div></section></div></>}
   {(view==="Overview"||view==="Transactions")&&<section className="panel transactions"><div className="section-heading"><div><h2>Recent transactions</h2><p>Your latest spending records</p></div><button className="text-button" onClick={()=>setView("Transactions")}>View all ↗</button></div><div className="filters"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search expenses..."/><select value={category} onChange={e=>setCategory(e.target.value)}><option>All</option>{categories.map(c=><option key={c}>{c}</option>)}</select><button className="btn secondary small" onClick={exportCSV}>Export CSV</button></div><div className="table-wrap"><table><thead><tr><th>EXPENSE</th><th>CATEGORY</th><th>DATE</th><th>PAYMENT</th><th>AMOUNT</th><th>ACTIONS</th></tr></thead><tbody>{filtered.slice(0,view==="Overview"?5:100).map(e=><tr key={e.id}><td><b>{e.title}</b><small className="notes">{e.notes||"Personal expense"}</small></td><td>{e.category}</td><td>{new Date(e.date).toLocaleDateString("en-IN")}</td><td>{e.paymentMethod}</td><td className="amount">{money(e.amount)}</td><td><button className="row-action" onClick={()=>{setEditing(e);setShowForm(true)}}>Edit</button><button className="row-action delete" onClick={()=>remove(e)}>Delete</button></td></tr>)}</tbody></table>{!filtered.length&&<div className="empty">No matching expenses. Add an expense to get started.</div>}</div></section>}
   {view==="Analytics"&&<section className="panel"><div className="section-heading"><div><h2>Monthly analytics</h2><p>Category totals for the selected month</p></div></div>{byCategory.map((x,i)=><div className="category-row" key={x.name}><span>{x.name}</span><b>{money(x.value)}</b><div className="track"><i style={{width:`${total?100*x.value/total:0}%`,background:colors[i]}}/></div></div>)}</section>}
   <footer>© 2026 PocketWise · Student Expense Tracker <span>Built for smarter student budgeting</span></footer>
   </div>
  </main>
 </div>
}
