import { Routes, Route } from "react-router-dom";
import "./App.css";
// import TestServiceFunctionsComponent from './components/testServiceFunctionsComponent'
import TrackerInputPage from "./pages/TrackerInputPage";
import ReadingLogPage from "./pages/ReadingLogPage";
import ViewReadingPage from "./pages/ViewReadingPage";
import LoginPage from "./pages/LoginPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AstrologyChartPage from "./pages/AstrologyChartPage";
import ProfilePage from "./pages/ProfilePage";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { useState, useEffect } from "react";
import { UserTypes } from "./types";

function App() {
  const [currentUser, setCurrentUser] = useState<UserTypes | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  //browser cant tell if user is logged in because we are sending JWT as http only cookie (javascript cant read it)
  //on ever mount app.tsx runs this useEffect that fetches the auth/me endpoint sending the jwt cookie
  useEffect(() => {
    const fetchUser = async (): Promise<void> => {
      try {
        const response = await fetch("/auth/me", {
          method: "GET",
          credentials: "include", //sending cookie
        });
        if (!response.ok) return;
        const userData = await response.json(); //user data retrieved from cookie thru backend
        setCurrentUser(userData); //sets curr
      } finally {
        setIsAuthLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      <NavBar currentUser={currentUser} />
      <Routes>
        <Route
          path="/"
          element={
            <TrackerInputPage
              currentUser={currentUser}
              isAuthLoading={isAuthLoading}
            />
          }
        />
        <Route
          path="/history"
          element={
            <ReadingLogPage
              currentUser={currentUser}
              isAuthLoading={isAuthLoading}
            />
          }
        />
        <Route
          path="/analytics"
          element={
            <AnalyticsPage
              currentUser={currentUser}
              isAuthLoading={isAuthLoading}
            />
          }
        />
        <Route
          path="/astrology"
          element={
            <AstrologyChartPage
              currentUser={currentUser}
              isAuthLoading={isAuthLoading}
            />
          }
        />
        <Route
          path="/reading/:readingId"
          element={
            <ViewReadingPage
              currentUser={currentUser}
              isAuthLoading={isAuthLoading}
            />
          }
        />
        <Route
          path="/profile"
          element={
            <ProfilePage
              currentUser={currentUser}
              isAuthLoading={isAuthLoading}
            />
          }
        />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
