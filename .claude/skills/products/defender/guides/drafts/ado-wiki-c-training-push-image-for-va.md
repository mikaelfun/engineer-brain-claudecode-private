---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Containers/[Troubleshooting Guide] - Azure Container Registry (ACR) vulnerability assessment (VA)/[Training] Push Container image to get Vulnerability assessment(VA) results in your Lab environment"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Containers%2F%5BTroubleshooting%20Guide%5D%20-%20Azure%20Container%20Registry%20(ACR)%20vulnerability%20assessment%20(VA)%2F%5BTraining%5D%20Push%20Container%20image%20to%20get%20Vulnerability%20assessment(VA)%20results%20in%20your%20Lab%20environment"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Push Container Image to ACR for VA Results (Lab Setup)

## Prerequisites
- Azure Subscription
- Azure Container Registry (ACR)
- Linux VM (Ubuntu) with Docker installed

## Steps

1. **Create ACR**: Use Azure portal quickstart
2. **Install Docker** on Linux VM:
   ```bash
   sudo apt install docker.io
   ```
3. **Login to ACR** (Admin account method):
   - Azure Portal > Container Registry > Settings > Access keys > Enable Admin User
   ```bash
   sudo docker login <ACR_NAME>.azurecr.io
   ```
4. **Pull image** from Docker Hub:
   ```bash
   sudo docker pull nginx
   ```
5. **Tag image** for ACR:
   ```bash
   sudo docker tag nginx <ACR_NAME>.azurecr.io/samples/nginx
   ```
6. **Push image** to ACR:
   ```bash
   sudo docker push <ACR_NAME>.azurecr.io/samples/nginx
   ```
7. **Verify**: Azure Portal > ACR > Services > Repositories > "samples/nginx"

## Check VA Findings
Defender for Cloud > Recommendations > "Azure registry container images should have vulnerabilities resolved" > Select ACR

## Troubleshooting
If image pushed but no findings / wrong findings / delayed findings:
- Follow the Containers VA powered by MDVM TSG
