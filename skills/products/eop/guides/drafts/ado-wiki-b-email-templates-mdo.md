---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Process Documentation/EMEA Processes/Email Templates"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FProcess%20Documentation%2FEMEA%20Processes%2FEmail%20Templates"
importDate: "2026-04-06"
type: troubleshooting-guide
---

#Email templates

[[_TOC_]]


## Common scenarios in MDO

###False Positives

**Customer facing message**

**Issue**:
False positives from [detail here - ensure to scope to specific circumstances / examples]

**Impact**:
[Define impact to customer]

**Scope**:
We will consider this case resolved once mails from as per defined scope are delivered to inboxes as required. If the Microsoft products involved are found to be working as intended, or the cause of the issue is determined to be the result of a third-party application or sender configuration we will assist where possible in finding a resolution. However, if no solution can be found this support request will be considered resolved.

**Resolution**:
Spam False Positives and False Negatives should now be a self-service functionality for O365 Users and Administrators using the guidance in Report spam, non-spam, phishing, suspicious emails and files to Microsoft. This can also be used to temporarily allow messages for up to 30 days. These allows will be reviewed in the background and extended for up to 90 days if the verdict remains unchanged (at which time a support case can be raised for support to investigate and engage our anti-spam engineering team if required).

Please submit the sample message and advise if there are any issues.

If submissions have been made, please advise of examples along with Network Message IDs if possible.

---

Next steps - refer to:

TS Guides:
[Troubleshooting False Positives and False Negatives - Overview](https://dev.azure.com/Supportability/Modern%20Workplace/_wiki/wikis/Modern%20Workplace/557495/Troubleshooting-False-Positives-and-False-Negatives)

Useful links:
- [Manage submissions | Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/submissions-admin?view=o365-worldwide)
- [Allow or block email using the Tenant Allow/Block List | Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/tenant-allow-block-list-email-spoof-configure?view=o365-worldwide)
- [Troubleshooting Email Authentication Failures - Overview](https://dev.azure.com/Supportability/Modern%20Workplace/_wiki/wikis/Modern%20Workplace/589781/Troubleshooting-Email-Authentication-Failures)
- [Microsoft Defender for Office 365 email entity page | Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/mdo-email-entity-page?view=o365-worldwide)

---

###False Negatives

**Customer facing message**

**Scope**:
False-negative email determination (unwanted message arrived in inbox) - include specifics of issue

**Business Impact**:
[Define impact to business]

**Action Plan**:
The combined signals of this email did not result in a high enough score from the filtering service to be marked as suspect by EOP filtering.

Spam filtering takes a number of factors into account in determining the message verdict:
- From address
- Sending IP address
- Keywords
- Phrases
- Frequency of transmission
- Other trends and patterns

Any incorrect decision by the EOP filtering services should be submitted where possible to assist in future detections. This can be carried out in any of the methods listed in [Report spam, non-spam, and phishing messages to Microsoft](https://docs.microsoft.com/en-us/microsoft-365/security/office-365-security/report-junk-email-messages-to-microsoft?view=o365-worldwide).

We would encourage admins to use the new admin submission portal for additional information about verdicts.
[Admin submissions - Office 365 | Microsoft Docs](https://docs.microsoft.com/en-us/microsoft-365/security/office-365-security/admin-submission?view=o365-worldwide)

The rescan verdict can be checked to see whether the verdict has been changed as desired. If repeated submissions do not produce the desired result in a 24 to 48 hour period then we can assist with a support case and most recent submission IDs (these should be from within the last 24 to 48 hours).

More Information:
[Microsoft recommendations for EOP and Defender for Office 365 security settings](https://docs.microsoft.com/en-us/microsoft-365/security/office-365-security/recommended-settings-for-eop-and-office365-atp?view=o365-worldwide)

---

##Closing template

Hello [CUSTNAME],

This support request will now be archived. If you have further problems within the scope of this issue, please do reopen the support request.

Your feedback is important to us. A feedback request option will appear within the case in M365 Admin Center with an opportunity to tell us about your experience.

https://admin.microsoft.com/adminportal/home#/support/feedback/<TicketIDfromDfm>

If you have any future issues or questions regarding any of Office 365's apps or services, please do not hesitate to open another ticket and one of our ambassadors will be happy to help you.

Below is a summary of the support request for your records:

Symptom:

Cause:

Resolution:

More Information:
