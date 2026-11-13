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

    // 1. Dark Theme Desktop (1280x900) - dashboard-dark.png
    console.log("Navigating to http://localhost:3000 in dark mode...");
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
    await page.goto("http://localhost:3000", { waitUntil: "networkidle0" });

    // Set dark theme explicitly
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    });

    // Click "Try sample data"
    console.log("Loading sample data...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const target = btns.find((b) => b.textContent && b.textContent.includes("Try sample data"));
      if (target) target.click();
    });

    await page.waitForSelector("table", { timeout: 8000 });
    await new Promise((r) => setTimeout(r, 1000));

    const darkDashboardPath = path.join(screenshotsDir, "dashboard-dark.png");
    console.log(`Saving ${darkDashboardPath}...`);
    await page.screenshot({ path: darkDashboardPath, fullPage: false });

    // 2. Open Drawer in dark theme - drawer.png
    console.log("Opening candidate drawer...");
    await page.evaluate(() => {
      const rows = document.querySelectorAll("table tbody tr");
      if (rows.length > 0) {
        rows[0].dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      }
    });

    await page.waitForSelector('[role="dialog"]', { timeout: 8000 });
    await new Promise((r) => setTimeout(r, 800));

    const drawerPath = path.join(screenshotsDir, "drawer.png");
    console.log(`Saving ${drawerPath}...`);
    await page.screenshot({ path: drawerPath, fullPage: false });

    // Close drawer
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close drawer"]');
      if (closeBtn) closeBtn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    });
    await new Promise((r) => setTimeout(r, 500));

    // 3. Light Theme Desktop (1280x900) - dashboard-light.png
    console.log("Switching to light theme...");
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    });
    await new Promise((r) => setTimeout(r, 800));

    const lightDashboardPath = path.join(screenshotsDir, "dashboard-light.png");
    console.log(`Saving ${lightDashboardPath}...`);
    await page.screenshot({ path: lightDashboardPath, fullPage: false });

    // 4. Mobile View (360x780) - mobile.png
    console.log("Switching to mobile 360x780...");
    await page.setViewport({ width: 360, height: 780, deviceScaleFactor: 2 });
    await new Promise((r) => setTimeout(r, 800));

    const mobilePath = path.join(screenshotsDir, "mobile.png");
    console.log(`Saving ${mobilePath}...`);
    await page.screenshot({ path: mobilePath, fullPage: false });

    console.log("All production screenshots captured successfully!");
  } finally {
    await browser.close();
  }
}

capture().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
