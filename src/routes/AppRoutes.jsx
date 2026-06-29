import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "../components/navbar/Navbar";
import Hero from "../components/hero/Hero";

import ComunidadeSection from "../pages/home/sections/comunidade/ComunidadeSection";
import SobreSection from "../pages/home/sections/sobre/SobreSection";
import ContatoSection from "../pages/home/sections/contato/ContatoSection";

import Login from "../pages/login/Login";
import ForgotPassword from "../pages/forgotPassword/ForgotPassword";
import ResetPassword from "../pages/resetPassword/ResetPassword";

import Dashboard from "../pages/dashboard/Dashboard";
import DogDex from "../pages/dogdex/DogDex";
import Scanner from "../pages/scanner/Scanner";
import Ranking from "../pages/ranking/Ranking";
import NotFound from "../pages/NotFound";

function MainPage() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <ComunidadeSection />
        <SobreSection />
        <ContatoSection />
      </main>
    </>
  );
}

function PublicPage({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />

        <Route
          path="/login"
          element={
            <PublicPage>
              <Login />
            </PublicPage>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicPage>
              <ForgotPassword />
            </PublicPage>
          }
        />

        <Route
          path="/reset-password"
          element={
            <PublicPage>
              <ResetPassword />
            </PublicPage>
          }
        />

        <Route path="/app" element={<Dashboard />} />
        <Route path="/app/dogdex" element={<DogDex />} />
        <Route path="/app/scanner" element={<Scanner />} />
        <Route path="/app/ranking" element={<Ranking />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}