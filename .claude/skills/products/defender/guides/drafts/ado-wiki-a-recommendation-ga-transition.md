---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Recommendations Platform/[Product Knowledge] - When a recommendation moved to GA"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FRecommendations%20Platform%2F%5BProduct%20Knowledge%5D%20-%20When%20a%20recommendation%20moved%20to%20GA"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Overview

---

Microsoft Defender for Cloud continuously introduces new security recommendations and evolves existing ones.

Each recommendation is associated with a **ReleaseState**, which indicates its lifecycle status, such as **Preview** or **Generally Available (GA)**.

  

Support engineers are frequently asked by customers:

- Whether a recommendation is still in Preview or already GA

- When a specific recommendation transitioned from Preview to GA

- Whether behavioral or enforcement changes are expected when a recommendation reaches GA

  

This article provides guidance for support engineers on **how to determine the current and historical ReleaseState of a Defender for Cloud recommendation**, and where to verify **official Preview  GA transitions** 
<br><br>

### Feature Description

---

Each Microsoft Defender for Cloud recommendation includes metadata that describes its lifecycle and support maturity.

One of the key properties is **ReleaseState**, which commonly appears as:

  

- **Preview**

 Indicates the recommendation is in public preview.

 Preview recommendations may:

 - Change behavior or scope

 - Receive schema or logic updates

 - Have limited SLA or support commitments

  

- **GA (Generally Available)**

 Indicates the recommendation is fully supported and productionready.

 GA recommendations are considered stable and are subject to standard support and reliability expectations.

  

The **official source of truth for recommendation lifecycle changes**, including:

- New recommendations entering Preview

- Recommendations transitioning from Preview to GA

