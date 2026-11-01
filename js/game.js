
"use strict";

// ==========================================
// HOGER / LAGER - GAME ENGINE
// ==========================================

const BACK_IMAGE = "assets/cards/BACK.png";

let players = [];

let drawPile = [];
let discardPile = [];

let currentPlayer = 0;
let activeRule = "higher";
let direction = 1;
let difficulty = "easy";
let selectedPlayerCount = 2;

let gameRunning = false;
let waitingForPassing = false;

let aiTimer = null;

const $ = id => document.getElementById(id);

const mainMenu = $("main-menu");
const gameSetup = $("game-setup");
const gameScreen = $("game-screen");
const gameOverScreen = $("game-over-screen");
const passingScreen = $("passing-screen");

const yourHandElement = $("your-hand");
const drawPileElement = $("draw-pile");
const discardPileElement = $("discard-pile");

const gameMessage = $("game-message");
const activeRuleElement = $("active-rule");

// ==========================================
// MENU
// ==========================================

$("new-game").addEventListener("click", () => {
    mainMenu.classList.add("hidden");
    gameSetup.classList.remove("hidden");
});

$("back-menu").addEventListener("click", () => {
    gameSetup.classList.add("hidden");
    mainMenu.classList.remove("hidden");
});

// ==========================================
// AANTAL SPELERS KIEZEN
// ==========================================

document.querySelectorAll(".player-count").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".player-count").forEach(item => {
            item.classList.remove("selected");
        });

        button.classList.add("selected");

        selectedPlayerCount = Number(button.dataset.players);

        const description = $("player-count-description");

        if (selectedPlayerCount === 2) {
            description.textContent = "YOU + 1 AI OPPONENT";
        }

        if (selectedPlayerCount === 3) {
            description.textContent = "YOU + 2 AI OPPONENTS";
        }

        if (selectedPlayerCount === 4) {
            description.textContent = "YOU + 3 AI OPPONENTS";
        }
    });
});

// ==========================================
// AI MOEILIJKHEID
// ==========================================

document.querySelectorAll(".difficulty").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".difficulty").forEach(item =>
            item.classList.remove("selected")
        );

        button.classList.add("selected");

        difficulty = button.dataset.difficulty;
    });
});

// ==========================================
// OVERIGE MENU KNOPPEN
// ==========================================

$("start-game").addEventListener("click", startGame);

$("how-to-play").addEventListener("click", () => {
    mainMenu.classList.add("hidden");
    $("rules-screen").classList.remove("hidden");
});

$("rules-back").addEventListener("click", () => {
    $("rules-screen").classList.add("hidden");
    mainMenu.classList.remove("hidden");
});

$("settings").addEventListener("click", () => {
    mainMenu.classList.add("hidden");
    $("settings-screen").classList.remove("hidden");
});

$("settings-back").addEventListener("click", () => {
    $("settings-screen").classList.add("hidden");
    mainMenu.classList.remove("hidden");
});

$("leave-game-button").addEventListener("click", () => {

    stopGame();

    gameScreen.classList.add("hidden");
    mainMenu.classList.remove("hidden");
});

$("game-over-menu").addEventListener("click", () => {

    gameOverScreen.classList.add("hidden");
    mainMenu.classList.remove("hidden");
});

$("new-game-again").addEventListener("click", () => {

    gameOverScreen.classList.add("hidden");
    gameSetup.classList.remove("hidden");
});

// ==========================================
// SPELERS AANMAKEN
// ==========================================

function createPlayers(count) {

    const newPlayers = [];

    newPlayers.push({
        id: 0,
        name: "YOU",
        isAI: false,
        hand: []
    });

    for (let i = 1; i < count; i++) {

        newPlayers.push({
            id: i,
            name: "OPPONENT " + i,
            isAI: true,
            hand: []
        });
    }

    return newPlayers;
}

// ==========================================
// START GAME
// ==========================================

