import React from 'react'
import ReactDOMServer from 'react-dom/server'
import {StaticRouter} from 'react-router-dom'
import * as Broker from 'react-broker'
import {createStaticRenderer} from '@lunde/render-react-app'
import App from './index'

const render = clientStats => async locals => {
  // keeps track of lazy chunks used by the current page
  const chunkCache = Broker.createChunkCache()
  // provided to react-helmet-async
  const helmetContext = {}
  // creates the App in React
  const app = (
    <StaticRouter location={locals.url || locals.path} context={{}}>
      <App helmetContext={helmetContext} chunkCache={chunkCache} {...locals} />
    </StaticRouter>
  )
  // the string-rendered application
  const page = await Broker.loadAll(app, ReactDOMServer.renderToString)
  // renders the Helmet attributes
  const {helmet} = helmetContext
  const chunks = chunkCache.getChunkScripts(clientStats, {preload: true})
  // returns the document
  return `
    <!DOCTYPE html>
    <html ${helmet.htmlAttributes}>
      <head>
        <!-- Preloads bundle scripts -->
        ${chunks.preload}
        <!-- Page Title -->
        ${helmet.title}
        <!-- Helmet meta -->
        ${helmet.meta}
        <!-- Helmet links -->
        ${helmet.link}
        <!-- Helmet styles -->
        ${helmet.style}
        <!-- Helmet scripts -->
        ${helmet.script}
      </head>
      <body ${helmet.bodyAttributes}>
        <noscript>
          <div style="font-family: sans-serif; padding: 2rem; text-align: center;">
            Javascript must be enabled in order to view this website
          </div>
        </noscript>
        <div id="⚛️">${page}</div>
        <!-- Bundle scripts -->
        ${chunks.scripts}
      </body>
    </html>
  `.trim()
}

const staticRenderer = createStaticRenderer(render)
export default process.env.STAGE === 'development'
  ? ({clientStats}) => staticRenderer(clientStats)
  : locals =>
      staticRenderer(require(`../dist/${process.env.STAGE}/client/stats.json`))(
        locals
      )
