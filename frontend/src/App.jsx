import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import { ProtectedRoute, AdminRoute } from './components/RouteGuards';

function App() {
  return (
    <Router>
      <div className="font-sans antialiased text-gray-900 bg-gray-50 min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Login />} />
        </Routes>

        <ToastContainer
          position="bottom-right"
          theme="dark"
          autoClose={3000}
        />
      </div>
    </Router>
  );
}

export default App;
