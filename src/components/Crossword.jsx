import { useState, useRef, useEffect, useCallback } from 'react'

/*
  Crossword layout:
  INTELIGENCIA across (row 4) as the backbone.
  KOALITA down (col 5), PETALOS down (col 2),
  EXTRAÑAR down (col 7), CUCHARITA down (col 9)
  — all crossing INTELIGENCIA.
*/
const WORDS = [
  { word: 'KOALITA', row: 0, col: 5, direction: 'down', clue: 'Como te llamo de cariño' },
  { word: 'PETALOS', row: 2, col: 2, direction: 'down', clue: 'Lugar donde nos besamos por primera vez' },
  { word: 'CUCHARITA', row: 2, col: 9, direction: 'down', clue: 'Mejor pose para dormir con vos' },
  { word: 'INTELIGENCIA', row: 4, col: 0, direction: 'across', clue: 'Cosa que mas me gusta de vos' },
  { word: 'EXTRAÑAR', row: 4, col: 7, direction: 'down', clue: 'Sentir que mas tengo presente en los dias' },
]

const GRID_ROWS = 12
const GRID_COLS = 12

function buildGrid() {
  const grid = Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => null)
  )
  const numbers = Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => null)
  )

  WORDS.forEach((w, idx) => {
    for (let i = 0; i < w.word.length; i++) {
      const r = w.direction === 'down' ? w.row + i : w.row
      const c = w.direction === 'across' ? w.col + i : w.col
      if (r < GRID_ROWS && c < GRID_COLS) {
        grid[r][c] = w.word[i]
      }
    }
    numbers[w.row][w.col] = idx + 1
  })

  return { grid, numbers }
}

function Crossword({ onComplete }) {
  const { grid, numbers } = buildGrid()
  const [userInput, setUserInput] = useState(
    Array.from({ length: GRID_ROWS }, () =>
      Array.from({ length: GRID_COLS }, () => '')
    )
  )
  const [cellStates, setCellStates] = useState(
    Array.from({ length: GRID_ROWS }, () =>
      Array.from({ length: GRID_COLS }, () => '')
    )
  )
  const [solved, setSolved] = useState(false)
  const [activeClue, setActiveClue] = useState(0)
  const inputRefs = useRef({})

  const focusCell = useCallback((r, c) => {
    const ref = inputRefs.current[`${r}-${c}`]
    if (ref) ref.focus()
  }, [])

  const handleInput = useCallback((r, c, value) => {
    if (solved) return
    const char = value.slice(-1).toUpperCase()

    setUserInput(prev => {
      const next = prev.map(row => [...row])
      next[r][c] = char
      return next
    })

    // Auto-advance to next cell in the active word
    if (char) {
      const word = WORDS[activeClue]
      if (word) {
        const idx = word.direction === 'across' ? c - word.col : r - word.row
        if (idx < word.word.length - 1) {
          const nr = word.direction === 'down' ? r + 1 : r
          const nc = word.direction === 'across' ? c + 1 : c
          focusCell(nr, nc)
        }
      }
    }
  }, [solved, activeClue, focusCell])

  const handleKeyDown = useCallback((r, c, e) => {
    if (e.key === 'Backspace' && !userInput[r][c]) {
      const word = WORDS[activeClue]
      if (word) {
        const nr = word.direction === 'down' ? r - 1 : r
        const nc = word.direction === 'across' ? c - 1 : c
        if (nr >= 0 && nc >= 0) focusCell(nr, nc)
      }
    }
  }, [userInput, activeClue, focusCell])

  const checkAnswers = useCallback(() => {
    const newStates = cellStates.map(row => [...row])
    let allCorrect = true
    let anyFilled = false

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (grid[r][c]) {
          if (userInput[r][c]) {
            anyFilled = true
            if (userInput[r][c] === grid[r][c]) {
              newStates[r][c] = 'correct'
            } else {
              newStates[r][c] = 'wrong'
              allCorrect = false
            }
          } else {
            allCorrect = false
          }
        }
      }
    }

    if (!anyFilled) return
    setCellStates(newStates)

    if (allCorrect) {
      setSolved(true)
    } else {
      // Clear wrong states after animation
      setTimeout(() => {
        setCellStates(prev =>
          prev.map(row => row.map(s => (s === 'wrong' ? '' : s)))
        )
      }, 800)
    }
  }, [userInput, cellStates, grid])

  // Focus first cell of active clue when it changes
  useEffect(() => {
    const word = WORDS[activeClue]
    if (word) focusCell(word.row, word.col)
  }, [activeClue, focusCell])

  return (
    <div className="crossword">
      <h2 className="crossword__title">En el centro esta lo que me enamora cada dia mas de vos</h2>
      <p className="crossword__hint">...y el resto son palabras que fuimos construyendo juntos</p>

      {/* Clues */}
      <div style={{ marginBottom: '1.5rem' }}>
        {WORDS.map((w, idx) => (
          <div
            key={idx}
            className="crossword__clue"
            onClick={() => setActiveClue(idx)}
            style={{
              cursor: 'pointer',
              borderLeft: activeClue === idx ? '3px solid var(--accent)' : '3px solid transparent',
              opacity: cellStates[w.row]?.[w.col] === 'correct' ? 0.5 : 1,
            }}
          >
            <strong>{idx + 1}.</strong>{' '}
            {w.direction === 'across' ? '→' : '↓'} {w.clue}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="crossword__grid">
        {grid.map((row, r) => (
          <div className="crossword__row" key={r}>
            {row.map((cell, c) => {
              if (cell === null) {
                return <div key={c} className="crossword__cell crossword__cell--empty" />
              }
              const state = cellStates[r][c]
              const isFilled = !!userInput[r][c]
              return (
                <div
                  key={c}
                  className={`crossword__cell ${
                    isFilled ? 'crossword__cell--filled' : ''
                  } ${state ? `crossword__cell--${state}` : ''}`}
                  onClick={() => focusCell(r, c)}
                >
                  {numbers[r][c] && (
                    <span className="crossword__cell-number">{numbers[r][c]}</span>
                  )}
                  <input
                    ref={el => (inputRefs.current[`${r}-${c}`] = el)}
                    value={userInput[r][c]}
                    onChange={e => handleInput(r, c, e.target.value)}
                    onKeyDown={e => handleKeyDown(r, c, e)}
                    onFocus={() => {
                      // Find all words this cell belongs to
                      const matchingWords = WORDS.reduce((acc, w, idx) => {
                        for (let i = 0; i < w.word.length; i++) {
                          const wr = w.direction === 'down' ? w.row + i : w.row
                          const wc = w.direction === 'across' ? w.col + i : w.col
                          if (wr === r && wc === c) { acc.push(idx); break }
                        }
                        return acc
                      }, [])
                      // If current clue already owns this cell, keep it
                      if (matchingWords.includes(activeClue)) return
                      // Otherwise pick the first match
                      if (matchingWords.length > 0) setActiveClue(matchingWords[0])
                    }}
                    maxLength={1}
                    disabled={state === 'correct' || solved}
                    autoComplete="off"
                    autoCapitalize="characters"
                  />
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {solved ? (
        <>
          <p className="crossword__message">Perfecto... ahora hagamos el recorrido juntos de lo que nos falta para volver a vernos</p>
          <button className="btn btn--filled" onClick={onComplete}>
            Siguiente desafio
          </button>
        </>
      ) : (
        <button className="btn" onClick={checkAnswers}>
          Verificar
        </button>
      )}
    </div>
  )
}

export default Crossword