function startGame() {

    stopGame();

    players = createPlayers(selectedPlayerCount);

    drawPile = window.createDeck();
    discardPile = [];

    direction = 1;
    activeRule = "higher";
    currentPlayer = 0;

    // Iedere speler krijgt 7 kaarten.
    players.forEach(player => {

        for (let i = 0; i < 7; i++) {

            const card = drawPile.pop();

            if (!card) {
                console.error("Niet genoeg kaarten in de trekstapel.");
                return;
            }

            player.hand.push(card);
        }
    });

    // Eerste kaart op de aflegstapel.
    const startingCard = drawPile.pop();

    if (!startingCard) {
        console.error("Geen startkaart beschikbaar.");
        return;
    }

    discardPile.push(startingCard);

    gameRunning = true;
    waitingForPassing = false;

    gameSetup.classList.add("hidden");
    mainMenu.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    gameOverScreen.classList.add("hidden");

    renderGame();

    showMessage("Het spel is begonnen.");

    processTurn();
}

// ==========================================
// RENDER GAME
// ==========================================

function renderGame() {

    if (!gameRunning) return;

    renderYourHand();
    renderOpponents();
    renderPiles();
    renderStatus();
}

// ==========================================
// JOUW HAND
// ==========================================

function renderYourHand() {

    yourHandElement.innerHTML = "";

    players[0].hand.forEach(card => {

        const image = document.createElement("img");

        image.src = card.image;
        image.alt = card.name;
        image.className = "game-card";

        image.addEventListener("click", () => {
            playHumanCard(card.id);
        });

        yourHandElement.appendChild(image);
    });

    $("your-card-count").textContent =
        players[0].hand.length + " CARDS";
}

// ==========================================
// AI SPELERS WEERGEVEN
// ==========================================

function createOpponentContainer(index) {

    const area = document.querySelector(".opponents-area");

    const opponent = document.createElement("div");

    opponent.id = `player-${index}`;
    opponent.className = "opponent";

    const avatar = document.createElement("div");

    avatar.className = "player-avatar";
    avatar.textContent = `AI ${index}`;

    const info = document.createElement("div");

    info.className = "player-info";

    const heading = document.createElement("h3");

    heading.textContent = `OPPONENT ${index}`;

    const cardInfo = document.createElement("p");

    const count = document.createElement("span");

    count.className = "card-count";
    count.textContent = "7";

    cardInfo.appendChild(count);
    cardInfo.appendChild(document.createTextNode(" CARDS"));

    info.appendChild(heading);
    info.appendChild(cardInfo);

    const hand = document.createElement("div");

    hand.className = "opponent-hand";
    hand.id = `player-${index}-cards`;

    opponent.appendChild(avatar);
    opponent.appendChild(info);
    opponent.appendChild(hand);

    area.appendChild(opponent);

    return opponent;
}

function renderOpponents() {

    for (let index = 1; index <= 3; index++) {

        let opponent = $(`player-${index}`);

        // Maak AI 3 automatisch aan indien nodig.
        if (!opponent && index === 3) {
            opponent = createOpponentContainer(index);
        }

        if (!opponent) continue;

        // Verberg AI's die niet deelnemen.
        if (index >= players.length) {

            opponent.classList.add("hidden");
            continue;
        }

        opponent.classList.remove("hidden");

        const player = players[index];

        const container = $(`player-${index}-cards`);

        if (!container) continue;

        container.innerHTML = "";

        const count = document.querySelector(
            `#player-${index} .card-count`
        );

        if (count) {
            count.textContent = player.hand.length;
        }

        player.hand.forEach(() => {

            const image = document.createElement("img");

            image.src = BACK_IMAGE;
            image.alt = "Verborgen kaart";
            image.className = "opponent-card";

            container.appendChild(image);
        });
    }
}

// ==========================================
// TREKSTAPEL EN AFLEGSTAPEL
// ==========================================

function renderPiles() {

    // TREKSTAPEL
    drawPileElement
        .querySelectorAll(".pile-card-image")
        .forEach(image => image.remove());

    const drawImage = document.createElement("img");

    drawImage.src = BACK_IMAGE;
    drawImage.alt = "Trekstapel";
    drawImage.className = "game-card pile-card-image";

    drawPileElement.insertBefore(
        drawImage,
        $("draw-count")
    );

    $("draw-count").textContent = drawPile.length;

    // AFLEGSTAPEL
    discardPileElement
        .querySelectorAll(".pile-card-image")
        .forEach(image => image.remove());

    const topCard = discardPile[discardPile.length - 1];

    const placeholder = $("discard-placeholder");

    if (topCard) {

        const discardImage = document.createElement("img");

        discardImage.src = topCard.image;
        discardImage.alt = topCard.name;
        discardImage.className = "game-card pile-card-image";

        discardPileElement.insertBefore(
            discardImage,
            placeholder
        );

        placeholder.style.display = "none";

    } else {

        placeholder.textContent = "START";
        placeholder.style.display = "block";
    }
}

