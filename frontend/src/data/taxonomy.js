// FocusLearner — Full Subject Taxonomy (hardcoded, no API dependency)
export const TAXONOMY = [
  {
    id: "SEC-01", sector: "Natural & Physical Sciences",
    subjects: [
      { id: "SUB-01", name: "Biology",    icon: "Biology",   topics: ["Microbiology","Genetics","Cell Biology","Evolutionary Biology","Zoology","Botany","Virology","Immunology","Marine Biology"] },
      { id: "SUB-02", name: "Physics",    icon: "Physics",   topics: ["Quantum Mechanics","Thermodynamics","Astrophysics","Optics","Electromagnetism","Nuclear Physics","Relativity","Mechanics"] },
      { id: "SUB-03", name: "Chemistry",  icon: "Chemistry", topics: ["Organic Chemistry","Inorganic Chemistry","Biochemistry","Analytical Chemistry","Physical Chemistry","Polymer Chemistry"] },
    ],
  },
  {
    id: "SEC-02", sector: "Financial & Market Sciences",
    subjects: [
      { id: "SUB-04", name: "Banking & Finance",    icon: "Banking",  topics: ["Commercial Banking","Investment Banking","Credit Risk Analysis","Wealth Management","Central Banking Systems","Corporate Finance"] },
      { id: "SUB-05", name: "Financial Markets",    icon: "Markets",  topics: ["Quantitative Trading","Technical Analysis","Equity Research","Options & Derivatives","Market Microstructure","Foreign Exchange"] },
      { id: "SUB-06", name: "Financial Technology", icon: "FinTech",  topics: ["Blockchain Architecture","Cryptocurrency Markets","Smart Contracts","Decentralized Finance (DeFi)","Payment Gateways"] },
    ],
  },
  {
    id: "SEC-03", sector: "Technology & Computing",
    subjects: [
      { id: "SUB-07", name: "Computer Science",  icon: "CS",    topics: ["Software Engineering","Algorithms & Data Structures","Database Management","Cloud Architecture","Operating Systems","Web Development"] },
      { id: "SUB-08", name: "Data Science & AI", icon: "AI",    topics: ["Machine Learning","Deep Learning","Natural Language Processing","Big Data Analytics","Neural Networks","Computer Vision"] },
      { id: "SUB-09", name: "Cybersecurity",     icon: "Cyber", topics: ["Ethical Hacking","Network Security","Cryptography","Penetration Testing","Digital Forensics","Cloud Security"] },
    ],
  },
  {
    id: "SEC-04", sector: "Health & Medicine",
    subjects: [
      { id: "SUB-10", name: "Clinical Medicine", icon: "Medicine", topics: ["Human Anatomy","Pathology","General Surgery","Pharmacology","Internal Medicine","Pediatrics","Cardiology","Oncology"] },
      { id: "SUB-11", name: "Neurosciences",     icon: "Neuro",    topics: ["Cognitive Neuroscience","Neuroanatomy","Neuropharmacology","Behavioral Psychology","Neuroplasticity"] },
    ],
  },
  {
    id: "SEC-05", sector: "Engineering & Architecture",
    subjects: [
      { id: "SUB-12", name: "Mechanical & Aerospace",   icon: "Mech",  topics: ["Fluid Dynamics","Aerodynamics","Robotics","Thermodynamics","Materials Engineering","Propulsion Systems"] },
      { id: "SUB-13", name: "Electrical & Electronics", icon: "Elec",  topics: ["Microprocessors","Integrated Circuits","Telecommunications","Signal Processing","Embedded Systems","Power Systems"] },
    ],
  },
  {
    id: "SEC-06", sector: "Business & Governance",
    subjects: [
      { id: "SUB-14", name: "Economics",  icon: "Econ", topics: ["Microeconomics","Macroeconomics","Econometrics","Behavioral Economics","Game Theory","Development Economics"] },
      { id: "SUB-15", name: "Management", icon: "Mgmt", topics: ["Supply Chain Logistics","Marketing Analytics","Strategic Planning","Human Resource Dynamics","Entrepreneurship","Project Management"] },
    ],
  },
];

export const ALL_SUBJECTS = TAXONOMY.flatMap(s => s.subjects.map(sub => ({ ...sub, sector: s.sector, sectorId: s.id })));
export const getSubject   = (id) => ALL_SUBJECTS.find(s => s.id === id) || null;
export const getTopics    = (subjectId) => getSubject(subjectId)?.topics || [];
