import * as THREE from 'three'

// ═══════════════════════════════════════════════════════════════════
//  ENDOSIM ENGINE v3  — Anatomically realistic colon simulator
//  MODES:
//    diagnostic   — navigate freely, observe
//    therapeutic  — click damaged tissue to heal it (cauterize)
//    emergency    — a cut appears, blood spreads in real-time
// ═══════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────
//  TEXTURE GENERATORS
// ────────────────────────────────────────────────────────────────

function makeMucosaTexture(baseRGB, size = 1024) {
  const [r, g, b] = baseRGB
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')

  // 1. Deep submucosa base (darker, slightly purple-pink)
  ctx.fillStyle = `rgb(${Math.max(0,r-80)},${Math.max(0,g-35)},${Math.max(0,b-30)})`
  ctx.fillRect(0, 0, size, size)

  // 2. Mucosal layer gradient (warm salmon-pink)
  const radGrad = ctx.createRadialGradient(size*.5,size*.5,0, size*.5,size*.5,size*.72)
  radGrad.addColorStop(0,   `rgba(${r},${g},${b},1)`)
  radGrad.addColorStop(0.5, `rgba(${Math.max(0,r-18)},${Math.max(0,g-10)},${Math.max(0,b-8)},0.92)`)
  radGrad.addColorStop(1,   `rgba(${Math.max(0,r-45)},${Math.max(0,g-22)},${Math.max(0,b-18)},0.75)`)
  ctx.fillStyle = radGrad; ctx.fillRect(0,0,size,size)

  // 3. Macroscopic mucosal folds (lighter streaks along length)
  for (let i = 0; i < 8; i++) {
    const x = (i / 8) * size
    const w = 20 + Math.random() * 60
    const lg = ctx.createLinearGradient(x-w, 0, x+w, 0)
    lg.addColorStop(0, 'rgba(255,200,180,0)')
    lg.addColorStop(0.5, `rgba(${Math.min(255,r+30)},${Math.min(255,g+15)},${Math.min(255,b+12)},0.12)`)
    lg.addColorStop(1, 'rgba(255,200,180,0)')
    ctx.fillStyle = lg; ctx.fillRect(x-w,0,w*2,size)
  }

  // 4. Haustra shadow grooves (darker transverse bands)
  for (let i = 0; i < 14; i++) {
    const y = Math.random() * size
    const h = 6 + Math.random() * 22
    const lg = ctx.createLinearGradient(0,y-h,0,y+h)
    lg.addColorStop(0, 'rgba(0,0,0,0)')
    lg.addColorStop(0.5, `rgba(${Math.max(0,r-80)},${Math.max(0,g-40)},${Math.max(0,b-35)},0.45)`)
    lg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = lg; ctx.fillRect(0,y-h,size,h*2)
  }

  // 5. Organic depth variation (crypts & villi texture)
  const dark = [Math.max(0,r-65), Math.max(0,g-30), Math.max(0,b-28)]
  for (let i = 0; i < 600; i++) {
    const x = Math.random()*size, y = Math.random()*size
    const rad = 3 + Math.random()*55
    const a = 0.015 + Math.random()*0.10
    const grd = ctx.createRadialGradient(x,y,0,x,y,rad)
    grd.addColorStop(0, `rgba(${dark},${a+0.03})`)
    grd.addColorStop(1, `rgba(${dark},0)`)
    ctx.fillStyle = grd; ctx.fillRect(x-rad,y-rad,rad*2,rad*2)
  }

  // 6. Lighter reflection patches (glistening mucosal surface)
  const lite = [Math.min(255,r+42), Math.min(255,g+22), Math.min(255,b+18)]
  for (let i = 0; i < 100; i++) {
    const x = Math.random()*size, y = Math.random()*size
    const rad = 6 + Math.random()*45
    const a = 0.01 + Math.random()*0.055
    const grd = ctx.createRadialGradient(x,y,0,x,y,rad)
    grd.addColorStop(0, `rgba(${lite},${a})`)
    grd.addColorStop(1, `rgba(${lite},0)`)
    ctx.fillStyle = grd; ctx.fillRect(x-rad,y-rad,rad*2,rad*2)
  }

  // 7. Vascular network — primary vessels
  const vein = [Math.max(0,r-95), Math.max(0,g-45), Math.max(0,b-42)]
  for (let v = 0; v < 28; v++) {
    ctx.strokeStyle = `rgba(${vein},${0.22+Math.random()*0.42})`
    ctx.lineWidth = 0.4 + Math.random()*3.8
    ctx.lineCap = 'round'
    ctx.beginPath()
    let px = Math.random()*size, py = Math.random()*size
    ctx.moveTo(px,py)
    for (let s = 0; s < 18; s++) {
      px += (Math.random()-0.5)*110; py += (Math.random()-0.5)*110
      ctx.quadraticCurveTo(px+(Math.random()-0.5)*55, py+(Math.random()-0.5)*55, px, py)
    }
    ctx.stroke()
  }

  // 8. Capillary network — fine vessels
  const cap = [Math.max(0,r-55), Math.max(0,g-25), Math.max(0,b-22)]
  for (let v = 0; v < 80; v++) {
    ctx.strokeStyle = `rgba(${cap},${0.08+Math.random()*0.16})`
    ctx.lineWidth = 0.1 + Math.random()*0.85
    ctx.beginPath()
    let px = Math.random()*size, py = Math.random()*size
    ctx.moveTo(px,py)
    for (let s = 0; s < 8; s++) {
      px += (Math.random()-0.5)*40; py += (Math.random()-0.5)*40
      ctx.lineTo(px,py)
    }
    ctx.stroke()
  }

  // 9. Mucus sheen — elliptical specular patches
  const shine = [Math.min(255,r+100), Math.min(255,g+85), Math.min(255,b+75)]
  for (let i = 0; i < 18; i++) {
    const x = Math.random()*size, y = Math.random()*size
    const rx = 25+Math.random()*110, ry = 8+Math.random()*50
    ctx.save(); ctx.translate(x,y); ctx.rotate(Math.random()*Math.PI)
    const grd = ctx.createRadialGradient(0,0,0,0,0,rx)
    grd.addColorStop(0, `rgba(${shine},0.30)`)
    grd.addColorStop(0.5, `rgba(${shine},0.08)`)
    grd.addColorStop(1, `rgba(${shine},0)`)
    ctx.scale(1,ry/rx); ctx.fillStyle = grd
    ctx.beginPath(); ctx.arc(0,0,rx,0,Math.PI*2); ctx.fill()
    ctx.restore()
  }

  // 10. Mucus droplet highlights
  for (let i = 0; i < 90; i++) {
    const x = Math.random()*size, y = Math.random()*size
    const rad = 0.8 + Math.random()*8
    const grd = ctx.createRadialGradient(x,y,0,x,y,rad)
    grd.addColorStop(0, 'rgba(255,248,242,0.90)')
    grd.addColorStop(0.25, 'rgba(255,248,242,0.38)')
    grd.addColorStop(1, 'rgba(255,248,242,0)')
    ctx.fillStyle = grd; ctx.fillRect(x-rad,y-rad,rad*2,rad*2)
  }

  // 11. Crypt openings — microscopic dark pits
  const crypt = [Math.max(0,r-110), Math.max(0,g-55), Math.max(0,b-50)]
  for (let i = 0; i < 1800; i++) {
    const x = Math.random()*size, y = Math.random()*size
    ctx.beginPath(); ctx.arc(x,y,0.4+Math.random()*2.2,0,Math.PI*2)
    ctx.fillStyle = `rgba(${crypt},${0.08+Math.random()*0.30})`
    ctx.fill()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(5, 2.5); tex.anisotropy = 16
  return tex
}

function makeNormalMap(size = 1024) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#8080ff'; ctx.fillRect(0,0,size,size)
  // Large haustra wave undulation
  for (let i = 0; i < 70; i++) {
    const x = Math.random()*size, y = Math.random()*size, rad = 35+Math.random()*115
    const grd = ctx.createRadialGradient(x,y,0,x,y,rad)
    grd.addColorStop(0,'rgba(172,172,255,0.92)')
    grd.addColorStop(0.35,'rgba(148,148,255,0.52)')
    grd.addColorStop(0.7,'rgba(112,112,238,0.18)')
    grd.addColorStop(1,'rgba(128,128,255,0)')
    ctx.fillStyle=grd; ctx.fillRect(x-rad,y-rad,rad*2,rad*2)
  }
  // Medium folds
  for (let i = 0; i < 300; i++) {
    const x=Math.random()*size,y=Math.random()*size,rad=4+Math.random()*38
    const grd=ctx.createRadialGradient(x,y,0,x,y,rad)
    grd.addColorStop(0,'rgba(160,160,255,0.78)')
    grd.addColorStop(0.5,'rgba(108,108,232,0.28)')
    grd.addColorStop(1,'rgba(128,128,255,0)')
    ctx.fillStyle=grd; ctx.fillRect(x-rad,y-rad,rad*2,rad*2)
  }
  // Fine crypts
  for (let i = 0; i < 2500; i++) {
    const x=Math.random()*size,y=Math.random()*size,rad=0.8+Math.random()*4.5
    const grd=ctx.createRadialGradient(x,y,0,x,y,rad)
    grd.addColorStop(0,'rgba(162,162,255,0.62)')
    grd.addColorStop(1,'rgba(128,128,255,0)')
    ctx.fillStyle=grd; ctx.fillRect(x-rad,y-rad,rad*2,rad*2)
  }
  // Transverse fold ridges
  for (let i = 0; i < 50; i++) {
    const y=Math.random()*size, h=1.5+Math.random()*14
    const grd=ctx.createLinearGradient(0,y-h,0,y+h)
    grd.addColorStop(0,'rgba(172,172,255,0)')
    grd.addColorStop(0.5,'rgba(155,155,255,0.42)')
    grd.addColorStop(1,'rgba(172,172,255,0)')
    ctx.fillStyle=grd; ctx.fillRect(0,y-h,size,h*2)
  }
  const tex=new THREE.CanvasTexture(canvas)
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping; tex.repeat.set(5,2.5); tex.anisotropy=16
  return tex
}

