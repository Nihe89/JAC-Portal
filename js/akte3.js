"use strict";

/* =====================================================
   JAC PORTAL
   AKTE 03
   AUDIO FORENSICS
   VERSION 5.0

   SYSTEM START BUTTON
   4 AUSSAGEN → 4 VERDÄCHTIGE FREIGABE
===================================================== */


/* =====================================================
   DOM
===================================================== */

let startupScreen = null;

let systemStartPanel = null;

let systemStartButton = null;

let audioStartupBox = null;

let startupText = null;

let startupProgress = null;

let startupPercent = null;

let visualizerBars = [];

let signalItems = [];

let signalIndicator = null;

let suspectItems = [];

let checkSuspectButton = null;

let resultModal = null;

let resultIcon = null;

let resultTitle = null;

let resultText = null;

let resultButton = null;

let completionScreen = null;

let dashboardButton = null;

let audioPlayers = [];

let witnessProgress = null;

let suspectStatus = null;

let suspectHint = null;


/* =====================================================
   STATUS
===================================================== */

let systemStarted = false;

let selectedSuspect = null;

let analysisCompleted = false;

let heardStatements = 0;

const completedStatements =
    new Set();

let suspectsUnlocked = false;

let caseCompleted = false;


/* =====================================================
   RICHTIGER VERDÄCHTIGER
===================================================== */

const correctSuspect = 3;


/* =====================================================
   ERFORDERLICHE AUSSAGEN
===================================================== */

const REQUIRED_STATEMENTS = 4;


/* =====================================================
   SCAN LOOP
===================================================== */

let akte3ScanLoop = null;


/* =====================================================
   STARTANIMATION
===================================================== */

const startupSteps = [

    {
        text:
            "AUDIO-SYSTEM WIRD INITIALISIERT...",
        percent: 8
    },

    {
        text:
            "AKUSTISCHES SIGNAL WIRD ERFASST...",
        percent: 28
    },

    {
        text:
            "ZEUGENAUSSAGEN WERDEN ANALYSIERT...",
        percent: 52
    },

    {
        text:
            "SIGNALMUSTER WERDEN ABGEGLICHEN...",
        percent: 76
    },

    {
        text:
            "FORENSISCHES AUDIO-MODUL BEREIT.",
        percent: 100
    }

];


/* =====================================================
   DOM INITIALISIEREN
===================================================== */

function initializeAkte3DOM() {

    startupScreen =
        document.getElementById(
            "startup-screen"
        );


    systemStartPanel =
        document.getElementById(
            "system-start-panel"
        );


    systemStartButton =
        document.getElementById(
            "system-start-button"
        );


    audioStartupBox =
        document.getElementById(
            "audio-startup-box"
        );


    startupText =
        document.getElementById(
            "startup-text"
        );


    startupProgress =
        document.getElementById(
            "startup-progress"
        );


    startupPercent =
        document.getElementById(
            "startup-percent"
        );


    visualizerBars =
        document.querySelectorAll(
            ".audio-visualizer span"
        );


    signalItems =
        document.querySelectorAll(
            ".audio-analysis-item"
        );


    signalIndicator =
        document.querySelector(
            ".signal-indicator"
        );


    suspectItems =
        document.querySelectorAll(
            ".suspect-item"
        );


    checkSuspectButton =
        document.getElementById(
            "check-suspect"
        );


    resultModal =
        document.getElementById(
            "result-modal"
        );


    resultIcon =
        document.getElementById(
            "result-icon"
        );


    resultTitle =
        document.getElementById(
            "result-title"
        );


    resultText =
        document.getElementById(
            "result-text"
        );


    resultButton =
        document.getElementById(
            "result-button"
        );


    completionScreen =
        document.getElementById(
            "completion-screen"
        );


    dashboardButton =
        document.getElementById(
            "dashboard-button"
        );


    audioPlayers =
        document.querySelectorAll(
            "#witness-list audio"
        );


    witnessProgress =
        document.getElementById(
            "witness-progress"
        );


    suspectStatus =
        document.getElementById(
            "suspect-status"
        );


    suspectHint =
        document.getElementById(
            "suspect-hint"
        );


    console.log(
        "JAC AKTE 03 DOM:",
        "Aussagen:",
        audioPlayers.length,
        "Verdächtige:",
        suspectItems.length
    );

}


/* =====================================================
   AUDIO HELFER
===================================================== */

