var { getDB } = require("../config/db");

function getChapterCollection() {
    var database = getDB();
    return database.collection("chapters");
}

module.exports = {
    getChapterCollection: getChapterCollection
};