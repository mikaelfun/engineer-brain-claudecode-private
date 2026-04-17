---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Security and Identity/SSL certificate validation in an AKS cluster"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FSecurity%20and%20Identity%2FSSL%20certificate%20validation%20in%20an%20AKS%20cluster"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# SSL Certificate Validation in AKS

## Overview

- Determine the hostname or domain name of your application. This is the name that users will use to access your application which is integrated with ssl certificate.
- Run the debugger pod accessible to the target pod
  Example command:  `kubectl run -it --rm debug-pod --image=debian --restart=Never -- bash`
  - Check if url is accessible:
   Example Command: `curl https://www.example.com -v`
  - Check ssl certificate details:
   Example command: `openssl s_client -showcerts -servername <domain name>  -connect <domain name>:443 </dev/null`

## Fetching the certificates from the cluster

- Fetching certificate from Kubernetes Secret: If the certificate is stored in a Kubernetes Secret, you can use the kubectl command to get the certificate

  `kubectl get secret <secret-name> -o jsonpath='{.data.<certificate-file-name>}' | base64 --decode > <certificate-file-name>.crt`

- Fetching certificate from Deployment: If the certificate is mounted in the Deployment as a ConfigMap or a Secret, you can use the kubectl command to get the certificate.

  `kubectl describe deployment <deployment-name>`

- Fetching certificate from Pod: If the certificate is mounted in a Pod as a ConfigMap or a Secret, you can use the kubectl command to get the certificate.

  `kubectl describe pod <pod-name>`

## Certificate Validation Steps

- Check the validity period of the certificate:

  `openssl x509 -in <certificate-file-name>.crt -noout -dates`

- Verify the certificate issuer:

  `openssl x509 -in <certificate-file-name>.crt -noout -issuer`

- Verify the certificate chain:

  `openssl verify -CAfile <ca-certificate-file> <certificate-file-name>.crt`
