"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TypewriterTextProps {
    text: string;
    speed?: number; // ms per character
    onComplete?: () => void;
    className?: string;
}

export function TypewriterText({
    text,
    speed = 20,
    onComplete,
    className = ""
}: TypewriterTextProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!text) return;

        setDisplayedText("");
        setIsComplete(false);

        let index = 0;
        const timer = setInterval(() => {
            if (index < text.length) {
                setDisplayedText(text.slice(0, index + 1));
                index++;
            } else {
                clearInterval(timer);
                setIsComplete(true);
                onComplete?.();
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text, speed, onComplete]);

    return (
        <span className={className}>
            {displayedText}
            {!isComplete && (
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block w-[2px] h-[1em] bg-current ml-0.5 align-middle"
                />
            )}
        </span>
    );
}

// For streaming-like effect on longer messages
interface StreamingTextProps {
    text: string;
    speed?: number;
    className?: string;
}

export function StreamingText({ text, speed = 15, className = "" }: StreamingTextProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [isStreaming, setIsStreaming] = useState(true);

    useEffect(() => {
        if (!text) return;

        setDisplayedText("");
        setIsStreaming(true);

        // Split into words for more natural streaming
        const words = text.split(" ");
        let wordIndex = 0;

        const timer = setInterval(() => {
            if (wordIndex < words.length) {
                setDisplayedText(words.slice(0, wordIndex + 1).join(" "));
                wordIndex++;
            } else {
                clearInterval(timer);
                setIsStreaming(false);
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text, speed]);

    return (
        <span className={className}>
            {displayedText}
            {isStreaming && (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block ml-1"
                >
                    ●●●
                </motion.span>
            )}
        </span>
    );
}
