var { getDB } = require("../config/db");

function getDraftCollection() {
    var database = getDB();
    return database.collection("drafts");
}

module.exports = {
    getDraftCollection: getDraftCollection
};