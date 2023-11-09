class Prediction {
  constructor(mouvement, history, game) {
    this.mouvement = mouvement;
    this.history = history;
    this.game = game;
  }
}

export default (game, timeLimit) => {
  let bestScore = 0;
  let bestMove = null;
  let queue = addQueue([], getDefaultMouvement([], game));
  let startTime = Date.now();

  while (queue.length != 0) {
    const currentTime = Date.now();
    if (currentTime - startTime > timeLimit) {
      return bestMove ? bestMove.history : [];
    }

    const myMouvement = queue.shift();

    if (!myMouvement.game.canMove(myMouvement.mouvement)) continue;

    myMouvement.game.addScore(myMouvement.game.move(myMouvement.mouvement));

    if (myMouvement.game.hasLost()) continue;
    myMouvement.game.spawnTile();
    myMouvement.history.push(myMouvement.mouvement);

    let currentScore = myMouvement.game.evaluateBoard();
    if (currentScore > bestScore) {
      bestScore = currentScore;
      bestMove = myMouvement;
    }

    let newMouvement = getDefaultMouvement(
      myMouvement.history,
      myMouvement.game
    );

    queue = addQueue(queue, newMouvement);
  }

  return bestMove ? bestMove.history : [];
};

const addQueue = (currentQueue, addQueue) => {
  return [...currentQueue, ...addQueue];
};

const getDefaultMouvement = (history, game) => {
  return [
    new Prediction("UP", [...history], game.clone()),
    new Prediction("LEFT", [...history], game.clone()),
    new Prediction("DOWN", [...history], game.clone()),
    new Prediction("RIGHT", [...history], game.clone()),
  ];
};
