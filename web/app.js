// Micro-DB Manager Application JavaScript

// API Base URL
const API_BASE = '/api';

// Tab Management
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

// SQL Query Functions
async function executeQuery() {
    const sql = document.getElementById('sqlInput').value.trim();
    const resultContainer = document.getElementById('queryResult');
    
    if (!sql) {
        showResult(resultContainer, 'Please enter a SQL query', 'error');
        return;
    }
    
    try {
        showResult(resultContainer, 'Executing query...', 'info');
        
        const response = await fetch(`${API_BASE}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sql })
        });
        
        const data = await response.json();
        
        if (data.error) {
            showResult(resultContainer, `Error: ${data.error}`, 'error');
        } else {
            displayQueryResult(resultContainer, data.result);
        }
    } catch (error) {
        showResult(resultContainer, `Network Error: ${error.message}`, 'error');
    }
}

function displayQueryResult(container, result) {
    if (typeof result === 'string') {
        showResult(container, result, 'success');
    } else if (Array.isArray(result)) {
        if (result.length === 0) {
            showResult(container, 'Empty set', 'success');
        } else {
            let html = '<table><thead><tr>';
            
            // Add table headers
            Object.keys(result[0]).forEach(key => {
                html += `<th>${escapeHtml(key)}</th>`;
            });
            html += '</tr></thead><tbody>';
            
            // Add table rows
            result.forEach(row => {
                html += '<tr>';
                Object.values(row).forEach(value => {
                    html += `<td>${escapeHtml(String(value))}</td>`;
                });
                html += '</tr>';
            });
            html += '</tbody></table>';
            
            container.innerHTML = html;
            container.className = 'result-container success';
        }
    } else if (typeof result === 'object') {
        // Show object result (like DESCRIBE)
        let html = '<table><thead><tr><th>Column</th><th>Type</th></tr></thead><tbody>';
        Object.entries(result).forEach(([key, value]) => {
            html += `<tr><td>${escapeHtml(key)}</td><td>${escapeHtml(value)}</td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
        container.className = 'result-container success';
    } else {
        showResult(container, String(result), 'success');
    }
}

function showResult(container, message, type) {
    container.innerHTML = `<div class="status ${type}">${escapeHtml(message)}</div>`;
    container.className = `result-container ${type}`;
}

function clearQuery() {
    document.getElementById('sqlInput').value = '';
    document.getElementById('queryResult').innerHTML = '';
    document.getElementById('queryResult').className = 'result-container';
}

// Table Management Functions
async function loadTables() {
    try {
        const response = await fetch(`${API_BASE}/tables`);
        const data = await response.json();
        
        if (data.error) {
            alert(`Error: ${data.error}`);
            return;
        }
        
        const tablesList = document.getElementById('tablesList');
        
        if (data.tables.length === 0) {
            tablesList.innerHTML = '<p>No tables found. Create a table to get started!</p>';
            document.getElementById('tableData').innerHTML = '';
        } else {
            tablesList.innerHTML = data.tables.map(table => 
                `<div class="table-item" onclick="loadTableData('${table}')">📋 ${escapeHtml(table)}</div>`
            ).join('');
            
            // Load first table by default
            loadTableData(data.tables[0]);
        }
    } catch (error) {
        alert(`Error loading tables: ${error.message}`);
    }
}

async function loadTableData(tableName) {
    try {
        const response = await fetch(`${API_BASE}/${tableName}`);
        const data = await response.json();
        
        if (data.error) {
            alert(`Error: ${data.error}`);
            return;
        }
        
        const tableData = document.getElementById('tableData');
        
        if (data.data.length === 0) {
            tableData.innerHTML = `<h3>📋 ${escapeHtml(tableName)}</h3><p>No data in table</p>`;
        } else {
            let html = `<h3>📋 ${escapeHtml(tableName)}</h3>`;
            html += '<table><thead><tr>';
            
            // Add table headers
            Object.keys(data.data[0]).forEach(key => {
                html += `<th>${escapeHtml(key)}</th>`;
            });
            html += '</tr></thead><tbody>';
            
            // Add table rows
            data.data.forEach(row => {
                html += '<tr>';
                Object.values(row).forEach(value => {
                    html += `<td>${escapeHtml(String(value))}</td>`;
                });
                html += '</tr>';
            });
            html += '</tbody></table>';
            
            tableData.innerHTML = html;
        }
    } catch (error) {
        alert(`Error loading table data: ${error.message}`);
    }
}

async function dropTable() {
    const tableName = prompt('Enter table name to drop (this will delete all data):');
    
    if (!tableName) return;
    
    try {
        const response = await fetch(`${API_BASE}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sql: `DROP TABLE ${tableName}` })
        });
        
        const data = await response.json();
        
        if (data.error) {
            alert(`Error: ${data.error}`);
        } else {
            alert('Table dropped successfully');
            loadTables();
        }
    } catch (error) {
        alert(`Error dropping table: ${error.message}`);
    }
}

// Create Table Functions
function addColumn() {
    const container = document.getElementById('columnsContainer');
    const columnRow = document.createElement('div');
    columnRow.className = 'column-row';
    columnRow.innerHTML = `
        <input type="text" class="col-name" placeholder="Column name">
        <select class="col-type">
            <option value="TEXT">TEXT</option>
            <option value="NUMBER">NUMBER</option>
            <option value="INTEGER">INTEGER</option>
            <option value="BOOLEAN">BOOLEAN</option>
            <option value="DATE">DATE</option>
        </select>
        <label class="checkbox-label">
            <input type="checkbox" class="col-primary"> Primary Key
        </label>
        <label class="checkbox-label">
            <input type="checkbox" class="col-unique"> Unique
        </label>
        <button onclick="removeColumn(this)" class="btn small danger">✕</button>
    `;
    container.appendChild(columnRow);
}

function removeColumn(button) {
    const container = document.getElementById('columnsContainer');
    if (container.children.length > 1) {
        button.parentElement.remove();
    } else {
        alert('Table must have at least one column');
    }
}

async function createTable() {
    const tableName = document.getElementById('tableName').value.trim();
    
    if (!tableName) {
        alert('Please enter a table name');
        return;
    }
    
    const columns = [];
    const columnRows = document.querySelectorAll('.column-row');
    
    columnRows.forEach(row => {
        const name = row.querySelector('.col-name').value.trim();
        const type = row.querySelector('.col-type').value;
        const isPrimary = row.querySelector('.col-primary').checked;
        const isUnique = row.querySelector('.col-unique').checked;
        
        if (name) {
            let columnDef = `${name} ${type}`;
            if (isPrimary) columnDef += ' PRIMARY KEY';
            if (isUnique) columnDef += ' UNIQUE';
            columns.push(columnDef);
        }
    });
    
    if (columns.length === 0) {
        alert('Please add at least one column');
        return;
    }
    
    const sql = `CREATE TABLE ${tableName} (${columns.join(', ')})`;
    
    try {
        const response = await fetch(`${API_BASE}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sql })
        });
        
        const data = await response.json();
        
        if (data.error) {
            alert(`Error: ${data.error}`);
        } else {
            alert('Table created successfully!');
            // Reset form
            document.getElementById('tableName').value = '';
            const container = document.getElementById('columnsContainer');
            container.innerHTML = `
                <div class="column-row">
                    <input type="text" class="col-name" placeholder="Column name">
                    <select class="col-type">
                        <option value="TEXT">TEXT</option>
                        <option value="NUMBER">NUMBER</option>
                        <option value="INTEGER">INTEGER</option>
                        <option value="BOOLEAN">BOOLEAN</option>
                        <option value="DATE">DATE</option>
                    </select>
                    <label class="checkbox-label">
                        <input type="checkbox" class="col-primary"> Primary Key
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" class="col-unique"> Unique
                    </label>
                    <button onclick="removeColumn(this)" class="btn small danger">✕</button>
                </div>
            `;
            
            // Switch to tables tab and refresh
            document.querySelector('[data-tab="tables"]').click();
            loadTables();
        }
    } catch (error) {
        alert(`Error creating table: ${error.message}`);
    }
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to execute query
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (document.getElementById('sqlInput').value.trim()) {
            executeQuery();
        }
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load tables if on tables tab
    if (document.getElementById('tables').classList.contains('active')) {
        loadTables();
    }
});
