const express = require('express');
const { getDb } = require('../db');

function createCrudRouter(tableName, columns) {
  const router = express.Router();

  // GET all
  router.get('/', (req, res) => {
    const db = getDb();
    const rows = db.prepare(`SELECT * FROM ${tableName} ORDER BY id DESC`).all();
    res.json(rows);
  });

  // GET by id
  router.get('/:id', (req, res) => {
    const db = getDb();
    const row = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });

  // POST create
  router.post('/', (req, res) => {
    const db = getDb();
    const keys = columns.filter(c => req.body[c] !== undefined);
    const vals = keys.map(k => req.body[k]);

    if (keys.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided' });
    }

    const placeholders = keys.map(() => '?').join(', ');
    const stmt = db.prepare(`INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`);
    const result = stmt.run(...vals);

    const created = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(result.lastInsertRowid);
    res.status(201).json(created);
  });

  // PUT update
  router.put('/:id', (req, res) => {
    const db = getDb();
    const keys = columns.filter(c => req.body[c] !== undefined);
    const vals = keys.map(k => req.body[k]);

    if (keys.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided' });
    }

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const stmt = db.prepare(`UPDATE ${tableName} SET ${setClause} WHERE id = ?`);
    const result = stmt.run(...vals, req.params.id);

    if (result.changes === 0) return res.status(404).json({ error: 'Not found' });

    const updated = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(req.params.id);
    res.json(updated);
  });

  // DELETE
  router.delete('/:id', (req, res) => {
    const db = getDb();
    const result = db.prepare(`DELETE FROM ${tableName} WHERE id = ?`).run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  });

  return router;
}

module.exports = { createCrudRouter };
