// seed/seedData.js - Database Seed Script for FixIt AI
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Staff = require('../models/Staff');
const Category = require('../models/Category');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fixit_ai';
    await mongoose.connect(mongoUri);
    console.log('[Seed]: Connected to MongoDB at ' + mongoUri);

    // Clear existing collections
    await User.deleteMany({});
    await Staff.deleteMany({});
    await Category.deleteMany({});
    await Complaint.deleteMany({});
    await Notification.deleteMany({});
    console.log('[Seed]: Cleared existing collections.');

    // 1. Create Default Categories (8 categories)
    const categoriesData = [
      { name: 'Electrical', department: 'Electrical', description: 'Power failures, wiring sparks, faulty switches and breakers' },
      { name: 'Plumbing', department: 'Plumbing', description: 'Water leakages, tap replacements, pipe clogging, restroom water supply' },
      { name: 'IT Equipment', department: 'IT Support', description: 'Projectors, computer lab hardware, Wi-Fi routers, network switches' },
      { name: 'Cleaning', department: 'Housekeeping', description: 'Waste disposal, room deep cleaning, spill management, sanitization' },
      { name: 'Furniture', department: 'Maintenance', description: 'Broken desks, ergonomic chairs, doors, window locks, cupboards' },
      { name: 'Security', department: 'Security', description: 'CCTV offline, entry gate sensor issues, access card readers' },
      { name: 'AC / HVAC', department: 'Maintenance', description: 'Air conditioner gas refill, cooling issues, thermostat calibration' },
      { name: 'Other', department: 'Other', description: 'General utility, civil, painting, or miscellaneous repairs' },
    ];
    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`[Seed]: Created ${createdCategories.length} categories.`);

    // 2. Create Users (1 Admin, 3 Staff users, 5 Regular Users)
    // Note: Creating via User.create so pre-save hook properly hashes passwords
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@fixitai.demo',
      phone: '+91 98765 43210',
      password: 'Password123!',
      role: 'admin',
      status: 'active',
    });

    const staffUser1 = await User.create({
      name: 'Raj Patel',
      email: 'staff@fixitai.demo', // Primary demo staff
      phone: '+91 98765 11111',
      password: 'Password123!',
      role: 'staff',
      status: 'active',
    });

    const staffUser2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya.staff@fixitai.demo',
      phone: '+91 98765 22222',
      password: 'Password123!',
      role: 'staff',
      status: 'active',
    });

    const staffUser3 = await User.create({
      name: 'John Doe',
      email: 'john.staff@fixitai.demo',
      phone: '+91 98765 33333',
      password: 'Password123!',
      role: 'staff',
      status: 'active',
    });

    const regularUser1 = await User.create({
      name: 'Arjun Mehta',
      email: 'user@fixitai.demo', // Primary demo user
      phone: '+91 98765 99991',
      password: 'Password123!',
      role: 'user',
      status: 'active',
    });

    const regularUser2 = await User.create({
      name: 'Neha Kapoor',
      email: 'neha.user@fixitai.demo',
      phone: '+91 98765 99992',
      password: 'Password123!',
      role: 'user',
      status: 'active',
    });

    const regularUser3 = await User.create({
      name: 'Karan Verma',
      email: 'karan.user@fixitai.demo',
      phone: '+91 98765 99993',
      password: 'Password123!',
      role: 'user',
      status: 'active',
    });

    const regularUser4 = await User.create({
      name: 'Sneha Rao',
      email: 'sneha.user@fixitai.demo',
      phone: '+91 98765 99994',
      password: 'Password123!',
      role: 'user',
      status: 'active',
    });

    const regularUser5 = await User.create({
      name: 'Vikram Singh',
      email: 'vikram.user@fixitai.demo',
      phone: '+91 98765 99995',
      password: 'Password123!',
      role: 'user',
      status: 'active',
    });

    console.log('[Seed]: Created Admin, Staff, and Regular user accounts.');

    // 3. Create Staff Directory records linked to Staff Users
    const staff1 = await Staff.create({
      name: 'Raj Patel',
      email: 'staff@fixitai.demo',
      phone: '+91 98765 11111',
      department: 'Electrical',
      specialization: 'High-voltage circuits & HVAC wiring',
      status: 'Available',
      user: staffUser1._id,
    });

    const staff2 = await Staff.create({
      name: 'Priya Sharma',
      email: 'priya.staff@fixitai.demo',
      phone: '+91 98765 22222',
      department: 'Plumbing',
      specialization: 'Commercial pipe networks & drainage',
      status: 'Available',
      user: staffUser2._id,
    });

    const staff3 = await Staff.create({
      name: 'John Doe',
      email: 'john.staff@fixitai.demo',
      phone: '+91 98765 33333',
      department: 'IT Support',
      specialization: 'Networking, Audio/Visual, and Server Racks',
      status: 'Busy',
      user: staffUser3._id,
    });
    console.log('[Seed]: Created staff profiles.');

    // 4. Create Sample Complaints (8 complaints with realistic variety)
    const complaintsData = [
      {
        complaintId: 'FC1001',
        title: 'AC unit blowing warm air',
        description: 'The split AC unit in Computer Lab 301 is running but not cooling. The room temperature is rising rapidly.',
        location: 'Lab 301, 3rd Floor Science Wing',
        category: 'AC / HVAC',
        priority: 'High',
        department: 'Maintenance',
        status: 'Assigned',
        reportedBy: regularUser1._id,
        assignedTo: staff1._id,
      },
      {
        complaintId: 'FC1002',
        title: 'Water pipe leakage under washbasin',
        description: 'Severe water dripping from the cold water valve under the second washbasin causing water to pool on the floor.',
        location: '2nd Floor North Wing Restroom',
        category: 'Plumbing',
        priority: 'High',
        department: 'Plumbing',
        status: 'In Progress',
        reportedBy: regularUser1._id,
        assignedTo: staff2._id,
      },
      {
        complaintId: 'FC1003',
        title: 'Ceiling projector lamp flicker and HDMI disconnect',
        description: 'The ceiling-mounted projector continuously loses HDMI handshake during lectures and lamp light flickers.',
        location: 'Main Auditorium, Ground Floor',
        category: 'IT Equipment',
        priority: 'Medium',
        department: 'IT Support',
        status: 'Pending',
        reportedBy: regularUser2._id,
        assignedTo: null,
      },
      {
        complaintId: 'FC1004',
        title: 'Electrical sparks observed in distribution board',
        description: 'Smoke and crackling spark sounds observed when turning on the main lab switches. Immediate attention needed.',
        location: 'Physics Lab 104, 1st Floor',
        category: 'Electrical',
        priority: 'Critical',
        department: 'Electrical',
        status: 'Resolved',
        reportedBy: regularUser1._id,
        assignedTo: staff1._id,
        resolutionNotes: 'Isolated switchboard, replaced burned 32A miniature circuit breaker (MCB) and tested load under 240V.',
        resolvedAt: new Date(Date.now() - 3600000 * 24),
      },
      {
        complaintId: 'FC1005',
        title: 'Wi-Fi Access Point unreachable',
        description: 'Library Wi-Fi router (SSID: Campus_Lib_5G) has flashing red status LED. Students cannot access digital resources.',
        location: 'Central Library, Reference Section',
        category: 'IT Equipment',
        priority: 'Critical',
        department: 'IT Support',
        status: 'In Progress',
        reportedBy: regularUser3._id,
        assignedTo: staff3._id,
      },
      {
        complaintId: 'FC1006',
        title: 'Broken desk hinges and wobbly study table',
        description: 'Desk #14 has broken mounting screws causing the top board to slant precariously.',
        location: 'Classroom 204, Humanities Block',
        category: 'Furniture',
        priority: 'Low',
        department: 'Maintenance',
        status: 'Pending',
        reportedBy: regularUser4._id,
        assignedTo: null,
      },
      {
        complaintId: 'FC1007',
        title: 'Spill cleanup and floor sanitization',
        description: 'Large liquid detergent spill in corridor near staircase posing slipping hazard.',
        location: '1st Floor Corridor near Staircase B',
        category: 'Cleaning',
        priority: 'Medium',
        department: 'Housekeeping',
        status: 'Resolved',
        reportedBy: regularUser5._id,
        assignedTo: staff2._id,
        resolutionNotes: 'Cleaned thoroughly with disinfectant and placed caution wet floor signage.',
        resolvedAt: new Date(Date.now() - 3600000 * 48),
      },
      {
        complaintId: 'FC1008',
        title: 'Main entrance barrier sensor failing to detect tags',
        description: 'RFID automatic boom barrier stays shut even for authorized campus vehicles.',
        location: 'Gate 1, Main Campus Entrance',
        category: 'Security',
        priority: 'High',
        department: 'Security',
        status: 'Assigned',
        reportedBy: regularUser1._id,
        assignedTo: staff3._id,
      },
    ];

    const createdComplaints = await Complaint.insertMany(complaintsData);
    console.log(`[Seed]: Created ${createdComplaints.length} complaints.`);

    // 5. Create Sample Notifications
    const notificationsData = [
      {
        userId: regularUser1._id,
        complaintId: createdComplaints[0]._id,
        message: 'Your complaint #FC1001 has been assigned to Raj Patel (Electrical Department).',
        type: 'assignment',
        isRead: false,
      },
      {
        userId: regularUser1._id,
        complaintId: createdComplaints[1]._id,
        message: 'Your complaint #FC1002 is now In Progress with Priya Sharma.',
        type: 'status',
        isRead: false,
      },
      {
        userId: regularUser1._id,
        complaintId: createdComplaints[3]._id,
        message: 'Your complaint #FC1004 has been resolved: "Isolated switchboard, replaced burned 32A MCB".',
        type: 'resolution',
        isRead: true,
      },
      {
        userId: staffUser1._id,
        complaintId: createdComplaints[0]._id,
        message: 'You have been assigned a new complaint: #FC1001 - "AC unit blowing warm air".',
        type: 'assignment',
        isRead: false,
      },
    ];

    await Notification.insertMany(notificationsData);
    console.log('[Seed]: Created sample notifications.');

    console.log('\n==================================================');
    console.log('SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Demo Login Credentials:');
    console.log('Admin:   admin@fixitai.demo   / Password123!');
    console.log('Staff:   staff@fixitai.demo   / Password123!');
    console.log('User:    user@fixitai.demo    / Password123!');
    console.log('==================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
