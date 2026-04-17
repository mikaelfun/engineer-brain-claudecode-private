# Networking AGC 部署与配置 — 综合排查指南

**条目数**: 24 | **草稿融合数**: 17 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-a-agc-ingress-annotations.md], [ado-wiki-a-wsl-agc-lab-install-part1.md], [ado-wiki-agc-env-info-gathering.md], [ado-wiki-agc-log-sources.md], [ado-wiki-agc-training-lab-aks-app-deployment.md], [ado-wiki-agc-training-lab-alb-deployment.md], [ado-wiki-agc-training-lab-gateway-route.md], [ado-wiki-agc-training-lab-initial-troubleshooting.md], [ado-wiki-agc-training-lab-terraform.md], [ado-wiki-b-agc-training-00-prerequisites.md]...
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: 网络与路由
> 来源: ado-wiki

1. **AGC HTTPRoute cannot reference backend Service in a different AKS namespace - cross-namespace backend reference fails si**
   - 根因: AKS namespaces are isolated by default and do not allow cross-namespace references for general objects. Without a ReferenceGrant, HTTPRoute in one namespace cannot reach a Service in another namespace.
   - 方案: Create a ReferenceGrant resource in the destination namespace (where the backend Service lives) that explicitly allows the HTTPRoute from the source namespace to reference the Service. Example: kind: ReferenceGrant, from: HTTPRoute in source-namespace, to: Service in destination-namespace.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/How%20To/Cross-namespace%20references%20and%20how%20to%20allow%20them%20inside%20of%20AKS)`

2. **Application Gateway for Containers returns HTTP 500 error for all requests even though Gateway and HTTPRoute are configu**
   - 根因: AKS namespace isolation prevents an HTTPRoute in one namespace (e.g., azure-alb-system) from referencing backend Services in a different namespace (e.g., application-deployment) without an explicit ReferenceGrant permission object
   - 方案: Create a ReferenceGrant object in the backend service namespace: apiVersion: gateway.networking.k8s.io/v1beta1, kind: ReferenceGrant, metadata: {name: <name>, namespace: <backend-ns>}, spec: {from: [{group: gateway.networking.k8s.io, kind: HTTPRoute, namespace: <alb-ns>}], to: [{group: '', kind: Service}]}
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Training%20-%20AGC%20Configuration%20Lab/04%20-%20Gateway%20and%20Route%20deployment)`

