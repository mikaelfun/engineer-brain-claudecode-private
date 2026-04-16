# AKS 网络连通性通用 — vnet — 排查工作流

**来源草稿**: ado-wiki-acr-content-trust-delegation.md, ado-wiki-agic-private-ip-only-workaround.md, mslearn-same-vnet-connectivity.md
**Kusto 引用**: 无
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: ACR Content Trust Delegation - Demo and FAQ
> 来源: ado-wiki-acr-content-trust-delegation.md | 适用: 适用范围未明确

### 排查步骤

#### ACR Content Trust Delegation - Demo and FAQ

We often get queries on ACR with Content Trust and how Notary is created and how delegation works. Followed by we also get queries on automation of the delegation. This document will give you fair idea on how delegation works and how ACR and Notary works together.

#### What you need to know?

ACR and Notary (Content Trust) are two standalone service that do not bother each other. Basically, registry provides image service and notary provides signature service. Both services maintain individual tagging systems. Like the `RegistryID` for registries, Notary has a `NotaryID`. When we enable a content trust, our RP allocates a new NotaryID for you and marks the registry is content trust enabled.

#### How Content Trust works?

Docker Content Trust (DCT) provides the ability to use digital signatures for data sent to and received from remote Docker registries. These signatures allow client-side or runtime verification of the integrity and publisher of specific image tags.

##### Image TAG and DCT

An individual image record has the following identifier: `{registry}/{repository}:{tag}`

A particular image REPOSITORY can have multiple tags. DCT is associated with the TAG portion of an image. Each image repository has a set of keys that image publishers use to sign an image tag.

**IMPORTANT NOTE: When you run `docker trust sign`, the Docker client actually pushes the image as an untrusted image (or namely, unsigned image) to the registry service, and then signs it and publishes it to the notary service (i.e. content trust service).**

#### Keys and their role in Content Trust

Trust for an image tag is managed through the use of signing keys:

- **Root key**: Root of DCT for an image tag. Signs the root metadata file. Held by collection owner, should be kept offline.
- **Snapshot key**: Signs snapshot metadata file (enumerates filenames, sizes, hashes of root/targets/delegation metadata). Held by collection owner or Notary service.
- **Timestamp key**: Signs timestamp metadata file (freshness guarantees). Held by Notary service for automatic re-generation.
- **Targets key**: Signs targets metadata file (lists filenames and hashes). Held by collection owner/administrator.
- **Delegation keys**: Sign delegation metadata files. Held by collaborators.

#### How does delegation work

Pre-requisites for Signing an image:
- Azure Container Registry (Docker Trusted Registry)
- Notary Server attached to the Registry (enabled via Content Trust in ACR)
- Delegated Key Pair (generated via `docker trust key generate`, CA, or Docker EE UCP)

#### Content Trust Walkthrough

1. Create ACR with Premier SKU and enable Content Trust
2. Authenticate to ACR (`docker login`)
3. Generate Delegation Key: `docker trust key generate <username>`
   - **Note: Admin account does not support signer permission. Must grant signer permission via RBAC.**
4. Add signer to repository: `docker trust signer add --key <pub-key> <signer-name> <repo>`
   - This initializes the repository (same as `notary init <gun>`)
5. Build image: `docker build -t <acr>.azurecr.io/<repo>:<tag>`
6. Sign image: `docker trust sign <acr>.azurecr.io/<repo>:<tag>`
7. Verify: `docker trust inspect --pretty <acr>.azurecr.io/<repo>:<tag>`

##### What happens when you run `docker trust sign`?
1. Docker client pushes the image as untrusted to the registry
2. Then signs it and publishes to Notary service
3. Since signed image = untrusted image + signature, you can pull with `DOCKER_CONTENT_TRUST=0`
4. This is By Design as a docker client feature

#### Key FAQs

- **ACR supports all Notary APIs** — any feature supported by docker client is supported
- **Notary client is NOT officially supported by ACR** — notary client itself is problematic
- **Trust pinning NOT supported by docker CLI** — only available via Notary client
- **Consumer must enable content trust** to pull signed images only; uses TOFU security model
- **HTTPS/SSL ensures metadata transferred from Microsoft** but cannot ensure image origin
- **To verify image origin**: pull with trust → identify signer public key → verify against root role

#### Automation: Delegation via Pipeline

##### Roles
- **Alice (admin team)**: Holds root keys, repository keys; creates/distributes delegation keys
- **Bob (dev team)**: Holds delegation key; builds, pushes, signs images

##### Proposed Solution
1. Alice creates root key → stores in Key Vault (global across registries)
2. On repo init: retrieve root key → create repo key → store in KV → initialize repo
3. On delegation grant: create key pair for Bob → add Bob's public key as signer → publish to ACR → send key pair
4. On delegation revocation: retrieve repo key → remove Bob → publish → inform Bob
5. Bob pushes untrusted → signs with delegation key → publishes trust collection

**Notes:**
- Both Alice and Bob need `AcrImageSigner` and `AcrPush` roles
- RBAC is registry-wise — Bob could init a repo before Alice; Alice with `Owner` role can delete via `DELETE /v2/<GUN>/_trust/tuf/`

#### Storage Summary

| Client Side | ACR Server Side |
|---|---|
| All metadata files | |
| Private key of root role | Private key of snapshot role |
| Private key of targets role | Private key of timestamp role |
| Private keys of delegation roles | |

#### Public APIs

- `POST|DELETE /v2/{gun}/_trust/tuf/`
- `GET /v2/{gun}/_trust/tuf/{role}.json`
- `GET /v2/{gun}/_trust/tuf/{role}.{checksum}.json`
- `GET /v2/{gun}/_trust/tuf/{version}.{role}.json`
- `GET|POST /v2/{gun}/_trust/tuf/{role}.key`
- `GET /v2/{gun}/_trust/changefeed`
- `GET /v2/_trust/changefeed`