function playJAC3(
    soundName,
    options = {}
) {

    if (
        !window.JACAudio ||
        typeof window.JACAudio.play !==
            "function"
    ) {

        console.warn(
            "JACAudio nicht verfügbar:",
            soundName
        );

        return null;

    }


    try {

        return window.JACAudio.play(
            soundName,
            options
        );

    }

    catch (error) {

        console.warn(
            "JAC AKTE 03 Audio:",
            soundName,
            error
        );

        return null;

    }

}


/* =====================================================
   SYSTEM START
===================================================== */

function setupSystemStart() {

    if (!systemStartButton) {

        console.error(
            "JAC: System-Start-Button nicht gefunden."
        );

        return;

    }


    systemStartButton.addEventListener(
        "click",
        async () => {

            if (systemStarted) {

                return;

            }


            systemStarted = true;


            /*
             * Audio darf jetzt aufgrund
             * echter Benutzerinteraktion
             * freigeschaltet werden.
             */

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
                        "JAC Audio Unlock:",
                        error
                    );

                }

            }


            /*
             * Button-Klick
             */

            playJAC3(
                "uiClick",
                {
                    volume: 0.30
                }
            );


            systemStartButton.disabled =
                true;


            /*
             * Startpanel ausblenden
             */

            if (systemStartPanel) {

                systemStartPanel.classList.add(
                    "hidden"
                );

            }


            /*
             * Startanimation anzeigen
             */

            setTimeout(
                () => {

                    if (audioStartupBox) {

                        audioStartupBox.classList.remove(
                            "hidden"
                        );

                    }


                    /*
                     * SYSTEM BOOT
                     *
                     * Wichtig:
                     * Dieser Sound wird NUR hier
                     * gestartet.
                     */

                    playJAC3(
                        "systemBoot",
                        {
                            volume: 0.50
                        }
                    );


                    /*
                     * Audio Forensics
                     */

                    startAudioForensicsAnimation();

                },
                120
            );

        }
    );

}


/* =====================================================
   SCAN LOOP START
===================================================== */

function startAkte3ScanSound() {

    if (
        akte3ScanLoop &&
        !akte3ScanLoop.paused
    ) {

        return;

    }


    akte3ScanLoop =
        playJAC3(
            "scanLoop",
            {
                volume: 0.16,
                loop: true
            }
        );

}


/* =====================================================
   SCAN LOOP STOP
===================================================== */

function stopAkte3ScanSound() {

    if (!akte3ScanLoop) {

        return;

    }


    if (
        window.JACAudio &&
        typeof window.JACAudio.stop ===
            "function"
    ) {

        try {

            window.JACAudio.stop(
                akte3ScanLoop
            );

        }

        catch (error) {

            console.warn(
                "JAC ScanLoop konnte nicht gestoppt werden:",
                error
            );

        }

    }


    akte3ScanLoop = null;

}


/* =====================================================
   STARTANIMATION
===================================================== */

function startAudioForensicsAnimation() {

    if (!audioStartupBox) {

        console.warn(
            "JAC: Audio-Startup-Box nicht gefunden."
        );

        return;

    }


    /*
     * Fortschritt zurücksetzen
     */

    if (startupProgress) {

        startupProgress.style.width =
            "0%";

    }


    if (startupPercent) {

        startupPercent.textContent =
            "0 %";

    }


    if (startupText) {

        startupText.textContent =
            startupSteps[0].text;

    }


    /*
     * Signalstatus zurücksetzen
     */

    signalItems.forEach(
        item => {

            item.classList.remove(
                "active",
                "complete",
                "scanning"
            );


            const state =
                item.querySelector(
                    ".analysis-state"
                );


            if (state) {

                state.textContent =
                    "—";

            }

        }
    );


    /*
     * Visualizer zurücksetzen
     */

    visualizerBars.forEach(
        bar => {

            bar.classList.remove(
                "active",
                "pulse"
            );


            bar.style.height =
                "8px";

        }
    );


    /*
     * Signalindikator
     */

    if (signalIndicator) {

        signalIndicator.classList.remove(
            "active"
        );

    }


    /*
     * Scanloop
     */

    startAkte3ScanSound();


    /*
     * Animationen
     */

    animateAudioVisualizer();

    runSignalAnalysis();

}


/* =====================================================
   AUDIO VISUALIZER
===================================================== */

