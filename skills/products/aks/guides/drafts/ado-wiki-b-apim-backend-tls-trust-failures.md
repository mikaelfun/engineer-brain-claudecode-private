---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Security and Identity/TLS/SSL trust relation between AKS APIM"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FTLS%2FSSL%20trust%20relation%20between%20AKS%20APIM"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# APIM Backend TLS Trust Failures When Using AKS Ingress

## Summary

Azure API Management (APIM) fails to call an AKS-hosted backend service due to a TLS certificate trust error. This typically surfaces as a 500 BackendConnectionFailure or Could not establish trust relationship error in APIM diagnostic logs. While APIM documentation covers this from the gateway's perspective, the root cause is frequently inside the AKS cluster in the ingress controller configuration, the TLS secret, or the certificate issuance pipeline. This guide covers all three major AKS ingress patterns: Nginx community (Helm), App Routing add-on (managed), and AGIC.

## Reported and Observed Symptoms

The following errors appear in APIM diagnostic logs or the Test console in the Azure portal:

```bash
BackendConnectionFailure: The underlying connection was closed: Could not establish trust relationship for the SSL/TLS secure channel.
BackendConnectionFailure: The remote certificate is invalid according to the validation procedure.
BackendConnectionFailure: The remote certificate has a name mismatch.
```

Additional observable signals:
* APIM returns HTTP 500 to the caller with no response body from the backend.
* The backend service works correctly when called directly (e.g. via curl or Postman) but fails only through APIM.
* The issue is consistent and not intermittent.

Note: If the error is ConnectionRefused or a DNS resolution failure, this is a network/DNS issue, not a TLS trust issue.

## Environment Details to Collect

* APIM tier and VNet integration mode (External, Internal, or none).
* AKS version and node pool OS (Linux or Windows).
* Ingress controller type: Nginx community (Helm), App Routing add-on, or AGIC.
* Certificate source: cert-manager (Let's Encrypt or internal CA), Azure Key Vault, or manually managed secret.
* Backend URL configured in APIM Settings > Backend > URL

Useful kubectl commands:
```bash
kubectl get ingress -A -o wide
kubectl get certificate -A
kubectl get secret <tls-secret-name> -n <namespace> -o jsonpath='{.data.tls\.crt}'| base64 -d | openssl x509 -noout -text
```

## Root Cause Categories

### 1. Certificate Not Trusted by APIM
APIM validates backend certificates against its built-in trusted root CA store (Windows OS trust store).
- Self-signed certificate on the ingress
- Internal PKI / corporate root CA not present in APIM's trust store
- Incomplete certificate chain (intermediate CA not included in TLS secret)

### 2. Certificate Subject Name Mismatch
APIM performs hostname validation. The hostname in the backend URL must appear as a SAN in the certificate.
- Ingress hostname does not match backend URL configured in APIM
- Certificate has CN but no SAN (rejected by modern TLS stacks)
- Wildcard certificate scope mismatch

### 3. Ingress Serving Nginx Default Self-Signed Certificate
When Nginx ingress controller cannot find a valid TLS secret, it falls back to its built-in "Kubernetes Ingress Controller Fake Certificate".
- TLS secret name mismatch in ingress spec
- Secret in different namespace than ingress resource
- cert-manager has not yet issued the certificate (Certificate object not Ready)
- App Routing add-on has not synced certificate from Azure Key Vault

### 4. Certificate Expired or Not Yet Renewed
- cert-manager renewal failed (ACME challenge not completing)
- AKV certificate rotation not propagating to ingress controller
- Manually managed TLS secret not updated after expiry

## Mitigation Steps

### Step 1: Confirm the Certificate Being Served

From outside the cluster:
```bash
openssl s_client -connect <ingress-hostname>:443 -servername <hostname> -showcerts 2>/dev/null | openssl x509 -noout -text
```

From inside the cluster (debug pod):
```bash
kubectl run debug-tls --image=alpine/openssl --restart=Never -it --rm -- openssl s_client -connect <service>.<namespace>.svc.cluster.local:443 -servername <hostname>
```

Verify: Subject CN, SANs, Issuer, validity dates, and chain completeness.

### Step 2: Fix by Ingress Type

**Nginx Community (Helm):**
- Verify TLS secret reference matches existing secret in same namespace
- Check cert-manager Certificate object status (Ready: True)
- Check certificate chain order: leaf > intermediate > root

**App Routing Add-on (Managed Nginx):**
- Verify annotation kubernetes.azure.com/tls-cert-keyvault-uri on ingress
- Check managed identity has Key Vault Secrets User or Certificate User role
- Check sync status and controller logs in app-routing-system namespace

**AGIC (Application Gateway Ingress Controller):**
- Verify listener certificate in App Gateway portal (not expired, correct SANs)
- For end-to-end TLS, check backend health: az network application-gateway show-backend-health
- Verify "Use well known CA certificate" or trusted root CA in backend HTTP settings

### Step 3: Resolution Options

**Option A - Fix the certificate (preferred):**
- Replace with publicly trusted certificate (Let's Encrypt via cert-manager, DigiCert/Sectigo in AKV)
- Ensure correct SAN for the hostname APIM is calling
- Ensure full chain (leaf + intermediates) in TLS secret

**Option B - Upload CA certificate to APIM (workaround):**
APIM > Security > CA Certificates > Upload root CA. Enable custom CA on backend.
Note: Does not bypass hostname/SAN validation.

**Option C - Disable certificate validation (dev/test only):**
Never recommend for production workloads.

Note: Nginx community ingress reached end-of-life in March 2026. App Routing managed Nginx is on critical-patch-only support until November 2026. Consider migration to Gateway API (Istio).
