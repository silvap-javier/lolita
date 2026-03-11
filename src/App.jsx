import { useState, useCallback } from 'react'
import Welcome from './components/Welcome'
import Crossword from './components/Crossword'
import Maze from './components/Maze'
import Reveal from './components/Reveal'
import './App.css'

const STEPS = ['welcome', 'crossword', 'maze', 'reveal']

function App() {
  const [currentStep, setCurrentStep] = useState(0)
  const [exiting, setExiting] = useState(false)

  const goNext = useCallback(() => {
    setExiting(true)
    setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))
      setExiting(false)
    }, 400)
  }, [])

  const restart = useCallback(() => {
    setExiting(true)
    setTimeout(() => {
      setCurrentStep(0)
      setExiting(false)
    }, 400)
  }, [])

  const progress = ((currentStep) / (STEPS.length - 1)) * 100

  const renderStep = () => {
    const props = { onComplete: goNext }
    switch (STEPS[currentStep]) {
      case 'welcome': return <Welcome {...props} />
      case 'crossword': return <Crossword {...props} />
      case 'maze': return <Maze {...props} />
      case 'reveal': return <Reveal onRestart={restart} />
      default: return null
    }
  }

  return (
    <div className="app">
      <div className="progress" style={{ width: `${progress}%` }} />
      <div
        className={`step-container ${exiting ? 'step-exit' : ''}`}
        key={currentStep}
      >
        {renderStep()}
      </div>
    </div>
  )
}

export default App
