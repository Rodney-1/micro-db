const { loadSchema, saveSchema, createTable, loadTable, saveTable } = require("./storage");

function execute(sql) {
  sql = sql.trim();

  if (sql.toUpperCase().startsWith("CREATE TABLE")) {
    const match = sql.match(/CREATE TABLE (\w+) \((.+)\)/i);
    if (!match) throw new Error("Invalid CREATE TABLE syntax");

    const tableName = match[1];
    const cols = match[2].split(",").map(c => c.trim());

    const columns = {};
    for (let col of cols) {
      const parts = col.split(/\s+/);
      const name = parts[0];
      const type = parts[1] || "TEXT";
      columns[name] = type;
    }

    const schema = loadSchema();
    if (schema[tableName]) {
      throw new Error(`Table ${tableName} already exists`);
    }
    
    schema[tableName] = { columns };
    saveSchema(schema);
    createTable(tableName);

    return `Table ${tableName} created`;
  }

  if (sql.toUpperCase().startsWith("INSERT INTO")) {
    const match = sql.match(/INSERT INTO (\w+) \(([^)]+)\) VALUES \(([^)]+)\)/i);
    if (!match) throw new Error("Invalid INSERT syntax");

    const tableName = match[1];
    const colNames = match[2].split(",").map(c => c.trim());
    const values = match[3].split(",").map(v => {
      v = v.trim();
      if ((v.startsWith("'") && v.endsWith("'")) || 
          (v.startsWith('"') && v.endsWith('"'))) {
        return v.slice(1, -1);
      }
      const num = Number(v);
      return isNaN(num) ? v : num;
    });

    const schema = loadSchema();
    if (!schema[tableName]) {
      throw new Error(`Table ${tableName} does not exist`);
    }

    const rows = loadTable(tableName);
    const newRow = {};
    colNames.forEach((col, i) => {
      newRow[col] = values[i];
    });

    rows.push(newRow);
    saveTable(tableName, rows);

    return `1 row inserted into ${tableName}`;
  }

  if (sql.toUpperCase().startsWith("SELECT")) {
    const match = sql.match(/SELECT (.+) FROM (\w+)(?:\s+WHERE (.+))?/i);
    if (!match) throw new Error("Invalid SELECT syntax");

    const cols = match[1].trim();
    const tableName = match[2];
    const whereClause = match[3];

    const schema = loadSchema();
    if (!schema[tableName]) {
      throw new Error(`Table ${tableName} does not exist`);
    }

    let rows = loadTable(tableName);

    if (whereClause) {
      const condMatch = whereClause.match(/(\w+)\s*=\s*(.+)/);
      if (condMatch) {
        const col = condMatch[1];
        let val = condMatch[2].trim();
        if ((val.startsWith("'") && val.endsWith("'")) || 
            (val.startsWith('"') && val.endsWith('"'))) {
          val = val.slice(1, -1);
        }
        const num = Number(val);
        const compareVal = isNaN(num) ? val : num;
        
        rows = rows.filter(row => row[col] == compareVal);
      }
    }

    if (cols === "*") {
      return rows;
    } else {
      const selectedCols = cols.split(",").map(c => c.trim());
      return rows.map(row => {
        const result = {};
        selectedCols.forEach(col => {
          result[col] = row[col];
        });
        return result;
      });
    }
  }

  // ADD UPDATE operation
  if (sql.toUpperCase().startsWith("UPDATE")) {
    const match = sql.match(/UPDATE (\w+) SET (.+)(?:\s+WHERE (.+))?/i);
    if (!match) throw new Error("Invalid UPDATE syntax");

    const tableName = match[1];
    const setClause = match[2];
    const whereClause = match[3];

    const schema = loadSchema();
    if (!schema[tableName]) {
      throw new Error(`Table ${tableName} does not exist`);
    }

    // Parse SET clause: col1=val1, col2=val2
    const updates = {};
    const setParts = setClause.split(",").map(s => s.trim());
    setParts.forEach(part => {
      const [col, val] = part.split("=").map(s => s.trim());
      let value = val;
      if ((val.startsWith("'") && val.endsWith("'")) || 
          (val.startsWith('"') && val.endsWith('"'))) {
        value = val.slice(1, -1);
      } else {
        const num = Number(val);
        if (!isNaN(num)) value = num;
      }
      updates[col] = value;
    });

    let rows = loadTable(tableName);
    let updatedCount = 0;

    if (whereClause) {
      const condMatch = whereClause.match(/(\w+)\s*=\s*(.+)/);
      if (condMatch) {
        const col = condMatch[1];
        let val = condMatch[2].trim();
        if ((val.startsWith("'") && val.endsWith("'")) || 
            (val.startsWith('"') && val.endsWith('"'))) {
          val = val.slice(1, -1);
        }
        const num = Number(val);
        const compareVal = isNaN(num) ? val : num;
        
        rows.forEach(row => {
          if (row[col] == compareVal) {
            Object.assign(row, updates);
            updatedCount++;
          }
        });
      }
    } else {
      // Update all rows if no WHERE clause
      rows.forEach(row => {
        Object.assign(row, updates);
        updatedCount++;
      });
    }

    saveTable(tableName, rows);
    return `${updatedCount} row(s) updated in ${tableName}`;
  }

  // ADD DELETE operation
  if (sql.toUpperCase().startsWith("DELETE FROM")) {
    const match = sql.match(/DELETE FROM (\w+)(?:\s+WHERE (.+))?/i);
    if (!match) throw new Error("Invalid DELETE syntax");

    const tableName = match[1];
    const whereClause = match[2];

    const schema = loadSchema();
    if (!schema[tableName]) {
      throw new Error(`Table ${tableName} does not exist`);
    }

    let rows = loadTable(tableName);
    let deletedCount = 0;

    if (whereClause) {
      const condMatch = whereClause.match(/(\w+)\s*=\s*(.+)/);
      if (condMatch) {
        const col = condMatch[1];
        let val = condMatch[2].trim();
        if ((val.startsWith("'") && val.endsWith("'")) || 
            (val.startsWith('"') && val.endsWith('"'))) {
          val = val.slice(1, -1);
        }
        const num = Number(val);
        const compareVal = isNaN(num) ? val : num;
        
        const originalLength = rows.length;
        rows = rows.filter(row => row[col] != compareVal);
        deletedCount = originalLength - rows.length;
      }
    } else {
      // Delete all rows if no WHERE clause
      deletedCount = rows.length;
      rows = [];
    }

    saveTable(tableName, rows);
    return `${deletedCount} row(s) deleted from ${tableName}`;
  }

  if (sql.toUpperCase() === "SHOW TABLES") {
    const schema = loadSchema();
    return Object.keys(schema);
  }

  if (sql.toUpperCase().startsWith("DESCRIBE") || sql.toUpperCase().startsWith("DESC")) {
    const match = sql.match(/DESC(?:RIBE)?\s+(\w+)/i);
    if (!match) throw new Error("Invalid DESCRIBE syntax");
    
    const tableName = match[1];
    const schema = loadSchema();
    if (!schema[tableName]) {
      throw new Error(`Table ${tableName} does not exist`);
    }
    
    return schema[tableName].columns;
  }

  throw new Error("Unknown SQL command");
}

module.exports = { execute };

