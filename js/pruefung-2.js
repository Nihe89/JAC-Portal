"use strict";

/* =========================================================
   JAC PORTAL
   PRÜFUNG 02
   BIOMETRISCHE AUSWEISPRÜFUNG
========================================================= */


/* =========================================================
   DOM
========================================================= */

const fingerprintModule =
    document.getElementById("fingerprint-module");

const fingerprintState =
    document.getElementById("fingerprint-state");

const fingerprintProgress =
    document.getElementById("fingerprint-progress");

const fingerprintMessage =
    document.getElementById("fingerprint-message");

const fingerprintDetail =
    document.getElementById("fingerprint-detail");

const fingerprintScanLine =
    document.getElementById("fingerprint-scan-line");


const hologramModule =
    document.getElementById("hologram-module");

const hologramState =
    document.getElementById("hologram-state");

const hologramProgress =
    document.getElementById("hologram-progress");

const hologramMessage =
    document.getElementById("hologram-message");

const hologramDetail =
    document.getElementById("hologram-detail");

const hologramScanLine =
    document.getElementById("hologram-scan-line");


const agentVerification =
    document.getElementById("agent-verification");

const agentBiometricStatus =
    document.getElementById("agent-biometric-status");

const agentAccess =
    document.getElementById("agent-access");


const verificationStatus =
    document.getElementById("verification-status");

const footerStatus =
    document.getElementById("footer-status");


/* =========================================================
   STARTBUTTON
========================================================= */

const startButton =
    document.getElementById(
        "start-biometric-button"
    );


/* =========================================================
   STATUS
========================================================= */

let verificationStarted = false;

let fingerprintScanAudio = null;

let hologramLoopAudio = null;


/* =========================================================
   WAIT
========================================================= */

function wait(ms) {

    return new Promise(
        resolve => setTimeout(resolve, ms)
    );

}


/* =========================================================
   AUDIO INIT
========================================================= */

function initializeAudio() {

    if (!window.JACAudio) {

        console.warn(
            "JAC Audio-System nicht gefunden."
        );

        return;
    }


    try {

        if (
            typeof window.JACAudio.init ===
            "function"
        ) {

            window.JACAudio.init();
        }

    }

    catch (error) {

        console.warn(
            "JAC Audio Init:",
            error
        );
    }
}


/* =========================================================
   AUDIO PLAY
========================================================= */

function playAudio(
    name,
    options = {}
) {

    if (
        !window.JACAudio ||
        typeof window.JACAudio.play !==
        "function"
    ) {

        return null;
    }


    try {

        return window.JACAudio.play(
            name,
            options
        );

    }

    catch (error) {

        console.warn(
            "JAC Audio:",
            name,
            error
        );

        return null;
    }
}


/* =========================================================
   FINGERPRINT AUDIO
========================================================= */

function startFingerprintAudio() {

    if (!window.JACAudio) {

        return;
    }


    try {

        if (
            typeof window.JACAudio.fingerprintScan ===
            "function"
        ) {

            fingerprintScanAudio =
                window.JACAudio.fingerprintScan();

            return;
        }


        fingerprintScanAudio =
            playAudio(
                "fingerprintScan",
                {
                    volume: 0.30,
                    loop: true
                }
            );

    }

    catch (error) {

        console.warn(
            "Fingerprint Audio:",
            error
        );
    }
}


/* =========================================================
   FINGERPRINT AUDIO STOP
========================================================= */

function stopFingerprintAudio() {

    if (!fingerprintScanAudio) {

        return;
    }


    try {

        if (
            window.JACAudio &&
            typeof window.JACAudio.stop ===
            "function"
        ) {

            window.JACAudio.stop(
                fingerprintScanAudio
            );
        }

    }

    catch (error) {

        console.warn(
            "Fingerprint Audio Stop:",
            error
        );
    }


    fingerprintScanAudio = null;
}


/* =========================================================
   HOLOGRAM AUDIO
========================================================= */

