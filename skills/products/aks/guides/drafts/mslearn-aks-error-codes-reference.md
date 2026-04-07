# AKS Common Error Codes Reference

> Source: [AKS common error codes](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/aks-error-code-page)
> Type: guide-draft (reference table)

## Overview

Comprehensive index of AKS error codes organized by category with descriptions and mitigation links.

## A-K Error Codes

| Error Code | Category | Summary |
|---|---|---|
| AADSTS7000222 / BadRequest / InvalidClientSecret | Auth | Expired/invalid service principal credentials |
| AKSCapacityError / AksCapacityHeavyUsage | Capacity | Insufficient Azure capacity in target region |
| AKSOperationPreempted | Operations | Operation interrupted by higher priority operation |
| AKS upgrade blocked | Upgrade | Version skew, incompatibility, unsupported upgrade path |
| Argument list too long | Application | Command line args exceed system limits in containers |
| AvailabilityZoneNotSupported | Creation | VM size/region doesn't support specified AZ |
| CannotDeleteLoadBalancerWithPrivateLinkService | Networking | Active private endpoint connections prevent deletion |
| Changing property imageReference not allowed | Upgrade | Attempting to change immutable VM properties |
| CniDownloadTimeoutVMExtensionError (41) | Provisioning | Network issues preventing CNI plugin download |
| CreateOrUpdateVirtualNetworkLinkFailed | DNS | Insufficient permissions on private DNS zones |
| CustomPrivateDNSZoneMissingPermissionError | DNS | SP lacks permissions on private DNS zone |
| DnsServiceIpOutOfServiceCidr | Networking | DNS service IP outside service CIDR range |
| ERR_VHD_FILE_NOT_FOUND (65) | Provisioning | Node image VHD unavailable |

## L-S Error Codes

| Error Code | Category | Summary |
|---|---|---|
| LinkedAuthorizationFailed | Auth | Insufficient permissions for cross-subscription resources |
| LoadBalancerInUseByVirtualMachineScaleSet | Networking | LB actively used by VMSS |
| Missing or invalid service principal | Auth | SP doesn't exist, expired, or lacks permissions |
| MissingSubscriptionRegistration | Setup | Required resource providers not registered |
| NodePoolMcVersionIncompatible | Upgrade | Node pool version incompatible with control plane |
| OperationIsNotAllowed | Operations | Operation conflicts with cluster state |
| OperationNotAllowed / PublicIPCountLimitReached | Quota | Public IP quota exceeded |
| OutboundConnFailVMExtensionError (50) | Connectivity | Firewall/NSG/routing prevents outbound connections |
| QuotaExceeded / InsufficientVCPUQuota | Quota | Insufficient vCPU quota |
| RequestDisallowedByPolicy | Policy | Azure policy blocks the request |
| ServiceCidrOverlapExistingSubnetsCidr | Networking | K8s service CIDR conflicts with subnet |
| SubnetIsFull | Networking | All IPs in subnet allocated |
| SubscriptionRequestsThrottled (429) | Throttling | Rate limit exceeded |

## T-Z Error Codes

| Error Code | Category | Summary |
|---|---|---|
| Throttled (429) | Throttling | Azure API throttling |
| TLS: client offered only unsupported versions | Security | TLS version mismatch |
| UnsatisfiablePDB | Upgrade | PDB constraints prevent node operations |
| VirtualNetworkNotInSucceededState | Networking | VNet in failed/updating state |
| VMExtensionProvisioningTimeout | Provisioning | Extension installation exceeded timeout |
| WINDOWS_CSE_ERROR_CHECK_API_SERVER_CONNECTIVITY (5) | Connectivity | Windows node API server connectivity check fails |
| ZonalAllocationFailed | Capacity | VM allocation fails due to capacity/zone constraints |
