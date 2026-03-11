import photo1 from '../assets/photos/WhatsApp Image 2026-03-11 at 8.25.50 PM.jpeg'
import photo2 from '../assets/photos/WhatsApp Image 2026-03-11 at 8.25.50 PM (1).jpeg'
import photo3 from '../assets/photos/WhatsApp Image 2026-03-11 at 8.25.50 PM (2).jpeg'

const PHRASE = 'Sin lugar a dudas, fuiste, sos y seras, mi mejor decision bombonazooo, me haces UNICO. Te quiero'

const PHOTOS = [
  { src: photo1, alt: 'Nosotros' },
  { src: photo2, alt: 'Juntos' },
  { src: photo3, alt: 'Juntos' },
]

const DATE_TEXT = '11 de febrero — 11 de marzo, 2026'

function Reveal({ onRestart }) {
  return (
    <div className="reveal">
      <p className="reveal__overline">Para ti</p>

      <p className="reveal__phrase">&ldquo;{PHRASE}&rdquo;</p>

      <div className="reveal__divider" />

      <div className="reveal__photos">
        {PHOTOS.map((photo, i) => (
          <img
            key={i}
            src={photo.src}
            alt={photo.alt}
            className={`reveal__photo ${
              PHOTOS.length % 2 !== 0 && i === PHOTOS.length - 1
                ? 'reveal__photo--single'
                : ''
            }`}
            loading="lazy"
          />
        ))}
      </div>

      <p className="reveal__date">{DATE_TEXT}</p>

      <div className="reveal__restart">
        <button className="btn" onClick={onRestart}>
          Volver al inicio
        </button>
      </div>
    </div>
  )
}

export default Reveal
