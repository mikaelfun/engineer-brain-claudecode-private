---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Others/Pod General Investigation/Customer Pod is in a CrashLoopBackOff Status"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Others/Pod%20General%20Investigation/Customer%20Pod%20is%20in%20a%20CrashLoopBackOff%20Status"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Pods stuck in CrashLoopBackOff status

[[_TOC_]]

## Summary

If a container in a Pod is terminated for any reason, the container is automatically restarted by Kubernetes for recovery. If the status has not improved and the container is terminated after the container has been restarted, Kubernetes will restart the container again. In this situation of repeated container restarts, the Pod will go into `CrashLoopBackOff` status.

> **Incident troubleshooting start page:** [Application Failures Overview](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Application-Failures-Overview.md)
>
> **Labs and scenario index:** [Application Failure Labs Index](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Application-Failure-Labs.md)

## Reported and Observed Symptoms

- Pods showing a status of `CrashLoopBackoff` in the `kubectl get pods` command output

## Cause

There are three main factors that may cause a `CrashLoopBackOff` status on a newly deployed Pod.

1. [Application failure](#application-failure)
2. [Liveness Probe or Startup Probe Failure](#liveness-probe-or-startup-probe-failure)
3. [Out of Memory Failure (OOMKilled status)](#out-of-memory-failure-or-oomkilled-status)

You can check which of the above three factors caused the `CrashLoopBackOff` status by looking at the detailed information of the Pod output by the `kubectl describe pod` command.

Let's take a look at how to check the Pod details and resolve the `CrashLoopBackOff` status based on an example of deploying a sample application to a cluster.

## Mitigation Steps

1. Run `kubectl describe pod` for the pod in the `CrashLoopBackOff` status to gather more information on why the pod is failing to start.
2. In the output of the describe command, look for the `Events` section to see if the pod is failing to start due to a liveness probe or startup probe failure. If so, jump to the [Probe failures](#liveness-probe-or-startup-probe-failure) section.
3. For the application container inside the pod, check the `LastState` section to see if the container is failing to start due to an application failure.

    These commonly manifest with a non-zero value in the `Exit Code` attribute and a `Reason` value of `Error`.

    If so, jump to the [Application failure](#application-failure) section.
4. If the container is failing to start due to an out of memory (OOM) error, the `Reason` value will be `OOMKilled` and the `Exit Code` will be `137`.

    If so, jump to the [Out of Memory Failure (OOMKilled status)](#out-of-memory-failure-or-oomkilled-status) section.

### Application failure

In containerized applications, when the application process terminates, the container is also in the terminated state.

If the application terminates abnormally due to an application error or exception, Kubernetes will restart the container in an attempt to recover ([according to restartPolicy](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#restart-policy)).

However, if the application statis is not resolved after the container is restarted, the container will be terminated and restarted by Kubernetes repeatedly, and the Pod will enter the `CrashLoopBackOff` status.

The following example shows the information about a Pod in `CrashLoopBackOff` status with the `kubectl describe pod` command.

```shell
$ kubectl describe pod -n yatteiki yatteiki-app-6689b55d99-bwtbz
Name:         yatteiki-app-6689b55d99-bwtbz
Namespace:    yatteiki
  ...
Containers:
  yatteikiapp:
    Container ID:   docker://5b392828eec1830289e17abb3cabab4f51f41c64dacf202fd782de5858cf7f23
    Image:          yukirii/yatteikiapp:latest
    Image ID:       docker-pullable://yukirii/yatteikiapp@sha256:796a3b87d25de166f9eb533f43e70a8975666892d38225f2ba2a5220a0ed61d8
    Port:           <none>
    Host Port:      <none>
    State:          Waiting
      Reason:       CrashLoopBackOff
    Last State:     Terminated
      Reason:       Error
      Exit Code:    1
      Started:      Sun, 30 Oct 2022 18:42:17 +0900
      Finished:     Sun, 30 Oct 2022 18:42:20 +0900
    Ready:          False
    Restart Count:  4
    Environment:    <none>
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-g8lrp (ro)
```

We should observe `<container name>` carefully, which represents the state of the container. While reviewing the container status/state, we can observe a few key things:

- The value of the `State.Reason` field is `CrashLoopBackOff`, indicating that the container has repeatedly restarted due to abnormal termination.
- The `Last State:` field indicates the state of the last container that was executed during the repeated restarts. The word `Terminated` indicates that the container was terminated.
- Also, `Reason` is shown as `Error` and `Exit Code` as `1`.

   If the application terminated normally, the Exit Code would be `0`, but since the application terminated with an exit code other than `0`, it indicates that some problem occurred and the application terminated abnormally.
- The `Restart Count` field shows `4`, indicating that 4 restarts have occurred in the past at the time the `kubectl describe pod` command was run.

Let's also look at the contents of the `Events` field that appears at the end of the command results.

```shell
$ kubectl describe pod -n yatteiki yatteiki-app-6689b55d99-bwtbz
  ...
Events:
  Type     Reason     Age                   From               Message
  ----     ------     ----                  ----               -------
  Normal   Scheduled  3m6s                  default-scheduler  Successfully assigned yatteiki/yatteiki-app-6689b55d99-bwtbz to minikube  Normal   Pulled     2m44s                 kubelet            Successfully pulled image "yukirii/yatteikiapp:latest" in 21.177282093s
  Normal   Pulled     2m39s                 kubelet            Successfully pulled image "yukirii/yatteikiapp:latest" in 2.289334667s
  Normal   Pulled     2m20s                 kubelet            Successfully pulled image "yukirii/yatteikiapp:latest" in 2.280229918s
  Normal   Started    110s (x4 over 2m44s)  kubelet            Started container yatteikiapp
  Normal   Pulled     110s                  kubelet            Successfully pulled image "yukirii/yatteikiapp:latest" in 2.28295296s
  Warning  BackOff    80s (x6 over 2m36s)   kubelet            Back-off restarting failed container
  Normal   Pulling    67s (x5 over 3m5s)    kubelet            Pulling image "yukirii/yatteikiapp:latest"
  Normal   Created    65s (x5 over 2m44s)   kubelet            Created container yatteikiapp
  Normal   Pulled     65s                   kubelet            Successfully pulled image "yukirii/yatteikiapp:latest" in 2.287047376s
```

The `Pulled`, `Created`, and `Started` events in the `Reason` column indicate that the container was successfully started. However, the `BackOff` event, as well as the Back-off restarting failed container message, indicates that the container was restarted.

From the results of the `kubectl describe pod` command, where we can know that the container was terminated abnormally for some reason, resulting in repeated restarts.

So what exactly was the problem in the application? Let's explore the cause by retrieving the application logs.

The following example shows the result of displaying the application logs with the `kubectl logs` command. In a situation where repeated restarts are occurring, you may want to run the `kubectl logs -p` command with the `-p` option to see the log of the last container executed.

```shell
$ kubectl logs -n yatteiki yatteiki-app-6689b55d99-bwtbz
2022/10/30 09:43:46 ERROR: Required environment variables PORT is missing.
exit status 1
```

Reviewing logs revealed an error message stating that the environment variable `PORT` did not exist.

We found that the reason for the abnormal termination of the container was the absence of an environment variable necessary for the operation of this application.

This example can be resolved by modifying the YAML manifest of the application in question to define the necessary environment variables.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: yatteiki-app
  namespace: yatteiki
spec:
  replicas: 1
  selector:
    matchLabels:
      app: yatteiki-app
  template:
    metadata:
      labels:
        app: yatteiki-app
    spec:
      containers:
      - image: yukirii/yatteikiapp:latest
        name: yatteikiapp
        env:              # Add env field and define PORT environment variable
        - name: PORT
          value: "8080"
```

By deploying the modified YAML manifest to the cluster, we have confirmed that the Pod starts with `Running` status.

```shell
$ kubectl get pods -n yatteiki
NAME                           READY   STATUS    RESTARTS   AGE
yatteiki-app-c87554ff6-c8ppk   1/1     Running   0          9s
```

The results of `kubectl describe pod` also confirm that the container is in `Running` status.

```shell
$ kubectl describe pod -n yatteiki yatteiki-app-c87554ff6-c8ppk
Name:         yatteiki-app-c87554ff6-c8ppk
Namespace:    yatteiki
  ...
Containers:
  yatteikiapp:
    Container ID:   docker://08da5467b46e7637b53444759e2a2e49f17035c0fe47e5506a39e37d27f8ed92
    Image:          yukirii/yatteikiapp:latest
    Image ID:       docker-pullable://yukirii/yatteikiapp@sha256:796a3b87d25de166f9eb533f43e70a8975666892d38225f2ba2a5220a0ed61d8
    Port:           <none>
    Host Port:      <none>
    State:          Running
      Started:      Sun, 30 Oct 2022 18:47:20 +0900
    Ready:          True
    Restart Count:  0
    Environment:
      PORT:  8080
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-q6xtp (ro)
  ...
```

The logs obtained by `kubectl logs` also confirmed that the application started successfully.

```shell
$ kubectl logs -n yatteiki yatteiki-app-c87554ff6-c8ppk
Yatteiki WEBAPP is starting on localhost:8080
```

#### Recommendations for Application Failures

Depending on the errors that occur in your application, it may be necessary to modify the application itself or resolve problems with dependent services (e.g., database server), rather than YAML manifests or other configuration items on Kubernetes.

Check the output messages to determine the reason why the error occurred, identify the cause of the error, and take action.

---

### Liveness Probe or Startup Probe Failure

[Liveness Probe and Startup Probe](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) are health check probes that are set up on a Pod.

The probes are run periodically to determine if the containers in the Pod are operating properly. If the probe is not successful the specified times, it is assumed that the container is not working properly and Kubernetes will restart the container. In that situation, the container will be restarted repeatedly, and then the Pod will go into a `CrashLoopBackOff` status.

The following example command shows the result of the `kubectl describe pod` command, which displays information about a Pod in `CrashLoopBackOff` status.

```shell
$ kubectl describe pod yatteiki-app-7c474cf847-ggnzs -n yatteiki
Name:         yatteiki-app-7c474cf847-ggnzs
Namespace:    yatteiki
  ...
Containers:
  yatteiki-app:
    Container ID:   docker://c27a2ac956249030b539231b47ee7ccac9ab3d9130dfa6ed0f34cde6d68f6a09
    Image:          ozawashuhe/yatteiki_tsg
    Image ID:       docker-pullable://ozawashuhe/yatteiki_tsg@sha256:80984051700c8f1db7a1b7b6322bd1f90f5e5e8ae4d5d563def7354b550df71a
    Port:           8080/TCP
    Host Port:      0/TCP
    State:          Waiting
      Reason:       CrashLoopBackOff
    Last State:     Terminated
      Reason:       Error
      Exit Code:    2
      Started:      Sat, 07 May 2022 06:58:14 +0900
      Finished:     Sat, 07 May 2022 06:58:24 +0900
    Ready:          False
    Restart Count:  5
    Liveness:       tcp-socket :80 delay=5s timeout=1s period=3s #success=1 #failure=2
  ...
```

Looking at this output, there are a few values and fields that stand out:

- Check the `Containers.<container name>` field for the state of the container in the Pod. The value of the `State.Reason` field is `CrashLoopBackOff`, indicating that the container has been restarted repeatedly.
- The `Last State` field shows `Terminated`, indicating that the container has terminated.
- The `Restart Count` field shows `5`, indicating that at the time the `kubectl describe pod` command was run, the container had been restarted four times in the past.
- Also, the presence of the `Liveness` field indicates that this container has a Liveness Probe configured.

  This liveness probe is configured to access the container on port 80 every three seconds (`period=3s`) with an initial delay (`delay=5s`) of five seconds before the first probe occurs. Each probe runs for a duration of one second (`timeout=1s`) and is considered successful if it receives a response from the container. If two consecutive probes fail (`#failure=2`), the container is considered to be in an unhealthy state and the container is restarted. If one probe succeeds (`#success=1`), the pod is returned to a healthy status and the failure count resets.

Then let's look at the contents of the `Events` field. The Unhealthy event is output and a message is shown that Liveness Probe has failed due to connection refused.

```shell
$ kubectl describe pod yatteiki-app-7c474cf847-ggnzs -n yatteiki
  ...
Events:
  Type     Reason     Age                   From               Message
  ----     ------     ----                  ----               -------
  Normal   Scheduled  2m40s                 default-scheduler  Successfully assigned yatteiki/yatteiki-app-7c474cf847-ggnzs to minikube
  Normal   Pulled     2m38s                 kubelet            Successfully pulled image "ozawashuhe/yatteiki_tsg" in 2.334091876s
  Normal   Pulled     2m27s                 kubelet            Successfully pulled image "ozawashuhe/yatteiki_tsg" in 2.245258333s
  Normal   Pulled     2m15s                 kubelet            Successfully pulled image "ozawashuhe/yatteiki_tsg" in 2.239544918s
  Warning  Unhealthy  2m5s (x6 over 2m32s)  kubelet            Liveness probe failed: dial tcp 172.17.0.5:80: connect: connection refused
  Normal   Killing    2m5s (x3 over 2m29s)  kubelet            Container yatteiki-app failed liveness probe, will be restarted
  Normal   Pulling    2m5s (x4 over 2m41s)  kubelet            Pulling image "ozawashuhe/yatteiki_tsg"
  Normal   Created    2m3s (x4 over 2m38s)  kubelet            Created container yatteiki-app
  Normal   Started    2m3s (x4 over 2m38s)  kubelet            Started container yatteiki-app
  Normal   Pulled     2m3s                  kubelet            Successfully pulled image "ozawashuhe/yatteiki_tsg" in 2.265929085s
```

In this example Pod, the `Containers.yatteiki-app.Port` field shows 8080/TCP. This confirms that the application container is configured to accept requests on TCP port 8080.

On the other hand, the Liveness Probe message shows `dial tcp 172.17.0.5:80`, indicating that the probe is accessing TCP port 80.

The probe request failed because the port number exposed by the application container does not match the port number accessed by the probe.

Modify the Pod's YAML manifest so that the Liveness Probe checks port 8080 according to the port number exposed by the application container.

```yaml
# Excerpt from Pod's YAML manifest
  ...
        livenessProbe:
          tcpSocket:
            port: 8080    # Modify port from 80 to 8080
          initialDelaySeconds: 5
          periodSeconds: 3
          timeoutSeconds: 1
          successThreshold: 1
          failureThreshold: 2
  ...
```

Modify the Liveness Probe settings and redeploy the YAML manifest to the cluster.
After that, the Pod status becomes `Running` and we can confirm that it starts successfully.

```shell
$ kubectl get pods yatteiki-app-5d6556c879-6qq6j -n yatteiki
NAME                            READY   STATUS    RESTARTS   AGE
yatteiki-app-5d6556c879-6qq6j   1/1     Running   0          34s
```

#### Recommendations for Probe Failures

From the messages in the `Events` field of the `kubectl describe pod` command, determine what probe caused the Pod to fail and, if necessary, check the application implementation and behavior for any problems. If the health check fails even though the Liveness Probe is configured correctly, it is assumed that the application is not responding in a way that satisfies the conditions set in the Liveness Probe.

Liveness Probe has a health check timeout period, which defaults to 1 second. A timeout error may cause the health check to fail, if the application is taking a longer time to respond. The timeout time can be set in the `timeoutSeconds` field. If the application is expected to take some time before returning a response, increase the value of `timeoutSeconds`.

Some applications may take a while to be able to return a response after being launched.

The Liveness Probe has an `initialDelaySeconds` field that sets the number of seconds between the container startup and the start of the health check. If it takes some time before a response can be returned due to initialization or other reasons, increase the value of initialDelaySeconds to adjust the timing of the health check start.

In the health check by HTTP ([httpGet](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-a-liveness-http-request)), a health check is considered successful if the HTTP status code is between `200` and `400`, and any other status code is considered a failure.

If a health check is failing because an error status is returned, check to see if there is a problem with the operation of the application.

---

### Out of Memory Failure or OOMKilled status

In Kubernetes, the `spec.containers[].resources.limits` field in a Pod's YAML manifest allows you to set the maximum amount of resources a container can use. In the `resources.limits` field, you can set CPU and memory usage limits by specifying the `cpu` and `memory` fields. The limits values defined here are the maximum allowed for each resource, but the behavior differs for each resource when the limit is hit.

If the container's memory usage increases and reaches the maximum amount of memory that can be allocated, the container will be killed. If the memory usage increases again after restart, the container will be repeatedly killed and restarted, and the Pod will enter the `CrashLoopBackOff` status.

> You can try this scenario at ACT Learning Path: [AKS Performance Specialist  Learning Path - Hands-on Lab Linux Memory-> OOMKilled](/Azure-Kubernetes-Service-Wiki/New-Hires-and-Training/ACT-Readiness/ACT-certification-program/ACT-Specialist-Cert/AKS-Performance-Specialist-Learning-Path/Hands%2Don-Lab-Linux-Memory%2D%3E-OOMKilled)

In the following example command, the Pod is in `CrashLoopBackOff` status.

```shell
$ kubectl get pods
NAME            READY   STATUS             RESTARTS      AGE
yatteikipod     0/1     CrashLoopBackOff   1 (15s ago)   20s
```

Let's check the Pod details with the `kubectl describe pod` command. Checking the `Events` field, we see that the container failed to start, but the messages displayed do not help us determine the specific cause.

```shell
$ kubectl describe pod yatteikipod
  ...
Events:
  Type     Reason     Age                            From               Message
  ----     ------     ----                           ----               -------
  Normal   Scheduled  <invalid>                      default-scheduler  Successfully assigned default/yatteikipod to aks-userpool-13626143-vmss000000
  Normal   Pulled     <invalid>                      kubelet            Successfully pulled image "polinux/stress" in 1.66793973s
  Normal   Pulling    <invalid> (x2 over <invalid>)  kubelet            Pulling image "polinux/stress"
  Normal   Created    <invalid> (x2 over <invalid>)  kubelet            Created container yatteikipod
  Normal   Started    <invalid> (x2 over <invalid>)  kubelet            Started container yatteikipod
  Normal   Pulled     <invalid>                      kubelet            Successfully pulled image "polinux/stress" in 1.757572989s
  Warning  BackOff    <invalid> (x2 over <invalid>)  kubelet            Back-off restarting failed container
```

On the other hand, checking the container's `Status.LastState.Reason` field shows `OOMKilled`.

```shell
$ kubectl describe pod yatteikipod
Name:         yatteikipod
Namespace:    default
Priority:     0
Node:         aks-userpool-13626143-vmss000000/10.224.0.4
Start Time:   Mon, 13 Jun 2022 01:33:55 +0900
Labels:       <none>
Annotations:  <none>
Status:       Running
Containers:
  yatteikipod:
  ...
    State:          Waiting
      Reason:       CrashLoopBackOff
    Last State:     Terminated
      Reason:       OOMKilled
      Exit Code:    1
      Started:      Mon, 13 Jun 2022 01:34:00 +0900
      Finished:     Mon, 13 Jun 2022 01:34:00 +0900
    Ready:          False
    Restart Count:  1
    Limits:
      memory:  100Mi
    Requests:
      memory:     50Mi
  ...
```

If `OOMKilled` appears in the `Reason` field, it indicates that the container was killed due to lack of memory. `OOMKilled` occurs when the container's memory usage increases to the limit of the memory usage allocation limit for the container, `limits.memory`, or when the memory resources available for allocation on a node are exhausted.

If CPU usage reaches the upper limit set in the `limits.cpu` field, no CPU time is allocated to the container, but no forced termination of the container occurs.
However, for memory usage, if the upper limit in `limits.memory` is reached, [the container will be killed by `OOMKilled`](https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/#exceed-a-container-s-memory-limit).

#### OOM Recommendation

When a container is killed by `OOMKilled`, there are several remedies depending on the situation.

If the application is using more memory space than expected, investigate and tune the application from the application's point of view to see if there is a problem in memory allocation.

If the application requires more memory space for operation and there is sufficient free memory space on the node where the Pod is deployed, increase the value of `limits.memory`. If the existing nodes in the cluster do not have sufficient free memory space, try to [scale out the node pool](https://learn.microsoft.com/en-us/azure/aks/use-multiple-node-pools#scale-a-node-pool-manually) and see if you can deploy the Pod to a newly added node with free memory space.
Or, consider upgrading to a node with larger memory size by changing VM size ([changing VM size](https://learn.microsoft.com/en-us/azure/aks/resize-node-pool)).

In Kubernetes, you may deploy multiple types of application Pods on a single cluster or share a single cluster with multiple teams ([multi-tenant clusters](https://learn.microsoft.com/en-us/azure/aks/operator-best-practices-cluster-isolation)).

To avoid unintentional resource exhaustion due to misconfiguration or program malfunction, it is recommended to limit resources in the `limits` field.
You can use [ResourceQuota](https://learn.microsoft.com/en-us/azure/aks/operator-best-practices-scheduler#enforce-resource-quotas) to enforce resource requests and limits for Pods. In doing so, be careful not to limit the amount of memory that is needed for the application workload.

---

## Additional resources

- [Kubernetes Documentation / Tasks / Monitoring, Logging, and Debugging / Troubleshooting Applications](https://kubernetes.io/docs/tasks/debug/debug-application/)

## Owner and Contributors

**Owner:** jamesonhearn <jamesonhearn@microsoft.com>

**Contributors:**

- Kenichiro Hirahara <khiraha@microsoft.com>
- Yuki Kirii <yukirii@microsoft.com>
- Enrique Lobo Breckenridge <enriquelo@microsoft.com>
