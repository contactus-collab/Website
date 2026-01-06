import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Purpose from './pages/Purpose'
import Resources from './pages/Resources'
import Notes from './pages/Notes'
import ArticleDetail from './pages/ArticleDetail'
import NewsletterPage from './pages/NewsletterPage'

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/purpose" element={<Purpose />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/notes/:id" element={<ArticleDetail />} />
            <Route path="/newsletter" element={<NewsletterPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App

