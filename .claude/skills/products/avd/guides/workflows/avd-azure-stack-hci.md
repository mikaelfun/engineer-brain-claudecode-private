# AVD on Azure Stack HCI — Troubleshooting Workflow

**Scenario Count**: 4
**Generated**: 2026-04-18

---

## Scenario 1: AVD on Azure Stack HCI: Session Host status shows as Unavail...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- 1) Run 'Get-Service himds' on VM to check Arc agent status; 2) If not installed: send collab to Azure\Azure Stack HCI\Public Preview Support\Issues in Preview; 3) If not running: start the service; if fails to start, send collab; 4) If Arc agent is healthy, troubleshoot normally via CSS/PG Teams or TA

**Root Cause**: Azure Arc-enabled agent (himds service) is not installed or not running on the Azure Stack HCI VM

## Scenario 2: AVD on Azure Stack HCI: Windows will not activate on session...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Refer customer to the Known Issues and Limitations section of the Azure Virtual Desktop for Azure Stack HCI Overview documentation

**Root Cause**: Known issue with AVD on Azure Stack HCI as documented in the official known issues and limitations page

## Scenario 3: AVD on Azure Stack HCI: Agent upgrade fails on session hosts
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Troubleshoot failed agent update using standard agent troubleshooting steps. If unable to resolve, ask in CSS/PG Teams channel first; if no response, create an ICM

**Root Cause**: Not yet root caused; occurs occasionally on Azure Stack HCI session hosts

## Scenario 4: Unable to deploy VM session hosts into AVD Host Pool through...
> Source: ADO Wiki | Applicable: ❓

### Troubleshooting Steps
- PG deployed a hotfix to mitigate the issue. If still occurring, check for latest Azure Stack HCI updates. Related ICM: 510399439

**Root Cause**: Azure Stack HCI deployment service bug causing conflict errors when adding new session hosts
