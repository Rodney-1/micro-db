const express = require('express');
const { execute } = require('../data/engine');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('../../web'));

// REST API endpoints
app.post('/api/query', (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql) {
      return res.status(400).json({ error: 'SQL query is required' });
    }
    
    const result = execute(sql);
    res.json({ result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Helper endpoint to execute queries with method GET for testing
app.get('/api/tables', (req, res) => {
  try {
    const result = execute('SHOW TABLES');
    res.json({ tables: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/describe/:tableName', (req, res) => {
  try {
    const { tableName } = req.params;
    const result = execute(`DESCRIBE ${tableName}`);
    res.json({ schema: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/:tableName', (req, res) => {
  try {
    const { tableName } = req.params;
    const result = execute(`SELECT * FROM ${tableName}`);
    res.json({ data: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', database: 'Micro-DB' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Micro-DB Server running on http://localhost:${PORT}`);
  console.log(`Web interface available at http://localhost:${PORT}/`);
  console.log('REST API endpoints:');
  console.log('  POST /api/query - Execute SQL query');
  console.log('  GET  /api/tables - List all tables');
  console.log('  GET  /api/describe/:tableName - Describe table schema');
  console.log('  GET  /api/:tableName - Get all rows from table');
});

module.exports = app;
