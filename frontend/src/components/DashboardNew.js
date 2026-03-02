import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Grid, Card, CardContent, Button, Chip
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import { courseAPI } from '../services/api';

const StatCard = ({ title, value, icon, color, action }) => (
  <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
    <CardContent sx={{ display: 'flex', flexDirection: 'column', p: 3, position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}15`, color: color, display: 'flex' }}>
          {icon}
        </Box>
        {action && action}
      </Box>
      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>{title}</Typography>
      <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 700, mt: 0.5 }}>{value}</Typography>
    </CardContent>
  </Card>
);

const DashboardNew = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [timeFilter, setTimeFilter] = useState('week');
  let user = { name: "G A MAHAMMAD SAFWAN" };
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) { }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const coursesRes = await courseAPI.getAll();
      setCourses(coursesRes.data.courses || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box mb={4}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
          Hello, {user.name}!
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Here's your learning progress for this week.
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 3, mb: 6 }}>
        <StatCard title="Total Focus Sessions" value={courses.length > 0 ? courses.length : "1"} icon={<MenuBookIcon />} color="#3b82f6" />
        <StatCard
          title="Total Time Spent"
          value="2h 45m"
          icon={<AccessTimeIcon />}
          color="#3b82f6"
          action={
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              style={{ padding: '2px 4px', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', background: 'transparent' }}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          }
        />
        <StatCard title="Active Sessions" value={courses.length > 0 ? courses.length : "1"} icon={<SchoolIcon />} color="#3b82f6" />
        <StatCard title="Completed Sessions" value="0" icon={<CheckCircleOutlineIcon />} color="#3b82f6" />
        <StatCard title="Intelligent Score" value="85/100" icon={<AutoGraphIcon />} color="#10b981" />
      </Box>

      {/* My Enrollments & Applications layout container */}
      <Box display="flex" flexDirection="column" gap={1}>
        {/* My Enrollments */}
        <Box mb={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>My Enrollments</Typography>
            <Button variant="text" size="small" sx={{ color: '#2563eb', fontWeight: 600 }}>View All</Button>
          </Box>
          <Grid container spacing={3}>
            {courses.length > 0 ? courses.slice(0, 1).map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 2, minHeight: 48 }}>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                      Enrolled: N/A
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip label="Enrolled" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 600, borderRadius: 1 }} />
                      <Button variant="outlined" size="small" onClick={() => navigate('/my-courses')} sx={{ borderColor: '#e2e8f0', color: '#0f172a', borderRadius: 2 }}>
                        View
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )) : (
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 2, minHeight: 48 }}>
                      FocusLearner Demo Course: AI & Adaptive Learning
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                      Enrolled: N/A
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip label="Enrolled" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 600, borderRadius: 1 }} />
                      <Button variant="outlined" size="small" onClick={() => navigate('/my-courses')} sx={{ borderColor: '#e2e8f0', color: '#0f172a', borderRadius: 2 }}>
                        View
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Manage Focus Period */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>Manage Focus Period</Typography>
            <Button variant="text" size="small" sx={{ color: '#2563eb', fontWeight: 600 }}>View All</Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6 }}>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 2 }}>No focus periods set yet.</Typography>
            <Button variant="outlined" sx={{ borderRadius: 2, borderColor: '#cbd5e1', color: '#0f172a', fontWeight: 600, px: 3 }}>
              Set up Timers & Breaks
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default DashboardNew;
