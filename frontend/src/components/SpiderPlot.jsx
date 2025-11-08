import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import Plot from 'react-plotly.js'
import './SpiderPlot.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

function SpiderPlot() {
  const [rawData, setRawData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filter states
  const [availableArms, setAvailableArms] = useState([])
  const [availableDoses, setAvailableDoses] = useState([])
  const [availableTumorTypes, setAvailableTumorTypes] = useState([])
  
  const [selectedArms, setSelectedArms] = useState([])
  const [selectedDoses, setSelectedDoses] = useState([])
  const [selectedTumorTypes, setSelectedTumorTypes] = useState([])

  // Fetch all data on mount to get available options
  useEffect(() => {
    fetchSpiderData()
  }, [])

  // Fetch filtered data when filters change
  useEffect(() => {
    if (availableArms.length > 0) {
      fetchSpiderData()
    }
  }, [selectedArms, selectedDoses, selectedTumorTypes])

  const fetchSpiderData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (selectedArms.length > 0) {
        params.append('arms', selectedArms.join(','))
      }
      if (selectedDoses.length > 0) {
        params.append('doses', selectedDoses.join(','))
      }
      if (selectedTumorTypes.length > 0) {
        params.append('tumor_types', selectedTumorTypes.join(','))
      }
      
      const response = await axios.get(`${API_BASE_URL}/spider?${params.toString()}`)
      const data = response.data
      
      setRawData(data)
      
      // Extract unique values for filters
      const arms = [...new Set(data.map(d => d.arm).filter(Boolean))]
      const doses = [...new Set(data.map(d => d.dose).filter(Boolean))].sort((a, b) => a - b)
      const tumorTypes = [...new Set(data.map(d => d.tumor_type).filter(Boolean))]
      
      setAvailableArms(arms)
      setAvailableDoses(doses)
      setAvailableTumorTypes(tumorTypes)
      
      // Initialize selections if empty
      if (selectedArms.length === 0 && arms.length > 0) {
        setSelectedArms(arms)
      }
      if (selectedDoses.length === 0 && doses.length > 0) {
        setSelectedDoses(doses)
      }
      if (selectedTumorTypes.length === 0 && tumorTypes.length > 0) {
        setSelectedTumorTypes(tumorTypes)
      }
      
      setError(null)
    } catch (err) {
      setError('Failed to fetch spider plot data')
      console.error('Error fetching spider data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Process data for plotting
  const plotData = useMemo(() => {
    if (!rawData || rawData.length === 0) return []

    // Group by subject_id
    const grouped = {}
    rawData.forEach(record => {
      const subjectId = record.subject_id
      if (!grouped[subjectId]) {
        grouped[subjectId] = {
          subject_id: subjectId,
          arm: record.arm,
          dose: record.dose,
          tumor_type: record.tumor_type,
          points: []
        }
      }
      if (record.days !== null && record.change !== null) {
        grouped[subjectId].points.push({
          days: record.days,
          change: record.change
        })
      }
    })

    // Process each patient's data
    const traces = []
    const colorMap = {}
    let colorIndex = 0

    Object.values(grouped).forEach(patient => {
      // Sort points by days
      patient.points.sort((a, b) => a.days - b.days)
      
      // Convert days to weeks and ensure baseline at (0, 0)
      const weeks = [0]
      const changes = [0]
      
      patient.points.forEach(point => {
        weeks.push(point.days / 7)
        changes.push(point.change)
      })

      // Create color key from arm and dose
      const colorKey = `${patient.arm}-${patient.dose}`
      if (!colorMap[colorKey]) {
        // Generate distinct colors
        const hue = (colorIndex * 137.508) % 360 // Golden angle approximation
        colorMap[colorKey] = `hsl(${hue}, 70%, 50%)`
        colorIndex++
      }

      traces.push({
        x: weeks,
        y: changes,
        type: 'scatter',
        mode: 'lines+markers',
        name: `${patient.subject_id} (${patient.arm}-${patient.dose}mg)`,
        line: { color: colorMap[colorKey] },
        marker: { size: 6 }
      })
    })

    return traces
  }, [rawData])

  const handleArmToggle = (arm) => {
    setSelectedArms(prev => 
      prev.includes(arm) 
        ? prev.filter(a => a !== arm)
        : [...prev, arm]
    )
  }

  const handleDoseToggle = (dose) => {
    setSelectedDoses(prev => 
      prev.includes(dose) 
        ? prev.filter(d => d !== dose)
        : [...prev, dose]
    )
  }

  const handleTumorTypeToggle = (tumorType) => {
    setSelectedTumorTypes(prev => 
      prev.includes(tumorType) 
        ? prev.filter(t => t !== tumorType)
        : [...prev, tumorType]
    )
  }

  if (loading) {
    return <div className="spider-plot-container"><div className="loading">Loading...</div></div>
  }

  if (error) {
    return <div className="spider-plot-container"><div className="error">{error}</div></div>
  }

  return (
    <div className="spider-plot-container">
      <div className="filters-panel">
        <div className="filter-group">
          <h3>Treatment Arms</h3>
          {availableArms.map(arm => (
            <label key={arm} className="filter-checkbox">
              <input
                type="checkbox"
                checked={selectedArms.includes(arm)}
                onChange={() => handleArmToggle(arm)}
              />
              {arm}
            </label>
          ))}
        </div>

        <div className="filter-group">
          <h3>Doses (mg)</h3>
          {availableDoses.map(dose => (
            <label key={dose} className="filter-checkbox">
              <input
                type="checkbox"
                checked={selectedDoses.includes(dose)}
                onChange={() => handleDoseToggle(dose)}
              />
              {dose}
            </label>
          ))}
        </div>

        <div className="filter-group">
          <h3>Tumor Types</h3>
          {availableTumorTypes.map(tumorType => (
            <label key={tumorType} className="filter-checkbox">
              <input
                type="checkbox"
                checked={selectedTumorTypes.includes(tumorType)}
                onChange={() => handleTumorTypeToggle(tumorType)}
              />
              {tumorType}
            </label>
          ))}
        </div>
      </div>

      <div className="plot-container">
        <Plot
          data={plotData}
          layout={{
            title: 'Tumor Size Change Over Time',
            xaxis: {
              title: 'Weeks on Treatment',
              zeroline: true
            },
            yaxis: {
              title: '% Change in Tumor Size',
              zeroline: true
            },
            hovermode: 'closest',
            showlegend: true,
            legend: {
              x: 1.02,
              y: 1,
              xanchor: 'left',
              yanchor: 'top'
            },
            margin: { r: 200 }
          }}
          config={{ responsive: true }}
          style={{ width: '100%', height: '600px' }}
        />
      </div>
    </div>
  )
}

export default SpiderPlot

