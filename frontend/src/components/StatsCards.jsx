import './StatsCards.css'

function StatsCards({ stats }) {
  return (
    <div className="stats-container">
      <div className="stat-card">
        <div className="stat-icon">👥</div>
        <div className="stat-content">
          <h3>Unique Patients</h3>
          <p className="stat-value">{stats.unique_patients}</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">🧪</div>
        <div className="stat-content">
          <h3>Treatment Arms</h3>
          <p className="stat-value">{stats.treatment_arms.length}</p>
          <p className="stat-detail">
            {stats.treatment_arms.join(', ')}
          </p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">💊</div>
        <div className="stat-content">
          <h3>Dose Levels</h3>
          <p className="stat-value">{stats.dose_levels.length}</p>
          <p className="stat-detail">
            {stats.dose_levels.join(' mg, ')} mg
          </p>
        </div>
      </div>
    </div>
  )
}

export default StatsCards