function makeRoughnessMap(size=512) {
  const canvas=document.createElement('canvas')
  canvas.width=canvas.height=size
  const ctx=canvas.getContext('2d')
  ctx.fillStyle='#7e7e7e'; ctx.fillRect(0,0,size,size)
  // Wet glossy patches
  for (let i=0;i<45;i++) {
    const x=Math.random()*size,y=Math.random()*size,rad=12+Math.random()*75
    const grd=ctx.createRadialGradient(x,y,0,x,y,rad)
    grd.addColorStop(0,'rgba(18,18,18,0.72)')
    grd.addColorStop(0.5,'rgba(38,38,38,0.38)')
    grd.addColorStop(1,'rgba(126,126,126,0)')
    ctx.fillStyle=grd; ctx.fillRect(x-rad,y-rad,rad*2,rad*2)
  }
  // Dry bumpy patches
  for (let i=0;i<220;i++) {
    const x=Math.random()*size,y=Math.random()*size,rad=2+Math.random()*18
    ctx.beginPath(); ctx.arc(x,y,rad,0,Math.PI*2)
    ctx.fillStyle=`rgba(205,205,205,${0.08+Math.random()*0.22})`; ctx.fill()
  }
  const tex=new THREE.CanvasTexture(canvas)
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping; tex.repeat.set(5,2.5)
  return tex
}

