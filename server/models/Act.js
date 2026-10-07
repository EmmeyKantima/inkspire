var { getDB } = require("../config/db");

function getActCollection() {
    var database = getDB();
    return database.collection("acts");
}

module.exports = {
    getActCollection: getActCollection
};