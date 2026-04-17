# AKS Istio 安装与配置 — service-mesh — 排查工作流

**来源草稿**: ado-wiki-a-Pod-to-Pod-Proxy-Issues.md, ado-wiki-b-Troubleshooting-database-connectivity.md, ado-wiki-connectivity-troubleshooting.md, ado-wiki-tsg-check-apiserver-proxy-logs.md
**Kusto 引用**: 无
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting Flow
> 来源: ado-wiki-a-Pod-to-Pod-Proxy-Issues.md | 适用: 适用范围未明确

### 排查步骤

Pod-to-pod communication and sidecar injection issues can manifest for a range of reasons. The troubleshooting steps below aren't anything unique for pod-to-pod communication issues, but they'll reveal any potential issues in the mesh.
Run all istioctl commands from a machine with kubectl + istioctl installed which has cluster access. Ensure access to both application namespaces and aks-istio-system. Do not runs these commands inside the pods.

> **Note:** If one of the pods experiencing issues is a Gateway pod (`istio-ingressgateway` or `istio-egressgateway`), treat the gateway pod as you would any other pod - there's no special troubleshooting required for the gateway sidecars.

1. Run the following `istioctl` commands to retrieve proxy status and configuration, check injection status for a pod, and generate an Istio bug report:

   ```bash
   # Get the proxy status and configuration for the problem pod(s)
   istioctl proxy-status -i aks-istio-system -r asm-1-17
   istioctl proxy-config all -i aks-istio-system -r asm-1-17 -n <namespace> <pod-name> # Do this for each pod in question, saving the output into a unique file for each pod

    # Check the injection status for the problem pod(s)
    istioctl x check-inject -i aks-istio-system -n <namespace> <pod-name> # Do this for each pod in question, saving the output into a unique file for each pod

    # Generate an Istio bug report
    istioctl bug-report --istio-namespace aks-istio-system
    ```

2. Collect the istio-proxy container logs from the problem pod(s):

   ```bash
   kubectl logs <pod-name> -c istio-proxy -n <namespace> > istio-proxy.log # Do this for each pod in question, saving the output into a unique file for each pod
   ```

3. Based on the information presented in the previous commands as well as the log output gathered from the Istiod logs, unless an obvious issue is identified start an IcM escalation to the PG for assistance.

   ASC should work correctly when the "Escalate Case" button is used, but the link <https://aka.ms/istio-cri> should work as well.

   This IcM will route directly to the AKS RP team for triage and investigation.

   Be sure to include as much of the information gathered in the previous steps as possible in the IcM.

---

## Scenario 2: Troubleshooting Database Connectivity Issues
> 来源: ado-wiki-b-Troubleshooting-database-connectivity.md | 适用: 适用范围未明确

### 排查步骤

#### Troubleshooting Database Connectivity Issues


#### Summary

The following guides help test connectivity from AKS to different database types:

> **Incident troubleshooting start page:** [Application Failures Overview](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Application-Failures-Overview.md)
>
> **Labs and scenario index:** [Application Failure Labs Index](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Application-Failure-Labs.md)

