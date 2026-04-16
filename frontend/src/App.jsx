import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DiaryListPage from './pages/DiaryListPage'
import DiaryWritePage from './pages/DiaryWritePage'
import DiaryDetailPage from './pages/DiaryDetailPage'
import PersonaPage from './pages/PersonaPage'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('access_token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter basename="/malbeot">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<PrivateRoute><DiaryListPage /></PrivateRoute>} />
        <Route path="/write" element={<PrivateRoute><DiaryWritePage /></PrivateRoute>} />
        <Route path="/diary/:id" element={<PrivateRoute><DiaryDetailPage /></PrivateRoute>} />
        <Route path="/personas" element={<PrivateRoute><PersonaPage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
