"use strict";

/* =========================================================
   JAC PORTAL
   ABSCHLUSS
   FINALE GOLD SEQUENZ

   WICHTIG:

   1. Overlay erscheint sofort
   2. Noch KEINE Finalanimation
   3. Klick auf "FINALE AUSWERTUNG ÖFFNEN"
   4. Audio wird freigegeben
   5. Overlay verschwindet
   6. Finale startet
   7. 5 Akten
   8. Gold
   9. Energie
   10. Feuerwerk
   11. Abschlussbildschirm
   ========================================================= */


/* =========================================================
   KONFIGURATION
   ========================================================= */

const CONFIG = {

    overlayLeaving: 700,

    logoDelay: 100,

    caseStart: 850,

    caseStep: 650,

    energyDelay: 650,

    fireworksDelay: 1800,

    completionDelay: 10400,

    completionMessageDelay: 1150,

    endRedirectDelay: 2600

};


/* =========================================================
   DOM
   ========================================================= */

let startOverlay;
let startButton;

let finalScreen;
let completionScreen;

let finalStage;
let sparkleContainer;
let fireworkContainer;
let lightningContainer;
let transitionFlash;
let energyLines;

let cases;

let endButton;
let endConfirmation;


/* =========================================================
   STATUS
   ========================================================= */

let finaleStarted = false;
let startLocked = false;


/* =========================================================
   TIMER
   ========================================================= */

const timers = new Set();


function later(fn, ms) {

    const id = window.setTimeout(() => {

        timers.delete(id);

        try {

            fn();

        }

        catch (error) {

            console.error(
                "JAC Abschluss:",
                error
            );

        }

    }, ms);


    timers.add(id);

    return id;

}


/* =========================================================
   INITIALISIERUNG
   ========================================================= */

function initializeCompletion() {

    startOverlay =
        document.getElementById(
            "final-start-overlay"
        );


    startButton =
        document.getElementById(
            "final-start-button"
        );


    finalScreen =
        document.getElementById(
            "final-animation-screen"
        );


    completionScreen =
        document.getElementById(
            "completion-screen"
        );


    finalStage =
        document.getElementById(
            "final-logo-stage"
        );


    sparkleContainer =
        document.getElementById(
            "final-sparkle-container"
        );


    fireworkContainer =
        document.getElementById(
            "firework-container"
        );


    lightningContainer =
        document.getElementById(
            "lightning-container"
        );


    transitionFlash =
        document.getElementById(
            "transition-flash"
        );


    energyLines =
        document.querySelector(
            ".energy-lines"
        );


    cases =
        Array.from(
            document.querySelectorAll(
                ".final-case"
            )
        );


    endButton =
        document.getElementById(
            "end-button"
        );


    endConfirmation =
        document.getElementById(
            "end-confirmation"
        );


    createBackgroundStars();

    prepareFinalAnimation();

    setupStartOverlay();

    setupEndButton();


    /*
     * WICHTIG:
     *
     * Das Overlay wird NICHT verzögert.
     * Es ist bereits durch CSS sichtbar.
     */

    if (startOverlay) {

        startOverlay.classList.remove(
            "hidden"
        );

        startOverlay.setAttribute(
            "aria-hidden",
            "false"
        );

    }

}


/* =========================================================
   FINALE VORBEREITEN
   ========================================================= */

function prepareFinalAnimation() {

    if (!finalScreen) {
        return;
    }


    /*
     * Finale ist am Anfang komplett versteckt.
     */

    finalScreen.classList.remove(
        "running",
        "final-finished"
    );


    finalScreen.setAttribute(
        "aria-hidden",
        "true"
    );


    /*
     * Alle Akten zurücksetzen.
     */

    cases.forEach(card => {

        card.classList.remove(
            "case-visible",
            "gold"
        );

    });


    /*
     * Logo zurücksetzen.
     */

    if (finalStage) {

        finalStage.classList.remove(
            "logo-ready",
            "logo-intense"
        );

    }


    /*
     * Energie zurücksetzen.
     */

    if (energyLines) {

        energyLines.classList.remove(
            "active"
        );

    }


    /*
     * Abschlussseite verstecken.
     */

    if (completionScreen) {

        completionScreen.classList.remove(
            "visible"
        );

        completionScreen.setAttribute(
            "aria-hidden",
            "true"
        );

    }

}


/* =========================================================
   START OVERLAY
   ========================================================= */