// Shared texture instances
let _normalMap=null, _roughMap=null
const getNorm=()=>{ if(!_normalMap) _normalMap=makeNormalMap(); return _normalMap }
const getRough=()=>{ if(!_roughMap)  _roughMap=makeRoughnessMap(); return _roughMap }

// ────────────────────────────────────────────────────────────────
//  BLOOD PARTICLE SYSTEM
// ────────────────────────────────────────────────────────────────
class BloodSystem {
  constructor(scene) {
    this.scene = scene
    this.particles = []
    this.meshes = []
    this.active = false
    this.cutPoint = null
    this.cutNormal = null
    this._time = 0
    this._poolGeo = new THREE.SphereGeometry(1, 6, 6)
  }

  activate(point, normal) {
    this.active = true
    this.cutPoint = point.clone()
    this.cutNormal = normal.clone()
    this._time = 0
  }

  deactivate() {
    this.active = false
    this.meshes.forEach(m => this.scene.remove(m))
    this.meshes = []
    this.particles = []
  }

  update(dt) {
    if (!this.active) return
    this._time += dt

    // Spawn new blood droplets in pulses (simulating arterial spurts)
    const spawnRate = 8 + Math.sin(this._time * 4.2) * 5
    if (Math.random() < spawnRate * dt) {
      const spread = 0.12
      const vel = this.cutNormal.clone().negate()
        .addScaledVector(new THREE.Vector3(
          (Math.random()-0.5)*spread,
          (Math.random()-0.5)*spread,
          (Math.random()-0.5)*spread
        ), 1)
        .normalize()
        .multiplyScalar(0.4 + Math.random() * 0.8)

      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0.55 + Math.random()*0.05, 0.0, 0.0),
        roughness: 0.95, metalness: 0.0,
        emissive: new THREE.Color(0.18, 0.0, 0.0),
        emissiveIntensity: 0.8,
        transparent: true, opacity: 0.92
      })
      const mesh = new THREE.Mesh(this._poolGeo, mat)
      const s = 0.008 + Math.random() * 0.022
      mesh.scale.setScalar(s)
      mesh.position.copy(this.cutPoint)
      this.scene.add(mesh)
      this.meshes.push(mesh)
      this.particles.push({
        mesh, vel,
        life: 0, maxLife: 1.2 + Math.random() * 1.8,
        gravity: -0.15 - Math.random()*0.1,
        stuck: false
      })
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.life += dt
      if (p.life > p.maxLife) {
        this.scene.remove(p.mesh)
        p.mesh.material.dispose()
        this.meshes.splice(this.meshes.indexOf(p.mesh), 1)
        this.particles.splice(i, 1)
        continue
      }
      if (!p.stuck) {
        p.vel.y += p.gravity * dt
        p.mesh.position.addScaledVector(p.vel, dt)
        // Fade out near end of life
        const alpha = 1.0 - Math.max(0, (p.life - p.maxLife * 0.7) / (p.maxLife * 0.3))
        p.mesh.material.opacity = 0.92 * alpha
      }
    }

    // Pooling blood — flat disc that grows on the wall near cut
    if (this._time > 0.5 && !this._bloodPool) {
      const poolGeo = new THREE.CircleGeometry(0.001, 16)
      this._bloodPool = new THREE.Mesh(poolGeo, new THREE.MeshStandardMaterial({
        color: 0x660000, roughness: 0.95, transparent: true, opacity: 0.88,
        emissive: new THREE.Color(0.12,0,0)
      }))
      this._bloodPool.position.copy(this.cutPoint)
        .addScaledVector(this.cutNormal, 0.005)
      this._bloodPool.lookAt(this.cutPoint)
      this.scene.add(this._bloodPool)
    }
    if (this._bloodPool && this._time < 8) {
      const grow = Math.min(1, this._time / 6)
      this._bloodPool.scale.setScalar(0.001 + grow * 0.18)
    }
  }

  dispose() {
    this.deactivate()
    if (this._bloodPool) { this.scene.remove(this._bloodPool); this._bloodPool.geometry.dispose(); this._bloodPool.material.dispose() }
    this._poolGeo.dispose()
  }
}

// ────────────────────────────────────────────────────────────────
//  CAUTERIZE / HEALING EFFECT
// ────────────────────────────────────────────────────────────────
class CauterizeEffect {
  constructor(scene) {
    this.scene = scene
    this.effects = []
  }

  fire(point, normal) {
    // Laser beam ring — concentric rings expanding outward
    const rings = []
    for (let r = 0; r < 3; r++) {
      const geo = new THREE.TorusGeometry(0.001, 0.003, 8, 32)
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0.2, 1.0, 0.4),
        emissive: new THREE.Color(0.1, 0.8, 0.2),
        emissiveIntensity: 3.0,
        transparent: true, opacity: 0.95
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.copy(point).addScaledVector(normal, 0.02)
      mesh.lookAt(point)
      this.scene.add(mesh)
      rings.push({ mesh, delay: r * 0.08, mat })
    }

