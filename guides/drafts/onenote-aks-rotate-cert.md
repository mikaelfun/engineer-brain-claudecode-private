# [AKS] Certificate Rotation Guide & Failure due to Resource Group Lock

**Source:** MCVKB/VM+SCIM/18.31  
**Type:** Known Issue + Guide  
**ID:** aks-onenote-016  
**Product:** AKS (Mooncake)  
**Date:** 2021-12-22

## Overview

`az aks rotate-certs` replaces all TLS certificates and service accounts on an AKS cluster. The operation deletes and recreates each agent node with the same VM name.

## Check Certificate Expiry

```bash
# Cluster credential cert
kubectl config view --raw -o jsonpath="{.users[?(@.name == 'clusterUser_<rg>_<cluster>')].user.client-certificate-data}" \
  | base64 -d | openssl x509 -text | grep -A2 Validity

# API Server cert (from outside)
curl https://<apiserver-fqdn> -k -v 2>&1 | grep expire

# VMAS agent node cert
az vm run-command invoke -g <rg> -n <vm> \
  --command-id RunShellScript \
  --query 'value[0].message' -otsv \
  --scripts "openssl x509 -in /etc/kubernetes/certs/apiserver.crt -noout -enddate"
```

**Kusto (BBM):**
```kusto
cluster('akscn.kusto.chinacloudapi.cn').database('AKSprod').BlackboxMonitoringActivity
| where subscriptionID == "<sub-id>" and fqdn contains "<cluster-name>"
| summarize by certExpirationTimes, serviceCertExpiration, bin(PreciseTimeStamp, 1h)
```

## Known Failure: Resource Group Lock

### Symptom

`az aks rotate-certs` fails; cluster enters **Failed** state. ARM / AKS logs show DELETE operation denied on agent nodes.

### Root Cause

A **resource lock** (Delete Lock or ReadOnly Lock) is applied to the node resource group (`MC_*`). During cert rotation, AKS deletes original nodes and creates new ones with the same name. The lock blocks the DELETE call.

### Solution

1. Check for locks:
   ```bash
   az lock list --resource-group <MC_resourcegroup>
   ```
2. Remove the lock:
   ```bash
   az lock delete --name <lock-name> --resource-group <MC_rg>
   ```
3. Re-run cert rotation:
   ```bash
   az aks rotate-certs -g <rg> -n <cluster>
   ```
4. Re-apply lock after completion if desired

### Kusto — Diagnose ARM Errors

```kusto
-- armmcadx.chinaeast2.kusto.chinacloudapi.cn / armmc
union
  cluster("Akscn").database("AKSprod").FrontEndContextActivity,
  cluster("Akscn").database("AKSprod").AsyncContextActivity
| where subscriptionID contains "<sub-id>"
| where resourceName contains "<cluster-name>"
| where level != "info"
| where PreciseTimeStamp > datetime(START)
| project PreciseTimeStamp, msg, operationID, correlationID, level, suboperationName
| sort by PreciseTimeStamp asc
```

## Normal Cert Rotation Behavior

- AKS **deletes** original agent node VM
- AKS **creates** new node VM with **same name**
- New certs deployed via CSE extension
- All certs renewed for ~2 years; CA cert for ~30 years
- Activity log shows: `AzureContainerService` performing delete + create operations on MC_* resource group

## Reference

- https://docs.azure.cn/zh-cn/aks/certificate-rotation
