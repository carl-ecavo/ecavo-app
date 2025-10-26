import http from "node:http";
import { Client } from 'pg';

// 1. Get connection details from environment/secrets
const DB_USER = 'postgres'; 
const DB_PASSWORD = process.env.DB_PASS; // Injected from Secret Manager
const DB_NAME = 'postgres';
const CLOUDSQL_CONNECTION_NAME = 'totemic-chimera-476220-n3:europe-west1:ecavo-db-dev';
const CLOUDSQL_HOST = `/cloudsql/${CLOUDSQL_CONNECTION_NAME}`; // This path is required for the Cloud SQL Proxy

const PORT = process.env.PORT || 8080;

// 2. Configure the PostgreSQL client
const client = new Client({
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  host: CLOUDSQL_HOST, 
});

// Connect to the database on startup (or implement robust connection pooling for production)
client.connect()
  .then(() => console.log('Successfully connected to Cloud SQL database!'))
  .catch(err => console.error('Connection error', err.stack));

// 3. Simple HTTP server logic
const server = http.createServer((req, res) => {
  res.writeHead(200, { "content-type": "text/plain" });
  
  // Example query: check the current time in the database
  client.query('SELECT NOW()')
    .then(dbRes => {
      const dbTime = dbRes.rows[0].now;
      res.end(`Hello from Ecavo! CI/CD is LIVE!\nDatabase Time: ${dbTime}`);
    })
    .catch(err => {
      console.error('Query error', err.stack);
      res.end(`Hello from Ecavo! CI/CD is LIVE!\nDatabase connection FAILED. Check logs for error.`);
    });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