    // Char spot — dark burned tissue
    const charGeo = new THREE.CircleGeometry(0.04, 16)
    const charMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.08, 0.03, 0.02), roughness: 0.98,
      emissive: new THREE.Color(0.18, 0.06, 0.0), emissiveIntensity: 0.5,
      transparent: true, opacity: 0.0
    })
    const char = new THREE.Mesh(charGeo, charMat)
    char.position.copy(point).addScaledVector(normal, 0.008)
    char.lookAt(point)
    this.scene.add(char)

    // Light flash
    const light = new THREE.PointLight(0x44ff88, 0, 0.8)
    light.position.copy(point)
    this.scene.add(light)

    this.effects.push({ rings, char, charMat, light, time: 0, done: false })
  }

  update(dt) {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const e = this.effects[i]
      e.time += dt
      const t = e.time

      // Laser flash
      e.light.intensity = t < 0.15 ? (t / 0.15) * 6.0 : Math.max(0, 6.0 - (t - 0.15) / 0.2 * 6.0)

      // Rings expand outward
      e.rings.forEach((rd, ri) => {
        const rt = Math.max(0, t - rd.delay)
        if (rt > 0) {
          const scale = 1 + rt * 180
          rd.mesh.scale.setScalar(scale)
          rd.mat.opacity = Math.max(0, 0.95 - rt * 2.5)
          rd.mat.emissiveIntensity = Math.max(0, 3.0 - rt * 8)
        }
      })

      // Char mark fades in then persists
      e.charMat.opacity = Math.min(0.85, t * 4.0)

      // Clean up rings after 0.6s but keep char
      if (t > 0.6 && !e.ringsRemoved) {
        e.rings.forEach(rd => { this.scene.remove(rd.mesh); rd.mesh.geometry.dispose(); rd.mat.dispose() })
        e.rings.length = 0
        e.ringsRemoved = true
        this.scene.remove(e.light)
      }

      // Char fades out after 4s
      if (t > 3.5) e.charMat.opacity = Math.max(0, 0.85 - (t - 3.5) / 1.5 * 0.85)
      if (t > 5.0) {
        this.scene.remove(e.char); e.char.geometry.dispose(); e.charMat.dispose()
        e.done = true
      }
    }
    this.effects = this.effects.filter(e => !e.done)
  }

  dispose() {
    this.effects.forEach(e => {
      e.rings.forEach(r => { this.scene.remove(r.mesh); r.mesh.geometry.dispose(); r.mat.dispose() })
      this.scene.remove(e.char); e.char.geometry.dispose(); e.charMat.dispose()
      this.scene.remove(e.light)
    })
    this.effects = []
  }
}

// ────────────────────────────────────────────────────────────────
//  TUNNEL BUILDER
// ────────────────────────────────────────────────────────────────
function buildColonGeometry(scenario) {
  const group = new THREE.Group()

  const cfgMap = {
    healthy:   { tubeR: 0.82, color: [205, 88, 78],  folds: 28, foldDepth: 0.24, emissive: [0.030,0.004,0.003] },
    polyp:     { tubeR: 0.82, color: [182, 65, 58],  folds: 24, foldDepth: 0.22, emissive: [0.025,0.003,0.003] },
    bleed:     { tubeR: 0.82, color: [148, 30, 22],  folds: 21, foldDepth: 0.19, emissive: [0.038,0.0,  0.0  ] },
    stricture: { tubeR: 0.52, color: [168, 60, 52],  folds: 30, foldDepth: 0.17, emissive: [0.022,0.003,0.002] },
  }
  const cfg = cfgMap[scenario] || cfgMap.healthy

  const TUNNEL_LEN = 42, SEG = 140
  const pts = []
  for (let i = 0; i <= SEG; i++) {
    const t = i / SEG
    pts.push(new THREE.Vector3(
      Math.sin(t*Math.PI*3.4)*1.15 + Math.sin(t*7.3+1.1)*0.42,
      Math.cos(t*Math.PI*2.1)*0.75 + Math.cos(t*5.5+0.9)*0.28,
      -t*TUNNEL_LEN
    ))
  }
  const path = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5)

  // Main tube
  const mucosaTex = makeMucosaTexture(cfg.color)
  const normalTex = getNorm()
  const roughTex  = getRough()
  const tubeGeo   = new THREE.TubeGeometry(path, 220, cfg.tubeR, 24, false)
  const tubeMat   = new THREE.MeshStandardMaterial({
    map: mucosaTex, normalMap: normalTex, normalScale: new THREE.Vector2(2.0, 2.0),
    roughnessMap: roughTex, roughness: 0.50, metalness: 0.05,
    emissive: new THREE.Color(...cfg.emissive), emissiveIntensity: 1.0,
    side: THREE.BackSide, envMapIntensity: 0.25,
  })
  const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat)
  group.add(tubeMesh)

  // Haustra folds
  const foldColor = cfg.color.map(c => Math.max(0, c-20))
  const foldTex   = makeMucosaTexture(foldColor, 512)
  const foldMat   = new THREE.MeshStandardMaterial({
    map: foldTex, normalMap: normalTex, normalScale: new THREE.Vector2(1.6,1.6),
    roughnessMap: roughTex, roughness: 0.56, metalness: 0.04,
    emissive: new THREE.Color(...cfg.emissive), emissiveIntensity: 0.9,
    side: THREE.FrontSide,
  })
  for (let f = 0; f < cfg.folds; f++) {
    const t = 0.025 + (f / cfg.folds) * 0.95
    const pt = path.getPoint(t)
    const tan = path.getTangentAt(t).normalize()
    const up = new THREE.Vector3(0,1,0)
    const right = new THREE.Vector3().crossVectors(tan,up).normalize()
    const realUp = new THREE.Vector3().crossVectors(right,tan).normalize()
    const angle = (f * 2.399) % (Math.PI*2)
    const foldR = cfg.tubeR * 0.90
    const thick = cfg.foldDepth * (0.65 + Math.sin(f*1.7)*0.35)
    const arcA  = Math.PI * (0.60 + (f%4)*0.12)
    const fold  = new THREE.Mesh(new THREE.TorusGeometry(foldR,thick,10,18,arcA), foldMat)
    fold.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right,realUp,tan.clone().negate()))
    fold.rotateOnAxis(tan,angle)
    fold.position.copy(pt)
    group.add(fold)
  }

  // Mucus sheen inner layer
  const mucusGeo = new THREE.TubeGeometry(path,100,cfg.tubeR*0.965,14,false)
  const mucusMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(1.0,0.78,0.70), roughness: 0.03, metalness: 0.0,
    transparent: true, opacity: 0.055, side: THREE.BackSide,
  })
  group.add(new THREE.Mesh(mucusGeo,mucusMat))

  // Scenario features
  const damagedMeshes = []

  if (scenario === 'polyp') {
    for (let p = 0; p < 3; p++) {
      const t = 0.18 + p*0.22
      const pt = path.getPoint(t)
      const tan = path.getTangentAt(t).normalize()
      const up = new THREE.Vector3(0,1,0)
      const right = new THREE.Vector3().crossVectors(tan,up).normalize()
      const realUp = new THREE.Vector3().crossVectors(right,tan).normalize()
      const offset = right.clone().multiplyScalar(cfg.tubeR*0.60)
        .add(realUp.clone().multiplyScalar((p-1)*cfg.tubeR*0.28))
      if (p%2===0) {
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.016,0.026,0.12,10),
          new THREE.MeshStandardMaterial({color:0xb01818,roughness:0.55}))
        stalk.position.copy(pt).add(offset.clone().multiplyScalar(0.45))
        stalk.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), offset.clone().normalize())
        group.add(stalk)
      }
      const polyp = new THREE.Mesh(new THREE.SphereGeometry(0.09+p*0.04,16,16),
        new THREE.MeshStandardMaterial({
          map: makeMucosaTexture([205,28,22],256), roughness:0.38, metalness:0.06,
          emissive: new THREE.Color(0.30,0.01,0.0), emissiveIntensity:1.0,
        }))
      polyp.position.copy(pt).add(offset)
      polyp.userData.isDamaged = true
      polyp.userData.healColor = new THREE.Color(cfg.color[0]/255, cfg.color[1]/255, cfg.color[2]/255)
      group.add(polyp)
      damagedMeshes.push(polyp)
    }
  }

  if (scenario === 'bleed') {
    for (let b = 0; b < 14; b++) {
      const t = 0.06 + (b/14)*0.88
      const pt = path.getPoint(t)
      const tan = path.getTangentAt(t).normalize()
      const up = new THREE.Vector3(0,1,0)
      const right = new THREE.Vector3().crossVectors(tan,up).normalize()
      const realUp = new THREE.Vector3().crossVectors(right,tan).normalize()
      const dir = right.clone().multiplyScalar(Math.sin(b*1.3)*0.62*cfg.tubeR)
        .add(realUp.clone().multiplyScalar(Math.cos(b*2.1)*0.42*cfg.tubeR))
      dir.normalize().multiplyScalar(cfg.tubeR*0.74)
      const spot = new THREE.Mesh(new THREE.CircleGeometry(0.025+b%5*0.018,14),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(0.52,0.0,0.0), roughness:0.94,
          emissive: new THREE.Color(0.24,0.0,0.0), emissiveIntensity:1.0,
          transparent:true, opacity:0.92
        }))
      spot.position.copy(pt).add(dir); spot.lookAt(pt)
      spot.userData.isDamaged = true
      group.add(spot)
      damagedMeshes.push(spot)
    }
  }

  if (scenario === 'stricture') {
    for (let s = 0; s < 7; s++) {
      const t = 0.28 + s*0.045
      const pt = path.getPoint(t)
      const tan = path.getTangentAt(t).normalize()
      const up = new THREE.Vector3(0,1,0)
      const right = new THREE.Vector3().crossVectors(tan,up).normalize()
      const realUp = new THREE.Vector3().crossVectors(right,tan).normalize()
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(cfg.tubeR*(0.82+Math.sin(s*1.2)*0.07),0.030,10,24),
        new THREE.MeshStandardMaterial({
          map: makeMucosaTexture([128,48,40],256), roughness:0.80,
          emissive: new THREE.Color(0.10,0.01,0.0),
          transparent:true, opacity:0.92
        }))
      ring.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right,realUp,tan.clone().negate()))
      ring.position.copy(pt)
      ring.userData.isDamaged = true
      group.add(ring)
      damagedMeshes.push(ring)
    }
  }

  return { group, path, tubeR: cfg.tubeR, length: TUNNEL_LEN, damagedMeshes, tubeMesh }
}

