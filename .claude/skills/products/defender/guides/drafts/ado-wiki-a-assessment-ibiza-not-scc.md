---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Next-Gen - Defender for Cloud/Cloud recommendations/[TSG] - Cloud recommendations/How to investigate why assessment is in Ibiza but not in SCC:"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Prerequisites: JIT requests ([JIT - Overview](https://msazure.visualstudio.com/DefaultCollection/One/_wiki/wikis/Rome%20Defenders%20Wiki/84386/JIT))
- Request JIT for "Rome ILDC - Defenders - DataStore - Production" subscription: 33f60ffd-414f-4cf9-b699-bc6fd338442d
- Request JIT for ElevatedEntityStoreSg
- Request JIT for ElevatedDefSg

# Investigate from Data store side:
- Search for the relevant cluster by query any Data Store clusters. (cluster for example: [https://cus-ds-prd-ade-s20.centralus.kusto.windows.net](https://cus-ds-prd-ade-s20.centralus.kusto.windows.net "https://cus-ds-prd-ade-s20.centralus.kusto.windows.net/")): 
```
Get_Current_Raw_TenantStampLocationMapping_1_0_0
| where TenantId == {TENANT_ID}
| project TenantId, StampUri
```
- Search if the assessment is in recommendations views (the views on which the SCC cloud recommendations experiences are based)

```
Get_Current_View_RecommendationGridResource_0_0_17
| where Id has {ASSESSMENT_ID}
```

```
Get_Current_View_RecommendationsWithAssets_0_0_1
| where AssessmentId has {ASSESSMENT_ID}
```

- If the assessment is not in the views, search in the raw assessments table (the table which ingested by the Modeller):

```
Get_Current_Raw_Assessments_1_0_0
| where AssessmentId has {ASSESSMENT_ID}
```
- If the assessment exists in `Get_Current_Raw_Assessments_1_0_0`, but not in `Get_Current_View_RecommendationsWithAssets_0_0_1` probably the join with Assets view filtered them out.

In SCC we only show assessments which have asset in MapV2. if the asset is ingested to MapV2 but does not exist in Assets view, please reach out to @<Amit Adani> .

- Please check if `tostring(ResourceDetails.id)` from `Get_Current_Raw_Assessments_1_0_0` equals to `tostring(['AssetIdsDictionary']['MdcAzureUniqueResourceId'])` from `Get_Current_View_Assets_0_0_4`. if yes, please reach out to  @<Tehila Miness> 

- If the assessment does not exist in `Get_Current_Raw_Assessments_1_0_0`, please reach out to @<Yousef Bader> to investigate from the Modeller side.





