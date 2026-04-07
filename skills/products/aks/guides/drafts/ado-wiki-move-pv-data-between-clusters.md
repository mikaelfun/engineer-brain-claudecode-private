---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Storage/Move persistent volume data from one cluster to another"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Storage/Move%20persistent%20volume%20data%20from%20one%20cluster%20to%20another"
importDate: "2026-04-05"
type: troubleshooting-guide
---
# Move persistent volume data from one cluster to another

[[_TOC_]]

**NOTE:** Wiki page created by Doug Dobies, but the brains behind all of this is Hanno Terblanche (@hanter).

The following guide will explain how to get your clusters persistent data moved into a new cluster.

1. The first thing we will do is to create a disk in the original clusters MC_ resource group so that we can mount the disk to the pod and transfer the files from the dynamic persistent volume (PV).

   `az disk create --resource-group MC_AKSrg_old_eastus --name transferDisk --size-gb 10 --query id --output tsv`

   Output example:

   ```sh
   user@DESKTOP-P3567TM:/mnt/c/aks$ az disk create --resource-group MC_AKSrg_old_eastus --name transferDisk --size-gb 10 --query id --output tsv
   /subscriptions/<subscriptionID>/resourceGroups/MC_AKSrg_old_eastus/providers/Microsoft.Compute/disks/transferDisk
   ```

2. Next we need to add a volume mount and volume to the container for the static disk, and because my pod/container is part of a deployment I need to make the change on the deployment, let�s get the deployment name with:

   ```sh
   kubectl get deploy -n vote1
   i. Output example:
   user@DESKTOP-P3567TM:/mnt/c/AKS$ kubectl get deploy -n vote1
   NAME                READY   UP-TO-DATE   AVAILABLE   AGE
   azure-vote-back1    1/1     1            1           16h
   azure-vote-front1   1/1     1            1           16h
   ```

3. Now we edit the deployment: `kubectl edit deploy -n vote1 azure-vote-front1`

4. The kubectl edit command opens the deployment manifest in �Vim�, which requires you to press �Shift+I� on your keyboard to enter �Insert� mode, which is Vim�s edit/modify mode

5. Then scroll down in the deployment up to the volume mounts section, your deployment, if it is like mine, that has only the dynamic disk currently mounted will look similar to this:
spec:

   ```yaml
   containers:
     - env:
       - name: REDIS
         value: azure-vote-back1
       image: microsoft/azure-vote-front:v1
       imagePullPolicy: IfNotPresent
       name: azure-vote-front1
       ports:
       - containerPort: 80
         protocol: TCP
       resources:
         limits:
           cpu: 999m
           memory: 256Mi
         requests:
           cpu: 100m
           memory: 128Mi
       terminationMessagePath: /dev/termination-log
       terminationMessagePolicy: File
       volumeMounts:
       - mountPath: /mnt/azure
         name: volume
     dnsPolicy: ClusterFirst
     nodeSelector:
       beta.kubernetes.io/os: linux
     restartPolicy: Always
     schedulerName: default-scheduler
     securityContext: {}
     terminationGracePeriodSeconds: 30
     volumes:
     - name: volume
       persistentVolumeClaim:
         claimName: azure-managed-disk
   ```

6. Now we need to modify the above container spec and add the mount for the file share and the volume, so it looks like this:

   ```yaml
   spec:
     containers:
     - env:
       - name: REDIS
         value: azure-vote-back1
       image: microsoft/azure-vote-front:v1
       imagePullPolicy: IfNotPresent
       name: azure-vote-front1
       ports:
       - containerPort: 80
         protocol: TCP
       resources:
         limits:
           cpu: 999m
           memory: 256Mi
         requests:
           cpu: 100m
           memory: 128Mi
       terminationMessagePath: /dev/termination-log
       terminationMessagePolicy: File
       volumeMounts:
       - mountPath: /mnt/azure
         name: volume
       - mountPath: /mnt/akstransfer
         name: transferdisk
     dnsPolicy: ClusterFirst
     nodeSelector:
       beta.kubernetes.io/os: linux
     restartPolicy: Always
     schedulerName: default-scheduler
     securityContext: {}
     terminationGracePeriodSeconds: 30
     volumes:
     - name: volume
       persistentVolumeClaim:
         claimName: azure-managed-disk
     - name: transferdisk
       azureDisk:
           kind: Managed
           diskName: transferdisk
           diskURI:  /subscriptions/<subscriptionID>/resourceGroups/MC_AKSrg_old_eastus/providers/Microsoft.Compute/disks/transferDisk
   ```

