# AKS Cilium 网络策略与可观测性 — 排查工作流

**来源草稿**: ado-wiki-a-Cilium-L3-L4-Network-Policies.md, ado-wiki-a-Cilium-L7-Network-Policies.md, ado-wiki-a-cilium-fqdn-policy.md, ado-wiki-acr-tasks-network-bypass-policy.md, ado-wiki-intro-to-cilium-and-aks.md
**Kusto 引用**: 无
**场景数**: 6
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting Flow
> 来源: ado-wiki-a-Cilium-L3-L4-Network-Policies.md | 适用: 适用范围未明确

### 排查步骤

##### Verify Policy Configuration & Definition

```bash
kubectl get ciliumnetworkpolicy -A
kubectl describe ciliumnetworkpolicy <policy-name> -n <namespace>
```

- Check to see intention of each policy and the actual behaviour of the policy to find any misconfigurations
- If the policy doesn't show in the list, a syntactical issue may have prevented it from being applied
- Check if Valid is True or False next to the policy -> if it is false, there is probably a misconfiguration in the policy

##### Example CiliumNetworkPolicy (CNP)

```yaml
apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: allow-http
  namespace: default
spec:
  endpointSelector:
    matchLabels:
      app: my-app
  ingress:
  - fromEndpoints:
    - matchLabels:
        app: frontend
    toPorts:
    - ports:
      - port: "80"
        protocol: TCP
```

##### Validate Label Matching & Namespaces

Review the `endpointSelector` in the CNP to ensure it matches intended pods

- Verify that the labels used in policies match the labels assigned to endpoints
- Ensure that the policy is applied in the desired namespace as CNPs are namespace scoped

##### Check Endpoints

```bash
#### Check which cilium pod corresponds to the node that the endpoint is on
kubectl get pods -A -o wide
kubectl exec -n kube-system [cilium-pod] -- cilium endpoint list
```

- Examine the Policy(ingress) enforcement & Policy(egress) enforcement sections to see if they are enabled or disabled

Example:
```txt
ENDPOINT   POLICY ENFORCEMENT (ingress)   POLICY ENFORCEMENT (egress)   IDENTITY   LABELS
299        Enabled                         Disabled                     29284        k8s:name=server
```

##### Policy Overlaps

- If there are multiple network policies on the cluster, check in each policy if there are any overlapping rules that might conflict with each other.
- Gradually apply each Policy to monitor the impact of each policy

##### Network Observability Quality Dashboard

