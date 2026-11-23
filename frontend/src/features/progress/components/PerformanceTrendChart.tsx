'use client';

import React from 'react';
import { QuizTrendPoint } from '../types/progress';

interface PerformanceTrendChartProps {
  trendPoints: QuizTrendPoint[];
}

export const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({ trendPoints }) => {
  if (!trendPoints || trendPoints.length === 0) return null;

  const firstScore = trendPoints[0].percentage;
  const lastScore = trendPoints[trendPoints.length - 1].percentage;
  const scoreDiff = lastScore - firstScore;

  // Chart SVG bounds calculation
  const width = 500;
  const height = 160;
  const padding = 30;

  const pointsString = trendPoints
    .map((point, index) => {
      const x = padding + (index / (trendPoints.length - 1)) * (width - 2 * padding);
      const y = height - padding - (point.percentage / 100) * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Performance Trend Over Time
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Visualization of practice attempt scores.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 self-start sm:self-center">
          ↗ Improved by {scoreDiff} percentage points
        </div>
      </div>

      {/* Accessible Textual Summary */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs md:text-sm text-slate-700 dark:text-slate-300 mb-4">
        <strong className="font-semibold text-slate-900 dark:text-white">Summary: </strong>
        Your quiz score improved from {firstScore}% on {trendPoints[0].attemptLabel} to {lastScore}% on {trendPoints[trendPoints.length - 1].attemptLabel}.
      </div>

      {/* Lightweight Accessible SVG Line Chart */}
      <div className="relative overflow-x-auto">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-40 overflow-visible"
          role="img"
          aria-label={`Performance trend line chart showing score improvement from ${firstScore}% to ${lastScore}% across ${trendPoints.length} attempts.`}
        >
          {/* Background Grid Lines */}
          {[25, 50, 75, 100].map((val) => {
            const y = height - padding - (val / 100) * (height - 2 * padding);
            return (
              <g key={val}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-700"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={10}
                  y={y + 4}
                  className="text-[10px] fill-slate-400 dark:fill-slate-500 font-medium"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Polyline line graph */}
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-emerald-500 transition-all duration-500 motion-reduce:transition-none"
            points={pointsString}
          />

          {/* Points markers */}
          {trendPoints.map((point, index) => {
            const x = padding + (index / (trendPoints.length - 1)) * (width - 2 * padding);
            const y = height - padding - (point.percentage / 100) * (height - 2 * padding);
            return (
              <g key={index} className="group">
                <circle
                  cx={x}
                  cy={y}
                  r={6}
                  className="fill-emerald-500 stroke-white dark:stroke-slate-800 stroke-2"
                />
                {/* Score text tag above point */}
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  className="text-[11px] font-extrabold fill-slate-800 dark:fill-white"
                >
                  {point.percentage}%
                </text>
                {/* Attempt label below axis */}
                <text
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  className="text-[10px] font-medium fill-slate-500 dark:fill-slate-400"
                >
                  {point.attemptLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Screen Reader Table Fallback */}
      <table className="sr-only">
        <caption>Quiz performance score history over time</caption>
        <thead>
          <tr>
            <th scope="col">Attempt</th>
            <th scope="col">Quiz Title</th>
            <th scope="col">Score Percentage</th>
            <th scope="col">Date</th>
          </tr>
        </thead>
        <tbody>
          {trendPoints.map((pt, i) => (
            <tr key={i}>
              <td>{pt.attemptLabel}</td>
              <td>{pt.quizTitle}</td>
              <td>{pt.percentage}%</td>
              <td>{pt.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
