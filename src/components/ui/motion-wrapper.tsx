"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

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

export const SlideIn = ({ children, delay = 0, className = "" }: MotionWrapperProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
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

export const HoverScale = ({ children, className = "" }: { children: ReactNode, className?: string }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={className}
        >
            {children}
        </motion.div>
    );
};
