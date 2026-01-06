import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Purpose from './pages/Purpose'
import Resources from './pages/Resources'
import Notes from './pages/Notes'
import ArticleDetail from './pages/ArticleDetail'
import NewsletterPage from './pages/NewsletterPage'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminDashboard from './pages/AdminDashboard'
import AddUser from './pages/AddUser'

function AppContent() {
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith('/admin')

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminPage && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/purpose" element={<Purpose />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/:id" element={<ArticleDetail />} />
          <Route path="/newsletter" element={<NewsletterPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/add-user"
            element={
              <ProtectedRoute>
                <AddUser />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App

