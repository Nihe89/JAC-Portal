"use strict";

/* =====================================================
   JAC PORTAL
   AKTE 02
   VERSION 5.0
   FORENSIC ACCESS

   SYSTEM START BUTTON
   +
   5-STEP FORENSIC INTRO
   +
   EVIDENCE ANALYSIS
===================================================== */


/* =====================================================
   AUDIO
===================================================== */

function playJACSound(
    method,
    fallbackName = null,
    options = {}
) {

    if (!window.JACAudio) {

        console.warn(
            "JAC Audio nicht gefunden."
        );

        return null;

    }


    if (
        typeof window.JACAudio[method] ===
        "function"
    ) {

        try {

            return window.JACAudio[method]();

        }

        catch (error) {

            console.warn(
                "JAC Audio:",
                method,
                error
            );

        }

    }


    if (
        fallbackName &&
        typeof window.JACAudio.play ===
        "function"
    ) {

        try {

            return window.JACAudio.play(
                fallbackName,
                options
            );

        }

        catch (error) {

            console.warn(
                "JAC Audio Fallback:",
                fallbackName,
                error
            );

        }

    }


    return null;

}


/* =====================================================
   AUDIO UNLOCK
===================================================== */

async function unlockJACAudio() {

    if (
        window.JACAudio &&
        typeof window.JACAudio.unlock ===
        "function"
    ) {

        try {

            await window.JACAudio.unlock();

        }

        catch (error) {

            console.warn(
                "Audio Unlock:",
                error
            );

        }

    }

}


/* =====================================================
   ELEMENTE
===================================================== */

const startupScreen =
    document.getElementById(
        "startup-screen"
    );

const startSystemButton =
    document.getElementById(
        "start-system"
    );

const imageOrder =
    document.getElementById(
        "image-order"
    );

const checkButton =
    document.getElementById(
        "check-order"
    );

const imageModal =
    document.getElementById(
        "image-modal"
    );

const modalImage =
    document.getElementById(
        "modal-image"
    );

const closeImageModal =
    document.getElementById(
        "close-image-modal"
    );

const resultModal =
    document.getElementById(
        "result-modal"
    );

const resultIcon =
    document.getElementById(
        "result-icon"
    );

const resultTitle =
    document.getElementById(
        "result-title"
    );

const resultText =
    document.getElementById(
        "result-text"
    );

const resultButton =
    document.getElementById(
        "result-button"
    );

const completionScreen =
    document.getElementById(
        "completion-screen"
    );

const dashboardButton =
    document.getElementById(
        "dashboard-button"
    );

const progressFill =
    document.getElementById(
        "progress-fill"
    );

const progressPercent =
    document.getElementById(
        "progress-percent"
    );



/* =====================================================
   STATUS
===================================================== */

let startupRunning = false;

let startupFinished = false;

let caseCompleted = false;

let forensicScanLoop = null;

let selectedImage = null;



/* =====================================================
   FORENSIC INTRO
===================================================== */

const startupSteps = [

    {
        text:
            "JAC // FORENSIC ACCESS",

        sub:
            "Verbindung zur Fallakte wird aufgebaut",

        progress:
            18
    },

    {
        text:
            "AKTE 02 // IDENTIFIZIERUNG",

        sub:
            "Fallakte wird verifiziert",

        progress:
            38
    },

    {
        text:
            "BEWEISMATERIAL WIRD GELADEN",

        sub:
            "Forensische Datensätze werden synchronisiert",

        progress:
            61
    },

    {
        text:
            "ZUGRIFFSBERECHTIGUNG BESTÄTIGT",

        sub:
            "Analysemodul wird entsperrt",

        progress:
            84
    },

    {
        text:
            "AKTE 02 // ZUGRIFF FREIGEGEBEN",

        sub:
            "Forensisches Analysemodul bereit",

        progress:
            100
    }

];



/* =====================================================
   FORENSIC INTRO ERSTELLEN
===================================================== */