function setupStartOverlay() {

    if (!startButton) {

        console.error(
            "JAC: final-start-button fehlt."
        );

        return;

    }


    startButton.addEventListener(
        "click",
        handleFinalStart
    );


    /*
     * ENTER / LEERTASTE
     */

    document.addEventListener(
        "keydown",
        event => {

            if (!startOverlay) {
                return;
            }


            if (
                startOverlay.classList.contains(
                    "hidden"
                )
            ) {

                return;

            }


            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                handleFinalStart();

            }

        }
    );

}


/* =========================================================
   FINALE STARTEN
   ========================================================= */

async function handleFinalStart() {

    /*
     * Doppelklick verhindern.
     */

    if (
        startLocked ||
        finaleStarted
    ) {

        return;

    }


    startLocked = true;


    if (startButton) {

        startButton.disabled = true;

    }


    /*
     * -----------------------------------------------------
     * AUDIO FREIGEBEN
     * -----------------------------------------------------
     *
     * Das passiert innerhalb der echten
     * Benutzeraktion.
     */

    if (
        window.JACAudio &&
        typeof JACAudio.unlock === "function"
    ) {

        try {

            await JACAudio.unlock();

        }

        catch (error) {

            console.warn(
                "JAC Audio Unlock:",
                error
            );

        }

    }


    /*
     * Optionaler Klick-Sound.
     */

    if (
        window.JACAudio &&
        typeof JACAudio.click === "function"
    ) {

        JACAudio.click();

    }


    /*
     * Overlay fährt aus.
     */

    if (startOverlay) {

        startOverlay.classList.add(
            "hidden"
        );

    }


    /*
     * Nach kurzer dramaturgischer Pause
     * beginnt die eigentliche Finalsequenz.
     */

    later(() => {

        startFinalAnimation();

    }, CONFIG.overlayLeaving);

}


/* =========================================================
   FINALE
   ========================================================= */

