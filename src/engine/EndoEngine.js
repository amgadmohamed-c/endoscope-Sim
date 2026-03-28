import * as THREE from 'three'

// ═══════════════════════════════════════════════════════════════════
//  ENDOSIM ENGINE v4  — Enhanced Realism Edition
//  Changes from v3:
//   • Layered mucosa texture with subsurface-scatter-like emissive
//   • Wet specular sheen layer with animated shimmer
//   • Blood system: viscous trailing, wall-sticking pooling, drip trails
//   • Hemorrhage streaks and pooling using canvas-rendered decals
//   • Cauterize: realistic char mark + steam wisps
//   • Normal map uses haustra-correct ridge profile
//   • Polyp: dysplastic coloring + surface nodularity
//   • Stricture: fibrotic ring coloring (pale/scarred tissue)
// ═══════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────
//  TEXTURE GENERATORS  (enhanced)
// ────────────────────────────────────────────────────────────────

function makeMucosaTexture(baseRGB, size = 1024) {
  const [r, g, b] = baseRGB
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')

  // 1. Deep submucosa base
  ctx.fillStyle = `rgb(${Math.max(0,r-90)},${Math.max(0,g-40)},${Math.max(0,b-35)})`
  ctx.fillRect(0, 0, size, size)

  // 2. Mucosal gradient — richer red, less uniform
  const radGrad = ctx.createRadialGradient(size*.48, size*.52, 0, size*.5, size*.5, size*.75)
  radGrad.addColorStop(0,   `rgba(${Math.min(255,r+12)},${g},${b},1)`)
  radGrad.addColorStop(0.4, `rgba(${r},${Math.max(0,g-8)},${Math.max(0,b-6)},0.96)`)
  radGrad.addColorStop(0.7, `rgba(${Math.max(0,r-22)},${Math.max(0,g-12)},${Math.max(0,b-10)},0.88)`)
  radGrad.addColorStop(1,   `rgba(${Math.max(0,r-55)},${Math.max(0,g-28)},${Math.max(0,b-24)},0.70)`)
  ctx.fillStyle = radGrad; ctx.fillRect(0,0,size,size)

  // 3. Longitudinal fold highlights — non-uniform width
  for (let i = 0; i < 10; i++) {
    const x = (i / 10) * size + (Math.random()-0.5)*40
    const w = 14 + Math.random() * 70
    const lg = ctx.createLinearGradient(x-w, 0, x+w, 0)
    lg.addColorStop(0, 'rgba(255,210,190,0)')
    lg.addColorStop(0.3, `rgba(${Math.min(255,r+40)},${Math.min(255,g+20)},${Math.min(255,b+16)},0.13)`)
    lg.addColorStop(0.5, `rgba(${Math.min(255,r+55)},${Math.min(255,g+28)},${Math.min(255,b+22)},0.08)`)
    lg.addColorStop(1, 'rgba(255,210,190,0)')
    ctx.fillStyle = lg; ctx.fillRect(x-w,0,w*2,size)
  }

  // 4. Haustra grooves — more organic, variable depth
  for (let i = 0; i < 18; i++) {
    const y = Math.random() * size
    const h = 5 + Math.random() * 28
    const depth = 0.3 + Math.random() * 0.55
    const lg = ctx.createLinearGradient(0,y-h,0,y+h)
    lg.addColorStop(0, 'rgba(0,0,0,0)')
    lg.addColorStop(0.35, `rgba(${Math.max(0,r-70)},${Math.max(0,g-35)},${Math.max(0,b-32)},${depth*0.7})`)
    lg.addColorStop(0.5, `rgba(${Math.max(0,r-95)},${Math.max(0,g-48)},${Math.max(0,b-44)},${depth})`)
    lg.addColorStop(0.65, `rgba(${Math.max(0,r-70)},${Math.max(0,g-35)},${Math.max(0,b-32)},${depth*0.7})`)
    lg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = lg; ctx.fillRect(0,y-h,size,h*2)
  }

  // 5. Submucosa depth variation — organic blotching
  const dark = [Math.max(0,r-75), Math.max(0,g-38), Math.max(0,b-34)]
  for (let i = 0; i < 800; i++) {
    const x = Math.random()*size, y = Math.random()*size
    const rad = 2 + Math.random()*65
    const a = 0.008 + Math.random()*0.085
    const grd = ctx.createRadialGradient(x,y,0,x,y,rad)
    grd.addColorStop(0, `rgba(${dark},${a+0.025})`)
    grd.addColorStop(0.6, `rgba(${dark},${a*0.5})`)
    grd.addColorStop(1, `rgba(${dark},0)`)
    ctx.fillStyle = grd; ctx.fillRect(x-rad,y-rad,rad*2,rad*2)
  }

  // 6. ENHANCED: Subsurface scatter simulation — warm red glow in mid-depth
  const ssr = [Math.min(255,r+35), Math.max(0,g-20), Math.max(0,b-25)]
  for (let i = 0; i < 55; i++) {
    const x = Math.random()*size, y = Math.random()*size
    const rad = 20 + Math.random()*85
    const a = 0.02 + Math.random()*0.055
    const grd = ctx.createRadialGradient(x,y,rad*0.3,x,y,rad)
    grd.addColorStop(0, `rgba(${ssr},0)`)
    grd.addColorStop(0.4, `rgba(${ssr},${a})`)
    grd.addColorStop(1, `rgba(${ssr},0)`)
    ctx.fillStyle = grd; ctx.fillRect(x-rad,y-rad,rad*2,rad*2)
  }

  // 7. Lighter glistening patches
  const lite = [Math.min(255,r+50), Math.min(255,g+28), Math.min(255,b+22)]
  for (let i = 0; i < 120; i++) {
    const x = Math.random()*size, y = Math.random()*size
    const rad = 4 + Math.random()*52
    const a = 0.008 + Math.random()*0.048
    const grd = ctx.createRadialGradient(x,y,0,x,y,rad)
    grd.addColorStop(0, `rgba(${lite},${a})`)
    grd.addColorStop(1, `rgba(${lite},0)`)
    ctx.fillStyle = grd; ctx.fillRect(x-rad,y-rad,rad*2,rad*2)
  }

  // 8. ENHANCED: Primary vascular network — more realistic branching
  const vein = [Math.max(0,r-100), Math.max(0,g-50), Math.max(0,b-48)]
  for (let v = 0; v < 32; v++) {
    const alpha = 0.18 + Math.random()*0.50
    const lw = 0.3 + Math.random()*4.5
    ctx.strokeStyle = `rgba(${vein},${alpha})`
    ctx.lineWidth = lw
    ctx.lineCap = 'round'
    ctx.beginPath()
    let px = Math.random()*size, py = Math.random()*size
    ctx.moveTo(px,py)
    let branches = 2 + Math.floor(Math.random()*3)
    for (let s = 0; s < 22; s++) {
      px += (Math.random()-0.5)*120; py += (Math.random()-0.5)*120
      ctx.quadraticCurveTo(px+(Math.random()-0.5)*65, py+(Math.random()-0.5)*65, px, py)
      // branch
      if (Math.random()<0.18 && branches>0) {
        branches--
        const bx = px+(Math.random()-0.5)*90, by = py+(Math.random()-0.5)*90
        ctx.save()
        ctx.lineWidth = lw*0.45
        ctx.strokeStyle = `rgba(${vein},${alpha*0.55})`
        ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(bx,by); ctx.stroke()
        ctx.restore()
      }
    }
    ctx.stroke()
  }

  // 9. Fine capillary network
  const cap = [Math.max(0,r-60), Math.max(0,g-28), Math.max(0,b-26)]
  for (let v = 0; v < 110; v++) {
    ctx.strokeStyle = `rgba(${cap},${0.06+Math.random()*0.14})`
    ctx.lineWidth = 0.1 + Math.random()*0.70
    ctx.beginPath()
    let px = Math.random()*size, py = Math.random()*size
    ctx.moveTo(px,py)
    for (let s = 0; s < 10; s++) {
      px += (Math.random()-0.5)*50; py += (Math.random()-0.5)*50; ctx.lineTo(px,py)
    }
    ctx.stroke()
  }

  // 10. ENHANCED: Mucus sheen — more elliptical, higher contrast
  const shine = [Math.min(255,r+110), Math.min(255,g+95), Math.min(255,b+85)]
  for (let i = 0; i < 22; i++) {
    const x = Math.random()*size, y = Math.random()*size
    const rx = 18+Math.random()*130, ry = 5+Math.random()*42
    ctx.save(); ctx.translate(x,y); ctx.rotate(Math.random()*Math.PI)
    const grd = ctx.createRadialGradient(0,0,0,0,0,rx)
    grd.addColorStop(0, `rgba(${shine},0.38)`)
    grd.addColorStop(0.3, `rgba(${shine},0.18)`)
    grd.addColorStop(0.7, `rgba(${shine},0.06)`)
    grd.addColorStop(1, `rgba(${shine},0)`)
    ctx.scale(1,ry/rx); ctx.fillStyle = grd
    ctx.beginPath(); ctx.arc(0,0,rx,0,Math.PI*2); ctx.fill()
    ctx.restore()
  }

  // 11. Mucus droplet highlights — slightly larger, more varied
  for (let i = 0; i < 120; i++) {
    const x = Math.random()*size, y = Math.random()*size
    const rad = 0.6 + Math.random()*10
    const grd = ctx.createRadialGradient(x-rad*0.2,y-rad*0.2,0,x,y,rad)
    grd.addColorStop(0, 'rgba(255,252,248,0.95)')
    grd.addColorStop(0.2, 'rgba(255,248,242,0.55)')
    grd.addColorStop(0.6, 'rgba(255,245,238,0.18)')
    grd.addColorStop(1, 'rgba(255,245,238,0)')
    ctx.fillStyle = grd; ctx.fillRect(x-rad,y-rad,rad*2,rad*2)
  }

  // 12. Crypt openings
  const crypt = [Math.max(0,r-120), Math.max(0,g-60), Math.max(0,b-55)]
  for (let i = 0; i < 2200; i++) {
    const x = Math.random()*size, y = Math.random()*size
    ctx.beginPath(); ctx.arc(x,y,0.3+Math.random()*2.5,0,Math.PI*2)
    ctx.fillStyle = `rgba(${crypt},${0.06+Math.random()*0.28})`; ctx.fill()
  }

  // 13. ENHANCED: Inflammation hotspots for diseased states
  if (r > 140) {
    for (let i = 0; i < 8; i++) {
      const x = Math.random()*size, y = Math.random()*size
      const rad = 30 + Math.random()*90
      const grd = ctx.createRadialGradient(x,y,0,x,y,rad)
      grd.addColorStop(0, `rgba(${Math.min(255,r+40)},${Math.max(0,g-30)},${Math.max(0,b-35)},0.18)`)
      grd.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grd; ctx.fillRect(x-rad,y-rad,rad*2,rad*2)
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(5, 2.5); tex.anisotropy = 16
  return tex
}

// ENHANCED: Normal map with realistic haustra ridge profiles
function makeNormalMap(size = 1024) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#8080ff'; ctx.fillRect(0,0,size,size)

  // Large haustra wave — sinusoidal ridge profile (not just radial blobs)
  for (let i = 0; i < 80; i++) {
    const x = Math.random()*size, y = Math.random()*size
    const rad = 28+Math.random()*125
    const intensity = 0.55 + Math.random()*0.40
    const grd = ctx.createRadialGradient(x,y,0,x,y,rad)
    grd.addColorStop(0,`rgba(${Math.round(128+55*intensity)},${Math.round(128+55*intensity)},255,0.95)`)
    grd.addColorStop(0.3,`rgba(${Math.round(128+30*intensity)},${Math.round(128+30*intensity)},255,0.55)`)
    grd.addColorStop(0.7,`rgba(${Math.round(128+10*intensity)},${Math.round(128+10*intensity)},245,0.18)`)
    grd.addColorStop(1,'rgba(128,128,255,0)')
    ctx.fillStyle=grd; ctx.fillRect(x-rad,y-rad,rad*2,rad*2)
  }

  // Haustra groove edges — sharp normal discontinuity
  for (let i = 0; i < 22; i++) {
    const y = Math.random()*size
    const h = 2 + Math.random()*10
    // Leading edge (bright = surface curving toward camera)
    const lg1 = ctx.createLinearGradient(0,y-h,0,y)
    lg1.addColorStop(0,'rgba(180,180,255,0)')
    lg1.addColorStop(1,'rgba(210,210,255,0.65)')
    ctx.fillStyle=lg1; ctx.fillRect(0,y-h,size,h)
    // Trailing edge (dark = surface curving away)
    const lg2 = ctx.createLinearGradient(0,y,0,y+h)
    lg2.addColorStop(0,'rgba(80,80,220,0.55)')
    lg2.addColorStop(1,'rgba(128,128,255,0)')
    ctx.fillStyle=lg2; ctx.fillRect(0,y,size,h)
  }

  // Medium crypt indentations
  for (let i = 0; i < 380; i++) {
    const x=Math.random()*size,y=Math.random()*size,rad=3+Math.random()*42
    const grd=ctx.createRadialGradient(x,y,0,x,y,rad)
    grd.addColorStop(0,'rgba(168,168,255,0.82)')
    grd.addColorStop(0.4,'rgba(145,145,255,0.35)')
    grd.addColorStop(1,'rgba(128,128,255,0)')
    ctx.fillStyle=grd; ctx.fillRect(x-rad,y-rad,rad*2,rad*2)
  }

  // Fine crypt pits
  for (let i = 0; i < 3200; i++) {
    const x=Math.random()*size,y=Math.random()*size,rad=0.5+Math.random()*4.0
    const grd=ctx.createRadialGradient(x,y,0,x,y,rad)
    grd.addColorStop(0,'rgba(165,165,255,0.72)')
    grd.addColorStop(1,'rgba(128,128,255,0)')
    ctx.fillStyle=grd; ctx.fillRect(x-rad,y-rad,rad*2,rad*2)
  }

  const tex=new THREE.CanvasTexture(canvas)
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping; tex.repeat.set(5,2.5); tex.anisotropy=16
  return tex
}

function makeRoughnessMap(size=512) {
  const canvas=document.createElement('canvas')
  canvas.width=canvas.height=size
  const ctx=canvas.getContext('2d')
  // Start medium-rough
  ctx.fillStyle='#7a7a7a'; ctx.fillRect(0,0,size,size)

  // Wet glossy streaks along haustra folds
  for (let i=0;i<18;i++) {
    const y=Math.random()*size, h=8+Math.random()*40
    const lg=ctx.createLinearGradient(0,y-h,0,y+h)
    lg.addColorStop(0,'rgba(18,18,18,0)')
    lg.addColorStop(0.5,'rgba(8,8,8,0.82)')
    lg.addColorStop(1,'rgba(18,18,18,0)')
    ctx.fillStyle=lg; ctx.fillRect(0,y-h,size,h*2)
  }

  // Wet pooling patches (very smooth)
  for (let i=0;i<55;i++) {
    const x=Math.random()*size,y=Math.random()*size,rad=8+Math.random()*80
    const grd=ctx.createRadialGradient(x,y,0,x,y,rad)
    grd.addColorStop(0,'rgba(12,12,12,0.75)')
    grd.addColorStop(0.4,'rgba(30,30,30,0.40)')
    grd.addColorStop(1,'rgba(120,120,120,0)')
    ctx.fillStyle=grd; ctx.fillRect(x-rad,y-rad,rad*2,rad*2)
  }

  // Dry bumpy patches (rough crypts)
  for (let i=0;i<280;i++) {
    const x=Math.random()*size,y=Math.random()*size,rad=1.5+Math.random()*16
    ctx.beginPath(); ctx.arc(x,y,rad,0,Math.PI*2)
    ctx.fillStyle=`rgba(215,215,215,${0.06+Math.random()*0.20})`; ctx.fill()
  }

  const tex=new THREE.CanvasTexture(canvas)
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping; tex.repeat.set(5,2.5)
  return tex
}

// ENHANCED: Animated sheen texture (for wet mucus layer)
function makeSheenTexture(size=256) {
  const canvas=document.createElement('canvas')
  canvas.width=canvas.height=size
  const ctx=canvas.getContext('2d')
  ctx.fillStyle='rgba(0,0,0,0)'; ctx.fillRect(0,0,size,size)
  for (let i=0;i<35;i++) {
    const x=Math.random()*size, y=Math.random()*size
    const rx=10+Math.random()*80, ry=3+Math.random()*30
    ctx.save(); ctx.translate(x,y); ctx.rotate(Math.random()*Math.PI*2)
    const grd=ctx.createRadialGradient(0,0,0,0,0,rx)
    grd.addColorStop(0,'rgba(255,252,248,0.55)')
    grd.addColorStop(0.4,'rgba(255,248,242,0.20)')
    grd.addColorStop(1,'rgba(255,248,242,0)')
    ctx.scale(1,ry/rx); ctx.fillStyle=grd
    ctx.beginPath(); ctx.arc(0,0,rx,0,Math.PI*2); ctx.fill()
    ctx.restore()
  }
  const tex=new THREE.CanvasTexture(canvas)
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping; tex.repeat.set(3,1.5)
  return tex
}

let _normalMap=null, _roughMap=null
const getNorm=()=>{ if(!_normalMap) _normalMap=makeNormalMap(); return _normalMap }
const getRough=()=>{ if(!_roughMap) _roughMap=makeRoughnessMap(); return _roughMap }

// ────────────────────────────────────────────────────────────────
//  ENHANCED BLOOD SYSTEM
//  Features: viscous trailing, wall-adherence, drip physics,
//            pooling decal that spreads realistically
// ────────────────────────────────────────────────────────────────
class BloodSystem {
  constructor(scene) {
    this.scene = scene
    this.particles = []
    this.trails = []       // viscous trail segments
    this.dripPaths = []    // drip streams following gravity
    this.active = false
    this.cutPoint = null
    this.cutNormal = null
    this._time = 0
    this._bloodPool = null
    this._poolRadius = 0.001
    this._hemoglobinColor = new THREE.Color(0.60, 0.00, 0.00)
    this._darkBloodColor  = new THREE.Color(0.38, 0.00, 0.00)

    // Pre-built geometry pool
    this._sphereGeo = new THREE.SphereGeometry(1, 8, 8)
    this._dripGeo   = new THREE.CylinderGeometry(0.5, 1, 1, 6)
  }

  _makeDrop(scale=1.0, pulsed=false) {
    const hue = pulsed ? 0.60 + Math.random()*0.06 : 0.50 + Math.random()*0.08
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hue, 0.0, 0.0),
      roughness: 0.90 + Math.random()*0.08,
      metalness: 0.02,
      emissive: new THREE.Color(hue*0.30, 0.0, 0.0),
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.95,
    })
    const mesh = new THREE.Mesh(this._sphereGeo, mat)
    const s = (0.006 + Math.random()*0.018) * scale
    mesh.scale.set(s, s * (1 + Math.random()*0.5), s)  // elongated drops
    return { mesh, mat }
  }

  activate(point, normal) {
    this.active = true
    this.cutPoint = point.clone()
    this.cutNormal = normal.clone()
    this._time = 0
    this._buildPool(point)
    this._buildDripStreams(point, normal)
  }

  _buildPool(point) {
    const geo = new THREE.CircleGeometry(0.001, 20)
    const mat = new THREE.MeshStandardMaterial({
      color: this._darkBloodColor,
      roughness: 0.88,
      metalness: 0.04,
      transparent: true,
      opacity: 0.0,
      emissive: new THREE.Color(0.18, 0.0, 0.0),
      emissiveIntensity: 0.4,
    })
    this._bloodPool = new THREE.Mesh(geo, mat)
    this._bloodPool.position.copy(point).addScaledVector(this.cutNormal, 0.006)
    this._bloodPool.lookAt(point)
    this.scene.add(this._bloodPool)
  }

  _buildDripStreams(point, normal) {
    // 2–3 gravity-following drip trails on the wall
    const count = 2 + Math.floor(Math.random()*2)
    for (let i=0; i<count; i++) {
      const len = 0.08 + Math.random()*0.22
      const startOffset = new THREE.Vector3(
        (Math.random()-0.5)*0.06, 0, (Math.random()-0.5)*0.06
      )
      this.dripPaths.push({
        start: point.clone().add(startOffset),
        normal: normal.clone(),
        len: 0,
        maxLen: len,
        width: 0.004 + Math.random()*0.006,
        segments: [],
        growing: true,
        life: 0,
      })
    }
  }

  deactivate() {
    this.active = false
    this.particles.forEach(p => { this.scene.remove(p.mesh); p.mat.dispose() })
    this.particles = []
    this.trails.forEach(t => { this.scene.remove(t.mesh); t.mat?.dispose() })
    this.trails = []
    this.dripPaths.forEach(d => {
      d.segments.forEach(s => { this.scene.remove(s.mesh); s.mat?.dispose() })
    })
    this.dripPaths = []
    if (this._bloodPool) { this.scene.remove(this._bloodPool); this._bloodPool.geometry.dispose(); this._bloodPool.material.dispose(); this._bloodPool = null }
  }

  update(dt) {
    if (!this.active) return
    this._time += dt

    // ── Arterial spurts — pulsed ejection rhythm ──────────────
    const heartRate = 1.2                          // ~72 bpm
    const pulse = Math.max(0, Math.sin(this._time * heartRate * Math.PI * 2))
    const spawnRate = 6 + pulse * 9                // 6–15 drops/s
    if (Math.random() < spawnRate * dt) {
      const { mesh, mat } = this._makeDrop(0.8 + pulse*0.5, pulse > 0.6)
      const spread = 0.08 + pulse * 0.06
      const vel = this.cutNormal.clone().negate()
        .addScaledVector(new THREE.Vector3(
          (Math.random()-0.5)*spread,
          (Math.random()-0.5)*spread,
          (Math.random()-0.5)*spread
        ), 1.2)
        .normalize()
        .multiplyScalar(0.30 + pulse * 0.55 + Math.random()*0.25)

      mesh.position.copy(this.cutPoint)
      this.scene.add(mesh)
      this.particles.push({
        mesh, mat, vel,
        life: 0, maxLife: 1.0 + Math.random()*1.6,
        gravity: -0.22 - Math.random()*0.12,
        viscosity: 0.85 + Math.random()*0.12,  // drag
        stuck: false, stuckTimer: 0,
        trailing: [],
      })
    }

    // ── Particle update ───────────────────────────────────────
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.life += dt

      if (p.life > p.maxLife) {
        this.scene.remove(p.mesh); p.mat.dispose()
        p.trailing.forEach(t => { this.scene.remove(t); t.geometry?.dispose(); t.material?.dispose() })
        this.particles.splice(i, 1)
        continue
      }

      if (!p.stuck) {
        // Viscous drag + gravity
        p.vel.y += p.gravity * dt
        p.vel.multiplyScalar(p.viscosity)
        const prev = p.mesh.position.clone()
        p.mesh.position.addScaledVector(p.vel, dt)

        // Wall-stick test — if moving very slowly, stick
        if (p.vel.length() < 0.06 && p.life > 0.3) {
          p.stuck = true
        }

        // Leave a trail segment every few ms
        if (Math.random() < 0.25) {
          const trailGeo = new THREE.SphereGeometry(p.mesh.scale.x * 0.55, 5, 5)
          const trailMat = new THREE.MeshStandardMaterial({
            color: this._darkBloodColor,
            roughness: 0.92, transparent: true, opacity: 0.65,
            emissive: new THREE.Color(0.10,0,0), emissiveIntensity: 0.3,
          })
          const trail = new THREE.Mesh(trailGeo, trailMat)
          trail.position.copy(prev)
          this.scene.add(trail)
          p.trailing.push(trail)
          this.trails.push({ mesh: trail, mat: trailMat, life: 0, maxLife: 3.5 })
        }

        // Fade near end of life
        const alpha = 1.0 - Math.max(0, (p.life - p.maxLife*0.65) / (p.maxLife*0.35))
        p.mat.opacity = 0.95 * alpha

      } else {
        // Stuck drip — slowly slide down
        p.stuckTimer += dt
        p.mesh.position.y -= 0.003 * dt
        p.mat.opacity = Math.max(0, 1.0 - (p.life / p.maxLife))
      }
    }

    // ── Trail fade ─────────────────────────────────────────────
    for (let i=this.trails.length-1; i>=0; i--) {
      const t=this.trails[i]
      t.life+=dt
      t.mat.opacity = Math.max(0, 0.65*(1-t.life/t.maxLife))
      if(t.life>t.maxLife){ this.scene.remove(t.mesh); t.mesh.geometry.dispose(); t.mat.dispose(); this.trails.splice(i,1) }
    }

    // ── Drip streams ──────────────────────────────────────────
    for (const drip of this.dripPaths) {
      drip.life += dt
      if (drip.growing && drip.len < drip.maxLen) {
        drip.len += dt * 0.045
        // Build a capsule segment at the drip tip
        const tipPos = drip.start.clone()
          .addScaledVector(new THREE.Vector3(0,-1,0), drip.len)  // gravity direction
        if (drip.segments.length === 0 || drip.len - drip.segments.length*0.015 > 0.015) {
          const sGeo = new THREE.SphereGeometry(drip.width, 6, 6)
          const sMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0.45+Math.random()*0.05, 0, 0),
            roughness: 0.88, metalness: 0.02, transparent: true, opacity: 0.88,
            emissive: new THREE.Color(0.12,0,0), emissiveIntensity: 0.5,
          })
          const sMesh = new THREE.Mesh(sGeo, sMat)
          sMesh.position.copy(tipPos)
          this.scene.add(sMesh)
          drip.segments.push({ mesh: sMesh, mat: sMat })
        }
      }
    }

    // ── Pooling blood — grows realistically ───────────────────
    if (this._bloodPool) {
      const targetOpacity = Math.min(0.90, this._time * 0.35)
      this._bloodPool.material.opacity += (targetOpacity - this._bloodPool.material.opacity) * 0.04
      this._poolRadius = Math.min(0.22, 0.001 + this._time * 0.008)
      this._bloodPool.scale.setScalar(this._poolRadius)

      // Make it slightly irregular over time using scale x/z
      this._bloodPool.scale.x = this._poolRadius * (1 + Math.sin(this._time*0.4)*0.12)
      this._bloodPool.scale.z = this._poolRadius * (1 + Math.cos(this._time*0.6)*0.08)
    }
  }

  dispose() {
    this.deactivate()
    this._sphereGeo.dispose()
    this._dripGeo.dispose()
  }
}

