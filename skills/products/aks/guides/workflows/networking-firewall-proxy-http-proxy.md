# AKS 防火墙与代理 — http-proxy — 排查工作流

**来源草稿**: ado-wiki-a-Troubleshooting-HTTP-Proxy-Feature.md, ado-wiki-aks-http-proxy-walkthrough.md, ado-wiki-d-HTTP-Proxy-Feature.md, mslearn-http-response-codes.md
**Kusto 引用**: 无
**场景数**: 5
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting the HTTP Proxy feature in AKS
> 来源: ado-wiki-a-Troubleshooting-HTTP-Proxy-Feature.md | 适用: 适用范围未明确

### 排查步骤

#### Troubleshooting the HTTP Proxy feature in AKS


#### Summary

The HTTP/S Proxy feature enables AKS cluster support an external HTTP/S proxy and installation of a trusted certificate authority onto nodes as part of bootstrapping a cluster. **The feature can only be enabled during cluster creation and the proxy is not a feature in the cluster**, so troubleshooting the feature will be limited ensuring the proxy feature has been deployed and helping users confirm traffic is successfully redirected through the proxy. Below are the steps to confirm feature deployment and successful traffic routing.

#### Quick Commands

1. Proxy HTTP to HTTP: `curl -x http://PROXY:PORT/ -I http://www.google.com`
2. PROXY HTTP TO HTTPS over CONNECT (HTTP to a proxy using TLS): `curl -x http://PROXY:PORT/ -I https://www.google.com`
3. PROXY HTTPS to HTTP endpoint (TLS connection to proxy, using HTTP to destination): `curl -x https://PROXY:PORT/ -I http://www.google.com`
4. PROXY HTTPS to HTTPS (client-server TLS in all pairs): `curl -x https://PROXY:PORT/ -I https://www.google.com`
5. Validate node configuration by inspecting the following files:
   - ```/etc/evironment```
   - ```/etc/apt/apt.conf.d/95proxy```
   - ```/etc/systemd/system.conf.d/proxy.conf```
6. Validate Trusted CA on node:

   ```bash
   cat proxyCA.crt | base64 -d | openssl x509 -noout -text
   update-ca-certificates
   ```

7. Validate pod configuration is accurate: `kubectl describe pod [pod-name]`

#### Confirm HTTP/S Proxy feature is enabled

Confirming the cluster proxy feature is enabled can be done by checking the Features list in ASI for the cluster.

HTTP proxy is a Cluster-level property, containing multiple subfields and one of either httpProxy or httpsProxy must be populated for the feature to be enabled. If only httpProxy is enabled, httpsProxy will be populated with the same value. An HTTP client can send CONNECT requests to the HTTP proxy, which will be tunneled over TLS. If httpsProxy is enabled, but not httpProxy, httpProxy will not be automatically populated. An HTTP client requesting an HTTPS resource directly results in a client error.

The following files in all correctly proxy enabled nodes should have the configurations similar to as shown below:

- /etc/evironment
- /etc/apt/apt.conf.d/95proxy
- /etc/systemd/system.conf.d/proxy.conf

![Example output from printing the contents of the configuration files referenced above.](/.attachments/HTTPProxyNodeConfig-9e5db22b-8160-452b-b488-ad5ef218479c.png)

The pods should also have the proxy configurations similar to that of the node. Describing a pod using kubectl should give the desired output.

![Example of the expected proxy configuration injected into the pods running in the cluster.](/.attachments/HTTPProxyPodConfig-95546f4e-dccb-4276-8834-66829d5d5ea3.png)

Additionally, to facilitate trust for HTTPS proxies, a trustedCa field should contain a base64 encoded PEM certificate (you can `cat proxyCA.crt | base64 -d | openssl x509 -noout -text` to validate the user provided a real cert, but we will do some validation in RP frontend anyway). It will be added to the Linux VM filesystem in /usr/local/share/ca-certificates/proxyCA.crt, after which we run `update-ca-certificates`, which creates a symlink to /etc/ssl/certs and appends the certificate to /etc/ssl/certs/ca-certificates.crt, the default Ubuntu trust store.

```json
 "properties": {
    ...,
    "httpProxyConfig": {
        "httpProxy": "string",
        "httpsProxy": "string",
        "noProxy": [
            "string"
        ],
        "trustedCa": "string"
    }
 }
```

#### Confirm proxy functionality

We can validate proxy functionality by hitting a known good endpoint through the proxy, with and without HTTPS. curl -x uses the provided endpoint as a proxy. Note that the last two commands require HTTPS support from the corporate proxy.

