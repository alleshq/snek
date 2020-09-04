module.exports = (player, snakes, food) => {
    const grid = blank();
    const {x, y} = snakes[player];
    grid[x][y] = "#23539b";
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