// import { useMemo } from "react";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement,
// } from "chart.js";
// import { Line, Bar, Doughnut } from "react-chartjs-2";
// import { format, parseISO, startOfHour, startOfDay, startOfWeek, eachHourOfInterval, eachDayOfInterval } from "date-fns";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement
// );

// interface HistoryEntry {
//   type: "motion" | "clear";
//   time: string;
// }

// interface ChartsProps {
//   historyData: HistoryEntry[];
// }

// export const HourlyChart = ({ historyData }: ChartsProps) => {
//   const data = useMemo(() => {
//     const last24Hours = eachHourOfInterval({
//       start: new Date(Date.now() - 24 * 60 * 60 * 1000),
//       end: new Date(),
//     });

//     const hourlyCounts: { [key: string]: number } = {};
//     historyData
//       .filter((e) => e.type === "motion")
//       .forEach((entry) => {
//         try {
//           const hour = format(startOfHour(parseISO(entry.time)), "HH:mm");
//           hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
//         } catch (e) {
//           // Skip invalid dates
//         }
//       });

//     const chartData = last24Hours.map((h) => {
//       const hourKey = format(h, "HH:mm");
//       return Math.min(hourlyCounts[hourKey] || 0, 100); // Cap at 100 to prevent infinity
//     });

//     return {
//       labels: last24Hours.map((h) => format(h, "HH:mm")),
//       datasets: [
//         {
//           label: "Motions per Hour",
//           data: chartData,
//           borderColor: "rgb(0, 212, 255)",
//           backgroundColor: "rgba(0, 212, 255, 0.2)",
//           tension: 0.4,
//         },
//       ],
//     };
//   }, [historyData]);

//   return (
//     <div className="glass rounded-xl p-4">
//       <h3 className="text-lg font-display mb-4">Hourly Motion (Last 24h)</h3>
//       <div style={{ height: "300px" }}>
//         <Line 
//           data={data} 
//           options={{ 
//             responsive: true, 
//             maintainAspectRatio: false,
//             scales: {
//               y: {
//                 beginAtZero: true,
//                 max: 100, // Prevent infinity
//               }
//             }
//           }} 
//         />
//       </div>
//     </div>
//   );
// };

// export const DailyChart = ({ historyData }: ChartsProps) => {
//   const data = useMemo(() => {
//     const last7Days = eachDayOfInterval({
//       start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
//       end: new Date(),
//     });

//     const dailyCounts: { [key: string]: number } = {};
//     historyData
//       .filter((e) => e.type === "motion")
//       .forEach((entry) => {
//         try {
//           const day = format(startOfDay(parseISO(entry.time)), "yyyy-MM-dd");
//           dailyCounts[day] = (dailyCounts[day] || 0) + 1;
//         } catch (e) {
//           // Skip invalid dates
//         }
//       });

//     const chartData = last7Days.map((d) => {
//       const dayKey = format(d, "yyyy-MM-dd");
//       return Math.min(dailyCounts[dayKey] || 0, 1000); // Cap at 1000
//     });

//     return {
//       labels: last7Days.map((d) => format(d, "MMM dd")),
//       datasets: [
//         {
//           label: "Motions per Day",
//           data: chartData,
//           backgroundColor: "rgba(138, 43, 226, 0.6)",
//         },
//       ],
//     };
//   }, [historyData]);

//   return (
//     <div className="glass rounded-xl p-4">
//       <h3 className="text-lg font-display mb-4">Daily Motion (Last 7 Days)</h3>
//       <div style={{ height: "300px" }}>
//         <Bar 
//           data={data} 
//           options={{ 
//             responsive: true, 
//             maintainAspectRatio: false,
//             scales: {
//               y: {
//                 beginAtZero: true,
//                 max: 1000, // Prevent infinity
//               }
//             }
//           }} 
//         />
//       </div>
//     </div>
//   );
// };

// export const WeeklyChart = ({ historyData }: ChartsProps) => {
//   const data = useMemo(() => {
//     const motions = historyData.filter((e) => e.type === "motion");
//     const weeklyData = {
//       labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
//       datasets: [
//         {
//           data: [0, 0, 0, 0, 0, 0, 0],
//           backgroundColor: [
//             "rgba(0, 212, 255, 0.6)",
//             "rgba(138, 43, 226, 0.6)",
//             "rgba(255, 0, 150, 0.6)",
//             "rgba(0, 255, 100, 0.6)",
//             "rgba(255, 200, 0, 0.6)",
//             "rgba(255, 100, 0, 0.6)",
//             "rgba(200, 0, 255, 0.6)",
//           ],
//         },
//       ],
//     };

