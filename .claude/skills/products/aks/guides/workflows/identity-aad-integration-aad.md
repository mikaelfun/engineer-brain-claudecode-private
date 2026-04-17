# AKS AAD 集成与认证 — aad — 排查工作流

**来源草稿**: ado-wiki-b-Troubleshooting-AAD-Integration-Token-Issues.md
**Kusto 引用**: 无
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting Flow
> 来源: ado-wiki-b-Troubleshooting-AAD-Integration-Token-Issues.md | 适用: 适用范围未明确

### 排查步骤

The first step in troubleshooting is to get the debug log traces from the device login. After logging in with `az aks get-credentials`, use the following before issuing a get nodes command with `kubectl`:

```bash
export AZURE_GO_SDK_LOG_LEVEL=DEBUG

#### then run
kubectl get nodes kubectl --v=8 get pods 2>&1 | tee /tmp/get-token.out | grep devicelogin
```

This will trigger the device login but log the trace to a file in the root /tmp directory as `get-token.out`

This file will show the trace operation for the device login.

The thing to look for initially in this file is the response status. A successful attempt should show a 200.

A bad response will show a non-200 status, which indicates an issue with the login attempt.

---
