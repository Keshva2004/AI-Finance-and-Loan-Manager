// generate_pdf.js
import { chromium } from "playwright";

async function generate() {
  const htmlPath = "C:\\Users\\keshva\\.gemini\\antigravity-cli\\brain\\425d7c5d-e900-466e-b413-3cb05189131c\\technical_guide.html";
  const pdfPath = "C:\\Users\\keshva\\.gemini\\antigravity-cli\\brain\\425d7c5d-e900-466e-b413-3cb05189131c\\Gemini_AI_Underwriter_Technical_Guide.pdf";

  console.log("🚀 Launching Playwright Chromium...");
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    console.log(`📂 Loading HTML file: ${htmlPath}`);
    await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });
    
    console.log(`📄 Generating PDF: ${pdfPath}`);
    await page.pdf({
      path: pdfPath,
      format: "A4",
      margin: {
        top: "0px",
        bottom: "0px",
        left: "0px",
        right: "0px"
      },
      printBackground: true
    });
    
    console.log("✅ PDF generated successfully!");
  } catch (err) {
    console.error("❌ PDF Generation Failed:", err.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

generate();
