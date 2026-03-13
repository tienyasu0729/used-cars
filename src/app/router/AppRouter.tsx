import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { ScrollToTop } from '@/components/common/ScrollToTop'
import { Spinner } from '@/components/ui'

const HomePage = lazy(() => import('@/pages/public/HomePage').then((m) => ({ default: m.HomePage })))
const VehicleListingPage = lazy(() => import('@/pages/public/VehicleListingPage').then((m) => ({ default: m.VehicleListingPage })))
const VehicleDetailPage = lazy(() => import('@/pages/public/VehicleDetailPage').then((m) => ({ default: m.VehicleDetailPage })))
const ComparePage = lazy(() => import('@/pages/public/ComparePage').then((m) => ({ default: m.ComparePage })))
const BranchListingPage = lazy(() => import('@/pages/public/BranchListingPage').then((m) => ({ default: m.BranchListingPage })))
const BranchDetailPage = lazy(() => import('@/pages/public/BranchDetailPage').then((m) => ({ default: m.BranchDetailPage })))
const ContactPage = lazy(() => import('@/pages/public/ContactPage').then((m) => ({ default: m.ContactPage })))
const AboutPage = lazy(() => import('@/pages/public/AboutPage').then((m) => ({ default: m.AboutPage })))
const LoginPage = lazy(() => import('@/pages/public/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/public/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('@/pages/public/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('@/pages/public/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })))

const Fallback = () => (
  <div className="flex min-h-[400px] items-center justify-center">
    <Spinner size="lg" />
  </div>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Suspense fallback={<Fallback />}><HomePage /></Suspense> },
      { path: 'vehicles', element: <Suspense fallback={<Fallback />}><VehicleListingPage /></Suspense> },
      { path: 'vehicles/:id', element: <Suspense fallback={<Fallback />}><VehicleDetailPage /></Suspense> },
      { path: 'compare', element: <Suspense fallback={<Fallback />}><ComparePage /></Suspense> },
      { path: 'branches', element: <Suspense fallback={<Fallback />}><BranchListingPage /></Suspense> },
      { path: 'branches/:id', element: <Suspense fallback={<Fallback />}><BranchDetailPage /></Suspense> },
      { path: 'contact', element: <Suspense fallback={<Fallback />}><ContactPage /></Suspense> },
      { path: 'about', element: <Suspense fallback={<Fallback />}><AboutPage /></Suspense> },
      { path: 'sell', element: <Suspense fallback={<Fallback />}><ContactPage /></Suspense> },
      { path: 'news', element: <Suspense fallback={<Fallback />}><AboutPage /></Suspense> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Suspense fallback={<Fallback />}><LoginPage /></Suspense> },
      { path: 'register', element: <Suspense fallback={<Fallback />}><RegisterPage /></Suspense> },
      { path: 'forgot-password', element: <Suspense fallback={<Fallback />}><ForgotPasswordPage /></Suspense> },
      { path: 'reset-password', element: <Suspense fallback={<Fallback />}><ResetPasswordPage /></Suspense> },
    ],
  },
  { path: '/dashboard', element: <><ScrollToTop /><div className="p-8 text-center">Dashboard (Prompt Set 2)</div></> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
