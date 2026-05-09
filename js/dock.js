// MacOS Dock Magnification Effect for Icon Group
document.addEventListener('DOMContentLoaded', function () {
  if (window.innerWidth <= 768) return;
  const dock = document.getElementById('mac-dock');
  const items = Array.from(dock.querySelectorAll('.icon-item'));

  // Adjusted scale values for more balanced appearance
  const maxScale = 1.5;  // Main hover scale
  const minScale = 1;    // Base scale

  // Helper: Calculate distance-based scale
  function calculateScale(distance, maxDistance) {
    if (distance > maxDistance) return minScale;
    const scale = maxScale - (distance / maxDistance) * (maxScale - minScale);
    return Math.max(minScale, Math.min(maxScale, scale));
  }

  // Enhanced mousemove handler with smoother transitions
  dock.addEventListener('mousemove', function (e) {
    const dockRect = dock.getBoundingClientRect();
    const mouseX = e.clientX - dockRect.left;
    const maxDistance = 100; // Maximum distance for scale effect

    items.forEach((item) => {
      const itemRect = item.getBoundingClientRect();
      const itemCenter = itemRect.left - dockRect.left + itemRect.width / 2;
      const distance = Math.abs(mouseX - itemCenter);

      // Calculate and apply scale based on distance
      const scale = calculateScale(distance, maxDistance);
      item.style.transform = `scale(${scale})`;
      item.style.transition = 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });
  });

  // Reset scaling when mouse leaves dock
  dock.addEventListener('mouseleave', function () {
    items.forEach(item => {
      item.style.transform = `scale(${minScale})`;
      item.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });
  });
});