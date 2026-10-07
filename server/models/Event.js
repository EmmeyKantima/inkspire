var { getDB } = require("../config/db");

function getEventCollection() {
    var database = getDB();
    return database.collection("events");
}

module.exports = {
    getEventCollection: getEventCollection
};