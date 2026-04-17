---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Azure DNS regional accounts"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20DNS%20regional%20accounts"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure DNS Regional Accounts (Internal Reference)

[[_TOC_]]

> ⚠️ **Internal Use Only** — Do not share terminology like "Regional Account" with customers unless explicitly approved. Always validate with PG or Storage Engineering before disclosing architectural details externally.

---

# What are Regional Accounts?

**Definition (Internal Use Only):**  

A _Regional Account_ refers to a high-scale Azure Storage account architecture that distributes storage resources across multiple **Storage Scale Units (SSUs)** within a single Azure region. Each SSU is a cluster of storage nodes forming a fault domain.

This setup allows Azure Storage to:  
- Scale throughput and IOPS for large workloads  
- Maintain performance balance across customers  
- Avoid overloading a single SSU  

**Why it matters:**  
Regional Accounts are used for high-demand scenarios, provisioned by PG upon request. They are **not customer-configurable** and not documented publicly.

---

# How to Identify a Regional Account

Infer a Regional Account by:  
- Observing multiple CNAMEs or IPs in `nslookup` / `dig` results (e.g., `*.storeindex.core.windows.net`, `*.trafficmanager.net`)  
- Seeing traffic distributed across multiple Private Endpoint IPs  
- Using ASC which may flag accounts as regional  

> **Note:** These indicators are not definitive. Always confirm with PG or internal documentation before escalating.

---

# When to Open Collabs to Storage Gen2

Open a collaboration with the Storage Gen2 team when:
- You suspect a misconfiguration or performance issue related to Private Endpoints or SSU distribution
- You need confirmation or intervention from PG regarding Regional Account behaviour
- You require architectural clarification that cannot be answered from public documentation
