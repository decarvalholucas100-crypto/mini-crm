const bcrypt = require('bcryptjs');
const { initDb, getDb } = require('./db');

initDb();
const db = getDb();

// Clear existing data (drop and recreate to reset autoincrement)
db.exec('DROP TABLE IF EXISTS deals');
db.exec('DROP TABLE IF EXISTS contacts');
db.exec('DROP TABLE IF EXISTS organizations');
db.exec('DROP TABLE IF EXISTS users');
initDb();

// Seed a default user
const hash = bcrypt.hashSync('password123', 10);
db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run('admin@crm.com', hash);

// Seed organizations
const orgs = [
  ['Acme Corp', 'Technology', 'https://acme.com'],
  ['Globex Industries', 'Manufacturing', 'https://globex.com'],
  ['Initech', 'Software', 'https://initech.com'],
  ['Umbrella Corp', 'Pharmaceuticals', 'https://umbrella.com'],
  ['Stark Industries', 'Defense', 'https://stark.com'],
  ['Wayne Enterprises', 'Conglomerate', 'https://wayne.com'],
  ['Cyberdyne Systems', 'Robotics', 'https://cyberdyne.com'],
  ['Soylent Corp', 'Food & Beverage', 'https://soylent.com'],
  ['Oscorp', 'Biotech', 'https://oscorp.com'],
  ['Wonka Industries', 'Confectionery', 'https://wonka.com'],
];

const insertOrg = db.prepare('INSERT INTO organizations (name, industry, website) VALUES (?, ?, ?)');
for (const org of orgs) {
  insertOrg.run(...org);
}

// Seed contacts
const contacts = [
  ['John', 'Smith', 'john.smith@acme.com', '555-0101', 1],
  ['Jane', 'Doe', 'jane.doe@globex.com', '555-0102', 2],
  ['Bob', 'Johnson', 'bob.johnson@initech.com', '555-0103', 3],
  ['Alice', 'Williams', 'alice.w@umbrella.com', '555-0104', 4],
  ['Tony', 'Stark', 'tony@stark.com', '555-0105', 5],
  ['Bruce', 'Wayne', 'bruce@wayne.com', '555-0106', 6],
  ['Sarah', 'Connor', 'sarah@cyberdyne.com', '555-0107', 7],
  ['Frank', 'Ocean', 'frank@soylent.com', '555-0108', 8],
  ['Peter', 'Parker', 'peter@oscorp.com', '555-0109', 9],
  ['Charlie', 'Bucket', 'charlie@wonka.com', '555-0110', 10],
];

const insertContact = db.prepare('INSERT INTO contacts (first_name, last_name, email, phone, organization_id) VALUES (?, ?, ?, ?, ?)');
for (const contact of contacts) {
  insertContact.run(...contact);
}

// Seed deals
const deals = [
  ['Cloud Migration', 120000, 'prospecting', 1, 1],
  ['ERP Implementation', 250000, 'qualification', 2, 2],
  ['Software License', 45000, 'proposal', 3, 3],
  ['Lab Equipment', 89000, 'negotiation', 4, 4],
  ['Defense Contract', 500000, 'closed_won', 5, 5],
  ['Security Systems', 175000, 'proposal', 6, 6],
  ['AI Platform', 320000, 'qualification', 7, 7],
  ['Supply Chain Deal', 67000, 'prospecting', 8, 8],
  ['Research Grant', 95000, 'negotiation', 9, 9],
  ['Distribution Deal', 130000, 'closed_won', 10, 10],
];

const insertDeal = db.prepare('INSERT INTO deals (title, value, stage, contact_id, organization_id) VALUES (?, ?, ?, ?, ?)');
for (const deal of deals) {
  insertDeal.run(...deal);
}

console.log('Database seeded successfully.');
console.log('Default user: admin@crm.com / password123');
