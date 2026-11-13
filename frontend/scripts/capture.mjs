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

    // 1. Light Theme Desktop (1280x900)
    console.log("Navigating to http://localhost:3000 in light mode...");
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
    await page.goto("http://localhost:3000", { waitUntil: "networkidle0" });

    // Ensure light theme
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    });

    // Click "Try sample data"
    console.log("Clicking 'Try sample data'...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const target = btns.find((b) => b.textContent && b.textContent.includes("Try sample data"));
      if (target) target.click();
    });

    // Wait for table to render
    await page.waitForSelector("table", { timeout: 8000 });
    await new Promise((r) => setTimeout(r, 1000));

    // Save dashboard.png
    const dashboardLightPath = path.join(screenshotsDir, "dashboard.png");
    console.log(`Saving dashboard screenshot to ${dashboardLightPath}...`);
    await page.screenshot({ path: dashboardLightPath, fullPage: false });

    // Open Drawer (Jane Doe row)
    console.log("Opening candidate drawer...");
    await page.evaluate(() => {
      const rows = document.querySelectorAll("table tbody tr");
      if (rows.length > 0) {
        rows[0].dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      }
    });

    await page.waitForSelector('[role="dialog"]', { timeout: 8000 });
    await new Promise((r) => setTimeout(r, 800));

    // Save candidate-drawer.png
    const drawerLightPath = path.join(screenshotsDir, "candidate-drawer.png");
    console.log(`Saving candidate drawer screenshot to ${drawerLightPath}...`);
    await page.screenshot({ path: drawerLightPath, fullPage: false });

    // Close drawer
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close drawer"]');
      if (closeBtn) closeBtn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    });
    await new Promise((r) => setTimeout(r, 500));

    // Mobile View Light (360x780)
    console.log("Switching to mobile 360x780...");
    await page.setViewport({ width: 360, height: 780, deviceScaleFactor: 2 });
    await new Promise((r) => setTimeout(r, 800));

    const mobileLightPath = path.join(screenshotsDir, "mobile.png");
    console.log(`Saving mobile screenshot to ${mobileLightPath}...`);
    await page.screenshot({ path: mobileLightPath, fullPage: false });

    // 2. Dark Theme Desktop (1280x900)
    console.log("Switching to dark theme...");
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    });
    await new Promise((r) => setTimeout(r, 800));

    const dashboardDarkPath = path.join(screenshotsDir, "dashboard-dark.png");
    console.log(`Saving dark dashboard screenshot to ${dashboardDarkPath}...`);
    await page.screenshot({ path: dashboardDarkPath, fullPage: false });

    // Dark Drawer
    await page.evaluate(() => {
      const rows = document.querySelectorAll("table tbody tr");
      if (rows.length > 0) {
        rows[0].dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      }
    });
    await page.waitForSelector('[role="dialog"]', { timeout: 8000 });
    await new Promise((r) => setTimeout(r, 800));

    const drawerDarkPath = path.join(screenshotsDir, "candidate-drawer-dark.png");
    console.log(`Saving dark drawer screenshot to ${drawerDarkPath}...`);
    await page.screenshot({ path: drawerDarkPath, fullPage: false });

    // Close drawer
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close drawer"]');
      if (closeBtn) closeBtn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    });
    await new Promise((r) => setTimeout(r, 500));

    // Dark Mobile (360x780)
    await page.setViewport({ width: 360, height: 780, deviceScaleFactor: 2 });
    await new Promise((r) => setTimeout(r, 800));

    const mobileDarkPath = path.join(screenshotsDir, "mobile-dark.png");
    console.log(`Saving dark mobile screenshot to ${mobileDarkPath}...`);
    await page.screenshot({ path: mobileDarkPath, fullPage: false });

    console.log("All screenshots in both themes captured successfully!");
  } finally {
    await browser.close();
  }
}

capture().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
