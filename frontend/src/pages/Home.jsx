// src/pages/Home.jsx
import React, { useState } from "react";
import ConverterForm from "../components/ConverterForm";
import ResultDisplay from "../components/ResultDisplay";

const Home = () => {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConversion = async (formData) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("https://html-to-image-1-ryld.onrender.com/api/convert", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.details || data.error || "Conversion failed with unknown error"
        );
      } // --- ADD THIS LOGIC ---

      const backendBaseUrl = "http://localhost:5000"; // Or process.env.VITE_BACKEND_URL or similar
      const fullDownloadUrl = `${backendBaseUrl}${data.downloadUrl}`;

      setResult({
        ...data,
        downloadUrl: fullDownloadUrl, // Update the downloadUrl to the full URL
      }); // --- END ADDITION ---
    } catch (err) {
      setError(err.message);
      console.error("Conversion error:", {
        error: err,
        response: err.response,
      });

      if (process.env.NODE_ENV === "development") {
        alert(`Error details: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          HTML to Image Converter
        </h1>
        <p className="text-gray-600 mb-6">
          Convert HTML/CSS with animations to high-resolution JPG or GIF
        </p>

        <ConverterForm onSubmit={handleConversion} isLoading={isLoading} />

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg">
            Error: {error}
          </div>
        )}
      </div>

      {result && <ResultDisplay result={result} />}
    </div>
  );
};

export default Home;
