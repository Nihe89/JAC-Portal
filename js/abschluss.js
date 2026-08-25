"use strict";

/* =========================================================
   JAC PORTAL
   ABSCHLUSS
   FINALE GOLD-SEQUENZ
   ========================================================= */


/* =========================================================
   KONFIGURATION
========================================================= */

const CONFIG = {

    /* Start */
    overlayLeaving: 700,
    logoDelay: 100,

    /* Akten */
    caseStart: 850,
    caseStep: 900,

    /*
     * Zeit zwischen:
     *
     * Akte 1 → Akte 2 → Akte 3 → Akte 4 → Akte 5
     */

    caseGoldDelay: 350,

    /* Energie nach letzter goldener Akte */
    energyDelay: 700,

    /* Hauptfeuerwerk */
    fireworksDelay: 1800,

    /* Abschluss */
    completionDelay: 10400,
    completionMessageDelay: 1150,

    /* Rückkehr Login */
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


/*
 * Alle Timer sammeln.
 */

const timers = new Set();


/* =========================================================
   TIMER
========================================================= */

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
   AUDIO
========================================================= */

/*
 * Zentraler Audio-Aufruf.
 *
 * Dadurch bleibt die Abschlussanimation robust,
 * falls ein Sound einmal nicht geladen werden kann.
 */

function playAudio(method) {

    if (
        !window.JACAudio ||
        typeof window.JACAudio[method] !== "function"
    ) {

        return;

    }

    try {

        window.JACAudio[method]();

    }

    catch (error) {

        console.warn(
            `JAC Audio "${method}":`,
            error
        );

    }

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
     * Start-Overlay anzeigen.
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

    if (finalScreen) {

        finalScreen.classList.remove(
            "running",
            "final-finished"
        );

        finalScreen.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    /*
     * Akten zurücksetzen.
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
     * Abschlussbildschirm zurücksetzen.
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
   START-OVERLAY
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
     * Enter / Leertaste
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
     * Audio entsperren.
     *
     * Noch KEIN Final-Sound.
     */

    if (
        window.JACAudio &&
        typeof window.JACAudio.unlock === "function"
    ) {

        try {

            await window.JACAudio.unlock();

        }

        catch (error) {

            console.warn(
                "JAC Audio Unlock:",
                error
            );

        }

    }


    /*
     * Nur Button-Klick.
     */

    playAudio(
        "click"
    );


    /*
     * Overlay schließen.
     */

    if (startOverlay) {

        startOverlay.classList.add(
            "hidden"
        );

        startOverlay.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    later(
        startFinalAnimation,
        CONFIG.overlayLeaving
    );

}


/* =========================================================
   FINALE STARTEN
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
     * Finale sichtbar.
     */

    finalScreen.classList.add(
        "running"
    );

    finalScreen.setAttribute(
        "aria-hidden",
        "false"
    );


    /*
     * Abschlussbildschirm sicher verstecken.
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
     * WICHTIG:
     *
     * KEIN finalReveal()!
     *
     * Dadurch startet die Animation ohne
     * eine Sound-Kaskade.
     */


    /* =====================================================
       LOGO
    ===================================================== */

    later(() => {

        if (finalStage) {

            finalStage.classList.add(
                "logo-ready"
            );

        }

    }, CONFIG.logoDelay);


    /* =====================================================
       AKTEN SICHTBAR MACHEN
       
       Noch KEIN SOUND!
    ===================================================== */

    cases.forEach((card, index) => {

        later(() => {

            card.classList.add(
                "case-visible"
            );

        },
        CONFIG.caseStart +
        index * CONFIG.caseStep);

    });


    /* =====================================================
       AKTEN GOLD MACHEN
       
       JEDE AKTE:
       
       GOLD
       +
       derselbe sparkle-Sound
    ===================================================== */

    cases.forEach((card, index) => {

        const goldTime =
            CONFIG.caseStart +
            index * CONFIG.caseStep +
            CONFIG.caseGoldDelay;


        later(() => {

            /*
             * Akte wird GOLD.
             */

            card.classList.add(
                "gold"
            );


            /*
             * Gold-Partikel.
             */

            createCaseGoldBurst(
                card
            );


            /*
             * =================================================
             * AUDIO
             * =================================================
             *
             * ALLE fünf Akten bekommen exakt denselben Sound.
             *
             * Auch Akte 5!
             */

            playAudio(
                "sparkle"
            );

        },
        goldTime);

    });


    /* =====================================================
       ALLE AKTEN GOLD
    ===================================================== */

    const lastCaseGoldTime =
        CONFIG.caseStart +
        (cases.length - 1) *
        CONFIG.caseStep +
        CONFIG.caseGoldDelay;


    const allGoldAt =
        lastCaseGoldTime +
        CONFIG.energyDelay;


    /* =====================================================
       ENERGIEAUFBAU
    ===================================================== */

    later(() => {

        /*
         * Energie-Linien starten.
         */

        if (energyLines) {

            energyLines.classList.add(
                "active"
            );

        }


        /*
         * Logo intensivieren.
         */

        if (finalStage) {

            finalStage.classList.add(
                "logo-intense"
            );

        }


        /*
         * Sparkle-Ring.
         */

        createLogoSparkleRing();


        /*
         * Blitzring.
         */

        createLightningBurst(
            14
        );


        /*
         * Größerer Sound als bei den Akten.
         */

        playAudio(
            "doubleSparkle"
        );

    },
    allGoldAt);


    /* =====================================================
       GROSSES HAUPTFEUERWERK
    ===================================================== */

    later(() => {

        /*
         * Feuerwerk erzeugen.
         */

        createLogoFirework();


        /*
         * Finaler großer Sound.
         */

        playAudio(
            "finalComplete"
        );

    },
    allGoldAt +
    CONFIG.fireworksDelay);


    /* =====================================================
       FEUERWERK WELLE 1
    ===================================================== */

    later(
        () => {

            createFireworkWave(
                5
            );

        },
        allGoldAt +
        CONFIG.fireworksDelay +
        800
    );


    /* =====================================================
       FEUERWERK WELLE 2
    ===================================================== */

    later(
        () => {

            createFireworkWave(
                4
            );

        },
        allGoldAt +
        CONFIG.fireworksDelay +
        1550
    );


    /* =====================================================
       FEUERWERK WELLE 3
    ===================================================== */

    later(
        () => {

            createFireworkWave(
                5
            );

        },
        allGoldAt +
        CONFIG.fireworksDelay +
        2300
    );


    /* =====================================================
       ÜBERGANG
    ===================================================== */

    later(() => {

        if (transitionFlash) {

            transitionFlash.classList.add(
                "active"
            );

        }

    },
    CONFIG.completionDelay - 450);


    /* =====================================================
       ABSCHLUSSBILDSCHIRM
    ===================================================== */

    later(
        showCompletionScreen,
        CONFIG.completionDelay
    );

}


/* =========================================================
   HINTERGRUND-STERNE
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
            document.createElement(
                "i"
            );


        star.style.left =
            `${Math.random() * 100}%`;


        star.style.top =
            `${Math.random() * 100}%`;


        star.style.animationDelay =
            `${Math.random() * 3}s`;


        star.style.opacity =
            `${0.15 + Math.random() * 0.55}`;


        fragment.appendChild(
            star
        );

    }


    container.appendChild(
        fragment
    );

}


/* =========================================================
   GOLD-BURST
========================================================= */

function createCaseGoldBurst(
    card
) {

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
            document.createElement(
                "span"
            );


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
   LOGO SPARKLE RING
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
            document.createElement(
                "span"
            );


        particle.className =
            "sparkle";


        const angle =
            (
                Math.PI *
                2 /
                32
            ) *
            i;


        const distance =
            100 +
            Math.random() *
            110;


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
            document.createElement(
                "span"
            );


        bolt.className =
            "lightning-bolt";


        bolt.style.setProperty(
            "--angle",
            `${(360 / count) * i +
            (Math.random() * 12 - 6)}deg`
        );


        bolt.style.animationDelay =
            `${Math.random() * 0.2}s`;


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


    createFireworkAt(
        x,
        y,
        52,
        150,
        220
    );


    createLightningBurst(
        18
    );

}


/* =========================================================
   FEUERWERK HELFER
========================================================= */

function createFireworkAt(
    x,
    y,
    count,
    minDistance,
    maxDistance
) {

    if (!fireworkContainer) {

        return;

    }


    const core =
        document.createElement(
            "div"
        );


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


    const fragment =
        document.createDocumentFragment();


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const particle =
            document.createElement(
                "span"
            );


        particle.className =
            "firework-particle";


        const angle =
            (
                Math.PI *
                2 /
                count
            ) *
            i +
            (
                Math.random() -
                0.5
            ) *
            0.16;


        const distance =
            minDistance +
            Math.random() *
            (
                maxDistance -
                minDistance
            );


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
            `${Math.random() * 0.18}s`
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

    }, 1900);

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
                    0.5
            )
            .slice(
                0,
                count
            );


    selected.forEach(
        (
            position,
            index
        ) => {

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

    const x =
        window.innerWidth *
        percentX /
        100;


    const y =
        window.innerHeight *
        percentY /
        100;


    createFireworkAt(
        x,
        y,
        26,
        65,
        155
    );

}


/* =========================================================
   ABSCHLUSSBILDSCHIRM
========================================================= */

function showCompletionScreen() {

    if (!completionScreen) {

        return;

    }


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


    completionScreen.classList.add(
        "visible"
    );


    completionScreen.setAttribute(
        "aria-hidden",
        "false"
    );


    createCompletionSparkles();


    /*
     * KEIN finalComplete() MEHR HIER.
     *
     * Der finale Sound wurde bereits beim
     * großen Feuerwerk abgespielt.
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


        /*
         * System-Meldungston.
         */

        playAudio(
            "message"
        );

    },
    CONFIG.completionMessageDelay);

}