3. **AGC CNI Overlay provisioning fails or subnet delegation returns error due to incorrect subnet prefix size**
   - 根因: The Application Gateway for Containers subnet must be exactly /24 prefix. A larger or smaller prefix is not supported
   - 方案: Resize or recreate the AGC subnet to use a /24 prefix and ensure subnet delegation is enabled
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Features/Feature%3A%20CNI%20Overlay%20Support)`

4. **AGC returns HTTP 500 due to invalid backend entries in HTTPRoute - backend references unknown/unsupported resource kind,**
   - 根因: HTTPRoute backend references an invalid resource: unknown kind (InvalidKind), missing resource (BackendNotFound), or cross-namespace ref without ReferenceGrant (RefNotPermitted). If multiple backends with equal weights and one is invalid, 50% of traffic returns 500.
   - 方案: Check HTTPRoute status conditions for InvalidKind/BackendNotFound/RefNotPermitted. Fix backend references: ensure correct resource kind, verify backend exists, or create ReferenceGrant for cross-namespace references.
   `[结论: 🟢 7.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Troubleshooting%20Guides/TSG:%20Data%20plane%20and%20Performance%20Troubleshooting%20flow%20for%20Application%20Gateway%20for%20Containers)`

5. **AGC returns HTTP 500 because no endpoints found for all backends referenced in HTTPRoute**
   - 根因: All backends referenced in the HTTPRoute have zero endpoints (no running pods matching the backend service selectors)
   - 方案: Verify backend pods are running and healthy with matching selectors. Check endpoint slices: kubectl get endpointslices -n <namespace>. Ensure pods have correct labels matching Service selectors.
   `[结论: 🟢 7.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Troubleshooting%20Guides/TSG:%20Data%20plane%20and%20Performance%20Troubleshooting%20flow%20for%20Application%20Gateway%20for%20Containers)`

6. **AGC returns HTTP 503 - backend is not reachable or not healthy**
   - 根因: Backend is unreachable due to: (1) association subnet not in same VNet as AKS cluster, or (2) backend health probe failing
   - 方案: 1. Verify association subnet is in same VNet as AKS cluster. 2. Check backend healthy targets via Traffic Stats dashboard (Jarvis). 3. Check backend health probe logging in Jarvis TrafficController/BackendServerDiagnosticHistory. 4. Validate health probe config via HealthCheckPolicy YAML or pod ReadinessProbe (path, port, protocol).
   `[结论: 🟢 7.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Troubleshooting%20Guides/TSG:%20Data%20plane%20and%20Performance%20Troubleshooting%20flow%20for%20Application%20Gateway%20for%20Containers)`

7. **AGC returns HTTP 404 - no HTTPRoute matches the incoming request host/path/query combination**
   - 根因: No HTTPRoute is configured that matches the request's host, path, and query parameters, or the HTTPRoute has error conditions preventing it from being programmed
   - 方案: 1. Verify an HTTPRoute exists matching the request host/path/query. 2. Check HTTPRoute status for Accepted and Ready conditions. 3. Fix any error conditions reported in HTTPRoute status. 4. Check ALB Controller logs for configuration errors.
   `[结论: 🟢 7.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Troubleshooting%20Guides/TSG:%20Data%20plane%20and%20Performance%20Troubleshooting%20flow%20for%20Application%20Gateway%20for%20Containers)`

### Phase 2: 配置问题
> 来源: ado-wiki

1. **AGC: Customer asks about connectivity and throughput limits for AGC that are not publicly documented**
   - 根因: Max numbers are subjective to different configurations and request characteristics (size, protocol, etc.) and are therefore not publicly documented
   - 方案: Advise the customer to run their own performance/load tests using tools such as 'hey' (https://github.com/rakyll/hey) or 'vegeta' (https://github.com/tsenart/vegeta) against their specific gateway configuration
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/How%20To/Responding%20to%20requests%20about%20AGC%20limits%20that%20are%20not%20documented%20publicly)`

2. **AGC Gateway API YAML misconfiguration: gateway/httproute/backendtlspolicy/applicationloadbalancer shows errors in status**
   - 根因: Invalid configuration in Gateway API YAML resources (e.g. invalid hostname format, conflicting listener config)
   - 方案: Check status section of Kubernetes resources using 'kubectl get <resource> -A -o yaml' (gateway, httproute, backendtlspolicy, applicationloadbalancer). Fix the reported configuration errors in the YAML definitions.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Troubleshooting%20Guides/TSG%3A%20Configuration%20Troubleshooting%20flow%20for%20Application%20Gateway%20for%20Containers)`

3. **WebSocket connections dropped mid-session; large file uploads fail unexpectedly with connection resets; long-lived HTTP **
   - 根因: AGIC monitors Kubernetes resources and triggers a PUT operation on Application Gateway whenever any Kubernetes config changes. Every PUT operation on Application Gateway triggers a reload of the NGINX service, which resets all existing connections. With AGIC continuously applying configuration updates, connection resets are more frequent than with manually managed Application Gateways.
   - 方案: Migrate to Application Gateway for Containers (AGC) as an alternative. AGC is designed to better support WebSockets, large file uploads, and long-lived connections by avoiding connection disruptions caused by configuration reloads. As a workaround for AGIC: minimize unnecessary Kubernetes resource changes that trigger AGIC reconciliation.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FAGIC%20Application%20Gateway%20Ingress%20Controller%2FWebSockets%2C%20long-Lived%20Connections%20and%20Large%20file%20upload)`

4. **ALB Controller fails to start or reports invalid configuration (error codes E1000-E1005): invalid command line arguments**
   - 根因: Invalid ALB Controller startup parameters or internal component initialization failure
   - 方案: Verify ALB Controller deployment arguments and log level settings (valid: panic/fatal/error/warn/info/debug/trace/disabled). For internal errors (E1002-E1005), check controller pod logs and redeploy if needed.
   `[结论: 🟢 7.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)%2FTroubleshooting%20Guides%2FTSG%3A%20ALB%20Error%20Codes%20in%20Application%20Gateway%20for%20Containers)`

