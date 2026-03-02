import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Grid, Card, CardContent, Button, Chip
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { courseAPI } from '../services/api';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3, gap: 2 }}>
      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}15`, color: color, display: 'flex' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>{title}</Typography>
        <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 700 }}>{value}</Typography>
      </Box>
    </CardContent>
  </Card>
);

const DashboardNew = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
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
      <Grid container spacing={3} mb={6}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Enrollments" value={courses.length > 0 ? courses.length : "1"} icon={<MenuBookIcon />} color="#3b82f6" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Applications" value="0" icon={<AssignmentIcon />} color="#3b82f6" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Enrolled Courses" value={courses.length > 0 ? courses.length : "1"} icon={<SchoolIcon />} color="#3b82f6" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Completed" value="0" icon={<CheckCircleOutlineIcon />} color="#3b82f6" />
        </Grid>
      </Grid>

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
                      Understanding Incubation and Entrepreneurship Prof. B K Chakravarthy
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

        {/* My Applications */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>My Applications</Typography>
            <Button variant="text" size="small" sx={{ color: '#2563eb', fontWeight: 600 }}>View All</Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6 }}>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 2 }}>No applications yet.</Typography>
            <Button variant="outlined" sx={{ borderRadius: 2, borderColor: '#cbd5e1', color: '#0f172a', fontWeight: 600, px: 3 }}>
              Go to My Applications
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default DashboardNew;
