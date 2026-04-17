---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Database and DC Boot Failures/Workflow: AD Database: DC no boot/DC No Boot: Resolution & Known issues/DB and log file relationships & How to recover a DB without corrupting it"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Database%20and%20DC%20Boot%20Failures%2FWorkflow%3A%20AD%20Database%3A%20DC%20no%20boot%2FDC%20No%20Boot%3A%20Resolution%20%26%20Known%20issues%2FDB%20and%20log%20file%20relationships%20%26%20How%20to%20recover%20a%20DB%20without%20corrupting%20it"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414774&Instance=414774&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414774&Instance=414774&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides a comprehensive guide on JET DB internals, focusing on the relationships and recovery of ESE databases. It includes detailed instructions on how to identify the state of a database, ensure all necessary files are present, and perform a safe recovery.

[[_TOC_]]

# TechReady material
http://aka.ms/ESETechReady contains 2 sessions on JET DB INTERNALS 

## EMS401 (covers no boot 0xc00002e2) 
Video: [EMS401.mp4](https://microsofteur-my.sharepoint.com/:v:/r/personal/lindakup_microsoft_com/Documents/TechReady/TR24/Video/EMS401.mp4?csf=1&web=1&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0RpcmVjdCJ9fQ&e=8lud3s)  
PPT: [EMS401.pptx](https://microsofteur-my.sharepoint.com/:v:/r/personal/lindakup_microsoft_com/Documents/TechReady/TR24/Video/EMS401.mp4?csf=1&web=1&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0RpcmVjdCJ9fQ&e=8lud3s)

## JET/ESE deep dive part 1: JET engine internals
Format and corruption analysis on grounded JET Blue database files (also known as ESE, the database engine used in Azure Active Directory, Active Directory, Exchange, Certificate Authority, etc.)

### Session objective(s): 
1. Learn the interrelation of the handful of ESE file types.
2. Learn the overall format of an ESE database file and ESE transaction log files, including practical skills with esentutl and Stealth.
3. Become a Corruptionologist: learn a full etymology of corruptions, and be able to distinguish between dirty/inconsistent, corrupted (by hardware) data, and possible bugs.

# ESE database and file relationships 
Here we will be using an ADLDS instance running on Windows 2016 which also uses an ESE database.

## Why should we care about the file relationships?  
If you dont know your file relationships, you can accidentally corrupt your database forever! It is crucial basic knowledge, like knowing which day of the week you should go to work on. The file relationships have also changed in WS2016 because of the new Jet Flush Map (JFM) file. We will explain this file in more detail in Part 3.

## The files 
Lets take this file list example from an AD LDS database on WS 2016.  
![Example of AD LDS database file list on WS 2016]( /.attachments/ADDatabase&DCBootFailures/DB_and_log_file_relationships_How_to_recover_a_DB_without_corrupting_it.jpg)

And lets go through what we have here:  
- **adamntds.dit**  This is the database file for AD LDS.  
We dived deep into this file in Part 1.  
**Note:** An ESE database can have various file extensions. It does not have to be a .DIT file like it is for AD and ADLDS. Many other ESE clients use a .EDB file as the database file.
- **adamntds.jfm** - The shiny new JET Flush Map file. We will discuss this in depth in part 3.
- **edb.chk** - Our checkpoint file.
- **edbxxxx.log** - A bunch of logs with a log base name of edb.
**Note:** The log base name is set by the application so different applications can also use different log base names. AD and ADLDS use edb as the log base name.
**We can observe there are 6 log files here from 1D to 21, and 22 is edb.log - the current log.**  
- Remember this for later! We will discuss all the files, their structures, and how they are linked in detail next.

## Do I have all the correct files to recover my database?
So, you have a copy of a database and logs, and you want to do some operations on it, like maybe you are investigating a corruption or want to repair or defrag your database.  
The first thing you need to understand is what is the state of your database and do you have all the needed logs?  
Lets remember the possible states of a database:

| **Clean Database** | **Dirty Database** |
|--------------------|--------------------|
| Process was shut down cleanly before DB and logs were copied. All logs have been replayed and all data is written into the database. The database is consistent. You can defrag it and view it with esentutil.exe | If the process did not shut down gracefully, then you have what is called a Dirty Database. A Dirty database is when not all data has yet been committed to the database file, and some of the transactions are still in the logs. |

In order to perform any operations on the database, such as a defrag, we need to have a Clean database. To get to a clean database we can run a repair  discussed later in this post.

But first, the most important thing is to check the basics and see that you have the RIGHT database and ALL of the needed and MATCHING logs. Else you can end up with corruption. You will see later how!

## Dumping the database header  
To see how the files relate, the first thing you can do is to dump the database header. This tells us the state of the database (Clean or Dirty) as well as which log files are required.  
The database header can be dumped using the command `esentutl /mh <databasename>`. I have used some findstring.exe here for brevity (another favorite tool of mine!) to pick out only the important things I care about. But you can also just run it without the findstring.exe.  

![image.png](/.attachments/image-b491b7d9-b477-404b-a0e5-157e1baca1de.png) 
Note, the files on disk use HEX numbers like `edb0001E.log` and the esentutl.exe output will use both HEX and DEC numbering. So, to make it easy, I will go with the HEX, not because I am a SuperGeek but because it shows on both the filename and esentutl.exe. So its consistent and easier to follow.

- In the above output, we can see the **State** of this database is **DIRTY**.  
While the process is running, the last updates are in the transaction logs and the database is not consistent. This is a Dirty Database in other words. Another situation where you can have a dirty database is if the process has crashed and not shut down properly.
- We can see the **low Log Required is 1E** (or 30) and we know we have `edb0001E.log` on disk (did you remember those log file names from earlier?) so we are good.
- And the **high Log required is 0x22** (or 34) and that is `edb.log` in our example above  the current log is always the highest number log. So, we are good again! We know we have all the logs which are required to recover this database.
- **Last Consistent** is the last time the database was brought to a clean shutdown through [JetTerm()](https://learn.microsoft.com/en-us/windows/win32/extensible-storage-engine/jetterm-function?redirectedfrom=MSDN).
- **Last Detach** is the last time it was brought to a clean state through [JetDetachDatabase()](https://learn.microsoft.com/en-us/windows/win32/extensible-storage-engine/jetdetachdatabase-function?redirectedfrom=MSDN).

## The checkpoint file 
We can also dump the checkpoint file and see how this relates.  
 ![Example of checkpoint file dump]( /.attachments/image-756d9c00-dfa3-4542-a062-6a07ccf1493f.png)

We see this points to log 1E which is the lowest required log by the database too. This is how it should be. All good again. We now know we dont have some mismatching logs and database here, or missing logs. An engineer's heaven!  
As a visual diagram, we can picture the relationship something like this, before WS2016:  
![Relationship diagram before WS2016]( /.attachments/ADDatabase&DCBootFailures/DB_and_log_file_relationships_How_to_recover_a_DB_without_corrupting_it_2.jpg)

## How the file relationship changes in 2016 with the new JFM file 
Windows 2016 adds this new JFM file which changes the file relationships a little. Like this:  
![Relationship diagram with JFM file]( /.attachments/ADDatabase&DCBootFailures/DB_and_log_file_relationships_How_to_recover_a_DB_without_corrupting_it_3.jpg)

This also means that we move some of these arrows and we now require more logs.

![Updated relationship diagram with JFM file]( /.attachments/ADDatabase&DCBootFailures/DB_and_log_file_relationships_How_to_recover_a_DB_without_corrupting_it_4.jpg)

You can see that the **log required (Low)** is now actually pointing to **1E** (down one log) and the **checkpoint** (CHK) is also now pointing to **1E** as well as the JFM file. This is what we saw above when we dumped the headers.   
And then finally we add back also the old checkpoint and old relationships as well:

![Final relationship diagram with JFM file]( /.attachments/ADDatabase&DCBootFailures/DB_and_log_file_relationships_How_to_recover_a_DB_without_corrupting_it_5.jpg)

So, we also have a **Log Consistent** pointer from the database pointing to 1F. Notice, this used to be Log Required in WS2012 R2.   
You will probably need to stare at these diagrams a few times and look at all the arrows of before (2012 R2) and after (2016) before it really sinks in how it changed. It took me a while too.    
In a nutshell, we require an extra log in WS2016 now because of the flush map file, but we dont really need this log to make the database consistent. We only need 1F  22. But Log Required points to 1E because the flush map file needs it.    
Also, the new DbConsistent pointer from the CHK file is actually the old checkpoint and remains there.   
And JFM has a Required Min. (NEXT/Target)  
Basically, the old pointers remain but are renamed. And the new ones move down a log to accommodate the Flush Map.  
**The main takeaway is to dump the headers and check you have all the needed log numbers!**

## What to do with a dirty database? 
We dont like dirty databases. The problem with a dirty database is that some of the data is in the log files and has not yet been written to the database. So, you cant really view it with esentutl.exe or other tools. You cant defrag it, etc. Its not consistent. Its bad.  
To recover that or make it clean you need to use `esentutl /r` and give it a log base name. But wait!    
**How does it know where the logs are?**  
One of the ways people get into trouble is that they dont realize that the transaction log files also have the database path and a DB Signature in every log file.  
So, **when you run recovery it pulls the database path from the log files unless you tell it otherwise.**

## How not to corrupt your database during recovery...
### Things that are dangerous 
1. Moving or deleting log files and then running recovery (such as eseutil /r or even just mounting the database)  
One of the biggest mistakes people make is when they copy the database and logs to a different folder because they want to be safe and avoid touching the real database.   
But when they run recovery of that copy (**without /d**) it will find the ORIGINAL database, and it will recover THAT database using the copied logs! (Which could be way older and out of date!!) So, you end up in a horrible and weird situation where the new database is the CLEAN database, and the logs are now mismatched to it because recovery replayed the old logs from somewhere else.   
So you are basically TOAST.... kind of like you went to work on a weekend and slept in on Monday!! (which I do 100% realize for some people is actually normal)
2. **Moving** the database manually is also dangerous. If it is dirty you can miss the log files and the database will be essentially corrupted.

### Fool-proof recovery method
1. Copy all DB + Logs to some C:\data\YourDb.
2. cd C:\data\YourDb.
3. Run soft recovery: `esentutl /r edb /d.`
4. Never run it without /d.
5. Make sure you use /d.
6. Always use /d.
7. Remember to use /d.
8. I hope you used /d.
9. Now your database is good, now you can go to the pub.

## Is the JFM file needed for recovery?  
No. You can recover a database even if you dont have the JFM. Though, if you copied all the files, usually you will have the JFM as well.   
If the JFM is missing, ESE will create a new JFM file during recovery and it will log event 637 into the application event log to tell you that it did that.   
If the JFM file is present, ESE will write to it during recovery.   
See more in Part 3 about the JFM file and what its for. Also see Part 3 for what to do with the JFM during offline defrag.

## Homework  
Other stuff to read:  
[Extensible Storage Engine Files](https://learn.microsoft.com/en-us/windows/win32/extensible-storage-engine/extensible-storage-engine-files?redirectedfrom=MSDN)  

This info is published in SDK as  
[ADDS: JET: Database File Relationships, Clean and Dirty Data](https://internal.evergreen.microsoft.com/en-us/topic/3f5831f8-cabf-d0eb-65a3-fad3217dceda)