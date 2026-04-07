---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Archive/[Technical Knowledge] - Change DCR's Reporting Workspace"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Archive/%5BTechnical%20Knowledge%5D%20-%20Change%20DCR's%20Reporting%20Workspace"
importDate: "2026-04-05"
type: troubleshooting-guide
deprecated: true
deprecationNote: "FIM over AMA deprecated August 2024; replaced by FIM over MDE (see https://learn.microsoft.com/en-us/azure/defender-for-cloud/file-integrity-monitoring-enable-ama)"
---

> ⚠️ **DEPRECATED (August 2024)** — FIM over AMA has been deprecated and replaced with **FIM over MDE**.
> Please advise customers to use [FIM over MDE](https://learn.microsoft.com/en-us/azure/defender-for-cloud/file-integrity-monitoring-overview).
> Support for FIM over MMA continued until November 2024. This guide is preserved for historical reference only.

# Change DCR's Reporting Workspace (FIM over AMA — Archived)

## Important Notes
- DCR and the Log Analytics workspace must be in the **same region** for data to flow.
- MDC creates one FIM DCR per subscription.
- This procedure is "at-your-own-risk" for PREVIEW features and must not be used on Production systems.

## Data Required Before Starting
1. FIM DCR Resource ID (subscription + RG + resource name)
2. New Log Analytics Workspace Resource ID
3. New Log Analytics Workspace ID (hex GUID)

Retrieve via Azure Portal → Resource → Overview → JSON View (top-right).

---

## Method A: API Tool (REST)

1. **GET** current DCR config:
   ```
   GET https://management.azure.com<DCR-RESOURCE-ID>?api-version=2021-04-01
   Authorization: Bearer {token}
   ```
2. Save the JSON response. Locate `destinations` section containing:
   - `workspaceResourceId`
   - `workspaceId`
   - `name` (**do not change**)
3. Modify `workspaceResourceId` and `workspaceId` to new workspace values.
4. **PUT** updated config:
   ```
   PUT https://management.azure.com<DCR-RESOURCE-ID>?api-version=2021-04-01
   Authorization: Bearer {token}
   Content-Type: application/json
   Body: {modified DCR JSON}
   ```

---

## Method B: Azure Cloud Shell (Bash)

```bash
# Step 1: Obtain Bearer token
response=$(curl http://localhost:50342/oauth2/token --data "resource=https://management.azure.com/" -H Metadata:true -s)
access_token=$(echo $response | python -c 'import sys, json; print (json.load(sys.stdin)["access_token"])')

# Step 2: GET current DCR
curl "https://management.azure.com/<DCR resource ID>?api-version=2021-04-01" \
  -X GET -H "Authorization: Bearer $access_token" -H "x-ms-version: 2019-02-02" >> dcr.json

# Step 3: Edit dcr.json — update workspaceResourceId and workspaceId
nano dcr.json

# Step 4: PUT updated DCR
curl "https://management.azure.com/<DCR resource ID>?api-version=2021-04-01" \
  -X PUT -H "Authorization: Bearer $access_token" \
  -H "x-ms-version: 2019-02-02" -H "Content-Type: application/json" \
  -d @dcr.json | grep -q Microsoft-ConfigurationChange && echo "Success"
```
