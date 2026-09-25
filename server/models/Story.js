var { getDB } = require("../config/db");

function getStoryCollection() {
    var database = getDB();
    return database.collection("stories");
}

module.exports = {
    getStoryCollection: getStoryCollection
};