# AVD AVD on Azure Stack HCI - Comprehensive Troubleshooting Guide

**Entries**: 4 | **Generated**: 2026-04-18

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| AVD on Azure Stack HCI: Session Host status shows as Unavailable | Azure Arc-enabled agent (himds service) is not installed or not runnin... | 1) Run 'Get-Service himds' on VM to check Arc agent status; 2) If not ... |
| AVD on Azure Stack HCI: Windows will not activate on session host VMs | Known issue with AVD on Azure Stack HCI as documented in the official ... | Refer customer to the Known Issues and Limitations section of the Azur... |
| AVD on Azure Stack HCI: Agent upgrade fails on session hosts | Not yet root caused; occurs occasionally on Azure Stack HCI session ho... | Troubleshoot failed agent update using standard agent troubleshooting ... |
| Unable to deploy VM session hosts into AVD Host Pool through Azure Sta... | Azure Stack HCI deployment service bug causing conflict errors when ad... | PG deployed a hotfix to mitigate the issue. If still occurring, check ... |

### Phase 2: Detailed Investigation

#### Entry 1: AVD on Azure Stack HCI: Session Host status shows as Unavail...
> Source: ADO Wiki | ID: avd-ado-wiki-0879 | Score: 8.0

**Symptom**: AVD on Azure Stack HCI: Session Host status shows as Unavailable

**Root Cause**: Azure Arc-enabled agent (himds service) is not installed or not running on the Azure Stack HCI VM

**Solution**: 1) Run 'Get-Service himds' on VM to check Arc agent status; 2) If not installed: send collab to Azure\Azure Stack HCI\Public Preview Support\Issues in Preview; 3) If not running: start the service; if fails to start, send collab; 4) If Arc agent is healthy, troubleshoot normally via CSS/PG Teams or TA

> 21V Mooncake: Applicable

#### Entry 2: AVD on Azure Stack HCI: Windows will not activate on session...
> Source: ADO Wiki | ID: avd-ado-wiki-0881 | Score: 8.0

**Symptom**: AVD on Azure Stack HCI: Windows will not activate on session host VMs

**Root Cause**: Known issue with AVD on Azure Stack HCI as documented in the official known issues and limitations page

**Solution**: Refer customer to the Known Issues and Limitations section of the Azure Virtual Desktop for Azure Stack HCI Overview documentation

> 21V Mooncake: Applicable

#### Entry 3: AVD on Azure Stack HCI: Agent upgrade fails on session hosts
> Source: ADO Wiki | ID: avd-ado-wiki-0878 | Score: 7.0

**Symptom**: AVD on Azure Stack HCI: Agent upgrade fails on session hosts

**Root Cause**: Not yet root caused; occurs occasionally on Azure Stack HCI session hosts

**Solution**: Troubleshoot failed agent update using standard agent troubleshooting steps. If unable to resolve, ask in CSS/PG Teams channel first; if no response, create an ICM

> 21V Mooncake: Applicable

#### Entry 4: Unable to deploy VM session hosts into AVD Host Pool through...
> Source: ADO Wiki | ID: avd-ado-wiki-164 | Score: 5.5

**Symptom**: Unable to deploy VM session hosts into AVD Host Pool through Azure Stack HCI, failing with Conflict error

**Root Cause**: Azure Stack HCI deployment service bug causing conflict errors when adding new session hosts

**Solution**: PG deployed a hotfix to mitigate the issue. If still occurring, check for latest Azure Stack HCI updates. Related ICM: 510399439

> 21V Mooncake: Not verified

### Phase 3: Kusto Diagnostics

> Refer to Kusto skill references for relevant queries.
