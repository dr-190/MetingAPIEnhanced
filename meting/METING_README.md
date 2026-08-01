# Meting API Enhanced

基于 [api-enhanced](https://github.com/neteasecloudmusicapienhanced/api-enhanced) 的 Meting 协议兼容端点，完全兼容 [injahow/meting-api](https://github.com/injahow/meting-api) 协议。

## 特性

- **完全兼容 Meting 协议** - 兼容 injahow/meting-api 接口格式
- **Cookie 完全透传** - 每次请求的 Cookie 头都会传给网易云（VIP 即时生效）
- **灰色歌曲自动解灰** - 底层走 `@neteasecloudmusicapienhanced/unblockmusic-utils`
- **支持随机中国 IP** - weapi/eapi/xeapi 多套加密
- **仅支持网易云** - `server=netease`，其他 server 值静默忽略

## 快速开始

```bash
# 安装依赖
npm install

# 启动服务（默认端口 3456）
./start.sh

# 或指定端口
./start.sh 3000
```

## API 参数说明

| 参数 | 说明 |
|------|------|
| `server` | 数据源：netease（默认）｜tencent｜xiami｜kugou｜baidu｜kuwo（当前仅 netease，其他静默忽略） |
| `type` | 请求类型：name｜artist｜url｜pic｜lrc｜song｜playlist｜search |
| `id` | 歌曲/歌单 ID；type=search 时为搜索关键词 |
| `br` | 音质（仅 type=url，默认 320，可选 2000/flac/192/128） |
| `cover` | 封面分辨率（仅 type=pic，默认 300；兼容旧参数 size） |
| `limit` | 搜索条数（type=search，默认 30） |
| `page` | 搜索页码（type=search，默认 1） |
| `search_type` | 平台搜索类型（默认 1：单曲） |

## 在线测试

### 播放链接（302 重定向）
```
GET /meting/?type=url&id=33894312
```

### FLAC 无损音质
```
GET /meting/?type=url&id=416892104&br=2000
```

### VIP 歌曲测试（无 cookie 应走解灰）
```
GET /meting/?type=url&id=1385117201
```

### 封面图（302 重定向）
```
GET /meting/?type=pic&id=33894312
GET /meting/?type=pic&id=416892104&cover=500
```

### 歌词（含中文翻译合并）
```
GET /meting/?type=lrc&id=33894312
```

### 歌曲名
```
GET /meting/?type=name&id=33894312
```

### 歌手
```
GET /meting/?type=artist&id=33894312
```

### 单曲 JSON
```
GET /meting/?type=song&id=33894312
```

### 歌单 JSON
```
GET /meting/?type=playlist&id=2619366284
```

### 搜索
```
GET /meting/?type=search&id=周杰伦&limit=5
GET /meting/?type=search&keyword=周杰伦&limit=5
```

### server 参数静默忽略
```
GET /meting/?type=song&id=33894312&server=tencent
```

## APlayer 集成

```html
<script>
  window.meting_api = 'https://你的域名/meting/?server=:server&type=:type&id=:id&auth=:auth&r=:r'
</script>
<meting-js server="netease" type="playlist" id="2619366284"></meting-js>
```

## Cookie 透传（VIP 支持）

在请求头中传递 Cookie：

```bash
curl -H "Cookie: MUSIC_U=你的token" \
  "https://你的域名/meting/?type=url&id=33894312"
```

或在 nginx 等反代层为 `/meting/` 注入 Cookie: MUSIC_U=你的token

## 与原版 Meting 的差异

| 特性 | 原版 Meting | Meting API Enhanced |
|------|------------|---------------------|
| Cookie 处理 | 写死固定 cookie | 完全透传请求 Cookie |
| 灰色歌曲 | 不支持 | 自动解灰 |
| IP 随机化 | 不支持 | 支持随机中国 IP |
| 加密方式 | 单一 | weapi/eapi/xeapi 多套 |
| 平台支持 | 多平台 | 仅网易云（其他静默忽略） |

## 环境变量

```bash
# 服务端口
PORT=3456

# 启用随机中国 IP
ENABLE_RANDOM_CN_IP=true

# 启用全局解灰
ENABLE_GENERAL_UNBLOCK=true

# 启用无损音质
ENABLE_FLAC=true
```

## 项目结构

```
meting-api-enhanced2/
├── meting.js          # Meting 协议路由实现
├── server.js          # 主服务器（已集成 Meting 路由）
├── app.js             # 入口文件
├── start.sh           # 启动脚本
├── .env               # 环境配置
├── module/            # api-enhanced 模块
└── util/              # 工具函数
```

## 依赖项目

- [api-enhanced](https://github.com/neteasecloudmusicapienhanced/api-enhanced) - 网易云音乐 API
- [Meting](https://github.com/metowolf/Meting) - 音乐 API 框架
- [meting-api](https://github.com/injahow/meting-api) - Meting API 参考实现

## License

MIT
