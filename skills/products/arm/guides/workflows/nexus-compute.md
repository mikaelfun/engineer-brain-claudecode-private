# ARM Nexus 计算与 BMM — 排查工作流

**来源草稿**: ado-wiki-a-bmm-replacement-process.md, ado-wiki-a-collecting-tsr-from-bmm.md 等 14 files
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: BMM (Bare Metal Machine) 替换流程
> 来源: ado-wiki-a-bmm-replacement-process.md | 适用: Mooncake ❌ / Global ✅

### 排查步骤
1. **理解替换流程三阶段**:
   - **Step 1: Hardware Validation** — 验证 BMC 连接性、boot MAC、硬件规格
   - **Step 2: Deprovisioning** — 清除现有主机状态
   - **Step 3: Provisioning** — PXE boot + IPA 部署 OS 镜像 + cloud-init + 加入集群
2. **关键 Custom Resources**:
   - BMM (Bare Metal Machine) — 主 Azure 资源
   - BMM Replace Action — 驱动替换过程
   - Metal3Machine — K8s 节点与物理主机关联
   - Bare Metal Host (BMH) — 物理主机状态
3. **Controller/Operator 日志**:
   - BMM Controllers、CAPI Controller、CAPM3 Controller、BMO、Ironic
4. **超时**: 4 小时后失败会触发重试
5. **硬件验证失败** → 检查 BMC 连接（Redfish URL）、boot MAC、硬件规格

---

## Scenario 2: TSR 收集
> 来源: ado-wiki-a-collecting-tsr-from-bmm.md | 适用: Mooncake ❌ / Global ✅

### 排查步骤
1. 从 BMM 收集 Technical Support Report (TSR)
2. 分析 BMC/BIOS 日志
3. 检查存储策略和 CMBU 相关问题
