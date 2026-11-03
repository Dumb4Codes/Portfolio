/**
 * Particle shaders. Two position buffers (A, B) are blended by uProgress with a per-particle stagger
 * and a curl-like drift in the middle of the morph, so it reads as a flock rather than a lerp.
 *
 * Shape ids: 0 hero, 1 ledger, 2 clock, 3 route, 4 field, 5 pin, 6 override text.
 * Accent rules per shape are in accentFor(); they use the chapter progress uniforms.
 */

export const vertexShader = /* glsl */ `
  attribute vec3 aPosA;
  attribute vec3 aPosB;
  attribute float aAttrA;
  attribute float aAttrB;
  attribute vec4 aRand;

  uniform float uProgress;   // 0..1 between shape A and B
  uniform float uTime;
  uniform float uShapeA;
  uniform float uShapeB;
  uniform float uLocalA;     // chapter progress for A (0..1)
  uniform float uLocalB;
  uniform vec2  uMouse;      // world px
  uniform float uMouseR;
  uniform float uMouseK;     // strength 0..1 (fades when idle)
  uniform float uHeroShift;  // px the hero word has scrolled up
  uniform float uVel;        // scroll velocity, signed, roughly -1..1
  uniform float uScatter;    // 0..1 chaos (404)
  uniform float uSize;       // px * dpr
  uniform float uCamZ;
  uniform float uRipple;     // 0..1 touch ripple age (1 = just tapped)
  uniform vec3  uRipplePos;

  varying float vAccent;
  varying float vAlpha;
  varying float vCold;

  // accent (x) and dim (y: 1 = full, <1 = not yet reached) for a shape given its attr
  vec2 accentFor(float shape, float a, float local) {
    if (shape < 0.5) return vec2(0.0, 1.0);
    if (shape < 1.5) {                              // ledger: rows light up in order
      float d = local - a;
      float lit = step(0.0, d);
      float current = lit * step(d, 0.085);
      return vec2(current, mix(0.22, 1.0, lit));
    }
    if (shape < 2.5) {                              // clock: overnight arc sweeps in accent
      if (a >= 0.5) {
        float t = (a - 0.5) * 2.0;
        float lit = step(t, local);
        return vec2(lit, mix(0.35, 1.0, lit));
      }
      return vec2(0.0, 1.0);
    }
    if (shape < 3.5) {                              // route: rider pulse + nodes light as passed
      if (a >= 2.0) {
        float lit = step(a - 2.0, local + 0.02);
        return vec2(lit, mix(0.45, 1.0, lit));
      }
      float pulse = 1.0 - smoothstep(0.0, 0.035, abs(a - local));
      return vec2(pulse, mix(0.5, 1.0, step(a, local)));
    }
    if (shape < 4.5) return vec2(0.0, 1.0);
    if (shape < 5.5) return vec2(step(0.5, a), 1.0);   // pin
    return vec2(0.0, 1.0);
  }

  // overall brightness per shape: the field is only a faint dust behind body text
  float gainFor(float s) {
    if (s < 0.5) return 1.0;
    if (s < 1.5) return 0.85;
    if (s < 2.5) return 1.0;
    if (s < 3.5) return 0.9;
    if (s < 4.5) return 0.24;
    if (s < 5.5) return 0.9;
    return 1.0;
  }

  void main() {
    float r = aRand.x;
    // staggered easing: each particle starts and finishes at its own moment
    float t = clamp((uProgress - r * 0.42) / 0.58, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);

    vec3 a = aPosA;
    vec3 b = aPosB;
    if (uShapeA < 0.5) {
      a.y += uHeroShift;
      a.x += uVel * (aRand.z - 0.5) * 220.0 * (0.4 + abs(a.y) / 400.0);
      a.y += uVel * (aRand.y - 0.5) * 60.0;
    }
    if (uShapeB < 0.5) b.y += uHeroShift;

    vec3 p = mix(a, b, t);

    // drift that peaks mid-morph
    float amp = sin(3.14159 * t) * 150.0;
    p += vec3(
      sin(p.y * 0.011 + uTime * 0.6 + aRand.y * 6.2832),
      cos(p.x * 0.009 + uTime * 0.5 + aRand.z * 6.2832),
      sin((p.x + p.y) * 0.007 + aRand.w * 6.2832)
    ) * amp;

    // resting breath
    p.xy += vec2(sin(uTime * 0.7 + aRand.w * 40.0), cos(uTime * 0.6 + aRand.y * 40.0)) * 1.4;

    // scatter (404)
    p += (vec3(aRand.y, aRand.z, aRand.w) - 0.5) * uScatter * 900.0;

    // cursor repulsion
    vec2 d = p.xy - uMouse;
    float dist = length(d);
    float f = smoothstep(uMouseR, 0.0, dist);
    p.xy += normalize(d + 0.0001) * f * f * 70.0 * uMouseK;

    // tap ripple
    if (uRipple > 0.0) {
      float rd = length(p.xy - uRipplePos.xy);
      float ring = (1.0 - uRipple) * 420.0;
      float w = exp(-pow((rd - ring) / 60.0, 2.0));
      p.xy += normalize(p.xy - uRipplePos.xy + 0.0001) * w * 40.0 * uRipple;
    }

    vec2 accA = accentFor(uShapeA, aAttrA, uLocalA);
    vec2 accB = accentFor(uShapeB, aAttrB, uLocalB);
    vAccent = mix(accA.x, accB.x, t);
    vAlpha = mix(accA.y * gainFor(uShapeA), accB.y * gainFor(uShapeB), t);
    vAlpha *= 1.0 - 0.72 * uScatter; // a scattered 404 stays a dim dust so the page text is readable
    vCold = step(0.985, aRand.w);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float depth = uCamZ / max(-mv.z, 1.0);
    gl_PointSize = uSize * (0.75 + aRand.x * 0.7) * (1.0 + vAccent * 0.25) * clamp(depth, 0.6, 1.5);
    vAlpha *= 0.55 + 0.45 * clamp(depth, 0.5, 1.2);
  }
`

export const fragmentShader = /* glsl */ `
  precision mediump float;
  uniform vec3 uFg;
  uniform vec3 uAccent;
  uniform vec3 uCold;
  uniform float uOpacity;
  uniform float uDark;

  varying float vAccent;
  varying float vAlpha;
  varying float vCold;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.15, d);
    vec3 col = mix(uFg, uCold, vCold * uDark * 0.8);
    col = mix(col, uAccent * mix(1.0, 0.9, uDark), vAccent);
    float a = soft * vAlpha * uOpacity * mix(0.9, 0.62, vAccent);
    gl_FragColor = vec4(col, a);
  }
`
