// Runs in <head> before first paint, so a repeat visit never flashes the intro.
// The intro plays once per browser session, on whichever page the visit starts
// (it only exists on the home page; elsewhere this just marks it as seen).
export const INTRO_KEY = "ostov-intro";
export const INTRO_MS = 3700; // matches .intro: 2.9s delay + 0.8s fade in globals.css

export const INTRO_SCRIPT = `(function(){var d=document.documentElement;try{if(sessionStorage.getItem("${INTRO_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.intro="skip";return}sessionStorage.setItem("${INTRO_KEY}","1")}catch(e){d.dataset.intro="skip";return}setTimeout(function(){d.dataset.intro="skip"},${INTRO_MS})})();`;
