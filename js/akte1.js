"use strict";

/* =====================================================
   JAC PORTAL
   AKTE 01
   MANIPULIERTES BEWEISFOTO
   VERSION 7.0
   EIN SYSTEMSTART / EIN FORENSISCHER SCAN
===================================================== */


/* =====================================================
   DOM
===================================================== */

const startSystemButton =
    document.getElementById(
        "start-system"
    );


const systemStartCard =
    document.getElementById(
        "system-start-card"
    );


const systemState =
    document.getElementById(
        "system-state"
    );


const scanScreen =
    document.getElementById(
        "scan-screen"
    );


const scanText =
    document.getElementById(
        "scan-text"
    );


const scanProgressFill =
    document.getElementById(
        "scan-progress-fill"
    );


const scannerPercent =
    document.getElementById(
        "scanner-percent"
    );


const scanCheck =
    document.getElementById(
        "scan-check"
    );


const evidenceCard =
    document.getElementById(
        "evidence-card"
    );


const imageContainer =
    document.getElementById(
        "image-container"
    );


const statusCard =
    document.getElementById(
        "status-card"
    );


const statusMessage =
    document.getElementById(
        "status-message"
    );


const successCard =
    document.getElementById(
        "success-card"
    );


const continueButton =
    document.getElementById(
        "continue-button"
    );


/* =====================================================
   STATUS
===================================================== */

let analysisRunning = false;

let foundCount = 0;

let completionShown = false;

let scanInterval = null;


/* =====================================================
   AUDIO
===================================================== */

function playAudio(
    method,
    fallback = null
) {

    if (
        !window.JACAudio
    ) {

        console.warn(
            "JAC Audio: audio.js nicht gefunden."
        );

        return null;

    }


    try {

        if (
            typeof window.JACAudio[method] ===
            "function"
        ) {

            return window.JACAudio[method]();

        }


        if (
            fallback &&
            typeof window.JACAudio.play ===
            "function"
        ) {

            return window.JACAudio.play(
                fallback
            );

        }

    }

    catch (error) {

        console.warn(
            "JAC Audio:",
            method,
            error
        );

    }


    return null;

}


/* =====================================================
   AUDIO UNLOCK
===================================================== */

async function unlockAudio() {

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

}


/* =====================================================
   FORENSISCHE SCHRITTE
===================================================== */

const forensicSteps = [

    {
        text:
            "JAC-SYSTEM WIRD INITIALISIERT...",
        progress: 8
    },

    {
        text:
            "FORENSISCHES ANALYSEMODUL WIRD GELADEN...",
        progress: 25
    },

    {
        text:
            "VERBINDUNG ZUR BILDDATENBANK WIRD HERGESTELLT...",
        progress: 43
    },

    {
        text:
            "BILDINTEGRITÄT WIRD ÜBERPRÜFT...",
        progress: 61
    },

    {
        text:
            "MANIPULATIONSERKENNUNG WIRD AKTIVIERT...",
        progress: 80
    },

    {
        text:
            "FORENSISCHER SCAN WIRD ABGESCHLOSSEN...",
        progress: 95
    },

    {
        text:
            "ANALYSE ABGESCHLOSSEN.",
        progress: 100
    }

];


/* =====================================================
   STARTBUTTON
===================================================== */

if (
    startSystemButton
) {

    startSystemButton.addEventListener(
        "click",
        startSystem
    );

}


/* =====================================================
   SYSTEM STARTEN
===================================================== */

async function startSystem() {

    if (
        analysisRunning
    ) {

        return;

    }


    analysisRunning =
        true;


    if (
        startSystemButton
    ) {

        startSystemButton.disabled =
            true;

        startSystemButton.innerHTML =
            `
                <span class="button-icon">●</span>
                <span>SYSTEM WIRD GESTARTET...</span>
            `;

    }


    /* ---------------------------------------------
       AUDIO FREISCHALTEN
    --------------------------------------------- */

    await unlockAudio();


    /* ---------------------------------------------
       UI KLICKSOUND
       DIREKT AUF BENUTZERKLICK
    --------------------------------------------- */

    playAudio(
        "click",
        "uiClick"
    );


    /* ---------------------------------------------
       SYSTEMSTATUS
    --------------------------------------------- */

    if (
        systemState
    ) {

        systemState.classList.remove(
            "standby"
        );

        systemState.classList.add(
            "running"
        );

        systemState.textContent =
            "● SYSTEM STARTET";

    }


    /* ---------------------------------------------
       KURZE PAUSE NACH UI-KLICK
    --------------------------------------------- */

    setTimeout(
        function () {

            /* -------------------------------------
               SYSTEM BOOT
            ------------------------------------- */

            playAudio(
                "boot",
                "systemBoot"
            );


            /* -------------------------------------
               START DER EINZIGEN ANALYSE
            ------------------------------------- */

            runForensicScan();

        },
        140
    );

}


