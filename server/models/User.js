var { getDB } = require("../config/db");

function getUserCollection() {
    var database = getDB();

    return database.collection("users");
}

module.exports = {
    getUserCollection
};