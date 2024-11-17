// Fetch status data from the API
fetch('/api/status')
    .then(response => response.json())
    .then(data => {
        const statusDiv = document.getElementById('status');

        if (data.active) {
            statusDiv.innerHTML = `
                <p><strong>Status:</strong> Active ✅</p>
                <p><strong>Ping:</strong> ${data.ping} ms</p>
                <p><strong>Guilds:</strong> ${data.guilds}</p>
                <p><strong>Users:</strong> ${data.users}</p>
                <p><strong>Uptime:</strong> ${data.uptime} seconds</p>
            `;
        } else {
            statusDiv.innerHTML = `<p>Bot is currently offline. ❌</p>`;
        }
    })
    .catch(error => {
        console.error('Error fetching bot status:', error);
        const statusDiv = document.getElementById('status');
        statusDiv.innerHTML = `<p>Failed to load bot status. Please try again later.</p>`;
    });
