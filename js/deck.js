
"use strict";

// HOGER / LAGER - Kaartdatabase
// Afbeeldingen: assets/cards/00.png t/m 61.png
// Achterkant: assets/cards/BACK.png

const CARD_IMAGE_PATH = "assets/cards/";

const cardDefinitions = [];

// ==========================================
// GETALLENKAARTEN: 00-38
// 3 exemplaren van iedere waarde 1 t/m 13
// ==========================================

for (let value = 1; value <= 13; value++) {

    for (let copy = 0; copy < 3; copy++) {

        const imageNumber = (value - 1) * 3 + copy;
        const imageName = String(imageNumber).padStart(2, "0");

        cardDefinitions.push({
            id: imageNumber,
            image: `${CARD_IMAGE_PATH}${imageName}.png`,
            type: "number",
            value: value,
            name: String(value)
        });
    }
}

// ==========================================
// SPECIALE KAARTEN: 39-61
// ==========================================

const specialCards = [
    {
        start: 39,
        end: 42,
        type: "reverse",
        name: "WISSELEN VAN RICHTING"
    },
    {
        start: 43,
        end: 46,
        type: "higher",
        name: "HOGER"
    },
    {
        start: 47,
        end: 50,
        type: "lower",
        name: "LAGER"
    },
    {
        start: 51,
        end: 53,
        type: "great-reset",
        name: "DE GROTE RESET"
    },
    {
        start: 54,
        end: 57,
        type: "pass-lowest",
        name: "LAAGSTE KAART DOORGEVEN"
    },
    {
        start: 58,
        end: 61,
        type: "pass-highest",
        name: "HOOGSTE KAART DOORGEVEN"
    }
];

for (const definition of specialCards) {

    for (let id = definition.start; id <= definition.end; id++) {

        const imageName = String(id).padStart(2, "0");

        cardDefinitions.push({
            id: id,
            image: `${CARD_IMAGE_PATH}${imageName}.png`,
            type: definition.type,
            value: 14,
            name: definition.name
        });
    }
}

// ==========================================
// DATABASE CONTROLES
// ==========================================

if (cardDefinitions.length !== 62) {
    throw new Error(
        `Fout in kaartdatabase: ${cardDefinitions.length} kaarten gevonden in plaats van 62.`
    );
}

const uniqueIds = new Set(cardDefinitions.map(card => card.id));

if (uniqueIds.size !== 62) {
    throw new Error("Fout: dubbele kaartnummers in de kaartdatabase.");
}

// ==========================================
// BESCHIKBAAR MAKEN VOOR GAME.JS
// ==========================================

window.cardDefinitions = cardDefinitions;

window.createDeck = function () {

    const deck = cardDefinitions.map(card => ({ ...card }));

    for (let i = deck.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
};

console.log(
    "HOGER / LAGER kaartdatabase geladen:",
    cardDefinitions.length,
    "kaarten."
);
