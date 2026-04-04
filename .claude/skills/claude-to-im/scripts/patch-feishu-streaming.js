#!/usr/bin/env node
/**
 * Post-install patch for claude-to-im Feishu streaming cards.
 *
 * Fixes cardkit.v2 references → v1 with correct API formats.
 * Run: node scripts/patch-feishu-streaming.js
 * Or add to package.json: "postinstall": "node scripts/patch-feishu-streaming.js"
 *
 * Reference: https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/streaming-updates-openapi-overview
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TARGET = resolve(__dirname, '../node_modules/claude-to-im/dist/lib/bridge/adapters/feishu-adapter.js');

if (!existsSync(TARGET)) {
  console.log('[patch] feishu-adapter.js not found, skipping');
  process.exit(0);
}

let code = readFileSync(TARGET, 'utf8');
const original = code;

// Use simple string replacements — more reliable than regex for multi-line code

// 1. hasV2 ternary → always v1 (appears twice: in create and finalize)
code = code.replaceAll(
  `hasV2
                ? this.restClient.cardkit.v2.card
                : this.restClient.cardkit.v1.card`,
  `this.restClient.cardkit.v1.card`
);

// 2. Remove hasV2 declarations
code = code.replaceAll(
  `const hasV2 = !!this.restClient.cardkit?.v2?.card;\n`,
  ''
);
code = code.replaceAll(
  `const hasV2 = !!this.restClient.cardkit?.v2?.card;`,
  ''
);

// 3. streamContent → cardElement.content (replace entire function body)
code = code.replace(
  `        // v2: use streamContent for real-time updates; v1: skip mid-stream updates (final update only)
        const hasStreamContent = !!this.restClient.cardkit?.v2?.card?.streamContent;
        if (!hasStreamContent)
            return; // v1 cards updated only at finalize
        // Fire-and-forget — streaming updates are non-critical
        this.restClient.cardkit.v2.card.streamContent({
            path: { card_id: cardId },
            data: { content, sequence: seq },
        }).then(() => {
            state.lastUpdateAt = Date.now();
        }).catch((err) => {
            console.warn('[feishu-adapter] streamContent failed:', err instanceof Error ? err.message : err);
        });`,
  `        // Fire-and-forget — streaming updates via cardElement.content (打字机效果)
        (async () => {
            try {
                await this.restClient.cardkit.v1.cardElement.content({
                    path: { card_id: cardId, element_id: 'streaming_content' },
                    data: { content, sequence: seq },
                });
                state.lastUpdateAt = Date.now();
            } catch (err) {
                console.warn('[feishu-adapter] streamContent failed:', err instanceof Error ? err.message : err);
            }
        })();`
);

// 4. settings.streamingMode.set → card.settings with JSON string format
code = code.replace(
  `            // Step 1: Close streaming mode (v2 only)
            if (hasV2) {
                state.sequence++;
                await this.restClient.cardkit.v2.card.settings.streamingMode.set({
                    path: { card_id: state.cardId },
                    data: { streaming_mode: false, sequence: state.sequence },
                });
            }`,
  `            // Step 1: Close streaming mode
            state.sequence++;
            await this.restClient.cardkit.v1.card.settings({
                path: { card_id: state.cardId },
                data: { settings: JSON.stringify({ config: { streaming_mode: false } }), sequence: state.sequence },
            });`
);

// 5. card.update: wrap in { type: 'card_json', data: ... } structure
// Original sends string directly or as object — API needs { card: { type, data } }
code = code.replaceAll(
  `data: { type: 'card_json', data: finalCardJson, sequence: state.sequence }`,
  `data: { card: { type: 'card_json', data: finalCardJson }, sequence: state.sequence }`
);
// Also fix if already partially patched
code = code.replaceAll(
  `data: { card: finalCardJson, sequence: state.sequence }`,
  `data: { card: { type: 'card_json', data: finalCardJson }, sequence: state.sequence }`
);
code = code.replaceAll(
  `data: { card: JSON.parse(finalCardJson), sequence: state.sequence }`,
  `data: { card: { type: 'card_json', data: finalCardJson }, sequence: state.sequence }`
);

// 6. Remove remaining hasV2 guards and ensure streaming_mode is always set
// Pattern: "if (!hasV2 && !hasV1) {" → "if (!hasV1) {"
code = code.replaceAll('if (!hasV2 && !hasV1) {', 'if (!hasV1) {');
// Pattern: "...(hasV2 ? { streaming_mode: true } : {})," → "streaming_mode: true,"
code = code.replaceAll('...(hasV2 ? { streaming_mode: true } : {}),', 'streaming_mode: true,');
// Any leftover hasV2 references
code = code.replaceAll('hasV2 ? ', 'false ? ');

// Validate
if (code === original) {
  console.log('[patch] No changes needed (already patched or source changed)');
  process.exit(0);
}

const checks = {
  'cardElement.content': code.includes('cardkit.v1.cardElement.content'),
  'v1.card.settings':    code.includes('cardkit.v1.card.settings('),
  'settings as JSON':    code.includes('JSON.stringify({ config: { streaming_mode'),
  'streaming_mode true': code.includes('streaming_mode: true,'),
  'no v2 references':    !code.match(/cardkit\.v2\.card\b/),
  'no hasV2 guards':     !code.match(/if \(!hasV2 &&/) && !code.match(/hasV2 \? \{ streaming/),
  'valid JS syntax':     !code.match(/\)\(\),\s*;/) && !code.match(/;;\s*\n\s*\}/)
};

writeFileSync(TARGET, code, 'utf8');

console.log('[patch] Feishu streaming card patches applied:');
let allOk = true;
for (const [name, ok] of Object.entries(checks)) {
  console.log(`  ${name}: ${ok ? '✅' : '❌'}`);
  if (!ok) allOk = false;
}

if (!allOk) {
  console.warn('[patch] ⚠️  Some checks failed. Review feishu-adapter.js manually.');
  process.exit(1);
}
