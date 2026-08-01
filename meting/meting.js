/**
 * meting 兼容层 - 完全兼容 injahow/meting-api 协议
 *
 * 优化：song/playlist/search 只返回元数据链接，不预取 url/lyric
 * url/lrc 类型才实际请求，大幅减少请求时间
 */

const logger = require('../api-enhanced/util/logger.js')

// 默认参数
const DEFAULT_BR = 320
const DEFAULT_COVER = 300
const DEFAULT_LIMIT = 30
const DEFAULT_PAGE = 1
const DEFAULT_SEARCH_TYPE = 1

/**
 * 格式化艺术家数组为 'A/B/C' 字符串
 */
function formatArtist(artists) {
  if (!Array.isArray(artists)) return ''
  return artists
    .map(a => (typeof a === 'string' ? a : a && a.name))
    .filter(Boolean)
    .join('/')
}

/**
 * 合并歌词（中文翻译追加到原歌词行）
 */
function mergeLyric(lyric, tlyric) {
  if (!lyric) return '[00:00.00]这似乎是一首纯音乐呢，请尽情欣赏它吧！'
  if (!tlyric) return lyric

  const tlyricMap = {}
  const tlyricLines = tlyric.split('\n')
  for (const v of tlyricLines) {
    if (!v) continue
    const idx = v.indexOf(']')
    if (idx < 0) continue
    const time = v.substring(0, idx + 1)
    const text = v.substring(idx + 1).trim().replace(/\s\s+/g, ' ')
    tlyricMap[time] = text
  }

  const lyricLines = lyric.split('\n')
  const out = new Array(lyricLines.length)
  for (let i = 0; i < lyricLines.length; i++) {
    const v = lyricLines[i]
    if (!v) { out[i] = v; continue }
    const idx = v.indexOf(']')
    if (idx < 0) { out[i] = v; continue }
    const time = v.substring(0, idx + 1)
    const cn = tlyricMap[time]
    if (cn && cn !== '//') {
      out[i] = v + ' (' + cn + ')'
    } else {
      out[i] = v
    }
  }
  return out.join('\n')
}

/**
 * 构建 meting URL
 */
function buildMetingUrl(type, songId, server, opts) {
  opts = opts || {}
  const params = ['type=' + encodeURIComponent(type)]
  if (server) params.push('server=' + encodeURIComponent(server))
  params.push('id=' + encodeURIComponent(String(songId)))
  if (opts.br != null && opts.br !== '' && type === 'url') {
    params.push('br=' + encodeURIComponent(String(opts.br)))
  }
  if (opts.cover != null && opts.cover !== '' && type === 'pic') {
    params.push('cover=' + encodeURIComponent(String(opts.cover)))
  }
  const queryString = params.join('&')

  let baseUrl = ''
  if (process.env.BASE_URL) {
    baseUrl = process.env.BASE_URL.replace(/\/+$/, '')
  } else if (opts.req) {
    const req = opts.req
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http'
    const host = req.headers['x-forwarded-host'] || req.headers.host || ''
    if (host) {
      baseUrl = `${protocol}://${host}`
    }
  }

  return baseUrl ? `${baseUrl}/meting/?${queryString}` : `/meting/?${queryString}`
}

/**
 * 判断是否需要解灰
 */
function needsUnblock(songItem) {
  if (!songItem) return true
  if (!songItem.url) return true
  if (songItem.freeTrialInfo) return true
  return false
}

/**
 * 创建 Meting 路由
 */
