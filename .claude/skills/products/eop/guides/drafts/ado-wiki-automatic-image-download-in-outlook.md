---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Drafts/Automatic Image Download in Outlook"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=/Drafts/Automatic%20Image%20Download%20in%20Outlook"
importDate: "2026-04-05"
type: troubleshooting-guide
---

Customers will often use 3rd party bulk senders to send organization wide communications. These communications often contain embedded images and they want those images to be automatically downloaded and displayed in the various email clients similar to how an internal message gets processed. The different clients have different requirements in order for this to occur. Customers will most often make note of the banner: "Click here to download pictures. To help protect your privacy, Outlook prevented automatic download of some pictures in this message."

The first thing is to determine whether the P2 sender is an accepted domain in the organization or not.

**If the P2 sending domain is NOT an accepted domain in the organization:**
- The only way for images to automatically download is to have the sender addresses added into the [mailbox safe sender list](https://learn.microsoft.com/en-us/defender-office-365/create-safe-sender-lists-in-office-365#use-outlook-safe-senders).

**If the P2 sending domain IS an accepted domain in the organization:**

What is needed depends on the client being used:

- **OWA/New Outlook** - If the P2 sending domain passes authentication (DMARC), remote images are automatically downloaded.

- **Classic Outlook** - The most strict client. The message must be authenticated as Internal (`X-MS-Exchange-Organization-AuthAs: Internal`) AND the P2 sending address must also be able to resolve to an object within the organization.

**Safe Sender List considerations:**
- Adding the sender to the safe sender list will also work if the P2 sending domain is an accepted domain, but it has limits.
- If the sender address exists within the organization (`Get-Recipient <SMTPaddress>` provides output), they will NOT be able to add it via PowerShell or OWA — only via Outlook classic client or a GPO.
- Avoid adding addresses from the customer's accepted domain to the safe sender list because this could potentially allow spoofed messages to reach the Inbox.

**Alternative: Trusted Sites Zone**
- If pictures are loaded from a specific internet URL, that URL can be added to Trusted Sites Internet Zone in browser settings.
- For managed machines with group policy: `User Configuration > Policies > Administrative Templates > Windows Components > Internet Explorer > Internet Control Panel > Security Page`
- Open "Site to Zone Assignment List" and add the site with value `2` for Trusted Sites Zone.