function createForensicIntro() {

    let screen =
        document.getElementById(
            "jac-forensic-intro"
        );


    if (screen) {

        return screen;

    }


    screen =
        document.createElement(
            "div"
        );


    screen.id =
        "jac-forensic-intro";


    screen.className =
        "jac-forensic-intro";


    screen.innerHTML = `

        <div class="jac-forensic-grid"></div>

        <div class="jac-forensic-scanline"></div>

        <div class="jac-forensic-noise"></div>


        <div class="jac-forensic-content">

            <div class="jac-forensic-topline">

                JAC // JUSTICE ANALYSIS CONTROL

            </div>


            <div class="jac-forensic-logo">

                JAC

            </div>


            <div class="jac-forensic-case">

                AKTE 02

            </div>


            <div class="jac-forensic-label">

                FORENSIC ACCESS

            </div>


            <div class="jac-forensic-status">

                <span
                    id="jac-forensic-status-text"
                >
                    SYSTEM INITIALISIERT
                </span>

            </div>


            <div
                class="jac-forensic-description"
                id="jac-forensic-description"
            >

                Verbindung zur Fallakte wird aufgebaut

            </div>


            <div class="jac-forensic-progress">

                <div
                    id="jac-forensic-progress-fill"
                ></div>

            </div>


            <div class="jac-forensic-data">

                <span>
                    CASE_ID: JAC-02
                </span>

                <span>
                    SECURITY: VERIFIED
                </span>

                <span>
                    MODULE: FORENSIC
                </span>

            </div>

        </div>


        <div class="jac-forensic-flash"></div>

    `;


    document.body.appendChild(
        screen
    );


    return screen;

}



/* =====================================================
   SCAN LOOP
===================================================== */

function startForensicScanLoop() {

    if (
        forensicScanLoop &&
        !forensicScanLoop.paused
    ) {

        return;

    }


    if (
        window.JACAudio &&
        typeof window.JACAudio.scanLoop ===
        "function"
    ) {

        forensicScanLoop =
            window.JACAudio.scanLoop();

    }

}


function stopForensicScanLoop() {

    if (!forensicScanLoop) {

        return;

    }


    if (
        window.JACAudio &&
        typeof window.JACAudio.stop ===
        "function"
    ) {

        window.JACAudio.stop(
            forensicScanLoop
        );

    }

    else {

        try {

            forensicScanLoop.pause();

            forensicScanLoop.currentTime =
                0;

        }

        catch (error) {}

    }


    forensicScanLoop =
        null;

}



/* =====================================================
   SYSTEM STARTEN
===================================================== */

async function startSystem() {

    if (
        startupRunning ||
        startupFinished
    ) {

        return;

    }


    startupRunning =
        true;


    if (startSystemButton) {

        startSystemButton.disabled =
            true;

        startSystemButton.textContent =
            "SYSTEM WIRD GESTARTET...";

    }


    /*
     * Browser-Audio freigeben.
     */

    await unlockJACAudio();


    /*
     * UI-Klicksound.
     */

    playJACSound(
        "click",
        "uiClick"
    );


    /*
     * Kleiner Abstand zwischen
     * Klick und Boot.
     */

    setTimeout(
        () => {

            runStartupAnimation();

        },
        150
    );

}



/* =====================================================
   STARTBUTTON
===================================================== */

if (startSystemButton) {

    startSystemButton.addEventListener(
        "click",
        startSystem
    );

}



/* =====================================================
   FORENSIC INTRO STARTEN
===================================================== */

function runStartupAnimation() {

    if (startupFinished) {

        return;

    }


    /*
     * System-Boot-Sound.
     */

    playJACSound(
        "boot",
        "systemBoot"
    );


    /*
     * Alten Startscreen ausblenden.
     */

    if (startupScreen) {

        startupScreen.classList.add(
            "hidden"
        );

    }


    /*
     * Intro erzeugen.
     */

    const screen =
        createForensicIntro();


    /*
     * Elemente.
     */

    const statusText =
        document.getElementById(
            "jac-forensic-status-text"
        );

    const description =
        document.getElementById(
            "jac-forensic-description"
        );

    const progress =
        document.getElementById(
            "jac-forensic-progress-fill"
        );

    const flash =
        screen.querySelector(
            ".jac-forensic-flash"
        );


    let step =
        0;


    function nextStep() {

        if (
            step >=
            startupSteps.length
        ) {

            finishForensicIntro(
                screen,
                flash
            );

            return;

        }


        const current =
            startupSteps[
                step
            ];


        /*
         * Text
         */

        if (statusText) {

            statusText.textContent =
                current.text;

        }


        if (description) {

            description.textContent =
                current.sub;

        }


        /*
         * Fortschritt
         */

        if (progress) {

            progress.style.width =
                current.progress +
                "%";

        }


        /*
         * Audio je Schritt
         */

        switch (step) {

            case 0:

                playJACSound(
                    "scanStart"
                );

                startForensicScanLoop();

                break;


            case 1:

                playJACSound(
                    "fingerprintScan"
                );

                break;


            case 2:

                playJACSound(
                    "processData"
                );

                break;


            case 3:

                playJACSound(
                    "fingerprintScan"
                );

                break;


            case 4:

                playJACSound(
                    "scanSuccess"
                );

                break;

        }


        step++;


        setTimeout(
            nextStep,
            700
        );

    }


    nextStep();

}



