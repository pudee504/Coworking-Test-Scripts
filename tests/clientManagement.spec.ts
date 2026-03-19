import { test, expect } from '@playwright/test';
import { exec } from 'node:child_process';
import { off } from 'node:cluster';
import { Sign } from 'node:crypto';
import { isGeneratorObject } from 'node:util/types';

/** COMMENTED ON PURPOSE TO PREVENT ADDING NEW CLIENT ON SCRIPT RUN */
// test('Verify Add Client Button Functionality', async ({ page }) => {
//   await page.goto('https://staging-coworking-app.mugna.tech/login');
//   await page.waitForTimeout(2000);
//   await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

//   await page.locator('#email').click();
//   await page.getByPlaceholder('Enter your email').fill('febyroseberame@gmail.com');

//   await page.locator('#password').click();
//   await page.getByPlaceholder('Enter your password').fill('Mugna123!');
//   await page.getByRole('button', { name: 'Sign In' }).click();

//   await page.waitForTimeout(2000);

//   await page.getByRole('button', { name: 'Client Management' }).click();
//   await page.waitForTimeout(2000);
//   await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/management');
//   await expect(page.getByRole('heading', { name: 'Management' })).toBeVisible();

//   await page.getByRole('button', { name: 'Add Client' }).click();
//   await expect(page.getByRole('heading', { name: 'Add New Client' })).toBeVisible();

//   const uniqueId = Date.now();

//   const firstName = 'PlayWrightScript';
//   const lastName = `Test${uniqueId}`;
//   const email = `pws${uniqueId}@g.com`;
//   const phone = `099${uniqueId.toString().slice(-8)}`;

//   await page.locator('#firstName').fill(firstName);
//   await page.locator('#lastName').fill(lastName);
//   await page.locator('#email').fill(email);
//   await page.locator('#phone').fill(phone);

//   await page.getByRole('combobox').filter({ hasText: 'No Package' }).click();
//   await page.getByRole('option', { name: 'Mugna Premium Package' }).click();
//   //   await page.getByRole('button', { name: 'Add Client' }).click(); Commented on Purpose to Avoid Adding a New Client

//   await page.waitForTimeout(2000);

//   await expect(page.locator('#firstName')).toHaveValue(firstName);
//   await expect(page.locator('#lastName')).toHaveValue(lastName);
//   await expect(page.locator('#email')).toHaveValue(email);
//   await expect(page.locator('#phone')).toHaveValue(phone);
// });

test('Verify Search Client Filter Functionality', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.locator('#email').click();
  await page.getByPlaceholder('Enter your email').fill('febyroseberame@gmail.com');

  await page.locator('#password').click();
  await page.getByPlaceholder('Enter your password').fill('Mugna123!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForTimeout(2000);

  await page.getByRole('button', { name: 'Client Management' }).click();
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/management');
  await expect(page.getByRole('heading', { name: 'Management' })).toBeVisible();

  await page.getByRole('textbox', { name: 'Search clients...' }).fill('Kim Alexander Dayao');
  await expect(page.locator('table')).toContainText('Kim Alexander Dayao');
});

test('Verify Empty State Search When No Results Found', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.locator('#email').click();
  await page.getByPlaceholder('Enter your email').fill('febyroseberame@gmail.com');

  await page.locator('#password').click();
  await page.getByPlaceholder('Enter your password').fill('Mugna123!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForTimeout(2000);

  await page.getByRole('button', { name: 'Client Management' }).click();
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/management');
  await expect(page.getByRole('heading', { name: 'Management' })).toBeVisible();

  await page.getByRole('textbox', { name: 'Search clients...' }).fill('EmptyStateSearch');
  await expect(page.locator('table')).toContainText('No clients found');
});

test('Verify Packages Filter Functionality', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.locator('#email').click();
  await page.getByPlaceholder('Enter your email').fill('febyroseberame@gmail.com');

  await page.locator('#password').click();
  await page.getByPlaceholder('Enter your password').fill('Mugna123!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForTimeout(2000);

  await page.getByRole('button', { name: 'Client Management' }).click();
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/management');
  await expect(page.getByRole('heading', { name: 'Management' })).toBeVisible();

  await page.getByRole('combobox').filter({ hasText: 'All Packages' }).click();
  await page.getByRole('option', { name: 'Mugna Premium Package' }).click();
  await page.waitForTimeout(2000);

  const rows = page.locator('table tbody tr');
  const rowCount = await rows.count();

  for (let i = 0; i < rowCount; i++) {
    const packageText = await rows.nth(i).locator('td:nth-child(3)').innerText();

    expect(packageText.trim()).toBe('Mugna Premium Package'); // MUGNA PREMIUM PACKAGE
  }
});

