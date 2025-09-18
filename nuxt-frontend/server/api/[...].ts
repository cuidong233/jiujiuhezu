export default defineEventHandler(async (event) => {
  const path = event.node.req.url || ''
  const method = event.node.req.method
  const body = method !== 'GET' && method !== 'HEAD' ? await readBody(event) : undefined
  
  console.log(`Proxying ${method} ${path} to backend`)
  
  try {
    const response = await $fetch.raw(`http://localhost:3000${path}`, {
      method: method as any,
      body,
      headers: {
        ...getHeaders(event),
        host: 'localhost:3000'
      }
    })
    
    // 设置响应头
    const headers = response.headers
    for (const [key, value] of Object.entries(headers)) {
      if (key.toLowerCase() !== 'content-encoding') {
        setHeader(event, key, value as string)
      }
    }
    
    return response._data
  } catch (error: any) {
    console.error('Proxy error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message
    })
  }
})