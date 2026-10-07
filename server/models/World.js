var { getDB } = require("../config/db");

function getWorldCollection() {
    var database = getDB();
    return database.collection("worlds");
}

module.exports = {
    getWorldCollection: getWorldCollection
};