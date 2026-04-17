# AKS AGIC HTTP 错误码排查 — networking — 排查工作流

**来源草稿**: ado-wiki-a-agic-request-routing-verification.md
**Kusto 引用**: 无
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: AGIC: Is Request Being Routed To The Correct Backend Application?
> 来源: ado-wiki-a-agic-request-routing-verification.md | 适用: 适用范围未明确

### 排查步骤

#### AGIC: Is Request Being Routed To The Correct Backend Application?

#### Purpose

Confirm if a given request is being routed by Application Gateway to the correct backend pod(s).

#### Method 1: Azure Portal (Customer-Facing)

1. Enable Diagnostic Settings for the Application Gateway
2. Navigate to **Monitoring/Logs** and run:
   ```kql
   AzureDiagnostics
   | where requestUri_s == "<PATH>"
   | project serverRouted_s
   ```
3. Result shows IP:port of the backend pod
4. Identify pod by IP:
   ```bash
   kubectl get pods -A -o wide --field-selector status.podIP=<IP_ADDRESS>
   ```

#### Method 2: CSS Tooling (Internal)

1. Open Application Gateway in **Azure Support Center** → Diagnostics
2. Click **[MDM Logs] Request Response** under Diagnostic Links
3. Opens DGrep (Jarvis) dashboard with pre-loaded query (last 15 min)
4. Find request by timestamp/client IP/URI → check `serverRouted` column
5. Use Jarvis kubectl Action to list pods and match IP:
   ```
   get pod --all-namespaces -o wide
   ```

---
