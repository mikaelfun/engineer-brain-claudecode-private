---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/TSGs/Extension/Debugging Shell Scripts Run by CSE or RC_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FTSGs%2FExtension%2FDebugging%20Shell%20Scripts%20Run%20by%20CSE%20or%20RC_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Debugging Shell Scripts Run by CSE or RunCommand (Linux)

## Summary

Although we do not debug customer scripts, it can be helpful to provide guidance showing them how to capture errors once we have ruled out issues with CSE or Run Command. Common script failure types:

1. **Syntax error**: language used incorrectly (e.g., unclosed string `echo 'hello world`)
2. **Runtime error**: errors happen at execution (e.g., `sh script.sh` when script.sh doesn't exist)
3. **Logic error**: no explicit errors but script doesn't work as expected (e.g., infinite loop hitting 90-min timeout)

## Checking Output

The STDOUT and STDERR substatuses are in the CRP Instance View:

- **Azure Portal**: Extensions blade (CSE) or Run command blade (RC v1)
- **Az PowerShell**: `Get-AzVM -ResourceGroupName rg1 -Name vm1 -status`
- **Azure CLI**: `az vm get-instance-view -g rg1 -n vm1 -o json`
- **On the VM**: Check locally via SSH/SAC

### Log locations on the VM

| Extension Type | Status file | Output directory |
|---|---|---|
| CSE | `/var/lib/waagent/Microsoft.Azure.Extensions.CustomScript-*/status/` | `/var/lib/waagent/custom-script/download/` |
| Run Command v1 | `/var/lib/waagent/Microsoft.CPlat.Core.RunCommandLinux-*/status/` | `/var/lib/waagent/run-command/download/` |
| Run Command v2 | `/var/lib/waagent/Microsoft.CPlat.Core.RunCommandHandlerLinux-*/status/` | `/var/lib/waagent/run-command-handler/download/` |

Each download subfolder contains `stderr` and `stdout` files.

## Test Locally

```bash
sudo su
cat goodScript.sh  # echo 'hello world'
sh goodScript.sh   # hello world
echo $?            # 0 (success)

cat badScript.sh   # echo 'hello world   (unclosed quote)
sh badScript.sh    # unexpected EOF...
echo $?            # 2 (failure)
```

If script works as non-root but customer needs specific user, recommend Managed Run Commands (v2).

## Tips for Debugging

- `set -v`: verbose, prints command lines as interpreted
- `set -x`: prints arguments before execution
- `set -E`: inherit shell functions
- `set -e`: exit immediately if any command fails
- `set -u`: exit if any unset variables detected
- `set -o pipefail`: exit if any piped command fails
- `script` command: log terminal content into a file
- `exit` command: terminate script with explicit exit code

## Example: Logging Shell Script Execution

```bash
myTime=$(date +"%Y-%m-%d_%H%M_UTC")
cat >> settings_$myTime.json << EOF
{ "commandToExecute": "script -c \"set -v -x -E; echo 'Hello Azure IaaS VM'; cat /etc/*release; exit;\"" }
EOF

az vm extension set -g 'rg1' --vm-name 'vm1' --name 'customScript' \
  --publisher 'Microsoft.Azure.Extensions' --protected-settings ./settings_$myTime.json

# On the VM, review /var/lib/waagent/custom-script/download/0/typescript
```

## Example: Catching errors with set -euo pipefail

When CSE succeeds but output is wrong, use `set -euo pipefail` to catch unbound variables and piped command failures:

```bash
script
set -euo pipefail
# Run script lines one by one to identify the failing line
```

## References

- [Custom Script Extension](https://learn.microsoft.com/en-us/azure/virtual-machines/extensions/custom-script-linux)
- [Run Command](https://learn.microsoft.com/en-us/azure/virtual-machines/run-command-overview)
- [set command](https://ss64.com/bash/set.html)
- [script command](https://linux.die.net/man/1/script)