7. Now exit edit mode in Vim by pressing Esc then type **:wq!** to exit and save the deployment file, doing this will restart the pod and mount the file share in addition to the disk.

8. Next we will exec into the pod/container so we can transfer the files from the dynamic disk to the static disk.

9. Get the new pod name first, as it should have restarted after the deployment modify:

   ```sh
   user@DESKTOP-P3567TM:/mnt/c/AKS$ kubectl get pods -n vote1
   NAME                                 READY   STATUS    RESTARTS   AGE
   azure-vote-back1-59cc6879cf-tx9cx    1/1     Running   1          17h
   azure-vote-front1-65c9c5b4fb-c2d5m   1/1     Running   0          45m
   ```

10. Now exec into the pod:

    ```sh
    user@DESKTOP-P3567TM:/mnt/c/AKS$ kubectl exec -it -n vote1 azure-vote-front1-65c9c5b4fb-c2d5m -- bash
    root@azure-vote-front1-65c9c5b4fb-c2d5m:/app#
    ```

11. From inside the pod we can now navigate to either mount point for the dynamic or static disk, the dynamic being at /mnt/azure and static is at /mnt/transferdisk, let�s go to the dynamic disk first, and copy all the files from there to our static disk:

    ```sh
    [root@azure-vote-front1-775dcbfb76-6j4b4:/# cd /mnt/azure
    root@azure-vote-front1-775dcbfb76-6j4b4:/mnt/azure# ls
    New Text Document.txt                  captureorder-deployment.yaml   internallb.yaml                                    routing_svc.yaml
    aadpodidentity.yaml                    captureorder-ingress-tls.yaml  internallb1.yaml                                   sample-dotnet.yaml
    aadpodidentitybinding.yaml             cert-vote1.yaml                internallbnginx.yaml                               sbaksconfig
    aks-helloworld-one.yaml                charts                         issuer-dev.yaml                                    scalesetLB.yaml
    aks-helloworld-two.yaml                cluster-issuer.yaml            issuer-uat.yaml                                    shell-demo (2).yaml
    aks-ingress-tls.crt                    cronjob.yaml                   kubectl                                            shell-demo.yaml
    aks-ingress-tls.key                    demo0lb.yaml                   kubectl.exe                                        shell-demo0.yaml
    appgw-ingress.yaml                     demo1lb.yaml                   kubelet_configz_aks-agentpool-27646033-vmss000000  shell-demo1.yaml
    applicationversiontracking             demo2lb.yaml                   kubernetes-zipkin-master.zip                       shell-demo2.yaml
    applicationversiontracking.tar         deployment-outputs.json        lb.yaml                                            simulate_load.yaml
    azch-captureorder                      fd2-ingress-tls.crt            letsencrypt-clusterissuer.yaml                     template.json
    azure-default.yaml                     fd2-ingress-tls.key            linkerd2-cli-stable-2.6.0-linux                    template.zip
    azure-file-pvc.yaml                    frontend-deployment.yaml       master.zip                                         template1.zip
    azure-file-sc.yaml                     frontend-ingress-tls.yaml      namespace.yaml                                     terraform.exe
    azure-premium.yaml                     frontend-ingress.yaml          nfs-pod.yaml                                       tls-cert.yaml
    azure-pvc-default.yaml                 get_helm.sh                    nfs-pod1.yaml                                      values.yaml
    azure-pvc-disk.yaml                    gpu.yaml                       nfs-pv.yaml                                        virtual-kubelet-linux.yaml
    azure-pvc-roles.yaml                   grafana_config.yaml            nfs-pvc.yaml                                       virtual-kubelet-windows-nano.yaml
    azure-test.yaml                        hannoaks-binding.yaml          nginx-policy.yaml                                  virtual-kubelet-windows.yaml
    azure-vote-all-in-one-redis-noLB.yaml  hello-world-ingress.yaml       node-problem-detector.yaml                         virtual-node.yaml
    azure-vote1.yaml                       helm-config.yaml               omsagent.txt                                       vote1-export.yaml
    azure-vote2.yaml                       helm-rback.yaml                parameters.json                                    vote1.yaml
    azure-voting-app-redis                 helm.yaml                      pod.yaml                                           vote2.yaml
    azureKubernetesService.template.json   httprouting.yaml               pod1.yaml                                          vote_ingress_route.yaml
    backend-policy.yaml                    ingress-route.yaml             pvc.yaml                                           votefd1.cer
    binding.yaml                           ingress-vote.yaml              rbac-virtual-kubelet.yaml                          win_sample.yaml
    captureorder-deployment-aci.yaml       ingress.yaml                   role.yaml                                          win_sample2.yaml
    root@azure-vote-front1-775dcbfb76-6j4b4:/mnt/azure# cp * -r /mnt/transferdisk]()
    ```

