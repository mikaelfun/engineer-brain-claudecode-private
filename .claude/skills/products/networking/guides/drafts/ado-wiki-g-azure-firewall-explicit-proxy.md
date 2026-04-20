---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Firewall/Features & Functions/Azure Firewall Explicit Proxy"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki/pages/Azure%20Firewall/Features%20%26%20Functions/Azure%20Firewall%20Explicit%20Proxy"
importDate: "2026-04-18"
type: troubleshooting-guide
---

[[_TOC_]]

#Overview
The **Azure Firewall Explicit Proxy** feature provides forward proxy capabilities, allowing clients to route traffic to any server on the internet or on-premises through the Azure Firewall. This feature is available via the firewall's private IPs and can serve as a drop-in replacement for existing forward proxy solutions.

#Key Updates
-----------

*   The feature is currently in **Public Preview** with the below limitations:
    *   Earlier implementations did not fully meet customer requirements, especially the need for a single proxy port for both HTTP and HTTPS traffic.
    *   Previous versions were not fully RFC-compliant.
    *   There were several feature gaps.

##What's New in the Revised Public Preview
----------------------------------------

*   **Single Port for HTTP & HTTPS:** Both HTTP and HTTPS client traffic are now served using a single proxy port.
*   **PAC File Management:** PAC files are served on a separate port as management traffic.
*   **Private IP Support:** Clients connect to the explicit proxy using the firewall's private IP and user-configured ports.
*   **No UDR Required:** User Defined Route (UDR) configuration is not needed; client-side proxy settings direct requests to the Azure Firewall Explicit Proxy port.
*   **Application Rule Required:** Customers must configure an application rule to enable this capability.
*   **Azure Firewall can support both Transparent Proxy flow and Explicit Proxy mode:** Customer can use same AZFW for both transparent and explicit Proxy flow at the same time
*   **Enhanced Port Experience**: Now we have the option to enable Explicit Proxy while creating the Firewall policy itself, instead of updating the policy later to enable Explicit Proxy.

Features Supported in Public Preview
------------------------------------

- SKU Support: Standard and Premium SKUs supported. No plan to support basic SKU.
- Basic flow: Both HTTP and HTTPS traffic served on same HTTP endpoint port.
- Threat Intel: L4 (source IP-based) and L7 (FQDN + URL based) supported.
- IDPS: Alert and Alert+Deny modes supported. IDPS Bypass for Network Rule supported; IDPS Bypass for App rule unsupported.
- Billing: Supported.
- TLS Termination: Supported.
- Explicit Proxy Flow Logging: Support for both TLS terminated and non-terminated flows.
- PAC File Support: Managed-identity based blob storage access. PAC file size limit: 256KB.

#Troubleshooting Guide
---------------------

##Data Path Issues

- Port Consistency: Ensure both Azure Firewall and client use same single proxy port for data traffic.
- Proxy Port Selection: Avoid standard/well-known ports (80, 443, 21, etc.) for explicit proxy configuration.
- Proxy Flow Verification: Review Azure Monitor logs. Check flows where destination port matches explicit proxy port and isExplicitProxy flag is true.
- Client must direct traffic to Azure Firewall Private IP with configured explicit proxy data port.

**How to handle Explicit Proxy Port status is down LSI:**
1. Check AZFW runtime logs (filter by app=sgw) to identify why Explicit Proxy port status is down.
2. Log in to AZFW VM and check whether configured Explicit Proxy port is used for other purposes: netstat -lapn | grep <explicit_proxy_port>
3. If port is used by process other than SGW, ask customer to configure a different port.

##Management Path Issues (PAC File Download)

- PAC File Port Selection: Avoid standard/blocked ports for PAC file service.
- Use curl http://<Firewall-Private-IP>:<PacFilePort> to verify PAC file accessibility.
- If PAC file download fails, check firewall private IP and PAC file port are correctly specified.
- Also verify customer followed all steps for PAC file setup (managed identity, blob storage, roles).
- PAC file size restricted to 256KB.