function startFinalAnimation() {

    if (finaleStarted) {
        return;
    }


    finaleStarted = true;


    if (!finalScreen) {
        return;
    }


    /*
     * Finale sichtbar machen.
     */

    finalScreen.classList.add(
        "running"
    );


    finalScreen.setAttribute(
        "aria-hidden",
        "false"
    );


    /*
     * Abschlussseite sicher verstecken.
     */

    if (completionScreen) {

        completionScreen.classList.remove(
            "visible"
        );

        completionScreen.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    /*
     * -----------------------------------------------------
     * FINAL REVEAL SOUND
     * -----------------------------------------------------
     */

    if (
        window.JACAudio &&
        typeof JACAudio.finalReveal ===
            "function"
    ) {

        JACAudio.finalReveal();

    }


    /*
     * -----------------------------------------------------
     * LOGO
     * -----------------------------------------------------
     */

    later(() => {

        if (finalStage) {

            finalStage.classList.add(
                "logo-ready"
            );

        }

    }, CONFIG.logoDelay);


    /*
     * -----------------------------------------------------
     * 5 AKTEN ERSCHEINEN
     * -----------------------------------------------------
     */

    cases.forEach(
        (card, index) => {

            later(() => {

                card.classList.add(
                    "case-visible"
                );


                if (
                    window.JACAudio &&
                    typeof JACAudio.unlockCase ===
                        "function"
                ) {

                    JACAudio.unlockCase();

                }

            }, CONFIG.caseStart +
               index * 150);

        }
    );


    /*
     * -----------------------------------------------------
     * AKTEN WERDEN GOLD
     * -----------------------------------------------------
     */

    cases.forEach(
        (card, index) => {

            later(() => {

                card.classList.add(
                    "gold"
                );


                createCaseGoldBurst(
                    card
                );


                if (
                    index ===
                    cases.length - 1
                ) {

                    if (
                        window.JACAudio &&
                        typeof JACAudio.completeCase ===
                            "function"
                    ) {

                        JACAudio.completeCase();

                    }

                }

                else {

                    if (
                        window.JACAudio &&
                        typeof JACAudio.sparkle ===
                            "function"
                    ) {

                        JACAudio.sparkle();

                    }

                }

            },
            CONFIG.caseStart +
            index * CONFIG.caseStep);

        }
    );


    /*
     * -----------------------------------------------------
     * ALLE AKTEN GOLD
     * -----------------------------------------------------
     */

    const allGoldAt =
        CONFIG.caseStart +
        (cases.length - 1) *
        CONFIG.caseStep +
        CONFIG.energyDelay;


    later(() => {

        if (energyLines) {

            energyLines.classList.add(
                "active"
            );

        }


        if (finalStage) {

            finalStage.classList.add(
                "logo-intense"
            );

        }


        createLogoSparkleRing();

        createLightningBurst(14);


        if (
            window.JACAudio &&
            typeof JACAudio.doubleSparkle ===
                "function"
        ) {

            JACAudio.doubleSparkle();

        }

    }, allGoldAt);


    /*
     * -----------------------------------------------------
     * GROSSES LOGO-FEUERWERK
     * -----------------------------------------------------
     */

    later(() => {

        createLogoFirework();


        if (
            window.JACAudio &&
            typeof JACAudio.finalComplete ===
                "function"
        ) {

            JACAudio.finalComplete();

        }

    },
    allGoldAt +
    CONFIG.fireworksDelay);


    /*
     * -----------------------------------------------------
     * WEITERE FEUERWERKSWELLEN
     * -----------------------------------------------------
     */

    later(
        () => createFireworkWave(5),
        allGoldAt +
        CONFIG.fireworksDelay +
        800
    );


    later(
        () => createFireworkWave(4),
        allGoldAt +
        CONFIG.fireworksDelay +
        1550
    );


    later(
        () => createFireworkWave(5),
        allGoldAt +
        CONFIG.fireworksDelay +
        2300
    );


    /*
     * -----------------------------------------------------
     * ÜBERGANG
     * -----------------------------------------------------
     */

    later(() => {

        if (transitionFlash) {

            transitionFlash.classList.add(
                "active"
            );

        }

    },
    CONFIG.completionDelay - 450);


    /*
     * -----------------------------------------------------
     * ABSCHLUSSSEITE
     * -----------------------------------------------------
     */

    later(() => {

        showCompletionScreen();

    },
    CONFIG.completionDelay);

}


/* =========================================================
   HINTERGRUNDSTERNE
   ========================================================= */

function createBackgroundStars() {

    const container =
        document.getElementById(
            "background-stars"
        );


    if (!container) {
        return;
    }


    container.replaceChildren();


    const fragment =
        document.createDocumentFragment();


    for (
        let i = 0;
        i < 50;
        i++
    ) {

        const star =
            document.createElement("i");


        star.style.left =
            `${Math.random() * 100}%`;


        star.style.top =
            `${Math.random() * 100}%`;


        star.style.animationDelay =
            `${Math.random() * 3}s`;


        star.style.opacity =
            `${0.15 + Math.random() * .55}`;


        fragment.appendChild(
            star
        );

    }


    container.appendChild(
        fragment
    );

}


/* =========================================================
   AKTEN GOLD BURST
   ========================================================= */

function createCaseGoldBurst(card) {

    if (!sparkleContainer) {
        return;
    }


    const rect =
        card.getBoundingClientRect();


    const centerX =
        rect.left +
        rect.width / 2;


    const centerY =
        rect.top +
        rect.height / 2;


    for (
        let i = 0;
        i < 14;
        i++
    ) {

        const particle =
            document.createElement("span");


        particle.className =
            "sparkle";


        const angle =
            Math.random() *
            Math.PI *
            2;


        const distance =
            35 +
            Math.random() *
            80;


        particle.style.left =
            `${centerX}px`;


        particle.style.top =
            `${centerY}px`;


        particle.style.setProperty(
            "--x",
            `${Math.cos(angle) * distance}px`
        );


        particle.style.setProperty(
            "--y",
            `${Math.sin(angle) * distance}px`
        );


        particle.style.setProperty(
            "--size",
            `${2 + Math.random() * 3}px`
        );


        sparkleContainer.appendChild(
            particle
        );


        later(
            () => particle.remove(),
            1600
        );

    }

}


/* =========================================================
   LOGO GLITZERRING
   ========================================================= */

function createLogoSparkleRing() {

    if (!sparkleContainer) {
        return;
    }


    for (
        let i = 0;
        i < 32;
        i++
    ) {

        const particle =
            document.createElement("span");


        particle.className =
            "sparkle";


        const angle =
            (
                Math.PI * 2 / 32
            ) * i;


        const distance =
            100 +
            Math.random() * 110;


        particle.style.left =
            "50%";


        particle.style.top =
            "50%";


        particle.style.setProperty(
            "--x",
            `${Math.cos(angle) * distance}px`
        );


        particle.style.setProperty(
            "--y",
            `${Math.sin(angle) * distance}px`
        );


        particle.style.setProperty(
            "--size",
            `${2 + Math.random() * 3}px`
        );


        sparkleContainer.appendChild(
            particle
        );


        later(
            () => particle.remove(),
            1800
        );

    }

}


/* =========================================================
   BLITZE
   ========================================================= */

function createLightningBurst(
    count = 14
) {

    if (!lightningContainer) {
        return;
    }


    lightningContainer.replaceChildren();


    const fragment =
        document.createDocumentFragment();


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const bolt =
            document.createElement("span");


        bolt.className =
            "lightning-bolt";


        bolt.style.setProperty(
            "--angle",
            `${(360 / count) * i +
            (Math.random() * 12 - 6)}deg`
        );


        bolt.style.animationDelay =
            `${Math.random() * .2}s`;


        fragment.appendChild(
            bolt
        );

    }


    lightningContainer.appendChild(
        fragment
    );


    later(() => {

        lightningContainer.replaceChildren();

    }, 1200);

}


