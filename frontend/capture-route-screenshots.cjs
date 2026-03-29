const { chromium } = require('playwright');

const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:5001';
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD');
  process.exit(1);
}

const outDir = 'public/readme-images/routes';

const publicRoutes = [
  { path: '/', name: 'home' },
  { path: '/about', name: 'about' },
  { path: '/players', name: 'players' },
  { path: '/blog', name: 'blog' },
  { path: '/services', name: 'services' },
  { path: '/contact', name: 'contact' },
  { path: '/login', name: 'login' },
  { path: '/does-not-exist', name: 'not-found' },
];

const adminTabs = [
  { label: 'Overview', name: 'admin-overview' },
  { label: 'Players', name: 'admin-players' },
  { label: 'Leagues', name: 'admin-leagues' },
  { label: 'Enquiries', name: 'admin-enquiries' },
  { label: 'Profile Requests', name: 'admin-profile-requests' },
  { label: 'Blogs', name: 'admin-blogs' },
  { label: 'Services', name: 'admin-services' },
  { label: 'About', name: 'admin-about' },
  { label: 'Partners', name: 'admin-partners' },
  { label: 'Admins', name: 'admin-admins' },
  { label: 'Settings', name: 'admin-settings' },
];

async function firstDefined(paths, object) {
  for (const p of paths) {
    const value = p.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), object);
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return null;
}

async function getDynamicRoutes(request) {
  const dynamic = [];

  try {
    const blogResp = await request.get(`${apiBaseUrl}/api/blogs`);
    if (blogResp.ok()) {
      const body = await blogResp.json();
      const blogs =
        (Array.isArray(body) && body) ||
        body?.data ||
        body?.blogs ||
        body?.results ||
        [];

      if (Array.isArray(blogs) && blogs.length > 0) {
        const blog = blogs[0];
        const blogIdentifier =
          (await firstDefined(['slug', '_id', 'id'], blog)) ||
          (typeof blog === 'string' ? blog : null);

        if (blogIdentifier) {
          dynamic.push({ path: `/blog/${blogIdentifier}`, name: 'blog-detail' });
        }
      }
    }
  } catch {
    // Continue without dynamic blog route if API shape differs or endpoint is unavailable.
  }

  return dynamic;
}

async function getAdminToken(request) {
  const resp = await request.post(`${apiBaseUrl}/api/auth/login`, {
    data: { email, password },
  });

  if (!resp.ok()) {
    const body = await resp.text();
    throw new Error(`Login API failed (${resp.status()}): ${body}`);
  }

  const data = await resp.json();
  if (!data || !data.token) {
    throw new Error('Login API did not return token');
  }

  return data;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1512, height: 945 } });
  const page = await context.newPage();

  const dynamicRoutes = await getDynamicRoutes(context.request);
  const allPublicRoutes = [...publicRoutes, ...dynamicRoutes];

  for (const route of allPublicRoutes) {
    await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${outDir}/${route.name}.png`, fullPage: true });
  }

  const loginData = await getAdminToken(context.request);

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.evaluate((authPayload) => {
    localStorage.setItem('adminToken', authPayload.token);
    const adminData = { ...authPayload };
    delete adminData.token;
    localStorage.setItem('adminData', JSON.stringify(adminData));
  }, loginData);

  await page.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${outDir}/admin-dashboard.png`, fullPage: true });

  for (const tab of adminTabs) {
    const tabButton = page.locator('aside button', { hasText: tab.label }).first();
    const count = await tabButton.count();
    if (count === 0) continue;

    await tabButton.click();
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `${outDir}/${tab.name}.png`, fullPage: true });
  }

  await browser.close();
  console.log('Route and sub-route screenshots generated in frontend/public/readme-images/routes');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
