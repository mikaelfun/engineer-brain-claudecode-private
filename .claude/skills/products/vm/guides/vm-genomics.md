# VM Genomics 基因组学 — 排查速查

**来源数**: 1 (AW) | **条目**: 7 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Genomics workflow fails with "Blob <blob> doesn't exist", "Source blob does not exist: <blob>", or " | Input blob does not exist in the specified storage container; incorrect storage  | 1) Verify input blobs exist in the specified container with the correct case-sen | 🔵 7.5 | AW |
| 2 | Genomics workflow fails with 'Error reading a FASTQ file; make sure the input files are valid and pa | Genomics service performs paired-end read alignment requiring exactly two matche | Verify locally that both FASTQ input files are valid and correctly paired using  | 🔵 7.5 | AW |
| 3 | Genomics workflow fails with 'Access denied to <blob>; the SAS token may have expired since submissi | Workflow stayed in the queue too long before processing started, or the -sas/--s | Resubmit the workflow; if recurring, increase the SAS token duration using -sas/ | 🔵 6.5 | AW |
| 4 | Genomics workflow fails with 'Error uploading <blob>: <storage status message> This most likely happ | Multiple concurrent Genomics workflows writing to the same output container usin | Resubmit the failed workflow with a unique output base name to avoid conflicts w | 🔵 6.5 | AW |
| 5 | Genomics workflow fails with 'Error uploading <blob>: <storage status message for BlockListTooLong o | Genomics workflow output file exceeds Azure Blob Storage's maximum block list or | Reduce the size of the output by splitting the sequencing workload into smaller  | 🔵 6.5 | AW |
| 6 | Genomics workflow fails with 'Blob <blob> already exists and the overwrite option was set to False' | Output blob with the same name already exists in the output container and the ov | Delete the existing output blob before resubmitting, or resubmit the workflow wi | 🔵 6.5 | AW |
| 7 | Genomics workflow fails with 'Read length is too long', 'Encountered an invalid CIGAR value', or 'CI | Input genomics file (FASTQ, BAM, or SAM) is corrupted | Verify local file integrity using fastaq (for FASTQ files) or samtools (for BAM/ | 🔵 6.5 | AW |

## 快速排查路径

1. **Genomics workflow fails with "Blob <blob> doesn't exist", "Source blob does not **
   - 根因: Input blob does not exist in the specified storage container; incorrect storage account key was used to generate the SAS
   - 方案: 1) Verify input blobs exist in the specified container with the correct case-sensitive name. 2) Ensure the correct storage account key (from Access ke
   - `[🔵 7.5 | AW]`

2. **Genomics workflow fails with 'Error reading a FASTQ file; make sure the input fi**
   - 根因: Genomics service performs paired-end read alignment requiring exactly two matched FASTQ files as inputs; the provided FA
   - 方案: Verify locally that both FASTQ input files are valid and correctly paired using fastaq on Linux or Bash on Windows. Ensure inputs are not mixed format
   - `[🔵 7.5 | AW]`

3. **Genomics workflow fails with 'Access denied to <blob>; the SAS token may have ex**
   - 根因: Workflow stayed in the queue too long before processing started, or the -sas/--sas-duration argument was set to a value 
   - 方案: Resubmit the workflow; if recurring, increase the SAS token duration using -sas/--sas-duration argument when running msgen. Run 'msgen list' to check 
   - `[🔵 6.5 | AW]`

4. **Genomics workflow fails with 'Error uploading <blob>: <storage status message> T**
   - 根因: Multiple concurrent Genomics workflows writing to the same output container using the same output base name, causing a w
   - 方案: Resubmit the failed workflow with a unique output base name to avoid conflicts with concurrent workflow outputs
   - `[🔵 6.5 | AW]`

5. **Genomics workflow fails with 'Error uploading <blob>: <storage status message fo**
   - 根因: Genomics workflow output file exceeds Azure Blob Storage's maximum block list or block count limits
   - 方案: Reduce the size of the output by splitting the sequencing workload into smaller jobs with less input data per submission
   - `[🔵 6.5 | AW]`

