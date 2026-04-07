---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Cluster Management/Integrating AKS and ACR across tenants"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FIntegrating%20AKS%20and%20ACR%20across%20tenants"
importDate: "2026-04-05"
type: how-to-guide
---

**Scope**

This procedure will show you how to integrate / connect between ACR and AKS cluster which are in different tenants and how to test that integration.

**Prerequisites**

In order to have two subscriptions in two different tenants, you need access to both tenants.

# **Method 1 — Without Kubernetes secret**

**Configuration**

1. On AKS side, identify the Service Principal that the cluster is using and then make it multitenant:
   Portal -> App registrations -> All applications -> search the AppId -> Authentication

2. On ACR side, create the same Service Principal you are using for the AKS cluster by running the command:

   `az ad sp create --id <SPthatwascreatedabovewhichistheaboveApplication(client)ID>`

   If you would not have made the Service Principal multitenant, you would face an error.

3. On ACR subscription provide acrpull role for the above Service Principal on ACR level. Use the command:

   `az role assignment create –assignee <SPthatwascreatedabovewhichistheaboveApplication(client)ID> --role acrpull  --scope <ACRuri>`

**Testing**

1. On ACR side, import an image:

   `az acr import -n acraks123 --source docker.io/library/nginx:latest --image nginx`

2. On AKS side, create a yaml file:

   ```yaml
   apiVersion: v1
   kind: Pod
   metadata:
     name: nginxacraks
   spec:
     containers:
     - name: nginxacraks
       image: <yourACR>.azurecr.io/nginx
   ```

   Then apply the yaml file and describe the pod to verify image pull succeeded.

# **Method 2 — Using a Kubernetes secret**

**Configuration**

1. On ACR side, create a Service Principal:

   `az ad sp create-for-rbac --skip-assignment`

2. On ACR side, provide ACR Pull role for the created Service Principal:

   `az role assignment create --assignee <appId> --role acrpull --scope <resourceURIofACR>`

3. On AKS side, create a Kubernetes secret using the above created Service Principal:

   `kubectl create secret docker-registry registrycredentials --docker-server=<acrname>.azurecr.io --docker-username=<appId> --docker-password=<SPpassword>`

**Testing using Docker commands**

1. On the ACR, create a Token by going to ACR -> Tokens under Repository permissions, select _repositories_admin. The ACR needs to be Premium SKU to use the Tokens.

2. Copy the Docker login command and run it into your Docker environment.

3. Pull a test image, tag it, and then push it to the ACR.

4. Go to your AKS. Create a yaml file:

   ```yaml
   apiVersion: v1
   kind: Pod
   metadata:
     name: testingnginx
   spec:
     containers:
     - name: testingnginx
       image: <youracr>.azurecr.io/testnginx
     imagePullSecrets:
     - name: registrycredentials
   ```

   Apply the yaml file: `kubectl apply -f something.yaml`

**Testing using az acr import**

1. On ACR side, import an image:

   `az acr import -n <youracr> --source docker.io/library/nginx:latest --image nginx`

2. On AKS side, create a yaml file with imagePullSecrets and apply it.

**Reference links:**

- Service principal: https://docs.microsoft.com/en-us/azure/active-directory/develop/app-objects-and-service-principals
- Role assignment: https://docs.microsoft.com/en-us/cli/azure/role/assignment?view=azure-cli-latest#az_role_assignment_create
- Import: https://docs.microsoft.com/en-us/azure/container-registry/container-registry-import-images#import-from-docker-hub
- Create Kubernetes secret: https://docs.microsoft.com/en-us/azure/container-registry/container-registry-auth-kubernetes#create-an-image-pull-secret
