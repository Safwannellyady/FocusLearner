import { useState, useEffect } from 'react';

const useFocusMonitor = (isActive = true) => {
    const [isFocused, setIsFocused] = useState(true);
    const [violationCount, setViolationCount] = useState(0);

    useEffect(() => {
        if (!isActive) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsFocused(false);
                setViolationCount(prev => prev + 1);
            } else {
                // We don't auto-resume; user must manually acknowledge
            }
        };

        const handleBlur = () => {
            setIsFocused(false);
            setViolationCount(prev => prev + 1);
        };

        const handleFocus = () => {
            // Optional: Auto-resume? No, let's keep it manual for specific UI enforcement
            // But we might want to know when they are back
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
