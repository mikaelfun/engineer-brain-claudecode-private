---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Workloads/AKS enabled by Azure Arc/04-Connect to AKS"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Readiness/Workloads/AKS%20enabled%20by%20Azure%20Arc/04-Connect%20to%20AKS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

#  Connect and Manage AKS cluster

This guide walks you through how to manage an **Azure Kubernetes Service (AKS) on Azure Arc** in a **disconnected environment**, including credential retrieval, configuring the management VM, and accessing the master node securely.

---

##  1. Get AKS Arc Credentials on Host Machine

Use the `az aksarc get-credentials` command to extract and store your AKS Arc kubeconfig file locally.

```powershell
# Define your variables
$resourceGroupName = "demo-test-rg"
$name = "aksarc01"

# Create directory to store kubeconfig
md C:\K8S

# Download the admin kubeconfig file for the AKS Arc cluster
az aksarc get-credentials `
  --resource-group $resourceGroupName `
  --name $name `
  --admin `
  --file "C:\K8S\$name"

#  Verify the file exists and has contents
dir "C:\K8S\$name"
cat "C:\K8S\$name"

#  If K8S was not deployed from MGMT VM, Copy the kubeconfig file to your MGMT VM for remote cluster management
```

---

##  2. Configure the Management VM to Use kubectl

On the MGMT VM, configure `kubectl` to connect using the kubeconfig file.

```powershell
# If not already present, download kubectl (adjust version as needed)
curl.exe -LO "https://dl.k8s.io/release/v1.33.0/bin/windows/amd64/kubectl.exe"
copy-item kubectl.exe C:\Windows\System32\ -Verbose

# Set the KUBECONFIG environment variable
$name = "aksarc01"
$env:KUBECONFIG = "C:\K8S\$name"

#  Verify access to the cluster
kubectl get nodes -o wide

#  List all pods across all namespaces with detailed info
kubectl get pods -A -o wide

#  View node labels (e.g., zone, agentpool role)
kubectl get nodes --show-labels
```

---

##  3. SSH Access to the Master Node from MGMT VM

To perform deeper troubleshooting or manage the control plane directly, use SSH access with your private key.

```powershell
#  Check for the existence of the private SSH key (on host)
dir "$env:USERPROFILE\.ssh\id_rsa*"

#  Copy the SSH private key to your MGMT VM (e.g., via WinRM, shared folder)
$name = "aksarc01"
copy-item "$env:USERPROFILE\.ssh\id_rsa" C:\K8S\id_rsa_$name -Verbose
```

###  Prepare SSH Key Permissions

```powershell
#  Remove known_hosts to avoid mismatched SSH fingerprints (recommended after redeployments)
remove-item "$env:USERPROFILE\.ssh\known_hosts" -Verbose

# Define private key path
$privateKey = "C:\K8S\id_rsa_aksarc01"

# Lock down access to the private key file
icacls $privateKey /remove:g "VHCI01-MGMT\Administrator"
icacls $privateKey /remove:g "Users"
icacls $privateKey /remove:g "Everyone"
icacls $privateKey /remove:g "Administrators"
icacls $privateKey /inheritance:r

# Grant read-only access to current user
$user = if ($env:USERDOMAIN) { "$env:USERDOMAIN\$env:USERNAME" } else { $env:USERNAME }
icacls $privateKey /grant:r "${user}:R"

#  Confirm updated permissions
icacls $privateKey
```

###  SSH into the Master Node

```powershell
# SSH into the node using the private key
ssh -v -i C:\K8S\id_rsa_aksarc01 clouduser@172.16.0.51

#  Elevate to root
sudo su
```

###  Inspect Cluster Internals from the Node

```bash
#  View the Kubernetes admin config file
ls /etc/kubernetes/admin.conf
cat /etc/kubernetes/admin.conf

# Set kubeconfig for kubectl inside the node
export KUBECONFIG=/etc/kubernetes/admin.conf

#  Validate cluster status
kubectl get no -o wide
```

---

##  Notes

- If multiple users access the same MGMT VM, be careful with SSH key permissions.
- You can automate key copy and KUBECONFIG setup using scripts if redeployment is frequent.