// ────────────────────────────────────────────────────────────────
//  MAIN ENGINE CLASS
// ────────────────────────────────────────────────────────────────
export class EndoEngine {
  constructor(canvas) {
    this.canvas   = canvas
    this.yaw=0; this.pitch=0
    this.keys={}; this.locked=false
    this._bobTime=0; this._tPos=0.005
    this._path=null; this._tubeR=0.82; this._tunnelLen=42
    this._tunnelGroup=null; this._damagedMeshes=[]
    this.onLoadCallback=null
    this._currentScenario='healthy'
    this._currentMode='diagnostic'

    // Reset flash
    this._resetting=false; this._resetTimer=0; this._flashAlpha=0
    this._overlayCanvas=null; this._overlayCtx=null

    // Therapeutic mode
    this._raycaster=new THREE.Raycaster()
    this._healedMeshes=new Set()

    // Emergency mode
    this._emergencyActive=false
    this._emergencyTimer=0
    this._cutMesh=null
    this._bloodSystem=null
    this._cauterize=null

    this._initRenderer()
    this._initScene()
    this._initLights()
    this._bindEvents()
    this.resize()
    this._buildScenario('healthy')
    requestAnimationFrame(()=>this.onLoadCallback?.())
  }

  _initRenderer() {
    this.renderer=new THREE.WebGLRenderer({canvas:this.canvas,antialias:true})
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
    this.renderer.setClearColor(0x000000)
    this.renderer.outputEncoding=THREE.sRGBEncoding
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure=1.70
  }

  _initScene() {
    this.scene=new THREE.Scene()
    this.scene.fog=new THREE.FogExp2(0x180000,0.20)
    this.camera=new THREE.PerspectiveCamera(80,1,0.003,12)
  }