5. **AGC configuration build errors (E2000-E2005): invalid default backend for Ingress, invalid rule path/type, invalid port,**
   - 根因: Misconfigured Ingress YAML - invalid backend service reference, unsupported rule path type, undefined port, or unsupported session affinity type
   - 方案: Verify Ingress YAML: ensure default backend references a valid K8s Service, rules have valid paths with supported types, service ports are defined, and session affinity type is 'application-cookie' or 'managed-cookie'.
   `[结论: 🟢 7.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)%2FTroubleshooting%20Guides%2FTSG%3A%20ALB%20Error%20Codes%20in%20Application%20Gateway%20for%20Containers)`

6. **AGC Kubernetes resource not found errors (E3000-E3017): missing endpoint slices, nodes, services, namespaces, pods, secr**
   - 根因: Required Kubernetes resources referenced in AGC configuration do not exist on the cluster
   - 方案: Create the missing Kubernetes resources as indicated in the error message. Common fixes: create endpoint slices for services, ensure at least one running node/pod, create required secrets, verify GatewayClass/IngressClass exist, create ReferenceGrants for cross-namespace references.
   `[结论: 🟢 7.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)%2FTroubleshooting%20Guides%2FTSG%3A%20ALB%20Error%20Codes%20in%20Application%20Gateway%20for%20Containers)`

7. **AGC ARM CRUD operation failures (E4000-E4005): invalid ARM resource ID, failed to create/delete managed Frontend, failed**
   - 根因: Invalid ARM resource ID format or internal ARM CRUD operation failure in the AGC service
   - 方案: For E4000: verify the ARM resource ID format is valid. For E4001-E4005 (internal errors): check ARM activity logs, verify RBAC permissions on the AGC resource, and escalate to PG if the issue persists.
   `[结论: 🟢 7.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)%2FTroubleshooting%20Guides%2FTSG%3A%20ALB%20Error%20Codes%20in%20Application%20Gateway%20for%20Containers)`

### Phase 3: 其他
> 来源: ado-wiki

1. **AGC: Mixing BYO and ManagedBy Gateway YAML references breaks frontend - using URI reference (BYO) together with name/nam**
   - 根因: BYO AGC references the AGC resource URI in Gateway YAML, while ManagedBy references the ALB name and namespace. Mixing or using all three reference styles in the same Gateway causes the frontend to break.
   - 方案: Ensure consistent Gateway YAML reference style: use only URI-based reference (infrastructureRef) for BYO deployments, or only name/namespace-based reference for ManagedBy deployments. Do not mix reference styles.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/How%20To/2-%20BYO%20and%20ManagedBy%20AGC%20-%20How%20to%20tell%2C%20why%20it%20matters%2C%20and%20how%20it%20affects%20WAF%20(Part%202%20of%20video%20series))`

2. **AGC: Customer requests to enable FIPS on Application Gateway for Containers but no self-service option available**
   - 根因: FIPS requires a feature flag to be enabled at the subscription level by the product group; it is not enabled by default and cannot be self-service toggled
   - 方案: Submit a Sev3 ICM to PG using ASC Application Gateway for Containers templates to request FIPS feature flag enablement on the subscription. Verify status using the Jarvis Action. Note: once enabled, all newly provisioned gateways will use FIPS and individual gateways cannot revert to non-FIPS mode.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/How%20To/How%20To%20Enable%20FIPS%20on%20Application%20Gateway%20for%20Containers)`

