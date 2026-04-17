---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Outdated? - Needs review if still useful/Insights/How to confirm which DCR and Log Analytics workspace is being selected?"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1363012"
importDate: "2026-04-06"
type: troubleshooting-guide
note: "Marked 'Outdated/needs review' – content may still be valid for AVD Insights troubleshooting."
---

# How to Confirm Which DCR and Log Analytics Workspace Is Being Selected (AVD Insights)

> ⚠️ This content is under development / may be outdated.

## Overview

When AVD Insights workbook shows unexpected data, it may be selecting a different DCR or Log Analytics workspace than intended. Use this procedure to verify what is currently selected.

## Steps

1. Go to **Azure Portal** → **Azure Virtual Desktop** → **Host Pools**
2. Select the impacted Host Pool
3. Click **Insights** (under Monitoring section)
4. Click **Customize** at the top menu
5. Click **Edit**
6. Look for the parameters **`poolla`** and **`assignedDCR`**:

| Parameter | What it shows |
|-----------|---------------|
| `poolla` | Currently selected Log Analytics workspace; dropdown shows all available LA workspaces linked to the host pool (Diagnostic Settings with LA workspace destination) |
| `assignedDCR` | Currently selected DCR; dropdown shows all available DCRs for this host pool |

## Related Pages
- [Insights Workbook not selecting expected DCR](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1363016)
- [Insights Workbook not selecting expected Log Analytics workspace](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1363018)
- [Insights Workbook displaying unexpected or incorrect data](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1353237)
