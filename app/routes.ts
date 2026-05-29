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
  route('/api/bookings', 'routes/_api/bookings/route.ts'),
  route('/api/bookings/complete', 'routes/_api/bookings/complete/route.ts'),
  route('/api/available-slots', 'routes/_api/available-slots/route.ts'),
  route('/api/ratings', 'routes/_api/ratings/route.ts'),

  // Public Pages
  layout('routes/layouts/public-layout.tsx', [route('/auth', 'routes/pages/auth/page.tsx')]),

  // Authenticated Pages
  layout('routes/layouts/auth-layout.tsx', [
    index('routes/pages/dashboard/page.tsx'),
    route('/courses', 'routes/pages/courses/page.tsx'),
    route('/cours/course/:id', 'routes/pages/cours-course-redirect.ts'),
    route('/cours/:category', 'routes/pages/cours-category-redirect.ts'),
    route('/profile', 'routes/pages/profile/page.tsx'),
    route('/course/:id', 'routes/pages/courses/course/page.tsx'),
    route('/checkout/:id', 'routes/pages/checkout/page.tsx'),
    // Catch-all route for 404 Not Found (matches any unmatched path)
    route('*', 'routes/pages/not-found/page.tsx'),

    // Teacher-only Pages (nested: hérite du header auth-layout)
    layout('routes/layouts/teacher-layout.tsx', [
      route('/course/create', 'routes/pages/courses/create-course-form.tsx'),
    ]),

    // Admin-only Pages (nested: hérite du header auth-layout)
    layout('routes/layouts/admin-layout.tsx', [route('/admin', 'routes/pages/admin/page.tsx')]),
  ]),
] satisfies RouteConfig;