/* =====================================================
   FORENSIC INTRO ABSCHLIESSEN
===================================================== */

function finishForensicIntro(
    screen,
    flash
) {

    stopForensicScanLoop();


    playJACSound(
        "ready",
        "systemReady"
    );


    if (flash) {

        flash.classList.remove(
            "active"
        );


        void flash.offsetWidth;


        flash.classList.add(
            "active"
        );

    }


    setTimeout(
        () => {

            playJACSound(
                "sparkle"
            );

        },
        220
    );


    setTimeout(
        () => {

            screen.classList.add(
                "hidden"
            );


            startupFinished =
                true;

            startupRunning =
                false;


            setTimeout(
                () => {

                    if (
                        screen &&
                        screen.parentNode
                    ) {

                        screen.parentNode.removeChild(
                            screen
                        );

                    }

                },
                800
            );

        },
        850
    );

}



/* =====================================================
   BILDER
===================================================== */

const bilder = [

    {
        id: 1,
        datei: "bild1.png",
        position: null
    },

    {
        id: 2,
        datei: "bild2.png",
        position: null
    },

    {
        id: 3,
        datei: "bild3.png",
        position: null
    },

    {
        id: 4,
        datei: "bild4.png",
        position: null
    },

    {
        id: 5,
        datei: "bild5.png",
        position: null
    },

    {
        id: 6,
        datei: "bild6.png",
        position: null
    }

];


/*
 * Anzeige:
 *
 * 4 - 2 - 6 - 1 - 5 - 3
 *
 * Richtig:
 *
 * 1 - 2 - 3 - 4 - 5 - 6
 */

const displayOrder = [

    4,
    2,
    6,
    1,
    5,
    3

];



/* =====================================================
   BILDER ERSTELLEN
===================================================== */

function createImages() {

    if (!imageOrder) {

        return;

    }


    imageOrder.innerHTML = "";


    displayOrder.forEach(
        id => {

            const bild =
                bilder.find(
                    item =>
                        item.id === id
                );


            if (!bild) {

                return;

            }


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "evidence-item";


            card.dataset.id =
                bild.id;


            const image =
                document.createElement(
                    "img"
                );


            image.src =
                "../assets/images/akte2/" +
                bild.datei;


            image.alt =
                "Forensisches Beweismaterial " +
                bild.id;


            image.loading =
                "lazy";


            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "evidence-actions";


            const analyseButton =
                document.createElement(
                    "button"
                );


            analyseButton.type =
                "button";


            analyseButton.className =
                "evidence-button analyse-button";


            analyseButton.textContent =
                "BILD ANALYSIEREN";


            const positionButton =
                document.createElement(
                    "button"
                );


            positionButton.type =
                "button";


            positionButton.className =
                "evidence-button position-button";


            positionButton.textContent =
                "POSITION FESTLEGEN";


            const positionLabel =
                document.createElement(
                    "div"
                );


            positionLabel.className =
                "position-label";


            positionLabel.textContent =
                "POSITION: –";


            /*
             * Bildanalyse
             */

            analyseButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    playJACSound(
                        "revealEvidence",
                        "evidenceReveal"
                    );


                    openImageModal(
                        bild
                    );

                }
            );


            /*
             * Position
             */

            positionButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    playJACSound(
                        "click",
                        "uiClick"
                    );


                    selectImage(
                        bild,
                        card
                    );

                }
            );


            actions.appendChild(
                analyseButton
            );


            actions.appendChild(
                positionButton
            );


            card.appendChild(
                image
            );


            card.appendChild(
                actions
            );


            card.appendChild(
                positionLabel
            );


            imageOrder.appendChild(
                card
            );

        }
    );

}



/* =====================================================
   BILD MODAL
===================================================== */

function openImageModal(
    bild
) {

    if (
        !imageModal ||
        !modalImage
    ) {

        return;

    }


    modalImage.src =
        "../assets/images/akte2/" +
        bild.datei;


    imageModal.classList.remove(
        "hidden"
    );

}