function startHologramAudio() {

    if (!window.JACAudio) {

        return;
    }


    try {

        if (
            typeof window.JACAudio.hologram ===
            "function"
        ) {

            window.JACAudio.hologram();

        }

        else {

            playAudio(
                "hologram",
                {
                    volume: 0.35
                }
            );
        }


        if (
            typeof window.JACAudio.hologramLoop ===
            "function"
        ) {

            hologramLoopAudio =
                window.JACAudio.hologramLoop();

        }

        else {

            hologramLoopAudio =
                playAudio(
                    "hologramLoop",
                    {
                        volume: 0.20,
                        loop: true
                    }
                );
        }

    }

    catch (error) {

        console.warn(
            "Hologramm Audio:",
            error
        );
    }
}


/* =========================================================
   HOLOGRAM AUDIO STOP
========================================================= */

function stopHologramAudio() {

    if (!hologramLoopAudio) {

        return;
    }


    try {

        if (
            window.JACAudio &&
            typeof window.JACAudio.stop ===
            "function"
        ) {

            window.JACAudio.stop(
                hologramLoopAudio
            );
        }

    }

    catch (error) {

        console.warn(
            "Hologramm Audio Stop:",
            error
        );
    }


    hologramLoopAudio = null;
}


/* =========================================================
   STATUS
========================================================= */

function setStatus(text) {

    if (verificationStatus) {

        verificationStatus.textContent =
            text;
    }
}


function setFooter(text) {

    if (footerStatus) {

        footerStatus.textContent =
            text;
    }
}


/* =========================================================
   FINGERPRINT RESET
========================================================= */

function resetFingerprint() {

    if (!fingerprintModule) {

        return;
    }


    fingerprintModule.dataset.state =
        "pending";


    fingerprintModule.classList.remove(
        "scan-active",
        "verified",
        "verification-complete",
        "complete-flash"
    );


    if (fingerprintState) {

        fingerprintState.textContent =
            "AUSSTEHEND";
    }


    if (fingerprintMessage) {

        fingerprintMessage.textContent =
            "FINGER AUF SENSOR ERKANNT";
    }


    if (fingerprintDetail) {

        fingerprintDetail.textContent =
            "BEREIT ZUR BIOMETRISCHEN PRÜFUNG";
    }


    if (fingerprintProgress) {

        fingerprintProgress.style.transition =
            "none";

        fingerprintProgress.style.width =
            "0%";
    }


    if (fingerprintScanLine) {

        fingerprintScanLine.classList.remove(
            "active",
            "scanning"
        );
    }
}


/* =========================================================
   HOLOGRAM RESET
========================================================= */

function resetHologram() {

    if (!hologramModule) {

        return;
    }


    hologramModule.dataset.state =
        "pending";


    hologramModule.classList.remove(
        "scan-active",
        "verified",
        "verification-complete",
        "complete-flash"
    );


    if (hologramState) {

        hologramState.textContent =
            "AUSSTEHEND";
    }


    if (hologramMessage) {

        hologramMessage.textContent =
            "HOLOGRAMM WIRD GESUCHT";
    }


    if (hologramDetail) {

        hologramDetail.textContent =
            "SICHERHEITSMERKMAL BEREIT";
    }


    if (hologramProgress) {

        hologramProgress.style.transition =
            "none";

        hologramProgress.style.width =
            "0%";
    }


    if (hologramScanLine) {

        hologramScanLine.classList.remove(
            "active",
            "scanning"
        );
    }
}


/* =========================================================
   FINGERABDRUCK SCAN
========================================================= */

