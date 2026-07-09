// Hero: título animado por letra, grade cintilante e blob 3D (Three.js).
// Os dois loops de canvas pausam quando o hero sai da viewport.

export function initHero({ reduced }) {
  splitHeadline(reduced);

  const state = { visible: true, resume: [] };
  const hero = document.getElementById('inicio');
  if (hero && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      const was = state.visible;
      state.visible = entries[0].isIntersecting;
      if (state.visible && !was) state.resume.forEach((fn) => fn());
    }, { threshold: 0.02 });
    io.observe(hero);
  }

  initFlickerGrid(state);
  initBlobScene(state, reduced);
}

/* Divide o h1 em letras para a entrada em cascata.
   Sem JS (ou com motion reduzido) o título simplesmente aparece. */
function splitHeadline(reduced) {
  const el = document.querySelector('[data-split]');
  if (!el || reduced) return;

  const words = el.textContent.trim().split(' ');
  el.textContent = '';
  let i = 0;
  words.forEach((word, wi) => {
    const w = document.createElement('span');
    w.className = 'word';
    for (const ch of word) {
      const span = document.createElement('span');
      span.className = 'hero-char';
      span.style.animationDelay = (i * 0.06 + 0.9) + 's';
      span.textContent = ch;
      w.appendChild(span);
      i++;
    }
    el.appendChild(w);
    if (wi < words.length - 1) {
      el.appendChild(document.createTextNode(' '));
      i++;
    }
  });
}

/* Grade de quadradinhos que cintilam ao fundo. */
function initFlickerGrid(state) {
  const canvas = document.querySelector('[data-grid-canvas]');
  const ctx = canvas ? canvas.getContext('2d') : null;
  if (!ctx) return;

  const SQUARE = 4, GAP = 8, FLICKER = 0.15, MAX_OPACITY = 0.32, FPS = 30;
  const COLOR = 'rgba(61, 90, 254,';

  let cols = 0, rows = 0, squares = null, dpr = 1, raf = null, last = 0;

  const setup = () => {
    const host = canvas.parentElement;
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    cols = Math.floor(w / (SQUARE + GAP));
    rows = Math.floor(h / (SQUARE + GAP));
    squares = new Float32Array(cols * rows);
    for (let i = 0; i < squares.length; i++) squares[i] = Math.random() * MAX_OPACITY;
  };
  setup();

  const frameInterval = 1000 / FPS;
  const draw = (t) => {
    if (!state.visible) { raf = null; return; }
    raf = requestAnimationFrame(draw);
    if (!squares) return;
    if (last && t - last < frameInterval) return;
    const dt = Math.min((t - (last || t)) / 1000, 0.1);
    last = t;

    for (let i = 0; i < squares.length; i++) {
      if (Math.random() < FLICKER * dt) squares[i] = Math.random() * MAX_OPACITY;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cell = (SQUARE + GAP) * dpr, sq = SQUARE * dpr;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        ctx.fillStyle = COLOR + squares[i * rows + j] + ')';
        ctx.fillRect(i * cell, j * cell, sq, sq);
      }
    }
  };

  const start = () => { if (raf == null) { last = 0; raf = requestAnimationFrame(draw); } };
  start();
  state.resume.push(start);
  window.addEventListener('resize', setup, { passive: true });
}

/* Icosaedro deformado por ruído simplex, reagindo ao mouse.
   Three.js chega por CDN; se falhar, o hero continua só com a grade. */
async function initBlobScene(state, reduced) {
  const canvas = document.querySelector('[data-hero-canvas]');
  if (!canvas) return;

  let THREE;
  try {
    THREE = await import('three');
  } catch {
    return;
  }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 100);
  camera.position.set(0, 0, 4);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColorA: { value: new THREE.Color('#4d63ff') },
      uColorB: { value: new THREE.Color('#2b34a8') },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      uniform float uTime; uniform vec2 uMouse; varying vec3 vNormal;
      vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
      vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
      vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
      float snoise(vec3 v){
        const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
        vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
        vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
        vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy; i=mod289(i);
        vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
        float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
        vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
        vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
        vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
        vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
        vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
        vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
        vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
        p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
        vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
        return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
      }
      void main(){
        vNormal=normalize(normalMatrix*normal);
        float mouseDist=distance(position.xy,uMouse*2.0);
        float displacement=snoise(position*2.5+uTime*0.5)*0.34;
        displacement+=snoise(position*5.0-uTime*0.35)*0.08;
        displacement-=smoothstep(0.0,1.5,mouseDist)*0.6;
        vec3 newPosition=position+normal*displacement;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(newPosition,1.0);
      }`,
    fragmentShader: `
      uniform vec3 uColorA; uniform vec3 uColorB; varying vec3 vNormal;
      void main(){
        float fresnel=pow(1.0+dot(vNormal,vec3(0.0,0.0,1.0)),2.0);
        vec3 color=mix(uColorA,uColorB,vNormal.y*0.5+0.5);
        gl_FragColor=vec4(color+fresnel*0.2,1.0);
      }`,
  });

  const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.9, 20), material);
  scene.add(mesh);

  window.addEventListener('resize', () => {
    const ww = canvas.clientWidth, hh = canvas.clientHeight;
    renderer.setSize(ww, hh, false);
    camera.aspect = ww / hh;
    camera.updateProjectionMatrix();
  }, { passive: true });

  // Com motion reduzido, renderiza um único quadro estático.
  if (reduced) {
    material.uniforms.uTime.value = 1.5;
    renderer.render(scene, camera);
    return;
  }

  const mouse = new THREE.Vector2(0, 0);
  const target = new THREE.Vector2(0, 0);
  window.addEventListener('mousemove', (e) => {
    target.x = (e.clientX / window.innerWidth) * 2 - 1;
    target.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, { passive: true });

  const clock = new THREE.Clock();
  let raf = null;
  const loop = () => {
    if (!state.visible) { raf = null; return; }
    raf = requestAnimationFrame(loop);
    material.uniforms.uTime.value = clock.getElapsedTime();
    mouse.lerp(target, 0.12);
    material.uniforms.uMouse.value.copy(mouse);
    renderer.render(scene, camera);
  };
  const start = () => { if (raf == null) loop(); };
  start();
  state.resume.push(start);
}
