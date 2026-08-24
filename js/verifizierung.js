"use strict";

/* =========================================================
   JAC PORTAL
   VERIFIZIERUNG – PHASE 1
   ========================================================= */


/* =========================================================
   ELEMENTE
========================================================= */

const progressBar =
    document.getElementById("progress-bar");

const progressText =
    document.getElementById("progress-text");

const statusText =
    document.getElementById("verification-status");

const verificationStage =
    document.getElementById("verification-stage");

const agentCard =
    document.getElementById("jac-agent-card");

const agentStatus =
    document.getElementById("agent-status");

const agentIdentity =
    document.getElementById("agent-identity");

const agentSecurity =
    document.getElementById("agent-security");

const agentBiometric =
    document.getElementById("agent-biometric");

const agentAccess =
    document.getElementById("agent-card-access");

const agentIndicator =
    document.getElementById("agent-card-indicator");

const checkConnection =
    document.getElementById("check-connection");

const checkIdentity =
    document.getElementById("check-identity");

const checkSecurity =
    document.getElementById("check-security");


/* =========================================================
   KONFIGURATION
========================================================= */

const STEP_TIME = 70;

const HOLD_TIME = 5000;

const REDIRECT_PAGE =
    "system-message.html";


/* =========================================================
   TIMER
========================================================= */

let progress = 0;

let verificationTimer = null;

let dotsTimer = null;

let redirectTimer = null;

let currentDots = 1;


/* =========================================================
   STATUS
========================================================= */

let baseStatus = "";


/* =========================================================
   AUDIO
========================================================= */

let verificationScanAudio = null;


/* =========================================================
   AUDIO HILFSFUNKTIONEN
========================================================= */

function audioAvailable() {

    return (
        typeof window.JACAudio !== "undefined"
    );
}


function initializeAudio() {

    if (!audioAvailable()) {
        return;
    }

    try {

        window.JACAudio.init();

    } catch (error) {

        console.warn(
            "JAC Audio konnte nicht initialisiert werden:",
            error
        );

    }
}


function playAudio(
    method,
    ...args
) {

    if (!audioAvailable()) {
        return null;
    }

    try {

        if (
            typeof window.JACAudio[method] ===
            "function"
        ) {

            return window.JACAudio[method](
                ...args
            );

        }

    } catch (error) {

        console.warn(
            "JAC Audio Fehler:",
            error
        );

    }

    return null;
}


/* =========================================================
   PUNKTE
========================================================= */

function startDots() {

    stopDots();

    currentDots = 1;

    dotsTimer = setInterval(() => {

        currentDots++;

        if (currentDots > 3) {
            currentDots = 1;
        }

        if (
            statusText &&
            baseStatus
        ) {

            statusText.textContent =
                baseStatus +
                ".".repeat(currentDots);

        }

    }, 450);
}


function stopDots() {

    if (
        dotsTimer !== null
    ) {

        clearInterval(
            dotsTimer
        );

        dotsTimer = null;
    }
}


/* =========================================================
   STATUS SETZEN
========================================================= */

function setStatus(
    text,
    animated = true
) {

    baseStatus = text;

    if (statusText) {

        statusText.textContent =
            text +
            (
                animated
                    ? "."
                    : ""
            );
    }

    if (animated) {

        startDots();

    } else {

        stopDots();

    }
}


/* =========================================================
   VERIFIZIERUNGSSTUFE / STAGE
========================================================= */

function setStage(text) {

    if (!verificationStage) {
        return;
    }

    verificationStage.textContent =
        text;
}


/* =========================================================
   PRÜFSCHRITTE
========================================================= */

function setCheckState(
    element,
    state
) {

    if (!element) {
        return;
    }

    element.classList.remove(
        "active",
        "complete",
        "pending"
    );

    const icon =
        element.querySelector(
            ".check-icon"
        );

    if (state === "active") {

        element.classList.add(
            "active"
        );

        if (icon) {
            icon.textContent = "◌";
        }

    } else if (
        state === "complete"
    ) {

        element.classList.add(
            "complete"
        );

        if (icon) {
            icon.textContent = "✓";
        }

    } else {

        element.classList.add(
            "pending"
        );

        if (icon) {
            icon.textContent = "○";
        }

    }
}


