// owa-extract-conversation.js  v3 — optimized with mega JS architecture
// Combines search-waiting + extraction in one eval call (no cross-process polling)
// Ported from owa-search-and-extract.js efficiency patterns, keeps MD output + image extraction
// Called by owa-email-fetch.ps1 via playwright-cli eval
//
// Accepts:
//   window.__OWA_CASE_NUMBER  - Case number
//   window.__OWA_MODE         - "full" or "preview"
//   window.__OWA_WITH_IMAGES  - true (default) / false
//   window.__OWA_SCROLL_DELAY - per-email scroll delay ms (default 150)
//
// Returns: OK|labels|convs|bodies|images|mdLen|elapsed
//      or: EMPTY|0|0|0|0|mdLen|elapsed

(async function(){
    var t0 = Date.now();
    var caseNumber = window.__OWA_CASE_NUMBER || '';
    var mode = window.__OWA_MODE || 'full';
    var withImages = window.__OWA_WITH_IMAGES !== false;
    var scrollDelay = window.__OWA_SCROLL_DELAY || 150;

    function sleep(ms) { return new Promise(function(r){ setTimeout(r, ms); }); }

    // DOM-readiness polling (replaces fixed sleep)
    function waitFor(checkFn, maxMs, intervalMs) {
        maxMs = maxMs || 500;
        intervalMs = intervalMs || 50;
        return new Promise(function(resolve) {
            var elapsed = 0;
            function poll() {
                if (checkFn()) { resolve(true); return; }
                elapsed += intervalMs;
                if (elapsed >= maxMs) { resolve(false); return; }
                setTimeout(poll, intervalMs);
            }
            poll();
        });
    }

    // ══════════════════════════════════════════════════════════════════
    // Phase 1: Wait for search results (in-browser polling, no IPC)
    // ══════════════════════════════════════════════════════════════════
    var maxWait = 15000;
    var pollInterval = 200;
    var waited = 0;
    var matchOptions = [];

    while (waited < maxWait) {
        var options = document.querySelectorAll('[role=option]');
        matchOptions = [];
        for (var i = 0; i < options.length; i++) {
            var lbl = options[i].getAttribute('aria-label') || '';
            if (lbl.length > 40 && lbl.indexOf('Search with') === -1 && lbl.indexOf('Submit search') === -1) {
                matchOptions.push(options[i]);
            }
        }
        if (matchOptions.length > 0) break;
        await sleep(pollInterval);
        waited += pollInterval;
    }

    // Dedup options by normalized label (strip state prefixes)
    var uniqueOptions = [];
    var seenNormLabels = {};
    for (var uo = 0; uo < matchOptions.length; uo++) {
        var rawLbl = matchOptions[uo].getAttribute('aria-label') || '';
        var normLbl = rawLbl.replace(/^(?:Unread |Read |Collapsed |Expanded |Flagged |External sender )+/gi, '');
        if (!seenNormLabels[normLbl]) {
            seenNormLabels[normLbl] = true;
            uniqueOptions.push(matchOptions[uo]);
        }
    }
    matchOptions = uniqueOptions;

    if (matchOptions.length === 0) {
        var emptyMd = '# Emails (OWA) \u2014 Case ' + caseNumber + '\n\n> No search results found\n';
        var ta0 = document.getElementById('_owa_extract_md') || document.createElement('textarea');
        ta0.id = '_owa_extract_md'; ta0.style.cssText = 'position:fixed;left:-9999px'; ta0.value = emptyMd;
        if (!ta0.parentElement) document.body.appendChild(ta0);
        window.__OWA_IMAGES = [];
        return 'EMPTY|0|0|0|0|' + emptyMd.length + '|' + (Date.now()-t0);
    }

    // ══════════════════════════════════════════════════════════════════
    // Phase 2: Extract conversations
    // ══════════════════════════════════════════════════════════════════
    var allLabels = [];
    var allBodies = [];
    var rawImgCollector = [];
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
            var style = node.getAttribute('style') || '';
            if (style.indexOf('display:none') > -1 || style.indexOf('display: none') > -1) return;

            if (tag === 'IMG') {
                if (!withImages) return;
                var w = node.naturalWidth || node.width;
                var h = node.naturalHeight || node.height;
                if ((w * h) < 10000 || h < 50) return;  // skip tiny icons
                imgPlaceholderIdx++;
                var placeholderId = '__IMG_' + imgPlaceholderIdx + '__';
                try {
                    var canvas = document.createElement('canvas');
                    canvas.width = node.naturalWidth || node.width || 100;
                    canvas.height = node.naturalHeight || node.height || 100;
                    canvas.getContext('2d').drawImage(node, 0, 0, canvas.width, canvas.height);
                    var dataUrl = canvas.toDataURL('image/png');
                    var fingerprint = dataUrl.substring(22, 222);
                    rawImgCollector.push({placeholderId: placeholderId, dataUrl: dataUrl, fingerprint: fingerprint});
                    md += '\n' + placeholderId + '\n';
                } catch(e) {
                    md += '\n[image: extraction failed]\n';
                }
                return;
            }

            if (tag === 'BR') { md += '\n'; return; }

            if (tag === 'A') {
                var href = node.getAttribute('href') || '';
                var linkText = node.innerText || '';
                if (href && linkText && linkText.length > 3) {
                    var cleanHref = href;
                    var safeLinkMatch = href.match(/[?&]url=([^&]+)/);
                    if (safeLinkMatch) { try { cleanHref = decodeURIComponent(safeLinkMatch[1]); } catch(e) {} }
                    md += '[' + linkText + '](' + cleanHref + ')';
                    return;
                }
            }

            var isBlock = (tag==='P'||tag==='DIV'||tag==='TABLE'||tag==='TR'||tag==='LI'||tag==='H1'||tag==='H2'||tag==='H3');
            if (isBlock) md += '\n';
            for (var c = 0; c < node.childNodes.length; c++) walk(node.childNodes[c]);
            if (isBlock) md += '\n';
        }

        for (var i = 0; i < bodyEl.childNodes.length; i++) walk(bodyEl.childNodes[i]);

        // Trim quoted reply chain
        var quoteIdx = md.search(/\nFrom:\s.+\nSent:\s/);
        if (quoteIdx === -1) quoteIdx = md.search(/\n\u53d1\u4ef6\u4eba:\s[^\n]+[\n\s]+\u53d1\u9001\u65f6\u95f4:\s/);
        if (quoteIdx > 20) md = md.substring(0, quoteIdx).trimEnd();

        // Handle body that IS a quoted block
        var trimmedMd = md.trim();
        var isQuotedBlock = /^From:\s.+\nSent:\s/m.test(trimmedMd) || /^\u53d1\u4ef6\u4eba:\s/m.test(trimmedMd);
        if (isQuotedBlock) {
            var subjIdx = md.search(/(?:Subject|\u4e3b\u9898):\s[^\n]+\n/);
            if (subjIdx > -1) {
                var afterSubj = md.substring(subjIdx).replace(/^(?:Subject|\u4e3b\u9898):\s[^\n]+\n\s*/, '');
                afterSubj = afterSubj.replace(/\u63d0\u9192:[\s\S]{0,300}?\u4e0d\u8981\u70b9\u51fb\u94fe\u63a5\u6216\u6253\u5f00\u9644\u4ef6\u3002\s*/g, '');
                afterSubj = afterSubj.replace(/CAUTION:[\s\S]{0,500}?know the content is safe\.\s*/g, '');
                afterSubj = afterSubj.trim();
                if (afterSubj.length > 10) md = afterSubj; else md = '';
            } else { md = ''; }
        }

        var bannerIdx = md.indexOf('ZjQcmQRYFpfptBannerStart');
        if (bannerIdx > 10) md = md.substring(0, bannerIdx).trimEnd();
        md = md.replace(/[\u00a0\u200b]+/g, ' ');
        md = md.replace(/^[ \t]+$/gm, '');
        md = md.replace(/\n{3,}/g, '\n\n');
        md = md.replace(/^\n+/, '');
        return md;
    }

    // Footer/disclaimer removal (ported from fast version)
    function cleanBody(text) {
        text = text.replace(/\u63d0\u9192:[\s\S]{0,300}?\u4e0d\u8981\u70b9\u51fb\u94fe\u63a5\u6216\u6253\u5f00\u9644\u4ef6\u3002\s*/g, '');
        text = text.replace(/CAUTION:[\s\S]{0,500}?know the content is safe\.\s*/g, '');
        var lines = text.split('\n');
        var cutAt = -1;
        var minLine = Math.floor(lines.length * 0.6);
        var footerPatterns = [
            /^[-_=]{3,}\s*$/,
            /^(CONFIDENTIAL|DISCLAIMER|LEGAL NOTICE|PRIVILEGED|NOTICE)/i,
            /^This (email|message|communication|e-mail) (and any|is |may |was )/i,
            /^If you (have |are not|received)/i,
            /^The information (contained|in this)/i,
            /^This is (a |an )?(confidential|privileged|private)/i,
            /^Please consider the environment/i,
            /^Sent from (my |Mail for)/i,
            /^Get Outlook for/i
        ];
        for (var li = minLine; li < lines.length; li++) {
            var ln = lines[li].trim();
            if (ln.length < 3) continue;
            for (var pi = 0; pi < footerPatterns.length; pi++) {
                if (footerPatterns[pi].test(ln)) { cutAt = li; break; }
            }
            if (cutAt > -1) break;
        }
        if (cutAt > -1) text = lines.slice(0, cutAt).join('\n');
        text = text.replace(/\n{3,}/g, '\n\n').trim();
        return text;
    }

    // Scope DOM queries to reading pane and message list (avoid global scan)
    var readingPane = document.querySelector('[role=main]') || document.querySelector('main') || document;
    var messageList = document.querySelector('[role=complementary][aria-label="Message list"]') || document;

    // Safety cap: max 15 conversations
    var maxConvs = Math.min(matchOptions.length, 15);

    for (var c = 0; c < maxConvs; c++) {
        var prevBodyCount = readingPane.querySelectorAll('[aria-label="Message body"]').length;
        matchOptions[c].click();

        // DOM-readiness: poll for new message body (replaces fixed sleep(2000))
        await waitFor(function() {
            return readingPane.querySelectorAll('[aria-label="Message body"]').length > prevBodyCount;
        }, 3000, 50);

        // Try expand conversation — scoped to clicked option (not global button search)
        var expandBtn = matchOptions[c].querySelector('button[aria-label="Expand conversation"]');
        var wasExpanded = false;
        if (expandBtn) {
            var preExpandItems = messageList.querySelectorAll('[role=listitem]').length;
            expandBtn.click();
            await waitFor(function() {
                return messageList.querySelectorAll('[role=listitem]').length > preExpandItems;
            }, 3000, 50);
            await sleep(500);
            wasExpanded = true;
        }

        // Single pass: discover listitems + click them + collect labels
        var seenItemLabels = {};
        var clickedLabels = {};
        var items = messageList.querySelectorAll('[role=listitem]');
        for (var j = 0; j < items.length; j++) {
            var label = items[j].getAttribute('aria-label') || '';
            if (label.length <= 30 || seenItemLabels[label]) continue;
            seenItemLabels[label] = true;
            var isDup = false;
            for (var d = 0; d < allLabels.length; d++) { if (allLabels[d] === label) { isDup = true; break; } }
            if (!isDup) allLabels.push(label);
            // Click to load email in reading pane (full mode only)
            if (mode === 'full' && !clickedLabels[label]) {
                items[j].scrollIntoView({behavior:'instant',block:'center'});
                items[j].click();
                clickedLabels[label] = true;
                await sleep(scrollDelay);
            }
        }

        // Fallback: use option label if no new listitems
        if (Object.keys(seenItemLabels).length === 0) {
            var optLabel2 = matchOptions[c].getAttribute('aria-label') || '';
            if (optLabel2.length > 30) {
                var isDup2 = false;
                for (var d2 = 0; d2 < allLabels.length; d2++) { if (allLabels[d2] === optLabel2) { isDup2 = true; break; } }
                if (!isDup2) allLabels.push(optLabel2);
            }
        }

        if (mode === 'full' && wasExpanded) {
            var lastBodyCount = readingPane.querySelectorAll('[aria-label="Message body"]').length;
            await waitFor(function() {
                return readingPane.querySelectorAll('[aria-label="Message body"]').length > lastBodyCount;
            }, 1000, 100);
        }

        // Collect NEW bodies with metadata — scoped to reading pane
        var curBodies = readingPane.querySelectorAll('[aria-label="Message body"]');
        for (var n = prevBodyCount; n < curBodies.length; n++) {
            var rawText = curBodies[n].innerText || '';
            if (rawText.length <= 5) continue;

            // Extract metadata from message container
            var sender = '', direction = 'Unknown', dateStr = '';
            var msgContainer = null;
            var walkUp = curBodies[n];
            for (var up = 0; up < 8 && walkUp; up++) {
                walkUp = walkUp.parentElement;
                if (walkUp && walkUp.getAttribute && walkUp.getAttribute('aria-label') === 'Email message') { msgContainer = walkUp; break; }
            }
            if (msgContainer) {
                var fromEl = msgContainer.querySelector('[aria-label^="From: "]');
                if (fromEl) sender = fromEl.getAttribute('aria-label').replace('From: ', '');
                var pageUser = '';
                var titleMatch = document.title.match(/(?:Mail|\u90ae\u4ef6)\s*-\s*(.+?)\s*-\s*Outlook/i);
                if (titleMatch) pageUser = titleMatch[1].trim();
                if (pageUser && sender) {
                    direction = (sender.indexOf(pageUser) === 0 || pageUser.indexOf(sender) === 0) ? 'Sent' : 'Received';
                } else {
                    var extEl = msgContainer.querySelector('[aria-label^="Opens card"]');
                    direction = extEl ? 'Received' : 'Sent';
                }
                // Extract date from message container divs
                var divs = msgContainer.querySelectorAll('div');
                for (var di = 0; di < divs.length; di++) {
                    if (divs[di].closest('[aria-label="Message body"]')) continue;
                    var dtxt = divs[di].textContent.trim();
                    dtxt = dtxt.replace(/^To:\s*\S+\s*/i, '').replace(/^[\u200b\u200c\u200d\ufeff]+/g, '').trim();
                    if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(dtxt) && dtxt.length < 50) {
                        var dateMatch = dtxt.match(/((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}\s*(?:AM|PM))/i)
                            || dtxt.match(/(\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}\s*(?:AM|PM))/i)
                            || dtxt.match(/((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d{1,2}\/\d{1,2}\/\d{4})/i)
                            || dtxt.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
                        dateStr = dateMatch ? dateMatch[1] : dtxt; break;
                    }
                    if (/(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d{1,2}\/\d{1,2}/i.test(dtxt) && dtxt.length < 50) {
                        var dateMatch2 = dtxt.match(/((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\s*\d{0,2}:?\d{0,2}\s*(?:AM|PM)?)/i);
                        dateStr = dateMatch2 ? dateMatch2[1].trim() : dtxt; break;
                    }
                }
            }
            allBodies.push({ text: rawText, el: curBodies[n], direction: direction, date: dateStr, from: sender });
        }

        // After extracting from an expanded conversation, break — it contains all emails
        if (wasExpanded && Object.keys(clickedLabels).length > 0) {
            break;
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // Phase 3: Two-pass dedup
    // ══════════════════════════════════════════════════════════════════
    // Pass 1: Remove pure quoted reply chain bodies
    var pass1Bodies = [];
    for (var i = 0; i < allBodies.length; i++) {
        var t = allBodies[i].text.replace(/\s+/g, ' ').trim();
        if (/^From:\s.+?(Sent|\u53d1\u9001\u65f6\u95f4):\s/i.test(t)) continue;
        pass1Bodies.push(allBodies[i]);
    }

    // Pass 2: Substring dedup
    var dedupedBodies = [];
    for (var i = 0; i < pass1Bodies.length; i++) {
        var isDuplicate = false;
        var selfNorm = pass1Bodies[i].text.replace(/\s+/g, ' ').trim();
        var prefix = selfNorm.substring(0, 100);
        if (prefix.length >= 20) {
            for (var j = 0; j < pass1Bodies.length; j++) {
                if (i === j) continue;
                var otherNorm = pass1Bodies[j].text.replace(/\s+/g, ' ').trim();
                if (otherNorm.indexOf(prefix) > -1 && otherNorm.length > selfNorm.length + 50) { isDuplicate = true; break; }
            }
        }
        if (!isDuplicate) dedupedBodies.push(pass1Bodies[i]);
    }

    // ══════════════════════════════════════════════════════════════════
    // Phase 4: Junk email filtering (ported from fast version)
    // ══════════════════════════════════════════════════════════════════
    var filteredBodies = [];
    for (var f = 0; f < dedupedBodies.length; f++) {
        var e = dedupedBodies[f];
        var bodyText = e.text || '';
        if (bodyText.length < 15) continue;
        // OOF / auto-reply
        if (/(?:I['\u2019]ll be out|I will be out|I am (?:on )?(?:leave|biz trip|business trip|holiday|travel)|Out of Office|OOF\b|back to office|\u4e0d\u5728\u529e\u516c\u5ba4|out of office|<<\s*automatic reply\s*>>|\u81ea\u52a8\u56de\u590d|auto[-]?reply|on annual leave|on vacation|on PTO|maternity leave|paternity leave|taking.*leave|Dear sender|limited access to (?:my )?email|with limited access)/i.test(bodyText) && bodyText.length < 1200) continue;
        // Delivery failure
        if (/^Delivery has failed|^\u65e0\u6cd5\u4f20\u9012|^Undeliverable/i.test(bodyText.trim())) continue;
        // System senders
        if (e.from === 'Microsoft Outlook' || e.from === 'postmaster') continue;
        // Pure quoted chain
        var bodyNorm = bodyText.replace(/\s+/g, ' ').trim();
        if (/^From:\s.{5,80}Sent:\s/i.test(bodyNorm) || /^\u53d1\u4ef6\u4eba:\s.{3,60}\u53d1\u9001\u65f6\u95f4:\s/i.test(bodyNorm)) continue;
        filteredBodies.push(e);
    }
    dedupedBodies = filteredBodies;

    // Final body dedup by prefix
    var finalBodies = [];
    var seenBodies = {};
    for (var g = 0; g < dedupedBodies.length; g++) {
        var key = dedupedBodies[g].text.replace(/\s+/g, ' ').substring(0, 150);
        if (seenBodies[key]) continue;
        seenBodies[key] = true;
        finalBodies.push(dedupedBodies[g]);
    }
    dedupedBodies = finalBodies;

    // ══════════════════════════════════════════════════════════════════
    // Phase 5: Build markdown output
    // ══════════════════════════════════════════════════════════════════
    var source = withImages ? 'OWA Full Body + Images' : 'OWA Full Body';
    if (mode === 'preview') source = 'OWA Preview';
    var md = '# Emails (OWA) \u2014 Case ' + caseNumber + '\n\n';
    md += '> Generated: ' + new Date().toISOString() + ' | Conversations: ' + matchOptions.length + ' | Emails: ' + allLabels.length + ' | Bodies: ' + dedupedBodies.length + ' | Images: TBD | Source: ' + source + '\n\n---\n';

    if (mode === 'full' && dedupedBodies.length > 0) {
        for (var p = 0; p < dedupedBodies.length; p++) {
            var item = dedupedBodies[p];
            var body = extractBodyWithImages(item.el);
            body = cleanBody(body);
            if (body.length < 15) continue;
            var icon = item.direction === 'Received' ? '\ud83d\udce5 Received' : '\ud83d\udce4 Sent';
            md += '\n### ' + icon + ' | ' + (item.date || '') + '\n**From:** ' + (item.from || '?') + '\n\n' + body + '\n\n---\n';
        }
    } else {
        for (var q = 0; q < allLabels.length; q++) {
            var isExt2 = allLabels[q].indexOf('External sender') > -1;
            var clean2 = allLabels[q].replace('External sender ', '').replace('Flagged ', '').replace('Unread Expanded ', '').replace('Unread ', '').replace('Collapsed ', '');
            var parts2 = clean2.split(/\s{2,}/);
            var sender2 = parts2[0] || '?';
            var icon2 = isExt2 ? '\ud83d\udce5 Received' : '\ud83d\udce4 Sent';
            var bodyText2 = parts2.slice(1).join(' ');
            md += '\n### ' + icon2 + '\n**From:** ' + sender2 + '\n\n' + bodyText2 + '\n\n---\n';
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // Phase 6: Image dedup by fingerprint
    // ══════════════════════════════════════════════════════════════════
    var fpCount = {};
    for (var fi = 0; fi < rawImgCollector.length; fi++) {
        var fp = rawImgCollector[fi].fingerprint;
        fpCount[fp] = (fpCount[fp] || 0) + 1;
    }
    var imgArray = [];
    var finalImgIdx = 0;
    var placeholderMap = {};
    for (var fi2 = 0; fi2 < rawImgCollector.length; fi2++) {
        var img = rawImgCollector[fi2];
        if (fpCount[img.fingerprint] >= 2) {
            placeholderMap[img.placeholderId] = '';  // repeated = signature logo, remove
        } else {
            finalImgIdx++;
            var imgName = 'owa-img-' + String(finalImgIdx).padStart(3, '0') + '.png';
            imgArray.push({name: imgName, dataUrl: img.dataUrl});
            placeholderMap[img.placeholderId] = '![image](images/' + imgName + ')';
        }
    }
    for (var pid in placeholderMap) {
        md = md.split(pid).join(placeholderMap[pid]);
    }
    md = md.replace(/\n{3,}/g, '\n\n');
    md = md.replace('Images: TBD', 'Images: ' + imgArray.length);

    // ══════════════════════════════════════════════════════════════════
    // Phase 7: Build JSON output
    // ══════════════════════════════════════════════════════════════════
    var jsonEmails = [];
    for (var jj = 0; jj < dedupedBodies.length; jj++) {
        var jItem = dedupedBodies[jj];
        var jBody = jItem.text || '';
        if (jBody.length < 15) continue;
        jsonEmails.push({
            index: jsonEmails.length,
            direction: jItem.direction === 'Sent' ? 'Outgoing' : 'Incoming',
            from: jItem.from || '?',
            date: jItem.date || '',
            subject: '',
            body: jBody,
            imageCount: 0
        });
    }

    var jsonOutput = {
        caseNumber: caseNumber,
        generatedAt: new Date().toISOString(),
        source: source,
        conversationCount: matchOptions.length,
        emailCount: allLabels.length,
        bodyCount: dedupedBodies.length,
        imageCount: imgArray.length,
        emails: jsonEmails
    };

    // Store JSON in hidden textarea
    var taJson = document.getElementById('_owa_extract_json') || document.createElement('textarea');
    taJson.id = '_owa_extract_json'; taJson.style.cssText = 'position:fixed;left:-9999px';
    taJson.value = JSON.stringify(jsonOutput);
    if (!taJson.parentElement) document.body.appendChild(taJson);

    // Store MD in hidden textarea
    var ta = document.getElementById('_owa_extract_md') || document.createElement('textarea');
    ta.id = '_owa_extract_md'; ta.style.cssText = 'position:fixed;left:-9999px';
    ta.value = md;
    if (!ta.parentElement) document.body.appendChild(ta);

    // Store image data on window for PowerShell to read
    window.__OWA_IMAGES = imgArray;

    var elapsed = Date.now() - t0;
    return 'OK|' + allLabels.length + '|' + matchOptions.length + '|' + dedupedBodies.length + '|' + imgArray.length + '|' + md.length + '|' + elapsed;
})()
