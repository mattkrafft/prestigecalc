import fs from 'fs';

const INPUT_FILE = process.argv[2];
const OUTPUT_FILE = process.argv[3];

let json = {};

fs.readFileSync(INPUT_FILE)
    // break into lines and skip the header line.
    .toString().replace(/\r\n/g, '\n').split('\n').slice(1)
    // skip lines that are just commas.
    .filter((line) => !Boolean(/^[,]+$/.test(line)) && line)
    // start building the json object.
    .forEach((line) => {
        // deconstruct the line.
        const [champion, rank, pi, k = 1, a = 0, b = 0, c = 0] = line.split(',');
        // deconstruct the champion id, I used a swapped order.
        const [stars, uid] = champion.split('-');
        const championId = `${uid}-${stars}`;

        if(!json[championId]) {
            json[championId] = {};
        }

        // build the champion rank data.
        if(stars !== '5') {
            json[championId][rank] = {
                pi: Number(pi),
                k: Number(k),
                s0: Number(b),
                s1: Number(a),
            };
        }
        else {
            json[championId][rank] = {
                pi: Number(pi),
                k: Number(k),
                s0: Number(c),
                s1: Number(b),
                s2: 0,
                s3: Number(a),
            };
        }
    });

const LEVEL_1_1_PI = {
    1: 50,
    2: 100,
    3: 200,
    4: 400,
    5: 800,
};
const LEVELS_PER_RANK = {
    1: [ 10, 20 ],
    2: [ 10, 20, 30 ],
    3: [ 10, 20, 30, 40 ],
    4: [10, 20, 30, 40, 50],
    5: [25, 35, 45, 55, 65],
};

// now we are going to set the { "pi": { "0": ?, "50": ? } } min/max
Object.keys(json).forEach((championId) => {
    const ranks = json[championId];
    const stars = Number(championId.split('-')[1]);
    const rankNumbers = Object.keys(ranks).map((rank) => Number(rank));
    const pis = {};
    // get the max pi for each rank
    rankNumbers.forEach((rank) => {
        pis[rank] = ranks[rank].pi;
    });
    // now shove in the min/max with a shitty default for 1/1
    rankNumbers.forEach((rank) => {
        const levels = LEVELS_PER_RANK[stars][rank - 1];
        ranks[rank].pi = {
            '0': (rank === 1)? LEVEL_1_1_PI[stars]: pis[rank - 1],
            [levels]: pis[rank],
        };
    });
});

// write to the json file, then pull request to :champions
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(json, null, 4) + '\n');