function resetChecks() {

    setCheckState(
        checkConnection,
        "pending"
    );

    setCheckState(
        checkIdentity,
        "pending"
    );

    setCheckState(
        checkSecurity,
        "pending"
    );
}


/* =========================================================
   AUSWEIS
========================================================= */

function updateAgent(
    status,
    identity,
    access
) {

    if (agentStatus) {

        agentStatus.textContent =
            status;
    }

    if (agentIdentity) {

        agentIdentity.textContent =
            identity;
    }

    if (agentSecurity) {

        agentSecurity.textContent =
            "LEVEL 01";
    }

    /*
     * WICHTIG:
     *
     * Biometrie wird in Phase 1
     * NICHT geprüft.
     *
     * Fingerabdruck und Hologramm
     * kommen erst bei der zweiten
     * Prüfung.
     */

    if (agentBiometric) {

        agentBiometric.textContent =
            "AUSSTEHEND";
    }

    if (agentAccess) {

        agentAccess.textContent =
            access;
    }
}


/* =========================================================
   AUSWEIS – PRÜFUNG
========================================================= */

function setAgentPending() {

    if (!agentCard) {
        return;
    }

    agentCard.dataset.status =
        "pending";

    agentCard.dataset.stage =
        "verification";

    agentCard.classList.remove(
        "verification-complete"
    );

    if (agentIndicator) {

        agentIndicator.textContent =
            "✓";

        agentIndicator.classList.remove(
            "verified"
        );

        agentIndicator.setAttribute(
            "aria-label",
            "Verifizierung läuft"
        );
    }
}


/* =========================================================
   AUSWEIS – ERFOLG
========================================================= */

function setAgentVerified() {

    if (agentCard) {

        agentCard.dataset.status =
            "verified";

        agentCard.dataset.stage =
            "complete";

        agentCard.classList.add(
            "verification-complete"
        );
    }

    updateAgent(
        "✓ VERIFIZIERT",
        "✓ BESTÄTIGT",
        "ACCESS: VERIFIED"
    );

    if (agentIndicator) {

        agentIndicator.textContent =
            "✓";

        agentIndicator.classList.add(
            "verified"
        );

        agentIndicator.setAttribute(
            "aria-label",
            "Identität verifiziert"
        );
    }
}


/* =========================================================
   GAMESTATE SPEICHERN
========================================================= */

function saveVerification() {

    /*
     * GameState bleibt optional.
     *
     * Die Weiterleitung darf niemals
     * davon abhängig sein.
     */

    if (!window.JACGameState) {

        console.warn(
            "JACGameState nicht verfügbar."
        );

        return;
    }

    try {

        if (
            typeof window.JACGameState.setVerified ===
            "function"
        ) {

            window.JACGameState.setVerified(
                true
            );
        }


        if (
            typeof window.JACGameState.setPortalStatus ===
            "function"
        ) {

            window.JACGameState.setPortalStatus({

                verified: true,

                /*
                 * Noch KEINE Biometrie.
                 */
                fingerprintVerified: false,

                /*
                 * Noch KEIN Hologramm.
                 */
                hologramUnlocked: false,

                dashboardAuthenticated: false,

                agentStatus:
                    "VERIFIZIERT",

                securityLevel: 1

            });
        }

    } catch (error) {

        console.warn(
            "JACGameState konnte nicht aktualisiert werden:",
            error
        );
    }
}


/* =========================================================
   AUDIO – SCAN STOPPEN
========================================================= */

function stopVerificationAudio() {

    if (!audioAvailable()) {
        return;
    }

    try {

        if (
            verificationScanAudio
        ) {

            window.JACAudio.stop(
                verificationScanAudio
            );

            verificationScanAudio =
                null;
        }

        window.JACAudio.stopSound(
            "scanLoop"
        );

    } catch (error) {

        console.warn(
            "JAC Scan-Sound konnte nicht gestoppt werden:",
            error
        );
    }
}


