import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();









const mysql = require('mysql2');

// Database connection details
const pool = mysql.createPool({
  host: 'your-rds-endpoint', // e.g., your-db-instance.rds.amazonaws.com
  port: 'your-port',         // usually 3306 for MySQL
  user: 'your-username',
  password: 'your-password',
  database: 'your-database',
  waitForConnections: true,
  connectionLimit: 10, // Adjust based on your application needs
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: true,
    ca: 'your-ssl-cert-path' // Path to your SSL certificate file
  }
});

// Function to execute a query using the connection pool
const executeQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    pool.execute(query, params, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

// Example usage
const runExampleQuery = async () => {
  try {
    const results = await executeQuery('SELECT 1 + 1 AS solution', []);
    console.log('The solution is:', results[0].solution);
  } catch (err) {
    console.error('Error executing query:', err);
  }
};

// Call the example query function
runExampleQuery();

// Export the executeQuery function for use in other modules
module.exports = {
  executeQuery
};
Using the executeQuery function in other parts of your application:

In other parts of your application, you can import the executeQuery function and use it to run queries.

javascript
Copy code
const { executeQuery } = require('./path-to-your-db-module');

const getUserById = async (userId) => {
  try {
    const query = 'SELECT * FROM users WHERE id = ?';
    const results = await executeQuery(query, [userId]);
    return results;
  } catch (err) {
    console.error('Error getting user by ID:', err);
    throw err;
  }
};

// Example usage
(async () => {
  try {
    const user = await getUserById(1);
    console.log('User details:', user);
  } catch (err) {
    console.error('Error:', err);
  }
})();
