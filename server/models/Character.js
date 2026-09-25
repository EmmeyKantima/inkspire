var { getDB } = require("../config/db");

function getCharacterCollection() {
    var database = getDB();
    return database.collection("characters");
}

module.exports = {
    getCharacterCollection: getCharacterCollection
};