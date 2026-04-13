const { test, expect } = require('@playwright/test');
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'crm.db');

test('login, create contact, verify in database', async ({ page }) => {
  // 1. Navigate to the app and log in
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Mini CRM');

  await page.fill('#email', 'admin@crm.com');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');

  // 2. Wait for dashboard to load
  await expect(page.locator('.dashboard-header h1')).toHaveText('Mini CRM Dashboard', { timeout: 10000 });

  // 3. Open the create contact form
  await page.click('text=+ New Contact');
  await expect(page.locator('[data-testid="create-contact-form"]')).toBeVisible();

  // 4. Fill in the new contact form
  const testContact = {
    first_name: 'Playwright',
    last_name: 'TestUser',
    email: 'playwright@test.com',
    phone: '555-9999',
  };

  await page.fill('#first_name', testContact.first_name);
  await page.fill('#last_name', testContact.last_name);
  await page.fill('#contact_email', testContact.email);
  await page.fill('#phone', testContact.phone);

  // 5. Submit the form
  await page.click('button.btn-create');

  // 6. Wait for success message
  await expect(page.locator('.success-msg')).toHaveText('Contact created successfully!', { timeout: 5000 });

  // 7. Verify the contact appears in the table
  await expect(page.locator('text=Playwright TestUser')).toBeVisible();

  // 8. Query SQLite directly to verify the contact exists in the database
  const db = new Database(DB_PATH, { readonly: true });
  const contact = db.prepare(
    'SELECT * FROM contacts WHERE email = ?'
  ).get('playwright@test.com');
  db.close();

  expect(contact).toBeTruthy();
  expect(contact.first_name).toBe('Playwright');
  expect(contact.last_name).toBe('TestUser');
  expect(contact.email).toBe('playwright@test.com');
  expect(contact.phone).toBe('555-9999');
});
