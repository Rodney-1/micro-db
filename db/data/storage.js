cat > db/storage.js << 'EOF'
const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "data");
const schemaPath = path.join(dataDir, "schema.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(schemaPath)) {
  fs.writeFileSync(schemaPath, JSON.stringify({}, null, 2));
}

function loadSchema() {
  return JSON.parse(fs.readFileSync(schemaPath, "utf8"));
}

function saveSchema(schema) {
  fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
}

function getTablePath(name) {
  return path.join(dataDir, `${name}.json`);
}

function createTable(name) {
  const tablePath = getTablePath(name);
  fs.writeFileSync(tablePath, JSON.stringify([], null, 2));
}

function loadTable(name) {
  const tablePath = getTablePath(name);
  if (!fs.existsSync(tablePath)) {
    throw new Error(`Table ${name} does not exist`);
  }
  return JSON.parse(fs.readFileSync(tablePath, "utf8"));
}

function saveTable(name, rows) {
  fs.writeFileSync(getTablePath(name), JSON.stringify(rows, null, 2));
}

module.exports = {
  loadSchema,
  saveSchema,
  createTable,
  loadTable,
  saveTable
};
EOF