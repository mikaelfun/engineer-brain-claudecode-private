const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Create output directory
const outputDir = '.playwright-output';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function checkNewAPIConsole() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.createContext();
  const page = await context.newPage();

  try {
    console.log('=== NewAPI Admin Console Check ===\n');

    // Step 1: Navigate to login
    console.log('[1] Navigating to login page...');
    await page.goto('https://kunnewapi.net/console/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${outputDir}/01-login-page.png` });

    // Step 2: Login
    console.log('[2] Logging in with credentials...');
    await page.fill('input[name="username"]', 'adminkun');
    await page.fill('input[name="password"]', 'MikaelFun3x789');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    console.log('✓ Login successful');

    // Step 3: Navigate to channel page
    console.log('[3] Navigating to channel list page...');
    await page.goto('https://kunnewapi.net/console/channel', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${outputDir}/02-channel-list.png` });

    // Extract channel data
    console.log('[4] Extracting channel information...');
    const channelData = await page.evaluate(() => {
      const channels = [];
      const rows = document.querySelectorAll('table tbody tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 0) {
          channels.push({
            name: cells[0]?.textContent?.trim() || 'N/A',
            status: cells[1]?.textContent?.trim() || 'N/A',
            type: cells[2]?.textContent?.trim() || 'N/A',
            other: Array.from(cells).slice(3).map(c => c.textContent.trim())
          });
        }
      });
      return channels;
    });

    console.log(`Found ${channelData.length} channels`);
    console.table(channelData);

    // Step 4: Look for embedding channels
    console.log('[5] Checking for embedding model channels...');
    const embeddingChannels = await page.evaluate(() => {
      const results = [];
      const rows = document.querySelectorAll('table tbody tr');
      rows.forEach((row, idx) => {
        const text = row.textContent;
        if (text.includes('embedding') || text.includes('text-embedding-3-small') || text.includes('text-embedding-ada-002')) {
          results.push({
            index: idx,
            content: text.trim().substring(0, 200)
          });
        }
      });
      return results;
    });

    if (embeddingChannels.length > 0) {
      console.log(`Found ${embeddingChannels.length} embedding-related channels:`);
      embeddingChannels.forEach((ch, i) => {
        console.log(`  ${i+1}. ${ch.content}`);
      });
    } else {
      console.log('No embedding channels found in main list');
    }

    // Step 5: Look for test buttons and click them
    console.log('[6] Looking for test buttons...');
    const testResults = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const testButtons = [];
      buttons.forEach(btn => {
        if (btn.textContent.toLowerCase().includes('test') || btn.textContent.toLowerCase().includes('check')) {
          testButtons.push({
            text: btn.textContent.trim(),
            visible: btn.offsetParent !== null
          });
        }
      });
      return testButtons;
    });

    console.log(`Found ${testResults.length} test/check buttons`);
    testResults.forEach((btn, i) => {
      console.log(`  ${i+1}. ${btn.text} (visible: ${btn.visible})`);
    });

    // Step 6: Navigate to logs page
    console.log('[7] Navigating to logs page...');
    await page.goto('https://kunnewapi.net/console/log', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${outputDir}/03-logs-page.png` });

    // Step 7: Filter for embedding requests
    console.log('[8] Looking for embedding request filters...');
    const filterElements = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="text"], input[type="search"], select');
      const filters = [];
      inputs.forEach(input => {
        filters.push({
          type: input.tagName,
          name: input.name || input.id || 'unnamed',
          placeholder: input.placeholder || ''
        });
      });
      return filters;
    });

    console.log(`Found ${filterElements.length} filter elements`);
    filterElements.forEach((f, i) => {
      console.log(`  ${i+1}. ${f.type}: ${f.name} (${f.placeholder})`);
    });

    // Step 8: Extract recent logs
    console.log('[9] Extracting recent logs...');
    const recentLogs = await page.evaluate(() => {
      const logs = [];
      const rows = document.querySelectorAll('table tbody tr');
      rows.forEach((row, idx) => {
        if (idx < 10) { // Get first 10 logs
          const cells = row.querySelectorAll('td');
          logs.push({
            timestamp: cells[0]?.textContent?.trim() || 'N/A',
            type: cells[1]?.textContent?.trim() || 'N/A',
            message: cells[2]?.textContent?.trim().substring(0, 100) || 'N/A',
            status: cells[3]?.textContent?.trim() || 'N/A'
          });
        }
      });
      return logs;
    });

    console.log(`\nRecent logs (first 10):`);
    console.table(recentLogs);

    // Save summary
    const summary = {
      timestamp: new Date().toISOString(),
      channels_found: channelData.length,
      embedding_channels: embeddingChannels.length,
      test_buttons: testResults.length,
      recent_logs_count: recentLogs.length,
      channels: channelData,
      embedding_channels_detail: embeddingChannels,
      recent_logs: recentLogs
    };

    fs.writeFileSync(
      `${outputDir}/newapi-console-summary.json`,
      JSON.stringify(summary, null, 2)
    );

    console.log(`\n✓ Summary saved to ${outputDir}/newapi-console-summary.json`);
    console.log(`✓ Screenshots saved to ${outputDir}/`);

  } catch (error) {
    console.error('Error during console check:', error);
    await page.screenshot({ path: `${outputDir}/error-screenshot.png` });
  } finally {
    await browser.close();
  }
}

checkNewAPIConsole().catch(console.error);
