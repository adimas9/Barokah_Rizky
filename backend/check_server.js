async function checkServer() {
    console.log('Testing connection to http://localhost:5000/api/health ...');
    try {
        const response = await fetch('http://localhost:5000/api/health');
        if (response.ok) {
            console.log('✅ Server is RUNNING!');
            const json = await response.json();
            console.log('Response:', json);
        } else {
            console.log(`❌ Server responded with status: ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Failed to connect to server:', error.message);
        console.log('Suggestion: Restart backend terminal (npm run dev)');
    }
}

checkServer();
