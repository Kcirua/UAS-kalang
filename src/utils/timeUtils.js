// src/utils/timeUtils.js
export const formatGameTime = (timeInSeconds) => {
  const secondsPerHour = 60;
  const hours = Math.floor(timeInSeconds / secondsPerHour) % 24;
  const seconds = timeInSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};