- Look at the [Network Observability Quality Dashboard - Cilium Alerts Section](https://dataexplorer.azure.com/dashboards/13f5e22d-9fa9-4ecb-a9f5-af80ea72f14a)
- Take a look at AzureCiliumAgentCrashing, AzureCiliumAgentNotReady, AzureCiliumOperatorNotReady

##### Examine Cilium Agent Logs for Errors

```bash
kubectl logs -n kube-system daemonset/cilium | grep <policy-name>
```

- Look for any policy parse errors or warnings.
- If the policy is not appearing in logs, there may be a syntax issue.

##### Run Connectivity Tests

Run e2e Cilium Connectivity Tests by installing [Cilium CLI](https://github.com/cilium/cilium-cli)

```bash
cilium install
cilium connectivity test
```

##### Pinging Test

```bash
kubectl exec -it [pod] -- /bin/sh
ping <target ip or domain>
```

Depending on the intended behavior of the CNP, the ping command succeeding or failing will give an idea whether the policy is working correctly.

---

## Scenario 2: Cilium Layer 7 Network Policies
> 来源: ado-wiki-a-Cilium-L7-Network-Policies.md | 适用: 适用范围未明确

### 排查步骤

#### Cilium Layer 7 Network Policies

If you're troubleshooting Layer 7 (L7) network policy issues in an Azure Kubernetes Service (AKS) cluster using Managed Cilium offering, follow these structured steps to diagnose and resolve the problem.

Envoy, which is used for Layer 7 Policy enforcement will run as a separate daemonset in ACNS offering. It will be part of `acns-security-agent` pod which also hosts the SDP Proxy container. Before you proceed with debugging any issues tied to Layer 7 policy enforcement, it is critical you make sure the Envoy(Cilium-Proxy) container in `acns-security-agent` pod is up and running.

#### Check to see if L7 Network Policies are enabled on cluster

Currently in ASC, it is only displaying enum values for the feature:
- Unspecified=0
- Invalid=1
- None=2 (no L7 network policies can be applied)
- L7=3 (all types of L7 network policies, including FQDN)
- FQDN=4 (only FQDN network policies)

#### Verify if the L7 Policy is Applied

1. Check if the policy exists and is correctly defined:

```bash
kubectl get ciliumnetworkpolicy -A
kubectl describe ciliumnetworkpolicy <policy-name> -n <namespace>
```

- Ensure the policy includes correct HTTP/gRPC/Kafka rules, methods, paths, or topics.
- CNPs are namespace scoped resources.

2. Check which pods the policy applies to:
- Confirm endpointSelector matches intended pods.
- If no matching pods are listed, the policy is not being applied.

#### Use Hubble to Inspect Traffic and Policy Enforcement

##### Check real-time network flows

```bash
hubble observe --verdict DROPPED
```

- If traffic is missing, it might be blocked at L3/L4 instead of L7.

##### Filter for specific protocols

```bash
hubble observe --protocol http
hubble observe --protocol kafka
hubble observe --pod <pod-name> --protocol http
```

- If a request is allowed: FORWARDED; if blocked: DROPPED.

##### Check for policy misconfigurations

```bash
hubble observe --from-pod <pod-name> -f
```

Ref: https://docs.cilium.io/en/stable/observability/hubble/hubble-cli/

#### Examine Cilium Agent Logs for Errors

```bash
kubectl logs -n kube-system daemonset/cilium | grep <policy-name>
```

- Look for policy parse errors or warnings.
- If policy not appearing in logs, there may be a syntax issue.

#### Inspect Envoy Proxy Logs and Metrics

```bash
kubectl logs -n <acns-security-agent> --container cilium-envoy
```

- Look for 403 Forbidden or connection errors.
- TLS handshake failures: check if traffic is encrypted (Cilium cannot inspect encrypted traffic by default).

#### Debugging Protocol-Specific Issues

##### HTTP Issues
- Confirm allowed methods and paths: `hubble observe --protocol http`
- Check for missing method/path in policy
- Common failure signs:
  - 403 Forbidden: Policy denied the request
  - DROPPED (HTTP PUT /path): Method not allowed

##### gRPC Issues
- gRPC calls appear as HTTP/2 POST requests
- Verify the path in the policy matches /Service/Method
- Common errors:
  - PERMISSION_DENIED: Policy blocked it
  - UNAVAILABLE: Could be L3/L4 issue
- Use fully qualified gRPC service names in policy
- If mTLS is used, L7 rules won't work

##### Kafka Issues
- Check: `hubble observe --protocol kafka --verdict DROPPED`
- Common errors:
  - TOPIC_AUTHORIZATION_FAILED: Topic not allowed by policy
- Ensure topic names match exactly
- Kafka encryption (TLS/SASL) can bypass Cilium L7 filtering - use L4 rules instead

#### Check Performance and Resource Issues

```bash
kubectl top pods -n kube-system | grep acns-security-agent
```

- If CPU is high, suggest migrating to higher SKUs for worker nodes.

#### Final Steps

- Traffic missing from Hubble logs: may be blocked at L3/L4
- Policy seems ignored: double-check endpointSelector
- Requests are slow: scale up Cilium or reduce policy complexity

#### References

- [Documentation](https://learn.microsoft.com/en-us/azure/aks/azure-cni-powered-by-cilium?source=recommendations#network-policy-enforcement)

---

## Scenario 3: Troubleshooting Flow
> 来源: ado-wiki-a-cilium-fqdn-policy.md | 适用: 适用范围未明确

### 排查步骤

##### 1. Configuration Check

```sh
kubectl get cm cilium-config -n kube-system -o jsonpath='{.data.enable-l7-proxy}'
#### Must be "true"
kubectl get cm cilium-config -n kube-system -o jsonpath='{.data.disable-embedded-dns-proxy} {.data.enable-standalone-dns-proxy} {.data.tofqdns-proxy-port} {.data.tofqdns-server-port}'
#### Expected: true true 40046 40045
```

##### 2. Connectivity Check

```sh
kubectl logs -n kube-system -l name=fqdn-policy
kubectl logs -n kube-system -l k8s-app=cilium | grep fqdn/server
#### On node:
ss -tunpa | grep 40045  # grpc server
ss -tunpa | grep 40046  # dns proxy
```

##### 3. CNP Validation

```sh
kubectl logs -n kube-system -l k8s-app=cilium | grep "Invalid CiliumNetworkPolicy spec"
kubectl logs -n kube-system <fqdn-policy-pod> | grep "Received DNS rule"
```

Only DNS protocol supported (no HTTP/Kafka/other L7). Dual stack and k8s service names not supported.

##### 4. DNS Redirection Check

```sh
iptables -t mangle -L CILIUM_PRE_mangle
#### Should show TPROXY rules to 127.0.0.1:40046
kubectl logs -n kube-system <fqdn-policy-pod> | grep "fqdn/dnsproxy"
```

Issues:
* **Endpoint ID/Identity not found**: cilium agent not writing to bpf maps (cilium_lxc, cilium_ipcache)
* **DNS resolution failed**: check core-dns pods, verify CNP selects correct kube-dns pods
* **Stream closed**: DNS response not forwarded due to connection loss

##### 5. Traffic Allow/Deny

```sh
kubectl get cep <pod_name> -o jsonpath='{.status.id}'
kubectl exec -n kube-system -it <cilium-pod> -- cilium monitor --related-to=<endpoint_id>
#### "Policy Denied" = CNP doesn't allow the FQDN
kubectl logs -n kube-system -l k8s-app=cilium | grep fqdn/server
#### Look for: "Received update: FQDN:... IPS:... TTL:..."
```

##### 6. Datapath Issues

If all above checks pass, it's a dataplane issue. Packet capture needed. Escalate.

---

## Scenario 4: Customer opts to use Agent Pool
> 来源: ado-wiki-acr-tasks-network-bypass-policy.md | 适用: 适用范围未明确

### 排查步骤

Customer opts to use Agent Pool

1. Review [Use Dedicated Pool to Run Tasks](https://learn.microsoft.com/en-us/azure/container-registry/tasks-agent-pools)
2. Provision dedicated agent pool:
   ```bash
   az acr agentpool create --name <agent-pool-name> --registry <registry-name> --vnet <vnet-name>
   ```
3. Run tasks in the agent pool:
   ```bash
   az acr build --registry <registry-name> --agent-pool <agent-pool-name> --image <image:tag> --file Dockerfile <path>
   ```

---

## Scenario 5: Customer opts to enable new network bypass policy
> 来源: ado-wiki-acr-tasks-network-bypass-policy.md | 适用: 适用范围未明确

### 排查步骤

Customer opts to enable new network bypass policy

1. Enable the new policy:
   ```bash
   az acr update --name <registry-name> --set networkRuleBypassAllowedForTasks=true
   ```
2. Verify Tasks can bypass network restrictions by running `az acr build`, `az acr run`, or `az acr task run`.

---

## Scenario 6: Intro to Cilium and AKS
> 来源: ado-wiki-intro-to-cilium-and-aks.md | 适用: 适用范围未明确

### 排查步骤

#### Intro to Cilium and AKS

#### Summary

The aim of this document is to review what Cilium is, a quick overview of the features it has as well as how it can be used with AKS.

##### What is Cilium

Cilium is an open-source networking and security project that leverages eBPF to provide enhanced networking and observability capabilities for containerized environments like Kubernetes. It focuses on enabling efficient and secure communication between services while providing deep visibility and control at the network layer.

##### Advantages of Cilium

The main advantage with Cilium is on the eBPF implementation that allows to simplify how the pods network is setup, providing significant performance improvements.

#### How to use Cilium on AKS

Currently we have 3 main options to use Cilium on AKS:

1. **Azure CNI Powered by Cilium**: https://learn.microsoft.com/en-us/azure/aks/azure-cni-powered-by-cilium
2. **Isovalent Enterprise for Cilium on Azure Market Place**: https://isovalent.com/blog/post/isovalent-cilium-enterprise-microsoft-azure-marketplace/
3. **AKS BYOCNI + Cilium**: https://docs.cilium.io/en/stable/gettingstarted/k8s-install-default/

#### Network policies + Hubble observability example

##### Deploy AKS cluster with BYOCNI

1. Create JSON file that disables kube-proxy:
   ```shell
   cat <<EOF > kube-proxy.json
   { "enabled": false }
   EOF
   ```

2. Create AKS cluster with `--network-plugin none` and `--kube-proxy-config kube-proxy.json`

3. Retrieve cluster credentials: `az aks get-credentials --resource-group "${AZURE_RESOURCE_GROUP}" --name "${NAME}"`

##### Installing Cilium in BYOCNI cluster

1. Install Cilium CLI from https://docs.cilium.io/en/stable/gettingstarted/k8s-install-default/#install-the-cilium-cli
2. Install Cilium:
   ```shell
   export CILIUM_CLI_MODE=classic
   cilium install --set azure.resourceGroup="${AZURE_RESOURCE_GROUP}",azure.clusterName="${NAME}",azure.subscriptionID="$(az account show --query id -o tsv)"
   ```
3. Check status: `cilium status`

##### Network Observability using Hubble

1. Enable Hubble: `cilium hubble enable --ui`
2. Start Hubble UI: `cilium hubble ui`
3. Generate traffic: `kubectl exec tiefighter -- curl -s -X POST deathstar.default.svc.cluster.local/v1/request-landing`

#### Normal network policies (L3/L4)

Use CiliumNetworkPolicy to restrict access based on pod labels:
```yaml
apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: "rule1"
spec:
  description: "L3-L4 policy to restrict deathstar access to empire ships only"
  endpointSelector:
    matchLabels:
      org: empire
      class: deathstar
  ingress:
  - fromEndpoints:
    - matchLabels:
        org: empire
    toPorts:
    - ports:
      - port: "80"
        protocol: TCP
```

#### Advanced network policies at Layer 7

L7 policies allow restricting access based on HTTP method and path:
```yaml
apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: "rule1"
spec:
  description: "L7 policy to restrict access to specific HTTP call"
  endpointSelector:
    matchLabels:
      org: empire
      class: deathstar
  ingress:
  - fromEndpoints:
    - matchLabels:
        org: empire
    toPorts:
    - ports:
      - port: "80"
        protocol: TCP
      rules:
        http:
        - method: "POST"
          path: "/v1/request-landing"
```

> **Note**: Advanced L7 network policies are only available with CiliumNetworkPolicy, which is currently **not supported on Azure CNI Powered by Cilium**.

#### Hubble CLI

1. Find CiliumIdentity: `kubectl describe ciliumidentities.cilium.io | grep "^Name:\|name=deathstar" | grep -B1 "^Labels:"`
2. Observe flows: `kubectl exec <cilium-pod> -- hubble observe --to-identity <identity-id>`
3. Generate connectivity test load: `cilium connectivity test`

#### Resources

##### Microsoft docs
- Azure CNI Powered by Cilium: https://learn.microsoft.com/en-us/azure/aks/azure-cni-powered-by-cilium
- Cilium TSG: https://dev.azure.com/msazure/CloudNativeCompute/_wiki/wikis/aks-troubleshooting-guide/379325/cilium

##### External
- CNI Benchmark: https://cilium.io/blog/2021/05/11/cni-benchmark/
- Cilium component overview: https://docs.cilium.io/en/stable/overview/component-overview/
- Isovalent labs: https://isovalent.com/resource-library/labs/

---
