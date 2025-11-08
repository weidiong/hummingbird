import '../App.css'
import SpiderPlot from '../components/SpiderPlot'

function SpiderPlotPage() {
  return (
    <div className="app">
      <header className="header">
        <h1>Spider Plot - Tumor Size Change</h1>
        <p>Visualization of % change in tumor size over weeks on treatment</p>
      </header>
      <main className="main-content">
        <SpiderPlot />
      </main>
    </div>
  )
}

export default SpiderPlotPage

