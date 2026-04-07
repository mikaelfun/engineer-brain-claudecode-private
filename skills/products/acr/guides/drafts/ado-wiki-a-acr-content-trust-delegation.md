---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/How Tos/ACR Content Trust Delegation Demo and FAQs"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Content%20Trust%20Delegation%20Demo%20and%20FAQs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ACR Content Trust Delegation — Demo and FAQ

Reference guide for CSS handling Content Trust, Notary delegation, key management, and automation scenarios.

## Key Concepts

### ACR and Notary are Separate Services

ACR (registry service) and Notary (signature/content trust service) are two standalone services that do not interfere with each other. When Content Trust is enabled on an ACR, the RP allocates a new **NotaryID** and marks the registry as content trust enabled.

### How Docker Content Trust (DCT) Works

DCT provides digital signatures for data sent to/received from remote Docker registries, allowing client-side or runtime verification of image integrity and publisher identity.

**Important:** When you run `docker trust sign`, the Docker client:
1. Pushes the image as an **untrusted** (unsigned) image to the registry service
2. Signs it and publishes the signature to the Notary service (content trust service)

This means a signed image is essentially an unsigned image + a Notary signature. You can pull the unsigned image with `DOCKER_CONTENT_TRUST=0`.

### TUF Key Roles

| Key | Held By | Purpose |
|-----|---------|---------|
| Root key | Collection owner (offline) | Root of all trust; signs root metadata |
| Snapshot key | Owner/admin OR Notary service | Signs snapshot metadata file |
| Timestamp key | **Notary service** | Provides freshness guarantees; auto-regenerated |
| Targets key | Collection owner/admin | Signs targets metadata; delegates to collaborators |
| Delegation keys | Collaborators | Signs delegation metadata files |

**Client-side vs Server-side storage (default):**

| Client Side | ACR Server Side |
|-------------|-----------------|
| All metadata files | — |
| Private key of root role | Private key of snapshot role |
| Private key of targets role | Private key of timestamp role |
| Private keys of delegation roles | — |

## Content Trust Walkthrough

### Prerequisites

- Azure Container Registry with **Premium SKU** and Content Trust enabled
- Notary server (ACR allocates this automatically when Content Trust is enabled)
- Delegation key pair (generated via `docker trust key generate`, CA, or Docker EE UCP)

### Step-by-Step: Enabling and Signing

1. **Enable Content Trust** on the registry: <https://learn.microsoft.com/en-us/azure/container-registry/container-registry-content-trust>

2. **Authenticate** to the ACR: `docker login <acr-name>.azurecr.io`

3. **Generate a delegation key:**
   ```bash
   docker trust key generate <signer-username>
   ```
   > **Note:** Admin account does NOT support signer permission. Use a Service Principal with AcrImageSigner role.
   > Grant signer permission: <https://docs.microsoft.com/en-us/azure/container-registry/container-registry-content-trust#grant-image-signing-permissions>

4. **Add yourself as signer to the repository** (also initializes the repository, equivalent to `notary init <gun>`):
   ```bash
   docker trust signer add --key <pub-key> <signer-name> <registry>/<repo>
   ```

5. **Build the image** (if needed):
   ```bash
   docker build -t <acr-name>.azurecr.io/acr-ct-test:tag1
   ```

6. **Sign the image:**
   ```bash
   DOCKER_CONTENT_TRUST=1
   docker trust sign <acr-name>.azurecr.io/acr-ct-test:tag1
   ```

7. **Verify signature and signers:**
   ```bash
   docker trust inspect --pretty <acr-name>.azurecr.io/acr-ct-test:tag1
   ```

### Pull Behavior

- `DOCKER_CONTENT_TRUST=1` → Client pulls trust metadata from Notary, verifies, gets digest, pulls image by digest
- `DOCKER_CONTENT_TRUST=0` (or digest given directly) → Docker skips Notary verification and pulls directly

## FAQs

**Q: Does ACR support Notary APIs?**
A: Yes, ACR supports all Notary APIs. Any feature supported by the Docker client is supported.

**Q: Can the Notary client be used to test delegation?**
A: No. The Notary client is not officially supported by ACR as it has known issues.

**Q: Is Notary trust pinning supported by Docker CLI?**
A: No. Trust pinning is only available to the Notary client, not the Docker client. [Open issue](https://github.com/docker/cli/issues/84).

**Q: What public Notary APIs does ACR expose?**
```
POST|DELETE /v2/{gun}/_trust/tuf/
GET /v2/{gun}/_trust/tuf/{role}.json
GET /v2/{gun}/_trust/tuf/{role}.{checksum}.json
GET /v2/{gun}/_trust/tuf/{version}.{role}.json
GET|POST /v2/{gun}/_trust/tuf/{role}.key
GET /v2/{gun}/_trust/changefeed
GET /v2/_trust/changefeed
```

**Q: When `docker trust signer add` is run, is it the same as `notary init <GUN>`?**
A: Yes, it includes `notary init <GUN>` as its first step.

**Q: How to check who signed the repository and who can sign new tags?**
A: `docker trust inspect --pretty <registry>/<repo>:<tag>` gives JSON information on signed repositories, all signed tags, who signed them, and who can sign new tags.

**Q: How can we verify the origin of an image from a specific ACR?**
A: Steps:
1. Pull the image with content trust enabled
2. Run `docker trust inspect` to get the public key ID of the signer
3. Identify the public key in `root.json` according to the key ID
4. Verify the public key of the signer matches the expected signer from `<acr-name>`

Note: HTTPS/SSL only ensures metadata was transferred from Microsoft servers. Content Trust (via TOFU — Trust On First Use) validates the signing chain after the initial trust establishment.

**Q: How to automate delegation in ACR with Content Trust?**
A: See: <https://docs.docker.com/engine/security/trust/trust_automation/>

## Automation Pattern for Pipeline Signing

### Scenario
- **Alice** (admin team): holds/creates all root keys and repository keys; creates and distributes delegation keys
- **Bob** (dev team): holds delegation key; builds, pushes, and signs images

### Proposed Solution

**Repository initialization by Alice:**
1. Retrieve root key from Azure Key Vault
2. Create a repository key and store in Key Vault
3. Use root key + repository key to initialize the repository

**Delegation grant to Bob by Alice:**
1. Create a private/public key pair for Bob
2. Retrieve repository key from Key Vault
3. Add Bob's public key to the trust collection as a new signer
4. Publish changes to ACR
5. Send Bob's key pair to Bob securely

**Trusted image push by Bob:**
1. Push image as untrusted to ACR
2. Sign image using his delegation key
3. Publish trust collection change to ACR

**Notes:**
- Both Alice and Bob need Service Principals with `AcrImageSigner` and `AcrPush` roles
- RBAC is registry-wide, so any user with these roles can initialize arbitrary repositories
- If Bob initializes before Alice, Alice (with Owner role) can delete the trust collection via `DELETE /v2/<GUN>/_trust/tuf/`
