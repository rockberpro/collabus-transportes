import { promises as fs } from 'fs'
import path from 'path'

// Scans server/api folder for files named like `route.segment.get.ts` and generates a minimal OpenAPI JSON.
// It maps filenames to paths and HTTP methods. Files with bracketed segments like [id].get.ts are converted to path params.

export default defineEventHandler(async (_event) => {
  const apiDir = path.join(process.cwd(), 'server', 'api')
  const openapi: Record<string, unknown> = {
    openapi: '3.0.0',
    info: {
      title: process.env.npm_package_name || 'Nitro API',
      version: process.env.npm_package_version || '1.0.0',
      description: 'Auto-generated OpenAPI spec (basic). Edit / extend it as needed.'
    },
    paths: {}
  }

  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    const results: string[] = []
    for (const e of entries) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) {
        const child = await walk(full)
        results.push(...child)
      } else {
        results.push(full)
      }
    }
    return results
  }

  let files: string[] = []
  try {
    files = await walk(apiDir)
  } catch {
    // no server/api folder
    return openapi
  }

  const methodRegex = /\.(get|post|put|delete|patch|options|head)\.ts$/i

  for (const file of files) {
    const rel = path.relative(apiDir, file).replace(/\\/g, '/')
    const match = rel.match(methodRegex)
    if (!match) continue
    const method = match[1].toLowerCase()
    const withoutMethod = rel.replace(methodRegex, '') // e.g. auth/sign-in
    // build route path from segments
    const segments = withoutMethod.split('/').filter(Boolean)
    const pathSegments = segments.map((seg) => {
      // convert [param] to {param}
      const bracket = seg.match(/^\[(.+)\]$/)
      if (bracket) return `{${bracket[1]}}`
      return seg
    })
    let routePath = '/' + pathSegments.join('/')
    // If routePath ends with /index, remove it
    routePath = routePath.replace(/\/index$/i, '')

    if (!((openapi.paths as Record<string, unknown>)[routePath])) (openapi.paths as Record<string, unknown>)[routePath] = {}

    // Collect path params from {param} occurrences
    const pathParams: Array<Record<string, unknown>> = []
    const paramMatches = [...routePath.matchAll(/\{([^}]+)\}/g)]
    for (const m of paramMatches) {
      pathParams.push({ name: m[1], in: 'path', required: true, schema: { type: 'string' } })
    }

    ;(openapi.paths as Record<string, any>)[routePath][method] = {
      summary: `Auto-generated placeholder for ${method.toUpperCase()} ${routePath}`,
      responses: {
        '200': {
          description: 'Successful response',
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        }
      }
    }

    if (pathParams.length) (openapi.paths as Record<string, any>)[routePath][method].parameters = pathParams
  }

  // Add a minimal root info path
  if (!((openapi.paths as Record<string, unknown>)['/'])) (openapi.paths as Record<string, unknown>)['/'] = {}
  ;(openapi.paths as Record<string, any>)['/'].get = {
    summary: 'API root',
    responses: { '200': { description: 'OK' } }
  }

  return openapi
})
