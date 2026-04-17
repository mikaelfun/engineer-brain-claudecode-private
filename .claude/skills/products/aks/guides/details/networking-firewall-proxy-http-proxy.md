# AKS 防火墙与代理 — http-proxy -- Comprehensive Troubleshooting Guide

**Entries**: 6 | **Draft sources**: 4 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-Troubleshooting-HTTP-Proxy-Feature.md, ado-wiki-aks-http-proxy-walkthrough.md, ado-wiki-d-HTTP-Proxy-Feature.md, mslearn-http-response-codes.md
**Generated**: 2026-04-07

---

## Phase 1: AKS HTTP Proxy 配置在节点上通过 /etc/environment、/etc/syst

### aks-503: 更新 AKS HTTP Proxy 的 noProxy 配置后（如将 registry-1.docker.io 加入 noProxy 列表），现有节点上的 Po...

**Root Cause**: AKS HTTP Proxy 配置在节点上通过 /etc/environment、/etc/systemd/system.conf.d/proxy.conf、/etc/apt/apt.conf.d/95proxy 等 OS 级别文件实现。这些文件仅在节点初次配置时写入，更新 AKS 层面的 httpProxyConfig 不会自动更新已有节点的 OS 配置。

**Solution**:
执行 node image upgrade 以使节点重新配置 OS 级别的代理文件，或者创建新的 nodepool（新节点会自动获取最新的 proxy config）。排查时可通过 az aks show -n <name> -g <rg> --query httpProxyConfig 查看 AKS 级配置，通过 SSH 到节点检查 /etc/environment 和 /etc/systemd/system.conf.d/proxy.conf 确认 OS 级配置是否一致。ASC 中 AKS 主页的 http proxy config 标签页也可查看配置。

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FAKS%20HTTP%20Proxy%20Walkthrough)]`

## Phase 2: Windows nodes cannot reach acs-mirror.azureedge.ne

### aks-579: AKS Windows node provisioning fails with exit code 33/34/35 — WINDOWS_CSE_ERROR_...

**Root Cause**: Windows nodes cannot reach acs-mirror.azureedge.net to download CSE scripts, Kubernetes binaries, or Azure CNI packages. Caused by NVA/firewall/proxy. HTTP proxy is not supported for Windows nodepools.

**Solution**:
1. Confirm customer is not using HTTP proxy (not supported for Windows nodepools). 2. Check UDR/firewall/NVA for blocks to acs-mirror.azureedge.net. 3. Verify all required outbound per Azure Global required network rules.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FCSE%20Exit%20Codes%2FvmssCSE%20failures%20during%20node%20provisioning)]`

## Phase 3: CSE exit code 161 indicates issue with updating Tr

### aks-1082: AKS node provisioning fails with CSE exit code 161 when HTTP proxy is configured...

**Root Cause**: CSE exit code 161 indicates issue with updating TrustedCA cert on the node. Certificate may be invalid or improperly formatted.

**Solution**:
Validate trustedCa cert: cat proxyCA.crt | base64 -d | openssl x509 -noout -text. Ensure valid base64-encoded PEM. Follow TSG for HTTP/HTTPS proxy cert issues.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/HTTP%20Proxy%20Feature)]`

## Phase 4: Node cannot reach required endpoints through proxy

### aks-1083: AKS node provisioning fails with CSE exit code 50 when HTTP proxy is configured,...

**Root Cause**: Node cannot reach required endpoints through proxy. Common: proxy/cluster not in same VNet, incorrect proxy config on nodes.

**Solution**:
Check: 1) /etc/systemd/system.conf.d/proxy.conf has proxy env vars. 2) /etc/apt/apt.conf.d/95proxy has proxy URLs. 3) /etc/systemd/system/kubelet.service.d/10-httpproxy.conf exists. 4) /etc/environment has proxy vars. Test: curl -x http://PROXY:PORT/ -I https://www.google.com

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/HTTP%20Proxy%20Feature)]`

## Phase 5: AKS does not support HTTP Proxy configuration for 

### aks-1084: Adding HTTP Proxy config to AKS cluster with Windows node pool fails: HTTPProxyC...

**Root Cause**: AKS does not support HTTP Proxy configuration for Windows node pools - platform limitation.

**Solution**:
HTTP Proxy feature is Linux-only. Use alternative network configuration for Windows nodes.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/HTTP%20Proxy%20Feature)]`

## Phase 6: Go-based K8s components deprecated X.509 CommonNam

### aks-1085: AKS components fail TLS validation when using HTTPS proxy with certificates usin...

**Root Cause**: Go-based K8s components deprecated X.509 CommonName for host validation. Proxy certs must include SAN.

**Solution**:
Ensure proxy CA cert includes SAN. Validate: cat proxyCA.crt | openssl x509 -noout -text. Temporary workaround: GODEBUG=x509ignoreCN=0 (deprecated).

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/HTTP%20Proxy%20Feature)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | 更新 AKS HTTP Proxy 的 noProxy 配置后（如将 registry-1.docker.io 加入 noProxy 列表），现有节点上的 Po... | AKS HTTP Proxy 配置在节点上通过 /etc/environment、/etc/systemd/system... | 执行 node image upgrade 以使节点重新配置 OS 级别的代理文件，或者创建新的 nodepool（新节... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FAKS%20HTTP%20Proxy%20Walkthrough) |
| 2 | AKS Windows node provisioning fails with exit code 33/34/35 — WINDOWS_CSE_ERROR_... | Windows nodes cannot reach acs-mirror.azureedge.net to downl... | 1. Confirm customer is not using HTTP proxy (not supported f... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FCSE%20Exit%20Codes%2FvmssCSE%20failures%20during%20node%20provisioning) |
| 3 | AKS node provisioning fails with CSE exit code 161 when HTTP proxy is configured... | CSE exit code 161 indicates issue with updating TrustedCA ce... | Validate trustedCa cert: cat proxyCA.crt \| base64 -d \| ope... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/HTTP%20Proxy%20Feature) |
| 4 | AKS node provisioning fails with CSE exit code 50 when HTTP proxy is configured,... | Node cannot reach required endpoints through proxy. Common: ... | Check: 1) /etc/systemd/system.conf.d/proxy.conf has proxy en... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/HTTP%20Proxy%20Feature) |
| 5 | Adding HTTP Proxy config to AKS cluster with Windows node pool fails: HTTPProxyC... | AKS does not support HTTP Proxy configuration for Windows no... | HTTP Proxy feature is Linux-only. Use alternative network co... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/HTTP%20Proxy%20Feature) |
| 6 | AKS components fail TLS validation when using HTTPS proxy with certificates usin... | Go-based K8s components deprecated X.509 CommonName for host... | Ensure proxy CA cert includes SAN. Validate: cat proxyCA.crt... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/HTTP%20Proxy%20Feature) |
