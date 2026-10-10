const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
export const API_BASE_URL = `http://${hostname}:5000/api`;

export const COMPLAINT_STATUSES = [
  'Pending',
  'Assigned',
  'In Progress',
  'Resolved',
  'Rejected',
];

export const COMPLAINT_PRIORITIES = [
  'Low',
  'Medium',
  'High',
  'Critical',
];

export const DEPARTMENTS = [
  'Electrical',
  'Plumbing',
  'IT Support',
  'Housekeeping',
  'Maintenance',
  'Security',
  'Other',
];

export const STAFF_STATUSES = [
  'Available',
  'Busy',
  'Inactive',
];

export const DEMO_ACCOUNTS = {
  admin: {
    email: 'admin@fixitai.demo',
    password: 'Password123!',
    role: 'Admin',
  },
  staff: {
    email: 'staff@fixitai.demo',
    password: 'Password123!',
    role: 'Staff (Raj Patel)',
  },
  user: {
    email: 'user@fixitai.demo',
    password: 'Password123!',
    role: 'User (Arjun Mehta)',
  },
};
