# MetingAPIEnhanced

基于 [NeteaseCloudMusicAPI Enhanced](https://github.com/neteasecloudmusicapienhanced/api-enhanced) 的 Meting 协议兼容层，支持解灰、VIP Cookie 透传、APlayer/MetingJS 集成。

> 当前版本：`v1.1.0`（基于 api-enhanced `v4.41.0`）

## 特性

- 完全兼容 [injahow/meting-api](https://github.com/injahow/meting-api) 协议
- Cookie 完全透传（VIP 即时生效）
- 灰色歌曲自动解灰
- 支持随机中国 IP、weapi/eapi/xeapi/neapi 多套加密
- 支持无损 / Hi-Res / 超清母带 / 臻音全景声(`vivid`) / 沉浸环绕声(`sky`) 音质
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
| `level` | 直接指定 api-enhanced 音质等级，见下方「音质等级」 |
| `immerseType` | `level=sky` 时的沉浸声类型：`c51`/`ste`/`aac`/`c512`/`ste2`/`aac2`，默认 `c51` |
| `cover` | 封面分辨率，默认 300 |
| `limit` | 搜索条数，默认 30 |
| `page` | 搜索页码，默认 1 |
| `search_type` | 搜索类型：1 单曲/10 专辑/100 歌手/1000 歌单 |

### 音质等级（v4.41.0）

除 meting 协议的 `br` 参数外，还可通过 `level` 直接使用 api-enhanced v4.41.0 的音质等级：

| level | 说明 |
|-------|------|
| `standard` | 标准音质（128kbps） |
| `higher` | 较高音质（192kbps） |
| `exhigh` | 极高音质（320kbps） |
| `lossless` | 无损音质（FLAC） |
| `hires` | Hi-Res 音质 |
| `jyeffect` | 高清臻音 |
| `vivid` | **臻音全景声**（v4.41.0 新增，返回 `av3a` 格式） |
| `jymaster` | 超清母带 |
| `sky` | 沉浸环绕声，可配合 `immerseType` 使用 |

> 说明：`v4.41.0` 起，`jyeffect` 由「高清环绕声」更名为「高清臻音」，并新增
> `vivid`（臻音全景声）与 `c512`/`ste2`/`aac2` 三种沉浸声类型。
> 兼容层会自动为 `vivid` 补齐 android 端 Cookie（`os`/`appver`）。
> 实际可用音质取决于账号权限：VIP 账号方可返回无损及以上音质，
> 匿名/免费账号会被服务端降级为 `standard`，此时兼容层会自动降级重试。

```bash
# 使用 br 参数（meting 协议，推荐用于 MetingJS）
GET /meting/?type=url&id=347230&br=320

# 使用 level 参数（api-enhanced 音质等级）
GET /meting/?type=url&id=347230&level=lossless

# 臻音全景声
GET /meting/?type=url&id=347230&level=vivid

# 沉浸环绕声 + 指定沉浸声类型
GET /meting/?type=url&id=347230&level=sky&immerseType=c512
```

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

## 环境变量

参考 `.env.example` 文件：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `3456` | 服务端口 |
| `CORS_ALLOW_ORIGIN` | `*` | 允许跨域请求的域名，多个用逗号分隔 |
| `ENABLE_PROXY` | `false` | 启用反向代理 |
| `PROXY_URL` | （空） | 代理地址，启用代理时必填 |
| `ENABLE_RANDOM_CN_IP` | `false` | 启用随机中国 IP |
| `ENABLE_GENERAL_UNBLOCK` | `false` | 启用全局解灰（不推荐开启） |
| `ENABLE_FLAC` | `true` | 启用无损音质 |
| `SELECT_MAX_BR` | `false` | 启用无损音质时选择最高码率 |
| `FOLLOW_SOURCE_ORDER` | `true` | 严格按照音源顺序匹配 |
| `NETEASE_COOKIE` | （空） | 默认网易云 Cookie，格式：`MUSIC_U=xxx` |
| `BASE_URL` | （空） | 基础 URL，留空自动推断 |

---

## 更新 api-enhanced

当 api-enhanced 有更新时，只需更新 `api-enhanced/` 子目录：

```bash
cd /www/wwwroot/Metingapi/MetingAPIEnhanced

# 备份本地配置
cp .env /tmp/meting-env.bak

# 拉取指定版本（示例：v4.41.0）
rm -rf api-enhanced
git clone --depth 1 --branch v4.41.0 \
  https://github.com/neteasecloudmusicapienhanced/api-enhanced.git api-enhanced
rm -rf api-enhanced/.git

# 重新安装依赖（新增依赖会同步到根 node_modules）
npm install
```

我们的文件（`meting/`、`server.js`、`app.js`、`.env`）不会被覆盖。

> **注意**：`api-enhanced/data/china_ip_ranges.txt` 是上游仓库跟踪的运行时数据，
> 用于随机中国 IP 功能，需随仓库一起提交（`deviceid.txt` 未被代码引用，已忽略）。
> 若克隆后缺失该文件，随机中国 IP 会退化为内置兜底 IP。

> **关于本地补丁**：`v4.41.0` 起，原先 `patches/` 中针对
> `@neteasecloudmusicapienhanced/unblockmusic-utils@0.4.0` 的补丁已不再需要：
> `qijieya` 音源地址修正已合并进上游 `0.4.5`，`qijieyaPlus` 已被上游归档。
> 因此 `patches/` 目录已清空，`patch-package` 仍保留用于将来添加补丁。

---

## 更新日志

### v1.1.0

- **升级 `api-enhanced` 至 v4.41.0**
- 新增 `vivid`（臻音全景声）音质支持，`level` 参数可直接透传 api-enhanced 音质等级
- 新增 `immerseType` 参数，`level=sky` 时可选 `c51`/`ste`/`aac`/`c512`/`ste2`/`aac2`
- 适配 v4.41.0 音质等级变更：`jyeffect` 由「高清环绕声」更名为「高清臻音」
- 适配 `song_url_v1_302` 返回值结构变更（`data.url` 与 `data[0].url` 双兼容）
- 新增音质降级重试：请求的高音质不可用时自动回退到 `exhigh`
- 同步 v4.41.0 依赖：新增 `fzstd`（neapi 解压），升级 `unblockmusic-utils@0.4.5`、`axios@1.20.0`、`music-metadata@11.16.1`、`yargs@18.2.0`
- 移除已无必要的 `unblockmusic-utils` 补丁（`qijieya` 修正已合并上游）
- 补充 `api-enhanced/data/china_ip_ranges.txt`，修复随机中国 IP 退化为兜底逻辑的问题
- 兼容 v4.41.0 新增的 `neapi` 加密方式与 NMTID 下发逻辑
- 测试页 (`meting/meting.html`) 音质选择器支持全部 v4.41.0 音质等级
  （`standard`/`higher`/`exhigh`/`lossless`/`hires`/`jyeffect`/`vivid`/`jymaster`/`sky`），
  并保留原有 `br` 协议选项
- 测试页选择 `level=sky` 时显示沉浸声类型 (`immerseType`) 选择器
- 测试页新增「无损音质」「臻音全景声」「沉浸环绕声」快速测试按钮
- 测试页参数文档与接口示例补充 `level`/`immerseType` 说明
- 在线播放器 (`public/player.html`) 新增音质切换下拉框，
  切换时保持播放进度，切歌时沿用所选音质
- 播放器音质状态以 DOM 选择器为唯一数据源，并做防御性处理，
  避免脚本初始化异常时的引用错误

### v1.0.0

- 仓库迁移至 `https://github.com/dr-190/MetingAPIEnhanced`
- 集成在线播放器页面 (`public/player.html`)
- 使用 `patch-package` 管理本地补丁
- 修复 `qijieya` 音源匹配问题
- 升级 `api-enhanced` 至 v4.40.0
- 重构 `meting` URL 接口，支持自动跟随域名
- 支持 VIP Cookie 透传与灰色歌曲自动解灰
- 支持随机中国 IP 与多种加密方式（weapi/eapi/xeapi）

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