function closeImageAnalysis() {

    if (imageModal) {

        imageModal.classList.add(
            "hidden"
        );

    }


    if (modalImage) {

        modalImage.src =
            "";

    }

}


if (closeImageModal) {

    closeImageModal.addEventListener(
        "click",
        () => {

            playJACSound(
                "click",
                "uiClick"
            );


            closeImageAnalysis();

        }
    );

}


if (imageModal) {

    imageModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                imageModal
            ) {

                closeImageAnalysis();

            }

        }
    );

}



/* =====================================================
   ESC
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        closeImageAnalysis();


        if (resultModal) {

            resultModal.classList.add(
                "hidden"
            );

        }

    }
);



/* =====================================================
   BILD AUSWÄHLEN
===================================================== */

function selectImage(
    bild,
    card
) {

    document
        .querySelectorAll(
            ".evidence-item"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "selected"
                );

            }
        );


    card.classList.add(
        "selected"
    );


    selectedImage =
        bild;


    showPositionSelector(
        card,
        bild
    );

}



/* =====================================================
   POSITIONSAUSWAHL
===================================================== */

function showPositionSelector(
    card,
    bild
) {

    const oldSelector =
        card.querySelector(
            ".position-selector"
        );


    if (oldSelector) {

        oldSelector.remove();

    }


    const selector =
        document.createElement(
            "div"
        );


    selector.className =
        "position-selector";


    selector.innerHTML = `

        <label class="position-select-label">

            ZEITLICHE POSITION

        </label>


        <select class="position-select">

            <option value="">
                Position auswählen
            </option>

            <option value="clear">
                — Position löschen —
            </option>

            <option value="1">
                Position 1
            </option>

            <option value="2">
                Position 2
            </option>

            <option value="3">
                Position 3
            </option>

            <option value="4">
                Position 4
            </option>

            <option value="5">
                Position 5
            </option>

            <option value="6">
                Position 6
            </option>

        </select>

    `;


    const select =
        selector.querySelector(
            ".position-select"
        );


    if (
        bild.position !== null
    ) {

        select.value =
            String(
                bild.position
            );

    }


    select.addEventListener(
        "change",
        () => {

            playJACSound(
                "click",
                "uiClick"
            );


            if (
                select.value ===
                "clear"
            ) {

                bild.position =
                    null;


                card.classList.remove(
                    "position-set"
                );


                updateCardLabel(
                    card,
                    null
                );


                select.value =
                    "";

                return;

            }


            if (
                select.value ===
                ""
            ) {

                return;

            }


            setPositionForImage(
                bild,
                Number(
                    select.value
                ),
                card
            );

        }
    );


    card.appendChild(
        selector
    );

}



/* =====================================================
   POSITION SETZEN
===================================================== */

function setPositionForImage(
    bild,
    position,
    card
) {

    const existingImage =
        bilder.find(
            item =>
                item.position ===
                position &&
                item !== bild
        );


    if (existingImage) {

        playJACSound(
            "scanDenied"
        );


        showResultPopup(
            "warning",
            "POSITION BEREITS VERGEBEN",
            "Diese Position wurde bereits einem anderen Beweisbild zugeordnet.",
            "SCHLIESSEN"
        );


        const select =
            card.querySelector(
                ".position-select"
            );


        if (select) {

            select.value =
                bild.position !== null
                    ? String(
                        bild.position
                    )
                    : "";

        }


        return;

    }


    bild.position =
        position;


    card.classList.add(
        "position-set"
    );


    updateCardLabel(
        card,
        position
    );


    const selector =
        card.querySelector(
            ".position-selector"
        );


    if (selector) {

        selector.classList.add(
            "position-confirmed"
        );

    }


    selectedImage =
        bild;


    updateProgress();

}



/* =====================================================
   LABEL
===================================================== */

function updateCardLabel(
    card,
    position
) {

    const label =
        card.querySelector(
            ".position-label"
        );


    if (!label) {

        return;

    }


    label.textContent =
        position === null
            ? "POSITION: –"
            : "POSITION: " +
              position;

}



/* =====================================================
   FORTSCHRITT
===================================================== */

function updateProgress() {

    const assigned =
        bilder.filter(
            bild =>
                bild.position !== null
        ).length;


    const percent =
        Math.round(
            (
                assigned /
                bilder.length
            ) *
            100
        );


    if (progressFill) {

        progressFill.style.width =
            percent + "%";

    }


    if (progressPercent) {

        progressPercent.textContent =
            percent + " %";

    }

}



