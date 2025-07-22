// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
// import Header from "./components/Header";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
        <footer className="bg-white py-6 text-center text-gray-500 text-sm">
          HTML to Image Converter © {new Date().getFullYear()}
        </footer>
      </div>
    </Router>
  );
}

export default App;
