# AKS 内部负载均衡器 — health-probe — 排查工作流

**来源草稿**: ado-wiki-a-AGIC-Troubleshooting-Backend-Health-Probe-Issues.md, ado-wiki-custom-health-probes-lb.md
**Kusto 引用**: 无
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting Backend Health Probe Issues
> 来源: ado-wiki-a-AGIC-Troubleshooting-Backend-Health-Probe-Issues.md | 适用: 适用范围未明确

### 排查步骤

#### Troubleshooting Backend Health Probe Issues

Azure Application Gateway relies on health probes to monitor backend pool resources. This guide covers troubleshooting when probes fail and backends are marked Unhealthy.

#### [1] Check backend health detailed status

- Azure Portal: Application Gateway > Monitoring > Backend health
- ASC: Backend Address Pools panel

#### [2] Check if backend pods have liveness/readiness probes

```bash
kubectl describe pod <POD_NAME> -n <NAMESPACE>
```

CSS: Use Jarvis Action (LockboxCustomerClusterRunKubectlDescribe).

#### [3] With liveness/readiness probes defined

AGIC infers health probe config from pod probes. Limitations:
- Only httpGet based probes supported
- Cannot probe on different port than exposed
- HttpHeaders, InitialDelaySeconds, SuccessThreshold not supported

**Fix**: Modify probe path to one returning 200-399, or modify application to respond correctly.

#### [4] Without liveness/readiness probes

AGIC uses:
1. `appgw.ingress.kubernetes.io/backend-path-prefix` annotation (if set)
2. Path from ingress rule spec

**Fix**: Add/modify backend-path-prefix annotation. Use `health-probe-status-codes` annotation to accept additional codes (e.g. 404).

#### [5] Health probe timeout

Priority: Pod liveness probe timeout > `health-probe-timeout` annotation > Default (30s).

#### [6] VNET peering issues

Required when AKS and AppGW in different VNETs. Check: Provision State = Succeeded, Peering State = Connected.

#### [7] NSG/routing issues

Use Connection troubleshoot: AppGW > Monitoring > Connection troubleshoot. Specify backend pod IP + port.
CSS: ASC > AppGW VM > Diagnostics > Test Traffic.

---

## Scenario 2: Customizing Load Balancer Health Probe Configuration
> 来源: ado-wiki-custom-health-probes-lb.md | 适用: 适用范围未明确

### 排查步骤

#### Customizing Load Balancer Health Probe Configuration

#### Summary

Azure Cloud Provider for Kubernetes allows customizing health probe configuration for LoadBalancer services via annotations. This enables using a dedicated health endpoint for probing multiple service ports.

#### Key Annotations

Use per-port annotations to customize health probe port, protocol, and path:

```yaml
annotations:
  service.beta.kubernetes.io/port_{PORT}_health-probe_protocol: "http"
  service.beta.kubernetes.io/port_{PORT}_health-probe_port: "{PROBE_PORT}"
  service.beta.kubernetes.io/port_{PORT}_health-probe_request-path: "/healthz/ready"
```

#### How It Works

- By default, each port in a LoadBalancer service gets its own health probe
- You can redirect health probes for multiple ports to a single dedicated health endpoint
- Each port's probe configuration (protocol, port, path) can be independently customized

#### Example

Service exposing ports 3614, 3615, 3616 — redirect health probes for 3614 and 3615 to use port 3616's `/healthz/ready` endpoint:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: websvc-3
  annotations:
    service.beta.kubernetes.io/port_3614_health-probe_protocol: "http"
    service.beta.kubernetes.io/port_3614_health-probe_port: "3616"
    service.beta.kubernetes.io/port_3614_health-probe_request-path: "/healthz/ready"
    service.beta.kubernetes.io/port_3615_health-probe_protocol: "http"
    service.beta.kubernetes.io/port_3615_health-probe_port: "3616"
    service.beta.kubernetes.io/port_3615_health-probe_request-path: "/healthz/ready"
spec:
  ports:
    - name: http1
      port: 3614
      targetPort: 3614
      appProtocol: http
    - name: http2
      port: 3615
      targetPort: 3615
      appProtocol: http
    - name: http-probe
      port: 3616
      targetPort: 3616
      appProtocol: http
  selector:
    app: websvc-3
  type: LoadBalancer
```

#### References

- [Azure Cloud Provider - LoadBalancer](https://cloud-provider-azure.sigs.k8s.io/topics/loadbalancer/)
- [Custom health probes feature PR](https://github.com/kubernetes-sigs/cloud-provider-azure/pull/2452)
- [AKS LB annotations docs](https://learn.microsoft.com/en-us/azure/aks/load-balancer-standard#customizations-via-kubernetes-annotations)

---
