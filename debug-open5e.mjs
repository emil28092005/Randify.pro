import { chromium } from "./node_modules/playwright/index.mjs";

const browser = await chromium.launch();
const page = await browser.newPage();

page.on('response', async (response) => {
  const url = response.url();
  if (url.includes('open5e.com')) {
    console.log(`URL: ${url}`);
    console.log(`Status: ${response.status()}`);
    try {
      const body = await response.text();
      console.log(`Body preview: ${body.substring(0, 200)}`);
    } catch (e) {
      console.log(`Body error: ${e.message}`);
    }
    console.log('---');
  }
});

await page.goto('http://localhost:4321/dm/#reference');
await page.waitForTimeout(3000);

const errorText = await page.locator('#o5-error-text:visible').textContent().catch(() => 'no error');
console.log('Error text:', errorText);

await browser.close();
