import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { CompetencyProfile } from './pages/CompetencyProfile'
import { Courses } from './pages/Courses'
import { Layout } from './components/Layout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<CompetencyProfile />} />
          <Route path="/courses" element={<Courses />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
