// Import the Rust WASM module for polygon-park
import init from './polygon_park_pkg/polygon_park_wasm.js';
import { WasmPark } from './polygon_park_pkg/polygon_park_wasm.js';

// Convert a color from the Rust wasm u32 representation to a CSS web color.
function toColor(num) {
    const b = num & 0xFF,
        g = (num & 0xFF00) >>> 8,
        r = (num & 0xFF0000) >>> 16;
    return "rgb(" + [r, g, b].join(",") + ")";
}

function render(canvas, park) {
    let ctx = canvas.getContext('2d');
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let num_polygons = park.num_polygons();
    for (let polygon = 0; polygon < num_polygons; polygon++) {
        let num_vertices = park.num_vertices(polygon);
        let color = park.polygon_color(polygon);
        ctx.beginPath();
        ctx.fillStyle = toColor(color);
        let first_x = park.vertix_x(polygon, 0);
        let first_y = park.vertix_y(polygon, 0);
        ctx.moveTo(first_x, first_y);
        for (let vertex = 1; vertex < num_vertices; vertex++) {
            ctx.lineTo(park.vertix_x(polygon, vertex), park.vertix_y(polygon, vertex));
        }
        ctx.lineTo(first_x, first_y);
        ctx.fill();
    }
}

function run(wasm) {
    const park_table = document.getElementById("polygon-park");
    const canvas = park_table.querySelector('#park-canvas');
    let park = WasmPark.new(canvas.clientWidth, canvas.clientHeight);
    render(canvas, park);
    let start_button = park_table.querySelector('#start-reset');
    start_button.onclick = () => {
        // TODO: Change the button to stop/reset and change its onclick
        let last_tick_time;
        let animate = (time) => {
            if (last_tick_time === undefined) {
                last_tick_time = time;
                requestAnimationFrame(animate);
                return;
            }
            let millis_elapsed = time - last_tick_time;
            park.tick(millis_elapsed);
            render(canvas, park);
            requestAnimationFrame(animate);
            last_tick_time = time;
        };
        requestAnimationFrame(animate);
    }
}

init().then(run)
