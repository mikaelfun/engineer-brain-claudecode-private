// owa-extract-conversation.js
// 在 OWA 搜索结果页中提取所有匹配 conversation 的邮件
// 由 owa-email-fetch.ps1 通过 playwright-cli eval 调用
// 接受参数:
//   window.__OWA_CASE_NUMBER  - Case 号
//   window.__OWA_MODE         - "full" 或 "preview"
//   window.__OWA_WITH_IMAGES  - true(默认) 提取图片 / false 纯文本
//   window.__OWA_SCROLL_DELAY - 每封邮件滚动等待 ms
//
// 功能：DOM walking 提取（保留图片位置）、两轮去重、Banner/SafeLinks 清洗

(async function(){
    var t0 = Date.now();
    var caseNumber = window.__OWA_CASE_NUMBER || "";
    var mode = window.__OWA_MODE || "full";
    var withImages = window.__OWA_WITH_IMAGES !== false;
    var scrollDelay = window.__OWA_SCROLL_DELAY || 400;

    function sleep(ms) { return new Promise(function(r){ setTimeout(r, ms); }); }

    // ── Step 1: Find search result options ──
    var options = document.querySelectorAll("[role=option]");
    var matchOptions = [];
    for (var i = 0; i < options.length; i++) {
        var lbl = options[i].getAttribute("aria-label") || "";
        if (lbl.length > 40 && lbl.indexOf("Search with") === -1 && lbl.indexOf("Submit search") === -1) {
            matchOptions.push(options[i]);
        }
    }
    if (matchOptions.length === 0) {
        var emptyMd = "# Emails (OWA) \u2014 Case " + caseNumber + "\n\n> No search results found\n";
        var ta0 = document.getElementById("_owa_extract_md") || document.createElement("textarea");
        ta0.id = "_owa_extract_md"; ta0.style.cssText = "position:fixed;left:-9999px"; ta0.value = emptyMd;
        if (!ta0.parentElement) document.body.appendChild(ta0);
        window.__OWA_IMAGES = [];
        return "0|0|0|0|" + emptyMd.length;
    }

    // ── Step 2: Click each conversation, expand, collect labels + bodies ──
    var allLabels = [];
    var allBodies = [];
    var rawImgCollector = []; // temp: collect all images before dedup
    var imgPlaceholderIdx = 0;

    // DOM walker: extract text + image placeholders from a body element
    function extractBodyWithImages(bodyEl) {
        var md = '';
        function walk(node) {
            if (node.nodeType === 3) {
                var t = node.textContent;
                if (t.indexOf('ZjQcmQRYFpfptBanner') > -1) return;
                if (t.indexOf('External Email - Think Before You Click') > -1) return;
                md += t;
                return;
            }
            if (node.nodeType !== 1) return;
            var tag = node.tagName;

            // Skip hidden elements
            var style = node.getAttribute('style') || '';
            if (style.indexOf('display:none') > -1 || style.indexOf('display: none') > -1) return;

            if (tag === 'IMG') {
                if (!withImages) return;
                var w = node.naturalWidth || node.width;
                var h = node.naturalHeight || node.height;
                // Skip tiny icons: small area OR very short
                if ((w * h) < 10000 || h < 50) return;

                imgPlaceholderIdx++;
                var placeholderId = '__IMG_' + imgPlaceholderIdx + '__';
                try {
                    var canvas = document.createElement('canvas');
                    canvas.width = node.naturalWidth || node.width || 100;
                    canvas.height = node.naturalHeight || node.height || 100;
                    canvas.getContext('2d').drawImage(node, 0, 0, canvas.width, canvas.height);
                    var dataUrl = canvas.toDataURL('image/png');
                    // Use first 200 chars of base64 as fingerprint for dedup
                    var fingerprint = dataUrl.substring(22, 222);
                    rawImgCollector.push({placeholderId: placeholderId, dataUrl: dataUrl, fingerprint: fingerprint});
                    md += '\n' + placeholderId + '\n';
                } catch(e) {
                    md += '\n[image: extraction failed]\n';
                }
                return;
            }

            if (tag === 'BR') { md += '\n'; return; }

            // Links — clean SafeLinks wrappers
            if (tag === 'A') {
                var href = node.getAttribute('href') || '';
                var linkText = node.innerText || '';
                if (href && linkText && linkText.length > 3) {
                    var cleanHref = href;
                    var safeLinkMatch = href.match(/[?&]url=([^&]+)/);
                    if (safeLinkMatch) {
                        try { cleanHref = decodeURIComponent(safeLinkMatch[1]); } catch(e) {}
                    }
                    md += '[' + linkText + '](' + cleanHref + ')';
                    return;
                }
            }

            var isBlock = (tag === 'P' || tag === 'DIV' || tag === 'TABLE' || tag === 'TR' || tag === 'LI' || tag === 'H1' || tag === 'H2' || tag === 'H3');
            if (isBlock) md += '\n';

            for (var c = 0; c < node.childNodes.length; c++) {
                walk(node.childNodes[c]);
            }
            if (isBlock) md += '\n';
        }

        for (var i = 0; i < bodyEl.childNodes.length; i++) {
            walk(bodyEl.childNodes[i]);
        }

        // Trim quoted reply chain: cut at first "From: ... Sent: ..." pattern
        var quoteIdx = md.search(/\nFrom:\s.+\nSent:\s/);
        if (quoteIdx === -1) quoteIdx = md.search(/\n发件人:\s.+\n发送时间:\s/);
        if (quoteIdx > 20) {
            md = md.substring(0, quoteIdx).trimEnd();
        }
        // Handle body that IS a quoted block (starts with From:)
        if (/^From:\s.+\nSent:\s/m.test(md.trim())) {
            var subjIdx = md.search(/Subject:\s[^\n]+\n/);
            if (subjIdx > -1) {
                var afterSubj = md.substring(subjIdx).replace(/^Subject:\s[^\n]+\n\s*/, '');
                if (afterSubj.trim().length > 10) md = afterSubj;
            }
        }

        // Trim at banner markers if still present
        var bannerIdx = md.indexOf('ZjQcmQRYFpfptBannerStart');
        if (bannerIdx > 10) {
            md = md.substring(0, bannerIdx).trimEnd();
        }

        // Clean up blank lines
        md = md.replace(/[\u00a0\u200b]+/g, ' ');  // normalize nbsp and zero-width spaces
        md = md.replace(/^[ \t]+$/gm, '');          // strip whitespace-only lines to empty
        md = md.replace(/\n{3,}/g, '\n\n');         // collapse 3+ newlines to 1 blank line
        md = md.replace(/^\n+/, '');                 // strip leading newlines

        return md;
    }

    for (var c = 0; c < matchOptions.length; c++) {
        var prevBodyCount = document.querySelectorAll('[aria-label="Message body"]').length;

        matchOptions[c].click();
        await sleep(2000);

        // Try expand conversation
        var btns = document.querySelectorAll("button");
        for (var b = 0; b < btns.length; b++) {
            if ((btns[b].getAttribute("aria-label") || "") === "Expand conversation") {
                btns[b].click();
                await sleep(1500);
                break;
            }
        }

        // Collect listitem labels (dedup by exact match)
        var items = document.querySelectorAll("[role=listitem]");
        var newLabelsThisConv = 0;
        for (var j = 0; j < items.length; j++) {
            var label = items[j].getAttribute("aria-label") || "";
            if (label.length > 30) {
                var isDup = false;
                for (var d = 0; d < allLabels.length; d++) {
                    if (allLabels[d] === label) { isDup = true; break; }
                }
                if (!isDup) { allLabels.push(label); newLabelsThisConv++; }
            }
        }

        // Fallback: use option label if no new listitems
        if (newLabelsThisConv === 0) {
            var optLabel = matchOptions[c].getAttribute("aria-label") || "";
            if (optLabel.length > 30) {
                var isDup2 = false;
                for (var d2 = 0; d2 < allLabels.length; d2++) {
                    if (allLabels[d2] === optLabel) { isDup2 = true; break; }
                }
                if (!isDup2) allLabels.push(optLabel);
            }
        }

        // Full mode: scroll each email to trigger lazy loading
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
            var rawText = curBodies[n].innerText || "";
            if (rawText.length <= 5) continue;
            allBodies.push({ text: rawText, el: curBodies[n] });
        }
    }

    // ── Step 3: Two-pass dedup ──
    // Pass 1: Remove collapsed quoted bodies (start with "From: ... Sent: ..." headers)
    //         BUT only if the core content (after headers) exists in another body.
    var pass1Bodies = [];
    for (var i = 0; i < allBodies.length; i++) {
        var t = allBodies[i].text.replace(/\s+/g, ' ').trim();
        if (/^From:\s.+?(Sent|发送时间):\s/i.test(t)) {
            // Extract core content after Subject: line
            var subjMatch = t.match(/Subject:\s.+?\s{2,}(.{30,})/);
            var coreSnippet = subjMatch ? subjMatch[1].substring(0, 80) : '';

            if (coreSnippet.length >= 30) {
                // Check if core content exists in another (non-quoted) body
                var hasExpanded = false;
                for (var j = 0; j < allBodies.length; j++) {
                    if (i === j) continue;
                    var otherNorm = allBodies[j].text.replace(/\s+/g, ' ').trim();
                    if (otherNorm.indexOf(coreSnippet) > -1) {
                        hasExpanded = true; break;
                    }
                }
                if (hasExpanded) continue; // skip — expanded version exists
            }
            // No expanded version found OR can't extract core — keep this body
        }
        pass1Bodies.push(allBodies[i]);
    }

    // Pass 2: Substring dedup among survivors
    var dedupedBodies = [];
    for (var i = 0; i < pass1Bodies.length; i++) {
        var isDuplicate = false;
        var selfNorm = pass1Bodies[i].text.replace(/\s+/g, ' ').trim();
        var prefix = selfNorm.substring(0, 100);

        if (prefix.length >= 20) {
            for (var j = 0; j < pass1Bodies.length; j++) {
                if (i === j) continue;
                var otherNorm = pass1Bodies[j].text.replace(/\s+/g, ' ').trim();
                if (otherNorm.indexOf(prefix) > -1 && otherNorm.length > selfNorm.length + 50) {
                    isDuplicate = true; break;
                }
            }
        }
        if (!isDuplicate) dedupedBodies.push(pass1Bodies[i]);
    }

    // ── Step 4: Build markdown output ──
    var source = withImages ? "OWA Full Body + Images" : "OWA Full Body";
    if (mode === "preview") source = "OWA Preview";
    var md = "# Emails (OWA) \u2014 Case " + caseNumber + "\n\n";
    md += "> Generated: " + new Date().toISOString() + " | Conversations: " + matchOptions.length + " | Emails: " + allLabels.length + " | Bodies: " + dedupedBodies.length + " | Images: TBD | Source: " + source + "\n\n---\n";

    if (mode === "full" && dedupedBodies.length > 0) {
        var bodyIdx = 0;
        for (var p = 0; p < allLabels.length; p++) {
            var isExt = allLabels[p].indexOf("External sender") > -1;
            var clean = allLabels[p].replace("External sender ", "").replace("Flagged ", "").replace("Unread Expanded ", "").replace("Unread ", "").replace("Collapsed ", "");
            var parts = clean.split(/\s{2,}/);
            var sender = parts[0] || "?";
            var timeStr = (parts[1] || "").split(" ").slice(0, 3).join(" ");
            var icon = isExt ? "\ud83d\udce5 Received" : "\ud83d\udce4 Sent";

            var body = "(body not loaded)";
            if (bodyIdx < dedupedBodies.length) {
                body = extractBodyWithImages(dedupedBodies[bodyIdx].el);
                bodyIdx++;
            }

            if (body.length < 10 && bodyIdx < dedupedBodies.length) continue;

            md += "\n### " + icon + " | " + timeStr + "\n**From:** " + sender + "\n\n" + body + "\n\n---\n";
        }
        // Remaining unpaired bodies
        while (bodyIdx < dedupedBodies.length) {
            var extraBody = extractBodyWithImages(dedupedBodies[bodyIdx].el);
            bodyIdx++;
            if (extraBody.length < 30) continue;
            md += "\n### \ud83d\udce7 (additional body)\n\n" + extraBody + "\n\n---\n";
        }
    } else {
        // Preview mode: use label text only
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

    // Update image count in header
    // ── Step 5: Deduplicate images by fingerprint ──
    // Signature logos repeat across emails; content screenshots are unique.
    // Count fingerprint occurrences; if an image appears 2+ times, it's a signature logo → skip.
    var fpCount = {};
    for (var fi = 0; fi < rawImgCollector.length; fi++) {
        var fp = rawImgCollector[fi].fingerprint;
        fpCount[fp] = (fpCount[fp] || 0) + 1;
    }

    var imgArray = [];
    var finalImgIdx = 0;
    var placeholderMap = {}; // placeholderId → markdown replacement
    for (var fi2 = 0; fi2 < rawImgCollector.length; fi2++) {
        var img = rawImgCollector[fi2];
        if (fpCount[img.fingerprint] >= 2) {
            // Repeated image = signature logo → remove placeholder from markdown
            placeholderMap[img.placeholderId] = '';
        } else {
            finalImgIdx++;
            var imgName = 'owa-img-' + String(finalImgIdx).padStart(3, '0') + '.png';
            imgArray.push({name: imgName, dataUrl: img.dataUrl});
            placeholderMap[img.placeholderId] = '![image](images/' + imgName + ')';
        }
    }

    // Replace all placeholders in markdown
    for (var pid in placeholderMap) {
        md = md.split(pid).join(placeholderMap[pid]);
    }
    // Clean up empty lines left by removed placeholders
    md = md.replace(/\n{3,}/g, '\n\n');

    md = md.replace("Images: TBD", "Images: " + imgArray.length);

    // Store md in hidden textarea (avoids JSON serialization issues)
    var ta = document.getElementById("_owa_extract_md") || document.createElement("textarea");
    ta.id = "_owa_extract_md";
    ta.style.cssText = "position:fixed;left:-9999px";
    ta.value = md;
    if (!ta.parentElement) document.body.appendChild(ta);

    // Store image data on window for PowerShell to read
    window.__OWA_IMAGES = imgArray;

    var elapsed = Date.now() - t0;
    // Return metadata: labels|convs|bodies|images|mdLen|elapsed
    return allLabels.length + "|" + matchOptions.length + "|" + dedupedBodies.length + "|" + imgArray.length + "|" + md.length + "|" + elapsed;
})()
