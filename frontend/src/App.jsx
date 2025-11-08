import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import SpiderPlotPage from './pages/SpiderPlotPage'
import Navigation from './components/Navigation'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/spider" element={<SpiderPlotPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
