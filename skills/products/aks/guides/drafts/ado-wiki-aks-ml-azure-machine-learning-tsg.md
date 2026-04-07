---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS ML(Azure Machine Learning) TSG"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20ML(Azure%20Machine%20Learning)%20TSG"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure Kubernetes Machine Learning

## Summary

This document is focused on troubleshooting issues when an Azure Machine Learning endpoint deployment is present or running on an AKS cluster.

## Support Boundary

- Verify ML managed application
- Gather failure/error info
- Check ML extension log
- Verify application connection
- Escalate/Collaboration

### Escalation Paths

- You can submit AVA escalation to AKS ML channel for help
- Collab can be sent to Azure Machine Learning team to help if you already identify this is ML related.
- Usually if you need a ML ICM please open the collab to ML team and they will help to do this after check.

## Verified Learning Resources

- ML Specialist: https://cloudacademy.com/learning-paths/machine-learning-specialist-1854-4215/
- ML Advanced: https://cloudacademy.com/learning-paths/machine-learning-advanced-content-learning-path-1854-5432/
- AKS Extension: https://learn.microsoft.com/en-us/azure/machine-learning/how-to-deploy-kubernetes-extension?tabs=deploy-extension-with-cli
- ML Github Doc: https://github.com/Azure/AML-Kubernetes/
- ML Github TS guide: https://github.com/Azure/AML-Kubernetes/blob/master/docs/troubleshooting.md

## TSG

### How to check if an application is managed by ML

Use kube-audit logs to check if AzureML manages a pod in the cluster:

```kql
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEventsAll
| where PreciseTimeStamp >= datetime(2022-12-11 00:01:00) and PreciseTimeStamp <= datetime(2022-12-11 23:00:00)
| where resourceId has "{sub_ID}" and resourceId has "{cluster_Name}"
| where category =~ 'kube-audit'
| extend Pod = extractjson('$.pod', properties, typeof(string))
| extend ContainerID = extractjson('$.containerID', properties , typeof(string))
| extend Log = extractjson('$.log', properties , typeof(string))
| extend _jlog = parse_json(Log)
| extend requestURI = tostring(_jlog.requestURI)
| where requestURI contains "{cluster_Name}"
| extend ismlapp = _jlog.requestObject.metadata.labels.isazuremlapp
| where ismlapp == "true"
| project PreciseTimeStamp,ismlapp, requestURI,category, Pod, ContainerID, Log
| take 10
```

Check a full application list managed by ML:

```kql
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEventsAll
| where PreciseTimeStamp >= datetime(2022-12-11 00:01:00) and PreciseTimeStamp <= datetime(2022-12-11 23:00:00)
| where resourceId has "{sub_ID}" and resourceId has "{cluster_Name}"
| where category =~ 'kube-audit'
| extend Pod = extractjson('$.pod', properties, typeof(string))
| extend ContainerID = extractjson('$.containerID', properties , typeof(string))
| extend Log = extractjson('$.log', properties , typeof(string))
| extend _jlog = parse_json(Log)
| extend requestURI = tostring(_jlog.requestURI)
| extend ismlapp = _jlog.requestObject.metadata.labels.isazuremlapp
| where ismlapp == "true"
| where requestURI contains "deployments/"
| project PreciseTimeStamp,ismlapp, requestURI,category, Pod, ContainerID, Log
| distinct requestURI
```

### ML application scale issue

When cx mentioned their ML application has scaling issue in AKS, normally we will think its AKS HPA issue but however ML application is a special thing which is not controlled by AKS but by ML FE management.

If we confirmed the application is managed by ML which means the scaling is not managed by AKS. ML FE has 2 versions now and there is confirmed scaling issue in V1 extension.

**Identify V1 vs V2 extension:**

