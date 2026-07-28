import { createBrowserRouter } from 'react-router-dom'

/**
 * כל route נטען lazy. שתי תת-אפליקציות נפרדות לחלוטין:
 *   /s/:token  → דף שיתוף ציבורי, בלי auth ובלי קוד ניהול
 *   השאר       → אפליקציית הניהול, מאחורי RequireAuth
 */
export const router = createBrowserRouter([
  {
    path: '/s/:token',
    lazy: async () => ({ Component: (await import('./public-share/SharePropertyPage')).default }),
  },
  {
    path: '/',
    lazy: async () => ({ Component: (await import('./app/AdminProviders')).default }),
    children: [
      {
        path: 'login',
        lazy: async () => ({ Component: (await import('./app/LoginPage')).default }),
      },
      {
        lazy: async () => ({ Component: (await import('./app/AdminLayout')).default }),
        children: [
          {
            index: true,
            lazy: async () => ({ Component: (await import('./app/HomeScreen')).default }),
          },
          {
            path: 'properties',
            lazy: async () => ({
              Component: (await import('./app/properties/PropertiesTab')).default,
            }),
          },
          {
            path: 'buyers',
            lazy: async () => ({ Component: (await import('./app/buyers/BuyersTab')).default }),
          },
          {
            path: 'sellers',
            lazy: async () => ({ Component: (await import('./app/sellers/SellersTab')).default }),
          },
          {
            path: 'calendar',
            lazy: async () => ({ Component: (await import('./app/calendar/CalendarTab')).default }),
          },
        ],
      },
    ],
  },
])
