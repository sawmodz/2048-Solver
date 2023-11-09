import Game from "./game.js";
import resolver from "./resolver.js";

import readline from "readline";
const read = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let game = new Game();

const question = (query) => {
  return new Promise((resolve) => {
    read.question(query, (answer) => {
      resolve(answer);
    });
  });
};

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const main = async () => {
  let tempResult = [];
  while (true) {
    game.show();
    console.log("Coup exécuté : " + tempResult.join(" > "));
    let itsLost = false;
    const result = resolver(game, 150);
    if (result.length == 0) break;
    result.forEach((element) => {
      if (!game.canMove(element)) {
        itsLost = true;
        return;
      }
      game.addScore(game.move(element));

      if (game.hasLost()) {
        itsLost = true;
        return;
      }
      game.spawnTile();
    });

    if (itsLost) {
      break;
    }
    tempResult = result;
  }
  console.log("Vous avez perdu !");
};

// const main = async () => {
//   // ...
//   const test = game.clone();
//   console.log("Original game before move:");
//   game.show();

//   console.log("Cloned game before move:");
//   test.show();

//   if (test.canMove("DOWN")) {
//     test.move("DOWN");
//     test.spawnTile();
//   } else {
//     test.move("UP");
//     test.spawnTile();
//   }

//   console.log("Original game after move:");
//   game.show();

//   console.log("Cloned game after move:");
//   test.show();
//   // ...
// };

main();
