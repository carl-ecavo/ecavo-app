import http from "node:http";
import { Client } from 'pg';

// New client configuration in server.js

// --- CONNECTION CONFIGURATION ---
const DB_USER = 'postgres'; 
const DB_PASSWORD = process.env.DB_PASS; // Secret Manager injection
const DB_NAME = 'postgres';

// Use the full Instance Connection Name
// const CLOUDSQL_CONNECTION_NAME = 'totemic-chimera-476220-n3:europe-west1:ecavo-db-dev';
// This variable will be set by the 'gcloud run deploy' command for each environment.
const CLOUDSQL_CONNECTION_NAME = process.env.DB_CONNECTION_NAME;

// Construct the URL using the Unix Socket Format explicitly.
// Format: postgres://USER:PASSWORD@HOST:PORT/DATABASE?options
const CONNECTION_URL = 
  `postgres://${DB_USER}:${DB_PASSWORD}@/` +
  `${DB_NAME}?host=/cloudsql/${CLOUDSQL_CONNECTION_NAME}`;

const PORT = process.env.PORT || 8080;

// 2. Configure the PostgreSQL client
// Pass the entire URL string to the Client constructor
const client = new Client({
  connectionString: CONNECTION_URL, // 🚨 FINAL FIX: Use the full connection string
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
