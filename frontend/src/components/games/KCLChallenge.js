import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Alert,
  Grid,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { gameAPI } from '../../services/api';

const KCLChallenge = () => {
  const navigate = useNavigate();
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [masteryPoints, setMasteryPoints] = useState(0);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [subjectFocus] = useState('ECE/Network Analysis');

  const maxLevel = 5;

  // Sample KCL problems
  const problems = {
    1: {
      question: 'In a node with three branches, I1 = 5A (entering), I2 = 3A (leaving). What is I3?',
      answer: '2',
      explanation: 'KCL: Sum of currents entering = Sum of currents leaving. I1 = I2 + I3, so 5 = 3 + I3, therefore I3 = 2A (entering).',
      points: 10,
    },
    2: {
      question: 'At a node, currents are: I1 = 10A (entering), I2 = 4A (leaving), I3 = 3A (leaving). What is I4?',
      answer: '3',
      explanation: 'KCL: 10 = 4 + 3 + I4, so I4 = 3A (leaving).',
      points: 15,
    },
    3: {
      question: 'Node has I1 = 8A, I2 = 5A (both entering), I3 = 6A (leaving). What is I4?',
      answer: '7',
      explanation: 'KCL: 8 + 5 = 6 + I4, so I4 = 7A (leaving).',
      points: 20,
    },
    4: {
      question: 'Complex node: I1 = 12A, I2 = 7A (entering), I3 = 5A, I4 = 3A (leaving). What is I5?',
      answer: '11',
      explanation: 'KCL: 12 + 7 = 5 + 3 + I5, so I5 = 11A (leaving).',
      points: 25,
    },
    5: {
      question: 'Advanced: I1 = 15A, I2 = 8A (entering), I3 = 6A, I4 = 4A, I5 = 2A (leaving). What is I6?',
      answer: '11',
      explanation: 'KCL: 15 + 8 = 6 + 4 + 2 + I6, so I6 = 11A (leaving).',
      points: 30,
    },
  };

  useEffect(() => {
    loadProblem();
  }, [level]);

  const loadProblem = () => {
    if (level <= maxLevel) {
      setCurrentProblem(problems[level]);
      setUserAnswer('');
      setFeedback(null);
    } else {
      setCompleted(true);
      submitFinalScore();
    }
  };

  const handleSubmit = () => {
    if (!currentProblem) return;

    const isCorrect = userAnswer.trim() === currentProblem.answer;
    
    if (isCorrect) {
      const pointsEarned = currentProblem.points * level;
      setScore(score + pointsEarned);
      setMasteryPoints(masteryPoints + pointsEarned);
      setFeedback({
        type: 'success',
        message: `Correct! ${currentProblem.explanation}`,
      });

      // Submit progress
      submitProgress(pointsEarned);

      // Move to next level after delay
      setTimeout(() => {
        if (level < maxLevel) {
          setLevel(level + 1);
        } else {
          setCompleted(true);
          submitFinalScore();
        }
      }, 2000);
    } else {
      setFeedback({
        type: 'error',
        message: 'Incorrect. Try again! Remember: KCL states that the sum of currents entering a node equals the sum of currents leaving.',
      });
    }
  };

  const submitProgress = async (points) => {
    try {
      await gameAPI.submitResult(
        'kcl_challenge',
        score + points,
        level,
        subjectFocus
      );
    } catch (error) {
      console.error('Error submitting progress:', error);
    }
  };

  const submitFinalScore = async () => {
    try {
      await gameAPI.submitResult(
        'kcl_challenge',
        score,
        maxLevel,
        subjectFocus
      );
    } catch (error) {
      console.error('Error submitting final score:', error);
    }
  };

  const progressPercentage = (level / maxLevel) * 100;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/games')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4">Kirchhoff's Current Law Challenge</Typography>
      </Box>

      {completed ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Challenge Complete!
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Final Score: {score} points
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Mastery Points: {masteryPoints}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              setLevel(1);
              setScore(0);
              setMasteryPoints(0);
              setCompleted(false);
              loadProblem();
            }}
            sx={{ mt: 2 }}
          >
            Play Again
          </Button>
        </Paper>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Level</Typography>
                  <Typography variant="h4">{level} / {maxLevel}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Score</Typography>
                  <Typography variant="h4">{score}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Mastery Points</Typography>
                  <Typography variant="h4">{masteryPoints}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={{ mb: 3, height: 10, borderRadius: 5 }}
          />

          {currentProblem && (
            <Paper sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom>
                Problem {level}
              </Typography>
              <Typography variant="h6" paragraph sx={{ mt: 2 }}>
                {currentProblem.question}
              </Typography>

              <TextField
                fullWidth
                label="Your Answer (in Amperes)"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                type="number"
                sx={{ mb: 2 }}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              />

              {feedback && (
                <Alert
                  severity={feedback.type}
                  sx={{ mb: 2 }}
                >
                  {feedback.message}
                </Alert>
              )}

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleSubmit}
                disabled={!userAnswer.trim()}
              >
                Submit Answer
              </Button>
            </Paper>
          )}
        </>
      )}
    </Container>
  );
};

export default KCLChallenge;

