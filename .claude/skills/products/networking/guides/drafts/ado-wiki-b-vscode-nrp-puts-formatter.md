---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Tools and TSGs/VSCode extension to format and cleanup NRP PUTs"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FTools%20and%20TSGs%2FVSCode%20extension%20to%20format%20and%20cleanup%20NRP%20PUTs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# VSCode extension to convert NRP PUTs into a readable format

VSCode extension (`vscode-nrpcleaner`) to format raw NRP PUT dumps from Jarvis into readable JSON.

See also the Node.js alternative: [Using Node.js to convert NRP PUTs](ado-wiki-b-nodejs-convert-nrp-puts.md)

## Installation

1. Download the VSCode extension (vscode-nrpcleaner-0.0.1.zip) from the wiki
2. Unzip the file locally
3. Open Powershell where you have unzipped the file
4. Run:
```powershell
code --install-extension vscode-nrpcleaner-0.0.2.vsix
```
5. Restart VSCode

## Features

### Clean & Format Current Editor

Processes the active editor content:
1. Strips HTTP headers from multi-line and single-line request dumps
2. Extracts outermost JSON body (regardless of first key)
3. Handles truncated or damaged JSON with best-effort repair
4. Parses and pretty-prints JSON with 2-space indentation
5. Sets editor language to JSON for syntax highlighting
6. If JSON was incomplete/damaged, a warning banner is prepended

### Clean & Format from Clipboard

Reads clipboard, applies the same pipeline, opens result in new JSON editor tab.

### Damaged / Incomplete JSON Handling

If input JSON is truncated or has formatting issues, the extension will:
- Auto-repair on best-effort basis (closing unclosed braces/brackets, removing trailing commas)
- Prepend clear warning at top of output

## Commands

| Command | Title | Keybinding |
|---------|-------|------------|
| `nrp-json-cleaner.cleanAndFormat` | NRP JSON: Clean & Format Current Editor | `Ctrl+Shift+J` |
| `nrp-json-cleaner.cleanFromClipboard` | NTP JSON: Clean & Format from Clipboard | `Ctrl+Shift+Alt+J` |

## Usage

1. **From an open editor**: Paste raw NRP PUT from Jarvis NRP operations, press `Ctrl+Shift+J`
2. **From clipboard**: Copy raw NRP PUT from Jarvis, press `Ctrl+Shift+Alt+J`

## Tips and tricks

When working with Jarvis NRP frontend operations, output just the Messages section using KQL:

```kql
source
| sort by PreciseTimeStamp asc
| project Message
```

## Requirements

No additional dependencies. Works with VS Code 1.109.0 or later.
