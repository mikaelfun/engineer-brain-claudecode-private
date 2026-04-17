---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Management and How-To/How request a refund or waiver"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FManagement%20and%20How-To%2FHow%20request%20a%20refund%20or%20waiver"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Request a Refund or Waiver for Data Box

## Scenario
Customer asking for refund / billing adjustment for a Data Box product (Daily usage fee).

## Important
- Do NOT promise a refund/credit/waiver to the customer.
- A refund request can be approved only after checking individual case thoroughly by the PM leads.
- PM team will only consider charges related to the Data Box service and associated shipping charges.
- Billing charges associated with Azure Storage consumption/networking/IO's are separate and must be handled by Azure Storage team.

## Billing Timeline
- Charges do not occur until the device is returned and data copy operations complete and/or the device has returned to the Data Center.
- If customer still has the Data Box → no "refund", this is a billing adjustment.
- After a job has completed → billing adjustments cannot be performed, needs billing refund/credit.
- Billing adjustments before job completes may not need Azure Billing collaboration, but refund requests will require it.

## Common Situations
1. **Technical issue on-premises**: Copy could not progress, customer is beyond loaned grace period with daily charges. Start and end dates depend on the original support case.
2. **Misconfigured/unusable device**: Wrong order/config, device damaged in shipping, device prep error at DC, device failure while on-prem. Commonly paired with expedited replacement request (via new order).

## Process
Capture these details:
- **Support Request #**
- **Subscription ID**
- **Job Name**
- **Device Type**: DataBox POD / DataBox Disk / DataBox Heavy
- **Customer Company Name**
- **Issue Start & End Date**
- **Claimed Refund Amount**: Calculate using pricing sheet
- **IcM#**: Raise for faulty device (not mandatory for daily usage fee waivers)
- **Customer's Ask**: Summarize scenario explicitly

## Actions
1. Email **dbxorefundapprovals@microsoft.com** with the information.
2. CC **asdta@microsoft.com** (TA alias) and **support@mail.internal.evergreen.microsoft.com** (attach to support case).
3. Involve TAs and validate scenario before writing to the alias.
4. Once approved, create a collaboration task with Azure Billing support if needed.
