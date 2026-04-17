---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Secure TLS Bootstrapping"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Secure%20TLS%20Bootstrapping"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Secure TLS Bootstrapping

[[_TOC_]]

## Overview

Secure TLS bootstrapping is a more secure method of performing TLS bootstrapping for kubelets running in AKS clusters. The primary goal of secure TLS bootstrapping is to eliminate the need for and usage of bootstrap tokens by kubelets to bootstrap a client certificate and register with the control plane.

The Secure TLS bootstrapping protocol is comprised of a gRPC client and server. The bootstrap client, a lightweight go binary which runs on customer agent nodes during node provisioning, goes through a 2-step certificate negotiation process with the control plane's bootstrap server running within the CCP namespace (outside of the overlay cluster). During the 2-step negotiation process, the bootstrap client will provide to the server various details about the underlying VM to attest it belongs to the cluster as an authentic agent node, including its resource ID, unique VM ID, and an AAD token generated for the service principal or kubelet identity the VM has access to. If attestation succeeds, the bootstrap server will then create a CSR object within the overlay cluster on behalf of the corresponding kubelet. After waiting for the CSR to be approved and issued a signed certificate by the overlay's kube-controller-manager, the bootstrap server will extract the signed certificate from the CSR object and send it back to the client.

Once the bootstrap client has received the signed certificate from the bootstrap server, it will generate a new `kubeconfig` referencing the signed certificate and newly-generated private key at a path the kubelet expects. Assuming all works as expected, the kubelet should start after the secure TLS bootstrapping process succeeds, referencing the newly-generated kubeconfig and will then immediately be able to register itself with the control plane as a member of the `system:nodes` group.

For more details on the specifics of the attestation process, see the high-level architecture diagram below, as well as the linked design doc.

## Relevant Resources

