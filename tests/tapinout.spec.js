// @ts-check
const { test, expect } = require("@playwright/test");


test('TC-02 - Client search — valid name, valid email, no match, tapped-in exclusion, and clear button', async ({ page }) => {

  // ── Login ──────────────────────────────────────────────────────────────────
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.getByRole('textbox', { name: 'Email' }).fill('febyroseberame@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Mugna123!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/dashboard/);

  await page.getByRole('button', { name: 'Tap In/Out' }).click();
  await page.waitForURL(/checkin/i);

  const searchField = page.getByRole('textbox', { name: /search client name, email/i });

  const resultsContainer = page.locator('div.absolute.top-full');
  const resultCards = resultsContainer.locator('div.p-4.border-b');


  // ── 1. Valid name search — all results contain the search term ────────────
  await searchField.fill('j');
  await expect(resultCards.first()).toBeVisible();

  const cardCount = await resultCards.count();
  expect(cardCount).toBeGreaterThan(0);

  // Every card must contain 'j' somewhere (name or email — case-insensitive)
  for (let i = 0; i < cardCount; i++) {
    const text = await resultCards.nth(i).textContent();
    expect(text?.toLowerCase()).toContain('j');
  }

  // Each card must have a Tap In button
  for (let i = 0; i < cardCount; i++) {
    await expect(resultCards.nth(i).getByRole('button', { name: /tap in/i })).toBeVisible();
  }

  for (let i = 0; i < cardCount; i++) {
    const card = resultCards.nth(i);
    // Name is visible
    await expect(card.locator('p, div, span').first()).toBeVisible();
    await expect(card.getByText(/package/i)).toBeVisible();
    // Status badge (Active / Inactive / Expired)
    await expect(card.getByText(/active|inactive|expired/i)).toBeVisible();
  }


  // ── 2. Valid email search — only that one client appears ──────────────────
  await searchField.clear();
  await searchField.fill('gg@gmail.com');
  await expect(resultCards).toHaveCount(1);

  const emailCard = resultCards.first();
  await expect(emailCard).toContainText('Feby Berame');
  await expect(emailCard).toContainText('gg@gmail.com');
  await expect(emailCard.getByRole('button', { name: /tap in/i })).toBeVisible();


  // ── 3. No match — empty state appears, no result cards ───────────────────
  await searchField.clear();
  await searchField.fill('zzznomatchvalue999xyz');

  await expect(resultCards).toHaveCount(0);
  await expect(
    page.getByText(/no available clients found/i)
    .or(page.getByText(/no results/i))
    .or(page.getByText(/no clients/i))
  ).toBeVisible();


  // ── 4. Tapped-in client does NOT appear in search results ─────────────────
  // Read the first client name from the Active Sessions table
  // The table rows are below the search panel — they are always visible
  // regardless of whether the search dropdown is open
  const activeRow = page.locator('table tbody tr').first()
    .or(page.locator('[data-slot="table-body"] tr').first());

  const tappedInText = await activeRow.locator('td').first().textContent();
  const tappedInName = (tappedInText ?? '').trim().split('\n')[0].trim();

  await searchField.clear();
  await searchField.fill(tappedInName);

  // Give the dropdown time to update
  await page.waitForTimeout(500);

  const countAfter = await resultCards.count();
  for (let i = 0; i < countAfter; i++) {
    const text = await resultCards.nth(i).textContent();
    expect(text).not.toContain(tappedInName);
  }


  // ── 5. X button clears input and results disappear ────────────────────────
  await searchField.clear();
  await searchField.fill('june');
  

  // The X (clear) button is the button sitting to the right of the search input.
  // From DevTools: it's a <button> inside the same flex wrapper as the input.
  // It has no text, just an SVG icon — locate it as the sibling button of the input.
  const clearButton = page.locator('button').filter({ has: page.locator('svg') })
    .and(page.locator('button:near(input)'))
    .last(); // the X is to the right, so it's the last button near the input

  await clearButton.click();

  await expect(searchField).toHaveValue('');
  await expect(resultCards).toHaveCount(0);
});


test("Verify undo button functionality", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/login");
  await page.getByPlaceholder("Email").fill("febyroseberame@gmail.com");
  await page.getByPlaceholder("Password").fill("Mugna123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/dashboard/);

  await page.getByRole("button", { name: "Tap In/Out" }).click();
  await expect(page).toHaveURL(/checkin/i);

  // Capture the active session count BEFORE tap-in
  const beforeActiveText = await page.getByText(/\d+ active/i).textContent();
  const beforeActive = parseInt(beforeActiveText?.match(/(\d+)/)?.[1] ?? "0");

  // Search and tap in the client
  await page.getByRole("textbox", { name: /search client name, email, or/i }).fill("feby");
  const clientRow = page.locator("div").filter({ hasText: /Feby Beramegg@gmail\.com/ }).filter({ hasText: /Active/ }).filter({ hasText: /Tap In/ }).last();
  await expect(clientRow).toBeVisible();
  await clientRow.getByRole("button", { name: "Tap In" }).last().click();
  await expect(page.getByText(/client tapped in successfully/i)).toBeVisible();

  // Verify active count increased by 1 after tap-in
  await expect(page.getByText(`${beforeActive + 1} active`, { exact: true })).toBeVisible();

  // Click Undo
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText(/tap-in undone/i)).toBeVisible();

  // Verify active count returned to original count before tap-in
  await expect(page.getByText(`${beforeActive} active`, { exact: true })).toBeVisible();
});


