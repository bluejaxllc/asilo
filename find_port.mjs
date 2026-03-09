import http from 'http';

async function checkPort(port) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${port}`, (res) => {
            res.on('data', () => { });
            res.on('end', () => resolve(true));
        });
        req.on('error', () => resolve(false));
    });
}

async function findPort() {
    for (let p of [3000, 3001, 3002, 3003, 3004, 3005]) {
        if (await checkPort(p)) {
            console.log(`Port ${p} is responding. Let's fetch the html to see what app it is...`);
            await new Promise(r => {
                http.get(`http://localhost:${p}`, res => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        if (data.includes('Retiro') || data.includes('Asilo') || data.includes('BlueJax') || data.includes('onboarding')) {
                            console.log(`FOUND_APP: http://localhost:${p}`);
                        } else {
                            console.log(`FOUND_SOMETHING_ELSE: http://localhost:${p}`);
                        }
                        r();
                    });
                });
            });
        }
    }
}
findPort();
