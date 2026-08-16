import { Canvas, useFrame } from "@react-three/fiber";
import HeroText from "../components/HeroText";
import ParallaxBackground from "../components/ParallaxBackground";
import { Astronaut } from "../components/Astronaut";
import { Float } from "@react-three/drei";
import { useMediaQuery } from "react-responsive";
import { easing } from "maath";
import { Suspense, useEffect, useRef, useState } from "react";
import Loader from "../components/Loader";

const Hero = () => {
  const isMobile = useMediaQuery({ maxWidth: 853 });
  const sectionRef = useRef(null);

  // The hero's WebGL scene is the heaviest thing on the page. Once the user
  // scrolls it out of view there's no reason to keep feeding it frames — that
  // idle rendering is what was causing scroll jank elsewhere on the site.
  // We keep the canvas mounted (so it's instantly ready again on scroll back
  // up) but freeze its render loop while off-screen.
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin: "200px 0px", threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex items-start justify-center min-h-screen overflow-hidden md:items-start md:justify-start c-space"
    >
      <HeroText />
      <ParallaxBackground />
      <figure
        className="absolute inset-0"
        style={{ width: "100vw", height: "100vh" }}
      >
        <Canvas
          camera={{ position: [0, 1, 3] }}
          dpr={[1, 1.5]}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: "high-performance",
          }}
          performance={{ min: 0.4 }}
          frameloop={isInView ? "always" : "never"}
        >
          <ambientLight color="#5865f2" intensity={0.9} />
          <directionalLight color="#9a55ff" intensity={60} />

          <Suspense fallback={<Loader />}>
            <Float>
              <Astronaut
                scale={isMobile && 1.7} // ⬅️ increased from 0.23→0.3 (mobile) and 0.4→0.5 (desktop)
                position={isMobile ? [0, -3.3, 0] : [3, -5.5, -1]}
              />
            </Float>
            <Rig />
          </Suspense>
        </Canvas>
      </figure>
    </section>
  );
};

function Rig() {
  return useFrame((state, delta) => {
    easing.damp3(
      state.camera.position,
      [state.mouse.x / 10, 1 + state.mouse.y / 10, 3],
      0.5,
      delta
    );
  });
}

export default Hero;