const EXEMPT_PACKAGE = 'Mugna Premium Package';

test('TC-03 - Search result badges correctly reflect package and payment status', async ({ page }) => {

  // ── Login ──────────────────────────────────────────────────────────────────
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.getByRole('textbox', { name: 'Email' }).fill('febyroseberame@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Mugna123!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/dashboard/);

  // ── Go to Client Management ────────────────────────────────────────────────
  await page.getByRole('link', { name: 'Client Management' })
    .or(page.getByRole('button', { name: 'Client Management' }))
    .click();
  await page.waitForURL(/management/i);
  await page.waitForSelector('[data-slot="table-cell"]');

  const allRows     = page.locator('tbody tr');
  const rowCount    = await allRows.count();

  let pendingClient   = '';
  let paidClient      = '';
  let noPackageClient = '';

  for (let i = 0; i < rowCount; i++) {
    const cells             = allRows.nth(i).locator('[data-slot="table-cell"]');
    const clientName        = (await cells.nth(0).locator('p').first().textContent())?.trim() ?? '';
    const packageText       = (await cells.nth(2).textContent())?.trim() ?? '';
    const packageStatusText = (await cells.nth(3).textContent())?.trim() ?? '';
    const paymentStatusText = (await cells.nth(5).textContent())?.trim() ?? '';

    // Pending: Active package + Pending payment + NOT Mugna Premium (exempt from payment)
    if (pendingClient === ''
      && packageStatusText === 'Active'
      && paymentStatusText === 'Pending'
      && packageText !== EXEMPT_PACKAGE) {
      pendingClient = clientName;
    }

    // Paid: Active package + Paid payment (any package including Mugna Premium is fine)
    if (paidClient === ''
      && packageStatusText === 'Active'
      && paymentStatusText === 'Paid') {
      paidClient = clientName;
    }

    // No Package: Package column is "-"
    if (noPackageClient === '' && packageText === '-') {
      noPackageClient = clientName;
    }

    if (pendingClient && paidClient && noPackageClient) break;
  }

  console.log('Pending client   :', pendingClient);
  console.log('Paid client      :', paidClient);
  console.log('No Package client:', noPackageClient);

  expect(pendingClient,   `No non-${EXEMPT_PACKAGE} client with Active+Pending found — add test data`).not.toBe('');
  expect(paidClient,      'No client with Active+Paid found — add test data').not.toBe('');
  expect(noPackageClient, 'No client with no package (dash columns) found — add test data').not.toBe('');


  // ── Navigate to Tap In/Out ─────────────────────────────────────────────────
  await page.getByRole('link', { name: 'Tap In/Out' })
    .or(page.getByRole('button', { name: 'Tap In/Out' }))
    .click();
  await page.waitForURL(/checkin/i);

  const searchField      = page.getByRole('textbox', { name: /search client name, email/i });
  const resultsContainer = page.locator('div.absolute.top-full');
  const resultCards      = resultsContainer.locator('div.p-4.border-b');


  // ══════════════════════════════════════════════════════════════════════════
  // SCENARIO 1 — Active + Pending → Payment Required badge + Verify button
  // ══════════════════════════════════════════════════════════════════════════
  await searchField.fill(pendingClient);
  await expect(resultCards.first()).toBeVisible();

  const pendingCard = resultCards.filter({ hasText: pendingClient }).first();
  await expect(pendingCard).toBeVisible();
  await expect(pendingCard.getByText(/package/i)).toBeVisible();
  await expect(pendingCard.getByText(/payment required/i)).toBeVisible();
  await expect(pendingCard.getByRole('button', { name: /verify/i })).toBeVisible();
  await expect(pendingCard.getByRole('button', { name: /tap in/i })).toHaveCount(0);


  // ══════════════════════════════════════════════════════════════════════════
  // SCENARIO 2 — Active + Paid → no Payment Required badge + Tap In button
  // ══════════════════════════════════════════════════════════════════════════
  await searchField.clear();
  await searchField.fill(paidClient);
  await expect(resultCards.first()).toBeVisible();

  const paidCard = resultCards.filter({ hasText: paidClient }).first();
  await expect(paidCard).toBeVisible();
  await expect(paidCard.getByText(/package/i)).toBeVisible();
  await expect(paidCard.getByText('Active')).toBeVisible();
  await expect(paidCard.getByText(/payment required/i)).toHaveCount(0);
  await expect(paidCard.getByRole('button', { name: /tap in/i })).toBeVisible();
  await expect(paidCard.getByRole('button', { name: /verify/i })).toHaveCount(0);


  // ══════════════════════════════════════════════════════════════════════════
  // SCENARIO 3 — No Package → no badges, Tap In button available
  // ══════════════════════════════════════════════════════════════════════════
  await searchField.clear();
  await searchField.fill(noPackageClient);
  await expect(resultCards.first()).toBeVisible();

  const noPackageCard = resultCards.filter({ hasText: noPackageClient }).first();
  await expect(noPackageCard).toBeVisible();
  await expect(noPackageCard.getByText('Active')).toHaveCount(0);
  await expect(noPackageCard.getByText('Expired')).toHaveCount(0);
  await expect(noPackageCard.getByText(/payment required/i)).toHaveCount(0);
  await expect(noPackageCard.getByRole('button', { name: /verify/i })).toHaveCount(0);
  await expect(noPackageCard.getByRole('button', { name: /tap in/i })).toBeVisible();
});