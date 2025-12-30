document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'logout-btn') {
        e.preventDefault();
        
        // 1. Clear session/token
        // localStorage.removeItem('token'); // Uncomment if using local storage
        
        // 2. Redirect to login
        window.location.href = 'login.html';
    }
});