/* =========================================================
   ABSCHLUSS-GLITZER
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
            document.createElement(
                "i"
            );


        sparkle.className =
            "completion-dynamic-sparkle";


        sparkle.style.left =
            `${Math.random() * 100}%`;


        sparkle.style.top =
            `${Math.random() * 100}%`;


        const size =
            1 +
            Math.random() *
            3;


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

        console.error(
            "JAC: end-button nicht gefunden."
        );

        return;

    }


    endButton.addEventListener(
        "click",
        handleEndButton
    );

}


/* =========================================================
   ASSESSMENT BEENDEN
========================================================= */

function handleEndButton() {

    playAudio(
        "click"
    );


    showEndConfirmation();

}


/* =========================================================
   BESTÄTIGUNG
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


    playAudio(
        "message"
    );


    later(
        finishAssessment,
        CONFIG.endRedirectDelay
    );

}


/* =========================================================
   SPIELSTAND ZURÜCKSETZEN
========================================================= */

function finishAssessment() {

    console.log(
        "JAC: Assessment wird beendet..."
    );


    /*
     * AUDIO RESET
     */

    if (
        window.JACAudio &&
        typeof window.JACAudio.reset === "function"
    ) {

        try {

            window.JACAudio.reset();

        }

        catch (error) {

            console.warn(
                "JAC Audio Reset:",
                error
            );

        }

    }


    /*
     * GAMESTATE RESET
     */

    if (
        window.JACGameState &&
        typeof window.JACGameState.resetGame === "function"
    ) {

        try {

            window.JACGameState.resetGame();

        }

        catch (error) {

            console.error(
                "JAC GameState Reset:",
                error
            );

        }

    }


    /*
     * LOCAL STORAGE
     */

    try {

        localStorage.removeItem(
            "jacPortalSave"
        );

    }

    catch (error) {

        console.warn(
            "JAC localStorage:",
            error
        );

    }


    /*
     * SESSION STORAGE
     */

    try {

        sessionStorage.clear();

    }

    catch (error) {

        console.warn(
            "JAC sessionStorage:",
            error
        );

    }


    /*
     * GITHUB PAGES
     *
     * /JAC-Portal/src/abschluss.html
     *
     * zurück zu:
     *
     * /JAC-Portal/src/login.html
     */

    const basePath =
        window.location.pathname
            .split("/src/")[0];


    const loginUrl =
        `${basePath}/src/login.html`;


    console.log(
        "JAC: Rückkehr zu:",
        loginUrl
    );


    window.location.replace(
        loginUrl
    );

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
    document.readyState === "loading"
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