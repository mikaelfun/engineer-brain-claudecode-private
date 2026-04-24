---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/troubleshoot-common-azure-linux-aks"
importDate: "2026-04-21"
type: guide-draft
---

# Troubleshoot Common Issues for Azure Linux Container Host on AKS

Reference guide for Azure Linux (Mariner) specific issues on AKS.

## Step 1: Package Management Command Equivalents
Azure Linux uses `tdnf` instead of `apt`. Key mappings:
- `apt install` -> `tdnf install`
- `apt remove` -> `tdnf remove`
- `apt search` -> `tdnf search`
- `apt-cache show` -> `tdnf info`
- `apt upgrade` -> `tdnf upgrade`
- `apt-get update` -> `dnf clean expire-cache && dnf check-update`

## Step 2: Check Azure Linux Version
Run `az aks nodepool list --resource-group <rg> --cluster-name <cluster>` and verify `osSKU` is "AzureLinux". Versioning issues commonly cause agent/extension failures.

## Step 3: Certificate File Path Differences
Azure Linux stores certs at `/etc/pki/tls/certs` (not `/etc/ssl/certs` like Ubuntu). `/etc/ssl/certs` is a symlink to `/etc/pki/tls/certs`. Containers mapping `/etc/ssl/certs` must also map `/etc/pki` to follow symlinks. Use `hostPath` volume with `DirectoryOrCreate` type for cross-distro compatibility.

## Step 4: Update Azure CLI and AKS Preview Extension
If "AzureLinux option not supported for OSSku" error: run `az upgrade` and `az extension update --name aks-preview`.
