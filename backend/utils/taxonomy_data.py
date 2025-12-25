"""
Centralized Taxonomy Data for FocusLearner
Migrated from frontend/src/components/DashboardNew.js
"""

SUBJECTS = [
  # Engineering
  'Engineering/Network Analysis',
  'Engineering/Circuit Theory',
  'Engineering/Algorithms',
  'Engineering/Data Structures',
  'Engineering/Thermodynamics',
  'Engineering/Fluid Mechanics',
  'Engineering/Digital Logic',

  # Medical & Science
  'Medical/Anatomy',
  'Medical/Physiology',
  'Medical/Biochemistry',
  'Medical/Pharmacology',
  'Science/Physics',
  'Science/Chemistry',
  'Science/Biology',

  # Mathematics
  'Math/Linear Algebra',
  'Math/Calculus',
  'Math/Statistics',
  'Math/Discrete Math',

  # Commerce & Business
  'Commerce/Economics',
  'Commerce/Accounting',
  'Commerce/Business Studies',
  'Commerce/Finance',
  'Commerce/Marketing',

  # Arts & Humanities
  'Arts/History',
  'Arts/Political Science',
  'Arts/Psychology',
  'Arts/Sociology',
  'Arts/Literature',
  'Arts/Philosophy',

  # Law
  'Law/Constitutional Law',
  'Law/Criminal Law',
  'Law/Contract Law',

  # Technology
  'Tech/Web Development',
  'Tech/Machine Learning',
  'Tech/Cybersecurity',

  # Languages
  'Language/English',
  'Language/Spanish',
  'Language/French',
]

TOPIC_TAXONOMY = {
  "Engineering/Network Analysis": ["Basic Concepts", "KCL & KVL", "Mesh Analysis", "Nodal Analysis", "Theorems", "AC Circuits"],
  "Engineering/Circuit Theory": ["Resonance", "Two Port Networks", "Transient Analysis", "Graph Theory"],
  "Engineering/Algorithms": ["Sorting", "Searching", "Graph Algorithms", "Dynamic Programming", "Greedy Algorithms"],
  "Engineering/Data Structures": ["Arrays", "Linked Lists", "Stacks & Queues", "Trees", "Graphs"],
  "Math/Linear Algebra": ["Vectors", "Matrices", "System of Equations", "Eigenvalues", "Vector Spaces"],
  "Math/Calculus": ["Limits", "Derivatives", "Integration", "Applications of Derivatives"],
  "default": ["General", "Introduction", "Advanced Concepts", "Exam Prep"]
}
