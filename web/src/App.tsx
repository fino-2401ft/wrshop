import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { DetailPage } from './pages/DetailPage';
import { PaymentPage } from './pages/PaymentPage';
import { ContactPage } from './pages/ContactPage';
import { InstallmentPage } from './pages/InstallmentPage';
import { InfoPage } from './pages/InfoPage';
import { LoginPage } from './pages/admin/LoginPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AccountsPage } from './pages/admin/AccountsPage';
import { AccountFormPage } from './pages/admin/AccountFormPage';
import { OrdersPage } from './pages/admin/OrdersPage';
import { CategoriesPage } from './pages/admin/CategoriesPage';

const client = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export function App() {
  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop/:slug" element={<CategoryPage />} />
            <Route path="/acc/:code" element={<DetailPage />} />
            <Route path="/thanh-toan/:code" element={<PaymentPage />} />
            <Route path="/lien-he" element={<ContactPage />} />
            <Route path="/chinh-sach-tra-gop" element={<InstallmentPage />} />
            <Route path="/khuyen-mai" element={<InfoPage />} />
            <Route path="/don-hang" element={<InfoPage />} />
            <Route path="/faq" element={<InfoPage />} />
            <Route path="/ho-tro" element={<InfoPage />} />
            <Route path="/chinh-sach-mua-hang" element={<InfoPage />} />
            <Route path="/chinh-sach-thanh-toan" element={<InfoPage />} />
            <Route path="/chinh-sach-hoan-tien" element={<InfoPage />} />
            <Route path="/dieu-khoan" element={<InfoPage />} />
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AccountsPage />} />
              <Route path="accounts/new" element={<AccountFormPage />} />
              <Route path="accounts/:id" element={<AccountFormPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="categories" element={<CategoriesPage />} />
            </Route>
          </Route>
          <Route
            path="*"
            element={
              <div className="grid min-h-screen place-items-center text-slate-600">
                Không tìm thấy trang
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
