---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Security Alerts/[Product Knowledge] - Email Alert Notifications"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Security%20Alerts/%5BProduct%20Knowledge%5D%20-%20Email%20Alert%20Notifications"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Configuring Microsoft Defender for Cloud: Email Notifications

## Summary

This article provides guidance on configuring email notifications for security alerts in Microsoft Defender for Cloud. It explains how subscription owners can receive alerts based on severity levels and how to set up multiple recipients for notifications.

## Detailed Explanation

Microsoft Defender for Cloud ensures that security alerts reach the appropriate individuals in your organization. By default, subscription owners receive email notifications whenever a high-severity alert is triggered. However, you can customize these settings to cater to your specific security needs.

### Configure the Severity of the Alerts

In the Microsoft Defender for Cloud, navigate to **Environment Settings** and then select the subscription or management group where you like to setup the notifications. Then select **Email notifications**.

Here, you can configure the system to send email notifications for alerts categorized as high, medium, or low severity. This configuration allows you to receive notifications according to the severity level you deem necessary for your security protocol.

### Configure Multiple Recipients

The **Email address** field accommodates multiple addresses. If you wish to send notifications to more than one recipient, enter the email addresses separated by commas (",").

## Limits

To avoid alert fatigue, Security Center limits the volume of outgoing mails. For each subscription, Security Center sends:

- A maximum of **4 emails per day** for high-severity alerts
- A maximum of **2 emails per day** for medium-severity alerts
- A maximum of **1 email per day** for low-severity alerts

## Related Policy Definitions

- [Email notification to subscription owner for high severity alerts should be enabled](https://ms.portal.azure.com/#view/Microsoft_Azure_Policy/PolicyDetailBlade/definitionId/%2Fproviders%2FMicrosoft.Authorization%2FpolicyDefinitions%2F0b15565f-aa9e-48ba-8619-45960f2c314d)
- [Subscriptions should have a contact email address for security issues](https://ms.portal.azure.com/#view/Microsoft_Azure_Policy/PolicyDetailBlade/definitionId/%2Fproviders%2FMicrosoft.Authorization%2FpolicyDefinitions%2F4f4f78b8-e367-4b10-a341-d9a4ad5cf1c7)
- [Email notification for high severity alerts should be enabled](https://ms.portal.azure.com/#view/Microsoft_Azure_Policy/PolicyDetailBlade/definitionId/%2Fproviders%2FMicrosoft.Authorization%2FpolicyDefinitions%2F6e2593d9-add6-4083-9c9b-4b7d2188c899)

## Common Troubleshooting

- **Not receiving expected emails**: Check if daily rate limits (4/2/1 per day) have been exhausted for the subscription
- **Wrong recipients**: Verify email addresses are comma-separated in the Email notifications settings
- **Missing high-severity alerts**: Confirm subscription owner email is set and notification severity includes High
