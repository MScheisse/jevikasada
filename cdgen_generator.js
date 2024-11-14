const {createHash} = require("crypto");


function sha256(input) {
    return createHash("sha256").update(input).digest("hex");
}

function makeId() {
    let out = "";
    for (let i = 0; i < 32; i++) {
        out += "0123456789abcdef"[Math.floor(Math.random() * 16)];
    }
    return out;
}

function getHashDifficulty(hash) {
    return 0x10000000000000 / (Number("0x" + hash.slice(0, 13)) + 1);
}

function solveChallenge(difficulty, subchallengeCount, platformInputs, workTime, id) {
    let input = sha256(platformInputs + ", " + workTime + ", " + id);
    let threshold = difficulty / subchallengeCount;
    let answers = [];
    for (let i = 0; i < subchallengeCount; i++) {
        for (let index = 1; ;) {
            let hash = sha256(index + ", " + input);
            if (getHashDifficulty(hash) >= threshold) {
                answers.push(index);
                input = hash;
                break;
            }
            index++;
        }
    }
    return {
        workTime: workTime,
        id: id,
        answers: answers
        // finalHash: input
    };
}

const generateCd = function (difference = 0, difficulty = 10, subchallengeCount = 2, platformInputs = "tp-v2-input") {
    let offset = 100 + Math.floor(Math.random() * 401); // between 100 and 500
    let time1 = Date.now() + difference;
    let perf1 = Math.random() * 2e5; // performance.now()
    let workTime = time1 - offset;
    let id = makeId();
    let solution = solveChallenge(difficulty, subchallengeCount, platformInputs, workTime, id);
    let perf2 = perf1 + 1 + Math.random() * 5; // performance.now()
    let duration = parseFloat((Math.round(1000 * (perf2 - perf1)) / 1000).toFixed(1));
    solution.duration = duration;
    solution.d = offset;
    solution.st = Date.now() + difference - 4000 - Math.floor(Math.random() * 1500);
    solution.rst = solution.st + 150 + Math.floor(Math.random() * 200);
    return solution;
}

module.exports = {'generateCd': generateCd};