12. Now switch to the static disk mount and check the files are there:

    ```sh
    root@azure-vote-front1-775dcbfb76-6j4b4:/mnt/azure# cd /mnt/transferdisk
    root@azure-vote-front1-775dcbfb76-6j4b4:/mnt/transferdisk# ls
    New Text Document.txt                  captureorder-deployment.yaml   internallb.yaml                                    routing_svc.yaml
    aadpodidentity.yaml                    captureorder-ingress-tls.yaml  internallb1.yaml                                   sample-dotnet.yaml
    aadpodidentitybinding.yaml             cert-vote1.yaml                internallbnginx.yaml                               sbaksconfig
    aks-helloworld-one.yaml                charts                         issuer-dev.yaml                                    scalesetLB.yaml
    aks-helloworld-two.yaml                cluster-issuer.yaml            issuer-uat.yaml                                    shell-demo (2).yaml
    aks-ingress-tls.crt                    cronjob.yaml                   kubectl                                            shell-demo.yaml
    aks-ingress-tls.key                    demo0lb.yaml                   kubectl.exe                                        shell-demo0.yaml
    appgw-ingress.yaml                     demo1lb.yaml                   kubelet_configz_aks-agentpool-27646033-vmss000000  shell-demo1.yaml
    applicationversiontracking             demo2lb.yaml                   kubernetes-zipkin-master.zip                       shell-demo2.yaml
    applicationversiontracking.tar         deployment-outputs.json        lb.yaml                                            simulate_load.yaml
    azch-captureorder                      fd2-ingress-tls.crt            letsencrypt-clusterissuer.yaml                     template.json
    azure-default.yaml                     fd2-ingress-tls.key            linkerd2-cli-stable-2.6.0-linux                    template.zip
    azure-file-pvc.yaml                    frontend-deployment.yaml       master.zip                                         template1.zip
    azure-file-sc.yaml                     frontend-ingress-tls.yaml      namespace.yaml                                     terraform.exe
    azure-premium.yaml                     frontend-ingress.yaml          nfs-pod.yaml                                       tls-cert.yaml
    azure-pvc-default.yaml                 get_helm.sh                    nfs-pod1.yaml                                      values.yaml
    azure-pvc-disk.yaml                    gpu.yaml                       nfs-pv.yaml                                        virtual-kubelet-linux.yaml
    azure-pvc-roles.yaml                   grafana_config.yaml            nfs-pvc.yaml                                       virtual-kubelet-windows-nano.yaml
    azure-test.yaml                        hannoaks-binding.yaml          nginx-policy.yaml                                  virtual-kubelet-windows.yaml
    azure-vote-all-in-one-redis-noLB.yaml  hello-world-ingress.yaml       node-problem-detector.yaml                         virtual-node.yaml
    azure-vote1.yaml                       helm-config.yaml               omsagent.txt                                       vote1-export.yaml
    azure-vote2.yaml                       helm-rback.yaml                parameters.json                                    vote1.yaml
    azure-voting-app-redis                 helm.yaml                      pod.yaml                                           vote2.yaml
    azureKubernetesService.template.json   httprouting.yaml               pod1.yaml                                          vote_ingress_route.yaml
    backend-policy.yaml                    ingress-route.yaml             pvc.yaml                                           votefd1.cer
    binding.yaml                           ingress-vote.yaml              rbac-virtual-kubelet.yaml                          win_sample.yaml
    captureorder-deployment-aci.yaml       ingress.yaml                   role.yaml                                          win_sample2.yaml
    ```

