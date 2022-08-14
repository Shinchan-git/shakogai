let hasSaved = false

const SHOW_ANCHOR_POINTS = false
const SHOW_MAX_CONTROLL_POINTS = false
const SHOW_MAX_CONTROLL_POINT_LINE = false
const SHOW_CONTROLL_POINTS = false

const ORIGIN_X = 0
const ORIGIN_Y = 0
const AXES_COUNT = 5
const MAX_ANGLE = 180
// const AXES_COUNT = 10
// const MAX_ANGLE = 360
const MOUNTAIN_VALLEY_DIFFERENCE_RATE = 8
const MAX_CONTROLL_LENGTH_RATE = 20
const CONTROLL_POINT_INSET_RATE = 12
const MIDCONTROLL_POINT_INSET_PERCENT = 0.7

function setup() {
    frameRate(10)
    angleMode('degrees')
    createCanvas(windowWidth, windowHeight, SVG)
}

function draw() {
    background(255)
    noFill()

    drawShakogai()
    // saveSVGFile()
}

function drawShakogai() {
    translate(width / 2, height - 10)
    // translate(width / 2, height / 2)
    const origin = createVector(ORIGIN_X, ORIGIN_Y)

    const axisMaxPoints = axisAnchorPoints(800)
    for (let i = 0; i < axisMaxPoints.length; i++) {
        noFill()
        stroke(0)
        line(origin.x, origin.y, axisMaxPoints[i].x, axisMaxPoints[i].y)
    }

    drawWavyCurve(700)
    drawWavyCurve(690)
    drawWavyCurve(400)
    drawWavyCurve(390)
    drawWavyCurve(200)
    drawWavyCurve(190)
}

function drawWavyCurve(length) {
    //Anchor Points
    const mountainPointsA = mountainPoints(length)
    const valleyPointsA = valleyPoints(length - length / MOUNTAIN_VALLEY_DIFFERENCE_RATE)
    const mountainAndValleyPointsA = arrayMargedInTerns(mountainPointsA, valleyPointsA)
    //Max Controll Points
    let maxControllPointsA = []
    for (let i = 0; i < mountainAndValleyPointsA.length; i++) {
        const set = pointsVerticallyCrossSet(mountainAndValleyPointsA[i], length / MAX_CONTROLL_LENGTH_RATE)
        if (mountainAndValleyPointsA[i].x < ORIGIN_X) {
            maxControllPointsA.push(...[set[1], set[0]])
        } else {
            maxControllPointsA.push(...[set[0], set[1]])
        }
    }
    //Mid Points
    const midPointsA = Array(mountainAndValleyPointsA.length - 1).fill().map((_, index) => {
        return midPoint(maxControllPointsA[index * 2 + 1], maxControllPointsA[index * 2 + 2])
    })
    //Controll Points
    let controllPointsA = []
    for (let i = 0; i < mountainAndValleyPointsA.length; i++) {
        const set = pointsVerticallyCrossSet(mountainAndValleyPointsA[i], length / MAX_CONTROLL_LENGTH_RATE - length / CONTROLL_POINT_INSET_RATE)
        if (mountainAndValleyPointsA[i].x < ORIGIN_X) {
            controllPointsA.push(...[set[1], set[0]])
        } else {
            controllPointsA.push(...[set[0], set[1]])
        }
    }
    let controllPointsB = []
    for (let i = 0; i < midPointsA.length * 2; i++) {
        const point = pointOffset(midPointsA[Math.floor(i / 2)], maxControllPointsA[i + 1])
        controllPointsB.push(point)
    }
    //Bezier
    for (let i = 0; i < midPointsA.length * 2; i++) {
        const isEven = i % 2 === 0
        const anchorStart = isEven ? mountainAndValleyPointsA[Math.floor(i / 2)] : midPointsA[Math.floor(i / 2)]
        const controllStart = isEven ? controllPointsA[i] : controllPointsB[i]
        const controllEnd = isEven ? controllPointsB[i] : controllPointsA[i + 2]
        const anchorEnd = isEven ? midPointsA[Math.floor(i / 2)] : mountainAndValleyPointsA[Math.floor(i / 2) + 1]
        bezier(anchorStart.x, anchorStart.y, controllStart.x, controllStart.y, controllEnd.x, controllEnd.y, anchorEnd.x, anchorEnd.y)
    }

    //Draw Anchor Points
    if (SHOW_ANCHOR_POINTS) {
        for (let i = 0; i < mountainPointsA.length; i++) {
            noStroke()
            fill(255, 0, 0)
            circle(mountainPointsA[i].x, mountainPointsA[i].y, 10)
        }
        for (let i = 0; i < valleyPointsA.length; i++) {
            noStroke()
            fill(0, 0, 255)
            circle(valleyPointsA[i].x, valleyPointsA[i].y, 10)
        }
        for (let i = 0; i < midPointsA.length; i++) {
            noStroke()
            fill(0, 255, 0)
            circle(midPointsA[i].x, midPointsA[i].y, 10)
        }
    }
    //Draw Max Controll Points
    if (SHOW_MAX_CONTROLL_POINTS) {
        for (let i = 0; i < maxControllPointsA.length; i++) {
            if (i % 2 === 0) {
                noStroke()
                fill(0)
            } else {
                stroke(0)
                noFill()
            }
            circle(maxControllPointsA[i].x, maxControllPointsA[i].y, 6)
        }
    }
    //Draw Max Controll Point Lines
    if (SHOW_MAX_CONTROLL_POINT_LINE) {
        for (let i = 0; i < maxControllPointsA.length - 1; i++) {
            line(maxControllPointsA[i].x, maxControllPointsA[i].y, maxControllPointsA[i + 1].x, maxControllPointsA[i + 1].y)
        }
    }
    //Draw Controll Points
    if (SHOW_CONTROLL_POINTS) {
        for (let i = 0; i < controllPointsA.length; i++) {
            if (i % 2 === 0) {
                noStroke()
                fill(0)
            } else {
                stroke(0)
                noFill()
            }
            circle(controllPointsA[i].x, controllPointsA[i].y, 6)
        }
        for (let i = 0; i < controllPointsB.length; i++) {
            if (i % 2 === 0) {
                noStroke()
                fill(150, 150, 0)
            } else {
                stroke(150, 150, 0)
                noFill()
            }
            circle(controllPointsB[i].x, controllPointsB[i].y, 6)
        }
    }
}

