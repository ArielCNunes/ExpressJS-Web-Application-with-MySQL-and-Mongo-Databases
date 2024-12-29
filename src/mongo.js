const MongoClient = require("mongodb").MongoClient;
let db; // Database reference

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

function getDb() {
  if (!db) {
    throw new Error("Database not initialized!");
  }
  return db;
}

// Delete lecturer by ID
async function deleteById(id) {
  try {
    const database = getDb();
    return await database.collection("lecturers").deleteOne({ _id: id });
  } catch (error) {
    console.error("Failed to delete lecturer:", error);
    throw error; // Propagate error
  }
}

module.exports = {
  findAll,
  deleteById,
  getDb,
};