13. Exit the pod:

    ```sh
    root@azure-vote-front1-6b8b49d9bd-2xnjt:/mnt/azure# exit
    exit
    user@DESKTOP-P3567TM:/mnt/c/AKS$
    ```

14. Now go to Azure Storage Explorer to copy the static disk from the old MC_to the new MC_, as the disk is currently attached to the pod on the old cluster we cannot move it.

- The following steps will be for transferring your workloads, although I strongly suggest that you go to the developer or person that deployed everything in the existing cluster to get the deployments manifests and do it that way instead of trying to transfer everything manually, however if that is not an option I will explain how to do it manually.
- The main problem with doing this is that if you used Helm to install anything in the cluster, that will not get transferred, we can only transfer resources that were created with yaml files directly in the cluster, so what I am going to show you below is only for deployments (pods), services and persistent volume claims associated with my vote1 deployment.

1. Connect to the old cluster: `az aks get-credentials -g <clusterResourceGroup> -n <OldClusterName>`

2. For my use case I am only going to be transferring the resources from vote1 namespace, which links up with the instructions above, and then I will import this to the new cluster, for additional namespaces you could repeat this process.

3. As mentioned I am only transferring my deployment, services and pvc, and I will export the yaml�s to a folder called �cluster-dump� on my local PC

   ```sh
   kubectl get deploy -n vote1 -o yaml > /mnt/c/aks/cluster-dump/vote1deploy.yaml
   kubectl get pvc -n vote1 -o yaml > /mnt/c/aks/cluster-dump/vote1pvc.yaml
   kubectl get svc -n vote1 -o yaml > /mnt/c/aks/cluster-dump/vote1svc.yaml
   ```

4. Now we need to modify the exported pvc yaml, as it contains the disk/volume name from the previous cluster, and to get a successful deployment we need to remove this, below is my exported yaml, the parts highlighted in yellow needs to be removed, be sure to maintain the correct spacing/indent:

   ```yaml
   -apiVersion: v1
   items:
   - apiVersion: v1
     kind: PersistentVolumeClaim
     metadata:
       annotations:
         kubectl.kubernetes.io/last-applied-configuration: |
           {"apiVersion":"v1","kind":"PersistentVolumeClaim","metadata":{"annotations":{},"name":"azure-manageddisk","namespace":"vote1"},"spec":{"accessModes":["ReadWriteOnce"],"resources":{"requests":{"storage":"10Gi"}},"storageClassName":"managed-premium"}}
         pv.kubernetes.io/bind-completed: "yes"
         pv.kubernetes.io/bound-by-controller: "yes"
         volume.beta.kubernetes.io/storage-provisioner: kubernetes.io/azure-disk
       creationTimestamp: "2020-09-22T15:57:51Z"
       finalizers:
       - kubernetes.io/pvc-protection
       name: azure-managed-disk
       namespace: vote1
       resourceVersion: "6832"
       selfLink: /api/v1/namespaces/vote1/persistentvolumeclaims/azure-managed-disk
       uid: 10230730-0000-0000-0000-000000000000
     spec:
       accessModes:
       - ReadWriteOnce
       resources:
         requests:
           storage: 10Gi
       storageClassName: managed-premium
       volumeMode: Filesystem
       volumeName: pvc-10230730-8395-45a9-91a4-3590afec1ee9
     status:
       accessModes:
       - ReadWriteOnce
       capacity:
         storage: 10Gi
       phase: Bound
   kind: List
   metadata:
     resourceVersion: ""
     selfLink: ""
   ```

