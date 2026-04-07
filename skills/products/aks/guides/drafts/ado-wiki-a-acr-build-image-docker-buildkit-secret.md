---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/How Tos/Build an ACR image with Docker BuildKit and pass a secret"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR/How%20Tos/Build%20an%20ACR%20image%20with%20Docker%20BuildKit%20and%20pass%20a%20secret"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Building images for ACR using Docker BuildKit

[[_TOC_]]

This article shows how to build an ACR image with Docker BuildKit and pass secrets.

In Azure DevOps, enable BuildKit by setting `DOCKER_BUILDKIT: 1` variable:
```yaml
variables:
  DOCKER_BUILDKIT: 1
steps:
- task: Docker@2
  inputs:
    command: build
    arguments: '--secret id=CONAN_API_TOKEN,src=conan-api-token.txt'
```

## Scenario 1: ACR task with BuildKit and pass a secret from a repository

**task.yaml:**
```yaml
version: v1.1.0
steps:
 - build: -t $Registry/hello-world:{{.Run.ID}} --secret id=mysecret,src=mysecret.txt --secret id=mysecret2,src=mysecret2.txt .
   env: ["DOCKER_BUILDKIT=1"]
 - push:
     - $Registry/hello-world:{{.Run.ID}}
```

**Dockerfile:**
```dockerfile
FROM ubuntu
RUN --mount=type=secret,id=mysecret,uid=1001
RUN --mount=type=secret,id=mysecret2,uid=1001
```

**Run the task:**
```sh
# Quick run
az acr run --registry <acrname> -f task.yaml .

# Create and run task
az acr task create \
    --image hello-world:{{.Run.ID}} \
    --name <task-name> --registry <acrname> \
    --context /dev/null \
    --file task.yaml \
    --commit-trigger-enabled false

az acr task run -n <task-name> -r <acrname> --context . -f task.yaml
```

## Scenario 2: ACR task with BuildKit and pass a secret from Azure Key Vault

**task.yaml:**
```yaml
version: v1.1.0
secrets:
  - id: sampleSecret
    keyvault: https://<keyvault-name>.vault.azure.net/secrets/SampleSecret
  - id: mysecret
    keyvault: https://<keyvault-name>.vault.azure.net/secrets/mysecret

volumes:
  - name: mysecrets
    secret:
      mysecret1: {{.Secrets.sampleSecret | b64enc}}
      mysecret2: {{.Secrets.mysecret | b64enc}}

steps:
  - build: -t $Registry/hello-world:{{.Run.ID}} --secret id=mysecret1,src=/run/test/mysecret1 --secret id=mysecret2,src=/run/test/mysecret2 -f Dockerfile .
    env: ["DOCKER_BUILDKIT=1"]
    volumeMounts:
      - name: mysecrets
        mountPath: /run/test
  - push:
     - $Registry/hello-world:{{.Run.ID}}
```

**Create and run:**
```sh
az acr task create \
    --image hello-world:{{.Run.ID}} \
    --name <task-name> --registry <acrname> \
    --context /dev/null \
    --file task.yaml \
    --commit-trigger-enabled false \
    --assign-identity <resourceID>

az acr task run -n <task-name> -r <acrname> --context . -f task.yaml
```

**Grant managed identity access to Key Vault:**
```sh
az keyvault set-policy --name mykeyvault \
  --resource-group myResourceGroup \
  --object-id $ManagedIdentity-Object-ID \
  --secret-permissions get

# Get principalID for system-assigned MI
az acr task show \
  --name $task_name --registry $registry_name \
  --query identity.principalId --output tsv
```

## Scenario 3: ACR task with BuildKit, Key Vault secrets, and git-lfs

Add a cmd step for git-lfs installation before the build step:
```yaml
steps:
  - cmd: acb -c "git lfs install && git lfs pull"
    entryPoint: /bin/sh
  - build: -t $Registry/hello-world:{{.Run.ID}} --secret id=mysecret1,src=/run/test/mysecret1 ... -f Dockerfile .
    env: ["DOCKER_BUILDKIT=1"]
    volumeMounts:
      - name: mysecrets
        mountPath: /run/test
  - push:
    - $Registry/hello-world:{{.Run.ID}}
```

## Notes

1. Grant managed identity get permission to read secrets from Azure Key Vault.
2. Each ACR Task has an associated [source code context](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-tasks-overview#context-locations).

## References

1. [YAML reference - ACR Tasks](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-tasks-reference-yaml)
2. [ACR Tasks samples](https://github.com/Azure-Samples/acr-tasks)
3. [BuildKit documentation](https://docs.docker.com/develop/develop-images/build_enhancements/#new-docker-build-secret-information)
4. [Managed identity in ACR task](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-tasks-authentication-managed-identity)
5. [Grant identity access to key vault](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-tasks-authentication-key-vault#grant-identity-access-to-key-vault-1)

## Owner and Contributors

**Owner:** Naomi Priola <Naomi.Priola@microsoft.com>
**Contributors:** Bin Du, Mutaz Nassar
