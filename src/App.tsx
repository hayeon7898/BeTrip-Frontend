import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DevHome from './pages/DevHome';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CreatePlanPage from './pages/CreatePlanPage';
import MyPage from './pages/MyPage';
import PlacePage from './pages/PlacePage';
import PlanPage from './pages/PlanPage';
import DesignSystemPage from './pages/DesignSystemPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DevHome />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/plan/create"
            element={
              <ProtectedRoute>
                <CreatePlanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my"
            element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/place"
            element={
              <ProtectedRoute>
                <PlacePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plan/:id"
            element={
              <ProtectedRoute>
                <PlanPage />
              </ProtectedRoute>
            }
          />
          <Route path="/design-system" element={<DesignSystemPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;