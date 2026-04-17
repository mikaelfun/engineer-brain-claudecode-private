---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - HPC Cache/HPC Quick Reference Sheet"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20HPC%20Cache%2FHPC%20Quick%20Reference%20Sheet"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure HPC Cache — Quick Reference Sheet

> **What it is:** A Microsoft Managed Azure Cache service that accelerates data access between clients and backend storage. **Throughput is fixed at creation** — you **cannot scale up/out** by adding nodes. To increase throughput, you must **destroy & recreate** with a larger configuration.

---

## 1) Essentials (Start Here)

- **Throughput immutability**: SKU/throughput chosen at creation **cannot be changed** later
- **Identifiers you always need**: Subscription ID, Region, Resource Group, Cache Name
- **Dashboards**:
  - **Virtual Dashboard**: latency (frontend vs storage target), throughput, operations
  - **A/C Dashboard**: health checks & error details with remediation **playbooks**
- **Conditions** = active issues now; **Alerts** = historical events (already resolved)
- Time sanity: `date` — ensure host and cache-side context are UTC-aligned

---

## 2) Geneva Actions (Primary Diagnostics) — run from SAW

- Have ready: subscription, region, resource group, cache name, correct service account region
- Key commands:
  - **`get cache plus`**: Current config + statsviewer-like snapshot across caches
  - **Force GSI**: Collect fresh diagnostics
  - **Node restart**: Change-controlled; **inform stakeholders**; check conditions/alerts before & after
- Client-facing IPs: Use them to filter & trace host ↔ cache connectivity

---

## 3) Policies & Writeback Behavior

- **ReadOnly**: optimized for reads; write attempts will fail or be redirected. Bad fit for write-heavy workloads
- **ReadWrite**: supports writes with **writethrough** or **writeback** semantics
- **WriteBack delay**: commonly **5 minutes** (some set 10 min or 1 hour). Tune to workload and freshness needs
- **Clients Bypassing Cluster**: new writes go direct to core filer; cache performs periodic verification (~30s sweeps)

> **Workload fit:** Best ROI around **80% read / 20% write**. Write-heavy + readonly → recycling & slot exhaustion → high latency.

---

## 4) Latency Triage Runbook

1. **Virtual dashboard**: Compare **frontend latency** vs **storage target latency**
2. **A/C dashboard**: Review errors/check names; follow playbook steps
3. **Geneva `get cache plus`**: Verify config, cognitive state, active image, conditions/alerts
4. **Patterns**:
   - First-touch latency spike on initial reads (data fetched from backend)
   - Warm-cache reads should be much faster
   - Cache full → recycling raises latency while freeing space

---

## 5) Connectivity & NFS Path (When applicable)

```bash
# Reachability & ports
ping <core_filer_ip_or_host>
nc -vz <core_filer_ip_or_host> <port>

# RPC/NFS services and ports
rpcinfo -p <server>

# NFS stats (client/server)
nfsstat -c
nfsstat -s
```

- If NFS services are questionable, **restart NFS** on core filer (change-controlled), then re-verify `rpcinfo`, `nc`, and client mounts
- Validate exports, **root squash**, UID/GID mapping, and directory permissions

---

## 6) Common Root Causes (and Remedies)

| Symptom | Root Cause | Remedy |
|---------|-----------|--------|
| High latency with write-heavy workload | Policy mismatch — write-heavy on ReadOnly cache → recycling | Move to ReadWrite policy or reshape workload |
| Latency spikes, stuck ops, queued requests | Slot exhaustion — all request slots consumed | Align policy, smooth concurrency, cautiously increase slots only if backend/network can handle it |
| Persistent latency during cache operation | Cache full — recycling by space as cache evicts/moves data | Tune writeback delay, rightsize for working set, revisit policy |
| High frontend latency | Backend storage target slowdowns propagate to frontend | Compare frontend vs storage target latency; investigate backend health |

---

## 7) Namespaces, Access Paths & Test Traffic

- Present short, stable namespace paths to clients (e.g., `/datasets/subdir2`)
- Create load to observe behavior:
  ```
  cp -r /home/small_files /home/cloud_mount
  ```
- **Remember:** Virtual dashboard reflects changes about **5 minutes** after activity starts

---

## 8) Operational Realities

- **Throughput scaling**: Destroy & recreate cache with larger configuration
- **Node restarts via Geneva**: Always inform customers; compare conditions/alerts before & after
- **Log/GSI freshness**: Force a new GSI if evidence is stale or out of window

---

## 9) Deployment & Access Context (Customer Side)

- **Azure Bastion**: If no public IP → VM → Connect → More ways to connect → Native RDP
- **Terraform troubleshooting**:
  - Is customer using **Managed Identity (MI)** or **admin**?
  - MI: Verify RBAC roles, scope (sub/RG/resource), provider config
  - Admin: Confirm creds, MFA/conditional access, provider auth
  - Keep Terraform updated to avoid provider/auth issues

---

## 10) Looks Good Checklist

- [ ] Identifiers ready (sub, region, RG, cache name); Geneva tools run successfully
- [ ] Virtual dashboard assessed: frontend vs storage target latency, throughput, ops
- [ ] A/C dashboard reviewed; playbook steps understood
- [ ] Policy matches workload; writeback delay appropriate; cache not perpetually full
- [ ] If NFS-backed: exports, root squash, permissions, and RPC/NFS services validated
- [ ] Evidence (GSI/logs) aligned to UTC and correct analysis windows (mind the 5-minute lag)