async function runFingerprint() {

    if (!fingerprintModule) {

        return;
    }


    fingerprintModule.dataset.state =
        "scanning";


    /*
     * AKTIVIERT:
     *
     * - Pulsieren
     * - Glow
     * - Modul Glow
     */

    fingerprintModule.classList.add(
        "scan-active"
    );


    if (fingerprintState) {

        fingerprintState.textContent =
            "SCAN AKTIV";
    }


    if (fingerprintMessage) {

        fingerprintMessage.textContent =
            "FINGERABDRUCK WIRD ANALYSIERT";
    }


    if (fingerprintDetail) {

        fingerprintDetail.textContent =
            "BIOMETRISCHE SIGNATUR WIRD ABGEGLICHEN";
    }


    if (fingerprintProgress) {

        fingerprintProgress.style.transition =
            "width 2.8s linear";

        fingerprintProgress.style.width =
            "0%";

        void fingerprintProgress.offsetWidth;

        fingerprintProgress.style.width =
            "100%";
    }


    if (fingerprintScanLine) {

        fingerprintScanLine.classList.add(
            "active",
            "scanning"
        );
    }


    startFingerprintAudio();


    await wait(3000);


    stopFingerprintAudio();


    playAudio(
        "scanSuccess",
        {
            volume: 0.45
        }
    );


    fingerprintModule.classList.add(
        "complete-flash"
    );


    await wait(300);


    fingerprintModule.dataset.state =
        "verified";


    fingerprintModule.classList.remove(
        "scan-active"
    );


    fingerprintModule.classList.add(
        "verified",
        "verification-complete"
    );


    if (fingerprintState) {

        fingerprintState.textContent =
            "BESTÄTIGT";
    }


    if (fingerprintMessage) {

        fingerprintMessage.textContent =
            "FINGERABDRUCK VERIFIZIERT";
    }


    if (fingerprintDetail) {

        fingerprintDetail.textContent =
            "BIOMETRISCHE SIGNATUR ÜBEREINSTIMMEND";
    }


    if (fingerprintScanLine) {

        fingerprintScanLine.classList.remove(
            "active",
            "scanning"
        );
    }
}


/* =========================================================
   HOLOGRAMM SCAN
========================================================= */

async function runHologram() {

    if (!hologramModule) {

        return;
    }


    hologramModule.dataset.state =
        "scanning";


    hologramModule.classList.add(
        "scan-active"
    );


    if (hologramState) {

        hologramState.textContent =
            "SCAN AKTIV";
    }


    if (hologramMessage) {

        hologramMessage.textContent =
            "HOLOGRAMM WIRD ANALYSIERT";
    }


    if (hologramDetail) {

        hologramDetail.textContent =
            "OPTISCHE SICHERHEITSMERKMALE WERDEN ERFASST";
    }


    if (hologramProgress) {

        hologramProgress.style.transition =
            "width 2.8s linear";

        hologramProgress.style.width =
            "0%";

        void hologramProgress.offsetWidth;

        hologramProgress.style.width =
            "100%";
    }


    if (hologramScanLine) {

        hologramScanLine.classList.add(
            "active",
            "scanning"
        );
    }


    startHologramAudio();


    await wait(3000);


    stopHologramAudio();


    playAudio(
        "scanSuccess",
        {
            volume: 0.45
        }
    );


    hologramModule.classList.add(
        "complete-flash"
    );


    await wait(300);


    hologramModule.dataset.state =
        "verified";


    hologramModule.classList.remove(
        "scan-active"
    );


    hologramModule.classList.add(
        "verified",
        "verification-complete"
    );


    if (hologramState) {

        hologramState.textContent =
            "BESTÄTIGT";
    }


    if (hologramMessage) {

        hologramMessage.textContent =
            "HOLOGRAMM VERIFIZIERT";
    }


    if (hologramDetail) {

        hologramDetail.textContent =
            "SICHERHEITSMERKMAL AUTHENTISCH";
    }


    if (hologramScanLine) {

        hologramScanLine.classList.remove(
            "active",
            "scanning"
        );
    }
}


/* =========================================================
   AGENT BESTÄTIGEN
========================================================= */

function verifyAgent() {

    if (agentBiometricStatus) {

        agentBiometricStatus.textContent =
            "BESTÄTIGT";
    }


    if (agentAccess) {

        agentAccess.textContent =
            "ACCESS: VERIFIED";
    }


    if (agentVerification) {

        agentVerification.classList.add(
            "confirmed"
        );
    }
}


/* =========================================================
   GAMESTATE
========================================================= */

function saveVerification() {

    if (!window.JACGameState) {

        console.warn(
            "JACGameState nicht vorhanden."
        );

        return true;
    }


    try {

        if (
            typeof window.JACGameState
                .completeSecondaryVerification ===
            "function"
        ) {

            return Boolean(
                window.JACGameState
                    .completeSecondaryVerification()
            );
        }


        if (
            typeof window.JACGameState
                .setPortalStatus ===
            "function"
        ) {

            return Boolean(
                window.JACGameState.setPortalStatus({

                    verified: true,

                    fingerprintVerified: true,

                    hologramUnlocked: true,

                    agentStatus:
                        "VERIFIZIERT",

                    securityLevel: 2,

                    portalStatus:
                        "ONLINE"

                })
            );
        }

    }

    catch (error) {

        console.error(
            "JAC GameState:",
            error
        );

        return false;
    }


    return true;
}


