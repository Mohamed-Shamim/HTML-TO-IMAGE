// src/components/ConverterForm.jsx
import React, { useState } from "react";

const ConverterForm = ({ onSubmit, isLoading }) => {
  const [htmlFile, setHtmlFile] = useState(null);
  const [url, setUrl] = useState("");
  const [options, setOptions] = useState({
    width: 1400,
    height: 800,
    quality: 100,
    type: "jpeg",
    scale: 2,
    duration: 3000,
    fps: 10,
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    if (htmlFile) {
      formData.append("htmlFile", htmlFile);
    } else if (url) {
      formData.append("htmlUrl", url);
    } else {
      alert("Please provide either a HTML file or URL");
      return;
    }

    formData.append("options", JSON.stringify(options));

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload HTML File
          </label>
          <div className="flex items-center">
            <input
              type="file"
              accept=".html,.htm"
              onChange={(e) => setHtmlFile(e.target.files[0])}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
          </div>
        </div>

        <div className="relative">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-2 bg-white text-sm text-gray-500">OR</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter HTML URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/page.html"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Output Settings
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {/* Dimensions Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Width (px)
            </label>
            <input
              type="number"
              value={options.width}
              onChange={(e) =>
                setOptions({
                  ...options,
                  width: parseInt(e.target.value) || 1400,
                })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              min="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Height (px)
            </label>
            <input
              type="number"
              value={options.height}
              onChange={(e) =>
                setOptions({
                  ...options,
                  height: parseInt(e.target.value) || 800,
                })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              min="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Resolution Scale
            </label>
            <select
              value={options.scale}
              onChange={(e) =>
                setOptions({ ...options, scale: parseInt(e.target.value) })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            >
              <option value="1">1x (Standard)</option>
              <option value="2">2x (Retina)</option>
              <option value="3">3x (Ultra HD)</option>
            </select>
          </div>

          {/* Format Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Output Format
            </label>
            <select
              value={options.type}
              onChange={(e) => setOptions({ ...options, type: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            >
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="gif">GIF (Animated)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quality: {options.quality}%
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={options.quality}
              onChange={(e) =>
                setOptions({ ...options, quality: parseInt(e.target.value) })
              }
              className="mt-1 block w-full"
            />
          </div>

          {/* GIF-specific settings */}
          {options.type === "gif" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duration (ms)
                </label>
                <input
                  type="number"
                  value={options.duration}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      duration: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  min="100"
                  step="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Frames Per Second (FPS)
                </label>
                <input
                  type="number"
                  value={options.fps}
                  onChange={(e) =>
                    setOptions({ ...options, fps: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  min="1"
                  max="30"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            "Convert to Image"
          )}
        </button>
      </div>
    </form>
  );
};

export default ConverterForm;