5. With the above removed the yaml should now look like this:

   ```yaml
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     name: azure-managed-disk
     namespace: vote1
   spec:
     accessModes:
   
   - ReadWriteOnce
     resources:
       requests:
         storage: 10Gi
     storageClassName: managed-premium
   ```

6. We also have to modify the deployment yaml file, as we need to change the diskURI for the static disk to the new MC_ resource group, below is the current yaml section related to the disk:
volumes:

   ```yaml
   - name: volume
     persistentVolumeClaim:
       claimName: azure-managed-disk
   - azureDisk:
       cachingMode: ReadWrite
       diskName: transferdisk
       diskURI: /subscriptions/<subscriptionID>/resourceGroups/MC_AKSrg_old_eastus/providers/Microsoft.Compute/disks/transferDisk
       fsType: ext4
       kind: Managed
       readOnly: false
     name: transferdisk
   ```

7. And we change it to the new URI as below:

   ```yaml
   volumes:
     - name: volume
       persistentVolumeClaim:
         claimName: azure-managed-disk
     - azureDisk:
         cachingMode: ReadWrite
         diskName: transferdisk
         diskURI: /subscriptions/<subscriptionID>/resourceGroups/MC_AKSrg_New_eastus/providers/Microsoft.Compute/disks/transferDisk
         fsType: ext4
         kind: Managed
         readOnly: false
       name: transferdisk
   ```

8. Connect to the new cluster: `az aks get-credentials -g <clusterResourceGroup> -n <NewClusterName>`

9. Create the namespace needed for your deployment that was exported in the step above: `kubectl create namespace vote1`

10. Change to the cluster-dump folder and start deploying the yaml files we exported from the old cluster, first we do the PVC:

    ```sh
    hanno@DESKTOP-P3567TM:/mnt/c/aks/cluster-dump$ kubectl apply -f vote1pvc.yaml
    persistentvolumeclaim/azure-managed-disk created
    ```

11. Now create the deployment:

    ```sh
    user@DESKTOP-P3567TM:/mnt/c/aks/cluster-dump$ kubectl apply -f vote1deploy.yaml
    deployment.apps/azure-vote-back1 created
    deployment.apps/azure-vote-front1 created
    ```

