---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Customer LockBox/How to enroll a Tenant in Customer Lockbox and test"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FCustomer%20LockBox%2FHow%20to%20enroll%20a%20Tenant%20in%20Customer%20Lockbox%20and%20test"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to Enroll a Tenant in Customer Lockbox and Test

## Required Information

- [ ] Tenant ID
- [ ] Written Approval by valid Tenant Global Admin
- [ ] ICM with Lockbox Product Group (may not be reviewed until Friday)

## Important Information to Share with Requestor

- Enrollment takes around **5 days** from the day PG has confirmed the ICM mitigation
- Enrollment will affect **all subscriptions** under the tenant (individual subscription enrollment is no longer supported)
- Customer needs an **Azure Support Plan - Developer** minimum to be enrolled

### Additional Licensing

- [Office 365 Customer Lockbox](https://docs.microsoft.com/en-us/office365/servicedescriptions/microsoft-365-service-descriptions/microsoft-365-tenantlevel-services-licensing-guidance/microsoft-365-security-compliance-licensing-guidance#office-365-customer-lockbox) (separate from Azure Customer Lockbox)

## Processing the Enrollment Request

1. Collect Tenant ID and written approval from a valid Global Admin
2. In ASC, click the warning icon on the right and select the **"Customer Lockbox"** template
3. The template will autocomplete most information
4. Confirm the Tenant ID and specify that written approval is appended to case notes
5. Submit the ICM

## Confirming Enrollment and Testing

### Verify Enrollment

In ASC → Resource Explorer → Access Control, you should see the Customer Lockbox enrollment confirmation.

### Test Lockbox Access

1. Request access to customer information via ASC
2. The Tenant Admin must approve the request in the Azure Portal
3. Requests expire after **12 hours** if not approved
4. After approval, customer data should be visible in ASC

If data is visible after approval, the enrollment and test are complete.
