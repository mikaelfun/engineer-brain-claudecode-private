---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway for Containers (formerly Azure Traffic Controller)/Training - AGC Configuration Lab/03 - ALB Deployment"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Training%20-%20AGC%20Configuration%20Lab/03%20-%20ALB%20Deployment"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Training - AGC configuration lab - ALB Deployment

### ALB Installation

We can review the running pods on our aks cluster and observe the ALB controller pods running there. This is done by using kubectl and running the below command.

``` kubectl
kubectl get pods -A
```

### SSL Certificate Configurations

Application Gateway for Containers works with certificates that are directly uploaded to the AKS cluster in question. As such we need to do some work with openssl to get our certificate into a usable format and then upload it into the AKS cluster. Lets start with a PFX file(as we will need a private key) and begin to convert the file over.

**_WARNING:_** This process will create an unencrypted file of the certificates private key. This is essential for uploading to the AKS cluster but it does pose a risk as the key is stored in plain text. Be very caution with where and how you store these files. If you feel that your private key has been compromised in any way it is advised to rotate the key and revoke the old key.

- For PFX files encrypted with 3DES-SHA1 (When using openSSL version 3.0.0 or newer):
``` openssl and kubectl
#Extracting the key file from the PFX
openssl pkcs12 -in example.pfx -nocerts -out exampleprivatekey.key -legacy -provider-path "C:\path\to\the\legacy\provider\file"
#Decrypting the key file
openssl rsa -in exampleprivatekey.key -out exampleprivatekey-decrypted.key
#Extracting the public key from the PFX file
openssl pkcs12 -in example.pfx -nokeys -out example-publickey.crt -legacy -provider-path "C:\path\to\the\legacy\provider\file"

kubectl create secret tls frontendcert -n azure-alb-system --cert example-publickey.crt --key exampleprivatekey-decrypted.key
```

- For PFX files encrypted with AES256-SHA256:
``` openssl and kubectl
#Extracting the key file from the PFX
openssl pkcs12 -in example.pfx -nocerts -out exampleprivatekey.key
#Decrypting the key file
openssl rsa -in exampleprivatekey.key -out exampleprivatekey-decrypted.key
#Extracting the public key from the PFX file
openssl pkcs12 -in example.pfx -nokeys -out example-publickey.crt

kubectl create secret tls frontendcert -n azure-alb-system --cert example-publickey.crt --key exampleprivatekey-decrypted.key
```

### YAML Creation and deployment of backend app

Deploy the application to the AKS cluster with the following YAML (agfcconfig.yaml):

``` yaml
apiVersion: v1
kind: Namespace
metadata:
  name: azure-alb-system
---
apiVersion: v1
kind: Namespace
metadata:
  name: application-deployment
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: azure-vote-back
  namespace: application-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: azure-vote-back
  template:
    metadata:
      labels:
        app: azure-vote-back
    spec:
      nodeSelector:
        "kubernetes.io/os": linux
      containers:
      - name: azure-vote-back
        image: mcr.microsoft.com/oss/bitnami/redis:6.0.8
        env:
        - name: ALLOW_EMPTY_PASSWORD
          value: "yes"
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 250m
            memory: 256Mi
        ports:
        - containerPort: 6379
          name: redis
---
apiVersion: v1
kind: Service
metadata:
  name: azure-vote-back
  namespace: application-deployment
spec:
  ports:
  - port: 6379
  selector:
    app: azure-vote-back
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: azure-vote-front
  namespace: application-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: azure-vote-front
  template:
    metadata:
      labels:
        app: azure-vote-front
    spec:
      nodeSelector:
        "kubernetes.io/os": linux
      containers:
      - name: azure-vote-front
        image: mcr.microsoft.com/azuredocs/azure-vote-front:v1
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 250m
            memory: 256Mi
        ports:
        - containerPort: 80
        env:
        - name: REDIS
          value: "azure-vote-back"
---
apiVersion: v1
kind: Service
metadata:
  name: azure-vote-front
  namespace: application-deployment
spec:
  type: NodePort
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: azure-vote-front
```

Deploy with: `kubectl apply -f agfcconfig.yaml`

### ALB YAML Deployment

Add the ALB configuration specifying the AGC subnet association:

``` yaml
apiVersion: alb.networking.azure.io/v1
kind: ApplicationLoadBalancer
metadata:
  name: agfctestinstance
  namespace: azure-alb-system
spec:
  associations:
  - /subscriptions/{sub-id}/resourceGroups/{rg}/providers/Microsoft.Network/virtualNetworks/{vnet}/subnets/{agfc-subnet}
```

Deploy again: `kubectl apply -f agfcconfig.yaml`
