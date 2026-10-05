import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  CanvasTexture,
  SRGBColorSpace,
  TextureLoader,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
} from "three";
import spreadConfig from "../data/spreadConfig";
import spreadPositions from "../data/spreadPositions";
import { getCardImagePath } from "../util";
import styles from "./css/CardDealScene.module.css";

type Point = [number, number, number];
type Bounds = { x: number; y: number; width: number; height: number };

interface CardDealSceneProps {
  spread: string;
  cards: string[];
  formRef: RefObject<HTMLDivElement | null>;
  spreadRef: RefObject<HTMLElement | null>;
  isFormMoving: boolean;
  onDealComplete: () => void;
}

// Timing and easing shared by the deal and reveal phases.
const CARD_ASPECT = 1.75;
const DEAL_INTERVAL = 0.44;
const DEAL_DURATION = 0.9;
const REVEAL_INTERVAL = 0.3;
const REVEAL_DURATION = 0.72;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
const springEase = (value: number) => {
  const t = clamp(value);
  if (t === 1) return 1;
  return 1 - Math.exp(-7 * t) * (Math.cos(10 * t) + 0.7 * Math.sin(10 * t));
};
const mix = (start: number, end: number, amount: number) =>
  start + (end - start) * amount;

// Load card art and create a text texture for each spread label.
function useCardBack() {
  const texture = useLoader(TextureLoader, "/cards/card-back.png");
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function useLabelTexture(label: string) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    if (context) {
      context.fillStyle = "#412d37";
      context.font = "600 56px Georgia, serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(label, 256, 65, 448);
    }
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    return result;
  }, [label]);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

interface DealCardProps {
  card: string;
  label: string;
  index: number;
  count: number;
  cardWidth: number;
  labelWidth: number;
  origin: RefObject<Point>;
  destination: Point;
  labelPosition: Point;
  rotation: number;
  startTime: RefObject<number | null>;
  reducedMotion: boolean;
}

