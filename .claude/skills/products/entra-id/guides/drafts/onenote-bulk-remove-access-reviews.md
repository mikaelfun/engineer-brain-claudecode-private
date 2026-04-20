---
title: "Bulk Remove Access Reviews via MgGraph"
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Azure AD _ Ms Entra ID/Account management/Access Review/Bulk remove access reviews.md"
product: entra-id
tags: [access-review, MgGraph, PowerShell, bulk-delete, mooncake]
21vApplicable: true
createdAt: "2026-04-18"
---

# Bulk Remove Access Reviews via MgGraph

## Script

```powershell
Connect-MgGraph -Environment China -ClientId $CN_App_Id -Tenant $CN_Tenant_Id -CertificateThumbprint $CN_TP

$accessReviews = Get-MgbetaIdentityGovernanceAccessReviewDefinition
$accessReview = $accessReviews | Where-Object { $_.DisplayName -cmatch "AR" }

foreach ($x in $accessReview.id) {
    Remove-MgBetaIdentityGovernanceAccessReviewDefinition -AccessReviewScheduleDefinitionId $x
}
```

## Notes
- Uses `-Environment China` for Mooncake environment
- Filter by DisplayName pattern (case-sensitive `-cmatch`)
- Requires Microsoft.Graph.Beta module with appropriate permissions
