---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Trusted Launch"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Trusted%20Launch"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Trusted Launch

[[_TOC_]]

---

# Overview

Trusted Launch is a security feature that can be enabled on VMs to protect against advanced and persistent attack techniques. It is composed of several, coordinated infrastructure technologies that can be enabled independently, namely vTPM and Secure Boot. **vTPM** is a virtualized version of a hardware Trusted Platform Module which serves as a dedicated secure vault for keys and measurements and enables attestation by measuring the entire boot chain of the VM (UEFI, OS, system, and drivers). **Secure Boot**  ensures that only signed operating systems and drivers can boot, thereby protecting against the installation of malware-based rootkits and boot kits.

For more information, see [docs](https://learn.microsoft.com/en-us/azure/virtual-machines/trusted-launch#operating-systems-supported)

# Limitations

- Trusted Launch is supported only on Ubuntu 22.04 and AzureLinux/Mariner with Gen 2 VMs.
- Unsupported with Gen 1 VMs, ARM64 VMs, CVM VMs, FIPS VMs, and in Edge Zones.
- Windows nodepools, GPU nodepools (only if enabling secure boot), and Availability Sets are not yet supported.
- K8s version requirement: k8s >= 1.25
- Public preview feature requires preview flag: `TrustedLaunchPreview`

## Enablement on AKS

Customers enable Trusted Launch on nodepools by adding flags `--enable-vtpm` and `--enable-secure-boot` to `az aks create` for new clusters or `az aks nodepool add` on existing clusters.

### Create a new cluster with Trusted Launch enabled on all nodepools

Each flag is independent, either can be excluded.

`az aks create �g myResourceGroup �n myAKSCluster --enable-vtpm --enable-secure-boot`

### Create a new nodepool with Trusted Launch enabled

Use `az aks nodepool add` with `--enable-vtpm` option to enable vTPM for a new nodepool and `--enable-secure-boot` to enable secure boot.

`az aks nodepool add --cluster-name myAKSCluster --resource-group myResourceGroup --nodepool-name myNodePool --enable-vtpm --enable-secure-boot`

### Update an existing nodepool to enable Trusted Launch

Use `az aks nodepool update` with `--enable-vtpm` or `--enable-secure-boot` to enable vTPM and/or secure boot on an existing nodepool.

**Note: the nodepool must already have a Trusted Launch node image in order to enable secure boot and/or vTPM.** Therefore, users must first create a new nodepool with the feature flag registered to get the TL image. Afterwards, they may enable/disable as desired.

**Note: TL update operations will automatically trigger a signal reimage**.
The reimage should not result in any downtime but the update may take some time (same time as creating a new nodepool).

```
az aks nodepool update �-cluster-name myCluster �g myResourceGroup �n mynodepool --enable-vtpm 
az aks nodepool update -�cluster-name myCluster �g myResourceGroup �n mynodepool --enable-secure-boot 
```

### Update an existing nodepool to disable Trusted Launch

Trusted Launch can be disabled at the nodepool level.

```
az aks nodepool update �-cluster-name myCluster �g myResourceGroup �n mynodepool �-disable-vtpm
az aks nodepool update �-cluster-name myCluster �g myResourceGroup �n mynodepool �-disable-secure-boot
```

## Confirm Trusted Launch Enabled

Customers can only enable vTPM and secure boot if they are on a trusted launch enabled image. Confirm that Trusted Launch is enabled on a node by running the following command:

```
kubectl get nodes
kubectl describe node {node-name} | grep -e node-image-version -e security-type
```

TL nodes should have the following labels:

- TL VHD image
- Security-type: Trusted Launch

```bash
# Note: cblmariner/azure linux nodes will have a different image but should still contain 'TL'
  - node-image-version=AKSUbuntu-2204-gen2TLcontainerd
  - security-type=TrustedLaunch
```

To check if secure boot and/or vTPM are enabled:

```
az aks show -g $RESOURCE_GROUP -n $CLUSTER_NAME | grep securityProfile -A 4
```

Should see an output like below if secure boot and vTPM are enabled:

```
  "securityProfile": {
    "enableSecureBoot": true,
    "enableVtpm": true,
    "sshAccess": "LocalUser"
  },
```

Another method is to find the cluster in ASI, inspect the nodepool and check if "vTPM Enabled" or "Secure Boot Enabled" features are enabled.
![ASI.png](/.attachments/ASI-f03e54ab-2253-45c2-ae05-91968580ba94.png)

# Troubleshooting

The following include possible errors that customers may face and how they can be resolved.

**Problem**: If creation times out, this is likely an indicator that CSE attempted to install an unsigned driver while Secure Boot was enabled.

Search the logs by operation and check for Internal Server Errors during VMSS creation with error messages related to "secure boot".

[link to query](https://kusto.azure.com/clusters/aks/databases/AKSprod?query=H4sIAAAAAAAAA2WPQUvDQBCF7%2F0VY04tRKoERQ8V0hLFQ6tg%2F8BmM00HdmfL7G50xR%2FvBrERPA289%2BabN5HJMTyK49Bwt8kDP0KtAw0UUgm1T6z%2FqS8DilHJ9tIMyMHPvuD9iIKwf942b%2Ft6%2BwoPoHo3r46L2XIJv7ZHGUjjOpLpQGeqIvZQ3N1cX91W91Vx5gh6F0Xjk7h42imLsFpBYcikk%2BJL6aekwQENXGSX%2BOBG3UdrldAn5guRw3wBbQLr%2B%2FInW04lSziQwRGfPWLcRduinNF5509JjzpmsXUujFecdCgjeXq5Q6%2B%2FAVHiQPhPAQAA)

```
union FrontEndContextActivity, AsyncContextActivity, OverlaymgrEvents
| where TIMESTAMP > ago(3h)
| where resourceGroupName == "{RESOURCE GROUP}"
| where level != "info"
| summarize count() by msg, level, TIMESTAMP, fileName, lineNumber
| where msg contains "secure boot"
| order by TIMESTAMP desc

```

You may see an error message about unsigned drivers with secure boot enabled like below.

```
The kernel module failed to load. Secure boot is enabled on this system, so this is likely because it was not signed by a key that is trusted by the kernel.
```

One known case of this is regarding GPU drivers which cannot be installed when secure boot is enabled if they are unsigned. There has been validation added to prevent this failure scenario, but additional unsigned kernel modules may later be added to AKS's node provisioning scripts resulting in a similar error. If a customer were to try and install an unsigned driver themselves, they will also receive the same error if secure boot is enabled.

**Solution**: Turn secure boot off.

For GPU's specifically, follow instructions to install gpu operator if they would like to enable secure boot on gpu nodepools: <https://learn.microsoft.com/en-us/azure/aks/gpu-cluster?tabs=add-ubuntu-gpu-node-pool#use-nvidia-gpu-operator-with-aks>.

## Owner and Contributors

**Owner:** Jordan Harder <joharder@microsoft.com>
**Contributors:**

- Jordan Harder <joharder@microsoft.com>