/* =====================================================
   REIHENFOLGE PRÜFEN
===================================================== */

if (checkButton) {

    checkButton.addEventListener(
        "click",
        () => {

            playJACSound(
                "click",
                "uiClick"
            );


            checkOrder();

        }
    );

}



function checkOrder() {

    const allPositionsAssigned =
        bilder.every(
            bild =>
                bild.position !== null
        );


    if (!allPositionsAssigned) {

        playJACSound(
            "scanDenied"
        );


        showResultPopup(
            "warning",
            "ANALYSE NICHT ABGESCHLOSSEN",
            "Bitte legen Sie zunächst für alle sechs Beweisbilder eine zeitliche Position fest.",
            "SCHLIESSEN"
        );


        return;

    }


    playJACSound(
        "scanStart"
    );


    const correct =
        bilder.every(
            bild =>
                bild.position ===
                bild.id
        );


    if (correct) {

        playJACSound(
            "scanSuccess"
        );


        showResultPopup(
            "success",
            "ANALYSE ERFOLGREICH",
            "Die zeitliche Reihenfolge der sechs Beweismittel wurde korrekt rekonstruiert.",
            "AKTE ABSCHLIESSEN"
        );

    }

    else {

        playJACSound(
            "scanDenied"
        );


        showResultPopup(
            "error",
            "ANALYSE NICHT KORREKT",
            "Die zeitliche Reihenfolge der Beweismittel ist noch nicht korrekt. Überprüfen Sie Ihre Zuordnung und versuchen Sie es erneut.",
            "ERNEUT VERSUCHEN"
        );

    }

}



/* =====================================================
   RESULT POPUP
===================================================== */

function showResultPopup(
    type,
    title,
    text,
    buttonText
) {

    if (!resultModal) {

        return;

    }


    resultModal.classList.remove(
        "hidden"
    );


    resultModal.dataset.type =
        type;


    if (resultIcon) {

        resultIcon.textContent =
            type === "success"
                ? "✓"
                : type === "error"
                    ? "!"
                    : "i";

    }


    if (resultTitle) {

        resultTitle.textContent =
            title;

    }


    if (resultText) {

        resultText.textContent =
            text;

    }


    if (resultButton) {

        resultButton.textContent =
            buttonText;

    }

}



/* =====================================================
   RESULT BUTTON
===================================================== */

if (resultButton) {

    resultButton.addEventListener(
        "click",
        () => {

            playJACSound(
                "click",
                "uiClick"
            );


            const type =
                resultModal.dataset.type;


            resultModal.classList.add(
                "hidden"
            );


            if (
                type ===
                "success"
            ) {

                completeCase2();

            }

        }
    );

}



/* =====================================================
   AKTE 2 ABSCHLIESSEN
===================================================== */

function completeCase2() {

    if (caseCompleted) {

        return;

    }


    if (
        !window.JACGameState ||
        typeof window.JACGameState.completeCase !==
        "function"
    ) {

        console.error(
            "JAC: gameState.js oder completeCase() fehlt."
        );


        playJACSound(
            "scanDenied"
        );


        return;

    }


    const success =
        window.JACGameState.completeCase(
            2
        );


    if (!success) {

        console.error(
            "JAC: Akte 02 konnte nicht abgeschlossen werden."
        );


        playJACSound(
            "scanDenied"
        );


        return;

    }


    caseCompleted =
        true;


    console.log(
        "JAC: AKTE 02 erfolgreich abgeschlossen."
    );


    playJACSound(
        "completeCase"
    );


    setTimeout(
        () => {

            playJACSound(
                "sparkle"
            );

        },
        300
    );


    showCompletionScreen();

}



/* =====================================================
   ABSCHLUSSBILDSCHIRM
===================================================== */

function showCompletionScreen() {

    if (!completionScreen) {

        return;

    }


    completionScreen.classList.remove(
        "hidden"
    );


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}



/* =====================================================
   DASHBOARD
===================================================== */

if (dashboardButton) {

    dashboardButton.addEventListener(
        "click",
        () => {

            playJACSound(
                "click",
                "uiClick"
            );


            window.location.href =
                "dashboard.html";

        }
    );

}



/* =====================================================
   INITIALISIERUNG
===================================================== */

createImages();

updateProgress();


console.log(
    "JAC: Akte 02 geladen."
);

console.log(
    "JAC: System wartet auf SYSTEM STARTEN."
);