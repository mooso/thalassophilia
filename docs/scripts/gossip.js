// Import the Rust WASM module for pherogoose
import init from './pherogoose_pkg/pherogoose.js';
import { UniformCult, PrimaryColor } from './pherogoose_pkg/pherogoose.js';

const CELL_SIZE = 10;
const WIDTH = 40;
const HEIGHT = 40;
const WATCHERS = WIDTH * HEIGHT;
const FANOUT = 20;
const unifrom_table = document.getElementById("uniform-gossip");

// Convert a color from the Rust wasm u32 representation to a CSS web color.
function toColor(num) {
    const b = num & 0xFF,
        g = (num & 0xFF00) >>> 8,
        r = (num & 0xFF0000) >>> 16;
    return "rgb(" + [r, g, b].join(",") + ")";
}

// Toggle the color in the gossip network.
function toggleColor(toggle, primaryColor, cult) {
    // Choose a random watcher to start the change with.
    let inspiredWatcher = Math.floor(Math.random() * WATCHERS);
    if (toggle) {
        cult.remove_color(inspiredWatcher, primaryColor);
        return false;
    } else {
        cult.add_color(inspiredWatcher, primaryColor);
        return true;
    }
}

// Gets a watcher index for a given row/column in the grid we display the watchers in.
function getIndex(row, column) {
    return row * WIDTH + column;
};

// Simulate the goose watcher cult
function simulate(wasm, table, cult) {
    // Get the canvas for the cult and set its size.
    let canvas = table.querySelector('#gossip-canvas');
    canvas.width = (CELL_SIZE + 1) * WIDTH + 1;
    canvas.height = (CELL_SIZE + 1) * HEIGHT + 1;

    // Hook up the toggle buttons
    let blue = false;
    let green = false;
    let red = false;
    table.querySelector('#blue').onclick = () => {
        blue = toggleColor(blue, PrimaryColor.Blue, cult);
    };
    table.querySelector('#green').onclick = () => {
        green = toggleColor(green, PrimaryColor.Green, cult);
    };
    table.querySelector('#red').onclick = () => {
        red = toggleColor(red, PrimaryColor.Red, cult);
    };

    // Get the context for the canvas
    const ctx = canvas.getContext('2d');

    // Function for drawing the watchers with the colors they know.
    const drawCells = () => {
        const colorsPtr = cult.colors();
        const colors = new Uint32Array(wasm.memory.buffer, colorsPtr, WIDTH * HEIGHT);

        ctx.beginPath();

        for (let row = 0; row < HEIGHT; row++) {
            for (let col = 0; col < WIDTH; col++) {
                const idx = getIndex(row, col);

                ctx.fillStyle = toColor(colors[idx]);
                ctx.fillRect(col * (CELL_SIZE + 1) + 1, row * (CELL_SIZE + 1) + 1, CELL_SIZE, CELL_SIZE);
            }
        }

        ctx.stroke();
    };

    // The render loop
    // TODO: Set an animation speed
    // TODO: When the gossip network is idle, stop requesting animation frame
    const renderLoop = () => {
        cult.tick();

        drawCells();
        requestAnimationFrame(renderLoop);
    };

    drawCells();
    requestAnimationFrame(renderLoop);
}

function run(wasm) {
    const cult = UniformCult.new(WATCHERS, FANOUT);
    simulate(wasm, unifrom_table, cult);
}

init().then(run)