/* =========================================================
   HAUPT-FEUERWERK
   ========================================================= */

function createLogoFirework() {

    if (
        !fireworkContainer ||
        !finalStage
    ) {

        return;

    }


    const rect =
        finalStage.getBoundingClientRect();


    const x =
        rect.left +
        rect.width / 2;


    const y =
        rect.top +
        rect.height / 2;


    const core =
        document.createElement("div");


    core.className =
        "firework-burst";


    core.style.setProperty(
        "--left",
        `${x}px`
    );


    core.style.setProperty(
        "--top",
        `${y}px`
    );


    fireworkContainer.appendChild(
        core
    );


    const count = 52;


    const fragment =
        document.createDocumentFragment();


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const particle =
            document.createElement("span");


        particle.className =
            "firework-particle";


        const angle =
            (
                Math.PI * 2 / count
            ) *
            i +
            (Math.random() - .5) *
            .16;


        const distance =
            150 +
            Math.random() *
            220;


        particle.style.setProperty(
            "--left",
            `${x}px`
        );


        particle.style.setProperty(
            "--top",
            `${y}px`
        );


        particle.style.setProperty(
            "--x",
            `${Math.cos(angle) * distance}px`
        );


        particle.style.setProperty(
            "--y",
            `${Math.sin(angle) * distance}px`
        );


        particle.style.setProperty(
            "--size",
            `${2 + Math.random() * 3}px`
        );


        particle.style.setProperty(
            "--delay",
            `${Math.random() * .18}s`
        );


        fragment.appendChild(
            particle
        );

    }


    fireworkContainer.appendChild(
        fragment
    );


    later(() => {

        fireworkContainer.replaceChildren();

    }, 1900);


    createLightningBurst(18);

}


/* =========================================================
   FEUERWERKSWELLE
   ========================================================= */

function createFireworkWave(
    count = 5
) {

    if (!fireworkContainer) {
        return;
    }


    const positions = [

        [18, 31],
        [33, 20],
        [50, 26],
        [68, 20],
        [84, 33],
        [25, 53],
        [50, 48],
        [77, 53]

    ];


    const selected =
        [...positions]
            .sort(
                () =>
                    Math.random() -
                    .5
            )
            .slice(
                0,
                count
            );


    selected.forEach(
        (position, index) => {

            later(
                () => {

                    createSmallFirework(
                        position[0],
                        position[1]
                    );

                },
                index * 100
            );

        }
    );

}


/* =========================================================
   KLEINES FEUERWERK
   ========================================================= */

function createSmallFirework(
    percentX,
    percentY
) {

    if (!fireworkContainer) {
        return;
    }


    const x =
        window.innerWidth *
        percentX /
        100;


    const y =
        window.innerHeight *
        percentY /
        100;


    const core =
        document.createElement("div");


    core.className =
        "firework-burst";


    core.style.setProperty(
        "--left",
        `${x}px`
    );


    core.style.setProperty(
        "--top",
        `${y}px`
    );


    fireworkContainer.appendChild(
        core
    );


    const count = 26;


    const fragment =
        document.createDocumentFragment();


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const particle =
            document.createElement("span");


        particle.className =
            "firework-particle";


        const angle =
            (
                Math.PI * 2 / count
            ) *
            i +
            (Math.random() - .5) *
            .2;


        const distance =
            65 +
            Math.random() *
            90;


        particle.style.setProperty(
            "--left",
            `${x}px`
        );


        particle.style.setProperty(
            "--top",
            `${y}px`
        );


        particle.style.setProperty(
            "--x",
            `${Math.cos(angle) * distance}px`
        );


        particle.style.setProperty(
            "--y",
            `${Math.sin(angle) * distance}px`
        );


        particle.style.setProperty(
            "--size",
            `${1.5 + Math.random() * 2.5}px`
        );


        particle.style.setProperty(
            "--delay",
            `${Math.random() * .12}s`
        );


        fragment.appendChild(
            particle
        );

    }


    fireworkContainer.appendChild(
        fragment
    );


    later(() => {

        core.remove();

    }, 1500);

}


