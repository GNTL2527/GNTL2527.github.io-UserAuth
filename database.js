const mysql = require('mysql');

// Create a connection to the database
const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
})

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

// Function to query the database
function queryDatabase(query, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(query, params, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
}

// Example function to close the connection
function closeConnection() {
    connection.end((err) => {
        if (err) {
            console.error('Error closing the connection:', err);
            return;
        }
        console.log('Connection closed');
    });
}

// Export the functions for use in other files
module.exports = {
    queryDatabase,
    closeConnection
};
