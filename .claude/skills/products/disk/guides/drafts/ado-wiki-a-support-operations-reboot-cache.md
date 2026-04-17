---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - HPC Cache/Support Operations - Reboot Cache"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20HPC%20Cache%2FSupport%20Operations%20-%20Reboot%20Cache"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Support Operations — Reboot Cache (HPC Cache)

> **Requires:** SAW machine + AME account

Access Geneva Actions: https://aka.ms/GenevaActions

The **Reboot Cache** operation allows authorized users to reboot specific nodes or the entire HPC Cache using a Geneva Action. The reboot process is similar to FXT/vFXT cluster reboot and takes several minutes to complete.

---

## ACCESS

Reboot Cache is a **read/write action** — a valid Access Token for the specified Endpoint is required.

---

## REQUIRED PARAMETERS

**Environment Parameter**
- `Environment`: Cloud environment used to create the cache

**HPC Cache Parameters**
- `Endpoint`: Endpoint server corresponding to the Region where the cache was created
- `Subscription Id`: Subscription ID used to create the cache
- `Resource Group Name`: Resource group where the cache was created
- `Cache Name`: Name of the target cache
- `Node Id`: Node number to reboot. Obtain node numbers using the **Node List** action.
  - Enter `-1` to reboot ALL nodes in the cache

---

## OUTPUT

Output will be **"NoContent"** if the command was successfully run.

**Post-reboot verification:**
- Wait **5–10 minutes**
- Check cluster status using **Get Cache Plus** action
- Verify that the node(s) have rebooted and returned to Running state

---

## IMPORTANT NOTES

- Always **inform customers** before performing a node restart (change-controlled)
- Check **conditions/alerts** before AND after the reboot to confirm improvement
