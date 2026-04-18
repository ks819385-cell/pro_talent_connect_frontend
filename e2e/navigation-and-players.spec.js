import { test, expect } from '@playwright/test';

function buildPlayers(count = 42) {
  const positions = ['Defender', 'Midfielder', 'Forward', 'Winger'];
  const states = ['Assam', 'Kerala', 'West Bengal'];

  return Array.from({ length: count }, (_, index) => {
    const id = index + 1;
    const position = positions[index % positions.length];
    const state = states[index % states.length];
    const score = 100 - index;

    return {
      _id: `player-${id}`,
      name: `Player ${String(id).padStart(2, '0')}`,
      playingPosition: position,
      alternativePosition: '',
      age: 17 + (index % 8),
      height: 160 + (index % 20),
      state,
      nationality: 'Indian',
      email: `player${id}@example.com`,
      mobileNumber: `9000000${String(id).padStart(3, '0')}`,
      profileImage: '',
      clubsPlayed: [{ clubName: `Club ${id}`, duration: 'Present' }],
      scoutReport: { totalScore: score, grade: score > 85 ? 'C' : 'D' },
    };
  });
}

function normalizeSortValue(value) {
  return (value || 'createdAt').toString().toLowerCase();
}

function applyServerFilters(players, query) {
  let result = [...players];

  const searchQuery = (query.searchQuery || query.q || '').toLowerCase().trim();
  if (searchQuery) {
    result = result.filter((player) =>
      [player.name, player.playingPosition, player.alternativePosition, player.state, player.nationality, player.email, player.playerId]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchQuery)),
    );
  }

  const position = (query.position || query.playingPosition || '').toLowerCase().trim();
  if (position) {
    result = result.filter((player) =>
      [player.playingPosition, player.alternativePosition]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(position)),
    );
  }

  const state = (query.state || '').toLowerCase().trim();
  if (state) {
    result = result.filter((player) => (player.state || '').toLowerCase().includes(state));
  }

  const ageMin = Number.parseInt(query.ageMin, 10);
  const ageMax = Number.parseInt(query.ageMax, 10);
  if (Number.isFinite(ageMin)) {
    result = result.filter((player) => Number(player.age || 0) >= ageMin);
  }
  if (Number.isFinite(ageMax)) {
    result = result.filter((player) => Number(player.age || 0) <= ageMax);
  }

  const heightMin = Number.parseInt(query.heightMin, 10);
  const heightMax = Number.parseInt(query.heightMax, 10);
  if (Number.isFinite(heightMin)) {
    result = result.filter((player) => Number(player.height || 0) >= heightMin);
  }
  if (Number.isFinite(heightMax)) {
    result = result.filter((player) => Number(player.height || 0) <= heightMax);
  }

  const sortBy = normalizeSortValue(query.sortBy);
  const sortOrder = (query.sortOrder || '').toLowerCase() === 'asc' ? 1 : -1;

  result.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return sortOrder * a.name.localeCompare(b.name);
      case 'age':
        return sortOrder * ((Number(a.age) || 0) - (Number(b.age) || 0));
      case 'height':
        return sortOrder * ((Number(a.height) || 0) - (Number(b.height) || 0));
      case 'score':
        return sortOrder * ((Number(a.scoutReport?.totalScore) || 0) - (Number(b.scoutReport?.totalScore) || 0));
      case 'position':
        return sortOrder * (a.playingPosition.localeCompare(b.playingPosition));
      default:
        return sortOrder * ((Number(new Date(b.createdAt || 0)) || 0) - (Number(new Date(a.createdAt || 0)) || 0));
    }
  });

  return result;
}

function buildPlayersResponse(allPlayers, requestUrl) {
  const query = requestUrl.searchParams;
  const page = Math.max(Number.parseInt(query.get('page') || '1', 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(query.get('limit') || '18', 10), 1), 100);
  const filtered = applyServerFilters(allPlayers, Object.fromEntries(query.entries()));
  const totalResults = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / limit));
  const start = (page - 1) * limit;
  const players = filtered.slice(start, start + limit);

  return {
    players,
    currentPage: page,
    totalPages,
    totalResults,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

async function mockPlayersApi(page, allPlayers) {
  await page.route('**/api/v1/players**', async (route) => {
    const requestUrl = new URL(route.request().url());
    const pathname = requestUrl.pathname;

    if (pathname.match(/\/players\/player-/)) {
      const id = pathname.split('/').pop();
      const player = allPlayers.find((entry) => entry._id === id);
      if (!player) {
        return route.fulfill({ status: 404, json: { message: 'Player not found' } });
      }
      return route.fulfill({ json: player });
    }

    if (/\/players\/?$/.test(pathname)) {
      return route.fulfill({ json: buildPlayersResponse(allPlayers, requestUrl) });
    }

    if (/\/players\/search\/?$/.test(pathname)) {
      return route.fulfill({ json: buildPlayersResponse(allPlayers, requestUrl) });
    }

    return route.fallback();
  });
}

test.describe('Mobile navigation', () => {
  test('keeps Home centered and closes More with Escape', async ({ page }) => {
    await mockPlayersApi(page, buildPlayers());
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const mobileNav = page.getByRole('navigation', { name: 'Mobile navigation' });
    const tabs = mobileNav.locator('li');

    await expect(tabs).toHaveCount(5);
    await expect(tabs.nth(2).getByRole('link', { name: 'Home' })).toBeVisible();

    await mobileNav.getByRole('button', { name: 'More options' }).click();
    const dialog = page.getByRole('dialog', { name: 'More options' });
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const activeInsideDialog = await page.evaluate(() => {
      const activeElement = document.activeElement;
      return Boolean(activeElement && activeElement.closest('[role="dialog"]'));
    });
    expect(activeInsideDialog).toBeTruthy();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('routes between Home, Players, and Blog from the bottom bar', async ({ page }) => {
    await mockPlayersApi(page, buildPlayers());
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const mobileNav = page.getByRole('navigation', { name: 'Mobile navigation' });
    await Promise.all([
      page.waitForURL(/\/players$/),
      mobileNav.getByRole('link', { name: 'Players' }).click(),
    ]);
    await expect(page).toHaveURL(/\/players$/);

    await Promise.all([
      page.waitForURL(/\/blog$/),
      mobileNav.getByRole('link', { name: 'Blog' }).click(),
    ]);
    await expect(page).toHaveURL(/\/blog$/);

    await Promise.all([
      page.waitForURL(/\/$/),
      mobileNav.getByRole('link', { name: 'Home' }).click(),
    ]);
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe('Players pagination', () => {
  test('paginates accurately with server-side totals', async ({ page }) => {
    const players = buildPlayers(42);
    await mockPlayersApi(page, players);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/players');

    await expect(page.getByRole('heading', { name: 'Player 01' }).first()).toBeVisible({ timeout: 45000 });

    await page.getByRole('button', { name: 'Next' }).last().click();
    await expect(page.getByText('Page 2 of 3')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Player 19' }).first()).toBeVisible();

    await page.getByRole('button', { name: 'Next' }).last().click();
    await expect(page.getByText('Page 3 of 3')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Player 37' }).first()).toBeVisible();
  });

  test('applies search filters on the server', async ({ page }) => {
    const players = buildPlayers(42);
    await mockPlayersApi(page, players);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/players');

    await expect(page.getByRole('heading', { name: 'Player 01' }).first()).toBeVisible({ timeout: 45000 });

    const searchInput = page.getByPlaceholder('Search by name, position, city...');
    await searchInput.fill('kerala');

    await expect(page.getByRole('heading', { name: 'Player 02' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Player 01' })).toHaveCount(0);
  });
});