```kql
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEventsAll
| where PreciseTimeStamp >= datetime(2022-12-11 00:01:00) and PreciseTimeStamp <= datetime(2022-12-11 23:00:00)
| where resourceId has "{sub_ID}" and resourceId has "{cluster_Name}"
| where category =~ 'kube-audit'
| extend Pod = extractjson('$.pod', properties, typeof(string))
| extend ContainerID = extractjson('$.containerID', properties , typeof(string))
| extend Log = extractjson('$.log', properties , typeof(string))
| extend _jlog = parse_json(Log)
| extend requestURI = tostring(_jlog.requestURI)
| where requestURI contains "azureml-fe"
| project PreciseTimeStamp, requestURI,category, Pod, ContainerID, Log
| take 100
```

- Pod name prefixed with `azureml-fe` → V1 extension
- Pod name prefixed with `azureml-fe-v2` → V2 extension

**Check scaling history (triggered by ml-fe service account):**

```kql
let ['_namespace']="{ccp_Namespace}";
let ['_podName']= '';
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEventsAll
| where PreciseTimeStamp >= datetime(2022-12-11 00:01:00) and PreciseTimeStamp <= datetime(2022-12-11 23:00:00)
| where resourceId has "{sub_ID}" and resourceId has "{cluster_Name}"
| where category =~ 'kube-audit'
| extend Log = extractjson('$.log', properties , typeof(string))
| extend _jlog = parse_json(Log)
| extend _objectRef = _jlog.objectRef
| where _jlog.user.username contains 'azureml-fe'
| where _jlog.requestURI has strcat(_namespace, "/deployments/", _podName)
| where _jlog.verb == 'update'
| project PreciseTimeStamp,_jlog.verb,_jlog.user.username, _objectRef.namespace,_objectRef.name,_jlog.responseObject,_jlog.responseObject.status, _jlog
```

**V1 Scaling Bug Details:**
- In V1, the FE scales the application pod aggressively (e.g., from max to 96), causing many pending pods
- This is a confirmed FE issue but V1 is deprecated, no fix will be provided
- **Fix**: (1) Restart all FE pods to normalize scaling; (2) Upgrade to V2 extension (engage ML team)
- Related tickets: 2211040030000806, 2210180040007537

### How to check ML application deployment issue in ML extension V2

Installation: https://learn.microsoft.com/en-us/azure/machine-learning/how-to-deploy-kubernetes-extension?tabs=deploy-extension-with-cli

**Important**: Register feature providers on new subscriptions:

```bash
az provider register --namespace Microsoft.Kubernetes
az provider register --namespace Microsoft.KubernetesConfiguration
```

Otherwise there will be permission issues during extension deployment.

**How to check ML application deployment logs:**

1. Connect to the AKS cluster
2. Check the azureml pod under azureml namespace: `kubectl get pods -n azureml`
3. Get the log from related pod: `kubectl logs pod_name -n azureml`

**Useful pods during research:**

| Pod name | Description |
| --- | --- |
| Gateway | Contains all logs for Azure endpoint operations |
| azureml-fe | Contains logs for endpoint access status |
| amlarc-identity | Contains all logs for auth process |
| inference-operator | Contains all logs for inference endpoint operations |

All ML extension pods: https://learn.microsoft.com/en-us/azure/machine-learning/how-to-deploy-kubernetes-extension?tabs=deploy-extension-with-cli#review-azureml-extension-component

### How to test ML application connection

ML service deploys the application on AKS like a normal RESTful API application through a deployment and service.

From the AKS perspective we focus on the connection layer:
1. Find the REST endpoint on the ML endpoint page
2. Test the connection to this endpoint (this is the LB IP of ML FE pods)
3. If connection has issues, troubleshoot like a normal AKS application with LB services
4. For application pods, find the related service and do normal tests

**Note**: ML service builds the image with user application and runs it on the AKS cluster. If any issue is related to the image (missing lib, application pod fails to start), this is the scope of ML services, not AKS.

## Contact

Owner: Luis Alvarez <lualvare@microsoft.com>
Contributors: Zhijie Fang <zhfang@microsoft.com>
