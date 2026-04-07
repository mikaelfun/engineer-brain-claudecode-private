---
source: onenote
sourceRef: "MCVKB/VM+SCIM/=======18. AKS=======/18.18 [AKS] A quick way to set up Prometheus + Gra.md"
sourceUrl: null
importDate: "2026-04-04"
type: how-to-guide
---

# AKS Prometheus + Grafana 快速部署指南（Helm）

> **适用**: 需要在 AKS 集群快速搭建监控的场景（非 Azure Monitor managed Prometheus）  
> **Mooncake 注意**: Helm chart 镜像可能需要替换为中国镜像源

## 步骤

### 1. 添加 Helm 仓库

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
```

### 2. 创建命名空间

```bash
kubectl create namespace monitoring
```

### 3. 安装 Prometheus

```bash
helm install prometheus prometheus-community/prometheus \
  --namespace monitoring \
  --set alertmanager.persistentVolume.storageClass="default" \
  --set server.persistentVolume.storageClass="default"
```

### 4. 准备 Grafana 数据源配置

创建 `grafana.yaml`：

```yaml
datasources:
  datasources.yaml:
    apiVersion: 1
    datasources:
    - name: Prometheus
      type: prometheus
      url: http://prometheus-server.monitoring.svc.cluster.local
      access: proxy
      isDefault: true
```

### 5. 安装 Grafana

```bash
helm install grafana grafana/grafana \
  --namespace monitoring \
  --set persistence.storageClassName="default" \
  --set persistence.enabled=true \
  --set adminPassword='YourSecurePassword!' \
  --values grafana.yaml \
  --set service.type=LoadBalancer
```

### 6. 访问 Grafana

```bash
# 获取 LoadBalancer IP
kubectl get service --namespace monitoring grafana

# 登录：admin / <adminPassword>
```

导入预制 Dashboard 模板：在 Grafana UI → Import → 输入模板 ID（如 `6417` for K8s cluster monitoring）。

## 验证

```bash
kubectl get pods -n monitoring
# 期望：prometheus-server, prometheus-alertmanager, grafana 均为 Running
```

## Mooncake 注意事项

- 如果 Helm chart 使用的镜像在 Mooncake 无法拉取，需替换为 `k8sgcr.azk8s.cn` 等中国镜像
- Azure Monitor Managed Prometheus 是更推荐的生产方案，无需自行维护
