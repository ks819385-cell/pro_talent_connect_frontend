const { chromium } = require('playwright');

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:5173';
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD');
  process.exit(1);
}

const outDir = 'public/readme-images';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1512, height: 945 } });
  const page = await context.newPage();

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${outDir}/home.png`, fullPage: true });

  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${outDir}/login.png`, fullPage: true });

  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');

  await page.waitForURL('**/admin', { timeout: 25000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${outDir}/admin-dashboard.png`, fullPage: true });

  await browser.close();
  console.log('Screenshots generated in frontend/public/readme-images');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