function animateAudioVisualizer() {

    if (
        !visualizerBars ||
        visualizerBars.length === 0
    ) {

        return;

    }


    let wavePosition = 0;


    const waveInterval =
        setInterval(
            () => {

                if (
                    !audioStartupBox ||
                    audioStartupBox.classList.contains(
                        "hidden"
                    )
                ) {

                    clearInterval(
                        waveInterval
                    );

                    return;

                }


                visualizerBars.forEach(
                    (bar, index) => {

                        const distance =
                            Math.abs(
                                index -
                                wavePosition
                            );


                        let height = 8;


                        if (
                            distance === 0
                        ) {

                            height = 46;

                        }

                        else if (
                            distance === 1
                        ) {

                            height = 36;

                        }

                        else if (
                            distance === 2
                        ) {

                            height = 27;

                        }

                        else if (
                            distance === 3
                        ) {

                            height = 20;

                        }

                        else if (
                            distance === 4
                        ) {

                            height = 15;

                        }


                        const variation =
                            Math.round(
                                Math.random() * 5
                            );


                        bar.style.height =
                            (
                                height +
                                variation
                            ) + "px";


                        if (
                            distance <= 2
                        ) {

                            bar.classList.add(
                                "active"
                            );

                        }

                        else {

                            bar.classList.remove(
                                "active"
                            );

                        }

                    }
                );


                wavePosition++;


                if (
                    wavePosition >=
                    visualizerBars.length
                ) {

                    wavePosition = 0;

                }

            },
            85
        );

}


/* =====================================================
   SIGNALANALYSE
===================================================== */

function runSignalAnalysis() {

    let step = 0;


    const signalInterval =
        setInterval(
            () => {

                if (
                    step >=
                    startupSteps.length
                ) {

                    clearInterval(
                        signalInterval
                    );


                    finishAudioForensicsAnimation();


                    return;

                }


                const current =
                    startupSteps[step];


                if (startupText) {

                    startupText.textContent =
                        current.text;

                }


                if (startupProgress) {

                    startupProgress.style.width =
                        current.percent + "%";

                }


                if (startupPercent) {

                    startupPercent.textContent =
                        current.percent + " %";

                }


                if (
                    signalItems[step]
                ) {

                    signalItems[
                        step
                    ].classList.add(
                        "active",
                        "scanning"
                    );


                    const state =
                        signalItems[
                            step
                        ].querySelector(
                            ".analysis-state"
                        );


                    if (state) {

                        state.textContent =
                            "SCAN";

                    }

                }


                if (
                    step > 0 &&
                    signalItems[step - 1]
                ) {

                    signalItems[
                        step - 1
                    ].classList.remove(
                        "scanning"
                    );


                    signalItems[
                        step - 1
                    ].classList.add(
                        "complete"
                    );


                    const previousState =
                        signalItems[
                            step - 1
                        ].querySelector(
                            ".analysis-state"
                        );


                    if (previousState) {

                        previousState.textContent =
                            "OK";

                    }

                }


                if (signalIndicator) {

                    signalIndicator.classList.add(
                        "active"
                    );

                }


                /*
                 * Datenverarbeitung
                 */

                if (
                    step === 1 ||
                    step === 2 ||
                    step === 3
                ) {

                    playJAC3(
                        "dataProcess",
                        {
                            volume: 0.24
                        }
                    );

                }


                /*
                 * System Ready
                 */

                if (
                    current.percent === 100
                ) {

                    playJAC3(
                        "systemReady",
                        {
                            volume: 0.48
                        }
                    );

                }


                step++;

            },
            700
        );

}


/* =====================================================
   FORENSICS ABSCHLUSS
===================================================== */

function finishAudioForensicsAnimation() {

    signalItems.forEach(
        item => {

            item.classList.remove(
                "scanning"
            );


            item.classList.add(
                "complete"
            );


            const state =
                item.querySelector(
                    ".analysis-state"
                );


            if (state) {

                state.textContent =
                    "OK";

            }

        }
    );


    if (signalIndicator) {

        signalIndicator.classList.add(
            "active"
        );

    }


    if (startupProgress) {

        startupProgress.style.width =
            "100%";

    }


    if (startupPercent) {

        startupPercent.textContent =
            "100 %";

    }


    if (startupText) {

        startupText.textContent =
            "FORENSISCHES AUDIO-MODUL BEREIT.";

    }


    /*
     * Scanloop stoppen
     */

    setTimeout(
        () => {

            stopAkte3ScanSound();

        },
        500
    );


    /*
     * Startscreen ausblenden
     */

    setTimeout(
        () => {

            if (!startupScreen) {

                return;

            }


            startupScreen.style.opacity =
                "0";


            setTimeout(
                () => {

                    if (startupScreen) {

                        startupScreen.classList.add(
                            "hidden"
                        );

                    }

                },
                700
            );

        },
        900
    );

}