function createMetingRoute(requestFunc, moduleDefinitions) {
  const express = require('express')
  const router = express.Router()
  const { cookieToJson } = require('../api-enhanced/util/index')

  // 查找模块
  const findModule = (name) => moduleDefinitions.find(m => m.identifier === name)

  // 调用模块
  const callModule = async (moduleName, query) => {
    const mod = findModule(moduleName)
    if (!mod) throw new Error(`模块 ${moduleName} 不存在`)

    return mod.module(query, (...params) => {
      const obj = [...params]
      const options = obj[2] || {}
      if (options.randomCNIP !== false) options.randomCNIP = true
      obj[2] = options
      return requestFunc(...obj)
    })
  }

  // 自动解灰
  const unblockUrl = async (songId) => {
    try {
      const songUrlMatchModule = findModule('song_url_match')
      if (!songUrlMatchModule) return ''
      const res = await songUrlMatchModule.module({ id: songId })
      const url = res && res.body && res.body.data
      return typeof url === 'string' ? url : ''
    } catch (e) {
      logger.warn('meting unblock failed for', songId, e && e.message)
      return ''
    }
  }

  // 构建歌曲项（轻量版，不预取 url/lyric）
  const buildSongItem = (song, opts) => {
    return {
      name: song.name || '',
      artist: formatArtist(song.ar),
      url: buildMetingUrl('url', song.id, opts.server, { br: opts.br, req: opts.req }),
      pic: buildMetingUrl('pic', song.id, opts.server, { cover: opts.cover, req: opts.req }),
      lrc: buildMetingUrl('lrc', song.id, opts.server, { req: opts.req })
    }
  }

  // 处理歌曲详情
  const handleSong = async (query, opts) => {
    const res = await callModule('song_detail', { ids: String(query.id), cookie: query.cookie })
    const song = res && res.body && res.body.songs && res.body.songs[0]
    if (!song) return '[]'
    const item = buildSongItem(song, opts)
    return JSON.stringify([item])
  }

  // 处理歌单
  const handlePlaylist = async (query, opts) => {
    const res = await callModule('playlist_detail', { id: query.id, cookie: query.cookie })
    const tracks = (res && res.body && res.body.playlist && res.body.playlist.tracks) || []
    if (tracks.length === 0) return '[]'
    const items = tracks.map(t => buildSongItem(t, opts))
    return JSON.stringify(items)
  }

  // 处理搜索
  const handleSearch = async (query, opts) => {
    const limit = parseInt(query.limit, 10) || DEFAULT_LIMIT
    const page = parseInt(query.page, 10) || DEFAULT_PAGE
    const searchType = parseInt(query.search_type, 10) || DEFAULT_SEARCH_TYPE
    const offset = (page - 1) * limit

    const keyword = String(query.id || query.keyword || query.keywords || '')
    if (!keyword) return '[]'

    const res = await callModule('cloudsearch', {
      s: keyword,
      keywords: keyword,
      type: searchType,
      limit: limit,
      offset: offset,
      cookie: query.cookie
    })

    const songs = (res && res.body && res.body.result && res.body.result.songs) || []
    if (songs.length === 0) return '[]'
    const items = songs.map(s => buildSongItem(s, opts))
    return JSON.stringify(items)
  }

  // 主路由
  router.all('/', async (req, res) => {
    try {
      const params = Object.assign({}, req.query, req.body)
      const type = params.type
      const id = params.id || params.keyword || params.keywords || ''

      // 没有 type 时重定向到文档页
      if (!type) {
        return res.redirect('/meting/meting.html')
      }

      // search 类型可以没有 id（使用 keyword）
      if (!id && type !== 'search') {
        return res.redirect('/meting/meting.html')
      }

      // 解析参数
      const br = params.br != null && params.br !== '' ? parseInt(params.br, 10) : DEFAULT_BR
      const cover = params.cover != null && params.cover !== ''
        ? parseInt(params.cover, 10)
        : parseInt(params.size, 10) || DEFAULT_COVER

      const opts = {
        br: Math.max(1, br),
        cover: Math.max(1, cover),
        server: 'netease',
        req: req
      }

      // 获取 Cookie
      const cookie = req.headers.cookie || ''
      let cookieObj = {}
      if (cookie) cookieObj = cookieToJson(cookie)

      const query = {
        type,
        id: String(id),
        cookie: cookieObj,
        limit: params.limit,
        page: params.page,
        search_type: params.search_type,
        keyword: params.keyword,
        keywords: params.keywords,
        _req: req
      }

      let result

      switch (type) {
        case 'name': {
          const modRes = await callModule('song_detail', { ids: String(id), cookie: cookieObj })
          const name = (modRes.body && modRes.body.songs && modRes.body.songs[0] && modRes.body.songs[0].name) || ''
          res.set('Content-Type', 'text/plain; charset=utf-8')
          return res.send(name)
        }

        case 'artist': {
          const modRes = await callModule('song_detail', { ids: String(id), cookie: cookieObj })
          const song = modRes.body && modRes.body.songs && modRes.body.songs[0]
          const artist = formatArtist(song && song.ar)
          res.set('Content-Type', 'text/plain; charset=utf-8')
          return res.send(artist)
        }

        case 'url': {
          const urlRes = await callModule('song_url', {
            id: String(id),
            br: metingBrToNcmBr(opts.br),
            cookie: cookieObj
          })
          const dataItem = (urlRes.body && urlRes.body.data && urlRes.body.data[0]) || null
          let finalUrl = dataItem && dataItem.url

          if (!finalUrl || needsUnblock(dataItem)) {
            finalUrl = await unblockUrl(id)
          }

          if (!finalUrl) {
            return res.status(404).json({ code: 404, msg: 'No playable URL found' })
          }
          return res.redirect(302, finalUrl)
        }

        case 'pic': {
          const modRes = await callModule('song_detail', { ids: String(id), cookie: cookieObj })
          let picUrl = (modRes.body && modRes.body.songs && modRes.body.songs[0] && modRes.body.songs[0].al && modRes.body.songs[0].al.picUrl) || ''
          if (picUrl && opts.cover !== 300) {
            picUrl = picUrl.replace(/\?param=\d+y\d+$/, '') + `?param=${opts.cover}y${opts.cover}`
          }
          if (!picUrl) {
            return res.status(404).json({ code: 404, msg: 'No cover found' })
          }
          return res.redirect(302, picUrl)
        }

        case 'lrc': {
          const modRes = await callModule('lyric', { id: id, cookie: cookieObj })
          const lrcData = modRes.body && modRes.body.lrc
          const tlyricData = modRes.body && modRes.body.tlyric
          const merged = mergeLyric(lrcData && lrcData.lyric, tlyricData && tlyricData.lyric)
          res.set('Content-Type', 'text/plain; charset=utf-8')
          return res.send(merged)
        }

        case 'song':
          result = await handleSong(query, opts)
          res.set('Content-Type', 'application/json; charset=utf-8')
          return res.send(result)

        case 'playlist':
          result = await handlePlaylist(query, opts)
          res.set('Content-Type', 'application/json; charset=utf-8')
          return res.send(result)

        case 'search':
          result = await handleSearch(query, opts)
          res.set('Content-Type', 'application/json; charset=utf-8')
          return res.send(result)

        default:
          return res.status(400).json({ code: 400, msg: 'unknown type', type })
      }
    } catch (err) {
      logger.error('meting error', req.query.type, req.query.id, err && err.message)
      return res.status(500).json({
        code: 500,
        msg: (err && err.message) || 'internal error'
      })
    }
  })

  return router
}

/**
 * meting 协议 br (kbps) → NCM br (bps)
 */
function metingBrToNcmBr(br) {
  const n = parseInt(br, 10)
  switch (n) {
    case 2000: return 999000
    case 320: return 320000
    case 192: return 192000
    case 128: return 128000
    default: return 320000
  }
}

module.exports = { createMetingRoute }
