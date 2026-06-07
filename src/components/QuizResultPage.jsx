import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, Divider, List, ListItem,
  ListItemText, Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const QuizResultPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { result, quizTitle } = state || {};

  if (!result) {
    return <Typography sx={{ p: 4 }}>No result data found.</Typography>;
  }

  const { score, total, percentage, detailedResults } = result;

  const getPerformanceLabel = (perc) => {
    if (perc >= 85) return { label: 'Excellent', color: 'success' };
    if (perc >= 70) return { label: 'Good', color: 'primary' };
    if (perc >= 50) return { label: 'Average', color: 'warning' };
    return { label: 'Needs Improvement', color: 'error' };
  };

  const performance = getPerformanceLabel(percentage);

  return (
    <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Paper sx={{ maxWidth: 900, mx: 'auto', p: 5, borderRadius: 4 }}>
        <Typography variant="h3" align="center" gutterBottom fontWeight="bold">
          Quiz Complete!
        </Typography>

        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h2" color="primary">{percentage}%</Typography>
          <Typography variant="h5">({score} out of {total} correct)</Typography>
          <Chip 
            label={performance.label} 
            color={performance.color} 
            sx={{ mt: 2, fontSize: '1.1rem', px: 3, py: 1 }}
          />
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>Question Review</Typography>
        
        <List>
          {detailedResults.map((item, index) => (
            <ListItem key={index} sx={{ mb: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <ListItemText 
                primary={item.question}
                secondary={
                  <>
                    <strong>Your Answer:</strong> {item.userAnswer || "Not answered"}<br/>
                    <strong>Correct Answer:</strong> {item.correctAnswer}
                  </>
                }
              />
              {item.isCorrect ? (
                <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />
              ) : (
                <CancelIcon color="error" sx={{ fontSize: 32 }} />
              )}
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 5, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/quizzes')}
            size="large"
          >
            Try Another Quiz
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/performance')}
            size="large"
          >
            View Performance
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default QuizResultPage;