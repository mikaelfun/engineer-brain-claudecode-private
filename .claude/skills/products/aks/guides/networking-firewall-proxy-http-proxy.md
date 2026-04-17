# AKS 防火墙与代理 — http-proxy -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 6
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | 更新 AKS HTTP Proxy 的 noProxy 配置后（如将 registry-1.docker.io 加入 noProxy 列表），现有节点上的 Po... | AKS HTTP Proxy 配置在节点上通过 /etc/environment、/etc/systemd/system... | 执行 node image upgrade 以使节点重新配置 OS 级别的代理文件，或者创建新的 nodepool（新节... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FAKS%20HTTP%20Proxy%20Walkthrough) |
| 2 | AKS Windows node provisioning fails with exit code 33/34/35 — WINDOWS_CSE_ERROR_... | Windows nodes cannot reach acs-mirror.azureedge.net to downl... | 1. Confirm customer is not using HTTP proxy (not supported f... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FCSE%20Exit%20Codes%2FvmssCSE%20failures%20during%20node%20provisioning) |
| 3 | AKS node provisioning fails with CSE exit code 161 when HTTP proxy is configured... | CSE exit code 161 indicates issue with updating TrustedCA ce... | Validate trustedCa cert: cat proxyCA.crt \| base64 -d \| ope... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/HTTP%20Proxy%20Feature) |
| 4 | AKS node provisioning fails with CSE exit code 50 when HTTP proxy is configured,... | Node cannot reach required endpoints through proxy. Common: ... | Check: 1) /etc/systemd/system.conf.d/proxy.conf has proxy en... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/HTTP%20Proxy%20Feature) |
| 5 | Adding HTTP Proxy config to AKS cluster with Windows node pool fails: HTTPProxyC... | AKS does not support HTTP Proxy configuration for Windows no... | HTTP Proxy feature is Linux-only. Use alternative network co... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/HTTP%20Proxy%20Feature) |
| 6 | AKS components fail TLS validation when using HTTPS proxy with certificates usin... | Go-based K8s components deprecated X.509 CommonName for host... | Ensure proxy CA cert includes SAN. Validate: cat proxyCA.crt... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/HTTP%20Proxy%20Feature) |

## Quick Troubleshooting Path

1. Check: 执行 node image upgrade 以使节点重新配置 OS 级别的代理文件，或者创建新的 nodepool（新节点会自动获取最新的 proxy config）。排查时可通过 az aks sh `[source: ado-wiki]`
2. Check: 1 `[source: ado-wiki]`
3. Check: Validate trustedCa cert: cat proxyCA `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-firewall-proxy-http-proxy.md)
