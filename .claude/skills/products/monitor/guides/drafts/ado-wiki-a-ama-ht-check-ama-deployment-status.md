---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA: HT: Check the status of AMA deployment"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/How-To/AMA%3A%20HT%3A%20Check%20the%20status%20of%20AMA%20deployment"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Check status of AMA release
This is for informational purposes only.   For customers discussions, please refer to the [public docs](https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-extension-versions#version-details) 

## Microsoft Internal release status

Access the Azure DevOps Pipeline
1. Go to the Azure DevOps Release Pipeline for the respective release
https://dev.azure.com/msazure/One/_releaseProgress?_a=release-pipeline-progress&releaseId=YOUR_RELEASE_ID

_in the following example you can see the pipeline for Azure Monitor Agent for Linux_
![image.png](/.attachments/image-d2332883-003c-4011-9a63-baaa8967e141.png)

2. View the current releases and their statuses to see if the release is in progress or completed.  In the following example I can see Prod:Publish to Stage1 as Succeeded 
![image.png](/.attachments/image-b7dcaf7a-7abe-4c80-943e-a1cbf2bdeb31.png) 

3. Releases are deployed by region and this is documented in stages. In short, stages map to regions, so you will reference a region maps to determine if a release is deployed in a region.  In the above example I can cross reference a stages map to see that AMA 1.32 has been released to Stage 1 which means it is released in Central US.  

[DevOps - Pipeline Stages](https://dev.azure.com/msazure/One/_git/Compute-Runtime-Tux?path=/ev2/AMA/ExtensionInfo.xml&version=GBmain&line=34&lineEnd=41&lineStartColumn=9&lineEndColumn=687&lineStyle=plain&_a=contents)
```
<Stage1>Central�US�EUAP;East�US�2�EUAP</Stage1>
������� <Stage2>Central�US�EUAP;East�US�2�EUAP;West�Central�US;East�Asia</Stage2>
������� <Stage3>Central�US�EUAP;East�US�2�EUAP;West�Central�US;East�Asia;UK�South</Stage3>
������� <Stage4>Central�US�EUAP;East�US�2�EUAP;West�Central�US;East�Asia;UK�South;East�US</Stage4>
������� <Stage5>Central�US�EUAP;East�US�2�EUAP;West�Central�US;East�Asia;UK�South;East�US;North�Europe;North�Central�US;Brazil�South;West�India;Australia�East;Germany�West�Central;Norway�East;Sweden�Central;France�Central;Korea�Central;Switzerland�North</Stage5>
������� <Stage6>Central�US�EUAP;East�US�2�EUAP;West�Central�US;East�Asia;UK�South;East�US;North�Europe;North�Central�US;Brazil�South;West�India;Australia�East;Germany�West�Central;Norway�East;Sweden�Central;France�Central;Korea�Central;Switzerland�North;Central�India;Australia�Central;East�US�2;Canada�Central;UK�West;Japan�East;South�Africa�North;UAE�North;Jio�India�West</Stage6>
������� <Stage7>Central�US�EUAP;East�US�2�EUAP;West�Central�US;East�Asia;UK�South;East�US;North�Europe;North�Central�US;Brazil�South;West�India;Australia�East;Germany�West�Central;Norway�East;Sweden�Central;France�Central;Korea�Central;Switzerland�North;Central�India;Australia�Central;East�US�2;Canada�Central;UK�West;Japan�East;South�Africa�North;UAE�North;Jio�India�West;South�Central�US;South�India;Australia�Southeast;Norway�West;Jio�India�Central;Sweden�South;Korea�South;South�Africa�West;Switzerland�West;UAE�Central;West�US</Stage7>
������� <Stage8>Central�US�EUAP;East�US�2�EUAP;West�Central�US;East�Asia;UK�South;East�US;North�Europe;North�Central�US;Brazil�South;West�India;Australia�East;Germany�West�Central;Norway�East;Sweden�Central;France�Central;Korea�Central;Switzerland�North;Central�India;Australia�Central;East�US�2;Canada�Central;UK�West;Japan�East;South�Africa�North;UAE�North;Jio�India�West;South�Central�US;South�India;Australia�Southeast;Norway�West;Jio�India�Central;Sweden�South;Korea�South;South�Africa�West;Switzerland�West;UAE�Central;West�US;Central�US;West�Europe;Southeast�Asia;Australia�Central�2;West�US�2;West�US�3;Japan�West;Germany�North;Canada�East;France�South;Brazil�Southeast</Stage8>
```

## Example Navigation Steps

1. **Open Azure DevOps**: [Azure DevOps](https://dev.azure.com/)
2. **Select Organization**: `msazure`
3. **Select Project**: `One`
4. **Go to Pipelines**: Click on **Pipelines** in the left sidebar.
5. **View Release Pipelines**: Click on **Releases**.
6. **Select Specific Release Pipeline**: Choose `Geneva-AzureMonitorLinux`.
7. **Check Release Progress**: Use the URL format: `https://msazure.visualstudio.com/One/_releaseProgress?_a=release-pipeline-progress&releaseId=YOUR_RELEASE_ID`

Look at the stages and if they are all green or you see publish to stage all complete then it's in all regions.
![image.png](/.attachments/image-227fc694-f495-4d4d-bb52-cd60f5046474.png)



