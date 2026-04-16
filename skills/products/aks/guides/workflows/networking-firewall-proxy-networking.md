# AKS 防火墙与代理 — networking — 排查工作流

**来源草稿**: ado-wiki-troubleshoot-nva-and-routing.md
**Kusto 引用**: 无
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshoot Network Virtual Appliances (NVA) and Routing
> 来源: ado-wiki-troubleshoot-nva-and-routing.md | 适用: 适用范围未明确

### 排查步骤

#### Troubleshoot Network Virtual Appliances (NVA) and Routing

#### Checking OUTBOUND Connectivity from the Node

##### Method 1: Azure Portal — Network Watcher

1. Open Azure Portal → search "Network Watcher"
2. Left panel → **Connection Troubleshoot**
3. Source resource type: **VMSS network interface**
4. Select the VMSS Instance (e.g., vm 0)
5. Destination Type: **Specify manually**
6. URI/FQDN/IP: e.g., `8.8.8.8`
7. Protocol: **TCP**, Destination Port: e.g., `53`
8. Diagnostic tests: **Next Hop**

**Interpreting results:**
- Output shows the network path to reach the destination IP
- If traffic goes through an NVA (e.g., `10.9.0.4`), you'll see it as the next hop
- Check the associated UDR (e.g., `aks-agentpool-18522575-routetable`)
- If failing at the NVA IP → issue is likely on the NVA side → customer should engage their network team

**Pro tip:** Select all 3 Diagnostic tests options for more detailed information.

##### Method 2: ASC → Diagnostic → Test Traffic

1. Navigate to: Microsoft Compute > virtualMachineScaleSets > Node Name > Node Instance
2. Click on the VMSS node instance → **Diagnostic** → **Test Traffic**
3. Configure:
   - Traffic Direction: **Outbound**
   - Source IP: NIC Default
   - Source Port: any high port (e.g., `33890`)
   - Destination IP: e.g., `8.8.8.8`
   - Destination Port: e.g., `53`
   - Transport Protocol: **TCP**

4. Focus on the **Stateless Test (Routing Layer)**
5. Check RuleName (e.g., `RouteTargetNVA`) to identify NVA routing
6. Click "Effective Traffic Stateless" to download detailed file

**Cross-referencing with Effective Routes:**
1. Copy the Conditions Destination IP (e.g., `8.8.8.8/32`)
2. Go to NIC Effective Routes section
3. Filter by DESTINATIONSUBNETS with the copied IP
4. Check NextHops — this reveals the NVA IP (e.g., `10.9.0.4`)

#### Key Takeaway

If outbound traffic is failing at an NVA IP, the issue is likely on the NVA configuration — advise the customer to engage their network team for NVA troubleshooting.

---
