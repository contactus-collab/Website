import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Purpose from './pages/Purpose'
import Resources from './pages/Resources'
import Notes from './pages/Notes'
import ArticleDetail from './pages/ArticleDetail'
import Understand from './pages/Understand'
import WordPressArticleDetail from './pages/WordPressArticleDetail'
import NewsletterPage from './pages/NewsletterPage'
import EventCalendar from './pages/EventCalendar'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminDashboard from './pages/AdminDashboard'
import AddUser from './pages/AddUser'
import Subscribers from './pages/Subscribers'
import WebsiteAnalytics from './pages/WebsiteAnalytics'
import LinkedInAnalytics from './pages/LinkedInAnalytics'
import EmailCampaign from './pages/EmailCampaign'

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
          <Route path="/understand" element={<Understand />} />
          <Route path="/understand/:id" element={<WordPressArticleDetail />} />
          <Route path="/newsletter" element={<NewsletterPage />} />
          <Route path="/event-calendar" element={<EventCalendar />} />
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
          <Route
            path="/admin/subscribers"
            element={
              <ProtectedRoute>
                <Subscribers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/email-campaign"
            element={
              <ProtectedRoute>
                <EmailCampaign />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/marketing/website"
            element={
              <ProtectedRoute>
                <WebsiteAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/marketing/linkedin"
            element={
              <ProtectedRoute>
                <LinkedInAnalytics />
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

