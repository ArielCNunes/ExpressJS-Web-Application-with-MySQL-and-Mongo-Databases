const MongoClient = require("mongodb").MongoClient;

MongoClient.connect("mongodb://127.0.0.1:27017")
  .then((client) => {
    db = client.db("proj2024MongoDB");
    coll = db.collection("lecturers");
  })
  .catch((error) => {
    console.log(error.message);
  });

var findAll = function () {
  return new Promise((resolve, reject) => {
    coll
      .find()
      .toArray()
      .then((documents) => {
        resolve(documents);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

module.exports.checkLecturerModules = async function (id) {
  const db = await getDb();
  // Check if any module references the lecturer
  const result = await db.collection("modules").findOne({ lid: id });
  // Returns the module if found, or null
  return result;
};

module.exports.deleteById = async function (id) {
  const db = await getDb();
  return db.collection("lecturers").deleteOne({ _id: id }); // Delete the lecturer
};

module.exports = {
  checkLecturerModules,
  deleteById,
  getDb,
};
