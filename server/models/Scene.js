var { getDB } = require("../config/db");

function getSceneCollection() {
    var database = getDB();
    return database.collection("scenes");
}

module.exports = {
    getSceneCollection: getSceneCollection
};