---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Defender for AI/[TSG] - AI Model Security/[TSG] - Common queries for model scan"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FDefender%20for%20AI%2F%5BTSG%5D%20-%20AI%20Model%20Security%2F%5BTSG%5D%20-%20Common%20queries%20for%20model%20scan"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# [TSG] AI Model Security — Common Kusto Queries for Model Scan

Cluster: `https://mdcprd.centralus.kusto.windows.net/` | Database: `Dfai`

> For all queries, replace `modelId` with the actual Azure ML model ID.

---

## Query 1: Find Single Model Processing Status

```kusto
let modelId = "azureml://registries/{registry}/models/{modelName}/versions/{version}";
let timeSpan = ago(2h);
let startProcessing =
cluster("https://mdcprd.centralus.kusto.windows.net/").database('Dfai').Log
| where TIMESTAMP > timeSpan
| where k8s_deployment_name == "modelscan-modelscanongoingworker-service"
| where azure_region in ('westeurope')
| where body contains "Processing message: "
| extend modelScanHostType = todynamic(customData).SourceType
| where modelScanHostType in ('AzureMLRegistry')
| extend ModelIdOldLog = extract(@"ModelId = (azureml://[^\s,]+)", 1, body)
| extend ModelIdNewLog = extract('"ModelId":"([^"]+)"', 1, body)
| extend ModelId = iff(ModelIdOldLog != "", ModelIdOldLog, ModelIdNewLog)
| where ModelId == modelId
| project TIMESTAMP, ModelId, startedCorrelationId = CorrelationId;
let finishedProcessing =
cluster("https://mdcprd.centralus.kusto.windows.net/").database('Dfai').Log
| where TIMESTAMP > timeSpan
| where k8s_deployment_name == "modelscan-modelscanongoingworker-service"
| where body contains "Completed scan for model"
| extend total_model_files = tolong(extract("Total model files:(\\d+)", 1, body))
| extend failed_files = tolong(extract("Failed files in current scan:(\\d+)", 1, body))
| extend completed_files = tolong(extract("Completed files in current scan:(\\d+)", 1, body))
| extend cached_files = tolong(extract("Completed files from cache: (\\d+)", 1, body))
| project finishedCorrelationId = CorrelationId, total_model_files, failed_files, completed_files, cached_files;
startProcessing
| join kind=leftouter finishedProcessing on $left.startedCorrelationId == $right.finishedCorrelationId
| summarize arg_max(TIMESTAMP, *) by ModelId, bin(TIMESTAMP, 1d)
| project-rename real_timestamp = TIMESTAMP1
| extend ScanSuccess = iff(isnotempty(finishedCorrelationId) and failed_files == 0, 1, 0)
| extend ScanPartialSuccess = iff(isnotempty(finishedCorrelationId) and total_model_files > completed_files + cached_files, 1, 0)
```

---

## Detection Code Reference (SonarDetectionMap)

| Code | Category | Description |
|------|----------|-------------|
| Unknown | Security Risk Detected | A security vulnerability was found in the model file |
| MDAI-ONNX-00 | ONNX Detection | ONNX model uses operators/initializers enabling unintended execution |
| MDAI-PKL-00 | Pickle Deserialization | Model includes constructs that can execute arbitrary code when loaded |
| MDAI-NPY-00 | Pickle Deserialization | Model includes constructs that can execute arbitrary code when loaded |
| MDAI-PT-00 | Pickle Deserialization | Model includes constructs that can execute arbitrary code when loaded |
| MDAI-Keras-00 | Keras Detection | Detected unsafe attributes or layers that can run code on load/compile |
| MDAI-GGUF-00 | GGUF Detection | GGUF model contains unsafe blocks or custom ops enabling execution |
| MDAI-H5-00 | Keras H5 Unknown Attribute Injection | Unknown/overridden attributes that may execute code upon deserialization |
| MDAI-SavedModel-00 | TensorFlow Detection | Model contains functions/assets that may execute code or access resources when loaded |
| MDAI-TFlow-00 | TensorFlow Detection | Model contains functions/assets that may execute code or access resources when loaded |
| AVHIT | AV Hit | Model artifact matches known malicious signatures |

---

## Query 2: Get Model Findings

```kusto
let ModelId = "azureml://registries/{registry}/models/{modelName}/versions/{version}";
let timeSpan = ago(2h);
let deploymentName = "modelscan";
let all_findings =
cluster("https://mdcprd.centralus.kusto.windows.net/").database('Dfai').Log
| where TIMESTAMP > timeSpan
| where k8s_deployment_name contains deploymentName
| where body contains "Found" and body contains "scan result" and body contains "for file"
| extend modelId = trim_end(@"[^\w/:-]+",
    tolower(extract(@"(azureml://registries/[^/]+/models/[^/]+/versions/[^:\s]+)", 0, body)))
| where modelId == ModelId;
all_findings
| take 100
```
