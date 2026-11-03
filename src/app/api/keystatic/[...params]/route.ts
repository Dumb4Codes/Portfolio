import { makeRouteHandler } from '@keystatic/next/route-handler'
import config from '../../../../../keystatic.config'

// In github mode Keystatic needs three secrets. Until they are set in Vercel the production build must
// still pass, so there the handler is only created when they exist; otherwise /admin answers with a clear 503.
// In development the handler is always created: it is what runs the one-time "create the GitHub App" flow.
const needsSecrets = config.storage.kind === 'github' && process.env.NODE_ENV === 'production'
const ready =
  !needsSecrets ||
  Boolean(process.env.KEYSTATIC_GITHUB_CLIENT_ID && process.env.KEYSTATIC_GITHUB_CLIENT_SECRET && process.env.KEYSTATIC_SECRET)

const handler = ready ? makeRouteHandler({ config }) : null
const notReady = () =>
  new Response('The admin is not configured yet. Follow step 3 of docs/SETUP_GUIDE.md, then redeploy.', { status: 503 })

export const GET = (req: Request) => (handler ? handler.GET(req) : notReady())
export const POST = (req: Request) => (handler ? handler.POST(req) : notReady())
