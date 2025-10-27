function setBatteryLevel(level) {
  // Clamp level to [0,1]
  level = Math.max(0, Math.min(1, level));
  const minWidth = 2; // minimum width for visibility
  const maxWidth = 21; // full battery width from SVG
  const fillWidth = minWidth + (maxWidth - minWidth) * level;
  const fillRect = document.getElementById('battery-fill');
  if (fillRect) {
    fillRect.setAttribute('width', fillWidth);
    fillRect.setAttribute('fill', level < 0.2 ? '#ff4444' : 'white');
  }
}

// Try to use Battery Status API
document.addEventListener('DOMContentLoaded', function () {
  // Check for API support
  if ('getBattery' in navigator) {
    navigator.getBattery().then(function (battery) {
      function updateBattery() {
        setBatteryLevel(battery.level);
      }
      // Initial update
      updateBattery();
      // Live update on battery change
      battery.addEventListener('levelchange', updateBattery);
      battery.addEventListener('chargingchange', updateBattery);
    });
  } else {
    // Fallback: set to 75% if API not supported
    setBatteryLevel(0.75);
  }
});