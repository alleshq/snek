const gridSize = 1000;

module.exports = (player, snakes, food) => {
    const grid = blank();
    const {x, y} = snakes[player].segments[0];

    // show ppl
    Object.keys(snakes).forEach(id => snakes[id].segments.forEach(segment => {
        if (
            segment.x >= x - 10 &&
            segment.x <= x + 10 &&
            segment.y >= y - 10 &&
            segment.y <= y + 10
        ) grid[x - segment.x + 10][y - segment.y + 10] = snakes[id].color;
    }));

    // where da food
    food.forEach(f => {
        if (
            f.x >= x - 10 &&
            f.x <= x + 10 &&
            f.y >= y - 10 &&
            f.y <= y + 10
        ) grid[x - f.x + 10][y - f.y + 10] = "#23539b";
    });

    // u no go here
    for (let tileX = x - 10; tileX < x + 10; tileX++) {
        for (let tileY = y - 10; tileY < y + 10; tileY++) {
            if (tileX < 0 || tileY < 0 || tileX > gridSize || tileY > gridSize) grid[x - tileX + 10][y - tileY + 10] = "#ff0000";
        }
    }

    return grid;
};

const blank = () => {
    let tiles = [];
    for (let x = 0; x < 21; x++) {
        tiles[x] = [];
        for (let y = 0; y < 21; y++) {
            tiles[x][y] = "#ffffff";
        }
    }
    return tiles;
};