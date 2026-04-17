---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway for Containers (formerly Azure Traffic Controller)/How To/Working with SSL certificates inside of AKS"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/How%20To/Working%20with%20SSL%20certificates%20inside%20of%20AKS"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Working with SSL certificates inside of AKS

[[_TOC_]]

## Description

AKS clusters utlize the resource type secrets for handling SSL certificates. However, there are some features here that are unique to AKS that can cause working with certificates to be different than what we are used to. 

Note: As AGfC requires the certificate is local to the AKS cluster and can not be mounted into volumes, use of Azure Key Vault and the [Secrets Store CSI driver](https://learn.microsoft.com/en-us/azure/aks/csi-secrets-store-driver) at this time do not work.

AKS encodes all secrets inside of base 64 encoding. As a result, we need to work with the certificate, private key and chain in a specific manor when importing into AKS. An example of how to do this can be found below.

### Cloud Shell Process

This can all be performed from Bash Cloud Shell or from a local workstation with openSSL and Kubectl installed.

We need to start by separating the key from the certificate for import into AKS. This will require entering the password for the PFX file and the password to encrypt the key file.
```
openssl pkcs12 -in example.pfx -nocerts -out exampleprivatekey.key
```

Next, AKS requires that the private key is decrypted. We can do this with openssl again. This will require entering the password for decrypting the key file.
```
openssl rsa -in exampleprivatekey.key -out exampleprivatekey-decrypted.key
```

Now we need to extract the public chain from the PFX file. This can be done with the below openssl command. This will require the password for the PFX file.
```
openssl pkcs12 -in example.pfx -clcerts -nokeys -out example-publickey.crt 
```

Finally, we can use kubectl to import the certificate and key into AKS. Ideally, the secret should be imported into the same namespace as the ALB Controller. Otherwise, additional configurations will be needed to allow the ALB Controller and Gateway config to access the certificate.:
```
kubectl create secret tls <secret object name> -n <namespace used for the secret> --cert example-publickey.crt --key exampleprivatekey-decrypted.key
```

You can list out all secrets on the AKS cluster using the below syntax. This will show all secrets across all namespaces.
```
kubectl get secrets -A
```

After this you can show more details for the certificate inside of AKS using Kubectl. By default this does not show the actual certificate data.
```
kubectl describe secrets example-secret -n default
```

If you need to for some reason you can output the secret data in JSON format. Please note this is still base 64 encoded data.
```
kubectl get secret example-secret -n default -o jsonpath='{.data}'
```

If you need to output this as not base64 encoded you can use the below example.
```
kubectl get secret example-secret -n default -o jsonpath='{.data}' | base64 --decode
```

## Key Limitation (Track A)

> **Azure Key Vault + Secrets Store CSI driver does NOT work with AGC.** AGC requires the certificate to be stored locally in the AKS cluster as a Kubernetes secret. Volume mounting approach via CSI driver is incompatible.

## References

- Reference Documentation: https://kubernetes.io/docs/tasks/configmap-secret/managing-secret-using-kubectl/