/* =====================================================
   VERDÄCHTIGE SOFORT SPERREN
===================================================== */

function lockSuspects() {

    suspectsUnlocked =
        false;

    selectedSuspect =
        null;


    suspectItems.forEach(
        item => {

            item.disabled =
                true;


            item.setAttribute(
                "aria-disabled",
                "true"
            );


            item.classList.add(
                "suspects-locked"
            );


            item.classList.remove(
                "suspects-unlocked",
                "selected"
            );

        }
    );


    if (checkSuspectButton) {

        checkSuspectButton.disabled =
            true;


        checkSuspectButton.setAttribute(
            "aria-disabled",
            "true"
        );

    }


    updateWitnessProgress();


    console.log(
        "JAC: Verdächtige gesperrt."
    );

}


/* =====================================================
   VERDÄCHTIGEN-AUSWAHL
===================================================== */

function setupSuspectSelection() {

    suspectItems.forEach(
        (item, index) => {

            item.addEventListener(
                "click",
                event => {

                    /*
                     * Absolute Sicherheit
                     */

                    if (
                        !suspectsUnlocked ||
                        heardStatements !==
                            REQUIRED_STATEMENTS
                    ) {

                        event.preventDefault();

                        event.stopPropagation();


                        playJAC3(
                            "error",
                            {
                                volume: 0.28
                            }
                        );


                        return;

                    }


                    /*
                     * Auswahl
                     */

                    selectedSuspect =
                        Number(
                            item.dataset.suspect ||
                            index + 1
                        );


                    suspectItems.forEach(
                        other => {

                            other.classList.remove(
                                "selected"
                            );

                        }
                    );


                    item.classList.add(
                        "selected"
                    );


                    playJAC3(
                        "uiClick",
                        {
                            volume: 0.30
                        }
                    );


                    console.log(
                        "JAC: Verdächtiger ausgewählt:",
                        selectedSuspect
                    );

                }
            );

        }
    );

}


/* =====================================================
   ZEUGENAUSSAGEN
===================================================== */

function setupWitnessAudio() {

    audioPlayers.forEach(
        (audio, index) => {

            audio.dataset.aussage =
                String(
                    index + 1
                );


            /*
             * START
             */

            audio.addEventListener(
                "play",
                () => {

                    audioPlayers.forEach(
                        otherAudio => {

                            if (
                                otherAudio !==
                                audio
                            ) {

                                otherAudio.pause();

                            }

                        }
                    );


                    const parent =
                        audio.closest(
                            ".witness-item"
                        );


                    if (parent) {

                        parent.classList.add(
                            "audio-active"
                        );

                    }


                    playJAC3(
                        "uiClick",
                        {
                            volume: 0.22
                        }
                    );


                    console.log(
                        "JAC: Aussage",
                        index + 1,
                        "gestartet."
                    );

                }
            );


            /*
             * PAUSE
             *
             * zählt NICHT
             */

            audio.addEventListener(
                "pause",
                () => {

                    const parent =
                        audio.closest(
                            ".witness-item"
                        );


                    if (parent) {

                        parent.classList.remove(
                            "audio-active"
                        );

                    }

                }
            );


            /*
             * ENDED
             *
             * NUR HIER zählt sie.
             */

            audio.addEventListener(
                "ended",
                () => {

                    const parent =
                        audio.closest(
                            ".witness-item"
                        );


                    if (parent) {

                        parent.classList.remove(
                            "audio-active"
                        );


                        parent.classList.add(
                            "audio-complete"
                        );

                    }


                    /*
                     * Bereits gezählt?
                     */

                    if (
                        completedStatements.has(
                            index
                        )
                    ) {

                        return;

                    }


                    /*
                     * Aussage speichern
                     */

                    completedStatements.add(
                        index
                    );


                    heardStatements =
                        completedStatements.size;


                    updateWitnessProgress();


                    console.log(
                        "JAC:",
                        heardStatements,
                        "/",
                        REQUIRED_STATEMENTS,
                        "Aussagen vollständig gehört."
                    );


                    /*
                     * ERST BEI 4/4 FREISCHALTEN
                     */

                    if (
                        heardStatements ===
                        REQUIRED_STATEMENTS
                    ) {

                        unlockSuspects();

                    }

                }
            );

        }
    );


    /*
     * Sicherheitsprüfung
     */

    if (
        audioPlayers.length !==
        REQUIRED_STATEMENTS
    ) {

        console.warn(
            "JAC: Erwartet werden",
            REQUIRED_STATEMENTS,
            "Aussagen. Gefunden:",
            audioPlayers.length
        );

    }

}


