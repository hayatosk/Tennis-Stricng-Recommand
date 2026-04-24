import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import recommendHandler from './api/recommend.js'

function localApiPlugin() {
  return {
    name: 'local-api-routes',
    configureServer(server) {
      server.middlewares.use('/api/recommend', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        try {
          let rawBody = ''
          for await (const chunk of req) {
            rawBody += chunk
          }

          req.body = rawBody ? JSON.parse(rawBody) : {}

          const response = {
            status(code) {
              res.statusCode = code
              return response
            },
            json(payload) {
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify(payload))
            },
          }

          await recommendHandler(req, response)
        } catch (error) {
          console.error('local recommend api error:', error)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ error: error.message || '추천 처리 중 오류가 발생했습니다.' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [localApiPlugin(), react(), tailwindcss()],
})
