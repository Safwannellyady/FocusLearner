import React, { createContext, useState, useEffect, useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { focusAPI } from '../services/api';

const FocusContext = createContext();

export const useFocusTimer = () => useContext(FocusContext);

export const FocusProvider = ({ children }) => {
    const [studyDuration, setStudyDuration] = useState(25 * 60);
    const [breakDuration, setBreakDuration] = useState(5 * 60);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [timerActive, setTimerActive] = useState(false);
    const [isStudying, setIsStudying] = useState(true);
    
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
            if (isStudying) {
                setIsStudying(false);
                setTimeLeft(breakDuration);
                showToast(`Focus session complete! It's Break Time — status immediately turned to B=${formatCountdownHelper(breakDuration)}`, "success");
            } else {
                setIsStudying(true);
                setTimeLeft(studyDuration);
                showToast(`Break is over! Starting Focus Session — status turned to F=${formatCountdownHelper(studyDuration)}`, "info");
            }
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [timerActive, timeLeft, isStudying, studyDuration, breakDuration]);

    useEffect(() => {
        let cancelled = false;
        const token = localStorage.getItem('token');
        if (!token) return; // skip when not logged in — prevents reload loop on /login
        focusAPI.getCurrent().then(res => {
            if (cancelled) return;
            const session = res?.data?.session;
            if (session && session.is_locked) {
                const elapsed = session.elapsed_seconds || 0;
                const remaining = Math.max(0, (session.duration_minutes || 30) * 60 - elapsed);
                setTimeLeft(remaining);
                setTimerActive(true);
                setIsStudying(true);
                setStudyDuration((session.duration_minutes || 30) * 60);
                setBreakDuration(5 * 60);
            }
        }).catch(() => {});
        return () => { cancelled = true; };
    }, []);

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
        setTimerActive(false);
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
