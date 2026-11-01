
"use strict";

// ==========================================
// HOGER / LAGER - SPECIAL CARD ACTIONS
// ==========================================

window.HigherLowerActions = {

    // Richting: 1 = met de klok mee
    //          -1 = tegen de klok in
    reverseDirection(direction) {
        return direction === 1 ? -1 : 1;
    },

    // Activeer HOGER of LAGER.
    changeRule(cardType) {

        if (cardType === "higher") {
            return "higher";
        }

        if (cardType === "lower") {
            return "lower";
        }

        return null;
    },

    // Bepaal de volgende speler.
    getNextPlayerIndex(currentIndex, playerCount, direction) {

        return (
            currentIndex + direction + playerCount
        ) % playerCount;
    },

    // ======================================
    // DE GROTE RESET
    // ======================================

    greatReset(players) {

        // Bewaar hoeveel kaarten iedere speler had.
        const handSizes = players.map(
            player => player.hand.length
        );

        // Verzamel alle handkaarten.
        const cardPool = [];

        players.forEach(player => {
            cardPool.push(...player.hand);
            player.hand = [];
        });

        // Schud alle verzamelde kaarten.
        this.shuffle(cardPool);

        // Geef iedere speler evenveel kaarten terug
        // als hij vóór de reset had.
        players.forEach((player, index) => {

            const amount = handSizes[index];

            player.hand = cardPool.splice(0, amount);

        });

        // Eventuele overblijvende kaarten gaan naar de aflegstapel.
        return {
            discardCards: cardPool,
            handSizes: handSizes
        };
    },

    // ======================================
    // HOOGSTE / LAAGSTE KAART DOORGEVEN
    // ======================================

    executePassing(players, selections, direction) {

        if (players.length < 2) {
            throw new Error(
                "Er zijn minstens 2 spelers nodig."
            );
        }

        if (selections.length !== players.length) {
            throw new Error(
                "Iedere speler moet eerst een kaart selecteren."
            );
        }

        // Controleer alle keuzes VOORDAT kaarten worden verplaatst.
        const selectedCards = [];

        for (let i = 0; i < players.length; i++) {

            const selected = selections[i];

            if (!selected) {
                throw new Error(
                    `Speler ${i + 1} heeft geen kaart geselecteerd.`
                );
            }

            const cardIndex = players[i].hand.findIndex(
                card => card.id === selected.id
            );

            if (cardIndex === -1) {
                throw new Error(
                    `De geselecteerde kaart behoort niet tot speler ${i + 1}.`
                );
            }

            selectedCards.push({
                playerIndex: i,
                card: players[i].hand[cardIndex]
            });
        }

        // Verwijder eerst alle geselecteerde kaarten.
        selectedCards.forEach(selection => {

            const hand = players[selection.playerIndex].hand;

            const index = hand.findIndex(
                card => card.id === selection.card.id
            );

            hand.splice(index, 1);
        });

        // Geef daarna alle kaarten gelijktijdig door.
        selectedCards.forEach(selection => {

            const recipientIndex = this.getNextPlayerIndex(
                selection.playerIndex,
                players.length,
                direction
            );

            players[recipientIndex].hand.push(
                selection.card
            );
        });

        return true;
    },

    // ======================================
    // SCHUDFUNCTIE
    // ======================================

    shuffle(cards) {

        for (let i = cards.length - 1; i > 0; i--) {

            const j = Math.floor(
                Math.random() * (i + 1)
            );

            [cards[i], cards[j]] = [
                cards[j],
                cards[i]
            ];
        }

        return cards;
    }
};

console.log("HOGER / LAGER speciale acties geladen.");
