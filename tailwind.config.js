/** @type {import('tailwindcss').Config} */

import plugin from 'tailwindcss/plugin';

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx,css}",
    ],
    theme: {
        extend: {
            fontFamily: {
                amarante: ["Amarante", "serif"],
                frizQuadrata: ["Friz Quadrata", "serif"]
            },
            colors: {
                gold: "#DAA520FF",
                darkSlateBlue: "#17252F",
                "darkSlateBlue-90": "rgba(23,37,47,0.9)",
                "darkSlateBlue-80": "rgba(23,37,47,0.8)",
                "darkSlateBlue-70": "rgba(23,37,47,0.7)",
                "darkSlateBlue-60": "rgba(23,37,47,0.6)",
                "darkSlateBlue-50": "rgba(23,37,47,0.5)",
                "darkSlateBlue-40": "rgba(23,37,47,0.4)",
                "darkSlateBlue-30": "rgba(23,37,47,0.3)",
                "darkSlateBlue-20": "rgba(23,37,47,0.2)",
                "darkSlateBlue-10": "rgba(23,37,47,0.1)",
            }
        }
    },
    plugins: [
        plugin(({ addComponents }) => {
            addComponents({
                ".gold-text": {
                    fontFamily: "Amarante, serif",
                    background: "linear-gradient(gold 40%, darkgoldenrod 50%, goldenrod 60%)",
                    filter: "drop-shadow(0 0 8px black)",
                    height: "fit-content",
                    "-webkit-text-fill-color": "transparent",
                    "-webkit-background-clip": "text",
                },
                ".no-default-appearence": {
                    "-webkit-appearance": "none",
                    "-moz-appearance": "none",
                    appearance: "none"
                },
                ".round": {
                    borderRadius: "50%"
                },
                ".border-thin-grey": {
                    border: "2px solid grey"
                },
                ".centered": {
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    translate: "-50% -50%"
                },
            })
        })
    ]
}

