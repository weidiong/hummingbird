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
  
  const [selectedArm, setSelectedArm] = useState('all')
  const [selectedDose, setSelectedDose] = useState('all')
  const [selectedTumorType, setSelectedTumorType] = useState('all')

  // Fetch all data on mount to get available options
  useEffect(() => {
    fetchSpiderData()
  }, [])

  // Fetch filtered data when filters change
  useEffect(() => {
    if (availableArms.length > 0) {
      fetchSpiderData()
    }
  }, [selectedArm, selectedDose, selectedTumorType])

  const fetchSpiderData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (selectedArm !== 'all') {
        params.append('arms', selectedArm)
      }
      if (selectedDose !== 'all') {
        params.append('doses', selectedDose)
      }
      if (selectedTumorType !== 'all') {
        params.append('tumor_types', selectedTumorType)
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
        marker: { size: 6 },
        hovertemplate: `<b>${patient.subject_id}</b><br>` +
                      `Weeks: %{x:.1f}<br>` +
                      `% Change: %{y:.2f}%<extra></extra>`
      })
    })

    return traces
  }, [rawData])

  const handleArmChange = (e) => {
    setSelectedArm(e.target.value)
  }

  const handleDoseChange = (e) => {
    setSelectedDose(e.target.value)
  }

  const handleTumorTypeChange = (e) => {
    setSelectedTumorType(e.target.value)
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
          <select 
            className="filter-dropdown"
            value={selectedArm}
            onChange={handleArmChange}
          >
            <option value="all">All</option>
            {availableArms.map(arm => (
              <option key={arm} value={arm}>{arm}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <h3>Doses (mg)</h3>
          <select 
            className="filter-dropdown"
            value={selectedDose}
            onChange={handleDoseChange}
          >
            <option value="all">All</option>
            {availableDoses.map(dose => (
              <option key={dose} value={dose}>{dose}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <h3>Tumor Types</h3>
          <select 
            className="filter-dropdown"
            value={selectedTumorType}
            onChange={handleTumorTypeChange}
          >
            <option value="all">All</option>
            {availableTumorTypes.map(tumorType => (
              <option key={tumorType} value={tumorType}>{tumorType}</option>
            ))}
          </select>
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

