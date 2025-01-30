import React, { useState, useEffect } from 'react';

// Utility function to extract the file name from a path
const getFileName = (filePath) => {
  return filePath.split(/(\\|\/)/).pop(); // Split by path separators and return the last part
};

const TestsScreen = () => {
  const [testResults, setTestResults] = useState(null); // State for Jest results
  const [isLoading, setIsLoading] = useState(false); // Loading indicator
  const [error, setError] = useState(null); // Error state

  // Fetch Jest test results
  const fetchTestResults = async () => {
    setIsLoading(true);
    setError(null);
  
    try {
      const response = await fetch('http://localhost:5000/api/tests/run-tests', {
        method: 'POST',
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
  
      const results = await response.json();
      setTestResults(results);
    } catch (error) {
      setError(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  

  // Fetch test results when the component mounts
  useEffect(() => {
    fetchTestResults();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">ניהול בדיקות (Jest)</h1>

      {/* Loading Spinner */}
      {isLoading && <div className="text-center">טוען בדיקות...</div>}

      {/* Error Message */}
      {error && <div className="text-red-500 text-center">{error}</div>}

      {/* Display Jest Test Results */}
      {!isLoading && !error && testResults && (
        <div className="space-y-4">
          {testResults.testResults.map((fileResult, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              {/* Extracted File Name */}
              <h2 className="text-lg font-bold mb-3">{getFileName(fileResult.name)}</h2>

              {/* Individual Test Results */}
              {fileResult.assertionResults.map((test, i) => (
                <div key={i} className="flex items-center space-x-3 mb-2">
                  {/* Status Indicator */}
                  <div
                    className={`w-4 h-4 rounded-full ${
                      test.status === 'passed' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  ></div>

                  {/* Test Name */}
                  <div className="text-gray-800">{test.title}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestsScreen;