12. Now get the pod name and exec into the pod, then change to the transferdisk mount which is our static disk and check the files should be there:

    ```sh
    user@DESKTOP-P3567TM:/mnt/c/aks/cluster-dump$ kubectl get pods -n vote1
    NAME                                 READY   STATUS    RESTARTS   AGE
    azure-vote-back1-59cc6879cf-mjzvq    1/1     Running   0          3m53s
    azure-vote-front1-5cb4669c45-trvrv   1/1     Running   0          3m53s
    user@DESKTOP-P3567TM:/mnt/c/aks/cluster-dump$ kubectl exec -it -n vote1 azure-vote-front1-5cb4669c45-trvrv -- bash
    root@azure-vote-front1-5cb4669c45-trvrv:/app# cd /mnt/transferdisk
    root@azure-vote-front1-5cb4669c45-trvrv:/mnt/transferdisk# ls
    New Text Document.txt                  azure-voting-app-redis                grafana_config.yaml                                lost+found                  shell-demo0.yaml
    aadpodidentity.yaml                    azureKubernetesService.template.json  hannoaks-binding.yaml                              master.zip                  shell-demo1.yaml
    aadpodidentitybinding.yaml             backend-policy.yaml                   hello-world-ingress.yaml                           namespace.yaml              shell-demo2.yaml
    aks-helloworld-one.yaml                binding.yaml                          helm-config.yaml                                   nfs-pod.yaml                simulate_load.yaml
    aks-helloworld-two.yaml                captureorder-deployment-aci.yaml      helm-rback.yaml                                    nfs-pod1.yaml               template.json
    aks-ingress-tls.crt                    captureorder-deployment.yaml          helm.yaml                                          nfs-pv.yaml                 template.zip
    aks-ingress-tls.key                    captureorder-ingress-tls.yaml         httprouting.yaml                                   nfs-pvc.yaml                template1.zip
    appgw-ingress.yaml                     cert-vote1.yaml                       ingress-route.yaml                                 nginx-policy.yaml           terraform.exe
    applicationversiontracking             charts                                ingress-vote.yaml                                  node-problem-detector.yaml  tls-cert.yaml
    applicationversiontracking.tar         cluster-issuer.yaml                   ingress.yaml                                       omsagent.txt                values.yaml
    azch-captureorder                      cronjob.yaml                          internallb.yaml                                    parameters.json             virtual-kubelet-linux.yaml
    azure-default.yaml                     demo0lb.yaml                          internallb1.yaml                                   pod.yaml                    virtual-kubelet-windows-nano.yaml
    azure-file-pvc.yaml                    demo1lb.yaml                          internallbnginx.yaml                               pod1.yaml                   virtual-kubelet-windows.yaml
    azure-file-sc.yaml                     demo2lb.yaml                          issuer-dev.yaml                                    pvc.yaml                    virtual-node.yaml
    azure-premium.yaml                     deployment-outputs.json               issuer-uat.yaml                                    rbac-virtual-kubelet.yaml   vote1-export.yaml
    azure-pvc-default.yaml                 fd2-ingress-tls.crt                   kubectl                                            role.yaml                   vote1.yaml
    azure-pvc-disk.yaml                    fd2-ingress-tls.key                   kubectl.exe                                        routing_svc.yaml            vote2.yaml
    azure-pvc-roles.yaml                   frontend-deployment.yaml              kubelet_configz_aks-agentpool-27646033-vmss000000  sample-dotnet.yaml          vote_ingress_route.yaml
    azure-test.yaml                        frontend-ingress-tls.yaml             kubernetes-zipkin-master.zip                       sbaksconfig                 votefd1.cer
    azure-vote-all-in-one-redis-noLB.yaml  frontend-ingress.yaml                 lb.yaml                                            scalesetLB.yaml             win_sample.yaml
    azure-vote1.yaml                       get_helm.sh                           letsencrypt-clusterissuer.yaml                     shell-demo (2).yaml         win_sample2.yaml
    azure-vote2.yaml                       gpu.yaml                              linkerd2-cli-stable-2.6.0-linux                    shell-demo.yaml
    ```

