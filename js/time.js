function getGreeting(hour) {
  return hour < 12
    ? 'Good Morning'
    : hour < 17
      ? 'Good Afternoon'
      : 'Good Evening';
}

function getFormattedTime(now) {
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;

  return `${hour12}:${minutes} ${period}`;
}

function updateMenuTime() {
  const now = new Date();
  const hour = now.getHours();
  const greetingEl = document.getElementById("currentTime");
  const clockEl = document.getElementById("menuClock");

  if (greetingEl) {
    greetingEl.textContent = getGreeting(hour);
  }

  if (clockEl) {
    clockEl.textContent = getFormattedTime(now);
  }
}

updateMenuTime();
setInterval(updateMenuTime, 1000);

