/* global process */

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      if (!body.trim()) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function createVercelResponseAdapter(res) {
  return {
    status(code) {
      res.statusCode = code
      return this
    },
    json(payload) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify(payload))
    },
  }
}

function localApiPlugin() {
  const routes = {
    '/api/recommend': './api/recommend.js',
    '/api/analyze-swing': './api/analyze-swing.js',
  }

  return {
    name: 'local-api-routes',
    configResolved(config) {
      const env = loadEnv(config.mode, config.root, '')
      Object.entries(env).forEach(([key, value]) => {
        if (process.env[key] === undefined) {
          process.env[key] = value
        }
      })
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split('?')[0]
        const route = routes[path]

        if (!route) {
          next()
          return
        }

        try {
          req.body = await readJsonBody(req)
          const routeUrl = pathToFileURL(resolve(server.config.root, route)).href
          const mod = await import(`${routeUrl}?t=${Date.now()}`)
          await mod.default(req, createVercelResponseAdapter(res))
        } catch (error) {
          console.error('local api route error:', error)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ error: error.message || 'Local API route error' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [localApiPlugin(), react(), tailwindcss()],
})