// ────────────────────────────────────────────────────────────────
//  ENHANCED CAUTERIZE EFFECT
//  Adds: steam wisps, char gradation, spark burst
// ────────────────────────────────────────────────────────────────
class CauterizeEffect {
  constructor(scene) {
    this.scene = scene
    this.effects = []
  }

  fire(point, normal) {
    // Laser beam — expanding torus rings
    const rings = []
    for (let r = 0; r < 4; r++) {
      const geo = new THREE.TorusGeometry(0.001, 0.0025, 8, 36)
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0.15, 1.0, 0.35),
        emissive: new THREE.Color(0.08, 0.85, 0.20),
        emissiveIntensity: 3.5,
        transparent: true, opacity: 0.98,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.copy(point).addScaledVector(normal, 0.018)
      mesh.lookAt(point)
      this.scene.add(mesh)
      rings.push({ mesh, delay: r * 0.07, mat })
    }

    // Char spot — dark necrotic tissue with gradient
    const charGeo = new THREE.CircleGeometry(0.045, 20)
    const charMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.05, 0.015, 0.01),
      roughness: 0.99,
      emissive: new THREE.Color(0.22, 0.07, 0.0),
      emissiveIntensity: 0.6,
      transparent: true, opacity: 0.0,
    })
    const char = new THREE.Mesh(charGeo, charMat)
    char.position.copy(point).addScaledVector(normal, 0.007)
    char.lookAt(point)
    this.scene.add(char)

    // Peripheral erythema ring (red rim around char)
    const rimGeo = new THREE.RingGeometry(0.045, 0.075, 20)
    const rimMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.65, 0.05, 0.02),
      roughness: 0.85,
      transparent: true, opacity: 0.0,
      emissive: new THREE.Color(0.30, 0.02, 0.0), emissiveIntensity: 0.5,
    })
    const rim = new THREE.Mesh(rimGeo, rimMat)
    rim.position.copy(point).addScaledVector(normal, 0.006)
    rim.lookAt(point)
    this.scene.add(rim)

    // Steam wisps — small rising particles
    const steam = []
    for (let s=0; s<8; s++) {
      const sGeo = new THREE.SphereGeometry(0.005+Math.random()*0.006, 5, 5)
      const sMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0.85,0.85,0.85),
        transparent: true, opacity: 0.0,
        emissive: new THREE.Color(0.2,0.2,0.2), emissiveIntensity: 0.3,
      })
      const sMesh = new THREE.Mesh(sGeo, sMat)
      sMesh.position.copy(point).addScaledVector(normal, 0.01)
      this.scene.add(sMesh)
      steam.push({
        mesh: sMesh, mat: sMat,
        vel: new THREE.Vector3(
          (Math.random()-0.5)*0.05,
          0.04+Math.random()*0.08,
          (Math.random()-0.5)*0.05
        ),
        delay: Math.random()*0.15, life: 0, maxLife: 0.8+Math.random()*0.5
      })
    }

    // Spark burst particles
    const sparks = []
    for (let k=0; k<14; k++) {
      const sparkGeo = new THREE.SphereGeometry(0.002, 4, 4)
      const sparkMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(1.0, 0.85, 0.2),
        emissive: new THREE.Color(1.0, 0.7, 0.1), emissiveIntensity: 5,
        transparent: true, opacity: 0.95,
      })
      const sparkMesh = new THREE.Mesh(sparkGeo, sparkMat)
      sparkMesh.position.copy(point)
      this.scene.add(sparkMesh)
      sparks.push({
        mesh: sparkMesh, mat: sparkMat,
        vel: new THREE.Vector3(
          (Math.random()-0.5)*0.6,
          (Math.random()-0.5)*0.6,
          (Math.random()-0.5)*0.6
        ).normalize().multiplyScalar(0.3+Math.random()*0.8),
        life: 0, maxLife: 0.15+Math.random()*0.25,
      })
    }

    // Light flash
    const light = new THREE.PointLight(0x44ff88, 0, 1.0)
    light.position.copy(point)
    this.scene.add(light)

    this.effects.push({ rings, char, charMat, rim, rimMat, light, steam, sparks, time: 0, done: false })
  }

  update(dt) {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const e = this.effects[i]
      e.time += dt
      const t = e.time

      // Laser flash
      e.light.intensity = t < 0.12 ? (t/0.12)*7.0 : Math.max(0, 7.0-(t-0.12)/0.18*7.0)

      // Rings expand
      e.rings.forEach((rd, ri) => {
        const rt = Math.max(0, t - rd.delay)
        if (rt > 0) {
          rd.mesh.scale.setScalar(1 + rt * 220)
          rd.mat.opacity = Math.max(0, 0.98 - rt * 3.0)
          rd.mat.emissiveIntensity = Math.max(0, 3.5 - rt * 10)
        }
      })

      // Char + rim fade in
      e.charMat.opacity = Math.min(0.88, t * 5.0)
      e.rimMat.opacity  = Math.min(0.65, t * 4.0)

      // Steam wisps
      for (const s of e.steam) {
        const st = Math.max(0, t - s.delay)
        if (st > 0) {
          s.mesh.position.addScaledVector(s.vel, dt)
          s.vel.multiplyScalar(0.96)
          const phase = st / s.maxLife
          s.mat.opacity = phase < 0.3 ? phase/0.3*0.40 : Math.max(0, 0.40*(1-(phase-0.3)/0.7))
          s.mesh.scale.setScalar(1 + st * 3)
        }
      }

      // Sparks
      for (const sp of e.sparks) {
        sp.life += dt
        sp.vel.y -= 0.8 * dt
        sp.mesh.position.addScaledVector(sp.vel, dt)
        sp.mat.opacity = Math.max(0, 0.95*(1-sp.life/sp.maxLife))
        sp.mat.emissiveIntensity = Math.max(0, 5*(1-sp.life/sp.maxLife))
      }

      // Cleanup rings
      if (t > 0.55 && !e.ringsRemoved) {
        e.rings.forEach(rd => { this.scene.remove(rd.mesh); rd.mesh.geometry.dispose(); rd.mat.dispose() })
        e.rings.length = 0
        e.ringsRemoved = true
        this.scene.remove(e.light)
      }

      // Cleanup sparks
      if (t > 0.5 && !e.sparksRemoved) {
        e.sparks.forEach(sp => { this.scene.remove(sp.mesh); sp.mesh.geometry.dispose(); sp.mat.dispose() })
        e.sparks.length = 0
        e.sparksRemoved = true
      }

      // Cleanup steam
      if (t > 1.2 && !e.steamRemoved) {
        e.steam.forEach(s => { this.scene.remove(s.mesh); s.mesh.geometry.dispose(); s.mat.dispose() })
        e.steam.length = 0
        e.steamRemoved = true
      }

      // Char + rim fade out after 4s
      if (t > 3.8) {
        const fade = Math.max(0, 1-(t-3.8)/1.8)
        e.charMat.opacity = 0.88*fade
        e.rimMat.opacity  = 0.65*fade
      }
      if (t > 5.6) {
        this.scene.remove(e.char); e.char.geometry.dispose(); e.charMat.dispose()
        this.scene.remove(e.rim);  e.rim.geometry.dispose();  e.rimMat.dispose()
        e.done = true
      }
    }
    this.effects = this.effects.filter(e => !e.done)
  }

  dispose() {
    this.effects.forEach(e => {
      e.rings.forEach(r => { this.scene.remove(r.mesh); r.mesh.geometry.dispose(); r.mat.dispose() })
      this.scene.remove(e.char); e.char.geometry.dispose(); e.charMat.dispose()
      this.scene.remove(e.rim);  e.rim.geometry.dispose();  e.rimMat.dispose()
      e.steam.forEach(s => { this.scene.remove(s.mesh); s.mesh.geometry.dispose(); s.mat.dispose() })
      e.sparks.forEach(sp=>{ this.scene.remove(sp.mesh); sp.mesh.geometry.dispose(); sp.mat.dispose() })
      this.scene.remove(e.light)
    })
    this.effects = []
  }
}

