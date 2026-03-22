require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Company = require('../models/Company');
const Internship = require('../models/Internship');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/internhub');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([User.deleteMany(), Company.deleteMany(), Internship.deleteMany()]);
    console.log('Cleared existing data');

    // Create admin
    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin',
      isVerified: true
    });
    console.log('Admin created:', admin.email);

    // Create student
    const student = await User.create({
      name,
      email,
      password,
      role: 'student',
      isVerified: true,
      studentProfile: {
        university: 'Stanford University',
        major: 'Computer Science',
        graduationYear: 2025,
        gpa: 3.8,
        skills: ['JavaScript', 'React', 'Python', 'SQL', 'Node.js'],
        bio: 'Passionate CS student looking for exciting internship opportunities in software engineering.',
        location: 'San Francisco, CA',
        savedInternships: [],
        experience: [],
        education: []
      }
    });
    console.log('Student created:', student.email);

    // Create company user
    const companyUser = await User.create({
      name,
      email,
      password,
      role: 'company',
      isVerified: true
    });

    // Create company profile
    const company = await Company.create({
      user: companyUser._id,
      name: 'TechCorp Inc.',
      industry: 'Technology',
      size: '201-500',
      description: 'TechCorp is a leading technology company building innovative software solutions for enterprises worldwide. We believe in nurturing young talent through meaningful internship experiences.',
      location: 'San Francisco, CA',
      website: 'https://techcorp.example.com',
      founded: 2015,
      isVerified: true,
      rating: 4.5,
      tags: ['SaaS', 'Cloud', 'AI']
    });

    companyUser.companyProfile = company._id;
    await companyUser.save();
    console.log('Company created:', company.name);

    // Create internships
    const internships = await Internship.insertMany([
      {
        title: 'Frontend Developer Intern',
        company: company._id,
        postedBy: companyUser._id,
        description: 'Join our frontend team to build beautiful and responsive web applications using React.js. You will work with senior engineers on real production features that serve thousands of users.',
        requirements: 'Knowledge of HTML, CSS, JavaScript. Familiarity with React.js. Understanding of responsive design principles.',
        responsibilities: 'Build reusable UI components. Collaborate with designers and backend engineers. Write clean, maintainable code. Participate in code reviews.',
        skills: ['React', 'JavaScript', 'CSS', 'HTML', 'TypeScript'],
        category: 'Software Engineering',
        type: 'Full-time',
        duration: '3 months',
        stipend: { min: 1500, max: 2000, currency: 'USD', isPaid: true },
        location: { city: 'San Francisco', country: 'USA', isRemote: false },
        openings: 2,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: 'active',
        perks: ['Mentorship', 'Pre-Placement Offer', 'Flexible Hours'],
        experienceLevel: 'Beginner',
        isFeatured: true
      },
      {
        title: 'Data Science Intern',
        company: company._id,
        postedBy: companyUser._id,
        description: 'Work alongside our data science team to build ML models and derive insights from large datasets. Real experience with production ML systems.',
        requirements: 'Python proficiency. Knowledge of pandas, numpy, scikit-learn. Basic statistics and ML concepts.',
        responsibilities: 'Build and evaluate ML models. Perform data analysis and visualization. Present findings to stakeholders.',
        skills: ['Python', 'Machine Learning', 'SQL', 'pandas', 'TensorFlow'],
        category: 'Data Science',
        type: 'Remote',
        duration: '4 months',
        stipend: { min: 2000, max: 2500, currency: 'USD', isPaid: true },
        location: { city: 'Remote', country: 'USA', isRemote: true },
        openings: 1,
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        status: 'active',
        perks: ['Work from Home', 'Mentorship', 'Learning Budget'],
        experienceLevel: 'Intermediate',
        isFeatured: true
      },
      {
        title: 'UX Design Intern',
        company: company._id,
        postedBy: companyUser._id,
        description: 'Design intuitive user experiences for our enterprise SaaS product. Work directly with product and engineering teams.',
        requirements: 'Proficiency in Figma or Sketch. Understanding of UX principles. Portfolio of design work.',
        responsibilities: 'Create wireframes and prototypes. Conduct user research. Collaborate with product team.',
        skills: ['Figma', 'UI/UX Design', 'Prototyping', 'User Research'],
        category: 'Design',
        type: 'Hybrid',
        duration: '3 months',
        stipend: { min: 1200, max: 1800, currency: 'USD', isPaid: true },
        location: { city: 'San Francisco', country: 'USA', isRemote: false },
        openings: 1,
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'active',
        perks: ['Mentorship', 'Certificate'],
        experienceLevel: 'Beginner',
        isFeatured: false
      }
    ]);
    console.log(`${internships.length} internships created`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
