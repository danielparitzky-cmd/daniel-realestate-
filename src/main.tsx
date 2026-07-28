import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { isSupabaseConfigured } from './lib/env'
import SetupNeeded from './app/SetupNeeded'
import { router } from './router'
import './index.css'

const root = createRoot(document.getElementById('root')!)

root.render(
  <StrictMode>{isSupabaseConfigured ? <RouterProvider router={router} /> : <SetupNeeded />}</StrictMode>,
)
