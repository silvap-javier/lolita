import { useState, useEffect, useCallback } from 'react'

/*
  Journey map: Cordoba Capital → Valencia, España
  0 = water/empty, 1 = land, 2 = path (walkable route)
  The player follows the path from Cordoba to Valencia across the Atlantic.
*/

// Waypoints along the journey (row, col) — displayed as labels
const WAYPOINTS = [
  { r: 7, c: 1, label: 'Cordoba' },
  { r: 6, c: 3, label: 'Bs. Aires' },
  { r: 4, c: 6, label: 'Atlantico' },
  { r: 3, c: 8, label: 'Madrid' },
  { r: 2, c: 11, label: 'Valencia' },
]

// Map grid: 0=water, 1=land, 2=walkable path
// Connected path: (7,1)→(7,2)→(6,2)→(6,3)→(6,4)→(5,4)→(5,5)→(4,5)→(4,6)→(3,6)→(3,7)→(3,8)→(2,8)→(2,9)→(2,10)→(2,11)
const MAP_DATA = [
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0],
  [0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]

const START = { r: 7, c: 1 }
const END = { r: 2, c: 11 }

function Maze({ onComplete }) {
  const [pos, setPos] = useState(START)
  const [visited, setVisited] = useState(new Set([`${START.r}-${START.c}`]))
  const [solved, setSolved] = useState(false)

  const canMoveTo = (r, c) => {
    if (r < 0 || r >= MAP_DATA.length || c < 0 || c >= MAP_DATA[0].length) return false
    return MAP_DATA[r][c] === 2
  }

  const move = useCallback((dr, dc) => {
    if (solved) return
    setPos(prev => {
      const nr = prev.r + dr
      const nc = prev.c + dc
      if (canMoveTo(nr, nc)) {
        const key = `${nr}-${nc}`
        setVisited(v => new Set([...v, key]))
        if (nr === END.r && nc === END.c) {
          setSolved(true)
        }
        return { r: nr, c: nc }
      }
      return prev
    })
  }, [solved])

  useEffect(() => {
    const handler = (e) => {
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': e.preventDefault(); move(-1, 0); break
        case 'ArrowDown': case 's': case 'S': e.preventDefault(); move(1, 0); break
        case 'ArrowLeft': case 'a': case 'A': e.preventDefault(); move(0, -1); break
        case 'ArrowRight': case 'd': case 'D': e.preventDefault(); move(0, 1); break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [move])

  useEffect(() => {
    let startX, startY
    const threshold = 20
    const handleStart = (e) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }
    const handleEnd = (e) => {
      if (startX === undefined) return
      const dx = e.changedTouches[0].clientX - startX
      const dy = e.changedTouches[0].clientY - startY
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
        move(0, dx > 0 ? 1 : -1)
      } else if (Math.abs(dy) > threshold) {
        move(dy > 0 ? 1 : -1, 0)
      }
    }
    window.addEventListener('touchstart', handleStart, { passive: true })
    window.addEventListener('touchend', handleEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', handleStart)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [move])

  // Find waypoint for a cell
  const getWaypoint = (r, c) => WAYPOINTS.find(w => w.r === r && w.c === c)

  return (
    <div className="maze">
      <h2 className="maze__title">Hagamos el recorrido juntos</h2>
      <p className="maze__hint">...de lo que nos falta para volver a vernos</p>

      <div className="journey__labels">
        <span className="journey__from">Cordoba, Argentina</span>
        <span className="journey__arrow">&rarr;</span>
        <span className="journey__to">Valencia, España</span>
      </div>

      <div
        className="maze__grid"
        style={{
          gridTemplateColumns: `repeat(${MAP_DATA[0].length}, 1fr)`,
        }}
      >
        {MAP_DATA.map((row, r) =>
          row.map((cell, c) => {
            const isCurrent = pos.r === r && pos.c === c
            const isEnd = r === END.r && c === END.c
            const isVisited = visited.has(`${r}-${c}`)
            const isPath = cell === 2
            const isLand = cell === 1
            const waypoint = getWaypoint(r, c)

            let cls = 'maze__cell'
            if (isCurrent) cls += ' maze__cell--current'
            else if (isEnd && !solved) cls += ' maze__cell--end'
            else if (isVisited && isPath) cls += ' maze__cell--visited'
            else if (isPath) cls += ' maze__cell--route'
            else if (isLand) cls += ' maze__cell--land'
            else cls += ' maze__cell--water'

            return (
              <div key={`${r}-${c}`} className={cls}>
                {waypoint && !isCurrent && (
                  <span className="maze__waypoint-label">{waypoint.label}</span>
                )}
              </div>
            )
          })
        )}
      </div>

      <div className="maze__controls">
        <button className="maze__btn maze__btn--up" onClick={() => move(-1, 0)}>&#9650;</button>
        <button className="maze__btn maze__btn--left" onClick={() => move(0, -1)}>&#9664;</button>
        <button className="maze__btn maze__btn--right" onClick={() => move(0, 1)}>&#9654;</button>
        <button className="maze__btn maze__btn--down" onClick={() => move(1, 0)}>&#9660;</button>
      </div>

      {solved ? (
        <>
          <p className="maze__message">Te espero... que feliz me siento de tenerte conmigo</p>
          <button className="btn btn--filled" onClick={onComplete}>
            Descubrir sorpresa
          </button>
        </>
      ) : (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-soft)' }}>
          Usa flechas, WASD, o desliza — llega a Valencia
        </p>
      )}
    </div>
  )
}

export default Maze
