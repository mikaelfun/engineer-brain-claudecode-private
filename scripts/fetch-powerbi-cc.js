/**
 * fetch-powerbi-cc.js
 * playwright-cli run-file 脚本：抓取 PowerBI Mooncake CC Finder 所有 account 的 CC 列表
 * 结果通过 document.title 返回（base64 编码）
 */
module.exports = async (page) => {
    const url = 'https://msit.powerbi.com/groups/me/reports/d9f581ef-f263-4808-96af-bfa16856ca8b/ReportSection?experience=power-bi';

    // Step 1: 导航
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);

    // Step 2: 等待 slicer 渲染
    try { await page.waitForSelector('.slicerItemContainer', { timeout: 20000 }); } catch(e) {}
    await page.waitForTimeout(1000);

    // Step 3: 读取所有 account 名称
    const accountNames = await page.evaluate(() =>
        Array.from(document.querySelectorAll('.slicerItemContainer'))
            .map(el => el.textContent.trim())
            .filter(t => t.length > 0)
    );

    const results = [];

    for (const accountName of accountNames) {
        // 取消所有已选中
        await page.evaluate(() => {
            document.querySelectorAll('.slicerItemContainer [role=checkbox][aria-checked=true]')
                .forEach(cb => cb.click());
        });
        await page.waitForTimeout(600);

        // 点击目标 account
        const clicked = await page.evaluate(name => {
            const items = Array.from(document.querySelectorAll('.slicerItemContainer'));
            const target = items.find(el => el.textContent.trim() === name);
            if (target) { target.click(); return true; }
            return false;
        }, accountName);

        if (!clicked) {
            results.push({ account: accountName, cc: null, knowMePage: null, error: 'not found in DOM' });
            continue;
        }

        // 等待 CC 表格更新
        await page.waitForTimeout(2500);

        // 抓取 CC Copy & Paste 文本 + Know-Me Page 链接
        const data = await page.evaluate(() => {
            let cc = null;
            const grids = document.querySelectorAll('[role=grid]');
            for (const grid of grids) {
                const headers = Array.from(grid.querySelectorAll('[role=columnheader]'));
                const copyIdx = headers.findIndex(h =>
                    h.textContent.includes('Copy') && h.textContent.includes('Paste'));
                if (copyIdx >= 0) {
                    const rows = grid.querySelectorAll('[role=row]');
                    for (const row of rows) {
                        const cells = row.querySelectorAll('[role=gridcell]');
                        if (cells[copyIdx]) {
                            const t = cells[copyIdx].textContent.trim();
                            if (t && !t.includes('Copy') && t.includes('@')) { cc = t; break; }
                        }
                    }
                }
            }
            let knowMe = null;
            const links = Array.from(document.querySelectorAll('[role=gridcell] a'));
            for (const a of links) {
                if (a.href && a.href.includes('Know-Me')) { knowMe = a.href; break; }
            }
            return { cc, knowMe };
        });

        results.push({
            account: accountName,
            cc: data.cc,
            knowMePage: data.knowMe,
            error: data.cc ? null : 'no CC found'
        });
    }

    // 把结果 base64 编码后写入 title（供外部读取，不在此处导航）
    const encoded = await page.evaluate(r => {
        window.__oc_result = r;
        return btoa(unescape(encodeURIComponent(JSON.stringify(r))));
    }, results);
    await page.evaluate(enc => { document.title = 'RESULT:' + enc; }, encoded);
    // 注意：不在此处导航回 D365，由调用方读取 title 后再导航
};
