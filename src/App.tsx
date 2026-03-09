import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AdminLayout, StaffLayout, ShowroomLayout, FinanceLayout, InspectorLayout, CustomerLayout } from '@/layouts'
import {
  HomePage,
  CarsListingPage,
  CarDetailPage,
  CheckoutPage,
  PaymentProcessingPage,
  PaymentResultPage,
  SosRescuePage,
  ProfileInfoPage,
  FavoritesPage,
  AppointmentsPage,
  TransactionsPage,
  RefundRequestPage,
  PrivilegesPage,
} from '@/modules/customer/pages'
import { CustomerProfileLayout } from '@/modules/customer/layouts/CustomerProfileLayout'
import { LoginPage, SignUpPage, ResetPasswordPage } from '@/modules/auth/pages'
import {
  InventoryPage,
  AddCarPage,
  ShowroomProfilePage,
  ShowroomDashboardPage,
  AppointmentsManagePage,
  QrScannerPage,
  TransactionsPage as ShowroomTransactionsPage,
  ServicePackagesPage,
  ChatPage,
  ReviewsPage,
} from '@/modules/showroom/pages'
import {
  AdminDashboardPage,
  StaffManagePage,
  BankAccountUpdatePage,
  BalanceHistoryPage,
  RefundApprovalPage,
  ShowroomsManagePage,
  TransactionsManagePage,
  CommissionPage,
  SubscriptionPackagesPage,
  RescuePartnersPage,
  SystemSettingsPage,
  SystemLogsPage,
  CustomersPage,
  FinancePartnersPage,
} from '@/modules/admin/pages'
import {
  FinanceDashboardPage,
  FinanceProfilePage,
  ProductsManagePage,
  LeadsManagePage,
  FinanceChatPage,
  AffiliateReportPage,
} from '@/modules/finance/pages'
import {
  TasksPage,
  ActivePage,
  CertifiedPage,
  InspectorProfilePage,
  ImageVerificationPage,
  InspectionFormPage,
  CertificationPage,
} from '@/modules/inspector/pages'
import SwaggerPage from '@/pages/swagger/SwaggerPage'
import {
  StaffDashboardPage,
  CarApprovalPage,
  ReviewApprovalPage,
  FraudReportsPage,
  HotCarsPage,
  BannersPage,
  CategoriesPage,
  MediaPage,
  SeoPage,
  BlogFaqPage,
  AppointmentFlowPage,
  ChangeHistoryPage,
  VerificationPage,
  ShowroomSupportPage,
  VouchersPage,
  NotificationsPage,
} from '@/modules/staff/pages'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CustomerLayout />}>
            <Route index element={<HomePage />} />
            <Route path="cars" element={<CarsListingPage />} />
            <Route path="cars/:id" element={<CarDetailPage />} />
            <Route path="checkout/:id" element={<CheckoutPage />} />
            <Route path="payment/result" element={<PaymentResultPage />} />
            <Route path="sos" element={<SosRescuePage />} />
            <Route path="account" element={<CustomerProfileLayout />}>
              <Route index element={<Navigate to="/account/profile" replace />} />
              <Route path="profile" element={<ProfileInfoPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="privileges" element={<PrivilegesPage />} />
              <Route path="refund-request" element={<RefundRequestPage />} />
            </Route>
          </Route>

          <Route path="/payment/processing/:carId" element={<PaymentProcessingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/swagger" element={<SwaggerPage />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="showrooms" element={<ShowroomsManagePage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="staff" element={<StaffManagePage />} />
            <Route path="transactions" element={<TransactionsManagePage />} />
            <Route path="commission" element={<CommissionPage />} />
            <Route path="refund-approval" element={<RefundApprovalPage />} />
            <Route path="subscription-packages" element={<SubscriptionPackagesPage />} />
            <Route path="finance-partners" element={<FinancePartnersPage />} />
            <Route path="rescue-partners" element={<RescuePartnersPage />} />
            <Route path="system-settings" element={<SystemSettingsPage />} />
            <Route path="system-logs" element={<SystemLogsPage />} />
            <Route path="bank-update" element={<BankAccountUpdatePage />} />
            <Route path="balance-history" element={<BalanceHistoryPage />} />
          </Route>

          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<Navigate to="/staff/dashboard" replace />} />
            <Route path="dashboard" element={<StaffDashboardPage />} />
            <Route path="car-approvals" element={<CarApprovalPage />} />
            <Route path="review-approvals" element={<ReviewApprovalPage />} />
            <Route path="fraud-reports" element={<FraudReportsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="hot-cars" element={<HotCarsPage />} />
            <Route path="banners" element={<BannersPage />} />
            <Route path="blog-faq" element={<BlogFaqPage />} />
            <Route path="media" element={<MediaPage />} />
            <Route path="seo" element={<SeoPage />} />
            <Route path="showroom-support" element={<ShowroomSupportPage />} />
            <Route path="vouchers" element={<VouchersPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="appointment-flow" element={<AppointmentFlowPage />} />
            <Route path="verification" element={<VerificationPage />} />
            <Route path="change-history" element={<ChangeHistoryPage />} />
          </Route>

          <Route path="/showroom" element={<ShowroomLayout />}>
            <Route index element={<Navigate to="/showroom/dashboard" replace />} />
            <Route path="dashboard" element={<ShowroomDashboardPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="add-car" element={<AddCarPage />} />
            <Route path="appointments" element={<AppointmentsManagePage />} />
            <Route path="qr-scanner" element={<QrScannerPage />} />
            <Route path="transactions" element={<ShowroomTransactionsPage />} />
            <Route path="packages" element={<ServicePackagesPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="profile" element={<ShowroomProfilePage />} />
          </Route>

          <Route path="/finance" element={<FinanceLayout />}>
            <Route index element={<Navigate to="/finance/dashboard" replace />} />
            <Route path="dashboard" element={<FinanceDashboardPage />} />
            <Route path="profile" element={<FinanceProfilePage />} />
            <Route path="products" element={<ProductsManagePage />} />
            <Route path="leads" element={<LeadsManagePage />} />
            <Route path="chat" element={<FinanceChatPage />} />
            <Route path="affiliate-reports" element={<AffiliateReportPage />} />
          </Route>

          <Route path="/inspector" element={<InspectorLayout />}>
            <Route index element={<Navigate to="/inspector/tasks" replace />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="active" element={<ActivePage />} />
            <Route path="certified" element={<CertifiedPage />} />
            <Route path="profile" element={<InspectorProfilePage />} />
            <Route path="verify-images/:carId" element={<ImageVerificationPage />} />
            <Route path="inspect/:carId" element={<InspectionFormPage />} />
            <Route path="certify/:carId" element={<CertificationPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
