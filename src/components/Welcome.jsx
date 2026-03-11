function Welcome({ onComplete }) {
  return (
    <div className="welcome">
      <p className="welcome__overline">Un pequeno desafio para ti</p>
      <h1 className="welcome__title">1 Mes</h1>
      <p className="welcome__subtitle">...y apenas estamos empezando</p>
      <div className="welcome__cta">
        <button className="btn" onClick={onComplete}>
          Comenzar
        </button>
      </div>
    </div>
  )
}

export default Welcome
