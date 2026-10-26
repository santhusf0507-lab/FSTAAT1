const express = require("express");
const Expense = require("../models/Expense");
const router = express.Router();
const store = () => require("../server").store;

router.get("/", async (req, res) => {
  try {
    const { q = "", category = "", month = "" } = req.query;
    let rows = await store().all();
    rows = rows.filter(e => {
      const matchesQ = !q || `${e.title} ${e.category} ${e.notes || ""}`.toLowerCase().includes(q.toLowerCase());
      const matchesCategory = !category || category === "All" || e.category === category;
      const date = new Date(e.date);
      const matchesMonth = !month || `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}` === month;
      return matchesQ && matchesCategory && matchesMonth;
    });
    rows.sort((a,b) => new Date(b.date) - new Date(a.date));
    res.json(rows);
  } catch (err) { res.status(500).json({ message: "Unable to fetch expenses." }); }
});

router.post("/", async (req, res) => {
  try {
    const { title, amount, category, date, paymentMethod = "UPI", notes = "" } = req.body;
    if (!title || !String(title).trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || !category || !date) {
      return res.status(400).json({ message: "Title, positive amount, category and date are required." });
    }
    const item = await store().create({ title: String(title).trim(), amount: Number(amount), category, date, paymentMethod, notes });
    res.status(201).json(item);
  } catch (err) { res.status(400).json({ message: err.message || "Invalid expense." }); }
});

router.put("/:id", async (req, res) => {
  try {
    const item = await store().update(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: "Expense not found." });
    res.json(item);
  } catch (err) { res.status(400).json({ message: err.message || "Unable to update expense." }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const ok = await store().remove(req.params.id);
    if (!ok) return res.status(404).json({ message: "Expense not found." });
    res.json({ message: "Expense deleted successfully." });
  } catch (err) { res.status(500).json({ message: "Unable to delete expense." }); }
});

module.exports = router;
