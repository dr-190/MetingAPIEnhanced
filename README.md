# MetingAPIEnhanced

基于 [NeteaseCloudMusicAPI Enhanced](https://github.com/neteasecloudmusicapienhanced/api-enhanced) 的 Meting 协议兼容层，支持解灰、VIP Cookie 透传、APlayer/MetingJS 集成。

## 特性

- 完全兼容 [injahow/meting-api](https://github.com/injahow/meting-api) 协议
- Cookie 完全透传（VIP 即时生效）
- 灰色歌曲自动解灰
- 支持随机中国 IP、weapi/eapi/xeapi 多套加密
- 仅支持网易云（server=netease），其他静默忽略
- 支持 APlayer/MetingJS 集成

## 项目结构

```
MetingAPIEnhanced/
├── api-enhanced/          # api-enhanced 核心文件（可独立更新）
├── meting/                # meting 兼容层
│   ├── meting.js
│   └── meting.html
├── public/                # 静态文件
├── app.js                 # 入口文件
├── server.js              # 主服务器
├── .env.example           # 配置示例
├── .gitignore
└── README.md
```

## 快速开始

### 方式一：宝塔面板部署（推荐）

#### 1. 安装 Node.js

1. 打开宝塔面板 → **软件商店**
2. 搜索 **"Node.js 版本管理器"** → 安装
3. 打开 Node.js 版本管理器 → 安装 **Node.js 22+**
4. 设置为默认版本

#### 2. 添加 Node.js 项目

1. 宝塔面板 → **网站** → **Node项目**
2. 点击 **添加Node项目**
3. 填写配置：

| 配置项 | 值 |
|--------|-----|
| 项目目录 | `/www/wwwroot/Metingapi/MetingAPIEnhanced` |
| 启动选项 | `app.js` |
| 运行用户 | `www` |
| 包管理器 | `npm` |
| Node版本 | 22.x |
| 项目端口 | `3456` |
| 项目名称 | `MetingAPIEnhanced` |

4. 点击 **提交**

#### 3. 配置反向代理

1. 宝塔面板 → **网站** → 找到你的域名
2. 点击 **设置** → **反向代理**
3. 添加反向代理：

| 配置项 | 值 |
|--------|-----|
| 代理名称 | `meting-api` |
| 目标URL | `http://127.0.0.1:3456` |

4. 点击 **提交**

#### 4. 测试访问

- 首页：`https://你的域名/`
- Meting API：`https://你的域名/meting/`
- 测试页面：`https://你的域名/meting/meting.html`

---

### 方式二：命令行部署

```bash
# 克隆项目
git clone https://github.com/your-username/MetingAPIEnhanced.git
cd MetingAPIEnhanced

# 安装依赖
cd api-enhanced && npm install && cd ..
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 修改配置

# 启动服务
PORT=3456 node app.js
```

---

## API 接口

### Meting 协议接口

| 接口 | 说明 |
|------|------|
| `GET /meting/?type=search&id=关键词` | 搜索歌曲 |
| `GET /meting/?type=song&id=歌曲ID` | 歌曲详情 |
| `GET /meting/?type=playlist&id=歌单ID` | 歌单 |
| `GET /meting/?type=url&id=歌曲ID&br=320` | 播放链接 (302) |
| `GET /meting/?type=pic&id=歌曲ID&cover=300` | 封面图 (302) |
| `GET /meting/?type=lrc&id=歌曲ID` | 歌词 |
| `GET /meting/?type=name&id=歌曲ID` | 歌曲名 |
| `GET /meting/?type=artist&id=歌曲ID` | 歌手 |

### 参数说明

| 参数 | 说明 |
|------|------|
| `type` | 请求类型：name/artist/url/pic/lrc/song/playlist/search |
| `id` | 歌曲/歌单 ID；search 时为搜索关键词 |
| `server` | 数据源：netease（默认），其他值静默忽略 |
| `br` | 音质：128/192/320/2000(FLAC)，默认 320 |
| `cover` | 封面分辨率，默认 300 |
| `limit` | 搜索条数，默认 30 |
| `page` | 搜索页码，默认 1 |
| `search_type` | 搜索类型：1 单曲/10 专辑/100 歌手/1000 歌单 |

---

## APlayer 集成

```html
<!-- APlayer -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.css">
<div id="aplayer"></div>
<script src="https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/meting/dist/Meting.min.js"></script>

<script>
  window.meting_api = 'https://your-domain.com/meting/?server=:server&type=:type&id=:id&auth=:auth&r=:r'
</script>
<meting-js server="netease" type="playlist" id="19723756"></meting-js>
```

---

## VIP 支持

在请求头中传递 Cookie：

```bash
curl -H "Cookie: MUSIC_U=你的token" https://your-domain.com/meting/?type=url&id=歌曲ID
```

无需 Cookie 时，灰色歌曲会自动尝试解灰。

---

## 更新 api-enhanced

当 api-enhanced 有更新时，只需更新 `api-enhanced/` 子目录：

```bash
cd /www/wwwroot/Metingapi/MetingAPIEnhanced
rm -rf api-enhanced
git clone --depth 1 https://github.com/neteasecloudmusicapienhanced/api-enhanced.git api-enhanced
cd api-enhanced && npm install && cd ..
```

我们的文件（meting/、server.js、app.js、.env）不会被覆盖。

---

## 环境变量

参考 `.env.example` 文件：

```bash
# 服务端口
PORT=3456

# CORS 配置
CORS_ALLOW_ORIGIN=*

# 启用随机中国 IP
ENABLE_RANDOM_CN_IP=true

# 启用全局解灰
ENABLE_GENERAL_UNBLOCK=true

# 启用无损音质
ENABLE_FLAC=true
```

---

## 依赖项目

- [NeteaseCloudMusicAPI Enhanced](https://github.com/neteasecloudmusicapienhanced/api-enhanced) - 网易云音乐 API
- [Meting](https://github.com/metowolf/Meting) - 音乐 API 框架
- [meting-api](https://github.com/injahow/meting-api) - Meting API 参考实现

---

## License

MIT
