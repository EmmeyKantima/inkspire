var { MongoClient } = require("mongodb");

var client;
var database;

async function connectDB() {
    try {
        console.log("MONGODB_URI loaded:", !!process.env.MONGODB_URI);

        client = new MongoClient(process.env.MONGODB_URI);

        await client.connect();

        database = client.db("inkspire");

        console.log("MongoDB connected successfully");
        console.log("Database: inkspire");

        return database;
    } catch (error) {
        console.error("MongoDB connection failed:");
        console.error(error.message);
        process.exit(1);
    }
}

function getDB() {
    return database;
}

module.exports = {
    connectDB,
    getDB
};