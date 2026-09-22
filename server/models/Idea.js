var { getDB } = require("../config/db");

function getIdeaCollection() {
    var database = getDB();

    return database.collection("ideas");
}

module.exports = {
    getIdeaCollection: getIdeaCollection
};