- [Testing MongoDB connectivity from AKS](#testing-mongodb-connectivity-from-aks)
- [Testing Azure SQL Server connection from AKS](#testing-azure-sql-server-connection-from-aks)
- [Testing Azure PostgreSQL connection from AKS](#testing-azure-postgresql-connection-from-aks)
- [Testing Azure MySQL connection from AKS](#testing-azure-mysql-connection-from-aks)

#### Prerequisites

There are a few package dependencies that we depend on for these scripts to work. We have installation steps below for Mariner and Ubuntu base images.

##### Mariner

We'll deploy a single pod into the cluster using the YAML provided below or the following `kubectl run` command: `kubectl run -it --rm --restart=Never --image=mcr.microsoft.com/cbl-mariner/base/core:2.0 --command -- bash`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mariner-test
spec:
  containers:
    - name: mariner
      image: mcr.microsoft.com/cbl-mariner/base/core:2.0
      command: ['tail', '-f', '/dev/null']
```

Once the pod is deployed, we can exec into the pod and install the required dependencies using the following commands:

```bash
tdnf update
tdnf install -y python3 python3-pip python3-setuptools

#### If troubleshooting PostgreSQL, install the following:
tdnf install -y libpq-devel libpq

#### If troubleshooting MySQL, install the following:
pip install mysql-connector-python

#### If troubleshooting MongoDB, install the following:
pip install pymongo

#### If troubleshooting Azure SQL, install the following:
pip install pymssql
```

##### Ubuntu

We'll deploy a single pod into the cluster using the YAML provided below or the following `kubectl run` command: `kubectl run -it --rm --restart=Never --image=ubuntu:22.04 --command -- bash`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ubuntu-test
spec:
  containers:
    - name: ubuntu
      image: ubuntu
      command: ['tail', '-f', '/dev/null']
```

Once the pod is deployed, we can exec into the pod and install the required dependencies using the following commands:

```bash
apt update
apt install python3 python3-pip python3-setuptools -y

#### If troubleshooting PostgreSQL, install the following:
apt install libpq-dev libpq5 -y
pip install psycopg2

#### If troubleshooting MySQL, install the following:
pip install mysql-connector-python

#### If troubleshooting MongoDB, install the following:
pip install pymongo

#### If troubleshooting Azure SQL, install the following:
pip install pymssql
```

#### Connectivity Tests

##### Testing MongoDB connectivity from AKS

Prior to running the test, we'll need to get the full connection string for the MongoDB instance we're testing connectivity to. Once we have the connection string, we'll fill it in to the script below:

```py
import pymongo
import time

def mongoTest():
  st = time.time()
  ConnStr = "Add here your Connection String"
  client = pymongo.MongoClient(ConnStr)
  try:
    client.server_info()  # validate connection string
    et = time.time()
    elapsed_time = et - st
    print("Connected in ", elapsed_time, "seconds" )
  except (
    pymongo.errors.OperationFailure,
    pymongo.errors.ConnectionFailure,
    pymongo.errors.ExecutionTimeout,
    ) as err:
         sys.exit("Can't connect:" + str(err))
  except Exception as err:
      sys.exit("Error:" + str(err))

if __name__ == '__main__':
  print("Running MongoDB Testing script")
  while True:
    mongoTest()
```

Once the script is updated, we can copy it into the pod and run it using the following commands:

```bash
kubectl cp mongoTest.py <pod-name>:/mongoTest.py
kubectl exec -it <pod-name> -- python3 mongoTest.py
```

This script will run in a continuous loop and will measure and display the connectivity time of the **connect**.

##### Testing Azure SQL Server connection from AKS

Save the following script to the `sqlserver.py` file and copy it into the pod using `kubectl cp sqlserver.py <pod-name>:/sqlserver.py`:

```py
import pymssql
import os
import time
from datetime import datetime

def checkAzureSql(server, user, password, database):
    try:
        now = datetime.now()
        dt_string = now.strftime("%d/%m/%Y %H:%M:%S")
        conn = pymssql.connect(server=server, user=user, password=password, database=database)
    cursor = conn.cursor()
    print("Successfull Connected to Azure SQL")
    conn.close()
    file1= open("azsqltest.log","a")
    content = dt_string + " " + "Successfull Connected to Azure SQL"
    file1.write(content)
    file1.write("\n")
    file1.close()
  except:
    print(dt_string + " " + "A MSSQLDriverException has been caught.")
    file1= open("azsqltest.log","a")
    content = dt_string + " " + "A MSSQLDriverException has been caught."
    file1.write(content)
    file1.write("\n")
    file1.close()
if __name__ == '__main__':
  print("Starting AzureSQL Connectivity Check:...")
  myHostname = os.getenv('SQLSERVER')
  myPGUser = os.getenv("SQLUSER")
  myPassword = os.environ.get('SQLPASS')
  myDB = os.environ.get('SQLDB')
  interval = os.environ.get('TIMEINTERVAL')
  while True:
    checkAzureSql(myHostname, myPGUser, myPassword, myDB)
    time.sleep(int(interval))
```

Within our existing Bash session we used to install the prerequisites, we'll need to set the following environment variables:

```bash
export SQLSERVER="yourslqname.database.windows.net"
export SQLUSER="yourskluser@yoursqlname.database.windows.net"
export SQLPASS="yoursqlpassword"
export SQLDB="yousql_db_name"
export TIMEINTERVAL="5"

#And then run the script using the following command:
python3 sqlserver.py
```

##### Testing Azure PostgreSQL connection from AKS

Save the following script to the `pgsql.py` file and copy it into the pod using `kubectl cp pgsql.py <pod-name>:/pgsql.py`:

```py
import psycopg2
import os
import time
from datetime import datetime

def checkPostgresql (host, user, dbname, password):
    now = datetime.now()
    dt_string = now.strftime("%d/%m/%Y %H:%M:%S")
    sslmode = "require"
    try:
      conn_string = "host={0} user={1} dbname={2} password={3} sslmode={4}".format(host, user, dbname, password, sslmode)
      conn = psycopg2.connect(conn_string)
      print(dt_string + " " + "Connection established")
      conn.close()
    except Exception as error:
      print(dt_string + " " + "Connection Failure" + " " + str(error))

if __name__ == '__main__':
  print("Starting PostreSql Connectivity Check:...")
  myHostname = os.getenv('PGHOST')
  myPGUser = os.getenv("PGUSER")
  myPassword = os.environ.get('PGPASS')
  myDB = os.environ.get('DBNAME')
  interval = os.environ.get('TIMEINTERVAL')
  while True:
    checkPostgresql(myHostname, myPGUser, myDB, myPassword)
    time.sleep(int(interval))
```

Environment variables:

```bash
export PGHOST="your-db-server.postgres.database.azure.com"
export PGUSER="your-db-user"
export PGPASSWORD="your-db-password"
export DBNAME="your-db-name"
export TIMEINETERVAL="5"
```

##### Testing Azure MySQL connection from AKS

Create a file named `mysqlTest.py` and copy the following script into it:

```py
import mysql.connector
from mysql.connector import errorcode
import os
import time
from datetime import datetime

def checkMySql():
  try:
    now = datetime.now()
    dt_string = now.strftime("%d/%m/%Y %H:%M:%S")
    conn = mysql.connector.connect(**config)
    print(dt_string + " " + "Connection established to MySQL Server")
    conn.close()
  except mysql.connector.Error as err:
    if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
     print("Something is wrong with the user name or password")
    elif err.errno == errorcode.ER_BAD_DB_ERROR:
      print("Database does not exist")
    else:
      print(err)

if __name__ == '__main__':
  myHostname = os.getenv('SQLSERVER')
  mySQLUser = os.getenv("SQLUSER")
  myPassword = os.environ.get('SQLPASS')
  myDB = os.environ.get('SQLDB')
  interval = os.environ.get('TIMEINTERVAL')
  config = {
  'host':myHostname,
  'user':mySQLUser,
  'password':myPassword,
  'database':myDB,
  'client_flags': [mysql.connector.ClientFlag.SSL],
  'ssl_ca': '/home/user/mysql/DigiCertGlobalRootG2.crt.pem'
  }
  print("Starting MySQL Connectivity Check:...")
  while True:
    checkMySql()
    time.sleep(int(interval))
```

Environment variables:

```bash
export SQLSERVER="yourMySQLSERVER"
export SQLUSER="yourMySQLUser"
export SQLPASS="yourMySQLPassword"
export DBNAME="yourDBName"
export TIMEINETERVAL="5"

python3 mysqlTest.py
```

---

## Scenario 3: AKS Network Connectivity Troubleshooting
> 来源: ado-wiki-connectivity-troubleshooting.md | 适用: 适用范围未明确

### 排查步骤

#### AKS Network Connectivity Troubleshooting

#### General Approach
For all connectivity issues, identify: source IP, destination IP, destination port.

#### Unable to connect to a VM in a peered VNET
1. Verify VM is running and accessible within its own VNET
2. Check peering configuration
3. Check NSGs on VM and peered VNET
4. Verify IP address is correct
5. Check routing tables for correct routes

#### Unable to reach a port
1. Verify app/service is running in container/VM
2. Check NSGs on AKS nodes, app, and load balancers
3. Verify IP/hostname is correct
4. Check routing tables and NSGs for proper routing

#### Unable to connect to VM in same VNET
1. Verify VM is running
2. Check NSGs
3. Verify IP address
4. Check routing tables
5. Check for firewall or application issues on VM

#### VNet Peering Issues
Reference: https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/134291/Vnet-Peering

#### TLS Connection Troubleshooting
Reference: https://techcommunity.microsoft.com/t5/azure-paas-blog/ssl-tls-connection-issue-troubleshooting-test-tools/ba-p/2240059

#### Private Cluster API Server + NVA Decision Tree

```
Private AKS?
├── Yes → Using NVA?
│   ├── Yes → Using Private Endpoint Policy?
│   │   ├── Yes → Customer uses SNAT in NVA?
│   │   │   ├── Yes → Follow PE documentation
│   │   │   └── No → Configure SNAT (REQUIRED for AKS Private Cluster)
│   │   └── No → Follow "Can't connect to PE" wiki
│   └── No → Follow "Can't connect to PE" wiki
└── No → Standard connectivity troubleshooting
```

##### Key Point: SNAT Required for Private AKS + NVA
- Some PE resources (like Storage Account) work through AzFW/NVA without SNAT
- **AKS Private Cluster DOES NOT work without SNAT** through NVA/AzFW
- Must configure SNAT on firewall side for traffic to private endpoints
- Reference: https://learn.microsoft.com/en-us/azure/private-link/inspect-traffic-with-azure-firewall
- Internal: https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1008662/User-Defined-Routes-Support-For-Private-Endpoints

---

## Scenario 4: tsg-check-apiserver-proxy-logs
> 来源: ado-wiki-tsg-check-apiserver-proxy-logs.md | 适用: 适用范围未明确

### 排查步骤

In the scenario of AKS nodes failing to connect to APIServer (eg. error message below), it might be useful to check for APIServer's proxy logs - available in CCP.

#### Sample error messages

```
Get https://<cluster>.hcp.<region>.azmk8s.io:443/api/v1/nodes/<node>?resourceVersion=0&timeout=10s: net/http: request canceled (Client.Timeout exceeded while awaiting headers)
```

```
cannot connect once" err="rpc error: code = Unavailable desc = connection error: desc = \"transport: Error while dialing dial tcp <IP>:443: i/o timeout\""
```

```
Error preparing data for projected volume kube-api-access for pod kube-system/<pod>: failed to fetch token: Post "https://<cluster>.hcp.<region>.azmk8s.io:443/api/v1/namespaces/kube-system/serviceaccounts/kube-proxy/token": dial tcp <IP>:443: i/o timeout
```

#### Diagnostic Kusto Query

Check proxy logs in CCP to determine if external traffic is reaching the envoy proxy:

```kusto
cluster('aksccplogs.centralus.kusto.windows.net').database('AKSccplogs')
ControlPlaneEventsAll
| where PreciseTimeStamp between(datetime(YYYY-MM-DD HH:mm)..datetime(YYYY-MM-DD HH:mm))
| where ccpNamespace == "{ccpNamespace}"
| where category == "proxy"
| where properties !contains "GET /ready"
| where properties contains '"apiserver'
| extend p = parse_json(properties)
| extend l = parse_json(tostring(p.log))
| extend ss=split(tostring(l.sourceIP), ":")
| project PreciseTimeStamp, l.chain, sourceIP=tostring(ss[0]), l.duration, properties
| where ipv4_is_private(sourceIP) == false
| summarize count() by bin(PreciseTimeStamp, 30m)
| render columnchart
```

If proxy logs show no external incoming traffic during the failure window, the issue is likely happening before reaching the APIServer (e.g., a load balancer issue).

---
