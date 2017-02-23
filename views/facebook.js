$(document).ready(function() {
  $("#fb-login-button").click(function() {
    window.location.href = 'auth';
  });

  particlesJS.load('particles-js', 'particles.json', function() {
    console.log('callback - particles.js config loaded');
  });
});
