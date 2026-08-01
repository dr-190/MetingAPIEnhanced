# MetingAPIEnhanced

基于 [NeteaseCloudMusicAPI Enhanced](https://github.com/neteasecloudmusicapienhanced/api-enhanced) 的 Meting 协议兼容层。

## 特性

- 完全兼容 [injahow/meting-api](https://github.com/injahow/meting-api) 协议
- Cookie 完全透传（VIP 即时生效）
- 灰色歌曲自动解灰
- 支持随机中国 IP、weapi/eapi/xeapi 多套加密
- 仅支持网易云（server=netease），其他静默忽略

## 项目结构

```
MetingAPIEnhanced/
├── api-enhanced/          # 原始 api-enhanced（可独立更新）
├── meting/                # meting 兼容层
│   ├── meting.js
│   └── meting.html
├── app.js                 # 入口文件
├── server.js              # 主服务器
├── .env                   # 配置文件
└── start.sh               # 启动脚本
```

## 更新 api-enhanced

```bash
cd /www/wwwroot/Metingapi/MetingAPIEnhanced
rm -rf api-enhanced
git clone --depth 1 https://github.com/neteasecloudmusicapienhanced/api-enhanced.git api-enhanced
cd api-enhanced && npm install && cd ..
```

## API 使用

### 搜索
```
GET /meting/?type=search&id=周杰伦&limit=10
GET /meting/?type=search&keyword=周杰伦&limit=10
```

### 歌曲详情
```
GET /meting/?type=song&id=33894312
```

### 歌单
```
GET /meting/?type=playlist&id=19723756
```

### 播放链接（302 重定向）
```
GET /meting/?type=url&id=33894312&br=320
```

### 封面图（302 重定向）
```
GET /meting/?type=pic&id=33894312&cover=300
```

### 歌词
```
GET /meting/?type=lrc&id=33894312
```

### 歌曲名/歌手
```
GET /meting/?type=name&id=33894312
GET /meting/?type=artist&id=33894312
```

## 参数说明

| 参数 | 说明 |
|------|------|
| `type` | name/artist/url/pic/lrc/song/playlist/search |
| `id` | 歌曲/歌单 ID；search 时为搜索关键词 |
| `keyword` | 搜索关键词（search 类型） |
| `server` | 静默忽略，仅 netease |
| `br` | 音质：128/192/320/2000(FLAC) |
| `cover` | 封面分辨率（默认 300） |
| `limit` | 搜索条数（默认 30） |
| `page` | 搜索页码（默认 1） |
| `search_type` | 搜索类型：1 单曲/10 专辑/100 歌手/1000 歌单 |

## APlayer 集成

```html
<script>
  window.meting_api = 'https://your-domain.com/meting/?server=:server&type=:type&id=:id&auth=:auth&r=:r'
</script>
<meting-js server="netease" type="playlist" id="19723756"></meting-js>
```

## VIP 支持

在请求头中传递 Cookie：
```
Cookie: MUSIC_U=你的token
```

## License

MIT