// ────────────────────────────────────────────────────────────────
//  TUNNEL BUILDER (enhanced scenario features)
// ────────────────────────────────────────────────────────────────
function buildColonGeometry(scenario) {
  const group = new THREE.Group()

  const cfgMap = {
    healthy:   { tubeR: 0.82, color: [205, 88, 78],  folds: 28, foldDepth: 0.24, emissive: [0.030,0.004,0.003] },
    polyp:     { tubeR: 0.82, color: [195, 60, 52],  folds: 24, foldDepth: 0.22, emissive: [0.035,0.002,0.002] },
    bleed:     { tubeR: 0.82, color: [148, 28, 18],  folds: 21, foldDepth: 0.19, emissive: [0.048,0.0,  0.0  ] },
    stricture: { tubeR: 0.52, color: [162, 55, 48],  folds: 30, foldDepth: 0.17, emissive: [0.022,0.003,0.002] },
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
  const tubeGeo   = new THREE.TubeGeometry(path, 220, cfg.tubeR, 26, false)
  const tubeMat   = new THREE.MeshStandardMaterial({
    map: mucosaTex,
    normalMap: normalTex, normalScale: new THREE.Vector2(2.2, 2.2),
    roughnessMap: roughTex, roughness: 0.45, metalness: 0.04,
    emissive: new THREE.Color(...cfg.emissive), emissiveIntensity: 1.0,
    side: THREE.BackSide, envMapIntensity: 0.30,
  })
  const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat)
  group.add(tubeMesh)

  // Haustra folds — deeper color contrast
  const foldColor = cfg.color.map(c => Math.max(0, c-28))
  const foldTex   = makeMucosaTexture(foldColor, 512)
  const foldMat   = new THREE.MeshStandardMaterial({
    map: foldTex, normalMap: normalTex, normalScale: new THREE.Vector2(1.8,1.8),
    roughnessMap: roughTex, roughness: 0.52, metalness: 0.03,
    emissive: new THREE.Color(...cfg.emissive), emissiveIntensity: 0.85,
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
    const thick = cfg.foldDepth * (0.62 + Math.sin(f*1.7)*0.38)
    const arcA  = Math.PI * (0.58 + (f%4)*0.14)
    const fold  = new THREE.Mesh(new THREE.TorusGeometry(foldR,thick,12,20,arcA), foldMat)
    fold.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right,realUp,tan.clone().negate()))
    fold.rotateOnAxis(tan,angle)
    fold.position.copy(pt)
    group.add(fold)
  }

  // ENHANCED: Animated wet mucus layer — thin specular sheen
  const mucusGeo = new THREE.TubeGeometry(path,100,cfg.tubeR*0.962,14,false)
  const mucusTex = makeSheenTexture()
  const mucusMat = new THREE.MeshStandardMaterial({
    map: mucusTex,
    color: new THREE.Color(1.0,0.80,0.72),
    roughness: 0.02, metalness: 0.0,
    transparent: true, opacity: 0.062, side: THREE.BackSide,
  })
  group.add(new THREE.Mesh(mucusGeo, mucusMat))

  // ── Scenario features ─────────────────────────────────────────
  const damagedMeshes = []

  if (scenario === 'polyp') {
    // ENHANCED: dysplastic coloring + surface nodularity
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
        // Stalk — paler, fibrotic
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.014,0.024,0.14,10),
          new THREE.MeshStandardMaterial({
            color: new THREE.Color(0.55, 0.12, 0.08),
            roughness: 0.70, metalness: 0.02,
            emissive: new THREE.Color(0.10,0.01,0.0), emissiveIntensity: 0.5,
          }))
        stalk.position.copy(pt).add(offset.clone().multiplyScalar(0.45))
        stalk.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), offset.clone().normalize())
        group.add(stalk)
      }

      // Polyp head — dysplastic red, nodular surface
      const polypSize = 0.085 + p*0.045
      const polyp = new THREE.Mesh(
        new THREE.SphereGeometry(polypSize, 18, 18),
        new THREE.MeshStandardMaterial({
          map: makeMucosaTexture([215, 25, 18], 256),
          normalMap: normalTex, normalScale: new THREE.Vector2(3.0, 3.0),
          roughness: 0.35, metalness: 0.05,
          emissive: new THREE.Color(0.38, 0.01, 0.0), emissiveIntensity: 1.2,
        })
      )
      polyp.position.copy(pt).add(offset)
      polyp.userData.isDamaged = true
      polyp.userData.healColor = new THREE.Color(cfg.color[0]/255, cfg.color[1]/255, cfg.color[2]/255)
      group.add(polyp)
      damagedMeshes.push(polyp)

      // Surface nodules (small bumps on polyp)
      for (let n=0; n<5; n++) {
        const nGeo = new THREE.SphereGeometry(polypSize*0.20, 8, 8)
        const nMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0.68, 0.05, 0.02),
          roughness: 0.38, emissive: new THREE.Color(0.22,0.0,0.0), emissiveIntensity: 0.8,
        })
        const nMesh = new THREE.Mesh(nGeo, nMat)
        const theta = (n/5)*Math.PI*2, phi = Math.random()*Math.PI*0.7
        nMesh.position.copy(polyp.position).add(new THREE.Vector3(
          Math.sin(phi)*Math.cos(theta)*polypSize*0.88,
          Math.sin(phi)*Math.sin(theta)*polypSize*0.88,
          Math.cos(phi)*polypSize*0.88,
        ))
        group.add(nMesh)
      }
    }
  }

  if (scenario === 'bleed') {
    // ENHANCED: hemorrhagic spots + active ooze streaks
    for (let b = 0; b < 18; b++) {
      const t = 0.04 + (b/18)*0.90
      const pt = path.getPoint(t)
      const tan = path.getTangentAt(t).normalize()
      const up = new THREE.Vector3(0,1,0)
      const right = new THREE.Vector3().crossVectors(tan,up).normalize()
      const realUp = new THREE.Vector3().crossVectors(right,tan).normalize()
      const dir = right.clone().multiplyScalar(Math.sin(b*1.3)*0.62*cfg.tubeR)
        .add(realUp.clone().multiplyScalar(Math.cos(b*2.1)*0.42*cfg.tubeR))
      dir.normalize().multiplyScalar(cfg.tubeR*0.74)

      // Main hemorrhage spot
      const spotSize = 0.018 + b%5*0.020
      const spot = new THREE.Mesh(new THREE.CircleGeometry(spotSize, 16),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(0.54, 0.0, 0.0),
          roughness: 0.92, metalness: 0.02,
          emissive: new THREE.Color(0.28, 0.0, 0.0), emissiveIntensity: 1.1,
          transparent: true, opacity: 0.95,
        }))
      spot.position.copy(pt).add(dir); spot.lookAt(pt)
      spot.userData.isDamaged = true
      group.add(spot)
      damagedMeshes.push(spot)

      // Surrounding mucosal erythema halo
      const halo = new THREE.Mesh(new THREE.RingGeometry(spotSize, spotSize*2.5, 16),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(0.68, 0.04, 0.02),
          roughness: 0.82, transparent: true, opacity: 0.50,
          emissive: new THREE.Color(0.18,0.0,0.0), emissiveIntensity: 0.6,
        }))
      halo.position.copy(pt).add(dir).addScaledVector(dir.clone().normalize(), 0.002)
      halo.lookAt(pt)
      group.add(halo)

      // Gravity drip streaks below bleed sites (every 3rd spot)
      if (b%3===0) {
        const dripLen = 0.02 + Math.random()*0.08
        const dripGeo = new THREE.PlaneGeometry(spotSize*0.4, dripLen)
        const dripMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0.42,0.0,0.0),
          roughness: 0.94, transparent: true, opacity: 0.70,
          emissive: new THREE.Color(0.12,0,0), emissiveIntensity: 0.4,
        })
        const drip = new THREE.Mesh(dripGeo, dripMat)
        drip.position.copy(pt).add(dir).add(new THREE.Vector3(0,-dripLen/2,0))
        drip.lookAt(pt)
        group.add(drip)
      }
    }
  }

  if (scenario === 'stricture') {
    // ENHANCED: fibrotic rings — pale/scarred tissue coloring
    for (let s = 0; s < 7; s++) {
      const t = 0.28 + s*0.045
      const pt = path.getPoint(t)
      const tan = path.getTangentAt(t).normalize()
      const up = new THREE.Vector3(0,1,0)
      const right = new THREE.Vector3().crossVectors(tan,up).normalize()
      const realUp = new THREE.Vector3().crossVectors(right,tan).normalize()

      // Fibrotic ring — whitish-grey, scarred
      const fibR = cfg.tubeR*(0.80+Math.sin(s*1.2)*0.08)
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(fibR, 0.032, 10, 26),
        new THREE.MeshStandardMaterial({
          // Fibrotic tissue is pale, almost grey-white
          map: makeMucosaTexture([155, 105, 95], 256),
          normalMap: normalTex, normalScale: new THREE.Vector2(1.2, 1.2),
          roughness: 0.85, metalness: 0.01,
          emissive: new THREE.Color(0.05, 0.015, 0.01),
          transparent: true, opacity: 0.94,
        })
      )
      ring.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right,realUp,tan.clone().negate()))
      ring.position.copy(pt)
      ring.userData.isDamaged = true
      group.add(ring)
      damagedMeshes.push(ring)

      // Adhesion bands between rings
      if (s < 6) {
        const t2 = 0.28 + (s+0.5)*0.045
        const pt2 = path.getPoint(t2)
        const bandGeo = new THREE.CylinderGeometry(0.010, 0.008, 0.035, 6)
        const bandMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0.58, 0.38, 0.32),
          roughness: 0.88,
        })
        const band = new THREE.Mesh(bandGeo, bandMat)
        band.position.copy(pt2).addScaledVector(right, fibR*0.80)
        group.add(band)
      }
    }
  }

  return { group, path, tubeR: cfg.tubeR, length: TUNNEL_LEN, damagedMeshes, tubeMesh }
}