/* =====================================================
   EINZIGER FORENSISCHER SCAN
===================================================== */

function runForensicScan() {

    if (
        !scanScreen
    ) {

        finishForensicScan();

        return;

    }


    /* ---------------------------------------------
       START
    --------------------------------------------- */

    scanScreen.classList.remove(
        "hidden"
    );


    if (
        systemStartCard
    ) {

        systemStartCard.classList.add(
            "hidden"
        );

    }


    if (
        statusCard
    ) {

        statusCard.classList.add(
            "hidden"
        );

    }


    let step =
        0;


    /* ---------------------------------------------
       INITIALWERTE
    --------------------------------------------- */

    setScanProgress(
        0
    );


    if (
        scanText
    ) {

        scanText.textContent =
            "SYSTEM WIRD INITIALISIERT...";

    }


    if (
        scanCheck
    ) {

        scanCheck.textContent =
            "●";

    }


    /* ---------------------------------------------
       SOFORT ERSTEN SCHRITT
    --------------------------------------------- */

    executeForensicStep(
        forensicSteps[0]
    );


    step++;


    /* ---------------------------------------------
       INTERVALL
    --------------------------------------------- */

    scanInterval =
        setInterval(
            function () {

                if (
                    step >=
                    forensicSteps.length
                ) {

                    clearInterval(
                        scanInterval
                    );

                    scanInterval =
                        null;


                    finishForensicScan();

                    return;

                }


                executeForensicStep(
                    forensicSteps[step]
                );


                step++;

            },
            850
        );

}


/* =====================================================
   FORENSISCHEN SCHRITT AUSFÜHREN
===================================================== */

function executeForensicStep(
    current
) {

    if (
        !current
    ) {

        return;

    }


    if (
        scanText
    ) {

        scanText.textContent =
            current.text;

    }


    setScanProgress(
        current.progress
    );


    /* ---------------------------------------------
       BESTÄTIGUNGSTON
    --------------------------------------------- */

    playAudio(
        "message",
        "systemMessage"
    );

}


/* =====================================================
   SCAN FORTSCHRITT
===================================================== */

function setScanProgress(
    value
) {

    const progress =
        Math.max(
            0,
            Math.min(
                100,
                value
            )
        );


    if (
        scanProgressFill
    ) {

        scanProgressFill.style.width =
            progress + "%";

    }


    if (
        scannerPercent
    ) {

        scannerPercent.textContent =
            progress + " %";

    }

}


/* =====================================================
   FORENSISCHER SCAN BEENDET
===================================================== */

function finishForensicScan() {

    if (
        scanInterval
    ) {

        clearInterval(
            scanInterval
        );

        scanInterval =
            null;

    }


    /* ---------------------------------------------
       READY SOUND
    --------------------------------------------- */

    playAudio(
        "ready",
        "systemReady"
    );


    /* ---------------------------------------------
       SYSTEMSTATUS
    --------------------------------------------- */

    if (
        systemState
    ) {

        systemState.classList.remove(
            "running"
        );

        systemState.classList.add(
            "ready"
        );

        systemState.textContent =
            "● SYSTEM BEREIT";

    }


    if (
        scanCheck
    ) {

        scanCheck.textContent =
            "✓";

        scanCheck.style.color =
            "#00e676";

    }


    if (
        scanText
    ) {

        scanText.textContent =
            "FORENSISCHER SCAN ABGESCHLOSSEN.";

    }


    setScanProgress(
        100
    );


    /* ---------------------------------------------
       KURZ ABSCHLUSS ANZEIGEN
    --------------------------------------------- */

    setTimeout(
        function () {

            showEvidence();

        },
        850
    );

}


/* =====================================================
   BEWEISFOTO ANZEIGEN
===================================================== */

