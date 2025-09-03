import "./App.css";
import SignUpForm from "./components/Register";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import HomePage from "./components/Home";
import OTPVerify from "./components/OTPVerify";

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            // <ProtectedRoute>
              <HomePage />
            // </ProtectedRoute>
          }
        />

        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/verifyotp" element={<OTPVerify />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
