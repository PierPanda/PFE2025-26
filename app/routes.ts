import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';

export default [
  // Ignore Chrome DevTools well-known probe
  // route('/.well-known/*', 'routes/_api/well-known/route.tsx'),

  // API Routes
  route('/api/auth/*', 'routes/_api/auth/route.ts'),
  route('/api/courses', 'routes/_api/courses/route.ts'),
  route('/api/teachers', 'routes/_api/teachers/route.ts'),
  route('/api/stats', 'routes/_api/stats/route.ts'),
  route('/api/availabilities', 'routes/_api/availabilities/route.ts'),

  // Public Pages
  layout('routes/layouts/public-layout.tsx', [route('/auth', 'routes/pages/auth/page.tsx')]),

  // Authenticated Pages
  layout('routes/layouts/auth-layout.tsx', [
    index('routes/pages/dashboard/page.tsx'),
    route('/profile', 'routes/pages/profile/page.tsx'),
    route('/courses/:id', 'routes/pages/courses/course/page.tsx'),

    // Teacher-only Pages (nested: hérite du header auth-layout)
    layout('routes/layouts/teacher-layout.tsx', [
      route('/courses/create', 'routes/pages/courses/create-course-form.tsx'),
    ]),

    // Admin-only Pages (nested: hérite du header auth-layout)
    layout('routes/layouts/admin-layout.tsx', [route('/admin', 'routes/pages/admin/page.tsx')]),
  ]),
] satisfies RouteConfig;
