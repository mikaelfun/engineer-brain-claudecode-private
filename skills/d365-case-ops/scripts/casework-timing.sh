#!/usr/bin/env bash
# casework-timing.sh v2 — 里程碑相位计时（各阶段加起来 = 总耗时）
# 用法: bash casework-timing.sh "{caseDir}" "{skippedStepsJson}" "{errorsJson}" "{statsJson}"
# statsJson 示例: {"bash":3,"tools":12,"agents":0}
set -euo pipefail

CD="$1"
SKIPPED="${2:-}"
ERRORS="${3:-}"
STATS="${4:-}"

read_ts() { cat "$CD/logs/.t_$1" 2>/dev/null || echo "0"; }
safe_diff() { local a="$1" b="$2"; [ "$a" != "0" ] && [ "$b" != "0" ] && echo $(($b - $a)) || echo "0"; }

t_end=$(date +%s); echo "$t_end" > "$CD/logs/.t_inspection_end"

# --- 读取所有里程碑 ---
t_start=$(read_ts start)
t_cg_s=$(read_ts changegate_start)
t_cg_e=$(read_ts changegate_end)
t_fp_s=$(read_ts fastpath_start)
t_fp_e=$(read_ts fastpath_end)
t_dr_s=$(read_ts dataRefresh_start)
t_dr_e=$(read_ts dataRefresh_end)
t_ts_s=$(read_ts teamsSearch_start)
t_ts_e=$(read_ts teamsSearch_end)
t_comp_s=$(read_ts compliance_start)
t_comp_e=$(read_ts compliance_end)
t_aw_s=$(read_ts agentWait_start)
t_aw_e=$(read_ts agentWait_end)
t_sj_s=$(read_ts statusJudge_start)
t_sj_e=$(read_ts statusJudge_end)
t_rt_s=$(read_ts routing_start)
t_rt_e=$(read_ts routing_end)
t_ch_s=$(read_ts challenge_start)
t_ch_e=$(read_ts challenge_end)
t_tr_s=$(read_ts troubleshooterRetry_start)
t_tr_e=$(read_ts troubleshooterRetry_end)
t_in_s=$(read_ts inspection_start)

total=$((t_end - t_start))

# --- 格式化时间 ---
fmt_start=$(date -d @$t_start '+%Y-%m-%dT%H:%M:%S%z' 2>/dev/null || date -r $t_start '+%Y-%m-%dT%H:%M:%S%z')
fmt_end=$(date -d @$t_end '+%Y-%m-%dT%H:%M:%S%z' 2>/dev/null || date -r $t_end '+%Y-%m-%dT%H:%M:%S%z')

# --- 解析 stats ---
s_bash=$(echo "$STATS" | sed -n 's/.*"bash":\([0-9]*\).*/\1/p'); s_bash=${s_bash:-0}
s_tools=$(echo "$STATS" | sed -n 's/.*"tools":\([0-9]*\).*/\1/p'); s_tools=${s_tools:-0}
s_agents=$(echo "$STATS" | sed -n 's/.*"agents":\([0-9]*\).*/\1/p'); s_agents=${s_agents:-0}

# --- 计算相位（连续里程碑区间，加起来 = total）---
if [ "$t_fp_s" != "0" ]; then
  # ======== 快速路径 ========
  p_init=$(safe_diff "$t_start" "$t_cg_s")
  p_changegate=$(safe_diff "$t_cg_s" "$t_cg_e")
  p_decision=$(safe_diff "$t_cg_e" "$t_fp_s")
  p_fastpath=$(safe_diff "$t_fp_s" "$t_fp_e")
  p_datagather=$(safe_diff "$t_fp_e" "$t_in_s")
  p_inspection=$((t_end - t_in_s))
  p_sum=$((p_init + p_changegate + p_decision + p_fastpath + p_datagather + p_inspection))
  p_drift=$((total - p_sum))

  PHASES_JSON=$(cat <<PEOF
    "init":          { "seconds": $p_init,       "label": "mkdir logs + 写起始时间戳" },
    "changegate":    { "seconds": $p_changegate,  "label": "PowerShell 比对 emails/notes/ICM 数量变化" },
    "decision":      { "seconds": $p_decision,    "label": "LLM 判断 NO_CHANGE/CHANGED → 选择快速/正常路径" },
    "fastpath":      { "seconds": $p_fastpath,    "label": "验证 Teams/合规/Judge/路由缓存是否仍有效" },
    "dataGathering": { "seconds": $p_datagather,  "label": "读 case-info + emails + notes + teams + meta → 构思 inspection 内容" },
    "inspection":    { "seconds": $p_inspection,   "label": "写 inspection 报告 + todo 清单 + timing.json" }
PEOF
  )
  PHASE_LINE="init=${p_init}s cg=${p_changegate}s dec=${p_decision}s fp=${p_fastpath}s data=${p_datagather}s insp=${p_inspection}s"
