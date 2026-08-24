document.addEventListener("DOMContentLoaded", () => {

    console.log("JAC Portal gestartet.");

    // Nur auf der Startseite automatisch weiterleiten
    if (document.getElementById("splash-screen")) {

        setTimeout(() => {

            /*
             * Lokale Studio-Version:
             *    src/index.html → src/login.html
             *
             * GitHub Pages:
             *    /JAC-Portal/src/index.html
             *    → /JAC-Portal/src/login.html
             */

            const isGitHubPages =
                window.location.hostname === "nihe89.github.io";

            if (isGitHubPages) {

                window.location.href =
                    "/JAC-Portal/src/login.html";

            } else {

                window.location.href =
                    "login.html";

            }

        }, 3000);

    }

});