3. **AGC: Customer wants to restrict/limit clients that can connect to AGC to only traffic from a specific Azure Front Door p**
   - 根因: AGC does not natively support direct client IP restriction or access control lists
   - 方案: Use Gateway API HTTPRoute conditional routing with X-Azure-FDID header matching. Configure HTTPRoute with a header match rule for X-Azure-FDID set to the Front Door profile ID, and do NOT define a default backendRef. Traffic not matching the header condition will receive a 404 response.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/How%20To/Limiting%20clients%20that%20can%20connect%20to%20AGC%20to%20a%20Front%20Door%20profile)`

4. **AGC migration script (Ingress YAML to Gateway API YAML) produces unexpected output or fails in ManagedBy scenario**
   - 根因: The migration script assumes the ApplicationLoadBalancer resource has not been created yet in ManagedBy scenarios; if it already exists, the script behavior is unexpected
   - 方案: Ensure the ApplicationLoadBalancer resource has NOT been created before running the migration script for ManagedBy AGC. Migration script is available at: https://github.com/Azure/Application-Gateway-for-Containers-Migration-Utility
   `[结论: 🟢 7.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/How%20To/3-%20AGC%20Migration%20Script%20and%20usage%20(Part%203%20of%20video%20series))`

### Phase 4: 证书与密钥
> 来源: ado-wiki

1. **AGC: Azure Key Vault with Secrets Store CSI driver does not work for mounting SSL certificates into AGC - certificates c**
   - 根因: AGC requires certificates to be local to the AKS cluster as Kubernetes secrets. Certificates mounted into volumes via AKV Secrets Store CSI driver are not supported by AGC.
   - 方案: Manually import SSL certificates into AKS using kubectl: 1) Extract private key from PFX with openssl pkcs12, 2) Decrypt the key with openssl rsa, 3) Extract public chain with openssl pkcs12 -clcerts -nokeys, 4) Create kubernetes TLS secret: kubectl create secret tls <name> -n <namespace> --cert public.crt --key decrypted.key. Place the secret in the same namespace as the ALB Controller.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/How%20To/Working%20with%20SSL%20certificates%20inside%20of%20AKS)`

2. **openssl pkcs12 command fails or produces errors when extracting private key from a PFX file encrypted with 3DES-SHA1 on **
   - 根因: OpenSSL 3.0+ moved legacy cryptographic algorithms (including 3DES-SHA1) to a separate legacy provider not loaded by default; standard pkcs12 commands cannot process these older PFX encryption formats without explicitly enabling the legacy provider
   - 方案: Add -legacy and -provider-path flags to openssl pkcs12 command: openssl pkcs12 -in example.pfx -nocerts -out key.key -legacy -provider-path C:\path\to\legacy\provider. For AES256-SHA256 encrypted PFX files, no legacy flags are needed.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Training%20-%20AGC%20Configuration%20Lab/03%20-%20ALB%20Deployment)`

### Phase 5: 已知问题与限制
> 来源: ado-wiki

1. **AGC CNI Overlay configuration fails when using Kubenet networking in AKS**
   - 根因: Kubenet is not supported by Application Gateway for Containers; only Azure CNI is supported
   - 方案: Switch from Kubenet to Azure CNI (e.g., Azure CNI for dynamic IP allocation or Azure CNI for static block allocation) when deploying AGC with CNI Overlay
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Features/Feature%3A%20CNI%20Overlay%20Support)`

2. **AGC CNI Overlay not working due to ALB controller version incompatibility**
   - 根因: Minimum ALB controller version required for CNI Overlay support is 1.4.12 (publicly documented preferred version: 1.5.0). Older versions do not support CNI Overlay.
   - 方案: Upgrade the ALB controller to at least version 1.4.12; preferred version is 1.5.0 or later
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Features/Feature%3A%20CNI%20Overlay%20Support)`

### Phase 6: 权限与认证
> 来源: ado-wiki

1. **AGC ALB Controller cannot deploy or manage routing rules due to workload identity misconfiguration**
   - 根因: Workload identity environment variables (AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_FEDERATED_TOKEN_FILE) not set correctly on ALB Controller pod, or identity lacks required role assignments ('Azure Traffic Controller Configuration Manager')
   - 方案: 1) Verify env vars on ALB controller pod: kubectl get pod -n azure-alb-system -l app=alb-controller -o jsonpath='{.items[0].spec.containers[0].env}'. 2) Check role assignments: for BYO — identity needs 'Azure Traffic Controller Configuration Manager' on AGC resource; for managed — identity needs 'Azure Traffic Controller Configuration Manager' + Contributor on MC resource group. 3) If roles are present, check ALB Controller and Control Plane logs.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Troubleshooting%20Guides/TSG%3A%20Configuration%20Troubleshooting%20flow%20for%20Application%20Gateway%20for%20Containers)`

