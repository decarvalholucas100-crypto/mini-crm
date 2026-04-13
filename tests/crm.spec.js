const { test, expect } = require('@playwright/test');
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'crm.db');

test('login, create contact with org and deal, verify in database', async ({ page }) => {
  // 1. Navigate to the app and log in
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Mini CRM');

  await page.fill('#email', 'admin@crm.com');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');

  // 2. Wait for dashboard to load
  await expect(page.locator('.dashboard-header h1')).toHaveText('Mini CRM Dashboard', { timeout: 10000 });

  // 3. Open the create form via header button
  await page.click('text=+ New Contact');
  await expect(page.locator('[data-testid="create-contact-form"]')).toBeVisible();

  // 4. Fill in contact fields
  await page.fill('#first_name', 'Playwright');
  await page.fill('#last_name', 'TestUser');
  await page.fill('#contact_email', 'playwright@test.com');
  await page.fill('#phone', '555-9999');

  // 5. Fill in organization fields
  await page.fill('#org_name', 'TestCorp');
  await page.fill('#org_industry', 'Testing');
  await page.fill('#org_website', 'https://testcorp.com');

  // 6. Fill in deal fields
  await page.fill('#deal_title', 'Test Deal');
  await page.fill('#deal_value', '75000');
  await page.selectOption('#deal_stage', 'proposal');

  // 7. Submit the form
  await page.click('button.btn-create');

  // 8. Wait for success message
  await expect(page.locator('.success-msg')).toHaveText('Contact created successfully!', { timeout: 5000 });

  // 9. Verify all three records appear in the tables
  await expect(page.locator('text=Playwright TestUser').first()).toBeVisible();
  await expect(page.locator('td:has-text("TestCorp")').first()).toBeVisible();
  await expect(page.locator('td:has-text("Test Deal")').first()).toBeVisible();

  // 10. Query SQLite directly to verify all records
  const db = new Database(DB_PATH, { readonly: true });

  const contact = db.prepare('SELECT * FROM contacts WHERE email = ?').get('playwright@test.com');
  expect(contact).toBeTruthy();
  expect(contact.first_name).toBe('Playwright');
  expect(contact.last_name).toBe('TestUser');
  expect(contact.phone).toBe('555-9999');

  const org = db.prepare('SELECT * FROM organizations WHERE name = ?').get('TestCorp');
  expect(org).toBeTruthy();
  expect(org.industry).toBe('Testing');
  expect(org.website).toBe('https://testcorp.com');

  // Contact should be linked to the organization
  expect(contact.organization_id).toBe(org.id);

  const deal = db.prepare('SELECT * FROM deals WHERE title = ?').get('Test Deal');
  expect(deal).toBeTruthy();
  expect(deal.value).toBe(75000);
  expect(deal.stage).toBe('proposal');
  expect(deal.contact_id).toBe(contact.id);
  expect(deal.organization_id).toBe(org.id);

  db.close();
});
