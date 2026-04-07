---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Microsoft Identity Manager/MIM 2016 Overview/Support Guidelines/MIM Performance Best Practices"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FMicrosoft%20Identity%20Manager%2FMIM%202016%20Overview%2FSupport%20Guidelines%2FMIM%20Performance%20Best%20Practices"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   


In general, the product is designed for best performance, either in product design or in database design. Therefore, there is no option or configuration in MIM to speed up the product. It is very important to understand exactly which steps are slow or not fulfilling customer expectation and to focus on relevant environment details. Of course, one major requirement are data to compare. If the solution is run for the first time, we don't have anything to compare it with. For example, moving from  Deployment1 to Deployment2 and seeing different performance will require lots of details to compare and finding the differences may be difficult. Having the exact same deployment with better performance in the past and currently much slower performance, then we have that older data as base for our compare.

### Synchronization Service Engine

MIM is a very tough SQL client. We use our databases very intense and our behavior does not match a default SQL server design perfectly. SQL Server is optimized to serve lots of clients simultaneous accessing the databases. That is very different to MIM behavior. We are a single client, doing most activity in serial communication with the SQL Server and not lots of parallel sessions. Having that explained as a base, we now need tracking down exactly what is not meeting your expectation:
- which exact RUN profile (Full/Delta Import Stage Only, Full/Delta Synchronization or Export; no combined profiles, no overall sync cycle, which exact RUN profile)
- which Management Agent exactly (what is the Connected Directory)

1. **Import**: On Import we connect to the Connected Directory and just write into our database. Performance impact is here based on Connected Directory speed (like: if the Directory is Active Directory, how fast is the network connection to that DC, how fast is he responding etc) and on SQL Server speed to store the data in our database. And if Delta Import, how many changes are identified on that Directory. The most fast speed to proof an Import is when running an Import and writing into a logfile (RUN Profile Option)and then stop the RUN (choose Option 3 in Logfile option in RUN profile, this will write into a plain text file and not importing into the database, not into the Connector Space)

2. **Export**: On export the other way around, most performance impact is from the Connected Directory, how fast it can accept and process our exported data. Here you see huge differences, like Web Service being very slow and AD or flat file very fast. You can export into a logfile and stop the run as well, that is the maximum speed we can export to a target Directory

