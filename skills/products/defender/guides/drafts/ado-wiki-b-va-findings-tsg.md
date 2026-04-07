---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Servers/Vulnerability Assessment/[TSG] - VA findings"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/pages/Defender%20for%20Cloud/Workload%20Protections/Defender%20for%20Servers/Vulnerability%20Assessment/%5BTSG%5D%20-%20VA%20findings"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# [TSG] - VA findings

TSG for findings that are not getting updated or other similar issues.

## VA Findings are not getting updated

1. **Identify the specific VM** and get its Azure Resource ID. Formats:
   - Compute VMs: `/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Compute/virtualMachines/{vmName}`
   - Hybrid (ARC) machines: `/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.HybridCompute/machines/{machineName}`

2. **Go to Jarvis dashboard** [VA Gray Label - New](https://portal.microsoftgeneva.com/dashboard/RomeR3Prod/CSS%20dashboards/VA%20Gray%20Label%20-%20New) and enter the Azure machine identifier with preferred lookback time (at least 2 days back).

3. **Check "Gray label resource Data"** widget under "General". Save `QualysCustomerId` and `QualysResourceId` values.
   - **If no results**: Verify VM was onboarded to VA via ASC (not custom method like custom policy/direct extension installation/VM creation from custom image). Custom methods are unsupported.

4. **Check "Findings arriving directly from Qualys"** widget:

   **a. If no results** (no reports from Qualys in selected timeframe):
   - Verify customer's network allows communication to Qualys endpoints per documentation
     - **No connectivity** → Customer should open network for Qualys endpoints
     - **Has connectivity** → Open ticket to Qualys with machine ID, QualysCustomerId, QualysResourceId

   **b. If updated results exist**:
   - Verify reports from last 24 hours and check `lastScannedTime` is updated
   - If lastScannedTime not updated → Check network connectivity to Qualys endpoints (same flow as 4a)

5. **Check "Sub assessments (on findings) sent from ASC"** widget:

   **a.** Identify which Qualys report was last passed as sub-assessments by comparing `lastScannedTime`

   **b.** If latest Qualys reports haven't been sent from ASC VA service for over 36 hours:
   - Check widget "State of the Recommendation: A vulnerability assessment solution should be enabled on your virtual machines" under "ASC Recommendations"
   - VM needs to be assessed as "healthy" to see findings
   - **If VM is healthy** → Notify server VA team with Azure VM ID

   **c.** Compare `totalReceivedFindings` with `numFindings` in Qualys widget:
   - **If they don't match** → Notify server VA team with Azure VM ID

   **d.** Check `vulnerabilitiesQids` field (Qids sent as sub-assessments):

   For cases where customer complains about a Qid not being remediated:
   1. **If remediation was done after latest scan time** → Wait for more updated scan results
   2. **If enough time passed and Qid still reported by Qualys** → Open Qualys ticket with machine ID, QualysCustomerId, QualysResourceId
   3. **If Qid not in vulnerabilitiesQids**:
      - Get ARG results:
        ```kusto
        securityresources
        | where type == "microsoft.security/assessments/subassessments"
        | where properties.additionalData.assessedResourceType == "ServerVulnerability"
        | extend timeGenerated = properties.timeGenerated
        | extend qid = properties.id
        | extend findingName = properties.displayName
        | extend resourceId = properties.resourceDetails.id
        ```
      - **Qid not in ARG results** → Verify with customer in Portal; if persists, contact server VA team with VM ID, ARG results, Portal screenshot
      - **Qid still in ARG results** → Contact server VA team with VM ID and ARG results

### Findings Flow (High-Level)
Each data transition in the pipeline is triggered independently. Data passed by each component is the latest data available at that point in time.

## VA RHEL 8.1 - No updates nor upgrades appearing

**Scenario:** Customer has RHEL 8.1 VA findings, remediation says install latest updates. No updates/upgrades appear when running update commands.

**Cause:** RHEL 8.1 and 8.2 are beyond extended update support. No updates/upgrades available.

**Solution:** Upgrade to at least RHEL 8.6. RHEL 8.4 is an option but EUS ended first half 2023.

**Source:** https://access.redhat.com/support/policy/updates/errata/