// ────────────────────────────────────────────────────────────────
//  MAIN ENGINE CLASS  (same public API as v3)
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

    this._resetting=false; this._resetTimer=0; this._flashAlpha=0
    this._overlayCanvas=null; this._overlayCtx=null

    this._raycaster=new THREE.Raycaster()
    this._healedMeshes=new Set()

    this._emergencyActive=false
    this._emergencyTimer=0
    this._cutMesh=null
    this._bloodSystem=null
    this._cauterize=null
    this._emergencyFlash=0

    // Mucus sheen animation time
    this._sheenTime=0

    this._initRenderer()
    this._initScene()
    this._initLights()
    this._bindEvents()
    this.resize()
    this._buildScenario('healthy')
    requestAnimationFrame(()=>this.onLoadCallback?.())
  }

  _initRenderer() {
    this.renderer=new THREE.WebGLRenderer({canvas:this.canvas,antialias:true,alpha:false})
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
    this.renderer.setClearColor(0x000000)
    this.renderer.outputEncoding=THREE.sRGBEncoding
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure=1.75
  }

  _initScene() {
    this.scene=new THREE.Scene()
    this.scene.fog=new THREE.FogExp2(0x1a0000,0.22)
    this.camera=new THREE.PerspectiveCamera(82,1,0.003,12)
  }

  _initLights() {
    // Primary endoscope spot — slightly warmer
    this.endoLight=new THREE.SpotLight(0xfff5e8,9.0,3.8,Math.PI*0.42,0.50,2.0)
    this.scene.add(this.endoLight); this.scene.add(this.endoLight.target)

    // Warm backfill
    this.fillLight=new THREE.PointLight(0xff3800,1.5,2.2)
    this.scene.add(this.fillLight)

    // Orbiting rim lights — asymmetric for realism
    this.rimA=new THREE.PointLight(0xff8040,0.70,1.4)
    this.rimB=new THREE.PointLight(0xff6028,0.55,1.2)
    this.scene.add(this.rimA); this.scene.add(this.rimB)

    // Tissue ambient
    this.scene.add(new THREE.AmbientLight(0x280505,2.2))

    // Emergency blood-red fill
    this.emergencyLight=new THREE.PointLight(0xff0000,0.0,3.5)
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
        ctx.fillStyle=`rgba(180,0,0,${(alpha*0.72).toFixed(3)})`
        ctx.fillRect(0,0,w,h)
        if(alpha>0.90){
          ctx.fillStyle=`rgba(255,255,255,0.92)`
          ctx.font=`bold ${Math.round(h*0.038)}px monospace`
          ctx.textAlign='center'
          ctx.fillText('⚠ PERFORATION DETECTED — EMERGENCY PROTOCOL',w/2,h/2)
          ctx.font=`${Math.round(h*0.024)}px monospace`
          ctx.fillStyle='rgba(255,200,200,0.85)'
          ctx.fillText('ACTIVATE HAEMOSTASIS — USE THERAPEUTIC MODE TO TREAT',w/2,h/2+h*0.055)
        }
      } else {
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

  _drawLaserCursor(x, y, w, h, hovering) {
    this._ensureOverlay()
    const ctx=this._overlayCtx
    const col = hovering ? 'rgba(80,255,100,0.96)' : 'rgba(80,255,100,0.48)'
    const sz = hovering ? 22 : 14
    ctx.strokeStyle=col; ctx.lineWidth=hovering?1.8:1.0
    ctx.beginPath(); ctx.moveTo(x-sz,y); ctx.lineTo(x+sz,y); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x,y-sz); ctx.lineTo(x,y+sz); ctx.stroke()
    ctx.beginPath(); ctx.arc(x,y,hovering?13:8,0,Math.PI*2)
    ctx.strokeStyle=col; ctx.stroke()
    if(hovering){
      ctx.fillStyle='rgba(80,255,100,0.10)'; ctx.fill()
      ctx.fillStyle='rgba(80,255,100,0.92)'
      ctx.font='bold 11px monospace'; ctx.textAlign='center'
      ctx.fillText('CLICK TO CAUTERIZE',x,y-22)
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
    if (this._currentMode==='emergency') this._triggerEmergency()
  }

  _triggerEmergency() {
    if(this._emergencyActive||!this._path) return
    this._emergencyActive=true; this._emergencyTimer=0
    const ct=Math.min(0.35, this._tPos+0.08)
    const pt=this._path.getPoint(ct)
    const tan=this._path.getTangentAt(ct).normalize()
    const up=new THREE.Vector3(0,1,0)
    const right=new THREE.Vector3().crossVectors(tan,up).normalize()
    const wallPos=pt.clone().addScaledVector(right, this._tubeR*0.65)

    // ENHANCED: jagged cut with more geometry points
    const cutGeo=new THREE.PlaneGeometry(0.26,0.12,6,6)
    const pos=cutGeo.attributes.position
    for(let i=0;i<pos.count;i++){
      pos.setX(i,pos.getX(i)+(Math.random()-0.5)*0.038)
      pos.setY(i,pos.getY(i)+(Math.random()-0.5)*0.020)
    }
    pos.needsUpdate=true; cutGeo.computeVertexNormals()
    const cutMat=new THREE.MeshStandardMaterial({
      color:new THREE.Color(0.68,0.0,0.0), roughness:0.86,
      emissive:new THREE.Color(0.40,0.0,0.0), emissiveIntensity:1.8,
      transparent:true, opacity:0.96, side:THREE.DoubleSide,
    })
    this._cutMesh=new THREE.Mesh(cutGeo,cutMat)
    this._cutMesh.position.copy(wallPos)
    this._cutMesh.lookAt(pt)
    this.scene.add(this._cutMesh)

    // Perilesional tissue discoloration ring
    const periGeo=new THREE.RingGeometry(0.12,0.24,24)
    const periMat=new THREE.MeshStandardMaterial({
      color:new THREE.Color(0.50,0.02,0.01), roughness:0.88,
      transparent:true, opacity:0.55,
      emissive:new THREE.Color(0.22,0.0,0.0), emissiveIntensity:0.7,
    })
    this._periMesh=new THREE.Mesh(periGeo,periMat)
    this._periMesh.position.copy(wallPos).addScaledVector(right,0.008)
    this._periMesh.lookAt(pt)
    this.scene.add(this._periMesh)

    this._bloodSystem=new BloodSystem(this.scene)
    this._bloodSystem.activate(wallPos, right.clone())
    this._cauterize=new CauterizeEffect(this.scene)
    this._emergencyFlash=1.0
  }

  _stopEmergency() {
    this._emergencyActive=false; this._emergencyTimer=0
    if(this._cutMesh){ this.scene.remove(this._cutMesh); this._cutMesh.geometry.dispose(); this._cutMesh.material.dispose(); this._cutMesh=null }
    if(this._periMesh){ this.scene.remove(this._periMesh); this._periMesh.geometry.dispose(); this._periMesh.material.dispose(); this._periMesh=null }
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
  setIlluminance(pct){ this.endoLight.intensity=1.5+(pct/100)*9.5 }

  resize(){
    const p=this.canvas.parentElement; if(!p) return
    const w=p.clientWidth,h=p.clientHeight
    this.renderer.setSize(w,h,false)
    this.camera.aspect=w/h; this.camera.updateProjectionMatrix()
    if(this._overlayCanvas){ this._overlayCanvas.width=w; this._overlayCanvas.height=h }
  }

  tick(dt, mode) {
    if(this._currentMode!==mode) this.setMode(mode)
    if(!this._path){ this.renderer.render(this.scene,this.camera); return 0 }

    // Animate mucus sheen UV offset
    this._sheenTime += dt * 0.018
    if(this._tubeMesh?.material?.map) {
      this._tubeMesh.material.map.offset.x = this._sheenTime
    }

    const spd=mode==='emergency'?0.033:mode==='therapeutic'?0.018:0.015

    if(this._resetting){
      this._resetTimer+=dt
      const FIN=0.35,HOL=0.70,FAD=0.75,TOT=FIN+HOL+FAD
      if(this._resetTimer<FIN) this._flashAlpha=this._resetTimer/FIN
      else if(this._resetTimer<FIN+HOL){ this._flashAlpha=1.0; this._tPos=0.005; this.yaw=0; this.pitch=0 }
      else if(this._resetTimer<TOT) this._flashAlpha=1.0-(this._resetTimer-FIN-HOL)/FAD
      else { this._resetting=false; this._resetTimer=0; this._flashAlpha=0 }
      this._drawOverlay(this._flashAlpha,'reset')
    } else {
      if(this._emergencyFlash>0){ this._emergencyFlash-=dt*1.2; this._drawOverlay(Math.max(0,this._emergencyFlash),'emergency') }
      else this._drawOverlay(0)
    }

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

    this.endoLight.position.copy(pos)
    this.endoLight.target.position.copy(pos).addScaledVector(tan,1.8)
    this.endoLight.target.updateMatrixWorld()
    this.fillLight.position.copy(pos).addScaledVector(tan.clone().negate(),0.65)
    const ra=this._bobTime*0.3
    this.rimA.position.copy(pos).addScaledVector(rR,Math.cos(ra)*0.30).addScaledVector(rU,Math.sin(ra)*0.30).addScaledVector(tan,0.38)
    this.rimB.position.copy(pos).addScaledVector(rR,-Math.cos(ra)*0.28).addScaledVector(rU,-Math.sin(ra)*0.28).addScaledVector(tan,0.32)

    if(this._emergencyActive){
      this.emergencyLight.position.copy(this._cutMesh?.position||pos)
      // Pulsed red light synchronized with blood heartbeat
      const heartPulse = Math.max(0, Math.sin(this._emergencyTimer * 1.2 * Math.PI * 2))
      this.emergencyLight.intensity=1.2+heartPulse*1.2
      this._emergencyTimer+=dt
    } else {
      this.emergencyLight.intensity=0
    }

    this._bloodSystem?.update(dt)
    this._cauterize?.update(dt)

    if(mode==='therapeutic'&&this._mousePos&&!this._resetting){
      this._raycaster.setFromCamera(this._mousePos,this.camera)
      const targets=this._damagedMeshes.filter(m=>!this._healedMeshes.has(m))
      const hits=this._raycaster.intersectObjects(targets,false)
      const hovering=hits.length>0
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

  _healMesh(mesh) {
    // Guard — already healed or mid-fade
    if(this._healedMeshes.has(mesh)) return
    this._healedMeshes.add(mesh)

    // Remove from raycaster targets IMMEDIATELY so it can't be hit again
    const idx = this._damagedMeshes.indexOf(mesh)
    if(idx !== -1) this._damagedMeshes.splice(idx, 1)

    // Clear the therapeutic hover so the cursor resets right away
    this._hoveringHit = null

    // Fire cauterize visual at the mesh world position
    const pt     = mesh.position.clone()
    const normal = pt.clone().sub(this.camera.position).normalize()
    this._cauterize?.fire(pt, normal)

    // Smooth fade-out via RAF (~600 ms)
    const mat         = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
    const origOpacity = mat.opacity ?? 1
    mat.transparent   = true
    let elapsed       = 0
    const DURATION    = 0.6

    const fade = () => {
      elapsed += 0.016
      const progress = Math.min(1, elapsed / DURATION)
      mat.opacity = origOpacity * (1 - progress)
      if(progress < 1) {
        requestAnimationFrame(fade)
      } else {
        mesh.visible = false
        mat.opacity  = 0
      }
    }
    requestAnimationFrame(fade)
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
    this._onClick=()=>{
      if(this._currentMode==='therapeutic'&&this._hoveringHit){
        this._healMesh(this._hoveringHit.object); return
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
      this.yaw-=e.movementX*0.0025; this.pitch-=e.movementY*0.0025
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