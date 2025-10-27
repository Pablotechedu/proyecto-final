import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import { AuthProvider } from "./hooks/useAuth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import PatientForm from "./pages/PatientForm";
import ParentTutorForm from "./pages/ParentTutorForm";
import ProfessionalForm from "./pages/ProfessionalForm";
import Sessions from "./pages/Sessions";
import Payments from "./pages/Payments";
import PaymentForm from "./pages/PaymentForm";
import TherapistHub from "./pages/TherapistHub";
import SessionForm from "./pages/SessionForm";
import Users from "./pages/Users";

function App() {
  return (
    <AuthProvider>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="therapist-hub" element={<TherapistHub />} />
            <Route path="patients" element={<Patients />} />
            <Route path="patients/new" element={<PatientForm />} />
            <Route path="patients/:id" element={<PatientDetail />} />
            <Route path="patients/:id/edit" element={<PatientForm />} />
            <Route
              path="patients/:patientId/parents/new"
              element={<ParentTutorForm />}
            />
            <Route
              path="patients/:patientId/parents/:parentId/edit"
              element={<ParentTutorForm />}
            />
            <Route
              path="patients/:patientId/professionals/new"
              element={<ProfessionalForm />}
            />
            <Route
              path="patients/:patientId/professionals/:professionalId/edit"
              element={<ProfessionalForm />}
            />
            <Route path="sessions" element={<Sessions />} />
            <Route path="sessions/:sessionId/form" element={<SessionForm />} />
            <Route path="payments" element={<Payments />} />
            <Route path="payments/new" element={<PaymentForm />} />
            <Route path="payments/:paymentId/edit" element={<PaymentForm />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Routes>
      </Box>
    </AuthProvider>
  );
}

export default App;
