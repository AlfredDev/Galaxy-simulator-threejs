import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { AdditiveBlending, Float32BufferAttribute } from 'three'



const textureLoader = new THREE.TextureLoader()
const shape = textureLoader.load('/1.png')

const canvas = document.querySelector('canvas.cv')

const scene = new THREE.Scene()


const parameters = {}

parameters.count = 90000
parameters.size = 0.01
parameters.radius = 7
parameters.branches = 6
parameters.spin = 1
parameters.randomness = 0.3
parameters.randomnessPower = 9
parameters.stars = 999
parameters.starColor = '#01baef'
parameters.insideColor = '#ff2e00'
parameters.outsideColor = '#3b28cc'

let bgStarsGeometry = null
let bgStarsMaterial = null
let bgStars = null

function generateBgStars() {

    if (bgStars !== null) {
        bgStarsGeometry.dispose()
        bgStarsMaterial.dispose()
        scene.remove(bgStars)
    }

    bgStarsGeometry = new THREE.BufferGeometry()
    const bgStarsPositions = new Float32Array(parameters.stars * 3)

    for (let j = 0; j < parameters.stars; j++) {
        bgStarsPositions[j * 3 + 0] = (Math.random() - 0.5) * 20
        bgStarsPositions[j * 3 + 1] = (Math.random() - 0.5) * 20
        bgStarsPositions[j * 3 + 2] = (Math.random() - 0.5) * 20
    }

    bgStarsGeometry.setAttribute('position', new THREE.BufferAttribute(bgStarsPositions, 3))

    bgStarsMaterial = new THREE.PointsMaterial({
        color: 'white',
        size: parameters.size,
        depthWrite: false,
        sizeAttenuation: true,
        blending: AdditiveBlending,
        color: parameters.starColor,
        transparent: true,
        alphaMap: shape
    })

    bgStars = new THREE.Points(bgStarsGeometry, bgStarsMaterial)

    scene.add(bgStars)
}

generateBgStars()



let geometry = null
let material = null
let points = null


function generateGalaxy() {

    if (points !== null) {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for (let i = 0; i < parameters.count; i++) {

        const x = Math.random() * parameters.radius
        const branchAngle = (i % parameters.branches) / parameters.branches * 2 * Math.PI
        const spinAngle = x * parameters.spin

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)

        positions[i * 3] = Math.sin(branchAngle + spinAngle) * x + randomX
        positions[i * 3 + 1] = randomY
        positions[i * 3 + 2] = Math.cos(branchAngle + spinAngle) * x + randomZ


        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, x / parameters.radius)

        colors[i * 3 + 0] = mixedColor.r
        colors[i * 3 + 1] = mixedColor.g
        colors[i * 3 + 2] = mixedColor.b
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    material = new THREE.PointsMaterial({
        color: 'white',
        size: parameters.size,
        depthWrite: false,
        sizeAttenuation: true,
        blending: AdditiveBlending,
        vertexColors: true,
        transparent: true,
        alphaMap: shape
    })

    points = new THREE.Points(geometry, material)
    scene.add(points)


}

generateGalaxy()


const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    points.rotation.y = elapsedTime * 0.3
    bgStars.rotation.y = - elapsedTime * 0.05

    controls.update()

    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()