13. And then we copy the files from the static disk to the new dynamic disk of the container:

    ```sh
    root@azure-vote-front1-77568547fc-mwpsf:/mnt/azure# cd /mnt/transferdisk
    root@azure-vote-front1-77568547fc-mwpsf:/mnt/transferdisk# cp * -r /mnt/azure
    root@azure-vote-front1-77568547fc-mwpsf:/mnt/transferdisk# cd /mnt/azure
    root@azure-vote-front1-77568547fc-mwpsf:/mnt/azure# ls
    New Text Document.txt                  azure-voting-app-redis                grafana_config.yaml                                lost+found                  shell-demo0.yaml
    aadpodidentity.yaml                    azureKubernetesService.template.json  hannoaks-binding.yaml                              master.zip                  shell-demo1.yaml
    aadpodidentitybinding.yaml             backend-policy.yaml                   hello-world-ingress.yaml                           namespace.yaml              shell-demo2.yaml
    aks-helloworld-one.yaml                binding.yaml                          helm-config.yaml                                   nfs-pod.yaml                simulate_load.yaml
    aks-helloworld-two.yaml                captureorder-deployment-aci.yaml      helm-rback.yaml                                    nfs-pod1.yaml               template.json
    aks-ingress-tls.crt                    captureorder-deployment.yaml          helm.yaml                                          nfs-pv.yaml                 template.zip
    aks-ingress-tls.key                    captureorder-ingress-tls.yaml         httprouting.yaml                                   nfs-pvc.yaml                template1.zip
    appgw-ingress.yaml                     cert-vote1.yaml                       ingress-route.yaml                                 nginx-policy.yaml           terraform.exe
    applicationversiontracking             charts                                ingress-vote.yaml                                  node-problem-detector.yaml  tls-cert.yaml
    applicationversiontracking.tar         cluster-issuer.yaml                   ingress.yaml                                       omsagent.txt                values.yaml
    azch-captureorder                      cronjob.yaml                          internallb.yaml                                    parameters.json             virtual-kubelet-linux.yaml
    azure-default.yaml                     demo0lb.yaml                          internallb1.yaml                                   pod.yaml                    virtual-kubelet-windows-nano.yaml
    azure-file-pvc.yaml                    demo1lb.yaml                          internallbnginx.yaml                               pod1.yaml                   virtual-kubelet-windows.yaml
    azure-file-sc.yaml                     demo2lb.yaml                          issuer-dev.yaml                                    pvc.yaml                    virtual-node.yaml
    azure-premium.yaml                     deployment-outputs.json               issuer-uat.yaml                                    rbac-virtual-kubelet.yaml   vote1-export.yaml
    azure-pvc-default.yaml                 fd2-ingress-tls.crt                   kubectl                                            role.yaml                   vote1.yaml
    azure-pvc-disk.yaml                    fd2-ingress-tls.key                   kubectl.exe                                        routing_svc.yaml            vote2.yaml
    azure-pvc-roles.yaml                   frontend-deployment.yaml              kubelet_configz_aks-agentpool-27646033-vmss000000  sample-dotnet.yaml          vote_ingress_route.yaml
    azure-test.yaml                        frontend-ingress-tls.yaml             kubernetes-zipkin-master.zip                       sbaksconfig                 votefd1.cer
    azure-vote-all-in-one-redis-noLB.yaml  frontend-ingress.yaml                 lb.yaml                                            scalesetLB.yaml             win_sample.yaml
    azure-vote1.yaml                       get_helm.sh                           letsencrypt-clusterissuer.yaml                     shell-demo (2).yaml         win_sample2.yaml
    azure-vote2.yaml                       gpu.yaml                              linkerd2-cli-stable-2.6.0-linux                    shell-demo.yaml
    ```

14. Now exit the pod:

    ```sh
    root@azure-vote-front1-5cb4669c45-trvrv:/mnt/akstransfer# exit
    exit
    user@DESKTOP-P3567TM:/mnt/c/aks/cluster-dump$
    ```

15. Next we also need to modify the exported vote1svc.yaml file to remove some details before it is deployed in the new cluster, remove the lines highlighted in yellow:

    ```yaml
    - apiVersion: v1
      kind: Service
      metadata:
        annotations:
          kubectl.kubernetes.io/last-applied-configuration: |
            {"apiVersion":"v1","kind":"Service","metadata":{"annotations":{},"name":"azure-vote-front1","namespace":"vote1"},"spec":{"ports":[{"port":80,"protocol":"TCP","targetPort":80}],"selector":{"app":"azure-vote-front1"}}}
        creationTimestamp: "2020-09-22T19:10:48Z"
        name: azure-vote-front1
        namespace: vote1
        resourceVersion: "48404"
        selfLink: /api/v1/namespaces/vote1/services/azure-vote-front1
        uid: e437f348-0000-0000-0000-0000000000
      spec:
        clusterIP: 10.0.193.203
        ports:
        - port: 80
          protocol: TCP
          targetPort: 80
        selector:
          app: azure-vote-front1
        sessionAffinity: None
        type: ClusterIP
      status:
        loadBalancer: {}
    - apiVersion: v1
      kind: Service
      metadata:
        annotations:
          kubectl.kubernetes.io/last-applied-configuration: |
            {"apiVersion":"v1","kind":"Service","metadata":{"annotations":{},"name":"lb-vote1","namespace":"vote1"},"spec":{"ports":[{"port":80}],"selector":{"app":"azure-vote-front1"},"type":"LoadBalancer"}}
        creationTimestamp: "2020-09-22T19:10:48Z"
        finalizers:
        - service.kubernetes.io/load-balancer-cleanup
        name: lb-vote1
        namespace: vote1
        resourceVersion: "48472"
        selfLink: /api/v1/namespaces/vote1/services/lb-vote1
        uid: 51dcfdff-0000-0000-0000-0000000000
      spec:
        clusterIP: 10.0.100.228
        externalTrafficPolicy: Cluster
        ports:
        - nodePort: 30376
          port: 80
          protocol: TCP
          targetPort: 80
        selector:
          app: azure-vote-front1
        sessionAffinity: None
        type: LoadBalancer
      status:
        loadBalancer:
          ingress:
          - ip: 52.(...).(...).(...)
    kind: List
    metadata:
      resourceVersion: ""
      selfLink: ""
    ```