Use quick commands 1-4 above to validate redirected transactions are successful through the proxy.

#### Default No Proxy

Some kinds of traffic should not be proxied. By default, we will add IP addresses corresponding to all of the following to noProxy:

- Konnectivity
- Node Subnet
- podCidr
- serviceCidr
- dockerBridgeSubnet (if using docker)
- Azure DNS
- Azure IMDS
- FQDN

> **NOTE:** All mutual TLS must be no-proxied

Traffic between some components in the Kubernetes system requires TLS validated against a specific CA. In these cases, the user-provided proxy cannot present a valid certificate, because the client knows the expected CA and will validate against it. The potential IP ranges of all such components should be added to the "noProxy" field by default. This can otherwise cause failures to reach components like apiserver through the proxy.

> **NOTE:** Azure "Magic" IPs, on-host traffic should not be proxied

Azure IMDS for example, is a well-known IP which routes to the host wireserver. This should not be proxied, since the proxy may potentially be outside the Azure network range, and be unable to reach IMDS.

Docker bridge CIDR would be another example -- this should stay local to a single VM host.

#### Owner and Contributors

**Owner:** Kavyasri Sadineni <ksadineni@microsoft.com>

**Contributors:**

- Kavyasri Sadineni <ksadineni@microsoft.com>
- Ben Parker <bparke@microsoft.com>

---

## Scenario 2: Troubleshooting Flow
> 来源: ado-wiki-aks-http-proxy-walkthrough.md | 适用: 适用范围未明确

### 排查步骤

- If proxy blocks traffic → add affected domain to noProxy list
- If noProxy changes don't take effect → upgrade node image or create new node pool
- If proxy server issue → ask customer to troubleshoot from proxy server side

**Owner:** Adam Margherio

---

## Scenario 3: Troubleshooting Flow
> 来源: ado-wiki-d-HTTP-Proxy-Feature.md | 适用: 适用范围未明确

### 排查步骤


---

## Scenario 4: Troubleshooting Flow
> 来源: ado-wiki-d-HTTP-Proxy-Feature.md | 适用: 适用范围未明确

### 排查步骤

* If CSE fails, refer to the following [TSG](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/containers-bburns/azure-kubernetes-service/azure-kubernetes-service-troubleshooting-guide/doc/tsg/how-to-get-systemd-kubelet-log-and-provisioning-logs-and-pod-logs-from-the-node-using-azure-support-center) to retrieve provisioning logs.
  * If CSE exit code is 161, this indicates issue with updating TrustedCA cert. If provisioning fails due to this error, refer to this [TSG](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/containers-bburns/azure-kubernetes-service/azure-kubernetes-service-troubleshooting-guide/doc/tsg/tsg-http-https-proxy).
  * If CSE exit code is 50, this indicates issue with outbound connectivity. Things to check:
    * ensure cluster and proxy are in the same vnet and have connectivity. Use the above curl commands to confirm.
    * Get onto the nodes and ensure the follow files have proxy configuration set on the nodes:
      * Check that `/etc/systemd/system.conf.d/proxy.conf`contains correct proxy environment variables
      * Check that `/etc/apt/apt.conf.d/95proxy`contains correct proxy URLs
      * Ensure `cat /etc/systemd/system/kubelet.service.d/10-httpproxy.conf` exists
      * Check that `/etc/evironment` contains expected proxy vars

---

## Scenario 5: HTTP Response Code Analysis for AKS Applications
> 来源: mslearn-http-response-codes.md | 适用: 适用范围未明确

### 排查步骤

#### HTTP Response Code Analysis for AKS Applications

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/get-and-analyze-http-response-codes

#### Methods to Get HTTP Response Codes

##### curl
```bash
curl -Iv http://<load-balancer-service-ip>:80/
```

##### Browser DevTools
F12 / Ctrl+Shift+I > Network tab

##### Other Tools
- Postman, wget, PowerShell `Invoke-WebRequest`

#### Response Code Interpretation
| Code Range | Meaning |
|-----------|---------|
| 4xx | Client-side issue: page not found, permission denied, or network blocker (NSG/firewall) between client and server |
| 5xx | Server-side issue: application down, gateway failure |

#### AKS-Specific Troubleshooting
- Get service IP: `kubectl get svc`
- Test from inside cluster: `curl -Iv http://<cluster-ip>:<port>/`
- Check pod health: `kubectl top pods`, `kubectl get pods`
- Check pod logs: `kubectl logs <pod> -c <container>`

---
