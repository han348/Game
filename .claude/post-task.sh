#!/bin/bash
# .claude/post-task.sh

echo "🔄 任務完成，準備更新 CLAUDE.md..."

# 檢查任務是否成功
if [ "$CLAUDE_TASK_STATUS" = "success" ]; then
    echo "✅ 任務成功，開始更新文檔"
    
    # 使用 Claude Code 更新 CLAUDE.md
    claude-code "請分析最近的程式碼變更，更新 CLAUDE.md 文件，包括：
    1. 新增的功能說明
    2. 更新的架構圖（如有需要）
    3. 相關的技術棧變更
    4. API 或接口的變化
    
    保持文檔簡潔且易讀。"
    
    echo "📝 CLAUDE.md 已更新"
    
    # 可選：自動提交文檔更新
    if git diff --quiet CLAUDE.md; then
        echo "ℹ️  CLAUDE.md 無變更"
    else
        git add CLAUDE.md
        git commit -m "docs: 自動更新 CLAUDE.md - $CLAUDE_TASK_DESCRIPTION"
        echo "✅ 文檔變更已提交"
    fi
else
    echo "❌ 任務失敗，跳過文檔更新"
fi