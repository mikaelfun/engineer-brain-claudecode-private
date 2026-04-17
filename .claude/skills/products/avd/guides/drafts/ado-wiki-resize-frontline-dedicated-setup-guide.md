---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Cloud PC Actions/Resize/Resize Frontline Dedicated Mode/Setup Guide"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FCloud%20PC%20Actions%2FResize%2FResize%20Frontline%20Dedicated%20Mode%2FSetup%20Guide"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Resize Windows 365 Frontline Cloud PCs in Dedicated Mode - Setup Guide

## Steps

1. Sign in to the [Microsoft Intune admin center](https://go.microsoft.com/fwlink/?linkid=2109431)
   - Select **Devices** > **Windows 365** > **Provisioning policies**
2. Select a provisioning policy that includes an assignment with the Windows 365 Frontline Cloud PCs in dedicated mode that you want to resize
3. On the policy page, select **Edit** next to **Assignments**
4. On the **Assignments** tab, in the **Cloud PC size** column, select the Cloud PC Frontline entry that you want to resize. All Cloud PCs in the assignment will be resized.
5. In the **Select Cloud PC size** pane, under **Available sizes**, select the new Cloud PC size > **Next**. The process might take ~20 minutes.
6. On the **Assignments** page, select **Next**
7. On the **Review + save** tab, select **Update** to initiate the resize

**Note:** The action Resize for Frontline Dedicated mode is not eligible for a partial resize. It must reassign the entire group based license.