  _initLights() {
    // Primary endoscope spot
    this.endoLight=new THREE.SpotLight(0xfff8ee,8.5,3.5,Math.PI*0.40,0.48,1.9)
    this.scene.add(this.endoLight); this.scene.add(this.endoLight.target)

    // Warm backfill
    this.fillLight=new THREE.PointLight(0xff4010,1.3,2.0)
    this.scene.add(this.fillLight)

    // Orbiting rim lights
    this.rimA=new THREE.PointLight(0xff8850,0.65,1.3)
    this.rimB=new THREE.PointLight(0xff8850,0.65,1.3)
    this.scene.add(this.rimA); this.scene.add(this.rimB)

    // Deep ambient (tissue red glow)
    this.scene.add(new THREE.AmbientLight(0x220404,2.0))

    // Emergency blood-red fill (off by default)
    this.emergencyLight=new THREE.PointLight(0xff0000,0.0,3.0)
    this.scene.add(this.emergencyLight)
  }

  _ensureOverlay() {
    if (this._overlayCanvas) return
    const p=this.canvas.parentElement; if(!p) return
    if(getComputedStyle(p).position==='static') p.style.position='relative'
    this._overlayCanvas=document.createElement('canvas')
    this._overlayCtx=this._overlayCanvas.getContext('2d')
    this._overlayCanvas.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10;'
    p.appendChild(this._overlayCanvas)
    this._overlayCanvas.width=p.clientWidth; this._overlayCanvas.height=p.clientHeight
  }

  _drawOverlay(alpha, mode) {
    this._ensureOverlay()
    const ctx=this._overlayCtx
    const w=this._overlayCanvas.width, h=this._overlayCanvas.height
    ctx.clearRect(0,0,w,h)
    if (alpha>0.001) {
      if (mode==='emergency') {
        // Red flash for emergency cut event
        ctx.fillStyle=`rgba(180,0,0,${(alpha*0.7).toFixed(3)})`
        ctx.fillRect(0,0,w,h)
        if(alpha>0.92){
          ctx.fillStyle=`rgba(255,255,255,0.9)`
          ctx.font=`bold ${Math.round(h*0.038)}px monospace`
          ctx.textAlign='center'
          ctx.fillText('⚠ PERFORATION DETECTED — EMERGENCY PROTOCOL',w/2,h/2)
          ctx.font=`${Math.round(h*0.024)}px monospace`
          ctx.fillStyle='rgba(255,200,200,0.85)'
          ctx.fillText('ACTIVATE HAEMOSTASIS — USE THERAPEUTIC MODE TO TREAT',w/2,h/2+h*0.055)
        }
      } else {
        // White flash for tunnel reset
        ctx.fillStyle=`rgba(255,240,230,${alpha.toFixed(3)})`
        ctx.fillRect(0,0,w,h)
        if(alpha>0.95){
          ctx.fillStyle='rgba(80,20,10,0.85)'
          ctx.font=`bold ${Math.round(h*0.04)}px monospace`
          ctx.textAlign='center'
          ctx.fillText('RETURNING TO ENTRANCE...',w/2,h/2)
        }
      }
    }
  }

