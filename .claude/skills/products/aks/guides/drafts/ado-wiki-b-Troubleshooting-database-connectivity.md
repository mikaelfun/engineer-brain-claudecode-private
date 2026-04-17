---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Others/Troubleshooting database connectivity"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FTroubleshooting%20database%20connectivity"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Troubleshooting Database Connectivity Issues

[[_TOC_]]

## Summary

The following guides help test connectivity from AKS to different database types:

> **Incident troubleshooting start page:** [Application Failures Overview](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Application-Failures-Overview.md)
>
> **Labs and scenario index:** [Application Failure Labs Index](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Application-Failure-Labs.md)

- [Testing MongoDB connectivity from AKS](#testing-mongodb-connectivity-from-aks)
- [Testing Azure SQL Server connection from AKS](#testing-azure-sql-server-connection-from-aks)
- [Testing Azure PostgreSQL connection from AKS](#testing-azure-postgresql-connection-from-aks)
- [Testing Azure MySQL connection from AKS](#testing-azure-mysql-connection-from-aks)

## Prerequisites

There are a few package dependencies that we depend on for these scripts to work. We have installation steps below for Mariner and Ubuntu base images.

### Mariner

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

# If troubleshooting PostgreSQL, install the following:
tdnf install -y libpq-devel libpq

# If troubleshooting MySQL, install the following:
pip install mysql-connector-python

# If troubleshooting MongoDB, install the following:
pip install pymongo

# If troubleshooting Azure SQL, install the following:
pip install pymssql
```

### Ubuntu

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

# If troubleshooting PostgreSQL, install the following:
apt install libpq-dev libpq5 -y
pip install psycopg2

# If troubleshooting MySQL, install the following:
pip install mysql-connector-python

# If troubleshooting MongoDB, install the following:
pip install pymongo

# If troubleshooting Azure SQL, install the following:
pip install pymssql
```

## Connectivity Tests

### Testing MongoDB connectivity from AKS

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

### Testing Azure SQL Server connection from AKS

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

### Testing Azure PostgreSQL connection from AKS

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

### Testing Azure MySQL connection from AKS

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
