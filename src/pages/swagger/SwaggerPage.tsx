import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'
import spec from '../../../docs/openapi.yaml'

export default function SwaggerPage() {
  if (!import.meta.env.DEV) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Swagger disabled in production
      </div>
    )
  }
  return (
    <div style={{ height: '100vh' }}>
      <SwaggerUI spec={spec} />
    </div>
  )
}
