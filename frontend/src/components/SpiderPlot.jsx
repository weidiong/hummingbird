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
  
  // Consistent color mapping - generated once from all possible combinations
  const [colorMap, setColorMap] = useState({})
  
  const [selectedArm, setSelectedArm] = useState('all')
  const [selectedDose, setSelectedDose] = useState('all')
  const [selectedTumorType, setSelectedTumorType] = useState('all')

  // Fetch all data on mount to get available options (no filters)
  useEffect(() => {
    fetchAllDataForOptions()
  }, [])

  // Fetch filtered data when filters change
  useEffect(() => {
    if (availableArms.length > 0) {
      fetchSpiderData()
    }
  }, [selectedArm, selectedDose, selectedTumorType])

  // Fetch all data once to populate dropdown options
  const fetchAllDataForOptions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/spider`)
      const data = response.data
      
      // Extract unique values for filters from ALL data
      const arms = [...new Set(data.map(d => d.arm).filter(Boolean))]
      const doses = [...new Set(data.map(d => d.dose).filter(Boolean))].sort((a, b) => a - b)
      const tumorTypes = [...new Set(data.map(d => d.tumor_type).filter(Boolean))]
      
      setAvailableArms(arms)
      setAvailableDoses(doses)
      setAvailableTumorTypes(tumorTypes)
      
      // Generate simple color map: Red for arm A, Green for arm B
      const newColorMap = {}
      arms.forEach(arm => {
        doses.forEach(dose => {
          const combo = `${arm}-${dose}`
          if (arm === 'A') {
            newColorMap[combo] = '#d32f2f' // Red
          } else if (arm === 'B') {
            newColorMap[combo] = '#2e7d32' // Green
          } else {
            newColorMap[combo] = '#666666' // Gray fallback
          }
        })
      })
      
      setColorMap(newColorMap)
    } catch (err) {
      console.error('Error fetching options:', err)
    }
  }

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
      // Skip records with invalid subject_id
      if (!record.subject_id || 
          record.subject_id === 'nan' || 
          record.subject_id === 'NaN' ||
          String(record.subject_id).toLowerCase() === 'nan') {
        return
      }
      
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
      // Filter out NaN, null, or undefined values
      if (record.days !== null && record.days !== undefined && !isNaN(record.days) &&
          record.change !== null && record.change !== undefined && !isNaN(record.change)) {
        grouped[subjectId].points.push({
          days: record.days,
          change: record.change
        })
      }
    })

    // Process each patient's data
    const traces = []

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

      // Create color key from arm and dose - use consistent color map
      const colorKey = `${patient.arm}-${patient.dose}`
      const patientColor = colorMap[colorKey] || '#999999' // Fallback color if not in map

      traces.push({
        x: weeks,
        y: changes,
        type: 'scatter',
        mode: 'lines+markers',
        name: `${patient.subject_id} (${patient.arm}-${patient.dose}mg)`,
        line: { color: patientColor },
        marker: { size: 6 },
        hovertemplate: `<b>${patient.subject_id}</b><br>` +
                      `Weeks: %{x:.1f}<br>` +
                      `% Change: %{y:.2f}%<extra></extra>`
      })
    })

    return traces
  }, [rawData, colorMap])

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
              zeroline: true,
              range: [-100, 100],
              tickmode: 'linear',
              dtick: 20
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

