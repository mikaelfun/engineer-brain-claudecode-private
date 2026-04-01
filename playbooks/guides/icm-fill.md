# ICM Fill Guide — Description Table & Browser Automation

## Description Table Fill Rules

All content must be in **English** (ICM is reviewed by global EEE/PG teams).

### Business Impact
- Describe actual functional and operational impact
- Do NOT fabricate specific user counts unless confirmed by customer
- Example: "S500 Premier customer receives false alerts every week, causing alarm fatigue. Functional impact: none."

### Ask
- Number each point and put on separate lines
- Write specific, actionable questions to the product group
- Include evidence references (correlationId, operationId, table names)
- Example:
  ```
  1. Identify which component emits this Activity Log event — operationId is empty, correlationId not in ARM.
  2. Fix the false event emission or ensure correct terminal state.
  3. Document publicly if this is known behavior.
  ```

### Case Owner's Description
- 2-3 sentences from engineer perspective: what was investigated, what was found
- 1 short sentence for hypothesis/suspect if applicable
- Do NOT include full investigation details (that goes in Troubleshooting)
- Example: "Investigated 5 Kusto databases (18+ tables). All operations show Succeeded, error message not found in any RP/ARM log. Suspect: HCP underlay reconciler misinterprets intermediate state during sync lag."

### Customer Verbatim
- Write from customer's perspective describing what they observe
- Include specific error messages, timestamps, affected resources
- Do NOT include internal investigation details

### Frequency
- Use template options: Always Repros / Intermittent (specify pattern) / Happened Once
- Add brief pattern description

### Repro Steps
- Number each step on separate lines
- Include cluster config details in step 1
- Make reproducible by someone unfamiliar with the case

### Internal Repro
- State Yes/No clearly
- If Yes: describe what was tried and result
- If different code paths involved, explain why repro may not be equivalent

### Troubleshooting Performed
- **Structure**: Organize by layers (e.g., Layer 1: RP Logs, Layer 2: ARM, Layer 3: Infra)
- **Layer headers**: Bold (`<b>`)
- **Step titles**: Not bold, numbered
- **KQL queries**: Use `cluster().database().Table` format (see Kusto section below)
- **Results**: Use HTML tables with key columns (timestamp, operationName, operationID, correlationID, result)
- **Conclusion**: Bold label, summarize findings and suspected root cause

## Kusto Syntax Highlighting

### Color Scheme (Kusto Explorer style)
| Element | Color | Examples |
|---------|-------|----------|
| Keywords | Blue `#0000ff` | `where`, `contains`, `between`, `union`, `project`, `summarize` |
| Functions | Purple `#8b008b` | `cluster`, `database`, `datetime`, `ago`, `todynamic` |
| Strings | Dark Red `#a31515` | `'cluster-url'`, `"subscription-id"` |
| Operators | Gray `#808080` | `\|`, `==`, `!=`, `>=` |
| Table names | Default (black) | `AsyncQoSEvents`, `HttpIncomingRequests` |

### Code Block Style
```html
<div style="font-size:11px;font-family:Consolas,monospace;background:#f5f5f5;padding:4px 6px;display:block;border:1px solid #ddd;white-space:pre-wrap;">
  <!-- KQL with inline color spans -->
</div>
```

### Query Format Rules
- `cluster('...').database('...').TableName` must be on **one line** (no line break before table name)
- Each `| where` clause on its own line
- Queries must be directly copyable to Kusto Explorer

### HTML Template for a KQL Block
```html
<div style="...codeBlockStyle...">
<span style="color:#8b008b;">cluster</span>(<span style="color:#a31515;">'url'</span>).<span style="color:#8b008b;">database</span>(<span style="color:#a31515;">'db'</span>).TableName
<span style="color:#808080;">|</span> <span style="color:#0000ff;">where</span> field <span style="color:#808080;">==</span> <span style="color:#a31515;">"value"</span>
</div>
```

### Result Table Template
```html
<table border="1" cellpadding="2" style="border-collapse:collapse;font-size:12px;">
<tr><td>column1</td><td>column2</td><td>result</td></tr>
<tr><td>value1</td><td>value2</td><td>Succeeded</td></tr>
</table>
```

## Browser Automation Patterns

### Page Structure
ICM Create Incident page uses:
- **Main page**: Angular-based form with input fields, radio buttons, select2 dropdowns
- **Description field**: Kendo rich text editor inside `iframe.k-content`
- **Description template table**: HTML `<table>` inside the iframe, 2 columns (field name | value)

### Filling Strategies

#### Input Fields (Title, Subscription, etc.)
```javascript
const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
const input = document.querySelector('input[aria-label="Title"]');
setter.call(input, 'value');
input.dispatchEvent(new Event('input', { bubbles: true }));
input.dispatchEvent(new Event('change', { bubbles: true }));
```

#### Radio Buttons (Severity, SLA Impact)
```javascript
document.querySelector('input[aria-label="Severity of the incident 3"]').click();
```

#### Select2 Dropdowns (Impacted Regions)
```javascript
// 1. Click the container to open
await page.click('#s2id_autogen17 .select2-choices');
// 2. Type search text
await page.type('#s2id_autogen18', 'China North 3', { delay: 80 });
// 3. Wait for results, then click
await page.waitForTimeout(1000);
const option = await page.$('.select2-results .select2-result-selectable');
await option.click();
```

#### Description Table — Regular Cells
Must use keyboard input to trigger Angular data binding:
```javascript
const iframeEl = await page.$('iframe.k-content');
const cf = await iframeEl.contentFrame();
const cell = await cf.$('table tr:nth-child(N) td:nth-child(2)');
await cell.click();
// Select all existing content
await cf.evaluate((el) => {
  const range = document.createRange();
  range.selectNodeContents(el);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
}, cell);
await page.keyboard.press('Delete');
await page.keyboard.type(value, { delay: 0 });
```

#### Description Table — Rich Text Cell (Troubleshooting)
Use innerHTML for HTML formatting (tables, code blocks, syntax highlighting):
```javascript
await cf.evaluate((el) => {
  el.innerHTML = '<b>Layer 1: AKS RP Logs</b><br>...';
  el.dispatchEvent(new Event('input', { bubbles: true }));
}, cell);
```
**Note**: innerHTML bypasses Angular binding but the content persists for Troubleshooting because the rich text editor preserves HTML.

### Common Issues
- **select2 drop mask**: If a select2 dropdown is open, clicking elsewhere fails. Close with `document.getElementById('select2-drop-mask').click()`
- **Leave site dialog**: When navigating away from a filled form, use `browser_handle_dialog({ accept: true })`
- **Page load timeout**: ICM portal can be slow. Use `browser_wait_for` with text check after navigation
