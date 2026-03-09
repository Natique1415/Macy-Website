// Custom macOS-style Cursor

const cursor = document.createElement('div');
cursor.style.width = '25px';
cursor.style.height = '25px';
cursor.style.borderRadius = '50%';
cursor.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
cursor.style.position = 'fixed';
cursor.style.pointerEvents = 'none';
cursor.style.transition = 'transform 0.2s ease';

// Append the cursor to the body
document.body.appendChild(cursor);

// Update cursor position
const updateCursor = (e) => {
    cursor.style.transform = `translate3d(${e.clientX - 12.5}px, ${e.clientY - 12.5}px, 0)`;
};

document.addEventListener('mousemove', updateCursor);

// Adding styles for interactive elements
const interactiveElements = document.querySelectorAll('a, button, input');

interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
        cursor.style.backgroundColor = 'rgba(0, 176, 255, 0.8)';
    });
    element.addEventListener('mouseleave', () => {
        cursor.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    });
});