---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Monitoring/Network connection monitor in AKS"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FMonitoring%2FNetwork%20connection%20monitor%20in%20AKS"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# A Golang based network connection monitor from AKS cluster with logging capabilities

## Summary and Goals

Microsoft Support engineers usually have cases where customers complain about network latencies for intra cluster resources or external destination.
This Golang based script is a Connection Monitor implementation with a small footprint that can run inside any customer Pod. Besides not having
high resource requirements, it provides the logging capabilities for latencies over predefined values.

## Prerequisites

This script can be used from a standard VM or within a Pod and requires a Golang runtime/compiler if we'll not use the precompiled version.
Tested with a **nginx** pod with default Golang repository installation: 1.15.15

```bash
kubectl run nginx --image=nginx
kubectl exec -it nginx -- bash
apt update
apt install golang -y
```

## Implementation Steps

Please copy the following Go file content locally:

```go
package main

import (
        "log"
        "fmt"
        "net"
        "os"
        "runtime"
        "strconv"
        "strings"
        "time"
        "context"
)

var (
        red    = "\x1b[31m"
        green  = "\x1b[32m"
        yellow = "\x1b[33m"
        blue   = "\x1b[34m"
        reset  = "\x1b[0m"
)

func main() {
        filenameSplit := strings.Split(os.Args[0], "/")
        filename := filenameSplit[len(filenameSplit)-1]

        if len(os.Args) < 4 {
                fmt.Printf("Usage: ./%v <ip> <port> <count> <delay ex: 5s, 5m, 2s, 2h> <threshold> \n", filename)
                return
        }

        var timeout time.Duration
        ip := os.Args[1]
        port := os.Args[2]
        count, _ := strconv.Atoi(os.Args[3])
        threshold, _ := strconv.Atoi(os.Args[5])

        if len(os.Args) == 6 {
                timeout, _ = time.ParseDuration(os.Args[4])
        }

        for i := 0; ; i++ {
                if count != -1 && i >= count {
                        break
                }

                beforeTime := time.Now()
                var d net.Dialer
                ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
                defer cancel()
                conn, err := d.DialContext(ctx, "tcp", ip+":"+port)
                if err != nil {
                        log.Fatalf("Failed to dial: %v", err)
                }
                roundedEndTime := time.Since(beforeTime).Round(time.Millisecond)
                conn.Close()

                if runtime.GOOS == "windows" {
                        red = ""
                        green = ""
                        yellow = ""
                        blue = ""
                        reset = ""
                }

                if err == nil {
                        fmt.Printf("%vConnected to %v:%v time=%v\n%v", green, ip, port, roundedEndTime, reset)
                        suf := roundedEndTime.String()
                        trimed := suf[:len(suf)-2]
                        intValue, _ := strconv.Atoi(trimed)
                        if intValue > threshold {
                                fmt.Println("Over Threshold Alert Raised")
                                f, err := os.OpenFile("output.txt", os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0600)
                                if err != nil {
                                        panic(err)
                                }
                                defer f.Close()
                                currentTime := time.Now()
                                formatedTime := currentTime.Format("2 Jan 06 03:04PM")
                                strList := []string{formatedTime, trimed, ip, port, "\n"}
                                fileLogs := strings.Join(strList, "\t")
                                if _, err = f.WriteString(fileLogs); err != nil {
                                        panic(err)
                                }
                        }
                } else {
                        fmt.Printf("%vFailed to connect to %v:%v time=%v\n%v", red, ip, port, roundedEndTime, reset)
                }

                time.Sleep(timeout | time.Second)
        }
}
```

## Usage

```bash
Usage: ./connectionmonitor <ip> <port> <count> <delay ex: 5s, 5m, 2s, 2h> <threshold>
```

- **ip**: Destination IP address of the endpoint we want to test
- **port**: Destination port of the endpoint
- **count**: Number of connection tests executed
- **delay**: Time delay added between consecutive tests in decimal + s/m (seconds/minutes)
- **threshold**: The Max value accepted for latency. If returned value will be higher than our configured **threshold** a logging line with timestamp will be added in **output.txt** file

As the returned values are written to **stdout**, they could be obtained from the Pod logs. If the threshold value has been exceeded we will see the following line in the output: **Over Threshold Alert Raised**