3. **Synchronization**: 
- During synchronization all your custom code (either provisioning DLL in scripted provisioning or Synchronization Rules in declarative provisioning) is executed, so if your code is complex and nested, it might take longer and could be improved 
- if you're using huge groups (>50k members) that takes longer to handle them. Typically we see the sync profile like hang, but actually SQL server is busy and we too. Nested groups are recommended as they have much less performance impact 
- Huge number of disconnectors is bad as they need to get processed always, so if possible get rid of disconnectors 
- Synchronization is a very tough SQL client, so all about sync speed is based on SQL server performance. From experience, it's not important having lots of CPU or lots of RAM, most important is mostly disk I/O, so the most modern SAN might be slower then fast and modern SAS (Server attached Storage, i.e. local SSD disks). And have a fast SQL server connectivity 
- to keep SQL Server most performant, we recommend using SQL server practices, (1) rebuild indices (as often as it makes sense and helps), (2) update statistics (as often as it makes sense and helps) use more temp db files (one per core) and more spindles on SQL server (3) if your environment encounters very high load: have a separate SQL instance for MIM Synchronization Service database and MIM Service database, (4) you might have a discussion with your SQL admins and might need to do some testing, if modifying "Max degree of Parallelism" does improve the performance (see https://docs.microsoft.com/en-us/previous-versions/sql/sql-server-2008-r2/ms181007(v=sql.105)  ) 

### MIM Service and Portal

1. Highest impact for MIM Service: your schema (how you configured your SETs, filtering, MPRs etc., see https://docs.microsoft.com/en-us/previous-versions/mim/ff608274%28v%3dws.10%29#performance  for some Best Practice on that) 

2. If customer is using large quantity of groups (>50k members), that takes longer to handle them. Nested groups are recommended as they have much less performance impact 

3. When talking about MIM MA, we implemented some enhancement that we can run asynchronous requests on export, that might help on performance, so very detailed reading here: https://blogs.technet.microsoft.com/iamsupport/2016/10/06/tuning-fim-service-ma-export-processing/  (as well as in our Identity Onenote 
MIMMA, FIMMA Export fails)

4. Enable Service partitions, as explained here: http://social.technet.microsoft.com/wiki/contents/articles/2363.understanding-fim-service-partitions.aspx  

5. The MIM Service is a Web Service and a very tough SQL client, so all about sync speed is based on SQL server performance. Very important is disk I/O and have a fast SQL server connectivity.

`		a. rebuild indices (as often as it makes sense and helps) 
(during tshooting phase, customer should run this SQL Maintenance daily)
		b. rebuild ftcatalog 
		c. update statistics (as often as it makes sense and helps) 
		d. use more temp db files (one per core) and more spindles on SQL server 
			i. configure at least 8 tempdb files (or per core one tempdb file if less than 8 cores on SQL Server), all of exact same size and large enough to avoid autogrowth as this is slower than having large files (start with 8 files, same size, monitor if they increase after running two normal cycle. If yes, double the size for all files and check again until no file does mot autogrowth) 
 If you've a high load, Service and Sync databases must be on separate instances `

6. If your environment encounters very high load: have a separate SQL instance for MIM Service database

7. Try having a discussion with customer's SQL admins (or collab with SQL team) and to do some testing. Check if modifying "Max degree of Parallelism" does improve the performance (see https://docs.microsoft.com/en-us/previous-versions/sql/sql-server-2008-r2/ms181007(v=sql.105)) 

8. Provide Lock Pages In
9. Rights to SQL server service account. Please follow this link in order accomplish that: http://msdn.microsoft.com/en-us/library/ms190730.aspx

MSINTERNAL Note: MAXDOP / "max degree of parallelism"

From PG, `If you increase the SQL parallelism the SQL server will re-generate all query plans but since it can�t predict the dynamic SQL we give it, you frequently get bad plans leading to a slower system. We�ve had several PSS cases where the customer changed SQL parallelism and then called PSS because an 8hour sync took 28h instead. If you decide to do this, make sure you really test it before making the change in production. `

### Scoping filter-based sync rules

When using legacy syncrules with MPR, WF and SET, all WF parameters are stored in EREs. And this not only creates an additional object in metaverse but also a link (or several links) between a user object and ERE(s).
So from this point of view � there�s no benefit of having EREs at all. You still import the same data into MV but you pay an extra cost of maintaining links.
Needless to say that sync process has to resolve those links, apply ERE params to sync rules and make some extra calculations compared to just reading user object as-is.
 
In average (when I did migration from WF based sync rules to scope based sync rules) I saw MIM Service DB shrunk from 70GB to 5GB, MIM Sync DB shrunk from 40GB to 5GB, full sync cycle decreased from 2 hours to 40 minutes.
Obviously, depends on a number of EREs and DREs per object. There were about 5-10 of those per user.

###SET Evaluations

During nightly FIM Jobs set memberships are recalculated, this might take longer if many membership changes have been processed (a number of requests -including failed requests- to be evaluated for set membership). To check more into this, it should help investigating heavy sets and unnecessary criteria like CreatedTime after 2011-01-01 or Display Name starts with �Update�. Heavy sets and membership calculation is known to cause high impact, as maybe millions of rows in temp tables get created, for example "heavy" group membership criteria, like "Manager is not in All People" or "expiration time after 2020-01-01' - criteria that affects all objects regardless of the type. Then either remove those criteria or mark those groups for deferred evaluation. This is what Deployment owner/designer/Architect/Consultant needs to do. We can guide with help. In addition, we had improvements in SET membership calculation in 4.6.607.0 build, but this improvement is small and SET criteria impact is much higher.

### Finetuning

To finetune behavior of MIMService, we can help and guide customer to test different values. Those are explained in Microsoft.ResourceManagement.Service.exe.config

Required Background: pls read Understanding FIM Service Partitions - TechNet Articles - United States (English) - TechNet Wiki (microsoft.com)
(see here Understanding FIM Service Partitions )
If some environment is busy, you need to have few topics in mind:
	- Each request is stamped with the Servicepartitionname and only a server belonging to same Service Partition will process those requests. If you change the ServicePartitonname - all previously created requests waiting for processing are stuck. ==> this is not a change you should do on the fly, this requires some planning on customer side. If environment is very busy, Servicepartitioning might help to spread the load and keep user or admin portals accessible - if SQL is powerful enough
	- MIMService will get requests from Synchronization (MIMMA), those requests will be handled from all Servers in a Service Partition. You can enable or disable this processing, using parameter receiveSynchronizationRequestsEnabled,if you disable this, this particular server will no more handle those requests 
	- MIMService will create requests from itself, those requests are handled on all servers in a Servicepartition. You can enable or disable this processing, using parameter processSystemPartition,if you disable this, this particular server will no more handle those requests 

	==> if you have i.e. 3 servers in one Systempartition, you can dedicate one or two to processSystempartition only, same for receiveSynchronizationRequestsEnabled to handle Synchronization requests. If one Server has both values disabled, it will have less load and might have better availability for user raised Portal Requests etc.
	==> and if you dedicate one server into some separate Servicepartition, you then can use this a i.e. Admin Server, only for Administrators, to not overload the User Portals (which are running in other Service Partition).

BUT
	- Have in mind, all those requests are handled from same SQL Server in the backend. If that is overloaded - MIM is just stuck. And overloading does not mean SQL is busy (not an issue for number of cores or memory), but diskIO, disk latency, network latency can make SQL requests taking longer and our requests fail due to timeout. Then customer could maybe test by increasing backgroundDataProcessingTimeoutInSeconds, needs to be testing, no guarantee this will help or solve that issue at all


 

```
<resourceManagementService externalHostName="service.fabrikam.com" />
<!--
Additional properties that can be specified for the <resourceManagementService /> configuration section
 
PropertyName    DefaultValue     Description
____________________________________________________________________________________
 
Timeout values will -most likely- not help, as this is not for handling time used by SPROCs. It will only help during VALIDATING phase. If that procedure is taking longer, it MIGHT help,
 
servicePartitionName            Uses the value of externalHostName    Will be converted to UPPERCASE. This value is used by FIM to declare which Service Partition this FIM Service belongs to. This is used to support an Isolated configuration.
 
processSystemPartition        true    FIM creates requests that originate from within the database. These requests will be marked as belonging to the SystemPartition. All FIM Services will be configured to process these Requests unless this property is set to false.
 
receiveSynchronizationRequestsEnabled        true    Whether this instance of the Forefront Identity Manager Service should receive export requests from the Synchronization Service. At least one instance should be configured to receive export requests. Other instances can optionally be excluded from having to process those requests.
 
-->
```
## MIM 2016 Sync Service Performance on Azure VMs

First, it's important to note that the use of the Azure Migrate Service to migrate a MIM solution to Azure VMs hasn't been tested by the MIM product group.

For performance related issues in the FIMSynchronizationService, we've had some customers report they have to go to the very highest level of drive type in order to obtain close to the same performance as they experienced on-prem. This has to do with the huge number of very small transactions that the synchronization service executes during a Synchronization run profile step.

While they may not see any performance issue on the SQL Server side, please make sure they look at SQL IO latency (disk latency) during a Sync run. This is usually where we see a performance issues.

If the only place they see performance issues is on the Synchronization run profiles and not the Import / Export run profiles, then it's likely that it's disk IO latency on the SQL Server instance that's causing the issue.

The other thing they need to confirm is that the MIM server and the SQL Server instance are in the same network segment. Each network hop between the MIM servers and the SQL Server instances will increase the amount of time it takes to execute run profiles.

Furthermore, on the server hosting the MIM Synchronization Service, make sure they don't have too many virtual processors if the sync service is the only thing hosted on that machine. It's better to have two extremely fast processors on the Sync machine, than 10 slower processors. Each run profile is a single-threaded operation, and we found that hosting the Sync service on a server that's got a lot of processors can actually slow the processing of the sync service.

For testing, we generally configure the VM hosting the Sync service with 4 processors. This way, we have better processing power for UX operations and faster installation of Windows Updates. Generally speaking, this configuration usually doesn't create a problem with the processing of the run profiles.

**Rules Extensions:**
Some Sync solutions include rules extensions. Often customers build calls to external resources into these rules extensions. After migrating to Azure VMs, these calls to external resources may take longer to process, if the resource accessed isn't close in the networking to the Sync service. This is why we highly discourage all external calls in Rules Extensions.




