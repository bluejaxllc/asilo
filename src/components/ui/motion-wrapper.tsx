"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode, forwardRef } from "react";

interface MotionWrapperProps {
    children: ReactNode;
    delay?: number;
    className?: string;
}

export const FadeIn = ({ children, delay = 0, className = "" }: MotionWrapperProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const SlideIn = ({ children, delay = 0, className = "", direction = "left" }: MotionWrapperProps & { direction?: "left" | "right" | "up" | "down" }) => {
    const offsets = {
        left: { x: -20, y: 0 },
        right: { x: 20, y: 0 },
        up: { x: 0, y: -20 },
        down: { x: 0, y: 20 },
    };
    const offset = offsets[direction];
    return (
        <motion.div
            initial={{ opacity: 0, ...offset }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.4, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const SlideInRow = ({ children, delay = 0, className = "" }: MotionWrapperProps) => {
    return (
        <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.tr>
    );
};

export const ScaleIn = ({ children, delay = 0, className = "" }: MotionWrapperProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
};



export const HoverScale = forwardRef<HTMLDivElement, { children: ReactNode, className?: string } & HTMLMotionProps<"div">>(
    ({ children, className = "", ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={className}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);
HoverScale.displayName = "HoverScale";