// ==========================================
// STATUS
// ==========================================

function renderStatus() {

    activeRuleElement.textContent =
        activeRule === "higher" ? "HOGER" : "LAGER";

    activeRuleElement.className =
        "active-rule " + activeRule;

    $("turn-indicator").textContent =
        players[currentPlayer].isAI
            ? players[currentPlayer].name + " IS AAN DE BEURT"
            : "YOUR TURN";

    $("direction-indicator").textContent =
        direction === 1 ? "CLOCKWISE" : "COUNTERCLOCKWISE";

    $("draw-cards-button").disabled =
        currentPlayer !== 0 || !gameRunning;

    $("pass-turn-button").disabled = true;
}

// ==========================================
// MESSAGE
// ==========================================

function showMessage(message) {
    gameMessage.textContent = message;
}

// ==========================================
// TOP NUMBER
// ==========================================

function getTopNumber() {

    const topCard = discardPile[discardPile.length - 1];

    if (!topCard || topCard.type !== "number") {
        return null;
    }

    return topCard.value;
}

// ==========================================
// CARD PLAYABILITY
// ==========================================

function canPlayCard(card) {

    return window.HigherLowerAI.isPlayable(
        card,
        activeRule,
        getTopNumber()
    );
}

// ==========================================
// HUMAN CARD
// ==========================================

function playHumanCard(cardId) {

    if (!gameRunning || waitingForPassing) return;
    if (currentPlayer !== 0) return;

    const hand = players[0].hand;

    const index = hand.findIndex(card => card.id === cardId);

    if (index === -1) return;

    const card = hand[index];

    if (!canPlayCard(card)) {

        showMessage("Deze kaart mag je niet spelen.");
        return;
    }

    hand.splice(index, 1);

    discardPile.push(card);

    if (checkWinner()) return;

    executeCardEffect(card);

    if (!waitingForPassing && gameRunning) {
        finishTurn();
    }
}

// ==========================================
// AI TURN
// ==========================================

function processTurn() {

    if (!gameRunning || waitingForPassing) return;

    renderGame();

    if (currentPlayer === 0) {

        showMessage("Jij bent aan de beurt.");
        return;
    }

    showMessage(players[currentPlayer].name + " speelt...");

    aiTimer = setTimeout(() => {

        if (!gameRunning || waitingForPassing) return;

        const player = players[currentPlayer];

        const chosenCard = window.HigherLowerAI.chooseCard(
            player.hand,
            activeRule,
            getTopNumber(),
            difficulty
        );

        if (!chosenCard) {

            drawPenaltyCards(currentPlayer);
            finishTurn();

            return;
        }

        const index = player.hand.findIndex(
            card => card.id === chosenCard.id
        );

        if (index === -1) {

            console.error("AI-kaart niet gevonden in hand.");
            return;
        }

        player.hand.splice(index, 1);

        discardPile.push(chosenCard);

        showMessage(
            player.name + " speelt " + chosenCard.name
        );

        renderGame();

        if (checkWinner()) return;

        executeCardEffect(chosenCard);

        if (!waitingForPassing && gameRunning) {
            finishTurn();
        }

    }, 3000);
}

// ==========================================
// CARD EFFECTS
// ==========================================

function executeCardEffect(card) {

    switch (card.type) {

        case "number":

            showMessage(
                players[currentPlayer].name +
                " speelt " + card.value
            );

            break;

        case "higher":

            activeRule = "higher";

            showMessage("De actieve regel is HOGER.");

            break;

        case "lower":

            activeRule = "lower";

            showMessage("De actieve regel is LAGER.");

            break;

        case "reverse":

            direction =
                window.HigherLowerActions.reverseDirection(direction);

            showMessage("De richting is omgekeerd.");

            break;

        case "great-reset":

            executeGreatReset();

            break;

        case "pass-lowest":

            beginPassing("pass-lowest");

            return;

        case "pass-highest":

            beginPassing("pass-highest");

            return;
    }

    renderGame();
}

// ==========================================
// GREAT RESET
// ==========================================