- Updates, deprecations, or replacements

  
The [Whats new in Defender for Cloud recommendations, alerts, and incidents](https://learn.microsoft.com/en-us/azure/defender-for-cloud/release-notes-recommendations-alerts) release notes page on Microsoft Learn   

This page is:

- Updated frequently by the Product Group

- Ordered by announcement date

- Explicitly annotated with **State** values such as *Preview*, *GA*, *Update*, or *Upcoming deprecation*

  

Support engineers should always rely on this page when validating **customer claims or expectations regarding a recommendations maturity or GA status**
<br><br>

## Troubleshooting  Validating Preview  GA transitions using Kusto

---

Support engineers can independently validate when a Microsoft Defender for Cloud recommendation transitioned from **Preview** to **GA** by querying assessment telemetry using Kusto.

This method is intended for **engineering validation and internal troubleshooting only** and does not replace the official Microsoft Learn release notes, which remain the authoritative source for lifecycle announcements.

  

---

  

### Scenario: Validate when a recommendation transitioned from Preview to GA

  

#### Goal

Identify:

- The **earliest observed timestamp** when a recommendation appeared in **Preview**

- The **earliest observed timestamp** when the same recommendation appeared as **GA**

  

---

  

### Sample Kusto Query

Open in [[ADX Web](https://dataexplorer.azure.com/clusters/romelogs/databases/Rome3Prod?query=H4sIAAAAAAAAA42STWrDQAyF94HcQXgTG4wpdNmmYAj1LoQ4F1Bs1ZnGM2NGcoxLD99xft02hWr7pKdPD9UksKbCak2mRFHWLFETzCHIxTqsCLAobGuEgXe2rUtwxOJUIWBIOuv2QwMxQ8vKVHBQTlqsr6Jra%2BLgaTop6paFXDhbW00bqkmTuH6BgsneKzbplCltx4mfnEWJZ8EtMv3oXzlbejVl9is9svDSmrSqHFUoVOaC0nJusPGwMp18QrcjR7BR2lOjbuBlDljZ8PGhjG7yyG6huKmxP4UwvxPNMMWt1ujUB8F0Ar5elWNZOToo6nx0Whn1Fl53xt6lJn%2FLQHd0Dc69QRSPDLIUjvUfgywNotPotv8D%2F3aeYmOFdCN9OCaNAE35S8zSUTDfDnu%2BYA564%2Bw7%2BSe4vzuG81CuTDF809gohizdODSshkwvYpZ%2BAYDjcgSLAgAA)] [[Kusto.Explorer](https://romelogs.kusto.windows.net/Rome3Prod?query=H4sIAAAAAAAAA42STWrDQAyF94HcQXgTG4wpdNmmYAj1LoQ4F1Bs1ZnGM2NGcoxLD99xft02hWr7pKdPD9UksKbCak2mRFHWLFETzCHIxTqsCLAobGuEgXe2rUtwxOJUIWBIOuv2QwMxQ8vKVHBQTlqsr6Jra%2BLgaTop6paFXDhbW00bqkmTuH6BgsneKzbplCltx4mfnEWJZ8EtMv3oXzlbejVl9is9svDSmrSqHFUoVOaC0nJusPGwMp18QrcjR7BR2lOjbuBlDljZ8PGhjG7yyG6huKmxP4UwvxPNMMWt1ujUB8F0Ar5elWNZOToo6nx0Whn1Fl53xt6lJn%2FLQHd0Dc69QRSPDLIUjvUfgywNotPotv8D%2F3aeYmOFdCN9OCaNAE35S8zSUTDfDnu%2BYA564%2Bw7%2BSe4vzuG81CuTDF809gohizdODSshkwvYpZ%2BAYDjcgSLAgAA&web=0)] [[Fabric](https://msit.fabric.microsoft.com/groups/me/queryworkbenches/querydeeplink?experience=fabric-developer&cluster=https://romelogs.kusto.windows.net/&database=Rome3Prod&query=H4sIAAAAAAAAA42STWrDQAyF94HcQXgTG4wpdNmmYAj1LoQ4F1Bs1ZnGM2NGcoxLD99xft02hWr7pKdPD9UksKbCak2mRFHWLFETzCHIxTqsCLAobGuEgXe2rUtwxOJUIWBIOuv2QwMxQ8vKVHBQTlqsr6Jra%2BLgaTop6paFXDhbW00bqkmTuH6BgsneKzbplCltx4mfnEWJZ8EtMv3oXzlbejVl9is9svDSmrSqHFUoVOaC0nJusPGwMp18QrcjR7BR2lOjbuBlDljZ8PGhjG7yyG6huKmxP4UwvxPNMMWt1ujUB8F0Ar5elWNZOToo6nx0Whn1Fl53xt6lJn%2FLQHd0Dc69QRSPDLIUjvUfgywNotPotv8D%2F3aeYmOFdCN9OCaNAE35S8zSUTDfDnu%2BYA564%2Bw7%2BSe4vzuG81CuTDF809gohizdODSshkwvYpZ%2BAYDjcgSLAgAA)] [[cluster('romelogs.kusto.windows.net').database('Rome3Prod')](https://dataexplorer.azure.com/clusters/romelogs/databases/Rome3Prod)]

```kusto
letRecommendationName="Storageaccountsshouldrestrictnetworkaccessusingvirtualnetworkrules";  
cluster('RomeTelemetryData.kusto.windows.net').database('RomeTelemetryProd').AssessmentsNonAggregatedStatusSnapshot  
|whereTimestamp>=ago(30d)  
|whereAssessmentsDisplayName==RecommendationName  
|summarize  
FirstPreview=minif(Timestamp,ReleaseState=="Preview"),  
FirstGA=minif(Timestamp,ReleaseState=="GA")  
byAssessmentsDisplayName  
|whereisnotempty(FirstPreview)andisnotempty(FirstGA)  
|whereFirstPreview<FirstGA  
|projectAssessmentsDisplayName,PreviewSince=FirstPreview,GATransition=FirstGA
```

### Example Output (from ADX)

| AssessmentsDisplayName | PreviewSince | GATransition |
| --- | --- | --- |
| Storage accounts should restrict network access using virtual network rules | 2026-01-20T14:52:02.1619945Z | 2026-02-11T06:16:09.0297031Z |

 

### How to interpret the results

* * *

#### PreviewSince

Indicates the **earliest telemetry timestamp (within the query window)** where the recommendation was reported with:
`ReleaseState = "Preview"`

* * *

#### GATransition

Indicates the **earliest telemetry timestamp (within the same query window)** where the recommendation was reported with:
`ReleaseState = "GA"`

* * *

#### What this means in practice

In the example above, telemetry shows that:
*   The recommendation was still being observed as **Preview** on **20260120**
*   It was later observed as **GA** on **20260211**
This strongly suggests that the **Preview  GA transition occurred between these two timestamps**.

* * *

### Important considerations and limitations

* * *

#### Timestamps are telemetrybased

*   The values are derived from the **`Timestamp` field** in assessment telemetry
*   They **do not represent official Product Group announcement dates**

* * *

#### 30day query window

The filter:
`Timestamp >= ago(30d)`
is intentionally applied to:
*   Reduce **memory consumption**
*   Avoid **highcost scans** across historical telemetry
As a result:
*   **PreviewSince** does **not necessarily represent the firstever Preview release**
*   It represents the **earliest Preview observation within the last 30 days**