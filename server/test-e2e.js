// test-e2e.js - End-to-end API and CRUD testing script using native Node fetch
const API = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('=== STARTING FIXIT AI FULL E2E VALIDATION ===\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  };

  const req = async (endpoint, options = {}) => {
    const res = await fetch(`${API}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const data = await res.json();
    return { status: res.status, data };
  };

  try {
    // 1. Health check
    const health = await req('/health');
    assert(health.data.success === true, 'Backend health check');

    // 2. Login as User
    const userLogin = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@fixitai.demo',
        password: 'Password123!',
      }),
    });
    assert(userLogin.data.success === true && userLogin.data.data.role === 'user', 'User Login');
    const userToken = userLogin.data.data.token;
    const userHeaders = { Authorization: `Bearer ${userToken}` };

    // 3. Login as Admin
    const adminLogin = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@fixitai.demo',
        password: 'Password123!',
      }),
    });
    assert(adminLogin.data.success === true && adminLogin.data.data.role === 'admin', 'Admin Login');
    const adminToken = adminLogin.data.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // 4. Login as Staff
    const staffLogin = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'staff@fixitai.demo',
        password: 'Password123!',
      }),
    });
    assert(staffLogin.data.success === true && staffLogin.data.data.role === 'staff', 'Staff Login');
    const staffToken = staffLogin.data.data.token;
    const staffHeaders = { Authorization: `Bearer ${staffToken}` };

    // 5. Test Register a New User
    const testEmail = `testuser_${Date.now()}@fixitai.demo`;
    const userRegister = await req('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Verification Test User',
        email: testEmail,
        phone: '+91 99999 88888',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }),
    });
    assert(userRegister.data.success === true && userRegister.data.data.email === testEmail, 'User Registration');

    // 6. Test Category CRUD (Admin)
    const newCategory = await req('/categories', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: `Audio-Visual Equipment ${Date.now()}`,
        department: 'IT Support',
        description: 'Microphones, amplifiers, and podium speakers',
        status: 'Active',
      }),
    });
    assert(newCategory.data.success === true, 'Category CREATE');
    const catId = newCategory.data.data._id;

    const updateCategory = await req(`/categories/${catId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ description: 'Updated sound systems and speakers' }),
    });
    assert(updateCategory.data.data.description === 'Updated sound systems and speakers', 'Category UPDATE');

    const deleteCat = await req(`/categories/${catId}`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    assert(deleteCat.data.success === true, 'Category DELETE');

    // 7. Test Staff CRUD (Admin)
    const testStaffEmail = `technician_${Date.now()}@fixitai.demo`;
    const newStaff = await req('/staff', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Suresh Kumar',
        email: testStaffEmail,
        phone: '+91 98888 12345',
        department: 'Maintenance',
        specialization: 'Civil & Roof Waterproofing',
        status: 'Available',
      }),
    });
    assert(newStaff.data.success === true, 'Staff CREATE');
    const staffId = newStaff.data.data._id;

    const updateStaff = await req(`/staff/${staffId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'Busy', specialization: 'Structural Masonry' }),
    });
    assert(updateStaff.data.data.status === 'Busy', 'Staff UPDATE');

    const deleteStaff = await req(`/staff/${staffId}`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    assert(deleteStaff.data.success === true, 'Staff DELETE');

    // 8. Test AI Analysis endpoint
    const aiTest = await req('/ai/analyze', {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({
        description: 'AC in classroom 204 is running but it is not cooling properly.',
      }),
    });
    const aiResult = aiTest.data?.data;
    assert(
      aiTest.status === 200 && aiTest.data?.success === true,
      'AI Analysis Endpoint (/api/ai/analyze)'
    );

    // 9. Test Complaint CREATE (User with AI suggestions)
    const newComplaint = await req('/complaints', {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({
        title: 'AC not cooling in classroom 204',
        description: 'The AC in classroom 204 is running but it is not cooling properly.',
        location: 'Classroom 204',
        category: aiResult ? aiResult.category : 'AC & Cooling',
        priority: aiResult ? aiResult.priority : 'High',
        department: aiResult ? aiResult.department : 'Maintenance',
        aiAnalysis: aiResult,
      }),
    });
    assert(newComplaint.data?.success === true && newComplaint.data?.data?.complaintId?.startsWith('FC'), 'Complaint CREATE (with AI)');
    const compId = newComplaint.data.data._id;

    // 10. Test Admin Review AI suggestions
    const adminReview = await req(`/admin/complaints/${compId}/review`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        category: 'AC & Cooling',
        priority: 'High',
        department: 'Maintenance',
        adminRemarks: 'Reviewed and confirmed AI priority assignment.',
      }),
    });
    assert(adminReview.status === 200 && adminReview.data?.success === true, 'Admin Review AI Suggestions');

    // 11. Test Complaint History Timeline
    const historyTest = await req(`/complaints/${compId}/history`, {
      headers: userHeaders,
    });
    assert(
      historyTest.status === 200 && historyTest.data?.success === true && historyTest.data?.data?.length >= 1,
      'Complaint History Timeline Fetch'
    );

    // 12. Test Complaint UPDATE while Pending (User)
    const updateComp = await req(`/complaints/${compId}`, {
      method: 'PUT',
      headers: userHeaders,
      body: JSON.stringify({ title: 'AC not cooling properly in classroom 204', priority: 'High' }),
    });
    assert(updateComp.data.data.priority === 'High', 'Complaint UPDATE');

    // 10. Test Admin Assign Staff
    const allStaff = await req('/staff', { headers: adminHeaders });
    const assignedStaffMember = allStaff.data.data[0];
    const assignRes = await req(`/admin/complaints/${compId}/assign`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ staffId: assignedStaffMember._id }),
    });
    assert(assignRes.data.success === true && assignRes.data.data.status === 'Assigned', 'Admin Complaint ASSIGN');

    // 11. Test Staff Updates Status (In Progress -> Resolved)
    const progressRes = await req(`/complaints/${compId}/staff-status`, {
      method: 'PUT',
      headers: staffHeaders,
      body: JSON.stringify({ status: 'In Progress' }),
    });
    assert(progressRes.data.data.status === 'In Progress', 'Staff Status -> In Progress');

    const resolveRes = await req(`/complaints/${compId}/staff-status`, {
      method: 'PUT',
      headers: staffHeaders,
      body: JSON.stringify({
        status: 'Resolved',
        resolutionNotes: 'Tightened compression coupling and replaced rubber O-ring seal.',
      }),
    });
    assert(
      resolveRes.data.data.status === 'Resolved' && resolveRes.data.data.resolvedAt !== null,
      'Staff Status -> Resolved with Notes'
    );

    // 12. Test Notifications
    const notifs = await req('/notifications', { headers: userHeaders });
    assert(notifs.data.success === true && notifs.data.data.length > 0, 'Notifications Fetch');

    const firstNotifId = notifs.data.data[0]._id;
    const markRead = await req(`/notifications/${firstNotifId}/read`, {
      method: 'PUT',
      headers: userHeaders,
    });
    assert(markRead.data.success === true && markRead.data.data.isRead === true, 'Notification Mark as Read');

    // 13. Test Admin Dashboard Statistics
    const dashStats = await req('/admin/dashboard', { headers: adminHeaders });
    assert(
      dashStats.data.success === true &&
      dashStats.data.data.summary.total > 0 &&
      dashStats.data.data.charts.byCategory.length > 0,
      'Admin Dashboard Live MongoDB Aggregations'
    );

    // 14. Test User Deletion of Pending Complaint
    const tempComp = await req('/complaints', {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({
        title: 'Temporary test complaint for deletion',
        description: 'Will be deleted immediately',
        location: 'Room 999',
        category: 'Other',
        priority: 'Low',
      }),
    });
    const deleteComp = await req(`/complaints/${tempComp.data.data._id}`, {
      method: 'DELETE',
      headers: userHeaders,
    });
    assert(deleteComp.data.success === true, 'Complaint DELETE (Pending)');

    console.log('\n=============================================');
    console.log(`E2E TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('=============================================\n');
  } catch (error) {
    console.error('Test execution error:', error);
  }
};

runTests();
