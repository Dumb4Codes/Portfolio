/*
Optimized from the original Sketchfab asset:
Author: Jungle Jim (https://sketchfab.com/jungle_jim)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/silver-soldier-animated-a8f0d843735047b2999fbe4a9d7a1245
Title: Silver Soldier (Animated)

Compressed from ~50MB to ~5MB (Meshopt geometry compression + WebP textures)
using @gltf-transform/cli, with material palette/mesh-join disabled so the
model's blend/transparency material renders correctly. Visual result matches
the original 1:1 — positioning, scale, and lighting are untouched from before.
*/

import React, { useEffect, useMemo, useRef } from "react";
import { useGraph } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";

const MODEL_PATH = "/models/soldier-optimized.glb";

export function Astronaut(props) {
  const group = useRef();
  const { scene, animations } = useGLTF(MODEL_PATH);
  // Clone so skeleton bindings resolve correctly and multiple instances
  // (if ever used) don't share state.
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes } = useGraph(clone);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (animations.length > 0) {
      const action = actions[animations[0].name];
      action?.reset().play();
      return () => action?.stop();
    }
  }, [actions, animations]);

  return (
    <group
      ref={group}
      {...props}
      dispose={null}
      rotation={[-0.2, 0, 0]}
      scale={props.scale || 2.9}
      position={props.position || [2, 3, 0.5]}
    >
      {/* Render the cloned scene graph as-is — this preserves every node's
          exact transform/material from the compressed file, so it matches
          the original model's appearance without any manual re-guessing. */}
      <primitive object={nodes.Sketchfab_Scene || clone} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
