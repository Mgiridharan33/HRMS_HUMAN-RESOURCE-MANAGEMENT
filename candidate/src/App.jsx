import {
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import {
    CandidateAuthProvider,
} from "./context/CandidateAuthContext";

import CandidateLayout from "./layouts/CandidateLayout";

import {
    AlertModalProvider,
} from "./components/common/AlertModal";


// =========================================================
// CANDIDATE PUBLIC LAUNCH PAGE
// =========================================================

import CandidateLaunch
    from "./pages/Candidate/CandidateLaunch";


// =========================================================
// CANDIDATE PAGES
// =========================================================

import Login
    from "./pages/Candidate/CandidateLogin";

import Register
    from "./pages/Candidate/CandidateRegister";

import Dashboard
    from "./pages/Candidate/CandidateDashboard";

import Profile
    from "./pages/Candidate/CandidateProfile";

import Jobs
    from "./pages/Candidate/CandidateJobs";

import JobDetails
    from "./pages/Candidate/CandidateJobDetails";

import Applications
    from "./pages/Candidate/CandidateApplications";

import CandidateApply
    from "./pages/candidate/CandidateApply";

import CandidateAptitudeTest from "./pages/CandidateAptitudeTest/CandidateAptitudeTest";

import CandidateAptitudeResult from "./pages/CandidateAptitudeTest/CandidateAptitudeResult";

import CandidateVideoInterviews from "./pages/CandidateVideoInterview/CandidateVideoInterview";

// =========================================================
// APP
// =========================================================

function App() {

    return (

        <AlertModalProvider>

            <CandidateAuthProvider>

            <Routes>


                {/* =================================================
                    PUBLIC CAREER LAUNCH PAGE

                    This is the first page candidates see.

                    /
                    /candidate

                ================================================= */}

                <Route
                    path="/"
                    element={
                        <CandidateLaunch />
                    }
                />

                <Route
                    path="/candidate"
                    element={
                        <CandidateLaunch />
                    }
                />


                {/* =================================================
                    PUBLIC AUTHENTICATION
                ================================================= */}

                <Route
                    path="/login"
                    element={
                        <Login />
                    }
                />

                <Route
                    path="/register"
                    element={
                        <Register />
                    }
                />


                {/* =================================================
                    PROTECTED CANDIDATE AREA

                    CandidateLayout remains around the existing
                    candidate dashboard/application pages.
                ================================================= */}

                <Route
                    element={
                        <CandidateLayout />
                    }
                >

                    {/* ---------------------------------------------
                        DASHBOARD
                    --------------------------------------------- */}

                    <Route
                        path="/dashboard"
                        element={
                            <Dashboard />
                        }
                    />


                    {/* ---------------------------------------------
                        PROFILE
                    --------------------------------------------- */}

                    <Route
                        path="/profile"
                        element={
                            <Profile />
                        }
                    />


                    {/* ---------------------------------------------
                        JOBS
                    --------------------------------------------- */}

                    <Route
                        path="/jobs"
                        element={
                            <Jobs />
                        }
                    />


                    {/* ---------------------------------------------
                        JOB DETAILS
                    --------------------------------------------- */}

                    <Route
                        path="/jobs/:id"
                        element={
                            <JobDetails />
                        }
                    />


                    {/* ---------------------------------------------
                        APPLY
                    --------------------------------------------- */}

                    <Route
                        path="/jobs/:id/apply"
                        element={
                            <CandidateApply />
                        }
                    />


                    {/* ---------------------------------------------
                        APPLICATIONS
                    --------------------------------------------- */}

                    <Route
                        path="/applications"
                        element={
                            <Applications />
                        }
                    />

                    <Route
                    path="aptitude-test"
                    element={
                        <CandidateAptitudeTest />
                    }
                />

               <Route
                path="aptitude-result/:attemptId"
                element={
                    <CandidateAptitudeResult />
                }
            />
             

                    <Route
            path="aptitude-candidate/video-interviews"
            element={
                <CandidateVideoInterviews />
            }
        />
                </Route>


                {/* =================================================
                    OPTIONAL OLD / CANDIDATE URL COMPATIBILITY

                    If anywhere in your existing application you
                    use /candidate/login or /candidate/register,
                    these continue working.
                ================================================= */}

                <Route
                    path="/candidate/login"
                    element={
                        <Login />
                    }
                />

                <Route
                    path="/candidate/register"
                    element={
                        <Register />
                    }
                />


                {/* =================================================
                    UNKNOWN ROUTES

                    Send unknown URLs back to the public career
                    launch page instead of dashboard.

                    This is important because the launch page is
                    now the default entry point.
                ================================================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />

            </Routes>

            </CandidateAuthProvider>

        </AlertModalProvider>

    );

}


export default App;