/** COMMENTED ON PURPOSE DUE TO FILTER BUG ISSUE */
// test('Verify Status Filter Functionality', async ({ page }) => {
//   await page.goto('https://staging-coworking-app.mugna.tech/login');
//   await page.waitForTimeout(2000);
//   await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

//   await page.locator('#email').click();
//   await page.getByPlaceholder('Enter your email').fill('febyroseberame@gmail.com');

//   await page.locator('#password').click();
//   await page.getByPlaceholder('Enter your password').fill('Mugna123!');
//   await page.getByRole('button', { name: 'Sign In' }).click();

//   await page.waitForTimeout(2000);

//   await page.getByRole('button', { name: 'Client Management' }).click();
//   await page.waitForTimeout(2000);
//   await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/management');
//   await expect(page.getByRole('heading', { name: 'Management' })).toBeVisible();

//   await page.getByRole('combobox').filter({ hasText: 'All Status' }).click();
//   await page.getByRole('option', { name: 'Expired' }).click();
//   await page.waitForTimeout(2000);

//   const rows = page.locator('table tbody tr');
//   const rowCount = await rows.count();

//   for (let i = 0; i < rowCount; i++) {
//     const statusText = await rows.nth(i).locator('td:nth-child(4)').innerText();
//     expect(statusText.trim()).toBe('Expired'); // EXPIRED
//   }
// });

test('Verify Clear Filters Button Functionality', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.locator('#email').click();
  await page.getByPlaceholder('Enter your email').fill('febyroseberame@gmail.com');

  await page.locator('#password').click();
  await page.getByPlaceholder('Enter your password').fill('Mugna123!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForTimeout(2000);

  await page.getByRole('button', { name: 'Client Management' }).click();
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/management');
  await expect(page.getByRole('heading', { name: 'Management' })).toBeVisible();

  await page.getByRole('textbox', { name: 'Search clients...' }).fill('Kim Alexander Dayao');

  await page.getByRole('combobox').filter({ hasText: 'All Packages' }).click();
  await page.getByRole('option', { name: 'Mugna Premium Package' }).click();

  await page.getByRole('combobox').filter({ hasText: 'All Status' }).click();
  await page.getByRole('option', { name: 'Active' }).click();

  await page.getByRole('button', { name: 'Clear filters' }).click();

  await expect(page.getByRole('textbox', { name: 'Search clients...' })).toHaveValue('');
  await expect(page.getByRole('combobox').filter({ hasText: 'All Packages' })).toBeVisible();
  await expect(page.getByRole('combobox').filter({ hasText: 'All Status' })).toBeVisible();
});

test('Verify View Button Functionality', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.locator('#email').click();
  await page.getByPlaceholder('Enter your email').fill('febyroseberame@gmail.com');

  await page.locator('#password').click();
  await page.getByPlaceholder('Enter your password').fill('Mugna123!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForTimeout(2000);

  await page.getByRole('button', { name: 'Client Management' }).click();
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/management');
  await expect(page.getByRole('heading', { name: 'Management' })).toBeVisible();

  await page.getByRole('button', { name: 'View' }).first().click();

  await expect(page.getByRole('heading', { name: 'Client Details' })).toBeVisible();
});

/** COMMENTED ON PURPOSE TO PREVENT CLIENT EDIT */
// test('Verify Client Edit Functionality', async ({ page }) => {
//   await page.goto('https://staging-coworking-app.mugna.tech/login');
//   await page.waitForTimeout(2000);
//   await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

//   await page.locator('#email').click();
//   await page.getByPlaceholder('Enter your email').fill('febyroseberame@gmail.com');

//   await page.locator('#password').click();
//   await page.getByPlaceholder('Enter your password').fill('Mugna123!');
//   await page.getByRole('button', { name: 'Sign In' }).click();

//   await page.waitForTimeout(2000);

//   await page.getByRole('button', { name: 'Client Management' }).click();
//   await page.waitForTimeout(2000);
//   await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/management');
//   await expect(page.getByRole('heading', { name: 'Management' })).toBeVisible();

