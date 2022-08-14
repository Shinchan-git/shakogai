let hasSaved = false

function setup() {
    frameRate(10)
    angleMode('degrees')
    createCanvas(windowWidth, windowHeight, SVG)
}

function draw() {
    background(255)
    noFill()

    saveSVGFile()
}

function saveSVGFile() {
    if (!hasSaved) {
        save("oosenchi_p5_canvas.svg")
        hasSaved = true
    }
}