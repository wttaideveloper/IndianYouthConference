import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import FAQs from './pages/FAQs'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import Register from './pages/Register'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminLayout from './components/admin/AdminLayout'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
    </Routes>
  )
}
