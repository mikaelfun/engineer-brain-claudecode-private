# ARM Azure Stack Hub 部署与补丁 — 排查工作流

**来源草稿**: ado-wiki-b-bicep.md, mslearn-arm-bicep-what-if-guide.md
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: ASH 补丁/OEM 更新问题
> 来源: ASH deployment 参考 | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 确认 hotfix 版本和兼容性
2. 检查 ECE (Execution Control Engine) 更新日志
3. 分析 OEM update 安装过程中的错误
4. 若涉及 ARM 模板部署 → 参考 arm-deployment-errors 工作流
