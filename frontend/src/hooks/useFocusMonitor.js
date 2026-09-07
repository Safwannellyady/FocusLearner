import { useState, useEffect, useRef } from 'react';

const useFocusMonitor = (isActive = true) => {
    const [isFocused, setIsFocused] = useState(true);
    const [violationCount, setViolationCount] = useState(0);
    const lastViolationRef = useRef(0);

    useEffect(() => {
        if (!isActive) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsFocused(false);
                setViolationCount(prev => prev + 1);
            } else {
                setIsFocused(true);
            }
        };

        const handleBlur = () => {
            const now = Date.now();
            if (now - lastViolationRef.current < 1000) return;
            lastViolationRef.current = now;
            setIsFocused(false);
            setViolationCount(prev => prev + 1);
        };

        const handleFocus = () => {
            setIsFocused(true);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, [isActive]);

    const resumeFocus = () => {
        setIsFocused(true);
    };

    return { isFocused, violationCount, resumeFocus };
};

export default useFocusMonitor;
