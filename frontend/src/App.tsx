import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { CompetencyProfile } from './pages/CompetencyProfile'
import { Courses } from './pages/Courses'
import { Layout } from './components/Layout'
import { Placeholder } from './components/Placeholder'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<CompetencyProfile />} />
          <Route path="/courses" element={<Courses />} />
          <Route
            path="/quizzes"
            element={<Placeholder title="Quizzes" description="Take competency-gapped, AI-generated quizzes tagged to FRAC competency level and Bloom's taxonomy." />}
          />
          <Route
            path="/admin"
            element={<Placeholder title="Admin" description="Review AI-generated MCQs, validate proficiency, manage FRAC taxonomy and audit log." />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
