#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const tmpPath = require('os').tmpdir()

async function ensureConfigReady(generateConfig, retries = 10, delay = 1000) {
  const tokenPath = path.resolve(tmpPath, 'anonymous_token')
  const keyPath = path.resolve(tmpPath, 'xeapi_public_key')

  for (let i = 0; i < retries; i++) {
    const tokenReady =
      fs.existsSync(tokenPath) && fs.readFileSync(tokenPath, 'utf-8').trim().length > 0
    const keyReady =
      fs.existsSync(keyPath) && fs.readFileSync(keyPath, 'utf-8').trim().length > 10

    if (tokenReady && keyReady) {
      console.log('[init] 配置初始化完成')
      return true
    }

    console.log(`[init] 初始化未完成，重试... (${i + 1}/${retries})`)
    await generateConfig()
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  throw new Error('初始化超时：anonymous_token 或 xeapi_public_key 未就绪')
}

async function start() {
  // 检测是否存在 anonymous_token 文件,没有则生成
  if (!fs.existsSync(path.resolve(tmpPath, 'anonymous_token'))) {
    fs.writeFileSync(path.resolve(tmpPath, 'anonymous_token'), '', 'utf-8')
  }

  // 启动时更新 anonymous_token 和 xeapi_public_key
  const generateConfig = require('./api-enhanced/generateConfig')
  await generateConfig()

  // 确保配置就绪后再对外提供服务
  await ensureConfigReady(generateConfig)

  require('./server').serveNcmApi({
    checkVersion: true,
  })
}

start().catch((err) => {
  console.error('[start error]', err)
  process.exit(1)
})
