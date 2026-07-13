import React, { createContext, useState, useEffect, useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';

const FocusContext = createContext();

export const useFocusTimer = () => useContext(FocusContext);

export const FocusProvider = ({ children }) => {
    const [studyDuration, setStudyDuration] = useState(25 * 60); // 25 mins by default
    const [breakDuration, setBreakDuration] = useState(5 * 60); // 5 mins by default
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [timerActive, setTimerActive] = useState(false);
    const [isStudying, setIsStudying] = useState(true); // true = study, false = break
    
    // Toast notification state
    const [toastMessage, setToastMessage] = useState('');
    const [toastOpen, setToastOpen] = useState(false);
    const [toastSeverity, setToastSeverity] = useState('info');

    const showToast = (message, severity = 'info') => {
        setToastMessage(message);
        setToastSeverity(severity);
        setToastOpen(true);
    };

    const handleToastClose = () => {
        setToastOpen(false);
    };

    const formatCountdownHelper = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}.${s}`;
    };

    useEffect(() => {
        let interval = null;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timerActive && timeLeft === 0) {
            // Switch modes
            if (isStudying) {
                // Time for a break!
                setIsStudying(false);
                setTimeLeft(breakDuration);
                showToast(`🎯 Focus session complete! It's Break Time — status immediately turned to B=${formatCountdownHelper(breakDuration)} ☕`, "success");
            } else {
                // Break is over, back to study
                setIsStudying(true);
                setTimeLeft(studyDuration);
                showToast(`⚡ Break is over! Starting Focus Session — status turned to F=${formatCountdownHelper(studyDuration)} 🚀`, "info");
            }
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [timerActive, timeLeft, isStudying, studyDuration, breakDuration]);

    const startTimer = () => setTimerActive(true);
    const pauseTimer = () => setTimerActive(false);
    const resetTimer = () => {
        setTimerActive(false);
        setTimeLeft(isStudying ? studyDuration : breakDuration);
    };

    const updateDurations = (studyMins, breakMins) => {
        const newStudySec = Math.max(1, studyMins * 60);
        const newBreakSec = Math.max(1, breakMins * 60);
        setStudyDuration(newStudySec);
        setBreakDuration(newBreakSec);
        if (isStudying) setTimeLeft(newStudySec);
        else setTimeLeft(newBreakSec);
        setTimerActive(false); // pause to apply
    };

    return (
        <FocusContext.Provider value={{
            studyDuration,
            breakDuration,
            timeLeft,
            timerActive,
            isStudying,
            startTimer,
            pauseTimer,
            resetTimer,
            updateDurations,
            showToast
        }}>
            {children}
            <Snackbar open={toastOpen} autoHideDuration={6000} onClose={handleToastClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={handleToastClose} severity={toastSeverity} sx={{ width: '100%', fontSize: '1.1rem', py: 1, px: 2 }}>
                    {toastMessage}
                </Alert>
            </Snackbar>
        </FocusContext.Provider>
    );
};
