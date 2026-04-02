// owa-extract-conversation.js
// 在 OWA 搜索结果页中提取所有匹配 conversation 的邮件
// 由 owa-email-fetch.ps1 通过 playwright-cli eval 调用
// 接受参数: window.__OWA_CASE_NUMBER, window.__OWA_MODE ("full"/"preview"), window.__OWA_SCROLL_DELAY

(async function(){
    var caseNumber = window.__OWA_CASE_NUMBER || "";
    var mode = window.__OWA_MODE || "full";
    var scrollDelay = window.__OWA_SCROLL_DELAY || 400;

    function sleep(ms) { return new Promise(function(r){ setTimeout(r, ms); }); }

    // Find all search result options (don't re-filter by caseNumber — search already filtered)
    // OWA truncates aria-label, so indexOf(caseNumber) misses some results
    var options = document.querySelectorAll("[role=option]");
    var matchOptions = [];
    for (var i = 0; i < options.length; i++) {
        var lbl = options[i].getAttribute("aria-label") || "";
        // Accept any option with substantial content (skip UI elements like "Search with Copilot")
        if (lbl.length > 40 && lbl.indexOf("Search with") === -1 && lbl.indexOf("Submit search") === -1) {
            matchOptions.push(options[i]);
        }
    }
    if (matchOptions.length === 0) {
        return JSON.stringify({count: 0, conversations: 0, bodyCount: 0, chars: 0, md: "# No results for " + caseNumber});
    }

    var allLabels = [];
    var allBodies = [];

    for (var c = 0; c < matchOptions.length; c++) {
        var prevBodyCount = document.querySelectorAll('[aria-label="Message body"]').length;

        // Click conversation option
        matchOptions[c].click();
        await sleep(2000);

        // Try expand conversation button
        var btns = document.querySelectorAll("button");
        for (var b = 0; b < btns.length; b++) {
            if ((btns[b].getAttribute("aria-label") || "") === "Expand conversation") {
                btns[b].click();
                await sleep(1500);
                break;
            }
        }

        // Collect listitem labels (dedup)
        var items = document.querySelectorAll("[role=listitem]");
        for (var j = 0; j < items.length; j++) {
            var label = items[j].getAttribute("aria-label") || "";
            if (label.length > 30) {
                var isDup = false;
                for (var d = 0; d < allLabels.length; d++) {
                    if (allLabels[d] === label) { isDup = true; break; }
                }
                if (!isDup) allLabels.push(label);
            }
        }

        // Full body mode: scroll each listitem to trigger lazy loading
        if (mode === "full") {
            var emailItems = [];
            for (var k = 0; k < items.length; k++) {
                if ((items[k].getAttribute("aria-label") || "").length > 30) emailItems.push(items[k]);
            }
            for (var m = 0; m < emailItems.length; m++) {
                emailItems[m].scrollIntoView({behavior: "instant", block: "center"});
                emailItems[m].click();
                await sleep(scrollDelay);
            }
            await sleep(600);
        }

        // Collect NEW bodies (incremental)
        var curBodies = document.querySelectorAll('[aria-label="Message body"]');
        for (var n = prevBodyCount; n < curBodies.length; n++) {
            var text = curBodies[n].innerText || "";
            if (text.length > 5) allBodies.push(text);
        }
    }

    // Build markdown output
    var source = mode === "full" ? "OWA Full Body" : "OWA Preview";
    var md = "# Emails (OWA) \u2014 Case " + caseNumber + "\n\n";
    md += "> Generated: " + new Date().toISOString() + " | Conversations: " + matchOptions.length + " | Emails: " + allLabels.length + " | Bodies: " + allBodies.length + " | Source: " + source + "\n\n---\n";

    if (mode === "full" && allBodies.length > 0) {
        var bodyIdx = 0;
        for (var p = 0; p < allLabels.length; p++) {
            var isExt = allLabels[p].indexOf("External sender") > -1;
            var clean = allLabels[p].replace("External sender ", "").replace("Flagged ", "").replace("Unread Expanded ", "").replace("Unread ", "").replace("Collapsed ", "");
            var parts = clean.split(/\s{2,}/);
            var sender = parts[0] || "?";
            var timeStr = (parts[1] || "").split(" ").slice(0, 3).join(" ");
            var icon = isExt ? "\ud83d\udce5 Received" : "\ud83d\udce4 Sent";

            var body = "(body not loaded)";
            if (bodyIdx < allBodies.length) {
                body = allBodies[bodyIdx];
                bodyIdx++;
            }
            md += "\n### " + icon + " | " + timeStr + "\n**From:** " + sender + "\n\n" + body + "\n\n---\n";
        }
        // Remaining unpaired bodies
        while (bodyIdx < allBodies.length) {
            md += "\n### \ud83d\udce7 (additional body)\n\n" + allBodies[bodyIdx] + "\n\n---\n";
            bodyIdx++;
        }
    } else {
        for (var q = 0; q < allLabels.length; q++) {
            var isExt2 = allLabels[q].indexOf("External sender") > -1;
            var clean2 = allLabels[q].replace("External sender ", "").replace("Flagged ", "").replace("Unread Expanded ", "").replace("Unread ", "").replace("Collapsed ", "");
            var parts2 = clean2.split(/\s{2,}/);
            var sender2 = parts2[0] || "?";
            var icon2 = isExt2 ? "\ud83d\udce5 Received" : "\ud83d\udce4 Sent";
            var bodyText = parts2.slice(1).join(" ");
            md += "\n### " + icon2 + "\n**From:** " + sender2 + "\n\n" + bodyText + "\n\n---\n";
        }
    }

    // Store md in hidden textarea (avoids JSON serialization issues)
    var ta = document.getElementById("_owa_extract_md") || document.createElement("textarea");
    ta.id = "_owa_extract_md";
    ta.style.cssText = "position:fixed;left:-9999px";
    ta.value = md;
    if (!ta.parentElement) document.body.appendChild(ta);

    // Return only metadata as JSON (small, no escape issues)
    return allLabels.length + "|" + matchOptions.length + "|" + allBodies.length + "|" + md.length;
})()