function axisAnchorPoints(lineLength) {
    const eachAngle = MAX_ANGLE / (AXES_COUNT + 0.5)
    const anchorPoints = Array(AXES_COUNT + 2).fill().map((_, index) => {
        if (index === AXES_COUNT + 1) {
            const x = cos(- eachAngle * (index - 0.5)) * lineLength
            const y = sin(- eachAngle * (index - 0.5)) * lineLength
            return createVector(x, y)
        } else {
            const x = cos(- eachAngle * index) * lineLength
            const y = sin(- eachAngle * index) * lineLength
            return createVector(x, y)
        }
    })
    return anchorPoints
}

function mountainPoints(lineLength) {
    const eachAngle = MAX_ANGLE / (AXES_COUNT + 0.5)
    const anchorPoints = Array(AXES_COUNT + 1).fill().map((_, index) => {
        const x = cos(- eachAngle * index) * lineLength
        const y = sin(- eachAngle * index) * lineLength
        return createVector(x, y)
    })
    return anchorPoints
}

function valleyPoints(lineLength) {
    const eachAngle = MAX_ANGLE / (AXES_COUNT + 0.5)
    const anchorPoints = Array(AXES_COUNT + 1).fill().map((_, index) => {
        const x = cos(- eachAngle * (index + 0.5)) * lineLength
        const y = sin(- eachAngle * (index + 0.5)) * lineLength
        return createVector(x, y)
    })
    return anchorPoints
}

function arrayMargedInTerns(a, b) {
    let marged = []
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
        if (a[i]) {
            marged.push(a[i])
        }
        if (b[i]) {
            marged.push(b[i])
        }
    }
    return marged
}

function midPoint(a, b) {
    return createVector((a.x + b.x) / 2, (a.y + b.y) / 2)
}

function pointsVerticallyCrossSet(vector, length) {
    const theta = atan(vector.y / vector.x)
    const shiftX = cos(theta + 90) * length
    const shiftY = sin(theta + 90) * length
    return [createVector(vector.x + shiftX, vector.y + shiftY), createVector(vector.x - shiftX, vector.y - shiftY)]
}

function pointOffset(vectorCenter, vectorMaxLength) {
    const x = vectorCenter.x + (vectorMaxLength.x - vectorCenter.x) * MIDCONTROLL_POINT_INSET_PERCENT
    const y = vectorCenter.y + (vectorMaxLength.y - vectorCenter.y) * MIDCONTROLL_POINT_INSET_PERCENT
    return createVector(x, y)
}

function saveSVGFile() {
    if (!hasSaved) {
        save("p5_canvas.svg")
        hasSaved = true
    }
}