//   /** INFORMATION EDIT */
//   await page
//     .locator('tbody tr')
//     .filter({
//       hasText: 'Expired',
//     })
//     .first()
//     .getByRole('button', { name: 'View' })
//     .click();

//   await expect(page.getByRole('heading', { name: 'Client Details' })).toBeVisible();

//   await page.locator('form').getByRole('button', { name: 'Edit' }).click();

//   const uniqueStr = Math.random()
//     .toString(36)
//     .replace(/[^a-z]/g, '')
//     .slice(0, 5);

//   const uniqueId = Date.now();

//   await page.locator('#detailsFirstName').fill(`PWSFN${uniqueStr}`);
//   await page.locator('#detailsLastName').fill(`PWSLN${uniqueStr}`);
//   await page.locator('#detailsEmail').fill(`pws${uniqueId.toString().slice(-8)}@g.com`);
//   await page.locator('#detailsPhone').fill(`099${uniqueId.toString().slice(-8)}`);

//   await page.locator('form').getByRole('button', { name: 'Save' }).click();
//   await page.waitForTimeout(2000);

//   /** PACKAGE EDIT */
//   await page
//     .locator('tbody tr')
//     .filter({ hasText: 'Expired' })
//     .filter({ hasText: `PWSFN${uniqueStr}` })
//     .first()
//     .getByRole('button', { name: 'View' })
//     .click();

//   await expect(page.getByRole('heading', { name: 'Client Details' })).toBeVisible();

//   await page.getByRole('button', { name: 'Edit' }).last().click();

//   await page.getByRole('combobox').nth(0).click();
//   await page.getByRole('option', { name: 'Monthly Test Packaage' }).click();
//   await page.getByRole('combobox').nth(1).click();
//   await page.getByRole('option', { name: 'Active' }).click();
//   await page.getByRole('combobox').nth(2).click();
//   await page.getByRole('option', { name: 'Paid' }).click();

//   await page.getByRole('button', { name: 'Save' }).click();
//   await page.waitForTimeout(2000);

//   /** INFORMATION ASSERTION */
//   await expect(page.locator('form').getByText(`PWSFN${uniqueStr}`)).toBeVisible();
//   await expect(page.locator('form').getByText(`PWSLN${uniqueStr}`)).toBeVisible();
//   await expect(page.locator('form').getByText(`pws${uniqueId.toString().slice(-8)}@g.com`)).toBeVisible();
//   await expect(page.locator('form').getByText(`099${uniqueId.toString().slice(-8)}`)).toBeVisible();

//   /** PACKAGE ASSERTION */
//   await expect(page.getByLabel('Package').getByText('Monthly Test Packaage')).toBeVisible();
//   await expect(page.getByLabel('Package').getByText('Active')).toBeVisible();
//   await expect(page.getByLabel('Package').getByRole('combobox').getByText('Paid')).toBeVisible();
// });

test('Verify Purchase History Information ', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.locator('#email').click();
  await page.getByPlaceholder('Enter your email').fill('febyroseberame@gmail.com');

  await page.locator('#password').click();
  await page.getByPlaceholder('Enter your password').fill('Mugna123!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForTimeout(2000);

  await page.getByRole('button', { name: 'Client Management' }).click();
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/management');
  await expect(page.getByRole('heading', { name: 'Management' })).toBeVisible();

  await page
    .locator('tbody tr')
    .filter({
      hasText: 'Active',
    })
    .first()
    .getByRole('button', { name: 'View' })
    .click();

  await expect(page.getByRole('heading', { name: 'Client Details' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Purchase History' })).toBeVisible();
  await expect(page.locator('table').filter({ hasText: 'Start Date' })).toBeVisible();
});

test('Verify Client Management Page Loads Correctly', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.locator('#email').click();
  await page.getByPlaceholder('Enter your email').fill('febyroseberame@gmail.com');

  await page.locator('#password').click();
  await page.getByPlaceholder('Enter your password').fill('Mugna123!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForTimeout(2000);

  await page.getByRole('button', { name: 'Client Management' }).click();
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/management');
  await expect(page.getByRole('heading', { name: 'Management' })).toBeVisible();

  await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add Client' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Search Clients...' })).toBeVisible();
  await expect(page.getByRole('combobox').filter({ hasText: 'All Packages' })).toBeVisible();
  await expect(page.getByRole('combobox').filter({ hasText: 'All Status' })).toBeVisible();
  await expect(page.locator('table')).toBeVisible();
});