/* =========================================================
   ABSCHLUSS
========================================================= */

function finishVerification() {

    /*
     * Prüfung stoppen
     */

    if (
        verificationTimer !== null
    ) {

        clearInterval(
            verificationTimer
        );

        verificationTimer = null;
    }


    /*
     * Punkte stoppen
     */

    stopDots();


    /*
     * Scan-Sound stoppen
     */

    stopVerificationAudio();


    /*
     * 100 %
     */

    progress = 100;


    if (progressBar) {

        progressBar.style.width =
            "100%";

        progressBar.setAttribute(
            "aria-valuenow",
            "100"
        );
    }


    if (progressText) {

        progressText.textContent =
            "100 %";
    }


    /*
     * Alle Prüfungen abschließen
     */

    setCheckState(
        checkConnection,
        "complete"
    );

    setCheckState(
        checkIdentity,
        "complete"
    );

    setCheckState(
        checkSecurity,
        "complete"
    );


    setStage(
        "VERIFIZIERUNG ABGESCHLOSSEN"
    );


    /*
     * Ausweis bestätigen
     */

    setAgentVerified();


    /*
     * Status
     */

    setStatus(
        "✓ Zugriff autorisiert",
        false
    );


    /*
     * Erfolgssound
     */

    playAudio(
        "scanSuccess"
    );


    /*
     * GameState speichern
     */

    saveVerification();


    /*
     * System bereit
     */

    setTimeout(() => {

        playAudio(
            "ready"
        );

    }, 550);


    /*
     * Erst nach erfolgreicher
     * Verifizierung wird der
     * 5-Sekunden-Timer gestartet.
     */

    redirectTimer = setTimeout(() => {

        window.location.assign(
            REDIRECT_PAGE
        );

    }, HOLD_TIME);
}


/* =========================================================
   VERIFIZIERUNG STARTEN
========================================================= */