- [Secure TLS Bootstrap Server component doc](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/790536/Component-Secure-TLS-Bootstrap-Server)
- [Secure TLS Bootstrap Client component doc](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/790575/Component-Secure-TLS-Bootstrap-Client)
- [Kubernetes TLS bootstrapping docs](https://kubernetes.io/docs/reference/access-authn-authz/kubelet-tls-bootstrapping/#certificate-rotation)
- [Secure TLS Bootstrap service client & proto implementations](https://github.com/Azure/aks-secure-tls-bootstrap)

## High-Level Architecture

![stls-arch.png](/.attachments/stls-arch-bb8b8ac1-0bca-4466-99a7-32cd74111ae7.png)

Given the above, we can enumerate all the external services/RPCs involved in the protocol.

Bootstrap Client:

- [Instance Metadata Service (IMDS)](https://learn.microsoft.com/en-us/azure/virtual-machines/instance-metadata-service?tabs=linux) - used to retrieve [instance data](https://learn.microsoft.com/en-us/azure/virtual-machines/instance-metadata-service?tabs=linux#instance-metadata), [attested data](https://learn.microsoft.com/en-us/azure/virtual-machines/instance-metadata-service?tabs=linux#attested-data), and AAD tokens for MSIs if the VM is created with an AKS-generated or BYO kubelet identity.

Bootstrap Server:

- [Datacenter Secrets Management Service (dSMS) GetIssuers API](https://eng.ms/docs/products/onecert-certificates-key-vault-and-dsms/key-vault-dsms/dsms/pki/getissuersapi) - used to retrieve Azure PKI Issuer certificates used by the bootstrap server to perform validation of attested data signatures presented by bootstrapping clients.
- [Entra ID (AAD)](https://learn.microsoft.com/en-us/entra/identity-platform/access-tokens#validate-the-signature) public JWT signing key store for the customer's tenant - used to validate AAD tokens presented by bootstrapping clients.
- [ARM](https://learn.microsoft.com/en-us/rest/api/compute/virtual-machines/instance-view?view=rest-compute-2025-02-01&tabs=HTTP) - used to look up VM details, such as the VM ID and hostname, via the InstanceView API with the bootstrapping VM's resource ID presented by the client.
- Overlay cluster's API server - used to create CSRs and retrieve signed kubelet client certificates for bootstrapping clients.

## Enablement

The enablement logic in AKS RP works as follows once the feature toggles are turned on in a particular region:

- Any new agent pool created on k8s 1.32+ will be onboarded to secure TLS bootstrapping by default
- Any existing agent pool upgraded to k8s 1.32+ (including newer patches of 1.32) will be onboarded to secure TLS bootstrapping

### ASI Indicator

You can easily check whether a given node pool has secure TLS bootstrapping enabled, or a given cluster has at least one node pool with secure TLS bootstrapping enabled via the ASI indicator, for example:

On the cluster ASI features panel:
![stls-cluster-asi.png](/.attachments/stls-cluster-asi-3684dc39-b395-4215-92b3-35e6641a37cf.png)

On the node pool ASI features panel:
![stls-np-asi.png](/.attachments/stls-np-asi-45d4d6bc-876a-43e1-b94b-d80184eaf1cc.png)

### Confirming Node-Level Enablement

From the customer's perspective, secure TLS bootstrapping introduces almost no observable behavioral changes. The feature is working as expected if customer agent nodes are able to join AKS control planes, just as before. However, the key observable difference comes down to how the CSR is created for the kubelet. When secure TLS bootstrapping is disabled, __kubelet will create its own client CSR using a bootstrap token recognized by the apiserver__. When secure TLS bootstrapping is enabled, __the bootstrap server (identified as `aksService`) will create the client CSR on behalf of the kubelet without using any bootstrap token__.

Confirming secure TLS bootstrapping enablement can be done a few ways:

1. Check that kubelet client CSR objects created at the time of node provisioning are "requested" by the bootstrap server (identified as `aksService`) rather than by the kubelet (identified as `system:bootstrap:*`). To do so, examine the CSR objects in the overlay and inspect the `REQUESTOR` field (mapping to the CSR's `spec.username`):

    ```bash
    $ kubectl get nodes
    NAME                                STATUS   ROLES    AGE     VERSION
    aks-nodepool1-31285321-vmss000000   Ready    <none>   8m43s   v1.32.6
    aks-nodepool1-31285321-vmss000001   Ready    <none>   8m30s   v1.32.6
    aks-nodepool1-31285321-vmss000002   Ready    <none>   8m22s   v1.32.6

    $ kubectl get csr --field-selector spec.signerName=kubernetes.io/kube-apiserver-client-kubelet
    NAME        AGE     SIGNERNAME                                    REQUESTOR    REQUESTEDDURATION   CONDITION
    csr-6srsb   8m53s   kubernetes.io/kube-apiserver-client-kubelet   aksService   <none>              Approved,Issued
    csr-82s8x   8m47s   kubernetes.io/kube-apiserver-client-kubelet   aksService   <none>              Approved,Issued
    csr-kvbgc   8m47s   kubernetes.io/kube-apiserver-client-kubelet   aksService   <none>              Approved,Issued
    ```

2. Get onto the node itself and check the contents of the cluster provisioning and secure TLS bootstrap client logs.

    On Linux:

    ```bash
    root@aks-nodepool1-31285321-vmss000000:/ cat /var/log/azure/aks/cluster-provision.log | grep configureAndStartSecureTLSBootstrapping      
    + logs_to_events AKS.CSE.configureAndStartSecureTLSBootstrapping configureAndStartSecureTLSBootstrapping
    + local task=AKS.CSE.configureAndStartSecureTLSBootstrapping
    + configureAndStartSecureTLSBootstrapping
    ++ jq -n --arg Timestamp '2025-08-18 20:32:29.171' --arg OperationId '2025-08-18 20:32:30.497' --arg Version 1.23 --arg TaskName AKS.CSE.configureAndStartSecureTLSBootstrapping --arg EventLevel Informational --arg Message 'Completed: configureAndStartSecureTLSBootstrapping' --arg EventPid 0 --arg EventTid 0 '{Timestamp: $Timestamp, OperationId: $OperationId, Version: $Version, TaskName: $TaskName, EventLevel: $EventLevel, Message: $Message, EventPid: $EventPid, EventTid: $EventTid}'
    "TaskName": "AKS.CSE.configureAndStartSecureTLSBootstrapping",
    "Message": "Completed: configureAndStartSecureTLSBootstrapping",
    + echo '{' '"Timestamp":' '"2025-08-18' '20:32:29.171",' '"OperationId":' '"2025-08-18' '20:32:30.497",' '"Version":' '"1.23",' '"TaskName":' '"AKS.CSE.configureAndStartSecureTLSBootstrapping",' '"EventLevel":' '"Informational",' '"Message":' '"Completed:' 'configureAndStartSecureTLSBootstrapping",' '"EventPid":' '"0",' '"EventTid":' '"0"' '}'

    root@aks-nodepool1-31285321-vmss000000:/ cat /var/log/azure/aks/secure-tls-bootstrap.log  
    {"level":"info","timestamp":"2025-08-18T20:32:32.37554481Z","msg":"set bootstrap deadline","deadline":"2025-08-18T20:33:32.37552581Z"}
    {"level":"info","timestamp":"2025-08-18T20:32:32.375788807Z","msg":"failed to validate existing kubeconfig, will bootstrap a new client credential","kubeconfig":"/var/lib/kubelet/kubeconfig","error":"failed to validate kubeconfig: failed to create REST client config from kubeconfig: failed to read specified kubeconfig: stat /var/lib/kubelet/kubeconfig: no such file or directory"}
    {"level":"info","timestamp":"2025-08-18T20:32:32.375811407Z","msg":"generating MSI access token","clientId":"b5dd4c20-edb5-472b-bc38-a8cf208ff2e5"}
    {"level":"info","timestamp":"2025-08-18T20:32:32.978022488Z","msg":"generated access token for gRPC connection"}
    {"level":"info","timestamp":"2025-08-18T20:32:33.32152717Z","msg":"created bootstrap service gRPC client"}
    {"level":"info","timestamp":"2025-08-18T20:32:33.32158957Z","msg":"calling IMDS instance data endpoint","url":"http://169.254.169.254/metadata/instance"}
    {"level":"info","timestamp":"2025-08-18T20:32:33.350961952Z","msg":"retrieved instance metadata from IMDS","resourceId":"/subscriptions/26fe00f8-9173-4872-9134-bb1d2e00343a/resourceGroups/MC_cameissnerg_tester2_westus2/providers/Microsoft.Compute/virtualMachineScaleSets/aks-nodepool1-31285321-vmss/virtualMachines/0"}
    {"level":"info","timestamp":"2025-08-18T20:32:33.441948267Z","msg":"received new nonce from bootstrap server"}
    {"level":"info","timestamp":"2025-08-18T20:32:33.441985567Z","msg":"calling IMDS attested data endpoint","url":"http://169.254.169.254/metadata/attested/document"}
    {"level":"info","timestamp":"2025-08-18T20:32:33.468079984Z","msg":"retrieved instance attested data from IMDS"}
    {"level":"info","timestamp":"2025-08-18T20:32:33.468678178Z","msg":"generated kubelet client CSR and associated private key"}
    {"level":"info","timestamp":"2025-08-18T20:32:34.403688957Z","msg":"received credential response from bootstrap server"}
    {"level":"info","timestamp":"2025-08-18T20:32:34.403745757Z","msg":"received valid kubelet client credential from bootstrap server"}
    {"level":"info","timestamp":"2025-08-18T20:32:34.403884755Z","msg":"successfully generated new kubeconfig data"}
    {"level":"info","timestamp":"2025-08-18T20:32:34.405045642Z","msg":"bootstrapping guest agent event telemetry written to disk","path":"/var/log/azure/Microsoft.Azure.Extensions.CustomScript/events/1755549152375525810.json"}   
    ```

    On Windows:

    ```ps
    PS C:\k> cat C:\AzureData\CustomDataSetupScript.log | Select-String -Pattern "secure TLS bootstrap"

    2025-08-19T17:12:35.5129119+00:00: Using cached version of secure TLS bootstrap client - Copying from c:\akse-cache\aks-secure-tls-bootstrap-client\windows-amd64.zip to 
    c:\k\aks-secure-tls-bootstrap-client-downloads\aks-secure-tls-bootstrap-client.zip
    2025-08-19T17:12:36.9080483+00:00: Successfully extracted secure TLS bootstrap client to: c:\k


    PS C:\k> cat C:\k\kubelet.log | Select-String -Pattern "Secure TLS Bootstrap"                      

    Secure TLS bootstrapping is enabled, calling c:\k\securetlsbootstrap.ps1
    2025-08-19T17:14:00.3039475+00:00: Starting secure TLS bootstrapping: invoking aks-secure-tls-bootstrap-client.exe
    2025-08-19T17:14:01.1317681+00:00: Secure TLS bootstrapping succeeded

    PS C:\k> cat C:\k\secure-tls-bootstrap.log
    {"level":"info","timestamp":"2025-08-19T17:14:00.6617302Z","msg":"set bootstrap deadline","deadline":"2025-08-19T17:16:00.6617302Z"}
    {"level":"info","timestamp":"2025-08-19T17:14:00.733511Z","msg":"failed to validate existing kubeconfig, will bootstrap a new client credential","kubeconfig":"c:\\k\\config","error":"failed to validate kubeconfig: failed to create REST client config from kubeconfig: failed to read specified kubeconfig: CreateFile c:\\k\\config: The system cannot find the file specified."}
    {"level":"info","timestamp":"2025-08-19T17:14:00.733511Z","msg":"generating MSI access token","clientId":"2af44455-0dae-4cec-9d4a-7eb5bd018aa9"}
    {"level":"info","timestamp":"2025-08-19T17:14:00.7723155Z","msg":"generated access token for gRPC connection"}
    {"level":"info","timestamp":"2025-08-19T17:14:00.7880123Z","msg":"created bootstrap service gRPC client"}
    {"level":"info","timestamp":"2025-08-19T17:14:00.7880123Z","msg":"calling IMDS instance data endpoint","url":"http://169.254.169.254/metadata/instance"}
    {"level":"debug","timestamp":"2025-08-19T17:14:00.7880123Z","msg":"performing request","method":"GET","url":"http://169.254.169.254/metadata/instance?api-version=2023-07-01&format=json"}
    {"level":"info","timestamp":"2025-08-19T17:14:00.8036335Z","msg":"retrieved instance metadata from IMDS","resourceId":"/subscriptions/26ad903f-2330-429d-8389-864ac35c4350/resourceGroups/MC_cameissebld134342140_wintester_eastus2/providers/Microsoft.Compute/virtualMachineScaleSets/akswinp0/virtualMachines/0"}
    {"level":"info","timestamp":"2025-08-19T17:14:00.8548901Z","msg":"received new nonce from bootstrap server"}
    {"level":"info","timestamp":"2025-08-19T17:14:00.8548901Z","msg":"calling IMDS attested data endpoint","url":"http://169.254.169.254/metadata/attested/document"}
    {"level":"debug","timestamp":"2025-08-19T17:14:00.8548901Z","msg":"performing request","method":"GET","url":"http://169.254.169.254/metadata/attested/document?api-version=2023-07-01&format=json&nonce=2izyzqjk8l"}
    {"level":"info","timestamp":"2025-08-19T17:14:00.8816202Z","msg":"retrieved instance attested data from IMDS"}
    {"level":"info","timestamp":"2025-08-19T17:14:00.8816202Z","msg":"generated kubelet client CSR and associated private key"}
    {"level":"info","timestamp":"2025-08-19T17:14:01.1018648Z","msg":"received valid kubelet client credential from bootstrap server"}
    {"level":"info","timestamp":"2025-08-19T17:14:01.1033979Z","msg":"successfully generated new kubeconfig data"}
    {"level":"info","timestamp":"2025-08-19T17:14:01.1044322Z","msg":"bootstrapping guest agent event telemetry written to disk","path":"C:\\WindowsAzure\\Logs\\Plugins\\Microsoft.Compute.CustomScriptExtension\\Events\\1755623640661730200.json"}
    ```

3. Get on the node and check the contents of the kubelet's PKI directory. If secure TLS bootstrapping is being utilized, then you _won't_ see a `kubelet-client-current.pem` symlink. This symlink is only created after kubelet first bootstraps/rotates its own client certificate. When secure TLS bootstrapping is enabled, kubelet will not have performed this process for bootstrapping. However, after the kubelet rotates its client certificate at least once, this symlink _will_ exist.

    On Linux:

    ```bash
    root@aks-nodes-14362772-vmss000000:/ ls -la /var/lib/kubelet/pki/
    total 16
    drwxr-xr-x  2 root root 4096 Aug 19 17:00 .
    drwxr-xr-x 10 root root 4096 Aug 19 17:00 ..
    -rw-------  1 root root 1131 Aug 19 17:00 kubelet-client-2025-08-19-17-00-05.pem
    -rw-------  1 root root 1196 Aug 19 17:00 kubelet-server-2025-08-19-17-00-15.pem
    lrwxrwxrwx  1 root root   59 Aug 19 17:00 kubelet-server-current.pem -> /var/lib/kubelet/pki/kubelet-server-2025-08-19-17-00-15.pem
    ```

    On Windows:

    ```ps
    PS C:\k> ls C:\k\pki


        Directory: C:\k\pki


    Mode                 LastWriteTime         Length Name                                                                                                                                                                                  
    ----                 -------------         ------ ----                                                                                                                                                                                  
    -a----         8/19/2025   5:14 PM           1110 kubelet-client-2025-08-19-17-14-01.pem                                                                                                                                                
    -a----         8/19/2025   5:14 PM           1155 kubelet-server-2025-08-19-17-14-04.pem                                                                                                                                                
    -a---l         8/19/2025   5:14 PM              0 kubelet-server-current.pem                                                                                                                                                    
    ```

## Logs and Metrics

You can find the production [secure TLS bootstrapping dashboard here](https://dataexplorer.azure.com/dashboards/a0ec6c25-7532-4ffb-9f35-087acd0eccad?p-_startTime=3days&p-_endTime=now&p-_bin_by_time=v-3h&p-_namespace=all#93b5a949-9962-4581-ac6f-28f03160a4b4). This dashboard contains pages dedicated to both the client and server sides of the protocol, split up by CCP drill-down and regional investigation scenarios.

### Server-side Kusto Tables

You can tailor the following queries to suit your particular investigation:

- Secure TLS Bootstrap Server logs (gRPC requests + startup/shutdown events): [SecureTLSBootstrapServer](https://dataexplorer.azure.com/clusters/akshuba.centralus/databases/AKSccplogs?query=H4sIAAAAAAAAAwtOTS4tSg3xCXbKzy8pLilKLAhOLSpLLeKqUShJzE5VMDQAAKHG2fwiAAAA)

    ```sql
    SecureTLSBootstrapServer
    | take 10 
    ```

- Latency trace event logs (distributed tracing): [LatencyTraceEvent](https://dataexplorer.azure.com/clusters/aks/databases/AKSprod?query=H4sIAAAAAAAAA%2FNJLEnNS64MKUpMTnUtS80rAQCOzbGQEQAAAA%3D%3D)

    ```sql
    LatencyTraceEvent
    | where container == "secure-tls-bootstrap-server"
    | take 10
    ```

- Incoming request trace logs: [IncomingRequestTrace](https://dataexplorer.azure.com/clusters/aks/databases/AKSprod?query=H4sIAAAAAAAAAw3LQQ5AQAwF0L1TNLOfhAM4gK24wGh%2BmKBD22Hj8Lz9G4TLkWUZcVWYT5oYzUvPCgVxEU9ZoNT3FAxcFdF3i3Mpbq7pjAa9oeEvnjZQ134L9fELUQAAAA%3D%3D)

    ```sql
    IncomingRequestTrace
    | where container == "secure-tls-bootstrap-server"
    | take 10
    ```

- Outgoing request trace logs: [OutgoingRequestTrace](https://dataexplorer.azure.com/clusters/aks/databases/AKSprod?query=H4sIAAAAAAAAAw3LwQmAMAwF0LtTBO8FHaAzCOICsXxqURpNUr04vL77m5pnKTXPuBrMF%2BWE7qVng4KSVOdSoRQj9YbUFMEPC6uImyufwaA3tP%2BL8w4ahw%2FfpQX0UQAAAA%3D%3D)

    ```sql
    OutgoingRequestTrace
    | where container == "secure-tls-bootstrap-server"
    | take 10
    ```

The bootstrap server also takes advantage of context and API request log tables owned by the ServiceHub team:

- Context logs (scoped to incoming gRPC requests): [CtxLog](https://dataexplorer.azure.com/clusters/akshuba.centralus/databases/AKSprod?query=H4sIAAAAAAAAA3MuqfDJT%2BeqUSjPSC1KVUjOzytJzMxLLVKwtVVQKk5NLi1K1S3JKdZNys8vKS4pSizQLU4tKkstUgJqKUnMTlUwNAAAVz%2BaqUMAAAA%3D)

    ```sql
    CtxLog
    | where container == "secure-tls-bootstrap-server"
    | take 10
    ```

- API request logs (scoped to incoming/outgoing gRPC/HTTP requests): [ApiRequestLog](https://dataexplorer.azure.com/clusters/akshuba.centralus/databases/AKSprod?query=H4sIAAAAAAAAA3MsyAxKLSxNLS7xyU%2FnqlEoz0gtSlVIzs8rSczMSy1SsLVVUCpOTS4tStUtySnWTcrPLykuKUos0C1OLSpLLVICailJzE5VMDQAABDneWNKAAAA)

    ```sql
    ApiRequestLog
    | where container == "secure-tls-bootstrap-server"
    | take 10
    ```

### Server-side Metrics

The Secure TLS Boostrap Server is also configured to emit a set of custom metrics into Kusto via the VMAgent scraping pipeline. You can find the definition of each of these custom metrics [within the secure-tls-bootstrap/server code base](https://dev.azure.com/msazure/CloudNativeCompute/_git/aks-rp?path=/secure-tls-bootstrap/server/internal/metrics/metrics.go). You can also find the correspding [VMAgent scraping config](https://dev.azure.com/msazure/CloudNativeCompute/_git/aks-operator?path=%2Fmanifests%2Fconfigs%2Fteams%2Fnode_lifecycle%2Fsecure_tls_bootstrap_server%2Fsecure_tls_bootstrap_server.k&version=GBmaster&_a=contents). At the time of writing, these metrics solely include both custom `Counters` and `CounterVecs`.

You can also find a set of tiles within the production dashboard on the server-side CCP drill-down page which display these [metrics over time for a particular CCP](https://dataexplorer.azure.com/dashboards/a0ec6c25-7532-4ffb-9f35-087acd0eccad?p-_startTime=12hours&p-_endTime=now&p-_namespace=all&tile=dcb083e9-1754-48f4-95bb-9ba08fa9084d).

## Troubleshooting

During phase 1 of the rollout process, bootstrap tokens will still be available to bootstrapping kubelets as a fallback mechanism if secure TLS bootstrapping doesn't end up working for any reason. In terms of customer impact, within this failure mode, some extra time (on the order of a couple minutes) will be added to the amount of time it takes the node to register with the API server _after_ CSE has succeeded.

However, once we've moved on to phase 2 where bootstrap tokens are no longer installed into running control planes, if secure TLS bootstrapping fails then nodes won't be able to join the cluster. This will obviously manifest as missing node objects from the perspective of kube-apiserver + etcd (`kubectl get nodes`).

The following section lays out the most common reasons why secure TLS bootstrapping might be failing in any case (whether that be during phase 1 or phase 2 rollout), as well as how to identify and troubleshoot each particular failure mode.

### Common Failure Modes

#### Failure to Deploy CCP Plugin `secure-tls-bootstrap`

When everything is working as expected, a deployment object named `secure-tls-bootstrap-server` is deployed to the customer cluster's CCP namespace running on the given cx-underlay. This deployment is deployed via the ccp-plugin V2 framework, and thus is installed into the CCP via the HelmController running on the particular cx-underlay.

__NOTE: migration is currently underway to make it such that addons and ccp-plugins, such as `secure-tls-bootstrap`, are deployed to the CCP via Eno rather than Helm.__

__NOTE: the name of the deployment object deployed to the CCP is `secure-tls-bootstrap-server`, though the name of the CCP plugin itself is `secure-tls-bootstrap`.__

To check whether a given CCP actually has the bootstrap server deployment object installed, you can gain access to the cx-underlay on which the customer's cluster is running via `hcpdebug` and list the deployment objects like so:

```bash
$ kubectl config set-context --current --namespace=68a4acc44104df0001ddc187

$ kubectl get deploy
NAME                                                              READY   UP-TO-DATE   AVAILABLE   AGE
68a4acc44104df0001ddc187-etcd-etcd-operator-cameissebld13434214   1/1     1            1           39m
admissionsenforcer                                                1/1     1            1           39m
ccp-webhook                                                       2/2     2            2           39m
cloud-controller-manager                                          1/1     1            1           37m
csi-azuredisk-controller                                          1/1     1            1           39m
csi-azurefile-controller                                          1/1     1            1           39m
csi-snapshot-controller                                           1/1     1            1           39m
customer-net-probe                                                1/1     1            1           39m
eno-reconciler                                                    1/1     1            1           38m
etcd-68a4acc44104df0001ddc187-backup-sidecar                      1/1     1            1           39m
eventlogger                                                       1/1     1            1           35m
konnectivity-svr                                                  2/2     2            2           39m
kube-addon-manager                                                1/1     1            1           39m
kube-api-proxy                                                    2/2     2            2           37m
kube-apiserver                                                    2/2     2            2           39m
kube-controller-manager-v2                                        1/1     1            1           37m
kube-scheduler-v2                                                 1/1     1            1           37m
kube-state-metrics                                                1/1     1            1           39m
kubelet-serving-csr-approver                                      2/2     2            2           38m
medbay                                                            1/1     1            1           38m
prometheus-server                                                 1/1     1            1           35m
remediator                                                        1/1     1            1           35m
secure-tls-bootstrap-server                                       2/2     2            2           37m
tattler                                                           1/1     1            1           38m
telemetryexporter                                                 1/1     1            1           35m
vmagent-autoscaler                                                1/1     1            1           35m
```

You should see a `secure-tls-bootstrap-server` deployment running within the CCP namespace, with 2 `READY` replicas.

If you can't / don't want to manually access the CCP namespace to check whether the bootstrap server has been installed, or if you see that the particular CCP namespace you're working with doesn't have the bootstrap server installed, you can confirm whether Overlaymgr tried to install it through the following [query](https://dataexplorer.azure.com/clusters/aks/databases/AKSprod?query=H4sIAAAAAAAAA2WPzUrDQBSF9z7FJSuFKU1KjbioUDQLQTTU%2BgA3Myfp6PyEmWuk4MMbFbrp9vCdw3deJiTHRz%2BkZkKQfPFNXwckUJugbcbeerwK%2B5HuiId4WZmrE%2BLzQDoGYRsyFRn6M2EhLi%2B6GCVL4rE4sdbQZkNFXfcMXoOrtcFNWZZVf1uvurqg5ZJ2Tfu0vW%2FmzpjiO7ScSShymOAU9dbhmT0U7do9AgdRFEckFhvD44Oit2D%2Bjv1D1qhf23k5pjmn7nj%2BzyDrGRD%2BAK2ufwDLdP8MGAEAAA%3D%3D):

```sql
OverlaymgrEvents
| where PreciseTimeStamp > ago(1d)
| where msg contains "secure-tls-bootstrap"
| where id == "68a3899ccc76eb000148ba3d" // REPLACE
| project PreciseTimeStamp, level, fileName, RPTenant, operationID, UnderlayName, id, msg
| order by PreciseTimeStamp desc
| take 25
```

Output like the following indicates that Overlaymgr tried to install the secure-tls-bootstrap plugin into the particular CCP via creating an adapter chart helm release:

![image.png](/doc/images/node-lifecycle/overlaymgrevents-stls.png)

#### Server-side Bootstrapping Failures

Failures on the server side can result from a large number of failure modes. Regardless, the CCP drill-down pages on the [dashboard](https://dataexplorer.azure.com/dashboards/a0ec6c25-7532-4ffb-9f35-087acd0eccad?p-_startTime=3days&p-_endTime=now&p-_bin_by_time=v-3h&p-_namespace=all#93b5a949-9962-4581-ac6f-28f03160a4b4) will be helpful for investigating failures for individual clusters.

The most straightforward way to debug server-side failures would be to query the corresponding Kusto tables. See the above section on [server-side Kusto tables](#server-side-kusto-tables) to start. Below are some example queries using the aforementioned tables to surface individual bootstrapping failures.

##### Issuer Certificate Refresh Failures

One particular failure mode worth mentioning on the server-side involves the inability to refresh Azure PKI Issuer certificates from the GetIssuers API of [dSMS](https://aka.ms/dsms). Any time the bootstrap server fulfills a GetCredential RPC from a bootstrapping client, the attested data blob presented by the client is validated against this set of PKI Issuer certificates to ensure that the certificate used to sign the blob was indeed issued by one of these Issuer certificates, specifically for a subdomain of IMDS (the instance metadata service). These certificates are already cached on AKS cx-underlay nodes for the bootstrap server's consumption, and are very rarely rotated/updated. However, if at any given point in time the bootstrap server encounters an attested data blob signed by an unknown authority, it will attempt to refresh its set of in-memory Issuer certificates by making a call to GetIssuers API of dSMS. If this API itself is experiencing issues, meaning the bootstrap server receives too many 5XX errors from these API calls, then a new incident should be cut to the dSMS/Triage ICM queue. The [AKS partner escalation dependency doc](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/9011/AKS-Partner-Dependency-Escalation-Path?anchor=who%27s-who) has been updated to reflect this. Otherwise, if the errors are 4XX, or there are errors related to updating the in-memory cache of Issuer certificates, intervention could be required to bounce the bootstrap server pods and then reconcile the agent pool - agent pools can be reconciled (reimaged) even if it's already on the latest node image version by performing a node-image-only upgrade, such as: `az aks nodepool upgrade ... --node-image-only`.

If the bootstrap server receives too many GetCredential RPCs where the bootstrapping client presents attested data that has been signed by an unknown authority, it's also possible we'll hit a rate limit. The bootstrap server implements a 24-hour rate limit for these operations, as to not accidentally DoS the GetIssuers API assuming a bad actor is attempting to join malicious nodes to the particular cluster's control plane. If you should ever see GetCredential failures caused by issuer certificate refresh rate limit exceeded errors, this could be indicative of an IMDS issue. However, it's somewhat difficult to confirm this for sure. These types of failures could also be indicative of a legitimately bad actor attempting to present self-signed or malicious CA-signed attested data to the bootstrap server. This likely won't be the case, though it's worth noting that this is a possibility. If this is indeed an IMDS issue rather than an attempted node spoof, it's likely the case that you'd see this type of failure across many different bootstrap server instances in many different clusters around the same time. If this is the case, it's probably worth RA'ing the IMDS on-call DRI at that point for assistance. If you're only seeing this issue in one particular cluster, feel free to RA the feature owners for more assistance.

##### Example Queries

Using `SecureTLSBootstrapServer` to [query](https://dataexplorer.azure.com/clusters/akshuba.centralus/databases/AKSccplogs?query=H4sIAAAAAAAAA32OwUoDMRRF937Fc1YKgc44OthFBbVdDBQpTn8gJLdtZJIXXtJx48eboaALwd29F855b4A5C%2Fbb4YU5pyw6DpAJcvVFnycIaCcwLmHvPIasfaQn0ke%2BaewtLRb0vtltn1835A4UAAv7wwXtkaI2oNWKqu5xibbRXXOPzti6rpu2fejultX%2FkhETRrouAhcOXJU9Cn%2FA5D9vqd%2BDiiJbdWEV%2BXRUZEaHkPuyZgR9SYLEZzGYc%2BAwc5Ofy4lTfisyRUUX%2BnWBpGj79TdmU4GRLAEAAA%3D%3D) for any and all errors encountered within a particular namespace:

```sql
SecureTLSBootstrapServer
| where PreciseTimeStamp > ago(1d) // REPLACE if needed
| where namespace == "689e31a614e6cd0001335629" // REPLACE if needed
| where level != "info"
| project PreciseTimeStamp, namespace, pod, level, msg, clientId, tenantId, resourceId, nonce, vmId, hostName, spanID, traceID
```

Using `CtxLog` to [query](https://dataexplorer.azure.com/clusters/akshuba.centralus/databases/AKSprod?query=H4sIAAAAAAAAA33NvQ6CMBhG4d2r%2BGTSgdCKEhkwMQQTE6JEvYHaviIRKGkrOnjx%2FgyMXsBzTuqeuS5HL3pcYUCFgawsTlWDoxNNRysSpZ5wNaUgoENW5Os0o%2BpCLaCgBid160TVwlCSkGch7wa%2Bq61%2F1tpZZ0TnW5gexhtIKxrYTkj8SLSMEXIR8TkiqRhjPAwX0Sz2%2Fn9r9Khp%2FAlsd5v9N%2B7EDcQZewOZ6gai2QAAAA%3D%3D) for all gRPC request contexts which encountered an error:

```sql
CtxLog
| where PreciseTimeStamp > ago(1d) // REPLACE if needed
| where container == "secure-tls-bootstrap-server"
| where namespace == "689e31a614e6cd0001335629" // REPLACE if needed
| where level != "INFO"
| take 100
```

Using `OutgoingRequestTrace` to [query](https://dataexplorer.azure.com/clusters/akshuba.centralus/databases/AKSprod?query=H4sIAAAAAAAAA33PwWrCQBDG8XufYppTewjumjbUg4JIoAehYn2B6e7XuGh2487EXnx4rRR7KPQ6fD%2F%2BzNugbQqxXeMwQHST2eHuRF9bZNAqwwXBJnR4V%2B56mhG36cH6RxqNaN2slvNFQ%2BGTIuDhb86lqBwiMk2nVAjckFHqXsqPlFQ0c18K8hG5uJHIHaS%2FxK%2BkfpmgslzbJ9TOG2NsVT3X40nxf7eT9spfVfufh5rofyOirIMskgfdX2ZjYwri6P%2Fe7bdR3oGsMWfxFfQFIwEAAA%3D%3D) for all failed outgoing HTTP requests:

```sql
OutgoingRequestTrace
| where PreciseTimeStamp > ago(1d) // REPLACE if needed
| where container == "secure-tls-bootstrap-server"
| where namespace == "689e31a614e6cd0001335629" // REPLACE if needed
| where msg == "HttpRequestEnd"
| where statusCode != "200" and statusCode != "201"
| take 100
```

#### Client-side Bootstrapping Failures

Failures on the client side can obviously be the result of server failures, though there are failure modes that don't involve failed RPCs to the bootstrap server which you should be aware of. Regardless, it's important to understand exactly how you can debug client failures that occur during node provisioning involving any top-level bootstrapping step.

##### Summary of Top-Level Bootstrapping Steps

The following is a summarization of the top-level bootstrapping steps that the client goes through in order bootstrap a client certificate for the kubelet:

1. Validate any existing kubeconfig (`ValidateKubeconfig`) - the first step involves inspecting any existing kubeconfig the kubelet would have access to in order to determine if bootstrapping is actually required. The client will decode the kubeconfig, ensure that the referenced certificate file also exists and contains a certificate that hasn't expired. To ensure that the certificate referenced by the existing kubeconfig is considered valid by the control plane, the client will use the entire kubeconfig to make a call to the API server to list the k8s version. This call to `/version` is authenticated, meaning that if the client certificate used to make the request is no longer valid (usually as a result of a previous cluster certificate rotation that didn't propagate to the particular node), this request will return a 401 response. If this kubeconfig is considered valid, then the client will simply exit without going through the bootstrap process. Otherwise, bootstrapping will continue.
2. Retrieve an AAD access token (`GetAccessToken`) - this step involves determining which type of identity the node actually has access to in order to identify itself within Entra ID. The client will read the contents of `azure.json` to determine if it has a service principal, or a user-assigned kubelet identity (MSI). If a service principal is used, the client will make a request to Entra ID directly to obtain a corresponding access token using the service principal client ID and secret obtained from `azure.json`. Otherwise, if a user-assigned kubelet identity is identified, the client will make a request to IMDS to retrieve the access token using the client ID of the identity, also obtained from `azure.json`.
3. Build a gRPC service client to communicate with the bootstrap server (`GetServiceClient`) - this step involves building the gRPC client connection with the bootstrap server which will be used to perform `GetNonce` and `GetCredential` RPCs. Note that this connection will be configured to use the access token retrieved in step 2, as well as use a TLS configuration referencing the cluster's CA certificate which is placed on the node at provisioning time.
4. Retrieve VM instance data from IMDS (`GetInstanceData`) - this step involves calling the IMDS `/metadata/instance` endpoint to retrieve metadata about the VM on which the client is running. The client will extract the resource ID of the VM out of the response sent back by IMDS to construct the `GetNonce` request used in step 5.
5. Retrieve a unique nonce from the bootstrap server (`GetNonce`) - this step involves invoking the `GetNonce` RPC against the bootstrap server running in the cluster's CCP namespace. The request sent to the server will contain the VM's unique resource ID retrieved in step 4. The response will solely consist of a unique nonce the client will then use to request VM attested data in step 6.
6. Retrieve VM attested data from IMDS (`GetAttestedData`) - this step involves using the nonce retrieved in step 5 to request a VM attested data blob from the IMDS `/metadata/attested/document` endpoint. This blob is signed by a certificate owned by the IMDS service and contains a JSON payload with further details about the VM, namely the unique VM ID.
7. Generate a CSR for the kubelet (`GetCSR`) - this step involves generating a certificate signing request (CSR) for the kubelet using the resolved hostname of the VM, as well as an associated private key. Note that these will always be 256-bit elliptic curve private keys.
8. Retrieve a kubelet client credential (signed certificate) from the bootstrap server (`GetCredential`) - this step involves making a `GetCredential` RPC to the bootstrap server running in the cluster's CCP namespace. This request will contain the attested data blob generated in step 6, as well as the b64-encoded PEM corresponding to the kubelet client CSR generated in step 7.
9. Generate a new kubeconfig referencing the retrieved client credential (`GenerateKubeconfig`) - this step involves taking the signed certificate PEM retrieved from the bootstrap server in step 8, as well as the PEM encoding of the private key generated in step 7 to create a new `.pem` for the new kubelet client cert/key pair. After writing the cert/key pair to disk, a new kubeconfig is generated in-memory referencing the new `.pem`.
10. Write the generated kubeconfig data to disk (`WriteKubeconfig`) - this last step simply involves taking the in-memory kubeconfig data referencing the new `.pem` and writing it to disk in a location where the kubelet expects.

Understanding each step and what they entail is important to being able to interpret the guest agent event telemetry emitted by the bootstrap client in both success and failure cases, discussed below.

##### Guest Agent Event Telemetry

The bootstrap client itself utilizes the Azure guest agent event telemetry pipeline to export custom JSON payloads to a particular set of Kusto tables. These JSON payloads contain information regarding the status of the bootstrapping operation (success vs. failure), how many overall retries were attempted, how much time each top-level bootstrapping step took to run for each retry, and a summary of how long each top-level bootstrapping step took to run across _all_ retries. The bootstrap client will continuously attempt to go through the protocol steps until a deadline is reached. At the time of writing, this deadline is configured as 2 minutes. To avoid truncating the JSON payload due to size constraints imposed on the logs extracted to Kusto via the guest agent telemetry pipeline, latency/timing data for only the _last 5_ retry attempts will be included within the JSON payload.

 Lastly, and most importantly, a "final error" field will be included within the payload. This field contains the last error the client encountered before the bootstrapping operation entered a terminally failed state. A terminally failed state will be reached if the aforementioned deadline is exceeded before the client can successfully bootstrap, or if the client encounters a non-retryable error sometime before the deadline is reached.

 The following is an example JSON payload emitted by a bootstrap client which failed to bootstrap due to an inability to connect to the control plane's bootstrap server:

 ```json
 {
 "Status": "Failure", // Indication of terminal state
 "ElapsedMilliseconds": 600001, // How long the entire operation took, taking into account all retry attempts
 "Errors": {
        // The number of top-level bootstrap errors encountered during the operation. The sum of all errors listed here
        // also tells you how many retry attempts occurred.
  "GetNonceFailure": 12
 },
 "Traces": {
        // The "trace" data for the last 5 retry attempts during the operation. Each trace indicates, in milliseconds, how long each 
        // top-level bootstrapping step took to run. Each trace is given an "index", which indicates which particular retry attempt it corresponds to.
        // Note that this "index" starts at 0.
  "7": {
   "GetAccessTokenMilliseconds": 131,
   "GetInstanceDataMilliseconds": 15,
   "GetNonceMilliseconds": 51038,
   "GetServiceClientMilliseconds": 0,
   "ValidateKubeconfigMilliseconds": 0
  },
  "8": {
   "GetAccessTokenMilliseconds": 222,
   "GetInstanceDataMilliseconds": 15,
   "GetNonceMilliseconds": 50654,
   "GetServiceClientMilliseconds": 0,
   "ValidateKubeconfigMilliseconds": 0
  },
  "9": {
   "GetAccessTokenMilliseconds": 191,
   "GetInstanceDataMilliseconds": 18,
   "GetNonceMilliseconds": 50121,
   "GetServiceClientMilliseconds": 0,
   "ValidateKubeconfigMilliseconds": 0
  },
  "10": {
   "GetAccessTokenMilliseconds": 109,
   "GetInstanceDataMilliseconds": 15,
   "GetNonceMilliseconds": 49984,
   "GetServiceClientMilliseconds": 0,
   "ValidateKubeconfigMilliseconds": 0
  },
  "11": {
   "GetAccessTokenMilliseconds": 183,
   "GetInstanceDataMilliseconds": 18,
   "GetNonceMilliseconds": 10505,
   "GetServiceClientMilliseconds": 0,
   "ValidateKubeconfigMilliseconds": 0
  }
 },
 "TraceSummary": {
        // A summation of the time taken, in milliseconds, each top-level bootstrapping step took to execute
        // across all retry attempts
  "GetAccessTokenMilliseconds": 2253,
  "GetInstanceDataMilliseconds": 204,
  "GetNonceMilliseconds": 571920,
  "GetServiceClientMilliseconds": 2,
  "ValidateKubeconfigMilliseconds": 0
 },
    // The "final" or "last" error encountered by the client before it entered a terminal state, either due to exceeding the configured deadline or
    // due to hitting a non-retryable error of some sort. (note that in this example the configured deadline was 10 minutes)
 "FinalError": "GetNonceFailure: failed to retrieve a nonce from bootstrap server: rpc error: code = DeadlineExceeded desc = context deadline exceeded: last error: rpc error: code = Unavailable desc = connection error: desc = \"transport: Error while dialing: reading server HTTP response: unexpected EOF\""
}
 ```

 Using this data, you can see exactly why the client failed to bootstrap, how many times it attempted to bootstrap, and how long it took to do so. This information can be extremely helpful when trying to understand why the overall the protocol failed to bootstrap a client certificate for the kubelet.

##### Example Queries - Linux

 The following queries show how you can query the `GuestAgentGenericLogs` table to obtain the JSON payload associated with a particular bootstrapping operation/event.

 Say you needed to debug why a particular instance of a customer's Linux VMSS was unable to join the cluster due to a failure of secure TLS bootstrapping. You could use the [following query](https://dataexplorer.azure.com/clusters/azcore.centralus/databases/Fa?query=H4sIAAAAAAAAA42ST4%2FTMBDF73yKUS%2B7SEm2SSo4FSlEUflTStX0Hhl7NvVu4ok8zi4gPjx2gSyrwMLR9pv387yZzYjsihaN26BBq%2BWWWn72De5PaBH2FqVmPOoeayf6AV6BaOkyVc%2Fh6goO1X5blBUIBoOoUE111Z033IkeYb2GxQctLTFdu6T4OlpMqs8ODWsynJQjO%2BprafXg4jTJ8sXkcRR8O1kU7%2BvkNZFjZ8WQ1Ci9z3FbT1eDNu1D6QGZRitxY2kcHr5RNpihbWPpbzQzfupUmq%2FyVZaulnFX2PAsbjl%2BU103KNiNnC2e7vNAHU7%2BTagVIcqBqFvGefB9mb2I73rmZvlXKwxxKJh62YsvHQkFaxiEZWxumMxlScZ5YXoO3p0Q3tUfd17wQ6oZpBcIbVDBvXYnbc6ii19lF%2F69G3vzB5wfrHVhwh74U54FyKNsgYMKXJD9C5Y9AauMeozK56hQ8F%2Bg%2FDfQYOkGpZttbDRfhmgaWwRl5xcQbQQ7UvhWRedvBaANh3lG0ayVaDa476i3h09TAwAA):

 ```sql
GuestAgentGenericLogs
| where PreciseTimeStamp > ago(1d) // REPLACE as needed
| where EventName == "Microsoft.Azure.Extensions.CustomScript-1.23" // This is the 'EventName' value for Linux nodes specifically
| where TaskName == "AKS.Bootstrap.SecureTLSBootstrapping" // All bootstrapping events will have this value for 'TaskName'
| where ResourceGroupName == "MC_e2erg-cameissebld134342140-lAr_e2eaks-HEf_eastus2" // REPLACE as needed
| where RoleName == "_aks-agentpool0-32140726-vmss_0" // REPLACE as needed
| extend BootstrapStatus = parse_json(Context1) // the JSON payload is contained within the 'Context1' column
| extend BootstrapStartTime = Context2 // Bootstrapping start time is contained within the 'Context2' column
| extend BootstrapEndTime = Context3 // Bootstrapping end time is contained within the 'Context3' column
| project PreciseTimeStamp, ResourceGroupName, RoleName, Cluster, NodeId, ContainerId, BootstrapStartTime, BootstrapEndTime, BootstrapStatus
 ```

 This would yield the following results:

 ```json
"PreciseTimeStamp": 2025-08-20T19:24:10.2618771Z,
"ResourceGroupName": MC_e2erg-cameissebld134342140-lAr_e2eaks-HEf_eastus2,
"RoleName": _aks-agentpool0-32140726-vmss_0,
"Cluster": BN9PrdApp18,
"NodeId": e83117ad-6fae-0cca-2222-8ba501e4e5a0,
"ContainerId": 286056b1-b530-4976-9671-12769176f6e6,
"BootstrapStartTime": 2025-08-20 19:19:54.215,
"BootstrapEndTime": 2025-08-20 19:21:54.215,
"BootstrapStatus": {
 "Status": "Failure",
 "ElapsedMilliseconds": 120000,
 "Errors": {
  "GetNonceFailure": 3
 },
 "Traces": {
  "0": {
   "GetAccessTokenMilliseconds": 199,
   "GetInstanceDataMilliseconds": 31,
   "GetNonceMilliseconds": 50781,
   "GetServiceClientMilliseconds": 0,
   "ValidateKubeconfigMilliseconds": 0
  },
  "1": {
   "GetAccessTokenMilliseconds": 90,
   "GetInstanceDataMilliseconds": 27,
   "GetNonceMilliseconds": 51018,
   "GetServiceClientMilliseconds": 0,
   "ValidateKubeconfigMilliseconds": 0
  },
  "2": {
   "GetAccessTokenMilliseconds": 222,
   "GetInstanceDataMilliseconds": 26,
   "GetNonceMilliseconds": 14519,
   "GetServiceClientMilliseconds": 0,
   "ValidateKubeconfigMilliseconds": 0
  }
 },
 "TraceSummary": {
  "GetAccessTokenMilliseconds": 512,
  "GetInstanceDataMilliseconds": 85,
  "GetNonceMilliseconds": 116319,
  "GetServiceClientMilliseconds": 0,
  "ValidateKubeconfigMilliseconds": 0
 },
 "FinalError": "GetNonceFailure: failed to retrieve a nonce from bootstrap server: rpc error: code = DeadlineExceeded desc = context deadline exceeded: last error: rpc error: code = Unavailable desc = connection error: desc = \"transport: Error while dialing: reading server HTTP response: unexpected EOF\""
}
 ```

 Note that if you need further info than what's provided here to debug the issue, you can use the `NodeId`, `ContainerId`, and `Cluster` fields to extract the guest agent log bundle via XTS. See the [debugging with provisioning logs section](#debugging-nodes-with-provisioning-logs) below for further details.

 The following is an eample of what a successfull bootstrapping event that could be yielded by the same query:

 ```json
"PreciseTimeStamp": 2025-08-19T09:22:21.5960341Z,
"ResourceGroupName": MC_e2erg-ebld134303226-vKzlBfOJVQ_e2eaks-HJy_eastus2,
"RoleName": _aks-agentpool0-30931393-vmss_0,
"latency": 1034,
"FinalError": ,
"StartTime": 2025-08-19 09:17:36.910,
"EndTime": 2025-08-19 09:17:37.944,
"BootstrapStatus": {
 "Status": "Success",
 "ElapsedMilliseconds": 1034,
 "Traces": {
  "0": {
   "GenerateKubeconfigMilliseconds": 0,
   "GetAccessTokenMilliseconds": 462,
   "GetAttestedDataMilliseconds": 19,
   "GetCSRMilliseconds": 0,
   "GetCredentialMilliseconds": 502,
   "GetInstanceDataMilliseconds": 9,
   "GetNonceMilliseconds": 29,
   "GetServiceClientMilliseconds": 0,
   "ValidateKubeconfigMilliseconds": 0,
   "WriteKubeconfigMilliseconds": 8
  }
 }
},
"Cluster": LVL09PrdApp28,
"NodeId": a4ed3e22-e3c6-0f0d-ed13-34cf35592eae,
"ContainerId": 66e97044-2299-469b-a8d5-62ab953a331e
 ```

##### Example Queries - Windows

If you happen to be working with Windows nodes, you need to change the value of the `EventName` column you're filtering on to `Microsoft.Compute.CustomScriptExtension-1.10`. For [example](https://dataexplorer.azure.com/clusters/azcore.centralus/databases/Fa?query=H4sIAAAAAAAAA42SwW7bMAyG73sKIhe3gOPW9i49ZEBiGMG6NOvi3A1VYhy1tmSIUtIOe%2FhJweq2c4H2KPInP%2F6klg7JzhtUdokKjeQr3dCXP3Dco0G4Ncgl4VZ2WFnW9fANWKPPcnEOFxewKW9X86IERqAQBYqhrjz4hmvWIcxmMLmR3GjSO5sUuuudxaRwZHVXcSN7Wz5aVCS1mqZJejkZemwZPQwt5j%2BqZKG1JWtYn1TIncHtqhpCvVTNJMw0b1u4ex0FDLMQHKXP7NkBwe4lwYG1DmGnDUTPoGhAb5C0MxyXRrv%2BxUZRY4ammXIfkUR414o0%2F5rnV2l2Od1dL0KaPdB08et3jYyso%2BzFzka3OLSqveyYXvH65BfDBgQMZvyqfS3MoGeGsL4nrc4KrazXpafF2z3CdfVz7QVPrWYCvCHuBUwqFN6pd6hOoui5LIL3OcaG23rUP2EW2r%2FZKlBQgQ2yjzBZ5POt69Q7sFKJt6h8jAoFnwLlr0C90ffI7eivxuMzxsMVYiha%2FwfRxLDWAr%2BL%2BDRWAJrwGO8oHlmJ%2F7%2FYXylnRfNMAwAA):

```sql
GuestAgentGenericLogs
| where PreciseTimeStamp > ago(3d) // REPLACE as needed
| where EventName == "Microsoft.Compute.CustomScriptExtension-1.10" // This is the 'EventName' value for Windows nodes specifically
| where TaskName == "AKS.Bootstrap.SecureTLSBootstrapping" // All bootstrapping events will have this value for 'TaskName'
| where ResourceGroupName == "MC_e2erg-cameissebld134339120-fJB_e2eaks-BQz_eastus2"
| where RoleName == "_aksw19c_0"
| extend BootstrapStatus = parse_json(Context1) // the JSON payload is contained within the 'Context1' column
| extend BootstrapStartTime = Context2 // Bootstrapping start time is contained within the 'Context2' column
| extend BootstrapEndTime = Context3 // Bootstrapping end time is contained within the 'Context3' column
| project PreciseTimeStamp, ResourceGroupName, RoleName, Cluster, NodeId, ContainerId, BootstrapStartTime, BootstrapEndTime, BootstrapStatus
```

Result:

```json
"PreciseTimeStamp": 2025-08-19T22:56:02.2997476Z,
"ResourceGroupName": MC_e2erg-cameissebld134339120-fJB_e2eaks-BQz_eastus2,
"RoleName": _aksw19c_0,
"Cluster": LVL04PrdApp30,
"NodeId": 75d8df8e-70bb-bc13-5901-61a86668c7bd,
"ContainerId": 43eb5376-c8e5-4fe6-b700-1f305722eb0b,
"BootstrapStartTime": 2025-08-19 22:48:33.960,
"BootstrapEndTime": 2025-08-19 22:50:33.960,
"BootstrapStatus": {
 "Status": "Failure",
 "ElapsedMilliseconds": 120000,
 "Errors": {
  "GetNonceFailure": 2
 },
 "Traces": {
  "0": {
   "GetAccessTokenMilliseconds": 8,
   "GetInstanceDataMilliseconds": 2,
   "GetNonceMilliseconds": 51713,
   "GetServiceClientMilliseconds": 0,
   "ValidateKubeconfigMilliseconds": 7535
  },
  "1": {
   "GetAccessTokenMilliseconds": 0,
   "GetInstanceDataMilliseconds": 0,
   "GetNonceMilliseconds": 50478,
   "GetServiceClientMilliseconds": 7,
   "ValidateKubeconfigMilliseconds": 7524
  }
 },
 "TraceSummary": {
  "GetAccessTokenMilliseconds": 9,
  "GetInstanceDataMilliseconds": 2,
  "GetNonceMilliseconds": 102192,
  "GetServiceClientMilliseconds": 7,
  "ValidateKubeconfigMilliseconds": 15060
 },
 "FinalError": "GetNonceFailure: failed to retrieve a nonce from bootstrap server: rpc error: code = Unavailable desc = name resolver error: produced zero addresses"
}
```

### Debugging Nodes with Provisioning Logs

As described above in how to confirm [node-level enablement](#confirming-node-level-enablement) of secure TLS bootstrapping, you can use logs emitted on the node itself by the bootstrapping process to debug node registration failures. This failure could be due to the bootstrap client failing to negotiate kubelet's client certificate, or some other unrelated provisioning/bootstrap failure.

__IMPORTANT NOTE: During Phase 1 rollout of secure TLS bootstrapping, bootstrap tokens will still be installed into customer clusters and available to the kubelet via bootstrap-kubeconfig. This means that if the secure TLS bootstrap client fails to negotiate a client certificate on the kubelet's behalf, the bootstrap token will be used as a fallback so the kubelet can still attempt to bootstrap its own client certificate and join the cluster. As a result, the worst-case scenario during Phase 1 should simply be a delay in node registration if the secure TLS bootstrap client fails.__

In either case, to view relevant logs on the node, you need to retrieve the guest agent VM log bundle. You can retrieve these bundles using the XTS tool on your SAW. See [this TSG](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-cloud-native-and-management-platform/containers-bburns/azure-kubernetes-service/tsg-for-azure-kubernetes-service/doc/tsg/how-to-get-systemd-kubelet-log-and-provisioning-logs-and-pod-logs-from-the-node-using-azure-support-center#guest-agent-vm-logs-via-xts) for details on how to install/setup XTS and use it to start extracting logs.

## Owner and Contributors

__Owner:__ Jordan Harder <Jordan.Harder@microsoft.com>

__Contributors:__

- Jordan Harder <Jordan.Harder@microsoft.com>