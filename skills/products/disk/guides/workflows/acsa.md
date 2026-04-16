# Disk Azure Container Storage (Arc) — 排查工作流

**来源草稿**: [ado-wiki-a-acsa-faq.md], [ado-wiki-a-acsa-troubleshooting-guide.md], [ado-wiki-common-errors-kubernetes.md]
**Kusto 引用**: 无
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: PVC/Volume 挂载失败排查
> 来源: ado-wiki-a-acsa-troubleshooting-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 检查 Azure Portal 中 PVC/Volume provisioning 的错误信息
2. 查询 PVC 详情
   ```bash
   kubectl describe pvc <PersistentVolumeClaim> -n <namespace>
   ```
   `[来源: ado-wiki-a-acsa-troubleshooting-guide.md]`
3. 检查 VolumeAttachment 状态
   ```bash
   kubectl get volumeattachment
   ```
   `[来源: ado-wiki-a-acsa-troubleshooting-guide.md]`
4. 收集 CSI Controller 日志
   ```bash
   pod=$(kubectl get pod -n kube-system -l app=csi-akshcicsi-controller -o jsonpath="{.items[0].metadata.name}")
   kubectl logs $pod -n kube-system -c akshcicsi > ./csilog.txt
   ```
   `[来源: ado-wiki-a-acsa-troubleshooting-guide.md]`
5. 如果 volume/pod 卡住，强制删除
   ```bash
   kubectl delete pod <pod-name> -n <namespace> --force --grace-period=0
   ```

---

## Scenario 2: CrashLoopBackOff 排查
> 来源: ado-wiki-common-errors-kubernetes.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 识别失败的 Pod
   ```bash
   kubectl get pods -n <namespace>
   ```
2. 描述 Pod 查看事件
   ```bash
   kubectl describe pod <pod-name> -n <namespace>
   ```
3. 检查容器日志（当前 + 上一次运行）
   ```bash
   kubectl logs <pod-name> -n <namespace>
   kubectl logs <pod-name> -n <namespace> --previous
   ```
   `[来源: ado-wiki-common-errors-kubernetes.md]`

---

## Scenario 3: PendingPods 排查
> 来源: ado-wiki-common-errors-kubernetes.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 描述 Pod，检查 Events 中的原因
   ```bash
   kubectl describe pod <pod-name> -n <namespace>
   ```
2. 常见原因判断：
   - `FailedScheduling` → 资源不足
   - `Insufficient cpu/memory` → 节点资源不够
   - `pod has unbound PersistentVolumeClaims` → PVC 未绑定
   - `didn't tolerate node taint` → 节点 taint 问题
3. 检查节点健康状态
   ```bash
   kubectl get nodes
   kubectl describe node <node-name>
   ```
   `[来源: ado-wiki-common-errors-kubernetes.md]`

---

## Scenario 4: CreateContainerConfigError 排查
> 来源: ado-wiki-common-errors-kubernetes.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 查找所有 CreateContainerConfigError 的 Pod
   ```bash
   kubectl get pods -A | grep -i CreateContainerConfigError
   ```
2. 描述 Pod 并检查 Events
   ```bash
   kubectl describe pod <pod-name> -n <namespace>
   kubectl get events -n <namespace> --sort-by='.lastTimestamp' | tail -50
   ```
3. 根据 Events 中的错误判断：
   - `configmap "<name>" not found` → 创建/修复 ConfigMap
   - `secret "<name>" not found` → 创建/修复 Secret
   - `subPath / volumeMount errors` → volume/volumeMount/subPath 不匹配
   - `stat /path ... no such file or directory` → 节点缺少预期路径
   `[来源: ado-wiki-common-errors-kubernetes.md]`

### 补充: 认证方式参考
- 支持 3 种认证方式：OneLake identity、Workload identity (UAMI)、System-assigned extension identity
- Private networking 不支持，Cloud Ingest 依赖 Azure Storage 公共端点
  `[来源: ado-wiki-a-acsa-faq.md]`
