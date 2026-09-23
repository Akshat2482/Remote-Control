import React, { useEffect, useRef } from "react";

interface LiquidGlassCanvasProps {
  className?: string;
  interactive?: boolean;
}

export const LiquidGlassCanvas: React.FC<LiquidGlassCanvasProps> = ({
  className = "fixed inset-0 pointer-events-none z-0",
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      depth: false,
      powerPreference: "high-performance",
    });

    if (!gl) return;

    // Vertex Shader: full-screen quad
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment Shader: WebGL chromatic aberration & liquid refraction caustic shader
    const fsSource = `
      precision highp float;
      varying vec2 v_uv;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_touch;
      uniform float u_touch_active;

      // Hash function for pseudo-random organic noise
      vec3 hash(vec3 p) {
        p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
                 dot(p, vec3(269.5, 183.3, 246.1)),
                 dot(p, vec3(113.5, 271.9, 124.6)));
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
      }

      // 3D Simplex noise for fluid organic deformation
      float snoise(vec3 p) {
        const float K1 = 0.333333333;
        const float K2 = 0.166666667;
        vec3 i = floor(p + (p.x + p.y + p.z) * K1);
        vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
        vec3 e = step(vec3(0.0), d0 - d0.yzx);
        vec3 i1 = e * (1.0 - e.zxy);
        vec3 i2 = 1.0 - e.zxy * (1.0 - e);
        vec3 d1 = d0 - (i1 - 1.0 * K2);
        vec3 d2 = d0 - (i2 - 2.0 * K2);
        vec3 d3 = d0 - (1.0 - 3.0 * K2);
        vec4 w, d;
        w.x = dot(d0, d0);
        w.y = dot(d1, d1);
        w.z = dot(d2, d2);
        w.w = dot(d3, d3);
        w = max(0.6 - w, 0.0);
        d.x = dot(hash(i), d0);
        d.y = dot(hash(i + i1), d1);
        d.z = dot(hash(i + i2), d2);
        d.w = dot(hash(i + 1.0), d3);
        w *= w;
        w *= w;
        d *= w;
        return dot(d, vec4(52.0));
      }

      // Liquid height field
      float liquidField(vec2 p, float t) {
        float h = 0.0;
        h += snoise(vec3(p * 1.8, t * 0.18)) * 0.55;
        h += snoise(vec3(p * 3.6, t * 0.28 + 2.0)) * 0.28;
        h += snoise(vec3(p * 7.2, t * 0.45 + 5.0)) * 0.12;

        // Interactive touch ripple refraction
        if (u_touch_active > 0.01) {
          float dist = distance(p, u_touch);
          float ripple = sin(dist * 22.0 - t * 6.0) * exp(-dist * 4.5);
          h += ripple * 0.35 * u_touch_active;
        }
        return h;
      }

      void main() {
        vec2 uv = v_uv;
        vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
        vec2 p = (uv - 0.5) * aspect;
        vec2 touchP = (u_touch - 0.5) * aspect;

        float t = u_time * 0.65;
        float eps = 0.008;

        // Compute surface normal via central difference
        float c = liquidField(p, t);
        float cx = liquidField(p + vec2(eps, 0.0), t);
        float cy = liquidField(p + vec2(0.0, eps), t);
        vec2 normal = normalize(vec2(cx - c, cy - c) / eps);

        // Chromatic Aberration & Snell's Law Refraction
        // Red, Green, Blue refracted at slightly different refractive indices (dispersion)
        float dispersion = 0.038;
        vec2 uvR = uv + normal * (0.045 + dispersion);
        vec2 uvG = uv + normal * 0.045;
        vec2 uvB = uv + normal * (0.045 - dispersion);

        // Caustic luminosity & Fresnel specular sheen
        float causticR = pow(max(0.0, 1.0 - abs(liquidField((uvR - 0.5) * aspect, t))), 3.5);
        float causticG = pow(max(0.0, 1.0 - abs(liquidField((uvG - 0.5) * aspect, t))), 3.5);
        float causticB = pow(max(0.0, 1.0 - abs(liquidField((uvB - 0.5) * aspect, t))), 3.5);

        // Specular highlight: simulate directional top-light reflecting off curved liquid glass
        vec3 lightDir = normalize(vec3(-0.4, 0.7, 0.6));
        vec3 surfaceNormal = normalize(vec3(normal * 0.7, 1.0));
        float specular = pow(max(0.0, dot(surfaceNormal, lightDir)), 18.0) * 0.45;

        // Crystal liquid glass lighting: pure crystal refraction, white specular sheen, soft cyan/azure dispersion
        vec3 whiteSheen = vec3(0.95, 0.98, 1.0) * specular * 0.85;
        vec3 azureCaustic = vec3(0.12, 0.60, 0.92) * causticG * 0.4;
        vec3 violetCaustic = vec3(0.35, 0.25, 0.90) * causticB * 0.25;
        vec3 chromaticGlow = vec3(causticR, causticG, causticB) * 0.18;

        // Glass boundary vignette
        float vignette = smoothstep(1.3, 0.2, length(p));

        vec3 finalColor = (whiteSheen + azureCaustic + violetCaustic + chromaticGlow) * vignette;
        float alpha = clamp((specular * 0.9 + causticG * 0.45 + causticB * 0.3) * 0.55, 0.0, 0.65);

        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Fullscreen quad buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    );

    const aPosition = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uTouch = gl.getUniformLocation(program, "u_touch");
    const uTouchActive = gl.getUniformLocation(program, "u_touch_active");

    let animationFrameId: number;
    const startTime = performance.now();
    let currentTouch = { x: 0.5, y: 0.5 };
    let targetTouchActive = 0.0;
    let currentTouchActive = 0.0;

    const resize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth * dpr;
      const height = canvas.clientHeight * dpr;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const handlePointer = (e: PointerEvent | TouchEvent) => {
      if (!interactive || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
      const clientY = "touches" in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
      currentTouch.x = (clientX - rect.left) / rect.width;
      currentTouch.y = 1.0 - (clientY - rect.top) / rect.height;
      targetTouchActive = 1.0;
    };

    const handlePointerEnd = () => {
      targetTouchActive = 0.0;
    };

    window.addEventListener("pointermove", handlePointer, { passive: true });
    window.addEventListener("pointerdown", handlePointer, { passive: true });
    window.addEventListener("pointerup", handlePointerEnd, { passive: true });
    window.addEventListener("touchmove", handlePointer, { passive: true });
    window.addEventListener("touchend", handlePointerEnd, { passive: true });

    const render = () => {
      resize();
      const elapsed = (performance.now() - startTime) / 1000;
      currentTouchActive += (targetTouchActive - currentTouchActive) * 0.08;

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uTouch, currentTouch.x, currentTouch.y);
      gl.uniform1f(uTouchActive, currentTouchActive);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("pointerdown", handlePointer);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("touchmove", handlePointer);
      window.removeEventListener("touchend", handlePointerEnd);
      if (positionBuffer) gl.deleteBuffer(positionBuffer);
      if (program) gl.deleteProgram(program);
    };
  }, [interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{
        transform: "translateZ(0)",
        willChange: "transform",
      }}
    />
  );
};
