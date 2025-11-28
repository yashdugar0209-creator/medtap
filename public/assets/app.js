// app.js — small helpers for public pages
document.addEventListener('DOMContentLoaded', () => {
  // Example: smooth scroll for hero buttons
  document.querySelectorAll('.hero-buttons a').forEach(a=>{
    a.addEventListener('click', (e)=>{
      if (a.hash) {
        e.preventDefault();
        document.querySelector(a.hash).scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });
});
