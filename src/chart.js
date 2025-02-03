import ChartJS from 'chart.js/auto';


import { Line, Bar, Pie } from 'react-chartjs-2';



// Common chart options
const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
};

// Line chart specific options
export const lineOptions = {
  ...commonOptions,
  scales: {
    y: {
      display: false,

      beginAtZero: true,
      title: {
        text: 'Number of Registrations'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Month'
      }
    }
  }
};

// Bar chart specific options
export const barOptions = {
  ...commonOptions,
  scales: {
    y: {
      beginAtZero: true,
      display: false,
      title: {
        display: true,
        text: 'Number of Users'
      }
    }
  }
};

// Pie chart specific options
export const pieOptions = {
  ...commonOptions,
  plugins: {
    ...commonOptions.plugins,
    legend: {
      position: 'right',
    }
  }
};

export { Line, Bar, Pie };