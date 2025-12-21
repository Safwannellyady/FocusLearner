import React, { useEffect, useRef } from 'react';
import { usePageVisibility } from 'react-page-visibility';
import { focusAPI } from '../services/api';

/**
 * FocusMonitor
 * Monitors page visibility and logs distractions.
 * Pass 'onDistractionStart', 'onDistractionEnd', and 'active' props.
 */
const FocusMonitor = ({ active, onDistractionStart, onDistractionEnd }) => {
    const lastHiddenTime = useRef(null);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!active) return;

            if (document.hidden) {
                // User left the tab
                lastHiddenTime.current = Date.now();
                console.log("🙈 Distraction Started at", new Date(lastHiddenTime.current).toLocaleTimeString());
                if (onDistractionStart) onDistractionStart();
            } else {
                // User returned to tab
                if (lastHiddenTime.current) {
                    const now = Date.now();
                    const durationSeconds = Math.floor((now - lastHiddenTime.current) / 1000);

                    console.log(`👀 Distraction Ended. Duration: ${durationSeconds}s`);

                    // Only log significant distractions (> 2 seconds to avoid accidental flicks)
                    if (durationSeconds > 2) {
                        focusAPI.logDistraction(durationSeconds, 'tab_switch', new Date(lastHiddenTime.current).toISOString())
                            .catch(err => console.error("Failed to log distraction:", err));

                        if (onDistractionEnd) onDistractionEnd(durationSeconds);
                    }

                    lastHiddenTime.current = null;
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [active, onDistractionStart, onDistractionEnd]);

    return null; // Headless component
};

export default FocusMonitor;
