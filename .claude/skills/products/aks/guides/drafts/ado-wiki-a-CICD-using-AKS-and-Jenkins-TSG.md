---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Others/CICD using AKS and Jenkins TSG"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Others/CICD%20using%20AKS%20and%20Jenkins%20TSG"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# CI/CD using AKS and Jenkins - TSG

Author: <xinhaoxiong@microsoft.com>

<br>

[[_TOC_]]

<br>

## Summary

This article aims at providing the troubleshoot steps from the ACR and AKS side when a customer has issue with jenkins deploying workloads on an AKS cluster.

**Please note that Jenkins is a third-party software application. According to [Microsoft's support policy](https://learn.microsoft.com/en-us/azure/aks/support-policies), Jenkins' configuration guidance and its own failures are not within Microsoft's support. If you encounter these issues, please advise customers to seek Jenkins community support.**

<br>

## Escalation Paths

* Jenkins related issue --\> [Issue Reporting (jenkins.io)](<https://www.jenkins.io/participate/report-issue/>)

* AKS related issue --\> AKS team

* Couldn't identify the ownership of the issue --> Raise AVA ticket and ping the corresponding [SME team](<https://microsoftapc.sharepoint.com/teams/AzureNetteam-China/Lists/ACT%2520Asia%2520App%2520SME/AllItems.aspx?skipSignal=true>)

<br>

## Verified Learning Resources

* Architecture that intergrates Jenkisn and AKS : [AKS container CI/CD with Jenkins and Kubernetes - Azure Architecture Center \| Microsoft Learn](<https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/container-cicd-using-jenkins-and-kubernetes-on-azure-container-service>)

* Tutorial from Azure: [Tutorial - Deploy from GitHub to Azure Kubernetes Service using Jenkins \| Microsoft Learn](<https://learn.microsoft.com/en-us/azure/developer/jenkins/deploy-from-github-to-aks>)

* Jenkins community doc: [Jenkins User Documentation](<https://www.jenkins.io/doc/>)

* Jenkins demo pipeline script: [JenkinLab/Lab2_Deploy_An_APP_Into_AKS.txt at master · alexxiongxiong/JenkinLab (github.com)](https://github.com/alexxiongxiong/JenkinLab/blob/master/Lab2_Deploy_An_APP_Into_AKS.txt)

<br>

## Important logs for Jenkins troubleshooting

### Logs from Server side

**Pipeline console output:**

Jenkins Dashboard --> One Specific Pipeline --> Build history --> Console Output

### Logs from the Agent side

/$jenkins_user_home_directory/remoting/logs   -->  contains java exceptions happened on the agent host

<br>

## Symptoms

* Jenkins failed to pull source code from GitHub  

* Jenkins failed to build and push Docker container to Azure Container Registry

* Jenkins failed to deploy your new containerized app to Kubernetes on Azure

<br>

### Symptom 1

Jenkins failed to pull source code from GitHub  

### Cause / Mitigation 1

| Issue Type                           | Error messages                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | How to verify that the error message is true                                                                                                                                                                                                                   | Mitigation Steps                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Note                                 |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Authentication failure               | The following error message is displayed in the console output of the pipeline: <br/> {   <br/>"message": "Bad credentials", <br/> "documentation_url": "<https://docs.github.com/rest>"<br/>}                                                                                                                                                                                                                                                                                           | Use the curl command to manually verify that the personal access token is correct<br/> <br/>root@AlexRampUpVM-01:~# curl -H "Authorization: token xxx_replace_your_personal_access_token_xxx" -L <https://api.github.com/repos/alexxiongxiong/wordpress/tarball> | Please ask CX to correct the personal access token of Github repo  [How to get your personal access tokens for GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic) <br/>[How to store GitHub personal access token in Jenkins](https://learn.microsoft.com/en-us/azure/developer/jenkins/deploy-from-github-to-aks#create-a-credential-resource-in-jenkins-for-the-acr-service-principal) | Skip this if cx is using Public repo |
| Jenkins Agent couldn't access Github | The following error message is displayed in the console output of the pipeline:<br/><br/> 16:22:19  Caused by: hudson.plugins.git.GitException: Command "git fetch --tags --progress -- <https://github.com/alexxiongxiong/GoWebApp> +refs/heads/_:refs/remotes/origin/_" returned status code 128: <br/> 16:22:19  stdout: <br/>16:22:19  stderr: fatal: unable to access '<https://github.com/alexxiongxiong/GoWebApp/>': Failed to connect to github.com port 443: Connection timed out | SSH to the Jenkins agent and run telnet to test the connection to the three websites below <br/><br/> Jenkins server IP: Port <br/> <https://github.com><br/> <https://api.github.com><br/>                                                                        | Jenkins Agent needs to access the following websites when pulling repo files from Github <br/><br/> Jenkins server IP: Port<br/> <https://github.com><br/> <https://api.github.com>                                                                                                                                                                                                                                                                                                                             |                                      |

**Note:**

How to verify if source code has been downloaded on the Jenkin agent host successfully?

Check the files under the directory $jenkins_user_home_directory/workspace/<Pipeline Name>

<br>

### Symptom 2

Jenkins failed to build and push Docker container to Azure Container Registry

### Cause / Mitigation 2

| Issue Type                                                 | Error messages                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | How to Verify/test                                                                                                                                                                                                                                                                                                                                  | Mitigation Steps                                                                                                                                     |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wrong SP password                                          | The following error message is displayed in the console output of the pipeline: <br/><br/>15:32:53  + docker login alexrampuptest.azurecr.io -u 5e66ed61-bc8e-4f63-a469-76f1a1c9bf4f -p ****<br/>15:32:53 WARNING! Using --password via the CLI is insecure. Use --password-stdin.<br/>15:32:53 Error response from daemon: Get "<https://alexrampuptest.azurecr.io/v2/>": unauthorized: Invalid clientid or client secret.                                                               | Run the following command to verify if the sp password is correct<br/>az login --service-principal --username \$sp_id --password \$sp_secret --tenant $ten_id<br/><br/>Expected output:<br/>![](/.attachments/2024-01-15-13-34-17-image.png)                                                                                                        | Please ask cx to verify and correct the password of service principal.                                                                               |
| No permission to push the image into ACR                   | The following error message is displayed in the console output of the pipeline: <br/><br/>15:44:37  + docker login alexrampuptest.azurecr.io -u 5e66ed61-bc8e-4f63-a469-76f1a1c9bf4f -p ****<br/>15:44:37  WARNING! Using --password via the CLI is insecure. Use --password-stdin.<br/>15:44:37  Error response from daemon: Get "<https://alexrampuptest.azurecr.io/v2/>": unauthorized: authentication required, visit <https://aka.ms/acr/authorization> for more information.          | 1. Ask CX to provide the Service principal ID which was used to authenticate with ACR<br/>2. Guide CX to login Azure Portal and navigate to ACR page<br/>3. Go to access control(IAM) part and check if any existing role assignment for this SP. at least this SP should have AcrPush role.                                                        | At a minimum, add the "AcrPush" role for this service principal                                                                                      |
| Jenkins agent couldn't connect ACR                         | The following error message is displayed in the console output of the pipeline: <br/><br/>15:38:12  + docker login alexrampuptest.azurecr.io -u 5e66ed61-bc8e-4f63-a469-76f1a1c9bf4f -p ****<br/>15:38:12 WARNING! Using --password via the CLI is insecure. Use --password-stdin.<br/>15:38:12 Error response from daemon: Get "<https://alexrampuptest.azurecr.io/v2/>": denied: client with IP '20.78.92.41' is not allowed access. Refer <https://aka.ms/acr/firewall> to grant access. | 1. Use SSH to connect to the jenkins agent host<br/>2. Run the networking test command "nc -z -v <acr_name>.azurecr.io 443" (If cx is using jenkins built-in agent, please ask cx to add this command in his pipeline script)<br/><br/>Expected output:<br/>Connection to <acr_name>.azurecr.io 443 port [tcp/https] succeeded!                     | The jenkins agent host should be able to connect ACR FQDN. If not, please ask CX to check whether any firewall or NSG rules are blocking the traffic |
| Missing docker command on the Jenkins agent to build image | The following error message is displayed in the console output of the pipeline: <br/><br/>14:53:33  + docker build -t alexrampuptest.azurecr.io/webapp:jenkins19 .<br/><br/>14:53:33  /var/jenkins_home/workspace/Deply a web app into AKS@tmp/durable-4e89bad5/script.sh: 10: docker: not found                                                                                                                                                                                        | By default, Docker will not be installed within jenkins built-in agent, no matter how many plugins with the name "docker" are installed. If the jenkins server is running as a Pod in the AKS cluster and the jenkins built-in agent is been used, it is hard to install the docker command through pipeline script due to uncontrollable agent OS. | CX can use self-hosted agent and manually install docker daemon on it.                                                                               |

<br>

### Symptom 3

Jenkins failed to deploy your new containerized app to Kubernetes on Azure

### Cause / Mitigation 3

| Issue Type                          | Error messages                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | How to Verify/test                                                                                                                                                                                                                                                                                                            | Mitigation Steps                                                                                                                                                                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No permission to get AKS credential | The following error message is displayed in the console output of the pipeline: <br/><br/>16:19:37  + az aks get-credentials --resource-group AKSforHackathon --name AKSforHackathon<br/>16:19:38 WARNING: The behavior of this command has been altered by the following extension: aks-preview<br/>16:19:38 ERROR: (AuthorizationFailed) The client 'fd13ad70-3684-40b9-9807-5d94c3675472' with object id 'fd13ad70-3684-40b9-9807-5d94c3675472' does not have authorization to perform action 'Microsoft.ContainerService/managedClusters/listClusterUserCredential/action' over scope '/subscriptions/4728f3f2-8386-4527-ae25-60e3318585a0/resourceGroups/AKSforHackathon/providers/Microsoft.ContainerService/managedClusters/AKSforHackathon' or the scope is invalid. If access was recently granted, please refresh your credentials.<br/>16:19:38 Code: AuthorizationFailed | 1. Ask CX to provide the Service principal ID which was used to authenticate with AKS<br/>2. Guide CX to login Azure Portal and navigate to AKS page<br/>3. Go to access control(IAM) part and check if any existing role assignment for this SP.                                                                             | We can ask cx to grant the Contributor role of the AKS cluster to the service principal.                                                                                                                                                        |
| Jenkins agent couldn't connect AKS  | Jenkins agent may fail to connect AKS apiserver due to AKS authorized ip range or private endpoint. The console output of the pipeline will have the following error messages: <br/><br/>16:10:44  + kubectl apply -f ./manifests/deployment.yaml<br/>16:11:20 Unable to connect to the server: dial tcp 20.239.226.189:443: i/o timeout                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 1. Use SSH to connect to the jenkins agent host<br/>2. Run the networking test command "nc -z -v <AKS_apiserver_FQDN> 443" (If cx is using jenkins built-in agent, please ask cx to add this command in his pipeline script)<br/><br/>Expected output:<br/>Connection to <AKS_apiserver_FQDN> 443 port [tcp/https] succeeded! | 1. If the issue was caused by AKS authorized IP range, please ask cx to add Jenkins agent IP in the AKS authorized ip range.<br/><br/>2. If the issue was caused by private endpoint, please peer the VNETs of AKS apiserver and jenkins agent. |
| Jenkins Server/Agent Issue          | Check Jenkins Agent host: /$jenkins_user_home_directory/remoting/logs   -->  contains java exceptions happened on the agent host                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |                                                                                                                                                                                                                                                                                                                               | Raise tickets for Jenkins community                                                                                                                                                                                                             |

## Owner and Contributors

**Owner:** Xinhao Xiong <xinhaoxiong@microsoft.com>
**Contributors:**

- Xinhao Xiong <xinhaoxiong@microsoft.com>