  // ── Therapeutic: cursor laser crosshair overlay ────────────────
  _drawLaserCursor(x, y, w, h, hovering) {
    this._ensureOverlay()
    const ctx=this._overlayCtx
    // Don't clear — drawOverlay already called. Draw on top.
    const col = hovering ? 'rgba(80,255,100,0.95)' : 'rgba(80,255,100,0.45)'
    const sz = hovering ? 20 : 14
    ctx.strokeStyle=col; ctx.lineWidth=hovering?1.5:1.0
    ctx.beginPath(); ctx.moveTo(x-sz,y); ctx.lineTo(x+sz,y); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x,y-sz); ctx.lineTo(x,y+sz); ctx.stroke()
    // Circle
    ctx.beginPath(); ctx.arc(x,y,hovering?12:8,0,Math.PI*2)
    ctx.strokeStyle=col; ctx.stroke()
    if(hovering){
      ctx.fillStyle='rgba(80,255,100,0.12)'; ctx.fill()
      ctx.fillStyle='rgba(80,255,100,0.9)'
      ctx.font='bold 11px monospace'; ctx.textAlign='center'
      ctx.fillText('CLICK TO CAUTERIZE',x,y-20)
    }
  }

  _buildScenario(scenarioId) {
    this._currentScenario=scenarioId
    if(this._tunnelGroup){
      this.scene.remove(this._tunnelGroup)
      this._tunnelGroup.traverse(c=>{
        c.geometry?.dispose()
        if(Array.isArray(c.material)) c.material.forEach(m=>m.dispose())
        else c.material?.dispose()
      })
    }
    this._healedMeshes.clear()
    this._stopEmergency()
    const{group,path,tubeR,length,damagedMeshes,tubeMesh}=buildColonGeometry(scenarioId)
    this._tunnelGroup=group; this._path=path; this._tubeR=tubeR; this._tunnelLen=length
    this._damagedMeshes=damagedMeshes; this._tubeMesh=tubeMesh
    this.scene.add(group)
    this._tPos=0.005; this.yaw=0; this.pitch=0
    this._resetting=false; this._resetTimer=0; this._flashAlpha=0

    // If emergency mode, trigger cut right away
    if (this._currentMode==='emergency') this._triggerEmergency()
  }

  _triggerEmergency() {
    if(this._emergencyActive||!this._path) return
    this._emergencyActive=true
    this._emergencyTimer=0

    // Place the cut a short distance ahead of camera
    const ct=Math.min(0.35, this._tPos+0.08)
    const pt=this._path.getPoint(ct)
    const tan=this._path.getTangentAt(ct).normalize()
    const up=new THREE.Vector3(0,1,0)
    const right=new THREE.Vector3().crossVectors(tan,up).normalize()
    // Offset to wall
    const wallPos=pt.clone().addScaledVector(right, this._tubeR*0.65)

    // Visual cut — elongated jagged plane on the wall
    const cutGeo=new THREE.PlaneGeometry(0.22,0.10,4,4)
    // Displace vertices for jagged look
    const pos=cutGeo.attributes.position
    for(let i=0;i<pos.count;i++){
      pos.setX(i,pos.getX(i)+(Math.random()-0.5)*0.03)
      pos.setY(i,pos.getY(i)+(Math.random()-0.5)*0.015)
    }
    pos.needsUpdate=true; cutGeo.computeVertexNormals()
    const cutMat=new THREE.MeshStandardMaterial({
      color:new THREE.Color(0.65,0.0,0.0), roughness:0.88,
      emissive:new THREE.Color(0.35,0.0,0.0), emissiveIntensity:1.5,
      transparent:true, opacity:0.95, side:THREE.DoubleSide
    })
    this._cutMesh=new THREE.Mesh(cutGeo,cutMat)
    this._cutMesh.position.copy(wallPos)
    this._cutMesh.lookAt(pt)
    this.scene.add(this._cutMesh)

    // Blood system
    this._bloodSystem=new BloodSystem(this.scene)
    this._bloodSystem.activate(wallPos, right.clone())

    // Cauterize effect system
    this._cauterize=new CauterizeEffect(this.scene)

    // Flash overlay
    this._emergencyFlash=1.0
  }

  _stopEmergency() {
    this._emergencyActive=false
    this._emergencyTimer=0
    if(this._cutMesh){ this.scene.remove(this._cutMesh); this._cutMesh.geometry.dispose(); this._cutMesh.material.dispose(); this._cutMesh=null }
    this._bloodSystem?.dispose(); this._bloodSystem=null
    this._cauterize?.dispose(); this._cauterize=null
    this._emergencyFlash=0
  }

  buildTunnel(scenarioId){ this._buildScenario(scenarioId) }

  setMode(mode){
    this._currentMode=mode
    if(mode==='emergency'&&!this._emergencyActive) this._triggerEmergency()
    if(mode!=='emergency') this._stopEmergency()
  }

  setIlluminance(pct){ this.endoLight.intensity=1.5+(pct/100)*9.0 }

  resize(){
    const p=this.canvas.parentElement; if(!p) return
    const w=p.clientWidth,h=p.clientHeight
    this.renderer.setSize(w,h,false)
    this.camera.aspect=w/h; this.camera.updateProjectionMatrix()
    if(this._overlayCanvas){ this._overlayCanvas.width=w; this._overlayCanvas.height=h }
  }

  // ── Main tick ─────────────────────────────────────────────────
  tick(dt, mode) {
    if(this._currentMode!==mode) this.setMode(mode)
    if(!this._path){ this.renderer.render(this.scene,this.camera); return 0 }

    const spd=mode==='emergency'?0.033:mode==='therapeutic'?0.018:0.015

    // ── Tunnel-end reset ──────────────────────────────────────
    if(this._resetting){
      this._resetTimer+=dt
      const FIN=0.35,HOL=0.70,FAD=0.75,TOT=FIN+HOL+FAD
      if(this._resetTimer<FIN) this._flashAlpha=this._resetTimer/FIN
      else if(this._resetTimer<FIN+HOL){ this._flashAlpha=1.0; this._tPos=0.005; this.yaw=0; this.pitch=0 }
      else if(this._resetTimer<TOT) this._flashAlpha=1.0-(this._resetTimer-FIN-HOL)/FAD
      else { this._resetting=false; this._resetTimer=0; this._flashAlpha=0 }
      this._drawOverlay(this._flashAlpha,'reset')
    } else { if(this._emergencyFlash>0){ this._emergencyFlash-=dt*1.2; this._drawOverlay(Math.max(0,this._emergencyFlash),'emergency') } else this._drawOverlay(0) }

    // ── Input ─────────────────────────────────────────────────
    let dT=0, moving=false
    if(!this._resetting){
      if(this.keys['KeyW']||this.keys['ArrowUp'])   {dT+=spd*dt;moving=true}
      if(this.keys['KeyS']||this.keys['ArrowDown']) {dT-=spd*dt;moving=true}
      const gp=navigator.getGamepads?.()[0]
      if(gp){
        const ly=Math.abs(gp.axes[1])>0.12?gp.axes[1]:0
        const rx=Math.abs(gp.axes[2])>0.12?gp.axes[2]:0
        const ry=Math.abs(gp.axes[3])>0.12?gp.axes[3]:0
        if(ly){dT-=ly*spd*dt;moving=true}
        this.yaw-=rx*0.045; this.pitch-=ry*0.035
      }
      if(this.keys['KeyA']||this.keys['ArrowLeft']) {this.yaw+=0.012;moving=true}
      if(this.keys['KeyD']||this.keys['ArrowRight']){this.yaw-=0.012;moving=true}
    }
    this._tPos=Math.max(0.001,this._tPos+dT)
    this.pitch=Math.max(-0.55,Math.min(0.55,this.pitch))
    this.yaw=Math.max(-0.78,Math.min(0.78,this.yaw))
    if(this._tPos>=0.985&&!this._resetting){
      this._tPos=0.985; this._resetting=true; this._resetTimer=0; this._flashAlpha=0
    }

    // ── Camera ───────────────────────────────────────────────
    const t=this._tPos
    const pos=this._path.getPoint(t)
    const tan=this._path.getTangentAt(t).normalize()
    this._bobTime+=dt*(moving?8:0.8)
    const bobAmt=moving?0.0035:0
    this.camera.position.copy(pos)
    const right=new THREE.Vector3().crossVectors(tan,new THREE.Vector3(0,1,0)).normalize()
    this.camera.position.addScaledVector(right,Math.sin(this._bobTime*0.5)*bobAmt)
    const up=new THREE.Vector3(0,1,0)
    const rR=new THREE.Vector3().crossVectors(tan,up).normalize()
    const rU=new THREE.Vector3().crossVectors(rR,tan).normalize()
    const bQ=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(rR,rU,tan.clone().negate()))
    const yQ=new THREE.Quaternion().setFromAxisAngle(rU,this.yaw)
    const pQ=new THREE.Quaternion().setFromAxisAngle(rR,this.pitch+Math.abs(Math.sin(this._bobTime))*bobAmt)
    this.camera.quaternion.copy(bQ).premultiply(yQ).premultiply(pQ)

    // ── Lights ───────────────────────────────────────────────
    this.endoLight.position.copy(pos)
    this.endoLight.target.position.copy(pos).addScaledVector(tan,1.8)
    this.endoLight.target.updateMatrixWorld()
    this.fillLight.position.copy(pos).addScaledVector(tan.clone().negate(),0.65)
    const ra=this._bobTime*0.3
    this.rimA.position.copy(pos).addScaledVector(rR,Math.cos(ra)*0.28).addScaledVector(rU,Math.sin(ra)*0.28).addScaledVector(tan,0.35)
    this.rimB.position.copy(pos).addScaledVector(rR,-Math.cos(ra)*0.28).addScaledVector(rU,-Math.sin(ra)*0.28).addScaledVector(tan,0.35)

    // Emergency pulsing red light
    if(this._emergencyActive){
      this.emergencyLight.position.copy(this._cutMesh?.position||pos)
      this.emergencyLight.intensity=1.5+Math.sin(this._emergencyTimer*6)*0.8
      this._emergencyTimer+=dt
    } else {
      this.emergencyLight.intensity=0
    }

    // ── Subsystems ───────────────────────────────────────────
    this._bloodSystem?.update(dt)
    this._cauterize?.update(dt)

    // ── Therapeutic raycasting (mouse hover) ──────────────────
    if(mode==='therapeutic'&&this._mousePos&&!this._resetting){
      this._raycaster.setFromCamera(this._mousePos,this.camera)
      const targets=this._damagedMeshes.filter(m=>!this._healedMeshes.has(m))
      const hits=this._raycaster.intersectObjects(targets,false)
      const hovering=hits.length>0

      // Draw laser cursor on overlay (after drawOverlay was called above)
      const w=this._overlayCanvas?.width||this.canvas.clientWidth
      const h=this._overlayCanvas?.height||this.canvas.clientHeight
      const mx=((this._mousePos.x+1)/2)*w
      const my=((-this._mousePos.y+1)/2)*h
      if(this._overlayCtx) this._drawLaserCursor(mx,my,w,h,hovering)

      this._hoveringHit=hovering?hits[0]:null
    } else {
      this._hoveringHit=null
    }

    this.renderer.render(this.scene,this.camera)
    return this._tPos*this._tunnelLen*1.2
  }

  // ── Therapeutic: heal a damaged mesh ─────────────────────────
  _healMesh(mesh) {
    if(this._healedMeshes.has(mesh)) return
    this._healedMeshes.add(mesh)

    // Fire cauterize visual at the mesh position
    const pt=mesh.position.clone()
    const normal=pt.clone().sub(this.camera.position).normalize()
    this._cauterize?.fire(pt, normal)

    // Animate the damaged mesh fading out (healed)
    const mat=mesh.material
    let t=0
    const origOpacity=mat.opacity??1
    const interval=setInterval(()=>{
      t+=0.05
      mat.transparent=true
      mat.opacity=Math.max(0,origOpacity*(1-t))
      if(t>=1){ clearInterval(interval); mesh.visible=false; mat.opacity=0 }
    },50)
  }

  destroy(){
    window.removeEventListener('resize',this._onResize)
    document.removeEventListener('keydown',this._onKeyDown)
    document.removeEventListener('keyup',this._onKeyUp)
    this.canvas.removeEventListener('click',this._onClick)
    this.canvas.removeEventListener('mousemove',this._onMouseMoveCanvas)
    document.removeEventListener('pointerlockchange',this._onLockChange)
    document.removeEventListener('mousemove',this._onMouseMove)
    this._stopEmergency()
    this._cauterize?.dispose()
    this._overlayCanvas?.remove()
    if(this._tunnelGroup){
      this.scene.remove(this._tunnelGroup)
      this._tunnelGroup.traverse(c=>{ c.geometry?.dispose(); c.material?.dispose() })
    }
    this.renderer.dispose()
  }

  _bindEvents(){
    this._mousePos=new THREE.Vector2(0,0)
    this._onResize=()=>this.resize()
    this._onKeyDown=e=>{ this.keys[e.code]=true }
    this._onKeyUp=e=>{ this.keys[e.code]=false }

    // Therapeutic click handler
    this._onClick=()=>{
      if(this._currentMode==='therapeutic'&&this._hoveringHit){
        this._healMesh(this._hoveringHit.object)
        return
      }
      this.canvas.requestPointerLock()
    }

    this._onMouseMoveCanvas=e=>{
      const rect=this.canvas.getBoundingClientRect()
      this._mousePos.x=((e.clientX-rect.left)/rect.width)*2-1
      this._mousePos.y=-((e.clientY-rect.top)/rect.height)*2+1
    }

    this._onLockChange=()=>{ this.locked=document.pointerLockElement===this.canvas }
    this._onMouseMove=e=>{
      if(!this.locked) return
      this.yaw-=e.movementX*0.0025
      this.pitch-=e.movementY*0.0025
      this.pitch=Math.max(-0.55,Math.min(0.55,this.pitch))
      this.yaw=Math.max(-0.78,Math.min(0.78,this.yaw))
    }

    window.addEventListener('resize',this._onResize)
    document.addEventListener('keydown',this._onKeyDown)
    document.addEventListener('keyup',this._onKeyUp)
    this.canvas.addEventListener('click',this._onClick)
    this.canvas.addEventListener('mousemove',this._onMouseMoveCanvas)
    document.addEventListener('pointerlockchange',this._onLockChange)
    document.addEventListener('mousemove',this._onMouseMove)
  }
}
