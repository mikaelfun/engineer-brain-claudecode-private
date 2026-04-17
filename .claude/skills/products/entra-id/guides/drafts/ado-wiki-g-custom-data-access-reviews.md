---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Identity Governance/Include custom data provided resource for catalog user Access Reviews"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FIdentity%20Governance%2FInclude%20custom%20data%20provided%20resource%20for%20catalog%20user%20Access%20Reviews"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Custom Data Provided Resource for Catalog User Access Reviews

## Summary

Organizations can include disconnected applications (not integrated with Microsoft Entra) in access reviews by uploading access data directly into a catalog as custom data provided resources. This enables User Access Reviews (UARs) across both Entra-connected and custom resources within the same catalog.

## License Requirements

- Microsoft Entra ID Governance or Microsoft Entra Suite

## Workflow

### 1. Create a Catalog
1. Sign in as Identity Governance Administrator
2. Browse to **ID Governance** > **Entitlement management** > **Catalogs**
3. Select **New catalog**, enter name and description, select **Create**

### 2. Add Custom Data Provided Resource
1. Open the catalog > **Resources** > **Add resources**
2. Select resource type: **custom data provided resource**
3. Enter Resource name and Description, select **Save**

### 3. Create a User Access Review
1. Browse to **ID Governance** > **Access Reviews** > **new access review**
2. Select **Review users access across multiple resource types within a catalog** > **catalog review template**
3. Enter basic information > **Next**
4. Select the catalog with custom resources > **Next**
5. Select reviewers (currently only single-stage reviews with managers as reviewers)
6. Select **Create**

### 4. Get Access Review Object and Instance ID
1. Browse to **ID Governance** > **Access Reviews** > select your review
2. Copy the **Object ID** from the overview
3. Select the current instance > copy the instance **Object ID**

### 5. Upload Custom Data
- Status shows **Initializing** at this point
- Navigate to catalog > **Resources** > select custom resource > **Upload custom access data**
- Enter both IDs > upload up to 10 CSVs > **Save**
- **CRITICAL: You have up to 2 hours from Initializing state to complete the upload**

### 6. Active Review State
- Reviewers receive email notification
- Review and decide via My Access portal

### 7. Applying Stage (Manual API Calls Required)
Get denied decisions:
```http
GET /identityGovernance/accessReviews/definitions/{reviewId}/instances/{instanceId}/decisions?$filter=(decision eq 'Deny' and resourceId eq '<resourceId>')
```

Apply each decision:
```http
PATCH /identityGovernance/accessReviews/definitions/{reviewId}/instances/{instanceId}/decisions/{decisionId}
{ "applyResult": "Success/Failure/PartialSuccess/NotSupported", "applyDescription": "description" }
```

Review transitions to **Applied** only after ALL custom data decisions are PATCH-ed.

## Key Timeframes

| Action | When | Time Limit |
|--------|------|------------|
| Upload custom data | During Initializing | Within 2 hours |
| Review decisions | During Active | Until review end date |
| Apply decisions | During Applying | 30 days; remains in Applying until all decisions applied |

## Common Issues

- **Stuck in Initializing**: CSV not uploaded within 2 hours. Must create a new review.
- **Stuck in Applying**: Not all decisions PATCH-ed. Must PATCH every decision to transition to Applied.

## ICM Path

- **Owning Service**: AAD Access Reviews
- **Owning Team**: Access Reviews
