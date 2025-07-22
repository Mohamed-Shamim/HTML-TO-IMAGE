// src/components/ResultDisplay.jsx
import React, { useState, useEffect } from "react";
import { saveAs } from "file-saver";

const ResultDisplay = ({ result }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [fileSize, setFileSize] = useState("0 KB");
  const [previewScale, setPreviewScale] = useState(1);

  // Parse result data
  const { downloadUrl, filename, format, dimensions } = result;
  const { width, height, scale } = dimensions || {
    width: 1400,
    height: 800,
    scale: 2,
  };

  // Calculate output dimensions
  const outputWidth = width * scale;
  const outputHeight = height * scale;

  // Handle image load to get actual dimensions and file size
  useEffect(() => {
    const img = new Image();
    img.src = downloadUrl;

    img.onload = () => {
      setImageDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      setIsLoading(false);
    };

    // --- ADD THIS ERROR HANDLER ---
    img.onerror = () => {
      console.error("Failed to load image for preview:", downloadUrl);
      setIsLoading(false); // Stop loading, but don't show an image // You might set an error state here to display a message to the user
    }; // Fetch file size
    // --- END ADDITION ---

    fetch(downloadUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
      })
      .then((blob) => {
        const sizeInKB = blob.size / 1024;
        setFileSize(
          sizeInKB > 1024
            ? `${(sizeInKB / 1024).toFixed(2)} MB`
            : `${Math.round(sizeInKB)} KB`
        );
      })
      .catch((error) => {
        console.error("Error fetching file size:", error);
        setFileSize("N/A"); // Indicate error for file size
      });
  }, [downloadUrl]);

  // Handle download
  const handleDownload = () => {
    saveAs(downloadUrl, filename);
  };

  // Copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(downloadUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Get quality rating based on dimensions
  const getQualityRating = () => {
    if (outputWidth >= 2560 || scale >= 3) return "Ultra HD";
    if (outputWidth >= 1920 || scale >= 2) return "High (Retina)";
    return "Standard";
  };

  // Get file type info
  const getFormatInfo = () => {
    switch (format) {
      case "jpeg":
        return {
          name: "JPEG",
          description: "Best for photos and realistic images",
          icon: "🖼️",
        };
      case "png":
        return {
          name: "PNG",
          description: "Best for graphics with transparency",
          icon: "🖌️",
        };
      case "gif":
        return {
          name: "GIF",
          description: "Best for simple animations",
          icon: "🎬",
        };
      default:
        return {
          name: "Image",
          description: "Converted image file",
          icon: "📷",
        };
    }
  };

  const formatInfo = getFormatInfo();
  const qualityRating = getQualityRating();

  return (
    <div className="mt-10 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Conversion Complete!
            </h2>
            <p className="text-gray-600">
              Your HTML has been successfully converted to a high-quality image
            </p>
          </div>
          <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
            {formatInfo.icon} {formatInfo.name}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Preview */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-700">Preview</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setPreviewScale(Math.max(0.5, previewScale - 0.25))
                  }
                  className="text-gray-500 hover:text-gray-700"
                  disabled={previewScale <= 0.5}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <span className="text-sm text-gray-500">
                  {Math.round(previewScale * 100)}%
                </span>
                <button
                  onClick={() =>
                    setPreviewScale(Math.min(2, previewScale + 0.25))
                  }
                  className="text-gray-500 hover:text-gray-700"
                  disabled={previewScale >= 2}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="overflow-auto border border-gray-300 rounded-lg bg-gray-100 max-h-[500px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <div className="p-4 flex justify-center">
                  <img
                    src={downloadUrl}
                    alt="Conversion result"
                    className="transition-all duration-300"
                    style={{
                      transform: `scale(${previewScale})`,
                      transformOrigin: "top left",
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Conversion Details */}
          <div>
            <h3 className="font-medium text-gray-700 mb-3">
              Conversion Details
            </h3>

            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">
                    Original Dimensions
                  </div>
                  <div className="font-semibold">
                    {width} × {height} px
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">
                    Output Dimensions
                  </div>
                  <div className="font-semibold">
                    {outputWidth} × {outputHeight} px
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Scale Factor</div>
                  <div className="font-semibold">{scale}x</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">File Size</div>
                  <div className="font-semibold">{fileSize}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Quality Rating</span>
                    <span className="font-medium">{qualityRating}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width:
                          scale === 3 ? "100%" : scale === 2 ? "75%" : "50%",
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Format</span>
                    <span className="font-medium">{formatInfo.name}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatInfo.description}
                  </div>
                </div>
              </div>
            </div>

            {/* Download Options */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-3">
                Download Options
              </h4>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleDownload}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Download Image
                </button>

                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                  {isCopied ? "Copied!" : "Copy Link"}
                </button>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-600 mb-1">
                  Direct Link:
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={downloadUrl}
                    readOnly
                    className="flex-1 border border-gray-300 rounded-l-lg py-2 px-3 text-sm truncate"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="bg-gray-100 hover:bg-gray-200 border-y border-r border-gray-300 rounded-r-lg px-3"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Tips */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <h3 className="font-medium text-gray-700 mb-3">
            Pro Tips for Better Conversions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="text-purple-600 font-bold mb-2">
                🖼️ Resolution Tip
              </div>
              <p className="text-sm text-gray-700">
                For print materials, use 3x scale with PNG format for maximum
                quality.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="text-green-600 font-bold mb-2">
                ⚡ Performance Tip
              </div>
              <p className="text-sm text-gray-700">
                For web use, JPEG at 85% quality provides the best balance of
                quality and file size.
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <div className="text-yellow-600 font-bold mb-2">
                🎭 Animation Tip
              </div>
              <p className="text-sm text-gray-700">
                Keep GIF animations under 5 seconds with 10-12 FPS for optimal
                file size.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Need another conversion? Upload a new file or URL.
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
          Start New Conversion
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;