else
  # ======== 正常流程 ========
  p_init=$(safe_diff "$t_start" "$t_cg_s")
  p_changegate=$(safe_diff "$t_cg_s" "$t_cg_e")

  # spawnAndPrep: changegate结束 → compliance开始（含 spawn agents + 预读 SKILLs）
  if [ "$t_comp_s" != "0" ]; then
    p_spawn=$(safe_diff "$t_cg_e" "$t_comp_s")
  else
    p_spawn=0
  fi

  p_compliance=$(safe_diff "$t_comp_s" "$t_comp_e")

  # waitAgents: compliance结束(或changegate结束) → agentWait结束（含 LLM 等待 + TaskOutput）
  if [ "$t_aw_e" != "0" ]; then
    wait_anchor="$t_comp_e"
    [ "$wait_anchor" = "0" ] && wait_anchor="$t_cg_e"
    if [ "$wait_anchor" != "0" ]; then
      p_wait=$((t_aw_e - wait_anchor)); [ $p_wait -lt 0 ] && p_wait=0
    else
      p_wait=0
    fi
  else
    p_wait=0
  fi

  # judge: agentWait结束 → statusJudge结束
  if [ "$t_sj_e" != "0" ] && [ "$t_aw_e" != "0" ]; then
    p_judge=$((t_sj_e - t_aw_e)); [ $p_judge -lt 0 ] && p_judge=0
  else
    p_judge=0
  fi

  # routing: statusJudge结束 → routing结束
  if [ "$t_rt_e" != "0" ] && [ "$t_sj_e" != "0" ]; then
    p_routing=$((t_rt_e - t_sj_e)); [ $p_routing -lt 0 ] && p_routing=0
  else
    p_routing=0
  fi

  # challenge: routing结束 → challenge结束（可选，0 = 未触发）
  p_challenge=$(safe_diff "$t_ch_s" "$t_ch_e")

  # troubleshooterRetry: challenge后重试（可选，0 = 未触发）
  p_retry=$(safe_diff "$t_tr_s" "$t_tr_e")

  # dataGathering: routing结束(或最后已知step结束) → inspection开始
  last_before_insp="$t_rt_e"
  [ "$last_before_insp" = "0" ] && last_before_insp="$t_sj_e"
  [ "$last_before_insp" = "0" ] && last_before_insp="$t_aw_e"
  [ "$last_before_insp" = "0" ] && last_before_insp="$t_comp_e"
  [ "$last_before_insp" = "0" ] && last_before_insp="$t_cg_e"
  p_datagather=$(safe_diff "$last_before_insp" "$t_in_s")

  p_inspection=$((t_end - t_in_s))

  p_sum=$((p_init + p_changegate + p_spawn + p_compliance + p_wait + p_judge + p_routing + p_challenge + p_retry + p_datagather + p_inspection))
  p_drift=$((total - p_sum))

  # 后台 agent 实际耗时（FYI，不计入相位和，因为与前台步骤并行）
  bg_dr=$(safe_diff "$t_dr_s" "$t_dr_e")
  bg_ts=$(safe_diff "$t_ts_s" "$t_ts_e")

  PHASES_JSON=$(cat <<PEOF
    "init":          { "seconds": $p_init,        "label": "读 config.json → 解析 casesRoot → mkdir logs" },
    "changegate":    { "seconds": $p_changegate,   "label": "PowerShell 比对 emails/notes/ICM 数量变化" },
    "spawnAndPrep":  { "seconds": $p_spawn,        "label": "Spawn data-refresh + teams-search → 预读 SKILL.md" },
    "compliance":    { "seconds": $p_compliance,    "label": "检查 Entitlement + 21v Convert → 更新 meta" },
    "waitAgents":    { "seconds": $p_wait,          "label": "TaskOutput 等待 data-refresh + teams-search 完成" },
    "statusJudge":   { "seconds": $p_judge,         "label": "分析 emails/notes/Teams → 判断 actualStatus + daysSinceLastContact" },
    "routing":       { "seconds": $p_routing,        "label": "按 actualStatus 路由 → spawn troubleshooter/email-drafter" },
    "challenge":     { "seconds": $p_challenge,  "label": "Challenger 审查 troubleshooter 分析的证据链" },
    "troubleshooterRetry": { "seconds": $p_retry, "label": "Troubleshooter 重新排查（Challenger 打回后）" },
    "dataGathering": { "seconds": $p_datagather,    "label": "读 case-info + emails + notes + teams + meta → 构思 inspection 内容" },
    "inspection":    { "seconds": $p_inspection,     "label": "写 inspection 报告 + todo 清单 + timing.json" }
PEOF
  )
  PHASE_LINE="init=${p_init}s cg=${p_changegate}s spawn=${p_spawn}s comp=${p_compliance}s wait=${p_wait}s judge=${p_judge}s route=${p_routing}s chal=${p_challenge}s retry=${p_retry}s data=${p_datagather}s insp=${p_inspection}s"

  # 追加后台 agent 信息
  PHASE_LINE="$PHASE_LINE | bg: dr=${bg_dr}s ts=${bg_ts}s"
fi

# --- 输出 timing.json ---
cat > "$CD/timing.json" << TJEOF
{
  "caseworkStartedAt": "$fmt_start",
  "caseworkCompletedAt": "$fmt_end",
  "totalSeconds": $total,
  "phases": {
$PHASES_JSON
  },
  "phaseSumSeconds": $p_sum,
  "driftSeconds": $p_drift,
  "stats": {
    "bashCalls": $s_bash,
    "toolCalls": $s_tools,
    "agentSpawns": $s_agents
  },
  "skippedSteps": [$SKIPPED],
  "errors": [$ERRORS]
}
TJEOF

# 清理里程碑文件
rm -f "$CD/logs/.t_"*

# 一行汇总
echo "timing: total=${total}s ${PHASE_LINE} drift=${p_drift}s | calls: bash=$s_bash tools=$s_tools agents=$s_agents"
