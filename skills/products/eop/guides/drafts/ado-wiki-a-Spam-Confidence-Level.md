---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Spam Confidence Level"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FSpam%20Confidence%20Level"
importDate: "2026-04-06"
type: troubleshooting-guide
---


[[_TOC_]]


## Spam Confidence Level (SCL)

When an email message goes through spam filtering it is assigned a Spam Confidence Level (SCL) rating and stamped in [<B>"X-Forefront-Antispam-Report"</b>](./X-Forefront-Antispam-Report). The service takes actions upon the messages based on the SCL assigned. The following table shows how the different SCL ratings are used by the service and the default action that is taken on inbound messages for each rating.

| SCL Rating    | Spam Confidence Interpretation                                                                                                            | Default Action                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| \-1           | Non-spam coming from a safe sender, safe recipient, safe listed IP address (trusted partner), or Transport rule manually setting the SCL. | Deliver the message to the recipients’ inbox. In Office 365 these messages skip spam filtering.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 0, 1, 2, 3, 4 | Non-spam because the message was scanned and determined to be clean                                                                       | Deliver the message to the recipients’ inbox. In Office 365 only SCL 1 is assigned by the spam filters.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 5, 6          | Spam                                                                                                                                      | Take the action configured for Spam under <b>"Microsoft 365 Defender - Email & Collaboration - Policies & Rules - Threat Policies - Anti-spam Policies"</b>. While both SCL 5 & 6 can assigned by Office 365, SCL 6 is typically only seen when the sender is on the recipients Blocked Senders list.                                                                                                                                                                                                                                                                                                                    |
| 7, 8, 9       | High Confidence Spam                                                                                                                      | Take the action configured for High Confidence Spam under <b>"Microsoft 365 Defender - Email & Collaboration - Policies & Rules - Threat Policies - Anti-spam Policies"</b>. If an ["Advanced Spam Filter"](https://learn.microsoft.com/microsoft-365/security/office-365-security/advanced-spam-filtering-asf-options?view=o365-worldwide) rule marks the message as SCL 9, it can be identified by [X-Custom Spam](https://learn.microsoft.com/microsoft-365/security/office-365-security/advanced-spam-filtering-asf-options?view=o365-worldwide#:~:text=Description-,X%2Dheader%20added,-Image%20links%20to) header. |

**Notes:** SCL ratings of 2, 3, 4, 7, and 8 are not set by Office 365.

## For more information

Learn : [Spam Confidence Level (SCL) in EOP](https://learn.microsoft.com/microsoft-365/security/office-365-security/spam-confidence-levels?source=recommendations&view=o365-worldwide)<br>
Blog : [Email Protection Basics](https://techcommunity.microsoft.com/t5/microsoft-defender-for-office/email-protection-basics-in-microsoft-365-spam-amp-phish/ba-p/3555712#:~:text=feature%20in%20Quarantine-,Spam%20confidence%20levels,-When%20we%20find)

</div>

</div>

## Content Information

Please visit <https://aka.ms/mdopu> , <https://aka.ms/mdoki> , <https://aka.ms/mdoqa> , <https://aka.ms/mdonews> for product updates, known issues, training updates, and MDO-related announcements
