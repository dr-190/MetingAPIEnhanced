#!/bin/bash

# MetingAPIEnhanced 启动脚本
# 基于 NeteaseCloudMusicAPI Enhanced 的 Meting 协议兼容层

PROJECT_DIR="/www/wwwroot/Metingapi/MetingAPIEnhanced"
PORT=${1:-3456}

cd "$PROJECT_DIR" || exit 1

echo "启动 MetingAPIEnhanced..."
echo "端口: $PORT"
echo "Meting 端点: http://localhost:$PORT/meting"

# 启动服务
PORT=$PORT node app.js
