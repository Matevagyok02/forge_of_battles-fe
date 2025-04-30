import React, { useRef, useEffect } from "react";
import styles from "../styles/components/FloatableCard.module.css";

interface Props {
    children: React.ReactNode;
    className?: string;
}

const ANGLE = 4;

const FloatableCard: React.FC<Props> = ({ children, className }) => {
    const panelRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const panel = panelRef.current;
        const content = contentRef.current;
        if (!panel || !content) return;

        const handleMouseMove = (e: MouseEvent) => {
            const w = panel.clientWidth;
            const h = panel.clientHeight;
            const offsetX = e.offsetX - w / 2;
            const offsetY = e.offsetY - h / 2;

            const rotateY = (offsetX / (w / 2)) * ANGLE;
            const rotateX = -(offsetY / (h / 2)) * ANGLE;

            content.style.transform = `
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
      `;
        };

        const handleMouseOut = () => {
            content.style.transform = `
        rotateX(0deg)
        rotateY(0deg)
        rotateZ(0deg)
      `;
        };

        panel.addEventListener("mousemove", handleMouseMove);
        panel.addEventListener("mouseout", handleMouseOut);

        return () => {
            panel.removeEventListener("mousemove", handleMouseMove);
            panel.removeEventListener("mouseout", handleMouseOut);
        };
    }, []);

    return (
        <div ref={panelRef} className={styles.card}>
            <div ref={contentRef} className={className}>
                {children}
            </div>
        </div>
    );
};

export default FloatableCard;
