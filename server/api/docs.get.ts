export default defineEventHandler(async (event) => {
  const base = getRequestURL(event).origin
  const specUrl = `${base}/api/openapi`
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>API Docs</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui.min.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-bundle.min.js"></script>
    <script>
      window.onload = function() {
        SwaggerUIBundle({
          url: '${specUrl}',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis],
          layout: 'BaseLayout'
        })
      }
    </script>
  </body>
</html>`

  setHeader(event, 'content-type', 'text/html; charset=utf-8')
  return html
})
