import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Student } from './src/models/Student';
import Offer from './src/models/Offer';

dotenv.config();

async function createTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sandevex-assessment');
    console.log('Connected to MongoDB');

    // Create a test student
    const student = new Student({
      fullName: 'Test Student',
      email: 'test@example.com',
      mobile: '1234567890',
      cityState: 'Bangalore, Karnataka',
      address: '123 Test Street',
      collegeName: 'Test College',
      degree: 'B.Tech',
      branch: 'Computer Science',
      yearOfPassing: '2022',
      position: 'Software Developer',
      experience: '2 years',
      noticePeriod: '1 month',
      currentCTC: '5 LPA',
      expectedCTC: '8 LPA',
      skills: ['JavaScript', 'React', 'Node.js'],
      resumeLink: 'https://example.com/resume.pdf',
      status: 'active'
    });

    const savedStudent = await student.save();
    console.log('Test student created:', savedStudent);

    // Create a test offer
    const offer = new Offer({
      candidateId: savedStudent._id,
      position: 'Software Developer',
      offeredCTC: '8 LPA',
      status: 'accepted',
      sentAt: new Date(),
      responseDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      emailSent: false,
      notes: 'Test offer for demonstration'
    });

    const savedOffer = await offer.save();
    console.log('Test offer created:', savedOffer);

    // Create another test offer with different status
    const offer2 = new Offer({
      candidateId: savedStudent._id,
      position: 'Senior Developer',
      offeredCTC: '12 LPA',
      status: 'pending',
      sentAt: new Date(),
      responseDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      emailSent: false,
      notes: 'Another test offer'
    });

    const savedOffer2 = await offer2.save();
    console.log('Second test offer created:', savedOffer2);

    console.log('\nTest data created successfully!');
    console.log('You can now test the frontend with this data.');

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createTestData();