test('Verify Required Field Validation', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.locator('#email').click();
  await page.getByPlaceholder('Enter your email').fill('febyroseberame@gmail.com');

  await page.locator('#password').click();
  await page.getByPlaceholder('Enter your password').fill('Mugna123!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForTimeout(2000);

  await page.getByRole('button', { name: 'Client Management' }).click();
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/management');
  await expect(page.getByRole('heading', { name: 'Management' })).toBeVisible();

  await page.getByRole('button', { name: 'Add Client' }).click();
  await expect(page.getByRole('heading', { name: 'Add New Client' })).toBeVisible();

  await page.getByRole('button', { name: 'Add Client' }).click();

  await expect(page.getByText('First name is required')).toBeVisible();
  await expect(page.getByText('Last name is required')).toBeVisible();
  await expect(page.getByText('Email is required')).toBeVisible();
  await expect(page.getByText('Please enter a valid Philippine phone number')).toBeVisible();
});

test('Verify Cancel Button Closes Modal', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.locator('#email').click();
  await page.getByPlaceholder('Enter your email').fill('febyroseberame@gmail.com');

  await page.locator('#password').click();
  await page.getByPlaceholder('Enter your password').fill('Mugna123!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForTimeout(2000);

  await page.getByRole('button', { name: 'Client Management' }).click();
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/management');
  await expect(page.getByRole('heading', { name: 'Management' })).toBeVisible();

  await page.getByRole('button', { name: 'Add Client' }).click();
  await expect(page.getByRole('heading', { name: 'Add New Client' })).toBeVisible();

  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.waitForTimeout(1500);

  await expect(page.getByRole('heading', { name: 'Add New Client' })).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'Management' })).toBeVisible();
});

/** COMMENTED ON PURPOSE DUE TO FILTER BUG ISSUE */
// test('Verify Combined Filters', async ({ page }) => {
//   await page.goto('https://staging-coworking-app.mugna.tech/login');
//   await page.waitForTimeout(2000);
//   await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

//   await page.locator('#email').click();
//   await page.getByPlaceholder('Enter your email').fill('febyroseberame@gmail.com');

//   await page.locator('#password').click();
//   await page.getByPlaceholder('Enter your password').fill('Mugna123!');
//   await page.getByRole('button', { name: 'Sign In' }).click();

//   await page.waitForTimeout(2000);

//   await page.getByRole('button', { name: 'Client Management' }).click();
//   await page.waitForTimeout(2000);
//   await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/management');
//   await expect(page.getByRole('heading', { name: 'Management' })).toBeVisible();

//   await page.getByRole('combobox').filter({ hasText: 'All Packages' }).click();
//   await page.getByRole('option', { name: 'Weekly Test Package' }).click(); // WEEKLY TEST PACKAGE

//   await page.getByRole('combobox').filter({ hasText: 'All Status' }).click();
//   await page.getByRole('option', { name: 'Expired' }).click(); // EXPIRED

//   const rows = page.locator('table tbody tr');
//   const rowCount = await rows.count();

//   for (let i = 0; i < rowCount; i++) {
//     const packageText = await rows.nth(i).locator('td:nth-child(3)').innerText();
//     const statusText = await rows.nth(i).locator('td:nth-child(4)').innerText();

//     expect(packageText.trim()).toBe('Weekly Test Package');
//     expect(statusText.trim()).toBe('Active');
//   }
// });

test('Verify Purchase History Cannot Be Edited', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.locator('#email').click();
  await page.getByPlaceholder('Enter your email').fill('febyroseberame@gmail.com');

  await page.locator('#password').click();
  await page.getByPlaceholder('Enter your password').fill('Mugna123!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForTimeout(2000);

  await page.getByRole('button', { name: 'Client Management' }).click();
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/management');
  await expect(page.getByRole('heading', { name: 'Management' })).toBeVisible();

  await page
    .locator('tbody tr')
    .filter({
      hasText: 'Active',
    })
    .first()
    .getByRole('button', { name: 'View' })
    .click();

  await expect(page.locator('table').filter({ hasText: 'Start Date' })).not.toHaveAttribute('contenteditable');
});

