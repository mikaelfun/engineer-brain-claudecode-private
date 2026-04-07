---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Security and Identity/Troubleshooting K8s Service account Token Secrets"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FTroubleshooting%20K8s%20Service%20account%20Token%20Secrets"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Troubleshooting Kubernetes Service Account Tokens and Secrets

## Summary

This document demonstrates steps to create K8s Secrets/Tokens and validate/troubleshoot existing K8s Service Account Token Secrets. Useful for cases where service account authentication fails or tokens expire.

## 1. Create a Kubernetes Service Account, Role, RoleBinding, ClusterRole binding

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: sample-service-account
---
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: sample-role
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
---
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: sample-role-binding
subjects:
- kind: ServiceAccount
  name: sample-service-account
  namespace: default
roleRef:
  kind: Role
  name: sample-role
  apiGroup: rbac.authorization.k8s.io
---
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: sample-cluster-role
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: sample-cluster-role-binding
subjects:
- kind: ServiceAccount
  name: sample-service-account
  namespace: default
roleRef:
  kind: ClusterRole
  name: sample-cluster-role
  apiGroup: rbac.authorization.k8s.io
```

## 2. Create Token for the Service Account

> **NOTE**: In Kubernetes 1.24+, Service Account tokens are no longer automatically generated.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: sample-service-account-token
  annotations:
    kubernetes.io/service-account.name: sample-service-account
type: kubernetes.io/service-account-token
```

## 3. Inspecting the Service Account Token

Create a sample pod and read the token:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: test
spec:
  serviceAccount: sample-service-account
  containers:
  - image: nginx
    name: test
```

```bash
kubectl exec test -- cat /run/secrets/kubernetes.io/serviceaccount/token
```

Token can also be read from the secret:
```bash
kubectl describe secret sample-service-account-token
```

## 4. Checking Token Expiry and Details via JWT.io

Paste the token value into https://jwt.io to decode. Key fields:
- `exp`: Token expiry date (Unix timestamp)
- `iss`: Issuer (AKS API server URL)
- `sub`: Subject (system:serviceaccount:namespace:name)
- `aud`: Audience (AKS cluster URL)

## 5. Testing Token Validity Using curl

```bash
# Successful response
curl -k -X GET -H "Authorization: Bearer $TOKEN" https://$apiserver/api/v1/pods

# If token expired/invalid, returns HTTP 401 Unauthorized
curl -k -X GET -H "Authorization: Bearer badtoken" https://$apiserver/api/v1/pods
# Returns: {"kind":"Status","status":"Failure","message":"Unauthorized","reason":"Unauthorized","code":401}
```
