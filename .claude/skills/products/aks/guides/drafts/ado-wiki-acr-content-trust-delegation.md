---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/How Tos/ACR Content Trust Delegation Demo and FAQs"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR/How%20Tos/ACR%20Content%20Trust%20Delegation%20Demo%20and%20FAQs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ACR Content Trust Delegation - Demo and FAQ

We often get queries on ACR with Content Trust and how Notary is created and how delegation works. Followed by we also get queries on automation of the delegation. This document will give you fair idea on how delegation works and how ACR and Notary works together.

## What you need to know?

ACR and Notary (Content Trust) are two standalone service that do not bother each other. Basically, registry provides image service and notary provides signature service. Both services maintain individual tagging systems. Like the `RegistryID` for registries, Notary has a `NotaryID`. When we enable a content trust, our RP allocates a new NotaryID for you and marks the registry is content trust enabled.

## How Content Trust works?

Docker Content Trust (DCT) provides the ability to use digital signatures for data sent to and received from remote Docker registries. These signatures allow client-side or runtime verification of the integrity and publisher of specific image tags.

### Image TAG and DCT

An individual image record has the following identifier: `{registry}/{repository}:{tag}`

A particular image REPOSITORY can have multiple tags. DCT is associated with the TAG portion of an image. Each image repository has a set of keys that image publishers use to sign an image tag.

**IMPORTANT NOTE: When you run `docker trust sign`, the Docker client actually pushes the image as an untrusted image (or namely, unsigned image) to the registry service, and then signs it and publishes it to the notary service (i.e. content trust service).**

## Keys and their role in Content Trust

Trust for an image tag is managed through the use of signing keys:

- **Root key**: Root of DCT for an image tag. Signs the root metadata file. Held by collection owner, should be kept offline.
- **Snapshot key**: Signs snapshot metadata file (enumerates filenames, sizes, hashes of root/targets/delegation metadata). Held by collection owner or Notary service.
- **Timestamp key**: Signs timestamp metadata file (freshness guarantees). Held by Notary service for automatic re-generation.
- **Targets key**: Signs targets metadata file (lists filenames and hashes). Held by collection owner/administrator.
- **Delegation keys**: Sign delegation metadata files. Held by collaborators.

## How does delegation work

Pre-requisites for Signing an image:
- Azure Container Registry (Docker Trusted Registry)
- Notary Server attached to the Registry (enabled via Content Trust in ACR)
- Delegated Key Pair (generated via `docker trust key generate`, CA, or Docker EE UCP)

## Content Trust Walkthrough

1. Create ACR with Premier SKU and enable Content Trust
2. Authenticate to ACR (`docker login`)
3. Generate Delegation Key: `docker trust key generate <username>`
   - **Note: Admin account does not support signer permission. Must grant signer permission via RBAC.**
4. Add signer to repository: `docker trust signer add --key <pub-key> <signer-name> <repo>`
   - This initializes the repository (same as `notary init <gun>`)
5. Build image: `docker build -t <acr>.azurecr.io/<repo>:<tag>`
6. Sign image: `docker trust sign <acr>.azurecr.io/<repo>:<tag>`
7. Verify: `docker trust inspect --pretty <acr>.azurecr.io/<repo>:<tag>`

### What happens when you run `docker trust sign`?
1. Docker client pushes the image as untrusted to the registry
2. Then signs it and publishes to Notary service
3. Since signed image = untrusted image + signature, you can pull with `DOCKER_CONTENT_TRUST=0`
4. This is By Design as a docker client feature

## Key FAQs

- **ACR supports all Notary APIs** — any feature supported by docker client is supported
- **Notary client is NOT officially supported by ACR** — notary client itself is problematic
- **Trust pinning NOT supported by docker CLI** — only available via Notary client
- **Consumer must enable content trust** to pull signed images only; uses TOFU security model
- **HTTPS/SSL ensures metadata transferred from Microsoft** but cannot ensure image origin
- **To verify image origin**: pull with trust → identify signer public key → verify against root role

## Automation: Delegation via Pipeline

### Roles
- **Alice (admin team)**: Holds root keys, repository keys; creates/distributes delegation keys
- **Bob (dev team)**: Holds delegation key; builds, pushes, signs images

### Proposed Solution
1. Alice creates root key → stores in Key Vault (global across registries)
2. On repo init: retrieve root key → create repo key → store in KV → initialize repo
3. On delegation grant: create key pair for Bob → add Bob's public key as signer → publish to ACR → send key pair
4. On delegation revocation: retrieve repo key → remove Bob → publish → inform Bob
5. Bob pushes untrusted → signs with delegation key → publishes trust collection

**Notes:**
- Both Alice and Bob need `AcrImageSigner` and `AcrPush` roles
- RBAC is registry-wise — Bob could init a repo before Alice; Alice with `Owner` role can delete via `DELETE /v2/<GUN>/_trust/tuf/`

## Storage Summary

| Client Side | ACR Server Side |
|---|---|
| All metadata files | |
| Private key of root role | Private key of snapshot role |
| Private key of targets role | Private key of timestamp role |
| Private keys of delegation roles | |

## Public APIs

- `POST|DELETE /v2/{gun}/_trust/tuf/`
- `GET /v2/{gun}/_trust/tuf/{role}.json`
- `GET /v2/{gun}/_trust/tuf/{role}.{checksum}.json`
- `GET /v2/{gun}/_trust/tuf/{version}.{role}.json`
- `GET|POST /v2/{gun}/_trust/tuf/{role}.key`
- `GET /v2/{gun}/_trust/changefeed`
- `GET /v2/_trust/changefeed`
