var mysql = require('promise-mysql');

// Create a connection pool
var pool = mysql.createPool({
    connectionLimit: 3,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'proj2024Mysql'
}).catch(e => {
    console.error("Database pool creation failed:", e);
});

// Export the resolved pool
module.exports = pool;