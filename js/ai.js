
"use strict";

// ==========================================
// HOGER / LAGER - AI ENGINE
// ==========================================

window.HigherLowerAI = {

    // Kies een speelbare kaart.
    chooseCard(hand, activeRule, topNumber, difficulty) {

        const playable = hand.filter(card =>
            this.isPlayable(card, activeRule, topNumber)
        );

        if (playable.length === 0) {
            return null;
        }

        if (difficulty === "easy") {
            return this.chooseEasy(playable);
        }

        return this.chooseNormal(playable, hand, activeRule, topNumber);
    },

    // Controleer of een kaart gespeeld mag worden.
    isPlayable(card, activeRule, topNumber) {

        if (!card) return false;

        // Speciale kaarten mogen altijd gespeeld worden.
        if (card.type !== "number") {
            return true;
        }

        if (topNumber === null || topNumber === undefined) {
            return true;
        }

        if (activeRule === "higher") {
            return card.value >= topNumber;
        }

        if (activeRule === "lower") {
            return card.value <= topNumber;
        }

        return true;
    },

    // EASY: maakt regelmatig minder slimme keuzes.
    chooseEasy(playable) {

        return playable[
            Math.floor(Math.random() * playable.length)
        ];
    },

    // NORMAL: probeert strategisch kaarten kwijt te raken.
    chooseNormal(playable, hand, activeRule, topNumber) {

        const scored = playable.map(card => {

            let score = 0;

            switch (card.type) {

                case "number":
                    score += 10;

                    // Hoge kaarten zijn lastiger kwijt te raken
                    // wanneer HOGER actief is.
                    if (activeRule === "higher") {
                        score += card.value;
                    }

                    // Lage kaarten zijn lastiger kwijt te raken
                    // wanneer LAGER actief is.
                    if (activeRule === "lower") {
                        score += (14 - card.value);
                    }

                    break;

                case "higher":
                case "lower":
                    score += 18;

                    // Regel veranderen kan gunstig zijn
                    // afhankelijk van de kaarten in de hand.
                    score += this.countUsefulNumbers(
                        hand,
                        card.type
                    ) * 2;

                    break;

                case "reverse":
                    score += 12;
                    break;

                case "pass-lowest":
                    score += 16;
                    break;

                case "pass-highest":
                    score += 16;
                    break;

                case "great-reset":
                    score += 8;
                    break;
            }

            // Een kaart spelen die de AI nog maar één keer heeft,
            // helpt om de hand kleiner te maken.
            return {
                card,
                score
            };
        });

        scored.sort((a, b) => b.score - a.score);

        return scored[0].card;
    },

    // Tel hoeveel getallenkaarten bruikbaar zijn
    // bij een bepaalde actieve regel.
    countUsefulNumbers(hand, rule) {

        return hand.filter(card => {

            if (card.type !== "number") {
                return false;
            }

            if (rule === "higher") {
                return card.value >= 7;
            }

            if (rule === "lower") {
                return card.value <= 7;
            }

            return false;

        }).length;
    },

    // Selecteer de hoogste kaart voor doorgeven.
    selectHighestCard(hand) {

        if (!hand.length) return null;

        return hand.reduce((highest, card) => {

            const currentValue =
                card.type === "number" ? card.value : -1;

            const highestValue =
                highest.type === "number" ? highest.value : -1;

            return currentValue > highestValue
                ? card
                : highest;

        });
    },

    // Selecteer de laagste kaart voor doorgeven.
    selectLowestCard(hand) {

        if (!hand.length) return null;

        const numberCards = hand.filter(
            card => card.type === "number"
        );

        if (numberCards.length === 0) {
            return hand[0];
        }

        return numberCards.reduce((lowest, card) =>
            card.value < lowest.value ? card : lowest
        );
    },

    // Kies een kaart voor de doorgeefactie.
    selectPassingCard(hand, passingType) {

        if (passingType === "pass-highest") {
            return this.selectHighestCard(hand);
        }

        if (passingType === "pass-lowest") {
            return this.selectLowestCard(hand);
        }

        return null;
    },

    // AI kiest of ze een kaart speelt of 2 kaarten trekt.
    shouldPlayCard(hand, activeRule, topNumber, difficulty) {

        return this.chooseCard(
            hand,
            activeRule,
            topNumber,
            difficulty
        ) !== null;
    }
};

console.log("HOGER / LAGER AI-engine geladen.");
