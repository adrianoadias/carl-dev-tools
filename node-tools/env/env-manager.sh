#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_TOOL_DIR="$SCRIPT_DIR"

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日誌函數
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# 檢查依賴
check_dependencies() {
    if ! command -v node &> /dev/null; then
        log_error "需要 Node.js 18+ 才能執行此工具"
        log_info "請安裝 Node.js: https://nodejs.org/"
        exit 1
    fi

    if ! command -v pnpm &> /dev/null; then
        log_error "需要 pnpm 才能執行此工具"
        log_info "安裝方法: npm install -g pnpm"
        exit 1
    fi

    # 檢查 Node.js 版本
    local node_version=$(node -v | sed 's/v//')
    local required_version="18.0.0"
    
    # 簡單的版本比較
    if [[ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" != "$required_version" ]]; then
        log_error "需要 Node.js $required_version 或更高版本，當前版本: $node_version"
        exit 1
    fi
}

# 初始化工具
init_tool() {
    cd "$ENV_TOOL_DIR"
    
    if [ ! -d "node_modules" ]; then
        log_info "首次使用，正在安裝依賴..."
        pnpm install --frozen-lockfile
        log_success "依賴安裝完成"
    fi
}

# 執行 Node.js 命令
run_command() {
    cd "$ENV_TOOL_DIR"
    node src/cli.js "$@"
}

# 主函數
main() {
    check_dependencies
    init_tool
    run_command "$@"
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
