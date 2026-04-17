---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/TCPDump on Windows nodes"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FTCPDump%20on%20Windows%20nodes"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Using tcpdump on Windows nodes in AKS

Here are three different was to get a TCP Dump on a Windows node.

## Manually

- Login into the node from the portal.
  - go to the MC_ resource group/VMSS/instance and click the instance name
  - connect through the Bastion option on the menu.
    - you need the admin username and password.  You can update it through the 'Reset Password' option on the LH menu.
    - you will need to cycle out the nodes as only nodes will have the updated password
  - run netsh trace start capture=yes tracefile=c:\nodename.etl
  - when finished run netsh trace stop.

> **NOTE** Windows nodes now support privileged containers. Require Kubernetes 1.23 or greater and containerd 1.6 or higher

## Using a privileged pod

1. Use the following to create a privileged pod to start and stop the capture. Set the nodeName to place pod a on a specific node. If the node's O/S is Windows 2022 use the ltsc2022 image.

   ```yaml
   apiVersion: v1
   kind: Pod
   metadata:
     name: windump
   spec:
     dnsPolicy: ClusterFirstWithHostNet
     nodeSelector:
       kubernetes.io/os: windows
     securityContext:
       windowsOptions:
         hostProcess: true
         runAsUserName: "NT AUTHORITY\\Local service"  
     hostNetwork: true
     #nodeName: akswinapp000006
     containers:
     - name: windump
       image: mcr.microsoft.com/windows/servercore:ltsc2019
       #image: mcr.microsoft.com/windows/servercore:ltsc2022
       securityContext:
         privileged: true
         windowsOptions:
           hostProcess: true
           runAsUserName: "NT AUTHORITY\\SYSTEM"
       command:
         - powershell.exe
         - |
           $nodename=hostname
           set-location c:\
           Invoke-WebRequest -URI https://aka.ms/downloadazcopy-v10-windows -UseBasicParsing -OutFile azcopy.zip
           Expand-archive azcopy.zip
           netsh trace start capture=yes tracefile=c:\$nodename.etl
           $AdminRights = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]"Administrator")
           Write-Host "Process has admin rights: $AdminRights"
           while ($true) { Start-Sleep -Seconds 2147483 }
       resources:
         requests:
           cpu: 250m
           memory: 500Mi
         limits:
           cpu: 500m
           memory: 1Gi
     restartPolicy: Never
   ```

2. When ready to stop the dump run: `kubectl exec windump -- powershell netsh trace stop`

## Using a daemonset for multiple nodes

   ```yaml
   apiVersion: apps/v1
   kind: DaemonSet
   metadata:
     name: windumpds
   spec:
     selector:
         matchLabels:
           name: windumpds
     template:
       metadata:
         labels:
           name: windumpds
       spec:
         dnsPolicy: ClusterFirstWithHostNet
         nodeSelector:
           kubernetes.io/os: windows
         securityContext:
           windowsOptions:
             hostProcess: true
             runAsUserName: "NT AUTHORITY\\Local service"  
         hostNetwork: true    
         containers:
         - name: windump
           image: mcr.microsoft.com/windows/servercore:ltsc2019
           #image: mcr.microsoft.com/windows/servercore:ltsc2022
           securityContext:
             privileged: true
             windowsOptions:
               hostProcess: true
               runAsUserName: "NT AUTHORITY\\SYSTEM"
           command:
             - powershell.exe
             - |
               $nodename=hostname
               set-location c:\
               Invoke-WebRequest -URI https://aka.ms/downloadazcopy-v10-windows -UseBasicParsing -OutFile azcopy.zip
               Expand-archive azcopy.zip 
               netsh trace start capture=yes tracefile=c:\serverdump.etl 
               $AdminRights = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]"Administrator")
               Write-Host "Process has admin rights: $AdminRights"
               while ($true) { Start-Sleep -Seconds 2147483 }
           resources:
             requests:
               cpu: 250m
               memory: 500Mi
             limits:
               cpu: 500m
               memory: 1Gi
         restartPolicy: Always
   ```

   ```bash
   kubectl exec windump-xxxxx -- powershell netsh trace stop
   ```

## How to retrieve the dumps using "kubectl cp"

To retrieve a file from a Windows node, you can use the kubectl cp command. When specifying the file path, do not include the drive letter (for example, C:) in the path.

```bash
kubectl cp DEBUG-POD-NAME:/path-to-file filename
```

Example of copying node logs using host process container:

```bash
#from inside the node debug pod generate node log zip file
C:\k\debug\collect-windows-logs.ps1

#in another terminal copy the log zip file
kubectl cp DEBUG-POD-NAME:/hpc/NODENAME-DATE-XXXX_logs.zip NODENAME-DATE-XXXX_logs.zip
```

## How to retrieve the dumps using a storage account

To retrieve the TCP Dump copy it to your storage account. Generate a SAS key with read, write, and list permissions.

```bash
az vmss run-command invoke --command-id RunPowerShellScript \
--name 'VMSS_NAME' \
--resource-group 'MC_RESOUCE_GROUP_NAME' \
--instance-id NodeNumber \
--scripts 'cd c:\azcopy\*; .\azcopy.exe copy "C:\NODE_NAME.cab" "https://[YOUR-STORAGE-ACCOUNT].blob.core.windows.net/[YOUR-STORAGE-CONTAINER-NAME]/NODE_NAME.cab?[YOUR-SAS-TOKEN]"'
```

## How to retrieve the dumps via NFS

This method uses a temporary NFS server on a Linux node to transfer packet captures from Windows nodes.

### Step 1: Set up the Linux NFS server

```bash
kubectl debug node/aks-systempool-xxxxx -it --image=mcr.microsoft.com/cbl-mariner/busybox:2.0 --profile=sysadmin
chroot /host
apt update && apt-get install -y nfs-kernel-server
mkdir /var/lib/aks-nfs-temp
# Add to /etc/exports: /var/lib/aks-nfs-temp *(rw,sync,no_subtree_check,no_root_squash)
chmod 777 /var/lib/aks-nfs-temp
chown nobody:nogroup /var/lib/aks-nfs-temp
exportfs -ra
systemctl restart nfs-server
```

### Step 2: Transfer files from Windows to Linux via NFS

```powershell
Install-WindowsFeature NFS-Client
mount.exe -o anon \\LINUX_NODE_IP\var\lib\aks-nfs-temp Z:
copy packetcapture1.etl z:\
```

### Step 3: Retrieve files from the Linux node

```bash
kubectl cp default/node-debugger-xxx:/host/var/lib/aks-nfs-temp/packetcapture1.etl ./packetcapture1.etl
```

### Step 4: Clean up

```bash
apt-get remove nfs-kernel-server && apt-get autoremove -y
```

## Converting ETL to PCAPNG

Download etl2pcapng from https://github.com/microsoft/etl2pcapng/releases.

```bash
etl2pcapng.exe report.etl Node_Name.pcapng
```

Open the .pcapng file with Wireshark.
