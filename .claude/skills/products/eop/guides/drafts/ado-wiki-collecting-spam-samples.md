---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Collecting Spam Samples"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=/Troubleshooting%20Guides/Collecting%20Spam%20Samples"
importDate: "2026-04-05"
type: operational-guide
---

# Collecting Spam Samples for Investigation or Escalation

## Purpose

When collecting spam samples for escalation to the product group, ensure the message headers are complete. The X-Forefront-Antispam-Report and Authentication-Results headers are of particular importance.

## Steps

1. Using the **Outlook Desktop Client**, have the customer double click on the message(s) they want to report
2. Click **File** → **Save As**, choosing **.msg** for the file type
3. Save the file to a folder on the desktop (e.g. "Samples")
4. Have the customer **zip** the folder and send it as an attachment

## Important Notes

- Samples should be **no older than 7 days** for escalation
- **24 hours** is strongly preferred for freshness
- Ensure X-Forefront-Antispam-Report and Authentication-Results headers are present
