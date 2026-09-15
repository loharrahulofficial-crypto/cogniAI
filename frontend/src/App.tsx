import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { CompetencyProfile } from './pages/CompetencyProfile'
import { Courses } from './pages/Courses'
import { QuizTaking } from './pages/QuizTaking'
import { Admin } from './pages/Admin'
import { Layout } from './components/Layout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<CompetencyProfile />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/quizzes" element={<QuizTaking />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
