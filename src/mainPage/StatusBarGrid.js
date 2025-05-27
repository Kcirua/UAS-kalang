// src/components/mainPage/StatusBarGrid.js
import React from 'react';
import StatBarItem from './StatBarItem';

const StatusBarGrid = ({ stats }) => (
  <div className="row stat-bar">
    <StatBarItem label="Status Makan" id="stat-makan" value={stats.makan} />
    <StatBarItem label="Status Tidur" id="stat-tidur" value={stats.tidur} />
    <StatBarItem label="Status Kesenangan" id="stat-kesenangan" value={stats.kesenangan} />
    <StatBarItem label="Status Kebersihan" id="stat-kebersihan" value={stats.kebersihan} />
  </div>
);

export default StatusBarGrid;