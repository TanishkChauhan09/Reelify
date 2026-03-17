import React, { useEffect, useRef, useState } from 'react'
import '../styles/food-burst.css'

const FOOD_EMOJIS = ['🍕','🍔','🍟','🌮','🍣','🥗','🍜','🥞','🍩','🥐','🥪','🍛']

const FoodBurst = () => {
  const [bursts, setBursts] = useState([])
  const idRef = useRef(1)

  useEffect(() => {
    const handler = (e) => {
      const id = idRef.current++
      const count = 10
      const items = Array.from({ length: count }).map((_, i) => ({
        id: `${id}-${i}`,
        emoji: FOOD_EMOJIS[(id + i) % FOOD_EMOJIS.length],
        angle: (i / count) * Math.PI * 2
      }))
      const burst = { id, x: e.clientX, y: e.clientY, items }
      setBursts((prev) => [ ...prev, burst ])
      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id))
      }, 1600)
    }

    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [])

  return (
    <div className="food-burst-layer" aria-hidden="true">
      {bursts.map((b) => (
        <div key={b.id} className="food-burst" style={{ left: b.x, top: b.y }}>
          {b.items.map((it, idx) => (
            <span
              key={it.id}
              className="food-burst-item"
              style={{
                '--angle': `${it.angle}rad`,
                '--index': idx
              }}
            >
              {it.emoji}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

export default FoodBurst
