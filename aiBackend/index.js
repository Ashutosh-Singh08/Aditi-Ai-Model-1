const express = require("express");
const cors = require("cors");
require("dotenv").config();

const dbConnect = require("./config/database");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const selfUpdateRoutes = require("./routes/selfUpdateRoutes");



app.use(cors());
app.use(express.json());
app.use("/audio", express.static("audio"));

// connect database
dbConnect();
app.use("/api/self-update", selfUpdateRoutes);
app.use("/api/chat", chatRoutes);


app.get("/", (req, res) => {
  res.send("Personal AI Assistant Backend Running");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});