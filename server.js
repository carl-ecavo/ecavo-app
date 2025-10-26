import http from "node:http";
import { Client } from 'pg';

// New client configuration in server.js
// Final, definitive format for Cloud Run deployment

// --- CONNECTION CONFIGURATION ---
const DB_USER = 'ecavo_app'; 
const DB_PASSWORD = process.env.DB_PASS; 
// const DB_NAME = 'postgres';
// Final Fix: Connect to the template database first to establish the socket connection.
const DB_NAME = 'template1';

// Cloud SQL Proxy maps the database to a local port. 
// Set host to 127.0.0.1 and port to 5432 (default PostgreSQL port).
const DB_HOST = '127.0.0.1'; // <-- Simple, reliable localhost binding
const DB_PORT = 5432; 

// This variable MUST be set at deploy time for the proxy to know which instance to connect to.
const CLOUDSQL_CONNECTION_NAME = process.env.DB_CONNECTION_NAME; 

const PORT = process.env.PORT || 8080;

// 2. Configure the PostgreSQL client
const client = new Client({
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  host: DB_HOST, 
  port: DB_PORT,
  connectionTimeoutMillis: 5000,
});
// --------------------------------

// Connect to the database on startup (or implement robust connection pooling for production)
client.connect()
  .then(() => console.log('Successfully connected to Cloud SQL database!'))
  .catch(err => console.error('Connection error: Failed to connect to database using socket path.', err.stack));


const server = http.createServer((req, res) => {
  res.writeHead(200, { "content-type": "text/plain" });
  
  // Example query: check the current time in the database
  client.query('SELECT NOW()')
    .then(dbRes => {
      const dbTime = dbRes.rows[0].now;
      res.end(`Hello from Ecavo! CI/CD is LIVE!\nDatabase Time: ${dbTime}`);
    })
    .catch(err => {
      console.error('Query error:', err.stack);
      res.end(`Hello from Ecavo! CI/CD is LIVE!\nDatabase connection FAILED. Check logs for query error.`);
    });
});

server.listen(PORT, '0.0.0.0', () => { // <--- ADDED '0.0.0.0'
  console.log(`Server listening on port ${PORT} at 0.0.0.0`);
});