test('Verify Package Expiry Calculation', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.locator('#email').click();
  await page.getByPlaceholder('Enter your email').fill('febyroseberame@gmail.com');

  await page.locator('#password').click();
  await page.getByPlaceholder('Enter your password').fill('Mugna123!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForTimeout(2000);

  await page.getByRole('button', { name: 'Tap In/Out' }).click();
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/checkin');
  await expect(page.getByRole('heading', { name: 'Check-in' })).toBeVisible();

  await page.getByRole('textbox', { name: 'Search client name, email, or membership ID...' }).fill('PWSPackageTestCalculation A');
  await page.getByRole('button', { name: 'Tap In' }).last().click();
  await page.waitForTimeout(2000);
  await expect(page.locator('table')).toContainText('PWSPackageTestCalculation');

  await page.getByRole('button', { name: 'Client Management' }).click();
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/management');
  await expect(page.getByRole('heading', { name: 'Management' })).toBeVisible();

  await page
    .locator('tbody tr')
    .filter({
      hasText: 'PWSPackageTestCalculation A',
    })
    .first()
    .getByRole('button', { name: 'View' })
    .click();

  const now = new Date();
  const expectedExpiry = new Date(now);
  expectedExpiry.setDate(expectedExpiry.getDate() + 1);
  const formattedExpiry = `${expectedExpiry.getMonth() + 1}/${expectedExpiry.getDate()}/${expectedExpiry.getFullYear()}`;

  console.log(expectedExpiry, formattedExpiry);
  await expect(page.getByLabel('Package').getByText(formattedExpiry)).toBeVisible();
});

//** NEEDED CLARIFICATION */
// test('Verify Remaining Time Updates Correctly', async ({ page }) => {
//   await page.goto('https://staging-coworking-app.mugna.tech/login');
//   await page.waitForTimeout(2000);
//   await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

//   await page.locator('#email').click();
//   await page.getByPlaceholder('Enter your email').fill('febyroseberame@gmail.com');

//   await page.locator('#password').click();
//   await page.getByPlaceholder('Enter your password').fill('Mugna123!');
//   await page.getByRole('button', { name: 'Sign In' }).click();

//   await page.waitForTimeout(2000);

//   await page.getByRole('button', { name: 'Tap In/Out' }).click();
//   await page.waitForTimeout(2000);
//   await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/checkin');
//   await expect(page.getByRole('heading', { name: 'Check-in' })).toBeVisible();

//   await page.getByRole('textbox', { name: 'Search client name, email, or membership ID...' }).fill('PWSPackageTestCalculation A');
//   await expect(page.locator('table')).toContainText('PWSPackageTestCalculation');

//   await page.getByRole('button', { name: 'Client Management' }).click();
//   await page.waitForTimeout(2000);
//   await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/management');
//   await expect(page.getByRole('heading', { name: 'Management' })).toBeVisible();

//   await page
//     .locator('tbody tr')
//     .filter({
//       hasText: 'PWSPackageTestCalculation A',
//     })
//     .first()
//     .getByRole('button', { name: 'View' })
//     .click();
// });

test('Verify Edge Cases for Client Remaining Hours', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.locator('#email').click();
  await page.getByPlaceholder('Enter your email').fill('febyroseberame@gmail.com');

  await page.locator('#password').click();
  await page.getByPlaceholder('Enter your password').fill('Mugna123!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForTimeout(2000);

  await page.getByRole('button', { name: 'Client Management' }).click();
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/management');
  await expect(page.getByRole('heading', { name: 'Management' })).toBeVisible();

  const rows = page.locator('table tbody tr');
  const rowCount = await rows.count();

  await expect(rows.first()).toBeVisible();

  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);

    const clientName = (await row.locator('td:nth-child(1)').innerText()).trim();
    const packageType = (await row.locator('td:nth-child(3)').innerText()).trim();
    const packageStatus = (await row.locator('td:nth-child(4)').innerText()).trim();
    const remainingTime = (await row.locator('td:nth-child(5)').innerText()).trim();

    console.log(i + 1, clientName, packageType, packageStatus, remainingTime);

    if (packageType === 'Weekly Test Package' || packageType === 'Monthly Test Packaage' || packageType === 'DayTestPackage') {
      if (packageStatus === 'Expired') {
        expect(remainingTime).toBe('0 days');
      } else {
        expect(remainingTime).not.toBe('');
      }
    } else if (packageType === 'Mugna Premium Package' || packageType === 'Open Time Package') {
      expect(remainingTime).toBe('Unlimited');
    } else {
      expect(remainingTime).toBe('-');
    }
  }
});
