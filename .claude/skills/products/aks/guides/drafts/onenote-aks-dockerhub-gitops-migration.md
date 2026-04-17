# AKS Docker Hub 迁移：使用 Flux GitOps 切换到 ACR

> **来源**: MCVKB 18.36 | 作者: Simon Xin | 日期: 2022-02-11  
> **背景**: 2022-06-30 起 Docker Hub 对 Azure IP 恢复限速，需迁移镜像到 ACR

---

## 问题背景

Docker Hub 对未认证拉取限速：100 pulls/6h（匿名），200 pulls/6h（免费账号）。Microsoft 与 Docker 的豁免协议于 **2022-06-30 到期**。

---

## Step 1: 识别依赖 docker.io 的镜像

启用 Container Insights 后，通过 Log Analytics 查询：

```kusto
let clustername = "<your_cluster_name>";
let timerange = 30m;
ContainerInventory
| where TimeGenerated > ago(timerange)
| where _ResourceId contains clustername and ContainerState !in ('Deleted','Terminated')
| summarize arg_max(TimeGenerated, ContainerState, Repository, Image, ImageTag) by ImageID, _ResourceId
| extend clustername = tostring(split(_ResourceId,'/')[-1])
| extend repository = iif(Repository<>'', Repository, 'docker.io')
| project clustername, repository, Image, ImageTag, ContainerState
```

> Workbook 可视化代码: https://raw.githubusercontent.com/simonxin/cluster-config/main/scripts/aksimageview.json

---

## Step 2: 导入镜像到 ACR

```bash
az acr import \
  --name <your-acr> \
  --source docker.io/library/nginx:latest \
  --image nginx:latest
```

---

## Step 3: 使用 Flux GitOps 管理迁移

### 3.1 部署 Flux 到 AKS
```bash
flux bootstrap git \
  --url=ssh://git@github.com/<org>/cluster-config \
  --branch=main \
  --path=clusters/<cluster-name> \
  --private-key-file <path-to-ssh-key>
```

### 3.2 注册 Git Source 和 Kustomization
```bash
flux create source git podinfo \
  --url=https://github.com/stefanprodan/podinfo \
  --branch=master --interval=30s \
  --export > ./clusters/<cluster-name>/podinfo-source.yaml

flux create kustomization podinfo \
  --target-namespace=default \
  --source=podinfo --path="./kustomize" \
  --prune=true --interval=5m \
  --export > ./clusters/<cluster-name>/podinfo-kustomization.yaml

git add -A && git commit -m "Add podinfo kustomization" && git push
```

### 3.3 Kustomization Patch 替换镜像
创建 patch 文件 `podinfo-updates.yaml`：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: not-used
spec:
  template:
    spec:
      containers:
        - image: <your-acr>.azurecr.cn/podinfo:6.0.3
          name: podinfod
```

在 `kustomization.yaml` 中引用 patch，然后推送：
```bash
git add -A && git commit -m "Replace docker.io image with ACR" && git push
```

### 3.4 触发 Flux 应用
```bash
flux resume kustomization <kustomization-name>
```

---

## 控制 Container Insights 成本

修改 `container-azm-ms-agentconfig.yaml` 关闭日志收集：
```yaml
# 将 collection_settings.stdout/stderr 设为 false
```

```bash
kubectl apply -f container-azm-ms-agentconfig.yaml
```

---

## 参考

- [Container insights agent data collection](https://docs.microsoft.com/en-us/azure/azure-monitor/containers/container-insights-agent-config)
- [Import images to ACR](https://docs.microsoft.com/en-us/azure/container-registry/buffer-gate-public-content#import-images-to-an-azure-container-registry)
- [Flux GitOps docs](https://fluxcd.io/docs/components/source/)
