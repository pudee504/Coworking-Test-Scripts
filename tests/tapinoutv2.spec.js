import { test, expect } from '@playwright/test';

test("Client Search Returns Correct Results by Name and by Email", async ({ page }) => {
  // Navigate to the client search page
  await page.goto("https://staging-coworking-app.mugna.tech/login");
  await page.getByPlaceholder("Email").fill("febyroseberame@gmail.com");
  await page.getByPlaceholder("Password").fill("Mugna123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/dashboard/);

  await page.getByRole("button", { name: /tap in\/out/i }).click();
  const searchField = page.getByRole('textbox', { name: /search client name, email/i });

  const resultsContainer = page.locator('div.absolute.top-full');
  const resultCards = resultsContainer.locator('div.p-4.border-b');

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

});

test("Search with No Matching Results Displays an Empty State Message", async ({ page }) => {
  // Navigate to the client search page
  await page.goto("https://staging-coworking-app.mugna.tech/login");
  await page.getByPlaceholder("Email").fill("febyroseberame@gmail.com");
  await page.getByPlaceholder("Password").fill("Mugna123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/dashboard/);

  await page.getByRole("button", { name: /tap in\/out/i }).click();
  const searchField = page.getByRole('textbox', { name: /search client name, email/i });

  const resultsContainer = page.locator('div.absolute.top-full');
  const resultCards = resultsContainer.locator('div.p-4.border-b');

  // ── 3. No match — empty state appears, no result cards ───────────────────
  await searchField.fill('zzznomatchvalue999xyz');

  await expect(resultCards).toHaveCount(0);
  await expect(page.getByText(/no available clients found/i)).toBeVisible();
  await expect(page.getByText(/All matching clients are already tapped in or inactive/i)).toBeVisible();
});

const EXEMPT_PACKAGE = 'Mugna Premium Package';
// NOTE: Possible bug in search results: a client displaying "Active" in Client Management displays Expired in search results — need to verify if this is a data issue or a UI bug. If it's a data issue, it may be that the client's package recently expired but the Client Management page hasn't updated yet, so the search results are correct in showing Expired while Client Management is outdated in showing Active. If it's a UI bug, then the search results are wrong and should be showing Active instead of Expired.
test("Search Results Display the Correct Badges and Action Buttons Based on the Client's Package and Payment Status", async ({ page }) => {
    await page.goto('https://staging-coworking-app.mugna.tech/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('febyroseberame@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('Mugna123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/dashboard/);
  
    // ── Go to Client Management ────────────────────────────────────────────────
    await page.getByRole('button', { name: 'Client Management' }).click();
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

test("Tapped-In Clients Are Excluded from Search Results and the Search Field Can Be Cleared+", async ({ page }) => {
    await page.goto('https://staging-coworking-app.mugna.tech/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('febyroseberame@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('Mugna123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/dashboard/);

    await page.getByRole("button", { name: /tap in\/out/i }).click();
    const searchField = page.getByRole('textbox', { name: /search client name, email/i });

    const resultsContainer = page.locator('div.absolute.top-full');
    const resultCards = resultsContainer.locator('div.p-4.border-b');

    await searchField.fill('feby berame');
    await expect(resultCards.first()).toBeVisible();

    const cardCount = await resultCards.count();
    expect(cardCount).toBeGreaterThan(0);

    for (let i = 0; i < cardCount; i++) {
      const text = await resultCards.nth(i).textContent();
      expect(text?.toLowerCase()).toContain('feby berame');
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
    await resultCards.first().getByRole('button', { name: /tap in/i }).click();

    // ── 3. No match — empty state appears, no result cards ───────────────────
    await searchField.clear();
    await searchField.fill('feby berame');

    await expect(resultCards).toHaveCount(0);
    await expect(
        page.getByText(/no available clients found/i)).toBeVisible();
});

test("Clicking 'Verify' for clients with payment required Opens the Client Details Drawer with Full Client and Package Information", async ({ page }) => {
    await page.goto('https://staging-coworking-app.mugna.tech/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('febyroseberame@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('Mugna123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/dashboard/);

    await page.getByRole("button", { name: /tap in\/out/i }).click();
    const searchField = page.getByRole('textbox', { name: /search client name, email/i });

    const resultsContainer = page.locator('div.absolute.top-full');
    const resultCards = resultsContainer.locator('div.p-4.border-b');

    await searchField.fill('tony panda');
    await expect(resultCards.first()).toBeVisible();

    await expect(resultCards.first().getByText(/payment required/i)).toBeVisible();
    await resultCards.first().getByRole('button', { name: /verify/i }).click();

    await expect(page.locator('div').filter({ hasText: 'Client InformationFirst' }).nth(2)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Client Details' })).toBeVisible();
    await expect(page.getByLabel('Client Details').getByText('Tony Panda')).toBeVisible();
});

test("Pending Client- QR Payment Method Selection in Client Details Drawer Shows or Hides the Proof of Payment Upload Field", async ({ page }) => {
    await page.goto('https://staging-coworking-app.mugna.tech/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('febyroseberame@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('Mugna123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/dashboard/);

    await page.getByRole("button", { name: /tap in\/out/i }).click();
    const searchField = page.getByRole('textbox', { name: /search client name, email/i });

    const resultsContainer = page.locator('div.absolute.top-full');
    const resultCards = resultsContainer.locator('div.p-4.border-b');

    await searchField.fill('ding dong');
    await expect(resultCards.first()).toBeVisible();

    await expect(resultCards.first().getByText(/payment required/i)).toBeVisible();
    await resultCards.first().getByRole('button', { name: /verify/i }).click();

    await expect(page.locator('div').filter({ hasText: 'Client InformationFirst' }).nth(2)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Client Details' })).toBeVisible();
    await expect(page.getByLabel('Client Details').getByText('Ding Dong')).toBeVisible();

    await page.getByRole('combobox').filter({ hasText: 'Cash' }).click();
    await page.getByRole('option', { name: 'QR' }).click();
    await expect(page.getByLabel('Proof of Payment')).toBeVisible();
    await expect(page.getByRole('button', { name: /Choose File/i })).toBeVisible();

    await page.getByRole('combobox').filter({ hasText: 'QR' }).click();
    await page.getByRole('option', { name: 'Cash' }).click();
    await expect(page.getByLabel('Proof of Payment')).toBeHidden();
    await expect(page.getByRole('button', { name: /Choose File/i })).toBeHidden();


});

test("Confirm Tap In Button in Assign Package Modal is Disabled Until All Dropdowns Are Selected", async ({ page }) => {
    await page.goto('https://staging-coworking-app.mugna.tech/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('febyroseberame@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('Mugna123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/dashboard/);

    await page.getByRole("button", { name: /tap in\/out/i }).click();
    const searchField = page.getByRole('textbox', { name: /search client name, email/i });

    const resultsContainer = page.locator('div.absolute.top-full');
    const resultCards = resultsContainer.locator('div.p-4.border-b');

    await searchField.fill('diom.dev');
    await expect(resultCards.first()).toBeVisible();
    await resultCards.first().getByRole('button', { name: /tap in/i }).click();

    await expect(page.getByRole('dialog', { name: 'Assign Package' })).toBeVisible();
    await expect(page.getByText('Confirm Tap In')).toBeDisabled();
    await page.getByRole('combobox', { name: 'Select Package' }).click();
    await page.getByRole('option', { name: 'Weekly Test Package' }).click();
    await page.getByRole('combobox', { name: 'Payment Status' }).click();
    await page.getByRole('option', { name: 'Pending' }).click();
    await expect(page.getByRole('button', { name: 'Confirm Tap In' })).toBeEnabled();

});

test("Tap In - Client with Active Package and Paid Payment", async ({ page }) => {
    await page.goto('https://staging-coworking-app.mugna.tech/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('febyroseberame@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('Mugna123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/dashboard/);

    await page.getByRole("button", { name: /tap in\/out/i }).click();
    const searchField = page.getByRole('textbox', { name: /search client name, email/i });

    const resultsContainer = page.locator('div.absolute.top-full');
    const resultCards = resultsContainer.locator('div.p-4.border-b');

    await searchField.fill('gunther yzelphar');
    await expect(resultCards.first()).toBeVisible();
    await expect(resultCards.first().toContainText(/Paid/i));
    await resultCards.first().getByRole('button', { name: /tap in/i }).click();



    

});

