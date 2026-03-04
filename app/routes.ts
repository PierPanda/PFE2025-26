import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';

export default [
  // Ignore Chrome DevTools well-known probe
  route('/.well-known/*', 'routes/_api/well-known/route.tsx'),

  // API Routes
  route('/api/auth/*', 'routes/_api/auth/route.tsx'),
  route('/api/courses', 'routes/_api/courses/route.tsx'),
  route('/api/teachers', 'routes/_api/teachers/route.tsx'),
  route('/api/stats', 'routes/_api/stats/route.tsx'),

  // Public Pages
  layout('routes/layouts/public-layout.tsx', [route('/auth', 'routes/pages/auth/page.tsx')]),

  // Authenticated Pages
  layout('routes/layouts/auth-layout.tsx', [
    index('routes/pages/dashboard/page.tsx'),
    route('/courses/create', 'routes/pages/courses/create-course-form.tsx'),
  ]),
] satisfies RouteConfig;
