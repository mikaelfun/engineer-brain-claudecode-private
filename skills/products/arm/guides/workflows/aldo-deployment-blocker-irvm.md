# ARM ALDO 平台 (Deployment Blocker / IRVM) — 排查工作流

**来源草稿**: ado-wiki-a-aldo-appliance-deployment-investigation.md 等 34 files
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: ALDO 部署阻塞问题
> 来源: ALDO deployment 参考 | 适用: Mooncake ❌ / Global ✅ (Preview)

### 排查步骤
1. **检查已知部署 Bug**: 查阅 Winfield bug filing process 和 known issues
2. **分析部署日志**: 对照 Import/Configure Appliance 步骤
3. **确认 GA release vs long-haul 环境**
4. **IRVM 问题排查**: 检查 zip 解压、VM capacity、VM import 和启动
5. **网络配置**: 验证 management endpoint 和 ingress endpoint

---

## Scenario 2: ALDO 集成部署排查
> 来源: ado-wiki-a-aldo-deployment-integrated-physical.md | 适用: Mooncake ❌ / Global ✅ (Preview)

### 排查步骤
1. 物理/虚拟集成部署环境验证
2. 检查证书和 PKI 配置
3. 验证 DNS 和网络连通性
4. 确认 appliance 状态和 readiness
