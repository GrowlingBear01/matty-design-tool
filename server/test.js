// server.js or app.js
import express from "express";
import mongoose from "mongoose";

const app = express();
const PORT = 5000;

// Replace <db_password> with your actual password
const MONGO_URI = "mongodb+srv://123:123@cluster0.kde61ul.mongodb.net/mattydb?retryWrites=true&w=majority";

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// Define a simple schema
const testSchema = new mongoose.Schema({
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const Test = mongoose.model("Test", testSchema);

// Test route
app.get("/api/test", async (req, res) => {
  try {
    const doc = new Test({ message: "Hello from Express!" });
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