function showEvidence() {

    if (
        scanScreen
    ) {

        scanScreen.classList.add(
            "hidden"
        );

    }


    if (
        evidenceCard
    ) {

        evidenceCard.classList.remove(
            "hidden"
        );

    }


    if (
        statusCard
    ) {

        statusCard.classList.remove(
            "hidden"
        );

    }


    if (
        statusMessage
    ) {

        statusMessage.textContent =
            "Forensischer Scan abgeschlossen. Identifizieren Sie nun die 8 Manipulationen im Beweisfoto.";

    }


    foundCount =
        0;


    completionShown =
        false;


    resetHotspots();

    createHotspots();

    updateProgress();

}


/* =====================================================
   HOTSPOTS
===================================================== */

const hotspotData = [

    {
        id: 1,
        name: "Telefon",
        x: 87.5,
        y: 30,
        w: 8,
        h: 7,
        found: false
    },

    {
        id: 2,
        name: "USB Stick",
        x: 56.5,
        y: 85.5,
        w: 15,
        h: 7,
        found: false
    },

    {
        id: 3,
        name: "Foto",
        x: 65,
        y: 55,
        w: 20,
        h: 13,
        found: false
    },

    {
        id: 4,
        name: "Uhr",
        x: 68,
        y: 69,
        w: 13,
        h: 12,
        found: false
    },

    {
        id: 5,
        name: "Kaffeetasse",
        x: 18.5,
        y: 37.4,
        w: 12,
        h: 13,
        found: false
    },

    {
        id: 6,
        name: "Armband",
        x: 89,
        y: 72,
        w: 9,
        h: 11,
        found: false
    },

    {
        id: 7,
        name: "Notizzettel",
        x: 82.5,
        y: 65,
        w: 15,
        h: 7,
        found: false
    },

    {
        id: 8,
        name: "Pinnwand",
        x: 68,
        y: 12,
        w: 15,
        h: 15,
        found: false
    }

];


/* =====================================================
   HOTSPOTS ZURÜCKSETZEN
===================================================== */

function resetHotspots() {

    hotspotData.forEach(
        function (data) {

            data.found =
                false;

        }
    );


    if (
        imageContainer
    ) {

        imageContainer
            .querySelectorAll(
                ".hotspot"
            )
            .forEach(
                function (hotspot) {

                    hotspot.remove();

                }
            );

    }

}


/* =====================================================
   HOTSPOTS ERSTELLEN
===================================================== */

function createHotspots() {

    if (
        !imageContainer
    ) {

        return;

    }


    hotspotData.forEach(
        function (data) {

            const hotspot =
                document.createElement(
                    "div"
                );


            hotspot.className =
                "hotspot";


            hotspot.dataset.id =
                data.id;


            hotspot.dataset.name =
                data.name;


            hotspot.style.left =
                data.x + "%";


            hotspot.style.top =
                data.y + "%";


            hotspot.style.width =
                data.w + "%";


            hotspot.style.height =
                data.h + "%";


            hotspot.addEventListener(
                "click",
                function () {

                    handleHotspotClick(
                        data,
                        hotspot
                    );

                }
            );


            imageContainer.appendChild(
                hotspot
            );

        }
    );

}


/* =====================================================
   HOTSPOT KLICK
===================================================== */

function handleHotspotClick(
    data,
    hotspot
) {

    if (
        data.found
    ) {

        return;

    }


    data.found =
        true;


    hotspot.classList.add(
        "found"
    );


    hotspot.style.pointerEvents =
        "none";


    foundCount++;


    /* ---------------------------------------------
       MANIPULATION GEFUNDEN
    --------------------------------------------- */

    playAudio(
        "revealEvidence",
        "revealEvidence"
    );


    /* ---------------------------------------------
       KURZER UI-BESTÄTIGUNGSKLICK
    --------------------------------------------- */

    setTimeout(
        function () {

            playAudio(
                "click",
                "uiClick"
            );

        },
        80
    );


    saveEvidence(
        data
    );


    updateProgress();

    showPopup(
        data.name
    );


    /* ---------------------------------------------
       ALLE GEFUNDEN
    --------------------------------------------- */

    if (
        foundCount ===
        hotspotData.length
    ) {

        setTimeout(
            finishCase,
            1000
        );

    }

}


/* =====================================================
   BEWEIS SPEICHERN
===================================================== */

