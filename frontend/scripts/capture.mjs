import puppeteer from "puppeteer-core";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.resolve(__dirname, "..", "..", "docs", "screenshots");

async function capture() {
  console.log("Launching Chrome...");
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  try {
    const page = await browser.newPage();

    // 1. Desktop Dashboard at 1280x900
    console.log("Navigating to http://localhost:3000...");
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
    await page.goto("http://localhost:3000", { waitUntil: "networkidle0" });

    // Click "Try with sample cohort" button
    console.log("Clicking 'Try with sample cohort' button via page.evaluate...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const target = btns.find((b) => b.textContent && b.textContent.includes("Try with sample cohort"));
      if (target) target.click();
    });

    // Wait for cohort summary & table to render
    await page.waitForSelector("table", { timeout: 8000 });
    await new Promise((r) => setTimeout(r, 1200));

    const dashboardPath = path.join(screenshotsDir, "dashboard.png");
    console.log(`Saving dashboard screenshot to ${dashboardPath}...`);
    await page.screenshot({ path: dashboardPath, fullPage: false });

    // 2. Open Candidate Drawer for #1 Candidate (Jane Doe)
    console.log("Clicking candidate row to open dossier drawer via evaluate...");
    await page.evaluate(() => {
      const rows = document.querySelectorAll("table tbody tr");
      if (rows.length > 0) {
        rows[0].dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      }
    });

    // Wait for drawer dialog to appear
    console.log("Waiting for [role='dialog']...");
    await page.waitForSelector('[role="dialog"]', { timeout: 8000 });
    await new Promise((r) => setTimeout(r, 1000));

    const drawerPath = path.join(screenshotsDir, "candidate-drawer.png");
    console.log(`Saving candidate drawer screenshot to ${drawerPath}...`);
    await page.screenshot({ path: drawerPath, fullPage: false });

    // 3. Mobile View at 360x780
    console.log("Resizing viewport to mobile 360x780...");
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close dossier"]');
      if (closeBtn) {
        closeBtn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      }
    });
    await new Promise((r) => setTimeout(r, 500));

    await page.setViewport({ width: 360, height: 780, deviceScaleFactor: 2 });
    await new Promise((r) => setTimeout(r, 1000));

    const mobilePath = path.join(screenshotsDir, "mobile.png");
    console.log(`Saving mobile screenshot to ${mobilePath}...`);
    await page.screenshot({ path: mobilePath, fullPage: false });

    console.log("All screenshots successfully captured!");
  } finally {
    await browser.close();
  }
}

capture().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
