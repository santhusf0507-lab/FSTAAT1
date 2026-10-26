require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Expense = require("./models/Expense");
const expenseRoutes = require("./routes/expenses");

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

let memoryRows = [];
const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
const store = {
  mode: "memory",
  all: async () => store.mode === "mongo" ? (await Expense.find().lean()).map(x => ({...x, id: String(x._id)})) : memoryRows,
  create: async data => {
    if (store.mode === "mongo") { const doc = await Expense.create(data); return {...doc.toObject(), id: String(doc._id)}; }
    const row = { ...data, id: makeId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    memoryRows.push(row); return row;
  },
  update: async (id, data) => {
    if (store.mode === "mongo") { const doc = await Expense.findByIdAndUpdate(id, data, {new:true, runValidators:true}); return doc ? {...doc.toObject(), id:String(doc._id)} : null; }
    const i = memoryRows.findIndex(x => x.id === id); if (i < 0) return null;
    memoryRows[i] = {...memoryRows[i], ...data, id, updatedAt:new Date().toISOString()}; return memoryRows[i];
  },
  remove: async id => {
    if (store.mode === "mongo") return Boolean(await Expense.findByIdAndDelete(id));
    const n = memoryRows.length; memoryRows = memoryRows.filter(x => x.id !== id); return n !== memoryRows.length;
  }
};
app.locals.store = store;
app.get("/", (_req,res) => res.json({message:"Student Expense Tracker API is running", mode:store.mode}));
app.get("/api/health", (_req,res) => res.json({status:"ok", storage:store.mode}));
app.use("/api/expenses", (req,res,next) => { req.app.locals.store = store; next(); }, expenseRoutes);
app.get("/api/analytics", async (req,res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0,7);
    const rows = (await store.all()).filter(e => {
      const d = new Date(e.date); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}` === month;
    });
    const total = rows.reduce((s,e)=>s+Number(e.amount),0);
    const byCategory = {};
    rows.forEach(e => byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount));
    res.json({month,total,count:rows.length,byCategory});
  } catch (err) { res.status(500).json({message:"Unable to calculate analytics."}); }
});

async function start() {
  if (process.env.MONGODB_URI) {
    try { await mongoose.connect(process.env.MONGODB_URI); store.mode = "mongo"; console.log("MongoDB connected"); }
    catch (e) { console.error("MongoDB unavailable; using temporary memory mode:", e.message); }
  } else { console.log("MONGODB_URI not set; using temporary in-memory demo mode."); }
  app.listen(PORT, () => console.log(`API running at http://localhost:${PORT} (${store.mode} storage)`));
}
start();
module.exports = { store };