// Animate one physical card, its flip, and its spread label.
function DealCard({
  card,
  label,
  index,
  count,
  cardWidth,
  labelWidth,
  origin,
  destination,
  labelPosition,
  rotation,
  startTime,
  reducedMotion,
}: DealCardProps) {
  const cardGroup = useRef<Group>(null);
  const cardBody = useRef<Mesh>(null);
  const labelMaterial = useRef<MeshBasicMaterial>(null);
  const departure = useRef<Point | null>(null);
  const front = useLoader(TextureLoader, getCardImagePath(card));
  const back = useCardBack();
  const labelTexture = useLabelTexture(label);
  front.colorSpace = SRGBColorSpace;
  const thickness = cardWidth * 0.035;

  useFrame(() => {
    if (!cardGroup.current || startTime.current === null) return;
    // Stagger deals first, then flip each card after every card has landed.
    const elapsed = reducedMotion
      ? Infinity
      : (performance.now() - startTime.current) / 1000;
    const dealStart = 0.18 + index * DEAL_INTERVAL;
    const deal = clamp((elapsed - dealStart) / DEAL_DURATION);
    const revealStart =
      0.18 + count * DEAL_INTERVAL + 0.56 + index * REVEAL_INTERVAL;
    const reveal = ease((elapsed - revealStart) / REVEAL_DURATION);
    const flip = springEase((elapsed - revealStart) / REVEAL_DURATION);
    // Freeze each card's departure point as the form moves left.
    if (elapsed >= dealStart && departure.current === null) {
      departure.current = [...origin.current];
    }
    const source = departure.current ?? origin.current;

    // Three travel phases: emerge, fly across the table, then spring into place.
    let travel: number;
    let height: number;
    if (deal < 0.24) {
      const segment = ease(deal / 0.24);
      travel = mix(0, 0.18, segment);
      height = mix(-0.12, cardWidth * 0.42, segment);
    } else if (deal < 0.78) {
      const segment = ease((deal - 0.24) / 0.54);
      travel = mix(0.18, 1.035, segment);
      height = mix(
        cardWidth * 0.42,
        cardWidth * 0.78,
        Math.sin(Math.PI * segment),
      );
    } else {
      const segment = springEase((deal - 0.78) / 0.22);
      travel = mix(1.035, 1, segment);
      height = Math.abs(mix(cardWidth * 0.42, 0, segment));
    }

    // Apply the pose and cast a shadow only while the card is above the table.
    cardGroup.current.visible = elapsed >= dealStart || reducedMotion;
    cardGroup.current.position.set(
      mix(source[0], destination[0], travel),
      mix(source[1], destination[1], travel),
      destination[2] + height + Math.sin(Math.PI * reveal) * cardWidth * 0.16,
    );
    cardGroup.current.rotation.set(
      -0.17 * (1 - ease(deal)),
      Math.PI * (1 - flip),
      rotation + 0.1 * Math.sin(index * 2.3) * (1 - ease(deal)),
    );
    if (cardBody.current) {
      cardBody.current.castShadow =
        !reducedMotion &&
        (height > cardWidth * 0.04 ||
          Math.sin(Math.PI * reveal) * cardWidth * 0.16 > cardWidth * 0.04);
    }

    // Fade in the spread label after the flip begins.
    if (labelMaterial.current) {
      labelMaterial.current.opacity = reducedMotion
        ? 1
        : ease((elapsed - revealStart - 0.24) / 0.5);
    }
  });

  return (
    <>
      {/* The box provides thickness; separate planes carry the front and back art. */}
      <group ref={cardGroup} visible={false}>
        <mesh ref={cardBody} castShadow>
          <boxGeometry args={[cardWidth, cardWidth * CARD_ASPECT, thickness]} />
          <meshStandardMaterial
            color="#f5ede3"
            roughness={0.73}
            metalness={0.02}
          />
        </mesh>
        <mesh
          position={[0, 0, thickness / 2 + 0.003]}
          rotation={[0, 0, card.endsWith(" rx") ? Math.PI : 0]}
        >
          <planeGeometry args={[cardWidth, cardWidth * CARD_ASPECT]} />
          <meshBasicMaterial map={front} toneMapped={false} />
        </mesh>
        <mesh
          position={[0, 0, -thickness / 2 - 0.003]}
          rotation={[0, Math.PI, 0]}
        >
          <planeGeometry args={[cardWidth, cardWidth * CARD_ASPECT]} />
          <meshBasicMaterial map={back} toneMapped={false} />
        </mesh>
      </group>
      <mesh position={labelPosition} renderOrder={10}>
        <planeGeometry args={[labelWidth, labelWidth / 4]} />
        <meshBasicMaterial
          ref={labelMaterial}
          map={labelTexture}
          transparent
          opacity={0}
          depthTest={false}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

// Give all cards one clock and report completion after the final reveal.
function DealSequence({
  cards,
  labels,
  cardWidth,
  labelWidth,
  origin,
  destinations,
  labelPositions,
  rotations,
  reducedMotion,
  onDealComplete,
}: {
  cards: string[];
  labels: string[];
  cardWidth: number;
  labelWidth: number;
  origin: RefObject<Point>;
  destinations: Point[];
  labelPositions: Point[];
  rotations: number[];
  reducedMotion: boolean;
  onDealComplete: () => void;
}) {
  const startTime = useRef<number | null>(null);
  const completed = useRef(false);
  useEffect(() => {
    startTime.current = performance.now();
    completed.current = false;
  }, [cards]);

  useFrame(() => {
    if (startTime.current === null || completed.current) return;
    const totalDuration =
      0.18 +
      cards.length * DEAL_INTERVAL +
      0.56 +
      (cards.length - 1) * REVEAL_INTERVAL +
      REVEAL_DURATION +
      0.5;
    if (
      reducedMotion ||
      (performance.now() - startTime.current) / 1000 >= totalDuration
    ) {
      completed.current = true;
      onDealComplete();
    }
  });

  return cards.map((card, index) => (
    <DealCard
      key={`${index}-${card}`}
      card={card}
      label={labels[index]}
      index={index}
      count={cards.length}
      cardWidth={cardWidth}
      labelWidth={labelWidth}
      origin={origin}
      destination={destinations[index]}
      labelPosition={labelPositions[index]}
      rotation={rotations[index]}
      startTime={startTime}
      reducedMotion={reducedMotion}
    />
  ));
}

// Convert spread reference positions into card and label positions in the canvas.
function TableScene({
  spread,
  cards,
  bounds,
  formRef,
  canvasRef,
  isFormMoving,
  reducedMotion,
  onDealComplete,
}: {
  spread: string;
  cards: string[];
  bounds: { canvas: Bounds; form: Bounds; spreadArea: Bounds };
  formRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLDivElement | null>;
  isFormMoving: boolean;
  reducedMotion: boolean;
  onDealComplete: () => void;
}) {
  const { viewport } = useThree();
  const layout = spreadPositions[spread];
  const scene = useMemo(() => {
    // Include rotated card extents so the whole spread fits its available area.
    const width = layout.cardWidth * 5;
    const height = width * CARD_ASPECT;
    const virtualCards = layout.positions.map((position) => {
      const angle = (position.rotation * Math.PI) / 180;
      return {
        x: position.x * 5 + width / 2,
        y: position.y * 4 + height / 2,
        halfWidth:
          (Math.abs(Math.cos(angle)) * width +
            Math.abs(Math.sin(angle)) * height) /
          2,
        halfHeight:
          (Math.abs(Math.sin(angle)) * width +
            Math.abs(Math.cos(angle)) * height) /
          2,
      };
    });
    const minX = Math.min(
      ...virtualCards.map((card) => card.x - card.halfWidth),
    );
    const maxX = Math.max(
      ...virtualCards.map((card) => card.x + card.halfWidth),
    );
    const minY = Math.min(
      ...virtualCards.map((card) => card.y - card.halfHeight),
    );
    const maxY =
      Math.max(...virtualCards.map((card) => card.y + card.halfHeight)) +
      width * 0.48;
    const scale = Math.min(
      (bounds.spreadArea.width * 0.86) / (maxX - minX),
      (bounds.spreadArea.height * 0.85) / (maxY - minY),
    );
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const unitsPerPixel = viewport.width / bounds.canvas.width;
    // Map page pixels to world units in the orthographic camera.
    const toWorld = (x: number, y: number, z: number): Point => [
      (x - bounds.canvas.width / 2) * unitsPerPixel,
      (bounds.canvas.height / 2 - y) * unitsPerPixel,
      z,
    ];
    const targetPixels = virtualCards.map((card) => ({
      x:
        bounds.spreadArea.x +
        bounds.spreadArea.width / 2 +
        (card.x - centerX) * scale,
      y:
        bounds.spreadArea.y +
        bounds.spreadArea.height / 2 +
        (card.y - centerY) * scale,
    }));
    const cardWidthPixels = width * scale;
    const labelHeightPixels = Math.max(
      24,
      Math.min(cardWidthPixels * 0.34, 32),
    );
    const labelWidthPixels = labelHeightPixels * 4;
    // Keep labels beneath their cards unless the spread defines an offset.
    return {
      cardWidth: cardWidthPixels * unitsPerPixel,
      labelWidth: labelWidthPixels * unitsPerPixel,
      origin: toWorld(
        bounds.form.x + bounds.form.width * 0.77,
        bounds.form.y + bounds.form.height * 0.57,
        -0.09,
      ),
      destinations: targetPixels.map((pixel, index) =>
        toWorld(
          pixel.x,
          pixel.y,
          spread === "celtic" && index === 1 ? 0.1 : 0.04,
        ),
      ),
      labelPositions: targetPixels.map((pixel, index) => {
        const offset = layout.positions[index].labelOffset;
        const labelX = offset
          ? pixel.x + (offset.x / 100) * cardWidthPixels
          : pixel.x;
        const labelY = offset
          ? pixel.y + (offset.y / 100) * cardWidthPixels * CARD_ASPECT
          : pixel.y +
            virtualCards[index].halfHeight * scale +
            labelHeightPixels / 2 +
            7;
        return toWorld(labelX, labelY, 0.23);
      }),
      rotations: layout.positions.map(
        (position) => (-position.rotation * Math.PI) / 180,
      ),
    };
  }, [layout, spread, bounds, viewport.width]);
  const movingOrigin = useRef<Point>(scene.origin);
  // Track the moving form until each card captures its own departure point.
  useFrame(() => {
    if (!isFormMoving) return;
    const form = formRef.current?.getBoundingClientRect();
    const canvas = canvasRef.current?.getBoundingClientRect();
    if (!form || !canvas || !canvas.width) return;
    const unitsPerPixel = viewport.width / canvas.width;
    movingOrigin.current = [
      (form.left - canvas.left + form.width * 0.77 - canvas.width / 2) *
        unitsPerPixel,
      (canvas.height / 2 - (form.top - canvas.top + form.height * 0.57)) *
        unitsPerPixel,
      -0.09,
    ];
  });

  return (
    <>
      {/* Light the card edges and receive shadows on a transparent surface. */}
      <ambientLight intensity={1.6} />
      <directionalLight
        position={[-3, 5, 12]}
        intensity={2.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-viewport.width / 2}
        shadow-camera-right={viewport.width / 2}
        shadow-camera-top={viewport.height / 2}
        shadow-camera-bottom={-viewport.height / 2}
        shadow-camera-far={50}
        shadow-bias={-0.0002}
      />
      <mesh position={[0, 0, -0.22]} receiveShadow>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <shadowMaterial transparent color="#473042" opacity={0.28} />
      </mesh>
      <Suspense fallback={null}>
        <DealSequence
          key={`${spread}-${cards.join("|")}`}
          cards={cards}
          labels={spreadConfig[spread]}
          cardWidth={scene.cardWidth}
          labelWidth={scene.labelWidth}
          origin={movingOrigin}
          destinations={scene.destinations}
          labelPositions={scene.labelPositions}
          rotations={scene.rotations}
          reducedMotion={reducedMotion}
          onDealComplete={onDealComplete}
        />
      </Suspense>
    </>
  );
}

// Measure the page layout and mount one transparent, full-page 3D canvas.
export default function CardDealScene({
  spread,
  cards,
  formRef,
  spreadRef,
  isFormMoving,
  onDealComplete,
}: CardDealSceneProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const validCards = useMemo(() => cards.filter(Boolean), [cards]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [bounds, setBounds] = useState<{
    canvas: Bounds;
    form: Bounds;
    spreadArea: Bounds;
  } | null>(null);

  // Honor changes to the system's reduced-motion preference.
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  // Recalculate canvas, form, and spread bounds when the layout changes.
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const form = formRef.current;
    const spreadArea = spreadRef.current;
    if (!canvas || !form || !spreadArea) return;
    const measure = () => {
      const canvasRect = canvas.getBoundingClientRect();
      const formRect = form.getBoundingClientRect();
      const spreadRect = spreadArea.getBoundingClientRect();
      if (!canvasRect.width || !canvasRect.height || !spreadRect.width) return;
      setBounds({
        canvas: {
          x: 0,
          y: 0,
          width: canvasRect.width,
          height: canvasRect.height,
        },
        form: {
          x: formRect.left - canvasRect.left,
          y: formRect.top - canvasRect.top,
          width: formRect.width,
          height: formRect.height,
        },
        spreadArea: {
          x: spreadRect.left - canvasRect.left,
          y: spreadRect.top - canvasRect.top,
          width: spreadRect.width,
          height: spreadRect.height,
        },
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    observer.observe(form);
    observer.observe(spreadArea);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [formRef, spreadRef, spread]);

  return (
    <div
      ref={canvasRef}
      className={styles.canvas}
      aria-label="Animated tarot card spread"
    >
      {bounds && validCards.length > 0 && (
        <Canvas
          orthographic
          camera={{ position: [0, 0, 20], zoom: 50 }}
          shadows
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true }}
          fallback={<p>Card animation is unavailable in this browser.</p>}
        >
          <TableScene
            spread={spread}
            cards={validCards}
            bounds={bounds}
            formRef={formRef}
            canvasRef={canvasRef}
            isFormMoving={isFormMoving}
            reducedMotion={reducedMotion}
            onDealComplete={onDealComplete}
          />
        </Canvas>
      )}
    </div>
  );
}
