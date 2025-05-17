// src/components/mainPage/StatBarItem.js
import React from 'react';

const StatBarItem = ({ label, id, value, max = 100 }) => (
  <div className="col m-2 stat-box">
    <label htmlFor={id} className="form-label">{label}</label>
    <div className="progress">
      <div
        id={id}
        className="progress-bar"
        role="progressbar"
        style={{ width: `${value}%` }}
        aria-valuenow={value}
        aria-valuemin="0"
        aria-valuemax={max}
      >
        {value}%
      </div>
    </div>
  </div>
);

export default StatBarItem;