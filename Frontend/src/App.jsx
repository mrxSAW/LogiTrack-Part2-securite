import { Navigate,Route,Routes,} from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './guards/ProtectedRoute'
import RoleGuard from './guards/RoleGuard'
import AccessDenied from './pages/AccessDenied'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Clients from './pages/clients/Clients'
import ClientDetails from './pages/clients/ClientDetails'
import ClientForm from './pages/clients/ClientForm'
import Products from './pages/products/Products'
import ProductDetails from './pages/products/ProductDetails'
import ProductForm from './pages/products/ProductForm'
import Orders from './pages/orders/Orders'
import OrderDetails from './pages/orders/OrderDetails'
import OrderForm from './pages/orders/OrderForm'
import OrderProducts from './pages/orders/OrderProducts'
import Users from './pages/users/Users'



export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/access-denied"
        element={<AccessDenied />}
      />

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/clients"
            element={<Clients />}
          />

          <Route
            path="/clients/:id"
            element={<ClientDetails />}
          />

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/products/:id"
            element={<ProductDetails />}
          />

          <Route
            path="/orders"
            element={<Orders />}
          />

          <Route
            path="/orders/:id"
            element={<OrderDetails />}
          />

          <Route
            element={
              <RoleGuard
                allowedRoles={[
                  'ADMIN',
                  'MANAGER',
                ]}
              />
            }
          >
            <Route
              path="/clients/new"
              element={<ClientForm />}
            />

            <Route
              path="/clients/:id/edit"
              element={<ClientForm />}
            />

            <Route
              path="/products/new"
              element={<ProductForm />}
            />

            <Route
              path="/products/:id/edit"
              element={<ProductForm />}
            />

            <Route
              path="/orders/new"
              element={<OrderForm />}
            />

            <Route
              path="/orders/:id/products"
              element={<OrderProducts />}
            />
          </Route>

          <Route
            element={
              <RoleGuard
                allowedRoles={['ADMIN']}
              />
            }
          >
            <Route
              path="/users"
              element={<Users />}
            />
          </Route>
        </Route>
      </Route>

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  )
}