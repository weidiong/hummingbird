import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import StatsCards from './components/StatsCards'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 

function App() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/stats`)
      setStats(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch statistics')
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Clinical Trial Dashboard</h1>
        <p>Overview of patient data and treatment statistics</p>
      </header>
      <main className="main-content">
        {stats && <StatsCards stats={stats} />}
      </main>
    </div>
  )
}

export default App

