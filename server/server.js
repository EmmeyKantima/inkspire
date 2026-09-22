var express = require("express");
var cors = require("cors");
var dotenv = require("dotenv");

dotenv.config();

var { connectDB } = require("./config/db");

var authRoutes = require("./routes/authRoutes");
var ideaRoutes = require("./routes/ideaRoutes");

var app = express();
var PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/ideas", ideaRoutes);

app.get("/api/health", function (req, res) {
    res.json({
        message: "Inkspire API is running"
    });
});

connectDB();

app.listen(PORT, function () {
    console.log("Inkspire server running on port " + PORT);
});