const express = require("express");
const fs = require("fs");
const app = express();
app.use(express.json());

const FILE = "keys.json";

// Load key từ file
let keys = {};
if (fs.existsSync(FILE)) {
  keys = JSON.parse(fs.readFileSync(FILE));
}

// Hàm lưu keys ra file
function saveKeys() {
  fs.writeFileSync(FILE, JSON.stringify(keys, null, 2));
}

// Route test
app.get("/", (req, res) => {
  res.send("✅ Server đang chạy ngon lành!");
});

// Route kiểm tra key
app.post("/check", (req, res) => {
  const { key, device } = req.body;

  if (!(key in keys)) {
    return res.status(400).json({ message: "❌ Key không hợp lệ!" });
  }

  if (keys[key] === null) {
    keys[key] = device;
    saveKeys();
    return res.json({ message: "✅ Kích hoạt thành công cho thiết bị: " + device });
  }

  if (keys[key] !== device) {
    return res.status(403).json({ message: "⚠️ Key này đã được dùng cho thiết bị khác!" });
  }

  return res.json({ message: "✅ Key hợp lệ, đúng thiết bị!" });
});

// Thêm key mới
app.post("/addkey", (req, res) => {
  const { key } = req.body;
  if (key in keys) {
    return res.status(400).json({ message: "⚠️ Key đã tồn tại!" });
  }
  keys[key] = null;
  saveKeys();
  return res.json({ message: "✅ Đã thêm key mới: " + key });
});

// Xoá key
app.post("/removekey", (req, res) => {
  const { key } = req.body;
  if (!(key in keys)) {
    return res.status(400).json({ message: "❌ Key không tồn tại!" });
  }
  delete keys[key];
  saveKeys();
  return res.json({ message: "✅ Đã xoá key: " + key });
});

// Reset key (cho phép gán sang máy khác)
app.post("/resetkey", (req, res) => {
  const { key } = req.body;
  if (!(key in keys)) {
    return res.status(400).json({ message: "❌ Key không tồn tại!" });
  }
  keys[key] = null;
  saveKeys();
  return res.json({ message: "✅ Key đã reset, có thể dùng lại trên thiết bị mới!" });
});

// Xem danh sách key
app.get("/listkeys", (req, res) => {
  return res.json(keys);
});

// Chạy server (Render/Railway cần dùng PORT từ env)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Server chạy cổng " + PORT));
