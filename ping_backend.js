async function check() {
    console.log('Pinging http://localhost:5000/api/health ...');
    try {
        const res = await fetch('http://localhost:5000/api/health');
        if (res.ok) {
            console.log('✅ Connection SUCCESS! Status:', res.status);
            console.log('Body:', await res.json());
        } else {
            console.log('❌ Connection FAILED. Status:', res.status);
        }
    } catch (e) {
        console.error('❌ Connection REFUSED. Server is NOT running, or firewall blocked.', e.message);
    }
}
check();