/* =========================================================
   ABSCHLUSSBILDSCHIRM
   ========================================================= */

function showCompletionScreen() {

    if (!completionScreen) {
        return;
    }


    /*
     * Finale ausblenden.
     */

    if (finalScreen) {

        finalScreen.classList.remove(
            "running"
        );

        finalScreen.classList.add(
            "final-finished"
        );

        finalScreen.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    /*
     * Abschlussseite anzeigen.
     */

    completionScreen.classList.add(
        "visible"
    );


    completionScreen.setAttribute(
        "aria-hidden",
        "false"
    );


    createCompletionSparkles();


    /*
     * Finale Abschlussmusik / Sound.
     */

    if (
        window.JACAudio &&
        typeof JACAudio.finalComplete ===
            "function"
    ) {

        JACAudio.finalComplete();

    }


    /*
     * Systemmeldung kommt ERST HIER.
     */

    later(() => {

        const message =
            document.querySelector(
                ".completion-system-message"
            );


        if (message) {

            message.classList.add(
                "message-ready"
            );

        }


        if (
            window.JACAudio &&
            typeof JACAudio.message ===
                "function"
        ) {

            JACAudio.message();

        }

    },
    CONFIG.completionMessageDelay);

}


/* =========================================================
   ABSCHLUSS GLITZER
   ========================================================= */

function createCompletionSparkles() {

    const container =
        document.getElementById(
            "completion-sparkles"
        );


    if (!container) {
        return;
    }


    container.replaceChildren();


    const fragment =
        document.createDocumentFragment();


    for (
        let i = 0;
        i < 50;
        i++
    ) {

        const sparkle =
            document.createElement("i");


        sparkle.className =
            "completion-dynamic-sparkle";


        sparkle.style.left =
            `${Math.random() * 100}%`;


        sparkle.style.top =
            `${Math.random() * 100}%`;


        const size =
            1 +
            Math.random() * 3;


        sparkle.style.width =
            `${size}px`;


        sparkle.style.height =
            `${size}px`;


        sparkle.style.animationDelay =
            `${Math.random() * 3.4}s`;


        fragment.appendChild(
            sparkle
        );

    }


    container.appendChild(
        fragment
    );

}


/* =========================================================
   END BUTTON
   ========================================================= */

function setupEndButton() {

    if (!endButton) {
        return;
    }


    endButton.addEventListener(
        "click",
        () => {

            if (
                window.JACAudio &&
                typeof JACAudio.click ===
                    "function"
            ) {

                JACAudio.click();

            }


            showEndConfirmation();

        }
    );

}


/* =========================================================
   END BESTÄTIGUNG
   ========================================================= */

function showEndConfirmation() {

    if (!endConfirmation) {

        finishAssessment();

        return;

    }


    endConfirmation.classList.add(
        "visible"
    );


    endConfirmation.setAttribute(
        "aria-hidden",
        "false"
    );


    if (
        window.JACAudio &&
        typeof JACAudio.message ===
            "function"
    ) {

        JACAudio.message();

    }


    later(() => {

        finishAssessment();

    }, CONFIG.endRedirectDelay);

}


/* =========================================================
   ASSESSMENT BEENDEN
   ========================================================= */

function finishAssessment() {

    if (
        window.JACAudio &&
        typeof JACAudio.reset ===
            "function"
    ) {

        JACAudio.reset();

    }


    if (
        window.JACGameState &&
        typeof window.JACGameState.resetGame ===
            "function"
    ) {

        try {

            const success =
                window.JACGameState.resetGame();


            if (success === false) {

                console.error(
                    "JAC: Spielstand konnte nicht zurückgesetzt werden."
                );

                return;

            }

        }

        catch (error) {

            console.error(
                "JAC: Reset:",
                error
            );

            return;

        }

    }


    window.location.href =
        "index.html";

}


/* =========================================================
   ESCAPE
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape" ||
            !endConfirmation
        ) {

            return;

        }


        endConfirmation.classList.remove(
            "visible"
        );


        endConfirmation.setAttribute(
            "aria-hidden",
            "true"
        );

    }
);


/* =========================================================
   START
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeCompletion,
        {
            once: true
        }
    );

}

else {

    initializeCompletion();

}