//     motions.forEach((entry) => {
//       const day = parseISO(entry.time).getDay();
//       weeklyData.datasets[0].data[day]++;
//     });

//     return weeklyData;
//   }, [historyData]);

//   return (
//     <div className="glass rounded-xl p-4">
//       <h3 className="text-lg font-display mb-4">Weekly Distribution</h3>
//       <Doughnut data={data} options={{ responsive: true, maintainAspectRatio: false }} />
//     </div>
//   );
// };

import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { format, parseISO, startOfHour, startOfDay, startOfWeek, eachHourOfInterval, eachDayOfInterval } from "date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface HistoryEntry {
  type: "motion" | "clear";
  time: string;
}

interface ChartsProps {
  historyData: HistoryEntry[];
}

export const HourlyChart = ({ historyData }: ChartsProps) => {
  const data = useMemo(() => {
    const last24Hours = eachHourOfInterval({
      start: new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: new Date(),
    });

    const hourlyCounts: { [key: string]: number } = {};
    historyData
      .filter((e) => e.type === "motion")
      .forEach((entry) => {
        try {
          const hour = format(startOfHour(parseISO(entry.time)), "HH:mm");
          hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
        } catch (e) {
          // Skip invalid dates
        }
      });

    const chartData = last24Hours.map((h) => {
      const hourKey = format(h, "HH:mm");
      return Math.min(hourlyCounts[hourKey] || 0, 100); // Cap at 100 to prevent infinity
    });

    return {
      labels: last24Hours.map((h) => format(h, "HH:mm")).filter((_, i) => i % 3 === 0), // Show every 3rd hour
      datasets: [
        {
          label: "Motions per Hour",
          data: chartData,
          borderColor: "rgb(0, 212, 255)",
          backgroundColor: "rgba(0, 212, 255, 0.2)",
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [historyData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          maxRotation: 45,
        }
      }
    },
    animation: {
      duration: 1000,
    }
  };

  return (
    <div className="w-full h-full">
      <Line data={data} options={options} />
    </div>
  );
};

export const DailyChart = ({ historyData }: ChartsProps) => {
  const data = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(),
    });

    const dailyCounts: { [key: string]: number } = {};
    historyData
      .filter((e) => e.type === "motion")
      .forEach((entry) => {
        try {
          const day = format(startOfDay(parseISO(entry.time)), "yyyy-MM-dd");
          dailyCounts[day] = (dailyCounts[day] || 0) + 1;
        } catch (e) {
          // Skip invalid dates
        }
      });

    const chartData = last7Days.map((d) => {
      const dayKey = format(d, "yyyy-MM-dd");
      return Math.min(dailyCounts[dayKey] || 0, 1000); // Cap at 1000
    });

    return {
      labels: last7Days.map((d) => format(d, "MMM dd")),
      datasets: [
        {
          label: "Motions per Day",
          data: chartData,
          backgroundColor: "rgba(138, 43, 226, 0.6)",
          borderColor: "rgba(138, 43, 226, 1)",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [historyData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1000,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
        }
      }
    },
    animation: {
      duration: 1000,
    }
  };

  return (
    <div className="w-full h-full">
      <Bar data={data} options={options} />
    </div>
  );
};

export const WeeklyChart = ({ historyData }: ChartsProps) => {
  const data = useMemo(() => {
    const motions = historyData.filter((e) => e.type === "motion");
    const weeklyData = {
      labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      datasets: [
        {
          data: [0, 0, 0, 0, 0, 0, 0],
          backgroundColor: [
            "rgba(0, 212, 255, 0.8)",
            "rgba(138, 43, 226, 0.8)",
            "rgba(255, 0, 150, 0.8)",
            "rgba(0, 255, 100, 0.8)",
            "rgba(255, 200, 0, 0.8)",
            "rgba(255, 100, 0, 0.8)",
            "rgba(200, 0, 255, 0.8)",
          ],
          borderColor: [
            "rgba(0, 212, 255, 1)",
            "rgba(138, 43, 226, 1)",
            "rgba(255, 0, 150, 1)",
            "rgba(0, 255, 100, 1)",
            "rgba(255, 200, 0, 1)",
            "rgba(255, 100, 0, 1)",
            "rgba(200, 0, 255, 1)",
          ],
          borderWidth: 2,
          hoverOffset: 15,
        },
      ],
    };

    motions.forEach((entry) => {
      const day = parseISO(entry.time).getDay();
      weeklyData.datasets[0].data[day]++;
    });

    return weeklyData;
  }, [historyData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          padding: 15,
          usePointStyle: true,
        }
      },
    },
    cutout: '60%',
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1000,
    }
  };

  return (
    <div className="w-full h-full">
      <Doughnut data={data} options={options} />
    </div>
  );
};