16. And it should now look like this:

    ```yaml
    - apiVersion: v1
      kind: Service
      metadata:
        annotations:
          kubectl.kubernetes.io/last-applied-configuration: |
            {"apiVersion":"v1","kind":"Service","metadata":{"annotations":{},"name":"azure-vote-front1","namespace":"vote1"},"spec":{"ports":[{"port":80,"protocol":"TCP","targetPort":80}],"selector":{"app":"azure-vote-front1"}}}
        creationTimestamp: "2020-09-22T19:10:48Z"
        name: azure-vote-front1
        namespace: vote1
        resourceVersion: "48404"
        selfLink: /api/v1/namespaces/vote1/services/azure-vote-front1
        uid: e437f348-0000-0000-0000-0000000000
      spec:
        ports:
        - port: 80
          protocol: TCP
          targetPort: 80
        selector:
          app: azure-vote-front1
        sessionAffinity: None
        type: ClusterIP
    - apiVersion: v1
      kind: Service
      metadata:
        annotations:
          kubectl.kubernetes.io/last-applied-configuration: |
            {"apiVersion":"v1","kind":"Service","metadata":{"annotations":{},"name":"lb-vote1","namespace":"vote1"},"spec":{"ports":[{"port":80}],"selector":{"app":"azure-vote-front1"},"type":"LoadBalancer"}}
        creationTimestamp: "2020-09-22T19:10:48Z"
        finalizers:
        - service.kubernetes.io/load-balancer-cleanup
        name: lb-vote1
        namespace: vote1
        resourceVersion: "48472"
        selfLink: /api/v1/namespaces/vote1/services/lb-vote1
        uid: 51dcfdff-0000-0000-0000-0000000000
      spec:
        ports:
        - port: 80
        selector:
          app: azure-vote-front1
        sessionAffinity: None
        type: LoadBalancer
    ```

17. And to complete the deployment we add the services:

    ```sh
    user@DESKTOP-P3567TM:/mnt/c/aks/cluster-dump$ kubectl apply -f vote1svc.yaml
    service/azure-vote-back1 created
    service/azure-vote-front1 created
    service/lb-vote1 created
    ```

Now as I mentioned transferring your deployments and services like this is not really advised, as it could cause functionality problems, as in my case when I now try to go to my app via a browser I am getting this:
![image.png](/.attachments/image-4d0efe07-395d-45a0-a063-d551419828ed.png)

And to remedy this I would just create my services again from scratch, or use my original deployment yaml I used to create the resources in the old cluster , and then I can successfully get to my app:

![image.png](/.attachments/image-196e7a07-4869-46ee-be59-aa06147ef196.png)

## Owner and Contributors

**Owner:** Naomi Priola <Naomi.Priola@microsoft.com>
**Contributors:**

- Ines Monteiro <t-inmont@microsoft.com>
- Doug Dobies <dodobies@microsoft.com>