function saveEvidence(
    data
) {

    if (
        !window.JACGameState ||
        typeof window.JACGameState.addEvidence !==
        "function"
    ) {

        console.error(
            "JAC: addEvidence() fehlt."
        );

        return;

    }


    window.JACGameState.addEvidence(
        "akte1-" + data.id
    );

}


/* =====================================================
   FORTSCHRITT
===================================================== */

function updateProgress() {

    const progressCount =
        document.getElementById(
            "progress-count"
        );


    const progressFill =
        document.getElementById(
            "progress-fill"
        );


    if (
        progressCount
    ) {

        progressCount.textContent =
            foundCount +
            " / " +
            hotspotData.length;

    }


    if (
        progressFill
    ) {

        const percentage =
            (
                foundCount /
                hotspotData.length
            ) * 100;


        progressFill.style.width =
            percentage + "%";

    }

}


/* =====================================================
   POPUP
===================================================== */

function showPopup(
    name
) {

    const popup =
        document.getElementById(
            "jac-popup"
        );


    const popupName =
        document.getElementById(
            "popup-name"
        );


    if (
        !popup
    ) {

        return;

    }


    if (
        popupName
    ) {

        popupName.textContent =
            name;

    }


    popup.classList.add(
        "show"
    );


    setTimeout(
        function () {

            popup.classList.remove(
                "show"
            );

        },
        2500
    );

}


/* =====================================================
   AKTE ABSCHLIESSEN
===================================================== */

function finishCase() {

    if (
        completionShown
    ) {

        return;

    }


    if (
        foundCount !==
        hotspotData.length
    ) {

        return;

    }


    completionShown =
        true;


    /* ---------------------------------------------
       ABSCHLUSSTON
    --------------------------------------------- */

    playAudio(
        "completeCase",
        "caseComplete"
    );


    /* ---------------------------------------------
       GAME STATE
    --------------------------------------------- */

    if (
        window.JACGameState &&
        typeof window.JACGameState.completeCase ===
        "function"
    ) {

        const success =
            window.JACGameState.completeCase(
                1
            );


        if (
            !success
        ) {

            console.warn(
                "JAC: Akte 1 konnte nicht abgeschlossen werden."
            );

        }

    }


    /* ---------------------------------------------
       ABSCHLUSS POPUP
    --------------------------------------------- */

    setTimeout(
        showCompletionScreen,
        500
    );

}


/* =====================================================
   ABSCHLUSSBILDSCHIRM
===================================================== */

function showCompletionScreen() {

    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "completion-screen";


    overlay.innerHTML = `

        <div class="completion-box">

            <div class="completion-logo">
                JAC
            </div>

            <div class="completion-line"></div>

            <div class="completion-title">
                FALL GELÖST
            </div>

            <div class="completion-check">
                ✓ 8 / 8
            </div>

            <p>
                Alle relevanten Manipulationen
                wurden erfolgreich identifiziert.
            </p>

            <div class="completion-status">
                FORENSISCHE ANALYSE ABGESCHLOSSEN
            </div>

            <button
                id="completion-button"
                type="button"
            >
                ZURÜCK ZUM DASHBOARD
            </button>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    requestAnimationFrame(
        function () {

            overlay.classList.add(
                "show"
            );

        }
    );


    const button =
        document.getElementById(
            "completion-button"
        );


    if (
        button
    ) {

        button.addEventListener(
            "click",
            function () {

                /* UI-Klick */

                playAudio(
                    "click",
                    "uiClick"
                );


                setTimeout(
                    function () {

                        if (
                            window.JACAudio &&
                            typeof window.JACAudio.stopAll ===
                            "function"
                        ) {

                            window.JACAudio.stopAll();

                        }


                        window.location.href =
                            "dashboard.html";

                    },
                    120
                );

            }
        );

    }

}


/* =====================================================
   SEITE VERLASSEN
===================================================== */

window.addEventListener(
    "beforeunload",
    function () {

        if (
            scanInterval
        ) {

            clearInterval(
                scanInterval
            );

        }

    }
);


/* =====================================================
   INITIALISIERUNG
===================================================== */

console.log(
    "JAC: Akte 01 Version 7.0 geladen."
);

console.log(
    "JAC: Ein Systemstart / ein forensischer Scan."
);

console.log(
    "JAC: UI-Klicksound beim Systemstart aktiviert."
);