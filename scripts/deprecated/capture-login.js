const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const logs = [];
  const requests = [];

  page.on("console", (msg) => {
    logs.push({ type: "console", text: msg.text(), location: msg.location() });
  });

  page.on("pageerror", (err) => {
    logs.push({ type: "pageerror", text: err.message, stack: err.stack });
  });

  page.on("request", (req) => {
    requests.push({
      type: "request",
      url: req.url(),
      method: req.method(),
      headers: req.headers(),
    });
  });

  page.on("response", async (res) => {
    try {
      const ct = res.headers()["content-type"] || "";
      let body = "";
      if (ct.includes("application/json")) {
        body = await res.json();
      } else {
        body = await res.text();
      }
      requests.push({
        type: "response",
        url: res.url(),
        status: res.status(),
        body,
      });
    } catch (_e) {
      requests.push({
        type: "response",
        url: res.url(),
        status: res.status(),
        body: "<unreadable>",
      });
    }
  });

  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });

  // Fill form
  await page.fill('input[name="email"]', "test@example.com");
  await page.fill('input[name="password"]', "password123");

  // Submit
  await Promise.all([
    page
      .waitForNavigation({ waitUntil: "networkidle", timeout: 5000 })
      .catch(() => null),
    page.click('button[type="submit"]'),
  ]);

  // capture cookies
  const cookies = await context.cookies();

  const out = { logs, requests, cookies };
  fs.writeFileSync("/tmp/playwright-login.json", JSON.stringify(out, null, 2));

  await browser.close();
  console.log("done");
})();
