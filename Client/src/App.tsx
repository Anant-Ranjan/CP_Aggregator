import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <BrowserRouter>
      <div className='min-h-screen'>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
export default App;
