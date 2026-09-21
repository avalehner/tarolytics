import { useEffect, useState } from "react";
import styles from "./css/CursorTrail.module.css";
import type { TrailCardTypes } from "../types";

const cardFiles = import.meta.glob("/public/cards/*.{webp,png,jpg,jpeg}");

const CARD_IMAGES = Object.keys(cardFiles).map((path) =>
  path.replace("/public", ""),
);

const CARD_SPACING = 25;
const MAX_CARDS = 50;

const CursorTrail = () => {
  const [cards, setCards] = useState<TrailCardTypes[]>([]);

  useEffect(() => {
    const media = window.matchMedia(
      "(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );

    let nextId = 0;
    let lastPosition: { x: number; y: number } | null = null;

    function handlePointerMove(event: PointerEvent) {
      if (!media.matches || event.pointerType !== "mouse") return;

      const x = event.clientX;
      const y = event.clientY;

      if (lastPosition) {
        const distance = Math.hypot(x - lastPosition.x, y - lastPosition.y);

        if (distance < CARD_SPACING) return;
      }

      lastPosition = { x, y };

      const card: TrailCardTypes = {
        id: nextId++,
        x,
        y,
        rotation: Math.random() * 30 - 15,
        src: CARD_IMAGES[Math.floor(Math.random() * CARD_IMAGES.length)],
      };

      setCards((previous) => [...previous, card].slice(-MAX_CARDS));
    }

    function resetTrail() {
      lastPosition = null;
      setCards([]);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("blur", resetTrail);
    media.addEventListener("change", resetTrail);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", resetTrail);
      media.removeEventListener("change", resetTrail);
    };
  }, []);

  function removeCard(id: number) {
    setCards((previous) => previous.filter((card) => card.id !== id));
  }

  return (
    <div className={styles.trail} aria-hidden="true">
      {cards.map((card) => (
        <div
          key={card.id}
          className={styles.position}
          style={{
            left: card.x,
            top: card.y,
            transform: `translate(-50%, -50%) rotate(${card.rotation}deg)`,
          }}
        >
          <img
            className={styles.card}
            src={card.src}
            alt=""
            draggable={false}
            onAnimationEnd={() => removeCard(card.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default CursorTrail;
