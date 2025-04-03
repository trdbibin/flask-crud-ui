# app.py
from flask import Flask, request, jsonify, render_template
import sqlite3
from datetime import datetime

app = Flask(__name__)

# Create in-memory DB and table
def init_db():
    conn = sqlite3.connect(':memory:', check_same_thread=False)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            author TEXT,
            category TEXT,
            created_at TEXT
        )
    ''')
    # Add sample data
    cur.execute('INSERT INTO records (title, description, author, category, created_at) VALUES (?, ?, ?, ?, ?)',
                ("Welcome", "This is the first record", "Admin", "General", datetime.utcnow().isoformat()))
    conn.commit()
    return conn

db = init_db()

def row_to_dict(row):
    return {key: row[key] for key in row.keys()}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/records', methods=['GET'])
def get_records():
    rows = db.execute('SELECT * FROM records').fetchall()
    return jsonify([row_to_dict(row) for row in rows])

@app.route('/api/records', methods=['POST'])
def add_record():
    data = request.json
    now = datetime.utcnow().isoformat()
    db.execute('''
        INSERT INTO records (title, description, author, category, created_at)
        VALUES (?, ?, ?, ?, ?)
    ''', (data['title'], data['description'], data['author'], data['category'], now))
    db.commit()
    return jsonify({"message": "Record added"}), 201

@app.route('/api/records/<int:record_id>', methods=['PUT'])
def update_record(record_id):
    data = request.json
    db.execute('''
        UPDATE records
        SET title = ?, description = ?, author = ?, category = ?
        WHERE id = ?
    ''', (data['title'], data['description'], data['author'], data['category'], record_id))
    db.commit()
    return jsonify({"message": "Record updated"})

@app.route('/api/records/<int:record_id>', methods=['DELETE'])
def delete_record(record_id):
    db.execute('DELETE FROM records WHERE id = ?', (record_id,))
    db.commit()
    return jsonify({"message": "Record deleted"})

if __name__ == '__main__':
    app.run(debug=True)