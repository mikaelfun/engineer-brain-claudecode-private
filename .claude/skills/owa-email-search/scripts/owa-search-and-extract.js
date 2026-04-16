// owa-search-and-extract.js
// Mega JS: search + wait + extract in one eval call
// Optimized: replaces separate search polling + extraction
// Called by owa-email-fetch.ps1 via playwright-cli eval

(async function(){
    var t0 = Date.now();
    var caseNumber = window.__OWA_CASE_NUMBER || '';
    var mode = window.__OWA_MODE || 'full';
    var scrollDelay = window.__OWA_SCROLL_DELAY || 150;
    var cutoffDateStr = window.__OWA_CUTOFF_DATE || '';
    var prevHash = window.__OWA_PREV_HASH || '';
    var doSearch = window.__OWA_DO_SEARCH || false;

    function sleep(ms) { return new Promise(function(r){ setTimeout(r, ms); }); }

    // Wait for DOM condition with polling (replaces fixed sleep)
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

    // Parse cutoff date
    var cutoffTime = 0;
    var cutoffTimePrecise = 0;
    if (cutoffDateStr) {
        var cd = cutoffDateStr.replace(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+/i, '');
        var parsed = new Date(cd);
        if (!isNaN(parsed.getTime())) {
            cutoffTime = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime();
            cutoffTimePrecise = parsed.getTime();
        }
    }

    // == Phase 1: Search (if requested) ==
    if (doSearch) {
        var sb = document.querySelector('[role=search] [role=combobox]') || document.getElementById('topSearchInput');
        if (!sb) return 'SEARCH_FAILED|NO_SEARCH_BOX|0|0|0|' + (Date.now()-t0) + '|0';

        var currentVal = (sb.value || '').trim();
        if (currentVal !== caseNumber) {
            sb.focus();
            sb.click();
            await sleep(100);

            // Method 1: execCommand (best React compat)
            sb.select();
            document.execCommand('selectAll', false, null);
            document.execCommand('insertText', false, caseNumber);
            await sleep(150);

            // Verify & Method 2 fallback
            if ((sb.value || '').trim() !== caseNumber) {
                try {
                    var nativeSetter = Object.getOwnPropertyDescriptor(
                        window.HTMLInputElement.prototype, 'value'
                    ).set;
                    nativeSetter.call(sb, caseNumber);
                    sb.dispatchEvent(new Event('input', { bubbles: true }));
                    sb.dispatchEvent(new Event('change', { bubbles: true }));
                    await sleep(100);
                } catch(e) {}
            }

            if ((sb.value || '').indexOf(caseNumber) === -1) {
                return 'SEARCH_FAILED|INPUT_FAILED|0|0|0|' + (Date.now()-t0) + '|0';
            }

            // Submit: try Search button, then Enter key
            var submitted = false;
            var searchContainer = sb.closest('[role=search]');
            if (searchContainer) {
                var searchBtns = searchContainer.querySelectorAll('button');
                for (var sb2 = 0; sb2 < searchBtns.length; sb2++) {
                    var lbl2 = (searchBtns[sb2].getAttribute('aria-label') || '').toLowerCase();
                    if (lbl2 === 'search') { searchBtns[sb2].click(); submitted = true; break; }
                }
            }
            if (!submitted) {
                var enterOpts = {key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true};
                sb.dispatchEvent(new KeyboardEvent('keydown', enterOpts));
                sb.dispatchEvent(new KeyboardEvent('keypress', enterOpts));
                sb.dispatchEvent(new KeyboardEvent('keyup', enterOpts));
            }
        }
    }

    // == Phase 2: Wait for search results (in-browser polling) ==
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

    // Build options hash
    var optionLabelsHash = '';
    for (var oh = 0; oh < matchOptions.length; oh++) {
        var ohLbl = matchOptions[oh].getAttribute('aria-label') || '';
        optionLabelsHash += ohLbl.length + ':' + ohLbl.substring(0, 50) + '|';
    }

    // Dedup matchOptions: same conversation may appear multiple times with different prefixes
    // Strip state prefixes (Unread/Collapsed/Flagged/External sender) then compare FULL label
    // Different threads with same subject will have different preview text/dates, so won't collide
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

    // Quick no-change detection
    if (prevHash && prevHash === optionLabelsHash && matchOptions.length > 0) {
        var skipJson = JSON.stringify({ caseNumber: caseNumber, timestamp: new Date().toISOString(),
            conversationCount: matchOptions.length, emailCount: 0, emails: [], _noChange: true });
        var ta0 = document.getElementById('_owa_extract_json') || document.createElement('textarea');
        ta0.id = '_owa_extract_json'; ta0.style.cssText = 'position:fixed;left:-9999px'; ta0.value = skipJson;
        if (!ta0.parentElement) document.body.appendChild(ta0);
        return 'OK|0|' + matchOptions.length + '|0|' + skipJson.length + '|' + (Date.now()-t0) + '|0';
    }

    if (matchOptions.length === 0) {
        var emptyJson = JSON.stringify({ caseNumber: caseNumber, timestamp: new Date().toISOString(),
            conversationCount: 0, emailCount: 0, emails: [] });
        var ta0 = document.getElementById('_owa_extract_json') || document.createElement('textarea');
        ta0.id = '_owa_extract_json'; ta0.style.cssText = 'position:fixed;left:-9999px'; ta0.value = emptyJson;
        if (!ta0.parentElement) document.body.appendChild(ta0);
        return 'EMPTY|0|0|0|' + emptyJson.length + '|' + (Date.now()-t0) + '|0';
    }

    // == Phase 3: Extract conversations ==
    var allLabels = [];
    var allBodies = [];

    function extractBody(bodyEl) {
        var md = '';
        function walk(node) {
            if (node.nodeType === 3) {
                var t = node.textContent;
                if (t.indexOf('ZjQcmQRYFpfptBanner') > -1) return;
                if (t.indexOf('External Email - Think Before You Click') > -1) return;
                md += t; return;
            }
            if (node.nodeType !== 1) return;
            var tag = node.tagName;
            var style = node.getAttribute('style') || '';
            if (style.indexOf('display:none') > -1 || style.indexOf('display: none') > -1) return;
            if (tag === 'IMG') return;
            if (tag === 'BR') { md += '\n'; return; }
            if (tag === 'A') {
                var href = node.getAttribute('href') || '';
                var linkText = node.innerText || '';
                if (href && linkText && linkText.length > 3) {
                    var cleanHref = href;
                    var safeLinkMatch = href.match(/[?&]url=([^&]+)/);
                    if (safeLinkMatch) { try { cleanHref = decodeURIComponent(safeLinkMatch[1]); } catch(e) {} }
                    md += '[' + linkText + '](' + cleanHref + ')'; return;
                }
            }
            var isBlock = (tag==='P'||tag==='DIV'||tag==='TABLE'||tag==='TR'||tag==='LI'||tag==='H1'||tag==='H2'||tag==='H3');
            if (isBlock) md += '\n';
            for (var c = 0; c < node.childNodes.length; c++) walk(node.childNodes[c]);
            if (isBlock) md += '\n';
        }
        for (var i = 0; i < bodyEl.childNodes.length; i++) walk(bodyEl.childNodes[i]);

        var quoteIdx = md.search(/\nFrom:\s.+\nSent:\s/);
        if (quoteIdx === -1) quoteIdx = md.search(/\n\u53d1\u4ef6\u4eba:\s[^\n]+[\n\s]+\u53d1\u9001\u65f6\u95f4:\s/);
        if (quoteIdx > 20) md = md.substring(0, quoteIdx).trimEnd();

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

    var totalSkippedByCutoff = 0;

    // Safety cap: max 15 conversations to avoid infinite loops
    var maxConvs = Math.min(matchOptions.length, 15);
    var gotExpandedConv = false; // Track if we already extracted from an expanded conversation

    for (var c = 0; c < maxConvs; c++) {
        var targetLabel = matchOptions[c].getAttribute('aria-label') || '';

        if (cutoffTime > 0) {
            var optDateMatch = targetLabel.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
            if (!optDateMatch) {
                var optShort = targetLabel.match(/(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\d{1,2}\/\d{1,2})/i);
                if (optShort) { var cy = new Date(cutoffTime).getFullYear(); optDateMatch = [null, optShort[1]+'/'+cy]; }
            }
            if (optDateMatch) {
                var optTime = new Date(optDateMatch[1]).getTime();
                if (!isNaN(optTime) && optTime < cutoffTime) continue;
            }
        }

        var prevBodyCount = document.querySelectorAll('[aria-label="Message body"]').length;
        matchOptions[c].click();

        // DOM-readiness: poll for new message body (replaces fixed 1000ms)
        await waitFor(function() {
            return document.querySelectorAll('[aria-label="Message body"]').length > prevBodyCount;
        }, 3000, 50);

        // Scope reading pane for body extraction
        var readingPane = document.querySelector('[role=main]') || document.querySelector('main') || document;

        // Message list is in [role=complementary] — that's where expand/listitems live
        var messageList = document.querySelector('[role=complementary][aria-label="Message list"]') || document;

        // Try expand conversation — button is INSIDE the clicked option (message list), NOT reading pane
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
        var stoppedEarly = false;
        var items = messageList.querySelectorAll('[role=listitem]');
        for (var j = 0; j < items.length; j++) {
            var label = items[j].getAttribute('aria-label') || '';
            if (label.length <= 30 || seenItemLabels[label]) continue;
            seenItemLabels[label] = true;
            // Collect for allLabels
            var isDup = false;
            for (var d = 0; d < allLabels.length; d++) { if (allLabels[d] === label) { isDup = true; break; } }
            if (!isDup) allLabels.push(label);
            // Click to load email in reading pane (full mode only)
            if (mode === 'full' && !clickedLabels[label]) {
                if (cutoffTime > 0) {
                    var labelDateMatch = label.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
                    if (!labelDateMatch) {
                        var shortMatch = label.match(/(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\d{1,2}\/\d{1,2})/i);
                        if (shortMatch) { var cutoffYear = new Date(cutoffTime).getFullYear(); labelDateMatch = [null, shortMatch[1]+'/'+cutoffYear]; }
                    }
                    if (labelDateMatch) {
                        var labelTime = new Date(labelDateMatch[1]).getTime();
                        if (!isNaN(labelTime) && labelTime < cutoffTime) { stoppedEarly = true; break; }
                    }
                }
                items[j].scrollIntoView({behavior:'instant',block:'center'});
                items[j].click();
                clickedLabels[label] = true;
                await sleep(scrollDelay);
            }
        }

        // Fallback: if no listitems found, use the option label
        if (Object.keys(seenItemLabels).length === 0) {
            var optLabel2 = matchOptions[c].getAttribute('aria-label') || '';
            if (optLabel2.length > 30) {
                var isDup2 = false;
                for (var d2 = 0; d2 < allLabels.length; d2++) { if (allLabels[d2] === optLabel2) { isDup2 = true; break; } }
                if (!isDup2) allLabels.push(optLabel2);
            }
        }

        if (mode === 'full' && wasExpanded && !stoppedEarly) {
            // Brief wait for last clicked email body to render
            var lastBodyCount = readingPane.querySelectorAll('[aria-label="Message body"]').length;
            await waitFor(function() {
                return readingPane.querySelectorAll('[aria-label="Message body"]').length > lastBodyCount;
            }, 1000, 100);
        }

        // Collect NEW bodies with metadata — scoped to reading pane
        var curBodies = readingPane.querySelectorAll('[aria-label="Message body"]');
        var skippedByCutoff = 0;
        for (var n = prevBodyCount; n < curBodies.length; n++) {
            var rawText = curBodies[n].innerText || '';
            if (rawText.length <= 5) continue;
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
                if (cutoffTimePrecise > 0 && dateStr) {
                    var cleanD = dateStr.replace(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+/i, '');
                    var emailTime = new Date(cleanD).getTime();
                    if (!isNaN(emailTime) && emailTime <= cutoffTimePrecise) { skippedByCutoff++; continue; }
                }
            }
            var bodyText = extractBody(curBodies[n]);
            allBodies.push({ text: rawText, bodyClean: bodyText, direction: direction, date: dateStr, from: sender });
        }
        totalSkippedByCutoff += skippedByCutoff;

        // After extracting from an expanded conversation, skip remaining search results
        // The main case conversation (first expanded result) contains all relevant emails
        if (wasExpanded && Object.keys(clickedLabels).length > 0) {
            gotExpandedConv = true;
            break;
        }
    }

    // == Phase 4: Two-pass dedup ==
    var pass1Bodies = [];
    for (var i = 0; i < allBodies.length; i++) {
        var t = allBodies[i].text.replace(/\s+/g, ' ').trim();
        // Remove bodies that are pure quoted reply chains (From:...Sent:... at start)
        // These are full email chains rendered by OWA conversation view, not standalone emails
        if (/^From:\s.+?(Sent|\u53d1\u9001\u65f6\u95f4):\s/i.test(t)) {
            continue;
        }
        pass1Bodies.push(allBodies[i]);
    }

    var dedupedBodies = [];
    for (var i = 0; i < pass1Bodies.length; i++) {
        var isDuplicate = false;
        // Use bodyClean (quote-stripped) for dedup, NOT rawText which includes reply chains in OWA conversation view
        var selfNorm = (pass1Bodies[i].bodyClean || pass1Bodies[i].text).replace(/\s+/g, ' ').trim();
        var prefix = selfNorm.substring(0, 100);
        if (prefix.length >= 20) {
            for (var j = 0; j < pass1Bodies.length; j++) {
                if (i === j) continue;
                var otherNorm = (pass1Bodies[j].bodyClean || pass1Bodies[j].text).replace(/\s+/g, ' ').trim();
                if (otherNorm.indexOf(prefix) > -1 && otherNorm.length > selfNorm.length + 50) { isDuplicate = true; break; }
            }
        }
        if (!isDuplicate) dedupedBodies.push(pass1Bodies[i]);
    }

    // == Phase 5: Build JSON ==
    function cleanBody(text) {
        text = text.replace(/\u63d0\u9192:[\s\S]{0,300}?\u4e0d\u8981\u70b9\u51fb\u94fe\u63a5\u6216\u6253\u5f00\u9644\u4ef6\u3002\s*/g, '');
        text = text.replace(/CAUTION:[\s\S]{0,500}?know the content is safe\.\s*/g, '');
        // Generic email footer/disclaimer removal:
        // Cut at the FIRST line matching a disclaimer pattern, but only if it's in the last 40% of body
        var lines = text.split('\n');
        var cutAt = -1;
        var minLine = Math.floor(lines.length * 0.6); // only look in last 40%
        var footerPatterns = [
            /^[-_=]{3,}\s*$/,                                           // separator lines: --- ___ ===
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
    function parseLabel(label) {
        var isExt = label.indexOf('External sender') > -1;
        var clean = label.replace('External sender ', '').replace('Flagged ', '')
            .replace('Unread Expanded ', '').replace('Unread ', '').replace('Collapsed ', '');
        var parts = clean.split(/\s{2,}/);
        var sender;
        if (parts.length >= 2) { sender = parts[0]; }
        else {
            var senderMatch = clean.match(/^(.+?)\s+(?:RE:|FW:|\u56de\u590d:|\u8f6c\u53d1:|Outage|\[\u5916\u90e8\]|\u9700\u8981|Action|Updated|Azure|Case\s)/i);
            sender = senderMatch ? senderMatch[1].trim() : clean.substring(0, 60);
        }
        return { direction: isExt ? 'Received' : 'Sent', from: sender };
    }

    var emails = [];
    if (mode === 'full' && dedupedBodies.length > 0) {
        for (var p = 0; p < dedupedBodies.length; p++) {
            var item = dedupedBodies[p];
            var body = cleanBody(item.bodyClean || '');
            if (body.length < 15) continue;
            emails.push({ direction: item.direction || 'Unknown', date: item.date || '', from: item.from || '', body: body });
        }
    } else {
        for (var q = 0; q < allLabels.length; q++) {
            var parsed2 = parseLabel(allLabels[q]);
            var parts2 = allLabels[q].replace(/External sender |Flagged |Unread /g, '').split(/\s{2,}/);
            var bodyText2 = parts2.slice(1).join(' ');
            emails.push({ direction: parsed2.direction, date: '', from: parsed2.from, body: bodyText2 });
        }
    }

    // == Phase 6: Filter junk ==
    var cleanEmails = [];
    for (var f = 0; f < emails.length; f++) {
        var e = emails[f];
        if (e.body.length < 15) continue;
        if (/(?:I['\u2019]ll be out|I will be out|I am (?:on )?(?:leave|biz trip|business trip|holiday|travel)|Out of Office|OOF\b|back to office|\u4e0d\u5728\u529e\u516c\u5ba4|out of office|<<\s*automatic reply\s*>>|\u81ea\u52a8\u56de\u590d|auto[- ]?reply|on annual leave|on vacation|on PTO|maternity leave|paternity leave|taking.*leave|Dear sender|limited access to (?:my )?email|with limited access)/i.test(e.body) && e.body.length < 1200) continue;
        if (/^Delivery has failed|^\u65e0\u6cd5\u4f20\u9012|^Undeliverable/i.test(e.body.trim())) continue;
        if (e.from === 'Microsoft Outlook' || e.from === 'postmaster') continue;
        var bodyNorm = e.body.replace(/\s+/g, ' ').trim();
        if (/^From:\s.{5,80}Sent:\s/i.test(bodyNorm) || /^\u53d1\u4ef6\u4eba:\s.{3,60}\u53d1\u9001\u65f6\u95f4:\s/i.test(bodyNorm)) continue;
        cleanEmails.push(e);
    }
    emails = cleanEmails;

    // == Phase 7: Final body dedup ==
    var finalEmails = [];
    var seenBodies = {};
    for (var g = 0; g < emails.length; g++) {
        var key = emails[g].body.replace(/\s+/g, ' ').substring(0, 150);
        if (seenBodies[key]) continue;
        seenBodies[key] = true;
        finalEmails.push(emails[g]);
    }
    emails = finalEmails;

    var jsonResult = JSON.stringify({
        caseNumber: caseNumber,
        timestamp: new Date().toISOString(),
        conversationCount: matchOptions.length,
        emailCount: emails.length,
        emails: emails,
        _optionsHash: optionLabelsHash
    });

    var ta = document.getElementById('_owa_extract_json') || document.createElement('textarea');
    ta.id = '_owa_extract_json';
    ta.style.cssText = 'position:fixed;left:-9999px';
    ta.value = jsonResult;
    if (!ta.parentElement) document.body.appendChild(ta);

    var elapsed = Date.now() - t0;
    return 'OK|' + allLabels.length + '|' + matchOptions.length + '|' + dedupedBodies.length + '|' + jsonResult.length + '|' + elapsed + '|' + totalSkippedByCutoff;
})()