/* =========================================================
   SYSTEM BOOT
========================================================= */

async function openSystemBoot() {

    setStatus(
        "IDENTITÄT BESTÄTIGT. SYSTEMZUGRIFF FREIGEGEBEN."
    );


    setFooter(
        "SYSTEM BOOT WIRD GESTARTET"
    );


    await wait(1000);


    window.location.href =
        "system-boot.html";
}


/* =========================================================
   GESAMTE PRÜFUNG
========================================================= */

async function startVerification() {

    if (verificationStarted) {

        return;
    }


    verificationStarted = true;


    if (startButton) {

        startButton.disabled = true;

        startButton.classList.add(
            "started"
        );
    }


    /*
     * WICHTIG:
     * Audio wird direkt innerhalb des
     * echten Button-Klicks initialisiert.
     */

    initializeAudio();


    playAudio(
        "systemBoot",
        {
            volume: 0.35
        }
    );


    setStatus(
        "BIOMETRISCHE PRÜFUNG WIRD GESTARTET..."
    );


    setFooter(
        "BIOMETRIE-SYSTEM AKTIV"
    );


    await wait(700);


    /* =====================================================
       FINGERABDRUCK
    ====================================================== */

    setStatus(
        "Fingerabdruck wird geprüft..."
    );


    setFooter(
        "BIOMETRIE: FINGERABDRUCK"
    );


    await runFingerprint();


    await wait(700);


    /* =====================================================
       HOLOGRAMM
    ====================================================== */

    setStatus(
        "Zweites Sicherheitsmerkmal wird geprüft..."
    );


    setFooter(
        "BIOMETRIE: SICHERHEITSHOLOGRAMM"
    );


    await runHologram();


    await wait(700);


    /* =====================================================
       GESAMT
    ====================================================== */

    verifyAgent();


    playAudio(
        "scanSuccess",
        {
            volume: 0.55
        }
    );


    setStatus(
        "Alle biometrischen Sicherheitsmerkmale bestätigt."
    );


    setFooter(
        "PRÜFUNG ERFOLGREICH"
    );


    await wait(1000);


    /* =====================================================
       GAMESTATE
    ====================================================== */

    const saved =
        saveVerification();


    if (!saved) {

        setStatus(
            "AUTHENTIFIZIERUNG FEHLGESCHLAGEN."
        );


        setFooter(
            "PRÜFUNG ABGEBROCHEN"
        );


        if (startButton) {

            startButton.disabled =
                false;
        }


        verificationStarted =
            false;

        return;
    }


    /* =====================================================
       SYSTEM BOOT
    ====================================================== */

    await openSystemBoot();
}


/* =========================================================
   INITIALISIERUNG
========================================================= */

function initializePage() {

    resetFingerprint();

    resetHologram();


    if (agentVerification) {

        agentVerification.classList.remove(
            "confirmed"
        );
    }


    if (agentBiometricStatus) {

        agentBiometricStatus.textContent =
            "AUSSTEHEND";
    }


    if (agentAccess) {

        agentAccess.textContent =
            "ACCESS: PENDING";
    }


    if (startButton) {

        startButton.disabled =
            false;

        startButton.classList.remove(
            "started"
        );
    }


    setStatus(
        "Biometrische Komponenten bereit. Prüfung kann gestartet werden."
    );


    setFooter(
        "BEREIT FÜR BIOMETRISCHE PRÜFUNG"
    );
}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeAudio();

        initializePage();


        if (startButton) {

            startButton.addEventListener(
                "click",
                startVerification
            );

        }

        else {

            console.error(
                "JAC: Startbutton #start-biometric-button nicht gefunden."
            );
        }

    }
);


/* =========================================================
   DEBUG
========================================================= */

console.log(
    "JAC: pruefung-2.js – Biometrische Prüfung geladen."
);