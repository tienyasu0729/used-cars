import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { CustomerDashboardLayout } from '@/layouts/CustomerDashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
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

const DashboardOverviewPage = lazy(() => import('@/pages/customer/DashboardOverviewPage').then((m) => ({ default: m.DashboardOverviewPage })))
const ProfilePage = lazy(() => import('@/pages/customer/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const SavedVehiclesPage = lazy(() => import('@/pages/customer/SavedVehiclesPage').then((m) => ({ default: m.SavedVehiclesPage })))
const BookingsPage = lazy(() => import('@/pages/customer/BookingsPage').then((m) => ({ default: m.BookingsPage })))
const DepositsPage = lazy(() => import('@/pages/customer/DepositsPage').then((m) => ({ default: m.DepositsPage })))
const OrdersPage = lazy(() => import('@/pages/customer/OrdersPage').then((m) => ({ default: m.OrdersPage })))
const OrderDetailPage = lazy(() => import('@/pages/customer/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage })))
const TransactionsPage = lazy(() => import('@/pages/customer/TransactionsPage').then((m) => ({ default: m.TransactionsPage })))
const ChatPage = lazy(() => import('@/pages/customer/ChatPage').then((m) => ({ default: m.ChatPage })))
const NotificationsPage = lazy(() => import('@/pages/customer/NotificationsPage').then((m) => ({ default: m.NotificationsPage })))
const SecurityPage = lazy(() => import('@/pages/customer/SecurityPage').then((m) => ({ default: m.SecurityPage })))

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
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <ScrollToTop />
        <CustomerDashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Suspense fallback={<Fallback />}><DashboardOverviewPage /></Suspense> },
      { path: 'profile', element: <Suspense fallback={<Fallback />}><ProfilePage /></Suspense> },
      { path: 'saved', element: <Suspense fallback={<Fallback />}><SavedVehiclesPage /></Suspense> },
      { path: 'bookings', element: <Suspense fallback={<Fallback />}><BookingsPage /></Suspense> },
      { path: 'deposits', element: <Suspense fallback={<Fallback />}><DepositsPage /></Suspense> },
      { path: 'orders', element: <Suspense fallback={<Fallback />}><OrdersPage /></Suspense> },
      { path: 'orders/:id', element: <Suspense fallback={<Fallback />}><OrderDetailPage /></Suspense> },
      { path: 'transactions', element: <Suspense fallback={<Fallback />}><TransactionsPage /></Suspense> },
      { path: 'chat', element: <Suspense fallback={<Fallback />}><ChatPage /></Suspense> },
      { path: 'notifications', element: <Suspense fallback={<Fallback />}><NotificationsPage /></Suspense> },
      { path: 'security', element: <Suspense fallback={<Fallback />}><SecurityPage /></Suspense> },
    ],
  },
  {
    path: '/staff',
    element: (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center p-8">
          <p className="text-slate-500">Staff Dashboard (Prompt Set 3)</p>
        </div>
      </ProtectedRoute>
    ),
  },
  {
    path: '/manager',
    element: (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center p-8">
          <p className="text-slate-500">Manager Dashboard (Prompt Set 4)</p>
        </div>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center p-8">
          <p className="text-slate-500">Admin Dashboard (Prompt Set 5)</p>
        </div>
      </ProtectedRoute>
    ),
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