function startVerification() {

    /*
     * Alte Timer löschen
     */

    if (
        verificationTimer !== null
    ) {

        clearInterval(
            verificationTimer
        );

        verificationTimer = null;
    }


    if (
        redirectTimer !== null
    ) {

        clearTimeout(
            redirectTimer
        );

        redirectTimer = null;
    }


    stopDots();

    stopVerificationAudio();


    /*
     * Audio vorbereiten
     */

    initializeAudio();


    /*
     * Start
     */

    progress = 0;


    if (progressBar) {

        progressBar.style.width =
            "0%";

        progressBar.setAttribute(
            "aria-valuenow",
            "0"
        );
    }


    if (progressText) {

        progressText.textContent =
            "0 %";
    }


    resetChecks();

    setAgentPending();


    updateAgent(
        "PRÜFUNG AUSSTEHEND",
        "WIRD GEPRÜFT",
        "ACCESS: PENDING"
    );


    setStage(
        "INITIALISIERUNG"
    );


    setStatus(
        "Verbindung wird hergestellt",
        true
    );


    /*
     * Startsound
     */

    playAudio(
        "scanStart"
    );


    /*
     * Prüfung starten
     */

    verificationTimer =
        setInterval(() => {

            progress++;


            /*
             * Fortschritt
             */

            if (progressBar) {

                progressBar.style.width =
                    progress + "%";

                progressBar.setAttribute(
                    "aria-valuenow",
                    String(progress)
                );
            }


            if (progressText) {

                progressText.textContent =
                    progress + " %";
            }


            /* =================================================
               PHASE 1
            ================================================= */

            if (progress === 1) {

                setStage(
                    "VERBINDUNG WIRD HERGESTELLT"
                );

                setCheckState(
                    checkConnection,
                    "active"
                );

                setStatus(
                    "Verbindung wird hergestellt",
                    true
                );

                updateAgent(
                    "PRÜFUNG AUSSTEHEND",
                    "VERBINDUNG WIRD HERGESTELLT",
                    "ACCESS: PENDING"
                );
            }


            /* =================================================
               PHASE 20
            ================================================= */

            if (progress === 20) {

                setStage(
                    "VERBINDUNG HERGESTELLT"
                );

                setCheckState(
                    checkConnection,
                    "complete"
                );

                setCheckState(
                    checkIdentity,
                    "active"
                );

                setStatus(
                    "Verbindung hergestellt",
                    true
                );

                updateAgent(
                    "VERIFIZIERUNG LÄUFT",
                    "VERBINDUNG BESTÄTIGT",
                    "ACCESS: PENDING"
                );


                /*
                 * Laufender Scan-Sound.
                 */

                verificationScanAudio =
                    playAudio(
                        "scanLoop"
                    );
            }


            /* =================================================
               PHASE 35
            ================================================= */

            if (progress === 35) {

                setStage(
                    "IDENTITÄTSDATEN WERDEN GELADEN"
                );

                setStatus(
                    "Identitätsdaten werden geladen",
                    true
                );

                updateAgent(
                    "VERIFIZIERUNG LÄUFT",
                    "DATENANALYSE",
                    "ACCESS: PENDING"
                );
            }


            /* =================================================
               PHASE 50
            ================================================= */

            if (progress === 50) {

                setStage(
                    "IDENTITÄT WIRD VERIFIZIERT"
                );

                setStatus(
                    "Identität wird verifiziert",
                    true
                );

                updateAgent(
                    "VERIFIZIERUNG LÄUFT",
                    "IDENTITÄT WIRD GEPRÜFT",
                    "ACCESS: PENDING"
                );
            }


            /* =================================================
               PHASE 65
            ================================================= */

            if (progress === 65) {

                setStage(
                    "SICHERHEITSPROFIL WIRD GEPRÜFT"
                );

                setCheckState(
                    checkIdentity,
                    "complete"
                );

                setCheckState(
                    checkSecurity,
                    "active"
                );

                setStatus(
                    "Sicherheitsprofil wird geprüft",
                    true
                );

                updateAgent(
                    "SICHERHEITSPRÜFUNG",
                    "IDENTITÄT ABGEGLICHEN",
                    "ACCESS: PENDING"
                );
            }


            /* =================================================
               PHASE 80
            ================================================= */

            if (progress === 80) {

                setStage(
                    "SICHERHEITSFREIGABE WIRD VORBEREITET"
                );

                setStatus(
                    "Sicherheitsfreigabe wird vorbereitet",
                    true
                );

                updateAgent(
                    "AUTORISIERUNG",
                    "IDENTITÄT BESTÄTIGT",
                    "ACCESS: AUTHORIZING"
                );
            }


            /* =================================================
               PHASE 90
            ================================================= */

            if (progress === 90) {

                setStage(
                    "JAC-ZUGANG WIRD AUTORISIERT"
                );

                setStatus(
                    "JAC-Zugang wird autorisiert",
                    true
                );

                updateAgent(
                    "AUTORISIERUNG",
                    "IDENTITÄT BESTÄTIGT",
                    "ACCESS: AUTHORIZING"
                );
            }


            /* =================================================
               PHASE 97
            ================================================= */

            if (progress === 97) {

                setStage(
                    "VERIFIZIERUNG WIRD ABGESCHLOSSEN"
                );

                setStatus(
                    "Verifizierung wird abgeschlossen",
                    true
                );
            }


            /* =================================================
               100 %
            ================================================= */

            if (progress >= 100) {

                finishVerification();
            }

        }, STEP_TIME);
}


/* =========================================================
   START
========================================================= */

function initializeVerification() {

    /*
     * Prüfen, ob die wichtigsten
     * HTML-Elemente vorhanden sind.
     */

    if (
        !progressBar ||
        !progressText ||
        !statusText
    ) {

        console.error(
            "JAC: Verifizierungs-Elemente fehlen."
        );

        return;
    }


    /*
     * Die Verifizierungsseite führt
     * ihre Prüfung immer aus.
     *
     * Kein Abbruch aufgrund eines
     * bereits gesetzten GameState.
     */

    startVerification();
}


/* =========================================================
   DOM READY
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeVerification
    );

} else {

    initializeVerification();
}