---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/How Tos/Build an ACR image with Docker BuildKit and pass a secret"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FBuild%20an%20ACR%20image%20with%20Docker%20BuildKit%20and%20pass%20a%20secret"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Building images for ACR using Docker BuildKit

This article shows how to build an ACR image with Docker BuildKit.

In Azure DevOps if you want to enable BuildKit based docker builds and pass a secret, set the DOCKER_BUILDKIT variable. An example is found at <https://docs.microsoft.com/en-us/azure/devops/pipelines/ecosystems/containers/build-image?view=azure-devops#how-do-i-set-the-buildkit-variable-for-my-docker-builds>:

```yaml
trigger:
- main
   
pool:
  vmImage: 'ubuntu-latest'
   

variables:
  imageName: 'pipelines-javascript-docker'
  DOCKER_BUILDKIT: 1
    
steps:
- task: Docker@2
  displayName: Build an image
  inputs:
    repository: $(imageName)
    command: build
    Dockerfile: app/Dockerfile
    arguments: '--secret id=CONAN_API_TOKEN,src=conan-api-token.txt  --secret id=AZURE_PJMP_TOKEN,src=azure-token.txt'
```

## ACR task with BuildKit and pass a secret from a repository

Create a directory with these files:

1. task.yaml

    ```yaml
    version: v1.1.0
    
    steps:
     - build: -t $Registry/hello-world:{{.Run.ID}} --secret id=mysecret,src=mysecret.txt --secret id=mysecret2,src=mysecret2.txt .
       env: ["DOCKER_BUILDKIT=1"]
     - push:
         - $Registry/hello-world:{{.Run.ID}}
    ```

2. Dockerfile

    ```dockerfile
    FROM ubuntu
    RUN --mount=type=secret,id=mysecret,uid=1001
    RUN --mount=type=secret,id=mysecret2,uid=1001
    ```

3. Run commands:

    ```sh
    az acr run --registry <acrname> -f task.yaml .
    ```

    Or create and run a task:

    ```sh
    az acr task create \
        --image hello-world:{{.Run.ID}} \
        --name <task-name> --registry <acrname> \
        --context /dev/null \
        --file task.yaml \
        --commit-trigger-enabled false
    ```

    ```sh
    az acr task run -n <task-name> -r <acrname> --context . -f task.yaml
    ```

## ACR task with BuildKit and pass a secret from Azure Keyvault

1. task.yaml

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

2. Grant managed identity access to key vault:

    ```sh
    az keyvault set-policy --name mykeyvault \
      --resource-group myResourceGroup \
      --object-id $ManagedIdentity-Object(principal)ID \
      --secret-permissions get
    ```

## ACR task with BuildKit, pass a secret from Azure Keyvault, and enable git-lfs

Add git-lfs step before build:

```yaml
steps:
  - cmd: acb -c "git lfs install && git lfs pull"
    entryPoint: /bin/sh
  - build: ...
```

## Notes

1. You need to grant the managed identity a get permission to read secrets from Azure key vault.
2. Each ACR Task has an associated source code context — the location of a set of source files used to build a container image or other artifact.

## References

1. [YAML reference - ACR Tasks](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-tasks-reference-yaml)
2. [Azure-Samples/acr-tasks](https://github.com/Azure-Samples/acr-tasks)
3. [Build images with BuildKit](https://docs.docker.com/develop/develop-images/build_enhancements/#new-docker-build-secret-information)
4. [Managed identity in ACR task](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-tasks-authentication-managed-identity)
5. [Grant identity access to key vault](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-tasks-authentication-key-vault#grant-identity-access-to-key-vault-1)