### Phase 7: 性能与超时
> 来源: ado-wiki

1. **AGC gRPC/service connectivity failures (E5000-E5003): failed to connect via gRPC, internal errors, timeout waiting for d**
   - 根因: gRPC connectivity failure between ALB Controller and AGC service, or service-side timeout/internal error
   - 方案: Check AGC service health and network connectivity. For E5000: verify gRPC endpoint is reachable. For E5001-E5003 (internal/timeout errors): check AGC resource status in Azure Portal, review ARM activity logs, and escalate to PG.
   `[结论: 🟢 7.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)%2FTroubleshooting%20Guides%2FTSG%3A%20ALB%20Error%20Codes%20in%20Application%20Gateway%20for%20Containers)`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | AGC: Mixing BYO and ManagedBy Gateway YAML references bre... | BYO AGC references the AGC resource URI in Gate... | Ensure consistent Gateway YAML reference style:... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/How%20To/2-%20BYO%20and%20ManagedBy%20AGC%20-%20How%20to%20tell%2C%20why%20it%20matters%2C%20and%20how%20it%20affects%20WAF%20(Part%202%20of%20video%20series)) |
| 2 | AGC HTTPRoute cannot reference backend Service in a diffe... | AKS namespaces are isolated by default and do n... | Create a ReferenceGrant resource in the destina... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/How%20To/Cross-namespace%20references%20and%20how%20to%20allow%20them%20inside%20of%20AKS) |
| 3 | AGC: Customer requests to enable FIPS on Application Gate... | FIPS requires a feature flag to be enabled at t... | Submit a Sev3 ICM to PG using ASC Application G... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/How%20To/How%20To%20Enable%20FIPS%20on%20Application%20Gateway%20for%20Containers) |
| 4 | AGC: Customer wants to restrict/limit clients that can co... | AGC does not natively support direct client IP ... | Use Gateway API HTTPRoute conditional routing w... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/How%20To/Limiting%20clients%20that%20can%20connect%20to%20AGC%20to%20a%20Front%20Door%20profile) |
| 5 | AGC: Customer asks about connectivity and throughput limi... | Max numbers are subjective to different configu... | Advise the customer to run their own performanc... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/How%20To/Responding%20to%20requests%20about%20AGC%20limits%20that%20are%20not%20documented%20publicly) |
| 6 | AGC: Azure Key Vault with Secrets Store CSI driver does n... | AGC requires certificates to be local to the AK... | Manually import SSL certificates into AKS using... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/How%20To/Working%20with%20SSL%20certificates%20inside%20of%20AKS) |
| 7 | AGC Gateway API YAML misconfiguration: gateway/httproute/... | Invalid configuration in Gateway API YAML resou... | Check status section of Kubernetes resources us... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Troubleshooting%20Guides/TSG%3A%20Configuration%20Troubleshooting%20flow%20for%20Application%20Gateway%20for%20Containers) |
| 8 | AGC ALB Controller cannot deploy or manage routing rules ... | Workload identity environment variables (AZURE_... | 1) Verify env vars on ALB controller pod: kubec... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Troubleshooting%20Guides/TSG%3A%20Configuration%20Troubleshooting%20flow%20for%20Application%20Gateway%20for%20Containers) |
| 9 | openssl pkcs12 command fails or produces errors when extr... | OpenSSL 3.0+ moved legacy cryptographic algorit... | Add -legacy and -provider-path flags to openssl... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Training%20-%20AGC%20Configuration%20Lab/03%20-%20ALB%20Deployment) |
| 10 | Application Gateway for Containers returns HTTP 500 error... | AKS namespace isolation prevents an HTTPRoute i... | Create a ReferenceGrant object in the backend s... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Training%20-%20AGC%20Configuration%20Lab/04%20-%20Gateway%20and%20Route%20deployment) |
| 11 | WebSocket connections dropped mid-session; large file upl... | AGIC monitors Kubernetes resources and triggers... | Migrate to Application Gateway for Containers (... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FAGIC%20Application%20Gateway%20Ingress%20Controller%2FWebSockets%2C%20long-Lived%20Connections%20and%20Large%20file%20upload) |
| 12 | AGC CNI Overlay configuration fails when using Kubenet ne... | Kubenet is not supported by Application Gateway... | Switch from Kubenet to Azure CNI (e.g., Azure C... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Features/Feature%3A%20CNI%20Overlay%20Support) |
| 13 | AGC CNI Overlay provisioning fails or subnet delegation r... | The Application Gateway for Containers subnet m... | Resize or recreate the AGC subnet to use a /24 ... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Features/Feature%3A%20CNI%20Overlay%20Support) |
| 14 | AGC CNI Overlay not working due to ALB controller version... | Minimum ALB controller version required for CNI... | Upgrade the ALB controller to at least version ... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Features/Feature%3A%20CNI%20Overlay%20Support) |
| 15 | AGC returns HTTP 500 due to invalid backend entries in HT... | HTTPRoute backend references an invalid resourc... | Check HTTPRoute status conditions for InvalidKi... | 🟢 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Troubleshooting%20Guides/TSG:%20Data%20plane%20and%20Performance%20Troubleshooting%20flow%20for%20Application%20Gateway%20for%20Containers) |
| 16 | AGC returns HTTP 500 because no endpoints found for all b... | All backends referenced in the HTTPRoute have z... | Verify backend pods are running and healthy wit... | 🟢 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Troubleshooting%20Guides/TSG:%20Data%20plane%20and%20Performance%20Troubleshooting%20flow%20for%20Application%20Gateway%20for%20Containers) |
| 17 | AGC returns HTTP 503 - backend is not reachable or not he... | Backend is unreachable due to: (1) association ... | 1. Verify association subnet is in same VNet as... | 🟢 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Troubleshooting%20Guides/TSG:%20Data%20plane%20and%20Performance%20Troubleshooting%20flow%20for%20Application%20Gateway%20for%20Containers) |
| 18 | AGC returns HTTP 404 - no HTTPRoute matches the incoming ... | No HTTPRoute is configured that matches the req... | 1. Verify an HTTPRoute exists matching the requ... | 🟢 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Troubleshooting%20Guides/TSG:%20Data%20plane%20and%20Performance%20Troubleshooting%20flow%20for%20Application%20Gateway%20for%20Containers) |
| 19 | AGC migration script (Ingress YAML to Gateway API YAML) p... | The migration script assumes the ApplicationLoa... | Ensure the ApplicationLoadBalancer resource has... | 🟢 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/How%20To/3-%20AGC%20Migration%20Script%20and%20usage%20(Part%203%20of%20video%20series)) |
| 20 | ALB Controller fails to start or reports invalid configur... | Invalid ALB Controller startup parameters or in... | Verify ALB Controller deployment arguments and ... | 🟢 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)%2FTroubleshooting%20Guides%2FTSG%3A%20ALB%20Error%20Codes%20in%20Application%20Gateway%20for%20Containers) |
| 21 | AGC configuration build errors (E2000-E2005): invalid def... | Misconfigured Ingress YAML - invalid backend se... | Verify Ingress YAML: ensure default backend ref... | 🟢 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)%2FTroubleshooting%20Guides%2FTSG%3A%20ALB%20Error%20Codes%20in%20Application%20Gateway%20for%20Containers) |
| 22 | AGC Kubernetes resource not found errors (E3000-E3017): m... | Required Kubernetes resources referenced in AGC... | Create the missing Kubernetes resources as indi... | 🟢 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)%2FTroubleshooting%20Guides%2FTSG%3A%20ALB%20Error%20Codes%20in%20Application%20Gateway%20for%20Containers) |
| 23 | AGC ARM CRUD operation failures (E4000-E4005): invalid AR... | Invalid ARM resource ID format or internal ARM ... | For E4000: verify the ARM resource ID format is... | 🟢 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)%2FTroubleshooting%20Guides%2FTSG%3A%20ALB%20Error%20Codes%20in%20Application%20Gateway%20for%20Containers) |
| 24 | AGC gRPC/service connectivity failures (E5000-E5003): fai... | gRPC connectivity failure between ALB Controlle... | Check AGC service health and network connectivi... | 🟢 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)%2FTroubleshooting%20Guides%2FTSG%3A%20ALB%20Error%20Codes%20in%20Application%20Gateway%20for%20Containers) |
