import React, { useState } from 'react';

const getFileName = (filePath) => {
  return filePath.split(/(\\|\/)/).pop();
};

const TestStatus = ({ passed, failed, total }) => (
  <div className="grid grid-cols-3 gap-4 mb-6">
    <div className="bg-gray-50 p-4 rounded-lg text-center">
      <div className="text-lg font-bold">{total}</div>
      <div className="text-sm text-gray-600">סה"כ בדיקות</div>
    </div>
    <div className="bg-green-50 p-4 rounded-lg text-center">
      <div className="text-lg font-bold text-green-700">{passed}</div>
      <div className="text-sm text-green-600">עברו</div>
    </div>
    <div className="bg-red-50 p-4 rounded-lg text-center">
      <div className="text-lg font-bold text-red-700">{failed}</div>
      <div className="text-sm text-red-600">נכשלו</div>
    </div>
  </div>
);

const TestSuite = ({ suite }) => {
  const isPassed = suite.status === 'passed';
  
  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold">{getFileName(suite.name)}</h3>
        <span className={`px-2 py-1 text-sm rounded-full ${
          isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isPassed ? 'עבר' : 'נכשל'}
        </span>
      </div>

      {/* Test Details */}
      {suite.assertionResults?.map((test, index) => (
        <div 
          key={index}
          className={`border-l-4 pl-3 py-2 mb-2 ${
            test.status === 'passed' 
              ? 'border-green-500 bg-green-50' 
              : 'border-red-500 bg-red-50'
          }`}
        >
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              test.status === 'passed' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span>{test.title}</span>
          </div>
          
          {/* Show Error Message for Failed Tests */}
          {test.status === 'failed' && test.failureMessages?.map((message, i) => (
            <div key={i} className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
              {message.split('\n')[0]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const TestsScreen = () => {
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTestResults = async () => {
    setIsLoading(true);
    setError(null);
    setTestResults(null);

    try {
      const response = await fetch(process.env.REACT_APP_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Server error occurred');
      }

      console.log('Received test results:', data);
      setTestResults(data);
    } catch (error) {
      console.error('Test run error:', error);
      setError(`Error running tests: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate test statistics
  const getTestStats = () => {
    if (!testResults) return { total: 0, passed: 0, failed: 0 };

    return {
      total: testResults.numTotalTests || 0,
      passed: testResults.numPassedTests || 0,
      failed: testResults.numFailedTests || 0
    };
  };

  return (
    <div className="relative min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white shadow-md z-50 p-4 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">ניהול בדיקות (Jest)</h1>
          <button
            onClick={fetchTestResults}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors`}
          >
            {isLoading ? 'מריץ בדיקות...' : 'הרץ בדיקות'}
          </button>
        </div>
      </div>
      <div className="container mx-auto p-4">
        {isLoading && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            <span className="mr-3">טוען בדיקות...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="mr-3">
                <p className="font-bold">שגיאה בהרצת הבדיקות</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && testResults && (
          <div>
            <TestStatus {...getTestStats()} />
            
            <div className="space-y-4">
              {testResults.testResults?.map((suite, index) => (
                <TestSuite key={index} suite={suite} />
              ))}
            </div>
          </div>
        )}

        {!isLoading && !error && !testResults && (
          <div className="text-center text-gray-500 p-8">
            <p className="text-lg">לחץ על "הרץ בדיקות" כדי להתחיל</p>
          </div>
        )}
      </div>
    </div>
    
  );
};


export default TestsScreen;