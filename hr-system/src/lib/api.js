import api from "./axios";
import axios from "axios";

/* ======================
        AUTH
====================== */

// Register a new user
export const register = (data) => {
  return api.post("/Auth/register", data);
};

// Login user
export const login = (data) => {
  return api.post("/Auth/login", data);
};

// Logout user
// Authorization: Any authenticated user
export const logout = () => {
  return api.post("/Auth/logout");
};

// Refresh token (manual refresh if needed)
export const refreshToken = (refreshToken) => {
  return axios.post("http://localhost:5179/api/Auth/refresh-token", refreshToken, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
};

/* ======================
    COMPANY PROFILE
====================== */

// Get all company profiles
export const getAllCompanyProfiles = () => {
  return api.get("/CompanyProfile");
};

// Get company profile by ID
export const getCompanyProfileById = (id) => {
  return api.get(`/CompanyProfile/${id}`);
};

// Create company profile
export const createCompanyProfile = (data) => {
  return api.post("/CompanyProfile", data);
};

// Update company profile
export const updateCompanyProfile = (id, data) => {
  return api.put(`/CompanyProfile/${id}`, data);
};

// Delete company profile (soft delete)
export const deleteCompanyProfile = (id) => {
  return api.delete(`/CompanyProfile/${id}`);
};

/* ======================
        BRANCH
====================== */

// Get all branches
export const getAllBranches = () => {
  return api.get("/Branch");
};

// Get branch by ID
export const getBranchById = (id) => {
  return api.get(`/Branch/${id}`);
};

// Get branches by company ID
export const getBranchesByCompanyId = (companyId) => {
  return api.get(`/Branch/company/${companyId}`);
};

// Create branch
export const createBranch = (data) => {
  return api.post("/Branch", data);
};

// Update branch
export const updateBranch = (id, data) => {
  return api.put(`/Branch/${id}`, data);
};

// Delete branch (soft delete)
export const deleteBranch = (id) => {
  return api.delete(`/Branch/${id}`);
};

/* ======================
    HR DEPARTMENT
====================== */

// Get all HR departments
export const getAllHRDepartments = () => {
  return api.get("/HRDepartment");
};

// Get HR departments by branch ID
export const getHRDepartmentsByBranchId = (branchId) => {
  return api.get(`/HRDepartment/branch/${branchId}`);
};

// Create HR department
export const createHRDepartment = (data) => {
  return api.post("/HRDepartment", data);
};

// Update HR department
export const updateHRDepartment = (id, data) => {
  return api.put(`/HRDepartment/${id}`, data);
};

// Delete HR department (soft delete)
export const deleteHRDepartment = (id) => {
  return api.delete(`/HRDepartment/${id}`);
};

/* ======================
        USER
====================== */

// Get all users
export const getAllUsers = () => {
  return api.get("/User");
};

// Get user by ID
export const getUserById = (id) => {
  return api.get(`/User/${id}`);
};

// Update user role
export const updateUserRole = (id, role) => {
  return api.put(`/User/${id}/role`, role, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
};

// Delete user
export const deleteUser = (id) => {
  return api.delete(`/User/${id}`);
};

/* ======================
        EMPLOYEE
====================== */

// Create a new employee
// Authorization: Admin, HR
export const createEmployee = (data) => {
  return api.post("/Employee", data);
};

// Get all employees (view-only)
// Authorization: Admin, HR
export const getAllEmployees = () => {
  return api.get("/Employee");
};

// Get employee by ID
// Authorization: Admin, HR, Employee
// - Admin/HR can view any employee
// - Employee can view only their own data (enforced by backend using JWT)
export const getEmployeeById = (id) => {
  return api.get(`/Employee/${id}`);
};

// Update employee by ID
// Authorization: Admin, HR
// Condition: Backend should ensure the ID in route matches ID in body
export const updateEmployee = (id, data) => {
  return api.put(`/Employee/${id}`, data);
};

// Delete employee by ID
// Authorization: Admin
export const deleteEmployee = (id) => {
  return api.delete(`/Employee/${id}`);
};

/* ======================
        PROJECT
====================== */

// Get all projects
// Authorization: Admin, HR, Employee (Employee Read Access)
export const getAllProjects = () => {
  return api.get("/Project");
};

// Get project by ID
// Authorization: Admin, HR, Employee
export const getProjectById = (id) => {
  return api.get(`/Project/${id}`);
};

// Create project
// Authorization: Admin
export const createProject = (data) => {
  return api.post("/Project", data);
};

// Update project
// Authorization: Admin
export const updateProject = (id, data) => {
  return api.put(`/Project/${id}`, data);
};

// Delete project
// Authorization: Admin
export const deleteProject = (id) => {
  return api.delete(`/Project/${id}`);
};

/* ======================
    BENEFIT TYPE
====================== */

// Get all benefit types
export const getAllBenefitTypes = () => {
  return api.get("/BenefitType");
};

// Get benefit type by ID
export const getBenefitTypeById = (id) => {
  return api.get(`/BenefitType/${id}`);
};

// Create benefit type
export const createBenefitType = (data) => {
  return api.post("/BenefitType", data);
};

// Update benefit type
export const updateBenefitType = (id, data) => {
  return api.put(`/BenefitType/${id}`, data);
};

// Delete benefit type
export const deleteBenefitType = (id) => {
  return api.delete(`/BenefitType/${id}`);
};

/* ======================
    BENEFITS COMPENSATION
====================== */

// Get all benefits compensations
export const getAllBenefitsCompensations = () => {
  return api.get("/BenefitsCompensation");
};

// Get benefits compensation by ID
export const getBenefitsCompensationById = (id) => {
  return api.get(`/BenefitsCompensation/${id}`);
};

// Create benefits compensation
export const createBenefitsCompensation = (data) => {
  return api.post("/BenefitsCompensation", data);
};

// Update benefits compensation
export const updateBenefitsCompensation = (id, data) => {
  return api.put(`/BenefitsCompensation/${id}`, data);
};

// Delete benefits compensation
export const deleteBenefitsCompensation = (id) => {
  return api.delete(`/BenefitsCompensation/${id}`);
};

/* ======================
        TRAINING
====================== */

// Get all training courses
// Authorization: Admin, HR
export const getAllTrainings = () => {
  return api.get("/Training");
};

// Get training by ID
// Authorization: Admin, HR
export const getTrainingById = (id) => {
  return api.get(`/Training/${id}`);
};

// Create training course
// Authorization: Admin
export const createTraining = (data) => {
  return api.post("/Training", data);
};

// Update training course
// Authorization: Admin
export const updateTraining = (id, data) => {
  return api.put(`/Training/${id}`, data);
};

// Delete training course
// Authorization: Admin
export const deleteTraining = (id) => {
  return api.delete(`/Training/${id}`);
};

/* ======================
        JOB
====================== */

// Get all jobs
// Authorization: Admin, HR
export const getAllJobs = () => {
  return api.get("/Job");
};

// Get job by ID
// Authorization: Admin, HR
export const getJobById = (id) => {
  return api.get(`/Job/${id}`);
};

// Create job
// Authorization: Admin, HR
export const createJob = (data) => {
  return api.post("/Job", data);
};

// Update job
// Authorization: Admin, HR
export const updateJob = (id, data) => {
  return api.put(`/Job/${id}`, data);
};

// Delete job
// Authorization: Admin
export const deleteJob = (id) => {
  return api.delete(`/Job/${id}`);
};

/* ======================
    SELF SERVICE REQUEST
====================== */

// Get all self-service requests
// Authorization: Admin, HR
export const getAllSelfServiceRequests = () => {
  return api.get("/SelfServiceRequest");
};

// Get self-service request by ID
// Authorization: Admin, HR, Employee (Employee can only view their own)
export const getSelfServiceRequestById = (id) => {
  return api.get(`/SelfServiceRequest/${id}`);
};

// Create self-service request
// Authorization: Admin, HR
export const createSelfServiceRequest = (data) => {
  return api.post("/SelfServiceRequest", data);
};

// Update self-service request
// Authorization: Admin, HR
export const updateSelfServiceRequest = (id, data) => {
  return api.put(`/SelfServiceRequest/${id}`, data);
};

// Delete self-service request
// Authorization: Admin
export const deleteSelfServiceRequest = (id) => {
  return api.delete(`/SelfServiceRequest/${id}`);
};

/* ======================
        SURVEY
====================== */

// Get all surveys
// Authorization: Admin, HR
export const getAllSurveys = () => {
  return api.get("/Survey");
};

// Get survey by ID
// Authorization: Admin, HR
export const getSurveyById = (id) => {
  return api.get(`/Survey/${id}`);
};

// Create survey
// Authorization: Admin, HR
export const createSurvey = (data) => {
  return api.post("/Survey", data);
};

// Update survey
// Authorization: Admin
export const updateSurvey = (id, data) => {
  return api.put(`/Survey/${id}`, data);
};

// Delete survey
// Authorization: Admin
export const deleteSurvey = (id) => {
  return api.delete(`/Survey/${id}`);
};

/* ======================
    SURVEY RESPONSE
====================== */

// Get all survey responses
// Authorization: Admin, HR
export const getAllSurveyResponses = () => {
  return api.get("/SurveyResponse");
};

// Get survey response by ID
// Authorization: Admin, HR
export const getSurveyResponseById = (id) => {
  return api.get(`/SurveyResponse/${id}`);
};

// Create/submit survey response
// Authorization: Admin, HR, Employee (all authenticated users)
export const createSurveyResponse = (data) => {
  return api.post("/SurveyResponse", data);
};

// Update survey response
// Authorization: Admin, HR
export const updateSurveyResponse = (id, data) => {
  return api.put(`/SurveyResponse/${id}`, data);
};

// Delete survey response
// Authorization: Admin
export const deleteSurveyResponse = (id) => {
  return api.delete(`/SurveyResponse/${id}`);
};

/* ======================
        SALARY
====================== */

// Get all salary records
// Authorization: Admin, HR
export const getAllSalaries = () => {
  return api.get("/Salary");
};

// Get salary by ID
// Authorization: Admin, HR, Employee (Employee can only view their own)
export const getSalaryById = (id) => {
  return api.get(`/Salary/${id}`);
};

// Create salary record
// Authorization: Admin, HR
export const createSalary = (data) => {
  return api.post("/Salary", data);
};

// Update salary record
// Authorization: Admin, HR
export const updateSalary = (id, data) => {
  return api.put(`/Salary/${id}`, data);
};

// Delete salary record
// Authorization: Admin
export const deleteSalary = (id) => {
  return api.delete(`/Salary/${id}`);
};

/* ======================
    RECRUITMENT PORTAL
====================== */

// Get all recruitment portals
// Authorization: Admin, HR
export const getAllRecruitmentPortals = () => {
  return api.get("/RecruitmentPortal");
};

// Get recruitment portal by ID
// Authorization: Admin, HR
export const getRecruitmentPortalById = (id) => {
  return api.get(`/RecruitmentPortal/${id}`);
};

// Create recruitment portal
// Authorization: Admin
export const createRecruitmentPortal = (data) => {
  return api.post("/RecruitmentPortal", data);
};

// Update recruitment portal
// Authorization: Admin
export const updateRecruitmentPortal = (id, data) => {
  return api.put(`/RecruitmentPortal/${id}`, data);
};

// Delete recruitment portal
// Authorization: Admin
export const deleteRecruitmentPortal = (id) => {
  return api.delete(`/RecruitmentPortal/${id}`);
};

/* ======================
    PERFORMANCE EVALUATION
====================== */

// Get all performance evaluations
// Authorization: Admin, HR
export const getAllPerformanceEvaluations = () => {
  return api.get("/PerformanceEvaluation");
};

// Get performance evaluation by ID
// Authorization: Admin, HR
export const getPerformanceEvaluationById = (id) => {
  return api.get(`/PerformanceEvaluation/${id}`);
};

// Create performance evaluation
// Authorization: Admin, HR
export const createPerformanceEvaluation = (data) => {
  return api.post("/PerformanceEvaluation", data);
};

// Update performance evaluation
// Authorization: Admin, HR
export const updatePerformanceEvaluation = (id, data) => {
  return api.put(`/PerformanceEvaluation/${id}`, data);
};

// Delete performance evaluation
// Authorization: Admin
export const deletePerformanceEvaluation = (id) => {
  return api.delete(`/PerformanceEvaluation/${id}`);
};

/* ======================
        CV BANK
====================== */

// Get all CVs
// Authorization: Admin, HR
export const getAllCVs = () => {
  return api.get("/CVBank");
};

// Get CV by ID
// Authorization: Admin, HR
export const getCVById = (id) => {
  return api.get(`/CVBank/${id}`);
};

// Create CV
// Authorization: Admin, HR
export const createCV = (data) => {
  return api.post("/CVBank", data);
};

// Update CV
// Authorization: Admin, HR
export const updateCV = (id, data) => {
  return api.put(`/CVBank/${id}`, data);
};

// Delete CV
// Authorization: Admin
export const deleteCV = (id) => {
  return api.delete(`/CVBank/${id}`);
};

/* ======================
    DOCUMENT MANAGEMENT
====================== */

// Get all documents
// Authorization: Admin, HR
export const getAllDocuments = () => {
  return api.get("/DocumentManagement");
};

// Get document by ID
// Authorization: Admin, HR
export const getDocumentById = (id) => {
  return api.get(`/DocumentManagement/${id}`);
};

// Get documents by employee ID
// Authorization: Admin, HR
export const getDocumentsByEmployeeId = (employeeId) => {
  return api.get(`/DocumentManagement/employee/${employeeId}`);
};

// Create document
// Authorization: Admin, HR
export const createDocument = (data) => {
  return api.post("/DocumentManagement", data);
};

// Update document
// Authorization: Admin, HR
export const updateDocument = (id, data) => {
  return api.put(`/DocumentManagement/${id}`, data);
};

// Delete document
// Authorization: Admin
export const deleteDocument = (id) => {
  return api.delete(`/DocumentManagement/${id}`);
};

/* ======================
    HR NEED REQUEST
====================== */

// Get all HR need requests
// Authorization: Admin, HR
export const getAllHRNeedRequests = () => {
  return api.get("/HRNeedRequest");
};

// Get HR need request by ID
// Authorization: Admin, HR
export const getHRNeedRequestById = (id) => {
  return api.get(`/HRNeedRequest/${id}`);
};

// Create HR need request
// Authorization: Admin, HR
export const createHRNeedRequest = (data) => {
  return api.post("/HRNeedRequest", data);
};

// Update HR need request
// Authorization: Admin, HR
export const updateHRNeedRequest = (id, data) => {
  return api.put(`/HRNeedRequest/${id}`, data);
};

// Delete HR need request
// Authorization: Admin
export const deleteHRNeedRequest = (id) => {
  return api.delete(`/HRNeedRequest/${id}`);
};

/* ======================
        INTERVIEW
====================== */

// Get all interviews
// Authorization: Admin, HR
export const getAllInterviews = () => {
  return api.get("/Interview");
};

// Get interview by ID
// Authorization: Admin, HR
export const getInterviewById = (id) => {
  return api.get(`/Interview/${id}`);
};

// Create interview
// Authorization: Admin, HR
export const createInterview = (data) => {
  return api.post("/Interview", data);
};

// Update interview
// Authorization: Admin, HR
export const updateInterview = (id, data) => {
  return api.put(`/Interview/${id}`, data);
};

// Delete interview
// Authorization: Admin
export const deleteInterview = (id) => {
  return api.delete(`/Interview/${id}`);
};

/* ======================
    EVALUATION CRITERIA
====================== */

// Get all evaluation criteria
// Authorization: Admin, HR
export const getAllEvaluationCriteria = () => {
  return api.get("/EvaluationCriteria");
};

// Get evaluation criteria by ID
// Authorization: Admin, HR
export const getEvaluationCriteriaById = (id) => {
  return api.get(`/EvaluationCriteria/${id}`);
};

// Create evaluation criteria
// Authorization: Admin, HR
export const createEvaluationCriteria = (data) => {
  return api.post("/EvaluationCriteria", data);
};

// Update evaluation criteria
// Authorization: Admin, HR
export const updateEvaluationCriteria = (id, data) => {
  return api.put(`/EvaluationCriteria/${id}`, data);
};

// Delete evaluation criteria
// Authorization: Admin
export const deleteEvaluationCriteria = (id) => {
  return api.delete(`/EvaluationCriteria/${id}`);
};

/* ======================
        CANDIDATE
====================== */

// Get all candidates
// Authorization: Admin, HR
export const getAllCandidates = () => {
  return api.get("/Candidate");
};

// Get candidate by ID
// Authorization: Admin, HR
export const getCandidateById = (id) => {
  return api.get(`/Candidate/${id}`);
};

// Create candidate
// Authorization: Admin, HR
export const createCandidate = (data) => {
  return api.post("/Candidate", data);
};

// Update candidate
// Authorization: Admin, HR
export const updateCandidate = (id, data) => {
  return api.put(`/Candidate/${id}`, data);
};

// Delete candidate
// Authorization: Admin
export const deleteCandidate = (id) => {
  return api.delete(`/Candidate/${id}`);
};

/* ======================
    JOB APPLICATION
====================== */

// Get all job applications
// Authorization: Admin, HR
export const getAllJobApplications = () => {
  return api.get("/JobApplication");
};

// Get job application by ID
// Authorization: Admin, HR
export const getJobApplicationById = (id) => {
  return api.get(`/JobApplication/${id}`);
};

// Create job application
// Authorization: Admin, HR
export const createJobApplication = (data) => {
  return api.post("/JobApplication", data);
};

// Update job application
// Authorization: Admin, HR
export const updateJobApplication = (id, data) => {
  return api.put(`/JobApplication/${id}`, data);
};

// Delete job application
// Authorization: Admin
export const deleteJobApplication = (id) => {
  return api.delete(`/JobApplication/${id}`);
};

/* ======================
    PERMISSION REQUEST
====================== */

// Get all permission requests
// Authorization: Admin, HR
export const getAllPermissionRequests = () => {
  return api.get("/PermissionRequest");
};

// Get permission request by ID
// Authorization: Admin, HR, Employee (employees can view their own)
export const getPermissionRequestById = (id) => {
  return api.get(`/PermissionRequest/${id}`);
};

// Approve permission request
// Authorization: Admin, HR
export const approvePermissionRequest = (permissionId) => {
  return api.post(`/PermissionRequest/approve/${permissionId}`);
};

// Reject permission request
// Authorization: Admin, HR
export const rejectPermissionRequest = (permissionId) => {
  return api.post(`/PermissionRequest/reject/${permissionId}`);
};

/* ======================
    PERMISSION TYPE
====================== */

// Get all permission types
// Authorization: Admin, HR
export const getAllPermissionTypes = () => {
  return api.get("/PermissionType");
};

// Get permission type by ID (with rules)
// Authorization: Admin, HR
export const getPermissionTypeById = (id) => {
  return api.get(`/PermissionType/${id}`);
};

// Create permission type
// Authorization: Admin, HR
export const createPermissionType = (data) => {
  return api.post("/PermissionType", data);
};

// Update permission type
// Authorization: Admin, HR
export const updatePermissionType = (id, data) => {
  return api.put(`/PermissionType/${id}`, data);
};

// Delete permission type
// Authorization: Admin, HR
export const deletePermissionType = (id) => {
  return api.delete(`/PermissionType/${id}`);
};

/* ======================
    PROJECT ASSIGNMENT
====================== */

// Get all project assignments
// Authorization: Admin, HR
export const getAllProjectAssignments = () => {
  return api.get("/ProjectAssignment");
};

// Get project assignment by ID
// Authorization: Admin, HR
export const getProjectAssignmentById = (id) => {
  return api.get(`/ProjectAssignment/${id}`);
};

// Get my assignments (for employees)
// Authorization: Any authenticated user
export const getMyAssignments = () => {
  return api.get("/ProjectAssignment/my-assignments");
};

// Create project assignment
// Authorization: Admin, HR
export const createProjectAssignment = (data) => {
  return api.post("/ProjectAssignment", data);
};

// Delete project assignment
// Authorization: Admin
export const deleteProjectAssignment = (id) => {
  return api.delete(`/ProjectAssignment/${id}`);
};

/* ======================
        ONBOARDING
====================== */

// Get all onboarding records
// Authorization: Admin, HR
export const getAllOnboarding = () => {
  return api.get("/Onboarding");
};

// Get onboarding record by ID
// Authorization: Admin, HR
export const getOnboardingById = (id) => {
  return api.get(`/Onboarding/${id}`);
};

// Create onboarding record
// Authorization: Admin, HR
export const createOnboarding = (data) => {
  return api.post("/Onboarding", data);
};

// Update onboarding record
// Authorization: Admin, HR
export const updateOnboarding = (id, data) => {
  return api.put(`/Onboarding/${id}`, data);
};

/* ======================
    ASSET MANAGEMENT
====================== */

// Get asset by ID
// Authorization: Admin, HR
export const getAssetById = (id) => {
  return api.get(`/AssetManagement/${id}`);
};

// Get assets by employee ID
// Authorization: Admin, HR
export const getAssetsByEmployeeId = (employeeId) => {
  return api.get(`/AssetManagement/employee/${employeeId}`);
};

// Get my assets (for employees)
// Authorization: Any authenticated user
export const getMyAssets = () => {
  return api.get("/AssetManagement/my-assets");
};

// Create asset assignment
// Authorization: Admin
export const createAsset = (data) => {
  return api.post("/AssetManagement", data);
};

// Update asset
// Authorization: Admin
export const updateAsset = (id, data) => {
  return api.put(`/AssetManagement/${id}`, data);
};

// Delete asset
// Authorization: Admin
export const deleteAsset = (id) => {
  return api.delete(`/AssetManagement/${id}`);
};

/* ======================
        OFFBOARDING
====================== */

// Get all offboarding records
// Authorization: Admin, HR
export const getAllOffboarding = () => {
  return api.get("/Offboarding");
};

// Get offboarding record by ID
// Authorization: Admin, HR
export const getOffboardingById = (id) => {
  return api.get(`/Offboarding/${id}`);
};

// Create offboarding record
// Authorization: Admin, HR
export const createOffboarding = (data) => {
  return api.post("/Offboarding", data);
};

// Update offboarding record
// Authorization: Admin, HR
export const updateOffboarding = (id, data) => {
  return api.put(`/Offboarding/${id}`, data);
};

/* ======================
        LEAVE TYPE
====================== */

// Get all leave types
// Authorization: Admin, HR
export const getAllLeaveTypes = () => {
  return api.get("/LeaveType");
};

// Get leave type by ID
// Authorization: Admin, HR
export const getLeaveTypeById = (id) => {
  return api.get(`/LeaveType/${id}`);
};

// Create leave type
// Authorization: Admin
export const createLeaveType = (data) => {
  return api.post("/LeaveType", data);
};

// Update leave type
// Authorization: Admin
export const updateLeaveType = (id, data) => {
  return api.put(`/LeaveType/${id}`, data);
};

// Delete leave type
// Authorization: Admin
export const deleteLeaveType = (id) => {
  return api.delete(`/LeaveType/${id}`);
};

/* ======================
        LEAVE BALANCE
====================== */

// Get leave balance by employee ID
// Authorization: All (employees can view their own)
export const getLeaveBalanceByEmployeeId = (employeeId) => {
  return api.get(`/LeaveBalance/employee/${employeeId}`);
};

// Create leave balance
// Authorization: Admin, HR
export const createLeaveBalance = (data) => {
  return api.post("/LeaveBalance", data);
};

// Update leave balance
// Authorization: Admin, HR
export const updateLeaveBalance = (balanceId, data) => {
  return api.put(`/LeaveBalance/${balanceId}`, data);
};

/* ======================
        LEAVE LOG
====================== */

// Get all leave logs
// Authorization: Admin, HR
export const getAllLeaveLogs = () => {
  return api.get("/LeaveLog");
};

// Get leave log by employee ID
// Authorization: All (employees can view their own)
export const getLeaveLogByEmployeeId = (employeeId) => {
  return api.get(`/LeaveLog/employee/${employeeId}`);
};

/* ======================
        LEAVE REQUEST
====================== */

// Get all leave requests
// Authorization: Admin, HR
export const getAllLeaveRequests = () => {
  return api.get("/LeaveRequest/all");
};

// Get leave request by ID (if available)
// Authorization: Admin, HR
export const getLeaveRequestById = (id) => {
  return api.get(`/LeaveRequest/${id}`);
};

// Create leave request
// Authorization: All
export const createLeaveRequest = (data) => {
  return api.post("/LeaveRequest", data);
};

// Approve leave request
// Authorization: Admin, HR
export const approveLeaveRequest = (requestId) => {
  return api.post(`/LeaveRequest/approve/${requestId}`);
};

// Reject leave request
// Authorization: Admin, HR
export const rejectLeaveRequest = (requestId) => {
  return api.post(`/LeaveRequest/reject/${requestId}`);
};

/* ======================
        ATTENDANCE
====================== */

// Check-in (record attendance check-in)
// Authorization: Any authenticated user
export const checkIn = () => {
  return api.post("/Attendance/checkin");
};

// Check-out (record attendance check-out)
// Authorization: Any authenticated user
export const checkOut = () => {
  return api.post("/Attendance/checkout");
};

// Get all attendance records
// Authorization: Admin, HR
export const getAllAttendance = () => {
  return api.get("/Attendance/all");
};

// Get attendance record by ID
// Authorization: Admin, HR
export const getAttendanceById = (id) => {
  return api.get(`/Attendance/${id}`);
};