/* =====================================================
   FORTSCHRITT ANZEIGEN
===================================================== */

function updateWitnessProgress() {

    if (!witnessProgress) {

        return;

    }


    if (
        heardStatements >=
        REQUIRED_STATEMENTS
    ) {

        witnessProgress.textContent =
            "✓ 4 / 4 AUSSAGEN ANGEHÖRT – ANALYSE FREIGEGEBEN";


        witnessProgress.classList.add(
            "complete"
        );

    }

    else {

        witnessProgress.textContent =
            heardStatements +
            " / " +
            REQUIRED_STATEMENTS +
            " AUSSAGEN ANGEHÖRT";


        witnessProgress.classList.remove(
            "complete"
        );

    }

}


/* =====================================================
   VERDÄCHTIGE FREISCHALTEN
===================================================== */

function unlockSuspects() {

    /*
     * Sicherheitsprüfung
     */

    if (
        heardStatements !==
        REQUIRED_STATEMENTS
    ) {

        suspectsUnlocked =
            false;

        return;

    }


    suspectsUnlocked =
        true;


    suspectItems.forEach(
        item => {

            item.disabled =
                false;


            item.removeAttribute(
                "aria-disabled"
            );


            item.classList.remove(
                "suspects-locked"
            );


            item.classList.add(
                "suspects-unlocked"
            );

        }
    );


    if (checkSuspectButton) {

        checkSuspectButton.disabled =
            false;


        checkSuspectButton.removeAttribute(
            "aria-disabled"
        );

    }


    /*
     * Status
     */

    if (suspectStatus) {

        suspectStatus.textContent =
            "✓ VERDÄCHTIGENANALYSE FREIGEGEBEN";

        suspectStatus.classList.add(
            "unlocked"
        );

    }


    if (suspectHint) {

        suspectHint.textContent =
            "✓ ALLE 4 ZEUGENAUSSAGEN ANALYSIERT – WÄHLEN SIE DEN HAUPTVERDÄCHTIGEN AUS.";

        suspectHint.classList.add(
            "unlocked"
        );

    }


    /*
     * Fortschrittssound
     */

    playJAC3(
        "progressUnlock",
        {
            volume: 0.40
        }
    );


    console.log(
        "JAC: ================================="
    );

    console.log(
        "JAC: 4 / 4 AUSSAGEN GEHÖRT"
    );

    console.log(
        "JAC: VERDÄCHTIGE FREIGESCHALTET"
    );

    console.log(
        "JAC: ================================="
    );

}


/* =====================================================
   PRÜFBUTTON
===================================================== */

function setupCheckButton() {

    if (!checkSuspectButton) {

        return;

    }


    checkSuspectButton.addEventListener(
        "click",
        checkSuspect
    );

}


/* =====================================================
   VERDÄCHTIGEN PRÜFEN
===================================================== */

