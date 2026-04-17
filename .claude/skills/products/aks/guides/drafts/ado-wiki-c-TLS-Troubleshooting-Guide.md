---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Networking/TLS/TLS Troubleshooting Guide"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Networking/TLS/TLS%20Troubleshooting%20Guide"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Troubleshooting: TLS Connection Fails from AKS Nodes

[[_TOC_]]

## Summary

This document assists support engineers in diagnosing and resolving TLS-related connectivity issues originating from workloads or system pods within an Azure Kubernetes Service (AKS) cluster. It outlines common symptoms, analysis techniques, and remediation steps, including the use of curl and openssl for TLS debugging.

This guide applies to AKS clusters running on Linux nodes and assumes basic familiarity with TLS and Kubernetes networking.

---

## Reported and Observed Symptoms

- Application workloads are unable to reach external endpoints using HTTPS

- `curl` from within AKS pods shows `Connected`, but fails with TLS errors

- `openssl s_client` reveals incomplete handshake or abrupt disconnects

- External services report failed mutual TLS negotiation

---

## Logs and Error Messages

Examples of logs or terminal outputs observed:

```bash

Connected to store.policy.core.windows.net port 443

TLSv1.3(OUT), TLS alert, decode error

error: 0A000126:SSL routines::unexpected eof while reading

curl: (35) error: 0A000126: SSL routines::unexpected eof while reading

Or

curl: 35 Recv failure: Connection reset by peer

```

---

## Environment Details

- TLS traffic originating from system-managed workloads or user pods

- May involve outbound HTTPS to Microsoft endpoints or third-party APIs

- Cluster may use Azure Firewall, App Gateway, or Private DNS Zones

---

## Potential Causes

Support engineers should investigate the following areas:

### TLS Version or Cipher Mismatch

- Server expects specific TLS versions (e.g., TLS 1.2 vs 1.3)

- Pod base image uses outdated OpenSSL or disabled cipher suites

### SNI (Server Name Indication) Missing or Mismatched

- `openssl s_client` missing `-servername` flag

- HTTPS endpoint rejects connection without correct SNI

### Firewall or Proxy Interruption

- Azure Firewall or App Gateway may interrupt or strip TLS handshake

- Packet inspection policies may interfere with session setup

### Application Gateway TLS Policy Restrictions

- Application Gateway may enforce TLS policy that excludes client ciphers

- May affect curl but not browsers due to different TLS stacks

---

## Mitigation Steps 

To isolate and resolve the TLS connectivity issue, follow the steps below: 

--- 

###  Step 1: Use OpenSSL for Low-Level Inspection 

Run the following to establish a raw TLS connection and inspect the handshake: 

```bash 

openssl s_client -connect store.policy.core.windows.net:443 -servername store.policy.core.windows.net

```

Optional flags: 

- `-showcerts` to display the full certificate chain 

- `-CAfile` to specify a custom CA trust store if required 

###  Step 2: Analyze `openssl s_client` Output 

####  Successful Handshake 

Indicates TLS is working correctly. Check for: 

- Peer certificate and chain

- Cipher and protocol negotiated

- Any TLS alerts or abrupt connection resets

####  Common Failure Patterns

|Symptom|LikelyCause|SuggestedAction|
|----------------------------------|------------------------------------------------------------------|---------------------------------------------------------------------|
|`unexpectedeofwhilereading`|Connectionwasblocked orinterruptedbeforethehandshakecouldcomplete|Checknetworkdevicesbetweenclientandserver,suchasNVA/Firewall/Proxy|
|`unabletogetlocalissuercertificate`|UntrustedCA|Providecustom`-CAfile`orupdateCAbundle|
|`connectiontimedout`|Network/firewallblock|CheckNSG,UDR,orAzureFirewallrules|
|`wrongversionnumber`|Non-TLStargetorportmismatch|Verifycorrectport(443forHTTPS)|

---

###  Step 3: Verify Network Policies and Firewalls 

- Confirm that the AKS node subnet is allowed to egress on TCP 443 

- Use `nc -vz` or `telnet` from the node to confirm port reachability 

- If Azure Firewall is used, check if TLS inspection is enabled or interfering 

---

###  Step 4:Cross-check TLS Policy and External Validation

- Review Application Gateway TLS policy if in path 

- Use [SSL Labs Test](https://www.ssllabs.com/ssltest/) to validate the public-facing TLS configuration. This helps confirm whether the issue is client-side or server-side.

---

These steps should help isolate whether the TLS issue originates from configuration, infrastructure, or server-side restrictions

---

## Last Updated

June 2025 by <yangzhe@microsoft.com>

## Owner and Contributors

**Owner:** Zhen Yang <yangzhe@microsoft.com>
**Contributors:**

