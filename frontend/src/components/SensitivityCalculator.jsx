// frontend/src/components/SensitivityCalculator.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import GameSelectDropdown from "./GameSelectDropdown";
import { RiResetRightFill } from "react-icons/ri";

// Get API base URL from the environment variables (Vite uses import.meta.env)
const API_BASE_URL =
  import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:8000/api";

const SensitivityCalculator = () => {
  // --- React Hook Form Setup ---
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      source_mouse_dpi: 800,
      target_mouse_dpi: 800,
      source_sensitivity: "",
      source_game: "",
      target_game: "",
    },
  });

  const sourceGame = watch("source_game");
  const targetGame = watch("target_game");
  const sourceMouseDpi = watch("source_mouse_dpi");
  const targetMouseDpi = watch("target_mouse_dpi");
  const sourceSensitivity = watch("source_sensitivity");

  // --- Other States ---
  const [availableGames, setAvailableGames] = useState([]);
  const [screenData, setScreenData] = useState({ resolution: "Loading..." });
  const [results, setResults] = useState(null);
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // --- 2. Dynamic Data Fetching and Initialization ---
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/games`);
        const games = response.data.games;
        setAvailableGames(games);

        if (games.length >= 2) {
          setValue("source_game", games[0]);
          setValue("target_game", games[1]);
        }
      } catch (err) {
        setApiError(
          "Failed to fetch game list. Please check the backend connection."
        );
      }
    };

    const updateScreenData = () => {
      setScreenData({
        resolution: `${window.innerWidth}px x ${window.innerHeight}px (Viewport)`,
      });
    };

    fetchGames();
    updateScreenData();
    window.addEventListener("resize", updateScreenData);

    return () => window.removeEventListener("resize", updateScreenData);
  }, [setValue]);

  // --- Real-time Sensitivity Conversion ---
  useEffect(() => {
    const convertSensitivity = async () => {
      if (
        !sourceGame ||
        !targetGame ||
        sourceGame === targetGame ||
        !sourceSensitivity ||
        !sourceMouseDpi ||
        !targetMouseDpi
      ) {
        setResults(null);
        return;
      }

      if (
        sourceSensitivity <= 0 ||
        sourceMouseDpi < 100 ||
        targetMouseDpi < 100
      ) {
        return;
      }

      setIsLoading(true);
      setApiError("");

      try {
        const response = await axios.post(
          `${API_BASE_URL}/convert_sensitivity`,
          {
            source_game: sourceGame.toLowerCase(),
            target_game: targetGame.toLowerCase(),
            source_sensitivity: sourceSensitivity,
            source_mouse_dpi: sourceMouseDpi,
            target_mouse_dpi: targetMouseDpi,
          }
        );

        setResults(response.data);
      } catch (err) {
        const errorMsg =
          err.response?.data?.detail ||
          "A network error occurred. Check server logs.";
        setApiError(errorMsg);
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the conversion to avoid too many API calls
    const timeoutId = setTimeout(() => {
      convertSensitivity();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    sourceGame,
    targetGame,
    sourceSensitivity,
    sourceMouseDpi,
    targetMouseDpi,
  ]);

  // --- 3. Submission Handler (kept for form validation) ---
  const onSubmit = async (data) => {
    // Form is already converting in real-time, this just ensures validation
  };

  const handleDropdownChange = (e) => {
    setValue(e.target.name, e.target.value, { shouldValidate: true });
    setApiError("");
    setCopySuccess(false);
  };

  // --- Reset Handler ---
  const handleReset = () => {
    reset({
      source_mouse_dpi: 800,
      target_mouse_dpi: 800,
      source_sensitivity: "",
      source_game: availableGames[0] || "",
      target_game: availableGames[1] || "",
    });
    setResults(null);
    setApiError("");
    setCopySuccess(false);
  };

  // --- Copy to Clipboard Handler ---
  const handleCopy = async () => {
    if (results?.target_sensitivity) {
      try {
        await navigator.clipboard.writeText(
          results.target_sensitivity.toString()
        );
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  // --- 4. Helper Function for Analysis ---
  const getSensitivityAnalysis = (cm360) => {
    let playStyle = "";
    let padSize = "";

    if (cm360 < 25) {
      playStyle = "Very High Sensitivity (Wrist Only)";
      padSize = "Small/Medium mousepad is sufficient.";
    } else if (cm360 >= 25 && cm360 < 45) {
      playStyle = "Medium Sensitivity (Wrist & Forearm)";
      padSize = "Standard large gaming mousepad is recommended.";
    } else if (cm360 >= 45 && cm360 < 65) {
      playStyle = "Low Sensitivity (Full Arm)";
      padSize = "Requires an Extended Deskmat or large pad for comfort.";
    } else {
      playStyle = "Ultra-Low Sensitivity (Maximum Arm Sweep)";
      padSize = "You absolutely need an Extended Deskmat.";
    }

    return { playStyle, padSize };
  };

  // --- 5. Render ---
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="text-center mb-8">
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <h1 className="text-5xl font-extrabold text-indigo-400">🎮</h1>
          <h1 className="text-5xl font-extrabold text-indigo-400">
            FPS Sensitivity Calculator
          </h1>
        </div>

        <p className="text-gray-400 mt-2">
          Calculate your perfect sensitivity across all major FPS titles.
        </p>
      </header>

      <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-xl shadow-2xl">
        {/* Reset Button - Top Right */}
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={handleReset}
            className="py-2 px-3 flex flex-row gap-1 items-center justify-center rounded-md shadow-md text-sm font-semibold text-white transition duration-200 bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            <RiResetRightFill className="h-4 w-4" /> Reset
          </button>
        </div>

        {/* Form attached to RHF handleSubmit */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <GameSelectDropdown
            name="source_game"
            label="Source Game (Your Current Setting)"
            games={availableGames}
            selectedGame={sourceGame}
            onChange={handleDropdownChange}
            disabled={availableGames.length === 0}
          />

          <GameSelectDropdown
            name="target_game"
            label="Target Game (Sensitivity Required)"
            games={availableGames}
            selectedGame={targetGame}
            onChange={handleDropdownChange}
            disabled={availableGames.length === 0}
          />

          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 col-span-1 md:col-span-2">
            <div className="w-full">
              <label
                htmlFor="source_sensitivity"
                className="block text-sm font-medium text-gray-300"
              >
                Source Game Sensitivity Value
              </label>
              <input
                type="number"
                {...register("source_sensitivity", {
                  required: "Sensitivity is required.",
                  min: {
                    value: 0.001,
                    message: "Sensitivity must be positive.",
                  },
                  valueAsNumber: true,
                })}
                step="any"
                placeholder="Enter your Sensitivity"
                className="mt-1 block w-full px-4 py-2 border focus:outline-none focus:ring-2 border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
              />
              {errors.source_sensitivity && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.source_sensitivity.message}
                </p>
              )}
            </div>
            
            <div className="flex flex-row w-full lg:w-[80%] justify-between items-center gap-6 lg:gap-4">
              <div className="w-full">
                <label
                  htmlFor="source_mouse_dpi"
                  className="block text-sm font-medium text-gray-300"
                >
                  Source Game Mouse DPI
                </label>
                <div className="relative">
                  <input
                    type="number"
                    {...register("source_mouse_dpi", {
                      required: "DPI is required.",
                      min: { value: 100, message: "DPI must be at least 100." },
                      valueAsNumber: true,
                    })}
                    className="custom-number mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                  />

                  {/* Up/Down Buttons */}
                  <div className="custom-number-controls">
                    <div
                      className="w-4 h-full flex items-center justify-center text-xs cursor-pointer"
                      onClick={() =>
                        setValue("source_mouse_dpi", sourceMouseDpi + 50)
                      }
                    >
                      ▲
                    </div>
                    <div
                      className="w-4 h-full flex items-center justify-center text-xs cursor-pointer"
                      onClick={() =>
                        setValue(
                          "source_mouse_dpi",
                          Math.max(100, sourceMouseDpi - 50)
                        )
                      }
                    >
                      ▼
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full">
                <label
                  htmlFor="target_mouse_dpi"
                  className="block text-sm font-medium text-gray-300"
                >
                  Target Game Mouse DPI
                </label>
                <div className="relative">
                  <input
                    type="number"
                    {...register("target_mouse_dpi", {
                      required: "DPI is required.",
                      min: { value: 100, message: "DPI must be at least 100." },
                      valueAsNumber: true,
                    })}
                    className="custom-number mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                  />

                  {/* Up/Down Buttons */}
                  <div className="custom-number-controls">
                    <div
                      className="w-4 h-full flex items-center justify-center text-xs cursor-pointer"
                      onClick={() =>
                        setValue("target_mouse_dpi", targetMouseDpi + 50)
                      }
                    >
                      ▲
                    </div>
                    <div
                      className="w-4 h-full flex items-center justify-center text-xs cursor-pointer"
                      onClick={() =>
                        setValue(
                          "target_mouse_dpi",
                          Math.max(100, targetMouseDpi - 50)
                        )
                      }
                    >
                      ▼
                    </div>
                  </div>
                </div>
              </div>
            </div>

            
          </div>
        </form>

        {/* Real-time Conversion Display */}
        {targetGame && (
          <div className="mt-8 p-6 rounded-lg border-2 border-indigo-500 bg-gray-700">
            {/* Same Game Warning */}
            {sourceGame === targetGame ? (
              <div className="text-center p-8">
                <div className="text-6xl mb-4">⚠️</div>
                <p className="text-yellow-400 text-xl font-bold">
                  Please choose different games
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Source and Target games must be different for conversion
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4 text-center text-indigo-300">
                  Your {targetGame} Sensitivity
                </h2>

                <div className="flex items-center justify-center gap-4">
                  {isLoading ? (
                    <div className="text-gray-400 animate-pulse">
                      Calculating...
                    </div>
                  ) : results ? (
                    <>
                      <div className="p-4 bg-gray-800 rounded-xl shadow-inner flex flex-row items-center justify-between gap-4 w-full">
                        <p className="text-4xl lg:text-5xl font-extrabold text-green-400 ml-0 sm:ml-[40%] ">
                          {results.target_sensitivity}
                        </p>
                        {/* Copy Button */}
                        <button
                          onClick={handleCopy}
                          className="p-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg transition duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500"
                          title="Copy to clipboard"
                        >
                          {copySuccess ? (
                            <svg
                              className="w-6 h-6 text-green-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-6 h-6 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </>
                  ) : apiError ? (
                    <p className="text-red-400 text-center font-bold">
                      {apiError}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-center">
                      Enter values to see conversion
                    </p>
                  )}
                </div>

                {/* Additional Stats */}
                {results && !apiError && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center mt-6">
                      {/* CM/360 */}
                      <div className="p-4 bg-gray-800 rounded-xl shadow-inner">
                        <p className="text-3xl font-extrabold text-indigo-300">
                          {results.cm_360} cm
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          cm/360° (Full Turn Distance)
                        </p>
                      </div>

                      {/* CM/180 */}
                      <div className="p-4 bg-gray-800 rounded-xl shadow-inner">
                        <p className="text-3xl font-extrabold text-indigo-300">
                          {(results.cm_360 / 2).toFixed(2)} cm
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          cm/180° (Turn Around Distance)
                        </p>
                      </div>
                    </div>

                    {/* Sensitivity Analysis Section */}
                    <div className="mt-6 p-4 bg-gray-800 rounded-xl border border-yellow-500">
                      <h3 className="text-xl font-bold text-yellow-300 mb-2">
                        💡 Sensitivity Analysis
                      </h3>

                      {(() => {
                        const analysis = getSensitivityAnalysis(results.cm_360);
                        return (
                          <>
                            <p className="text-white">
                              Your sensitivity corresponds to a{" "}
                              <strong>{analysis.playStyle}</strong> play style.
                            </p>
                            <p className="text-sm text-gray-400 mt-2">
                              <strong>Practical Application:</strong> You need{" "}
                              {(results.cm_360 / 2).toFixed(2)} cm of continuous
                              mousepad space to perform a crucial 180° turn.{" "}
                              {analysis.padSize}
                            </p>
                            <p className="text-sm italic text-gray-500 mt-2">
                              Use a ruler to measure this distance on your
                              mousepad to verify muscle memory.
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SensitivityCalculator;