function executeGreatReset() {

    const result =
        window.HigherLowerActions.greatReset(players);

    result.discardCards.forEach(card => {
        discardPile.push(card);
    });

    showMessage("DE GROTE RESET is uitgevoerd.");

    renderGame();
}

// ==========================================
// PASSING CARDS
// ==========================================

function beginPassing(type) {

    waitingForPassing = true;

    const selections = [];

    // Iedere AI kiest zijn eigen kaart.
    players.forEach((player, index) => {

        if (player.isAI) {

            selections[index] =
                window.HigherLowerAI.selectPassingCard(
                    player.hand,
                    type
                );
        }
    });

    passingScreen.classList.remove("hidden");
    gameScreen.classList.add("hidden");

    $("passing-instruction").textContent =
        type === "pass-lowest"
            ? "Selecteer je laagste kaart."
            : "Selecteer je hoogste kaart.";

    const handElement = $("passing-hand");

    handElement.innerHTML = "";

    let selectedCard = null;

    players[0].hand.forEach(card => {

        const image = document.createElement("img");

        image.src = card.image;
        image.className = "game-card";

        image.addEventListener("click", () => {

            selectedCard = card;

            handElement.querySelectorAll("img").forEach(img =>
                img.classList.remove("selected")
            );

            image.classList.add("selected");

            $("confirm-passing").disabled = false;
        });

        handElement.appendChild(image);
    });

    $("confirm-passing").disabled = true;

    $("confirm-passing").onclick = () => {

        if (!selectedCard) return;

        selections[0] = selectedCard;

        try {

            window.HigherLowerActions.executePassing(
                players,
                selections,
                direction
            );

            waitingForPassing = false;

            passingScreen.classList.add("hidden");
            gameScreen.classList.remove("hidden");

            renderGame();

            if (!checkWinner()) {
                finishTurn();
            }

        } catch (error) {

            showMessage(error.message);

            console.error(error);
        }
    };
}

// ==========================================
// DRAW PILE
// ==========================================

function drawOneCard() {

    if (drawPile.length === 0) {

        if (discardPile.length <= 1) {
            return null;
        }

        const topCard = discardPile.pop();

        drawPile = discardPile;
        discardPile = [topCard];

        window.HigherLowerActions.shuffle(drawPile);
    }

    return drawPile.pop();
}

function drawPenaltyCards(playerIndex) {

    const player = players[playerIndex];

    let drawn = 0;

    for (let i = 0; i < 2; i++) {

        const card = drawOneCard();

        if (!card) break;

        player.hand.push(card);

        drawn++;
    }

    showMessage(
        player.name + " trekt " + drawn + " kaarten."
    );

    renderGame();
}

// ==========================================
// TREKKEN VIA KNOP OF TREKSTAPEL
// ==========================================

function humanDrawCards() {

    if (!gameRunning || currentPlayer !== 0) return;
    if (waitingForPassing) return;

    drawPenaltyCards(0);

    finishTurn();
}

$("draw-cards-button").addEventListener(
    "click",
    humanDrawCards
);

drawPileElement.addEventListener(
    "click",
    humanDrawCards
);

// ==========================================
// NEXT TURN
// ==========================================

function finishTurn() {

    if (!gameRunning || waitingForPassing) return;

    if (checkWinner()) return;

    currentPlayer =
        window.HigherLowerActions.getNextPlayerIndex(
            currentPlayer,
            players.length,
            direction
        );

    renderGame();

    processTurn();
}

// ==========================================
// WIN CONDITION
// ==========================================

function checkWinner() {

    const winner = players.find(
        player => player.hand.length === 0
    );

    if (!winner) return false;

    endGame(winner);

    return true;
}

function endGame(winner) {

    gameRunning = false;
    waitingForPassing = false;

    clearTimeout(aiTimer);

    gameScreen.classList.add("hidden");
    passingScreen.classList.add("hidden");
    gameOverScreen.classList.remove("hidden");

    $("game-over-title").textContent =
        winner.isAI ? "YOU LOSE!" : "YOU WIN!";

    $("game-over-message").textContent =
        winner.isAI
            ? winner.name + " heeft als eerste 0 kaarten."
            : "Je hebt als eerste 0 kaarten over!";
}

// ==========================================
// STOP GAME
// ==========================================

function stopGame() {

    gameRunning = false;
    waitingForPassing = false;

    clearTimeout(aiTimer);
}

console.log("HOGER / LAGER game.js geladen.");
