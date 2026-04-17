---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Security Alerts/[Troubleshooting Guide] - Testing Alerts/[Troubleshooting Guide] - Storage Advanced Threat Protection (ATP) Alerts"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Security%20Alerts/%5BTroubleshooting%20Guide%5D%20-%20Testing%20Alerts/%5BTroubleshooting%20Guide%5D%20-%20Storage%20Advanced%20Threat%20Protection%20(ATP)%20Alerts"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Triggering Test Alerts for Azure Defender for Storage

## Summary

This guide provides methods to trigger test alerts for Azure Defender for Storage using EICAR file upload and Tor browser access. These methods help validate that storage ATP detections are functioning correctly.

> **Important**: Azure Defender for Storage is a security feature, not an anti-malware tool. EICAR files may be ignored under certain conditions.

## Method 1: Uploading EICAR for Validation

Upload an EICAR test file to a storage blob container to trigger a malware detection alert. For detailed steps, refer to the [Azure Security Center blog post](https://techcommunity.microsoft.com/t5/azure-security-center/validating-atp-for-azure-storage-detections-in-azure-security/ba-p/1068131).

## Method 2: Connection via Tor Browser

Logging into a storage account through the Tor browser triggers an "Access from a Tor exit node to a storage blob container" alert.

### Steps:

1. Navigate to a storage account with Azure Defender for Storage enabled
2. Click the "Containers" tab in the sidebar
3. Access an existing container or create a new one
4. Upload any non-sensitive file to that container
5. Right-click the uploaded file and select "Generate SAS" (Shared Access Signature)
6. Click "Generate SAS token and URL" without altering any options
7. Copy the generated SAS URL
8. Download and open the [Tor browser](https://www.torproject.org/download/)
9. In the Tor browser, visit the copied SAS URL
10. You should now see or download the file uploaded in step 4

The alert "Access from a Tor exit node to a storage blob container" should appear in Defender for Cloud.

## References

- [Validating ATP for Azure Storage Detections](https://techcommunity.microsoft.com/t5/azure-security-center/validating-atp-for-azure-storage-detections-in-azure-security/ba-p/1068131)
