const bigInt = require("big-integer");

let PRIME = bigInt(2).pow(127).minus(1);

function decodeValue(base, value) {
  
  return bigInt(value, base);  // (111) base 2 =  binary
}

function jsonToPoints(jsonData) {
  const points = [];
  const { n, k } = jsonData.keys;

  for (let i = 1; i <= n; i++) {
    if (!jsonData[i]) {
      throw new Error(`Missing share ${i} in JSON data.`);
    }
    const base = parseInt(jsonData[i].base);
    const value = jsonData[i].value;
    const x = bigInt(i);
    const y = decodeValue(base, value);
    points.push([x, y]);
  }

  return { points, k };
}

function recover(points) {
  return lagrange_interpolation(points);
}

function lagrange_interpolation(points) {
  let p1 = bigInt(1);
  for (let i = 0; i < points.length; i++) {
    const x_coordinate = points[i][0];
    p1 = p1.multiply(x_coordinate.multiply(-1).mod(PRIME)).mod(PRIME);
  }

  let p2 = bigInt(0);

  for (let i = 0; i < points.length; i++) {
    let numerator = points[i][1];
    numerator = numerator
      .multiply(p1)
      .multiply(points[i][0].multiply(-1).modInv(PRIME))
      .mod(PRIME);

    let denominator = bigInt(1).mod(PRIME);

    for (let j = 0; j < points.length; j++) {
      if (i === j) continue;
      const front = points[i][0];
      const back = points[j][0];
      denominator = denominator
        .multiply(front.minus(back).mod(PRIME))
        .mod(PRIME);
    }

    const frac = numerator.multiply(denominator.modInv(PRIME)).mod(PRIME);
    p2 = p2.plus(frac).mod(PRIME);
  }

  return p2.mod(PRIME).plus(PRIME).mod(PRIME);
}

function recoverSecretFromJson(jsonData) {
  const { points, k } = jsonToPoints(jsonData);

  console.log(points);

  const recoveredSecret = recover(points.slice(0, k));
  console.log(`Recovered Secret: ${recoveredSecret}`);
}

const testcase1 = {
  keys: {
    n: 5,
    k: 3,
  },
  1: {
    base: "10",
    value: "123",
  },
  2: {
    base: "16",
    value: "7B",
  },
  3: {
    base: "8",
    value: "173",
  },
  4: {
    base: "2",
    value: "1111011",
  },
  5: {
    base: "10",
    value: "567",
  },
};

const testcase2 = {
  keys: {
    n: 10,
    k: 7,
  },
  1: {
    base: "6",
    value: "13444211440455345511",
  },
  2: {
    base: "15",
    value: "aed7015a346d63",
  },
  3: {
    base: "15",
    value: "6aeeb69631c227c",
  },
  4: {
    base: "16",
    value: "e1b5e05623d881f",
  },
  5: {
    base: "8",
    value: "316034514573652620673",
  },
  6: {
    base: "3",
    value: "2122212201122002221120200210011020220200",
  },
  7: {
    base: "3",
    value: "20120221122211000100210021102001201112121",
  },
  8: {
    base: "6",
    value: "20220554335330240002224253",
  },
  9: {
    base: "12",
    value: "45153788322a1255483",
  },
  10: {
    base: "7",
    value: "1101613130313526312514143",
  },
};

recoverSecretFromJson(testcase1);
recoverSecretFromJson(testcase2);
