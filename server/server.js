var express = require("express");
var cors = require("cors");
var dotenv = require("dotenv");
var path = require("path");

dotenv.config({
    path: path.join(__dirname, ".env")
});

var { connectDB } = require("./config/db");

var authRoutes = require("./routes/authRoutes");
var ideaRoutes = require("./routes/ideaRoutes");
var storyRoutes = require("./routes/storyRoutes");
var characterRoutes = require("./routes/characterRoutes");

var app = express();
var PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/ideas", ideaRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/characters", characterRoutes);

app.get("/api/health", function (req, res) {
    res.json({
        message: "Inkspire API is running"
    });
});

connectDB();

app.listen(PORT, function () {
    console.log("Inkspire server running on port " + PORT);
});