function checkSuspect() {

    /*
     * Sicherheitsprüfung
     */

    if (
        heardStatements !==
        REQUIRED_STATEMENTS ||
        !suspectsUnlocked
    ) {

        playJAC3(
            "scanDenied",
            {
                volume: 0.30
            }
        );


        showResultPopup(
            "warning",
            "VERDÄCHTIGE GESPERRT",
            "Hören Sie zunächst alle vier Zeugenaussagen vollständig an.",
            "SCHLIESSEN"
        );


        return;

    }


    /*
     * Keine Auswahl
     */

    if (
        selectedSuspect === null
    ) {

        playJAC3(
            "error",
            {
                volume: 0.30
            }
        );


        showResultPopup(
            "warning",
            "KEINE AUSWAHL",
            "Bitte wählen Sie zunächst einen Hauptverdächtigen aus.",
            "SCHLIESSEN"
        );


        return;

    }


    /*
     * Bereits erfolgreich
     */

    if (analysisCompleted) {

        return;

    }


    /*
     * RICHTIG
     */

    if (
        selectedSuspect ===
        correctSuspect
    ) {

        analysisCompleted =
            true;


        playJAC3(
            "scanSuccess",
            {
                volume: 0.52
            }
        );


        showResultPopup(
            "success",
            "ANALYSE ERFOLGREICH",
            "Die Zeugenaussagen wurden korrekt ausgewertet. David Hoffmann wurde als Hauptverdächtiger identifiziert.",
            "AKTE ABSCHLIESSEN"
        );


        return;

    }


    /*
     * FALSCH
     */

    playJAC3(
        "scanDenied",
        {
            volume: 0.38
        }
    );


    showResultPopup(
        "error",
        "ANALYSE NICHT KORREKT",
        "Die ausgewählte Person kann anhand der Zeugenaussagen nicht als Hauptverdächtiger bestätigt werden. Überprüfen Sie die Aussagen erneut.",
        "ERNEUT VERSUCHEN"
    );

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

    if (
        !resultModal ||
        !resultIcon ||
        !resultTitle ||
        !resultText ||
        !resultButton
    ) {

        return;

    }


    resultModal.classList.remove(
        "hidden"
    );


    if (
        type === "success"
    ) {

        resultIcon.textContent =
            "✓";

    }

    else if (
        type === "error"
    ) {

        resultIcon.textContent =
            "!";

    }

    else {

        resultIcon.textContent =
            "i";

    }


    resultTitle.textContent =
        title;


    resultText.textContent =
        text;


    resultButton.textContent =
        buttonText;


    resultModal.dataset.type =
        type;

}


/* =====================================================
   RESULT BUTTON
===================================================== */

function setupResultButton() {

    if (!resultButton) {

        return;

    }


    resultButton.addEventListener(
        "click",
        () => {

            playJAC3(
                "uiClick",
                {
                    volume: 0.30
                }
            );


            const resultType =
                resultModal.dataset.type;


            resultModal.classList.add(
                "hidden"
            );


            if (
                resultType ===
                "success"
            ) {

                completeCase3();

            }

        }
    );

}


/* =====================================================
   AKTE 03 ABSCHLIESSEN
===================================================== */

function completeCase3() {

    if (caseCompleted) {

        return;

    }


    caseCompleted =
        true;


    stopAkte3ScanSound();


    playJAC3(
        "caseComplete",
        {
            volume: 0.50
        }
    );


    if (
        window.JACGameState &&
        typeof window.JACGameState.completeCase ===
            "function"
    ) {

        window.JACGameState.completeCase(
            3
        );


        console.log(
            "JAC: Akte 3 erfolgreich gespeichert."
        );

    }

    else {

        console.error(
            "JAC: gameState.js oder completeCase() wurde nicht gefunden."
        );

    }


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

function setupDashboardButton() {

    if (!dashboardButton) {

        return;

    }


    dashboardButton.addEventListener(
        "click",
        () => {

            playJAC3(
                "uiClick",
                {
                    volume: 0.30
                }
            );


            window.location.href =
                "dashboard.html";

        }
    );

}


/* =====================================================
   GESAMTE AKTE 03 INITIALISIEREN
===================================================== */

function initializeAkte3() {

    console.log(
        "JAC: AKTE 03 Initialisierung..."
    );


    /*
     * DOM
     */

    initializeAkte3DOM();


    /*
     * Verdächtige sofort sperren
     */

    lockSuspects();


    /*
     * Events
     */

    setupSystemStart();

    setupSuspectSelection();

    setupWitnessAudio();

    setupCheckButton();

    setupResultButton();

    setupDashboardButton();


    /*
     * Audio-System
     */

    if (
        window.JACAudio &&
        typeof window.JACAudio.init ===
            "function"
    ) {

        try {

            window.JACAudio.init();

        }

        catch (error) {

            console.warn(
                "JAC Audio-System konnte nicht initialisiert werden.",
                error
            );

        }

    }


    /*
     * WICHTIG:
     *
     * KEIN automatischer Start!
     *
     * Der Start erfolgt ausschließlich
     * über SYSTEM STARTEN.
     */


    console.log(
        "JAC: AKTE 03 bereit – SYSTEM STARTEN."
    );

}


/* =====================================================
   START
===================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeAkte3
    );

}

else {

    initializeAkte3();

}


/* =====================================================
   DEBUG
===================================================== */

console.log(
    "JAC: akte3.js – Audio Forensics Version 5.0 geladen."
);