---

## Scenario 2: AGIC with private IP only - How to overcome the limitation
> 来源: ado-wiki-agic-private-ip-only-workaround.md | 适用: 适用范围未明确

### 排查步骤

#### AGIC with private IP only - How to overcome the limitation

#### Scope

Using AGIC with private IP address only is NOT supported natively. The workaround involves creating the Application Gateway with a mandatory public IP, then blocking it at NSG level so only the private IP is functional.

#### Scenario

- Create a VNET with two subnets for Cluster and Application Gateway
- Create the public IP which is mandatory
- Create the NSG and associate it to the subnet of Application Gateway
- Add the deny rule for the public IP address that will be assigned to the Application Gateway
- Add the mandatory rule in NSG as per https://docs.microsoft.com/en-us/azure/application-gateway/configuration-infrastructure#network-security-groups
- Create a managed identity for AKS cluster with existing VNET/subnet
- Create the AKS cluster
- Create the Application Gateway
- Enable AGIC addon

#### Script

```bash
#Setting environment variables
LOCATION=westeurope
RESOURCEGROUP=agic-rg

az group create --name $RESOURCEGROUP --location $LOCATION
az network vnet create --resource-group $RESOURCEGROUP --name agic-vnet --address-prefixes 10.0.0.0/8
az network vnet subnet create --resource-group $RESOURCEGROUP --vnet-name agic-vnet --name appgw-subnet --address-prefixes 10.2.0.0/16
az network vnet subnet create --resource-group $RESOURCEGROUP --vnet-name agic-vnet --name aks-subnet --address-prefixes 10.240.0.0/16
az network public-ip create -n appgw-pip -g $RESOURCEGROUP --allocation-method Static --sku Standard
az network nsg create -g $RESOURCEGROUP -n nsg
az network vnet subnet update --resource-group $RESOURCEGROUP --vnet-name agic-vnet --name appgw-subnet --network-security-group nsg

appgwpip_IP=$(az network public-ip show -g $RESOURCEGROUP -n appgw-pip --query ipAddress | sed 's/"//g')
az network nsg rule create -g $RESOURCEGROUP --nsg-name nsg -n DenyAppGwPip --priority 100 --source-address-prefixes '*' --source-port-ranges '*' --destination-address-prefixes $appgwpip_IP/32 --destination-port-ranges '*' --access Deny --protocol '*' --description "Deny Application Gateway's Public IP address"
az network nsg rule create -g $RESOURCEGROUP --nsg-name nsg -n Mandatory --priority 4096 --source-address-prefixes 'GatewayManager' --source-port-ranges '*' --destination-address-prefixes '*' --destination-port-ranges 65200-65535 --access Allow --protocol TCP --description "Mandatory GatewayManager"

az identity create --name AKSIdentity --resource-group $RESOURCEGROUP

aksidentity_ID=$(az identity show -n AKSIdentity -g $RESOURCEGROUP -o tsv --query "id")
akssubnet_ID=$(az network vnet subnet show -g $RESOURCEGROUP -n aks-subnet --vnet-name agic-vnet -o tsv --query "id")
az aks create -n aks-agic -g $RESOURCEGROUP --network-plugin azure --enable-managed-identity --assign-identity $aksidentity_ID --vnet-subnet-id $akssubnet_ID
az network application-gateway create -n appgw-agic -g $RESOURCEGROUP --sku Standard_v2 --public-ip-address appgw-pip --vnet-name agic-vnet --subnet appgw-subnet --private-ip-address 10.2.0.10

appgw_ID=$(az network application-gateway show -n appgw-agic -g $RESOURCEGROUP -o tsv --query "id")
az aks enable-addons -n aks-agic -g $RESOURCEGROUP -a ingress-appgw --appgw-id $appgw_ID
```

#### Testing

To expose the application privately, add the ingress annotation:
```
appgw.ingress.kubernetes.io/use-private-ip: "true"
```

Reference: https://docs.microsoft.com/en-us/azure/application-gateway/ingress-controller-annotations#use-private-ip

#### Conclusion

The public IP address still exists as a resource in Azure, but it is not functional as it is blocked at NSG level, thus the application gateway is usable via the private IP address only.

---

## Scenario 3: Troubleshooting Flow
> 来源: mslearn-same-vnet-connectivity.md | 适用: 适用范围未明确

### 排查步骤

##### Step 1: Basic Connectivity Test
Verify basic outbound connectivity from pod. See [Basic troubleshooting of outbound AKS cluster connections](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/basic-troubleshooting-outbound-connections).

##### Step 2: Private Endpoint
If connection goes through private endpoint, follow [Troubleshoot Azure Private Endpoint connectivity problems](https://learn.microsoft.com/en-us/azure/private-link/troubleshoot-private-endpoint-connectivity).

##### Step 3: VNet Peering
If connection uses VNet peering, follow [Troubleshoot connectivity between peered VNets](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-troubleshoot-peering-issues).

##### Step 4: Check NSG Rules
1. Portal > Virtual machine scale sets > select instance > Networking
2. Check **Outbound port rules** tab for two NSG rule sets:
   - **Subnet-level NSG** (`<my-aks-nsg>`): custom NSG on AKS subnet
   - **NIC-level NSG** (`aks-agentpool-*-nsg`): managed by AKS
3. Check for custom Deny rules with higher priority blocking traffic
4. Verify required outbound rules per [AKS outbound rules](https://learn.microsoft.com/en-us/azure/aks/outbound-rules-control-egress)

---
