import {
    eventDisplayAppear,
    advance,
    opponentAdvance,
    placeFrontliner,
    opponentPlaceFrontliner
} from "./animations.json";

interface AnimationOptions {
    options: KeyframeAnimationOptions;
    frames: number;
}


class Animations {

    private static readonly duration = 200;
    private static readonly frames = 5;
    private static readonly fill: FillMode = "forwards";

    private static readonly options: AnimationOptions = {
        options: {
            duration: this.duration,
            fill: this.fill
        } as KeyframeAnimationOptions,
        frames: this.frames
    };

    static eventDisplayAppear(e: Element) {
        this.applyBasicAnimation(e, eventDisplayAppear)
    }

    static advance(e: Element) {
        this.applyBasicAnimation(e, advance);
    }

    static opponentAdvance(e: Element) {
        this.applyBasicAnimation(e, opponentAdvance);
    }

    static placeFrontliner(e: Element) {
        this.applyBasicAnimation(e, placeFrontliner);
    }

    static opponentPlaceFrontliner(e: Element) {
        this.applyBasicAnimation(e, opponentPlaceFrontliner);
    }

    static stormerAppear(e: Element, options = this.options) {
        const attacker = document.getElementsByClassName("attacker")[0] as HTMLElement;
        const stormer = document.getElementById("storm-menu-btn") as HTMLElement;

        if (attacker && stormer) {
            const positionKeyframes = this.getPositionFrames(attacker, stormer, options.frames);
            const scaleKeyframes = this.getScaleFrames(attacker, stormer, options.frames);
            const combinedKeyframes = this.combineKeyframes([positionKeyframes, scaleKeyframes]);

            const animation = e.animate(combinedKeyframes, options.options);

            return new Promise<boolean>((resolve) => {
                animation.onfinish = () => {
                    animation.cancel();
                    resolve(true);
                };
            });
        } else {
            return new Promise((resolve) => resolve(false));
        }
    }

    //helper functions

    private static applyBasicAnimation(e: Element ,props: { keyframes: Keyframe[], options: KeyframeAnimationOptions }) {
        props.options.fill = this.fill;
        const animation = e.animate(props.keyframes, props.options);

        animation.onfinish = () => {
            animation.cancel();
        };
    }

    private static combineKeyframes(allKeyframes: Keyframe[][]) {
        const combined: Keyframe[] = [];

        allKeyframes.forEach((keyframes) => {
           keyframes.forEach((keyframe, index) => {
                if (combined[index]) {
                    combined[index] = { ...combined[index], ...keyframe };
                } else {
                    combined[index] = keyframe;
                }
           });
        });

        return combined;
    }

    private static getPositionFrames(startE: HTMLElement, endE: HTMLElement, frames: number) {
        const startPos = this.getElementCoords(startE);
        const endPos = this.getElementCoords(endE);

        const keyframes: Keyframe[] = [];

        const step = {
            x: Math.abs(endPos.x - startPos.x ) / frames,
            y: Math.abs(endPos.y - startPos.y ) / frames
        }

        for (let i = 0; i < frames; i++) {
            keyframes.push({
                position: "fixed",
                left: `${startPos.x + step.x * i}px`,
                top: `${startPos.y + step.y * i}px`
            });
        }

        return keyframes;
    }

    private static getScaleFrames(startE: HTMLElement, endE: HTMLElement, frames: number) {
        const keyframes: Keyframe[] = [];
        const startSize = this.getElementSize(startE);
        const finalSize = this.getElementSize(endE);

        const startScale = {
            x: startSize.width / finalSize.width,
            y: startSize.height / finalSize.height
        }

        const scaleDiff = {
            x: (1 - startScale.x) / frames,
            y: (1 - startScale.y) / frames
        }

        for (let i = 0; i < frames; i++) {
            keyframes.push({
                transformOrigin: "top left",
                scale: `${startScale.x + scaleDiff.x * i} ${startScale.y + scaleDiff.y * i}`
            });
        }

        return keyframes;
    }

    private static getElementSize(e: Element) {
        const rect = e.getBoundingClientRect();

        return {
            width: rect.width,
            height: rect.height
        };
    }

    private static getElementCoords(e: Element) {
        const rect = e.getBoundingClientRect();

        return {
            x: rect.left,
            y: rect.top
        };
    }
}

export default Animations;