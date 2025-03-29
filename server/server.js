const express = require('express');
const cors = require('cors');
const path = require('path');
const neo4j = require('neo4j-driver');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Neo4j connection - use environment variables or defaults
const driver = neo4j.driver(
  process.env.NEO4J_URI || 'neo4j://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'password'
  )
);

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Import API routes here
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Serve static files from the React build
app.use(express.static(path.join(__dirname, '../client/build')));

// For any request that doesn't match an API route, serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});