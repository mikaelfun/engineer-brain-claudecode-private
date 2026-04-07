---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Networking/TLS/Troubleshooting issue with Lets encrypt to generate certificates for ingress"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Networking/TLS/Troubleshooting%20issue%20with%20Lets%20encrypt%20to%20generate%20certificates%20for%20ingress"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Issues when generating certificates with Lets Encrypt

[[_TOC_]]

## Summary

Lets Encrypt is a common certificate authority that integrates seamlessly into cert-manager to provide short-lived TLS certificates. While the cert-manager platform is supported best-effort by us, the following steps can help guide troubleshooting efforts.

## Reported and Observed Symptoms

- TLS errors when attempting to connect to applications using Lets Encrypt created TLS certificates
- Ingress controller logs contain errors related to certificate loading

## Troubleshooting Progression

1. Verify the cert-manager pods are up and running, if applicable: `kubectl get po -A | grep -i cert-manager`
2. Verify ClusterIssuer details and make sure ClusterIssuer  has been registered successfully with the ACME server:

   ```bash
   kubectl get clusterissuer 
   kubectl get clusterissuer <clusterissuer-name> -o yaml
   ```

3. In the ingress route, make sure correct ClusterIssuer has been referenced in annotation. Ex: `cert-manager.io/cluster-issuer: letsencrypt-production`:
4. Verify any errors recorded in TLS certificate: `kubectl describe certificate <certificate-name> --namespace <namespace-name>`
5. Also check the status of below objects and describe to capture the errors.

   ```bash
   kubectl get order -A
   kubectl get challenge -A
   ```

6. Collect cert-manager logs for any failure to generate TLS certificate at the time of issue: `k logs -l app.kubernetes.io/instance=cert-manager -n cert-manager -f --timestamps`
7. Validate the ingress configured with Lets Encrypt from below links:

   - <https://docs.microsoft.com/en-us/azure/aks/ingress-tls?tabs=azure-cli>
   - <https://docs.microsoft.com/en-us/azure/aks/ingress-static-ip>

## Owner and Contributors

**Owner:** Enrique Lobo Breckenridge <enriquelo@microsoft.com>
**Contributors:**

- Naomi Priola <Naomi.Priola@microsoft.com>
- Rakesh Kumar B <rabingi@microsoft.com>
