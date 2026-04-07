# AKS 网络连通性通用 — api-server -- Comprehensive Troubleshooting Guide

**Entries**: 6 | **Draft sources**: 7 | **Kusto queries**: 1
**Source drafts**: ado-wiki-a-aks-network-performance-troubleshooting.md, ado-wiki-aks-api-connectivity-hands-on-labs.md, ado-wiki-c-Monitoring-API-Server-performance.md, ado-wiki-c-VM-Performance-Troubleshooting-Guideline.md, ado-wiki-d-API-Server-VNet-Integration.md, ado-wiki-network-capture-kubectl-plugin.md, mslearn-api-server-connection-basic-troubleshooting.md
**Kusto references**: api-throttling-analysis.md
**Generated**: 2026-04-07

---

## Phase 1: API server authorized IP ranges enabled but client

### aks-1117: Client IP cannot access AKS API server: dial tcp <API-SERVER-IP>:443: i/o timeou...

**Root Cause**: API server authorized IP ranges enabled but client IP not in the allowed list

**Solution**:
Get client IP: curl https://ipinfo.io/ip; add to authorized ranges: az aks update --api-server-authorized-ip-ranges <clientIP>

`[Score: [G] 8.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/client-ip-address-cannot-access-api-server)]`

## Phase 2: Network connectivity issue between client and AKS 

### aks-220: kubectl fails with Unable to connect to the server: net/http: TLS handshake time...

**Root Cause**: Network connectivity issue between client and AKS API server

**Solution**:
Check network connectivity, DNS resolution, firewall/NSG rules, API server authorized IP ranges

`[Score: [B] 7.5 | Source: [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn]]`

## Phase 3: AKS cluster configured with --api-server-authorize

### aks-1108: Cannot access AKS cluster API server: Unable to connect to the server: dial tcp ...

**Root Cause**: AKS cluster configured with --api-server-authorized-ip-ranges that does not include client IP address

**Solution**:
Add client IP to authorized IP ranges: az aks update --resource-group <rg> --name <cluster> --api-server-authorized-ip-ranges <clientIP>; for corporate networks check proxy/firewall egress IP

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/cannot-access-cluster-api-server-using-authorized-ip-ranges)]`

## Phase 4: Pods responsible for node-to-control-plane communi

### aks-1131: kubectl commands timeout repeatedly - konnectivity-agent (or legacy tunnelfront/...

**Root Cause**: Pods responsible for node-to-control-plane communication (konnectivity-agent) are on nodes that are overly utilized or under stress, preventing tunnel establishment

**Solution**:
Move konnectivity-agent to dedicated system node pool; reduce node utilization; check with kubectl get pod -n kube-system -o wide and kubectl top node

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/tcp-timeouts-kubetctl-third-party-tools-connect-api-server)]`

## Phase 5: Client TLS version is outdated; AKS API server req

### aks-1171: Error "tls: client offered only unsupported versions" when connecting to AKS API...

**Root Cause**: Client TLS version is outdated; AKS API server requires minimum TLS 1.2

**Solution**:
Upgrade client TLS version to 1.2 or later. Follow Microsoft guidance on enabling TLS 1.2 support in your environment.

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/tls-client-offered-unsupported-versions)]`

## Phase 6: Objects continuously created without cleanup (comp

### aks-1174: API server high latency, timeouts, etcd database size approaching 8GB limit; etc...

**Root Cause**: Objects continuously created without cleanup (completed jobs, failed pods, unused ConfigMaps/Secrets) causing etcd database bloat and performance degradation

**Solution**:
Check etcd size: kubectl get --raw /metrics | grep apiserver_storage_db_total_size_in_bytes. Clean up: kubectl delete jobs --field-selector status.successful=1; kubectl delete pods --field-selector status.phase=Failed. Define resource quotas and TTL values.

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/troubleshoot-apiserver-etcd)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Client IP cannot access AKS API server: dial tcp <API-SERVER-IP>:443: i/o timeou... | API server authorized IP ranges enabled but client IP not in... | Get client IP: curl https://ipinfo.io/ip; add to authorized ... | [G] 8.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/client-ip-address-cannot-access-api-server) |
| 2 | kubectl fails with Unable to connect to the server: net/http: TLS handshake time... | Network connectivity issue between client and AKS API server | Check network connectivity, DNS resolution, firewall/NSG rul... | [B] 7.5 | [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn] |
| 3 | Cannot access AKS cluster API server: Unable to connect to the server: dial tcp ... | AKS cluster configured with --api-server-authorized-ip-range... | Add client IP to authorized IP ranges: az aks update --resou... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/cannot-access-cluster-api-server-using-authorized-ip-ranges) |
| 4 | kubectl commands timeout repeatedly - konnectivity-agent (or legacy tunnelfront/... | Pods responsible for node-to-control-plane communication (ko... | Move konnectivity-agent to dedicated system node pool; reduc... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/tcp-timeouts-kubetctl-third-party-tools-connect-api-server) |
| 5 | Error "tls: client offered only unsupported versions" when connecting to AKS API... | Client TLS version is outdated; AKS API server requires mini... | Upgrade client TLS version to 1.2 or later. Follow Microsoft... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/tls-client-offered-unsupported-versions) |
| 6 | API server high latency, timeouts, etcd database size approaching 8GB limit; etc... | Objects continuously created without cleanup (completed jobs... | Check etcd size: kubectl get --raw /metrics \| grep apiserve... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/troubleshoot-apiserver-etcd) |
