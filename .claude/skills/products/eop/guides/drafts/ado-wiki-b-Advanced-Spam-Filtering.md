---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Advanced Spam Filtering"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=/Troubleshooting%20Guides/Advanced%20Spam%20Filtering"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Advanced Spam Filter

Advanced Spam Filter features should not be recommended for use. They very often lead to false positives, and EOP should be able to filter most of these natively, without the need to set up custom filtering options. In particular, SPF Hard fail feature is discouraged in favor of the new Spoof Intelligence feature.

## SPF Hard Fail ASF

If using SPF Hard fail is not encouraged, what is the best way to prevent against spoofing? [Anti-spoofing protections in Office 365](https://docs.microsoft.com/office365/securitycompliance/anti-spoofing-protection) discusses our Anti-Spoofing technologies. Here are some specific suggestions:

- Make sure the **SPF records** are valid, correct, and that FAIL is set (`-all`). Do not use `~all`, `+all`, or `?all`. You can use [MxToolbox](https://mxtoolbox.com/spf.aspx) to assist.
- Make sure that **DKIM** is configured for vanity domains.
- Creating a **DMARC policy** is also highly recommended, even if the policy is report only.

- For more information, please refer to [Email Authentication](https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki/14137/Email-Authentication-SPF-DKIM-and-DMARC)
- For false positives or false negatives, follow the [Wiki](https://aka.ms/fpfn)

## What criteria do the Spam Filter International Spam settings look for?

The language filter looks for the value of the Accept-Language or Content-Language header of the message. If these are not available it falls back to the tenant default.
The country or region filter uses IP geolocation to determine the location.

## X-CustomSpam

The X-CustomSpam header is added to messages when an Advanced Spam Filtering (ASF) rule is triggered and will indicate which rule was triggered. For example, **X-CustomSpam: Image links to remote sites** denotes that the **Image links to remote sites** ASF option was matched. To find out which X-header text is added for each specific ASF option, see [Advanced Spam Filtering Options](https://docs.microsoft.com/microsoft-365/security/office-365-security/advanced-spam-filtering-asf-options?view=o365-worldwide).

## Content Information

Please visit <https://aka.ms/mdopu>, <https://aka.ms/mdoki>, <https://aka.ms/mdoqa>, <https://aka.ms/mdonews> for product updates, known issues, training updates, and MDO-related announcements.
