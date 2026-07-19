import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
    <BrowserRouter>
      <Routes>
        <Route path="/dev" element={<DevHome />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/plan/create" element={<CreatePlanPage />} />
        <Route path="/my" element={<MyPage />} />
        <Route path="/place" element={<PlacePage />} />
        <Route path="/plan/:id" element={<PlanPage />} />
        <Route path="/design-system" element={<DesignSystemPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;