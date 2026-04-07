---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Container Storage Enabled by Azure Arc/Troubleshooting Guide"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Container%20Storage%20Enabled%20by%20Azure%20Arc%2FTroubleshooting%20Guide"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure Container Storage Enabled by Azure Arc — Troubleshooting Guide

## Step 1: Get the error from the Azure Portal

Check the Azure Portal for error messages related to PVC/volume provisioning.

## Step 2: Query volumes and namespace

```bash
kubectl describe pvc <PersistentVolumeClaim> -n <namespace>
```

## Step 3: Show detailed info about the volume claim in the namespace

```bash
kubectl describe pvc <PersistentVolumeClaim> -n <namespace>
```

## Step 4: Get the volume attachment

A VolumeAttachment is a Kubernetes object that represents the intent to attach (or detach) a PersistentVolume (PV) to a specific node. It is automatically created by Kubernetes when a Pod using a PV is scheduled.

```bash
kubectl get volumeattachment
```

## Step 5: Collect the CSI Controller logs

```bash
$pod = kubectl get pod -n kube-system -l app=csi-akshcicsi-controller -o jsonpath="{.items[0].metadata.name}"
kubectl logs $pod -n kube-system -c akshcicsi > .\csilog.txt
```

## Force delete stuck volumes

```bash
kubectl delete pod testlocalsharededgevol-deployment-7b9bf9bbbf-k9xfn -n sts --force --grace-period=0
kubectl delete pod testlocalsharededgevol-deployment-7b9bf9bbbf-z4s4f -n sts --force --grace-period=0
kubectl delete pod w-pvc-sts-test-66c8596765-4st9d -n azure-arc-containerstorage --force --grace-period=0
kubectl delete pod w-pvc-sts-test-retain-5fb5ff86f7-6vlmc -n azure-arc-containerstorage --force --grace-period=0
```

## Log Collection Commands

```bash
kubectl describe pvc <PVC_NAME> -n sts
kubectl describe pvc <PVC_NAME> -n azure-arc-containerstorage
kubectl describe pvc <PVC_NAME> -n <NAMESPACE>
kubectl cluster-info dump -A > k8s.debug
```
