export default function RatingStars({ value = 0 }: { value?: number }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(value))
  return (
    <div className="stars">
      {stars.map((on, i) => (
        <span key={i}>{on ? '★' : '☆'}</span>
      ))}
    </div>
  )
}
