---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ESR/Workflow: ESR: Troubleshooting/Workflow: ESR: Process to delete data for a USER"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FESR%2FWorkflow%3A%20ESR%3A%20Troubleshooting%2FWorkflow%3A%20ESR%3A%20Process%20to%20delete%20data%20for%20a%20USER"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## ESR: Process to delete data for a user

This guide provides step-by-step instructions for manually deleting Enterprise State Roaming (ESR) user data from the backend Azure File Sync (AFS) Cloud.

### Guidelines to manually delete ESR user data from backend AFS Cloud

- User-specific ESR data is automatically deleted when it becomes stale after a prolonged period. This is explained in the [Data retention policy](https://learn.microsoft.com/en-us/azure/active-directory/devices/enterprise-state-roaming-enable#data-retention).
- Data is stored per user in AFS Cloud. The deletion request will be on a per-user basis.
- An IcM (Incident Management) ticket must be submitted to perform a manual deletion.
- If the user has been using ESR from Windows 21H1 and above from the start, then only the data from the AFS Cloud needs to be deleted.
- If the user was using ESR on Windows 10 1809 and below, and then also on later operating systems, there is a chance that the user data is stored in two locations. One in Kailani service because 1809 and below had settings stored in this database, and the other in AFS, which will be used by later operating systems.
- Steps to delete from Kailani are already documented in another [article](https://internal.evergreen.microsoft.com/en-us/topic/windows-10-esr-how-to-request-deletion-of-enterprise-state-roaming-user-specific-settings-from-a-tenant-4b068b9f-00eb-f8a2-d343-d764b57a171a).

### When a customer requests to delete ESR data for a particular user

**Customer statement example:**
"_I wish for the ESR data to be deleted for the user: user@example.com_"

Following the internal article, we have to open an IcM ticket requesting the deletion of user-specific storage.

### Steps to delete from AFS (updated version)

1. Visit [https://aka.ms/pdresrdelete](https://aka.ms/pdresrdelete)
2. Log in with your Microsoft credentials.
3. The title is auto-populated.
4. The description requires manual input - follow the instructions in the description.
   - Obtain the UserGUID and TenantGUID from the customer beforehand.
   - Include the reason for deletion.
5. Submit the ticket.

### Important Note

If, in any situation the IcM is not assigned to an IcM Engineer, access the IcM OnCall page and search for the Engineers that can be assigned to the IcM Profile Data Roaming Services (PDRS).

Select **On Call List -> Who's on Call -> Search for Profile Data Roaming Service (PDRS) Triage -> Run**
