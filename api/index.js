const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

module.exports = async (req, res) => {
    const host = req.headers.host;
    const uuid = process.env.UUID || "de04add9-5c68-8bab-950c-08cd5320df18";
    const xrayPath = path.join('/tmp', 'xray');
    const configPath = path.join('/tmp', 'config.json');
    const zipPath = path.join('/tmp', 'xray.zip');

    // 1. Subscription Logic (/sub)
    if (req.url.endsWith('/sub')) {
        const vless = `vless://${uuid}@${host}:443?encryption=none&security=tls&type=ws&host=${host}&path=%2Fvless#Vercel_VLESS`;
        const vmessConfig = { 
            v: "2", ps: "Vercel_VMess", add: host, port: "443", id: uuid, 
            aid: "0", scy: "auto", net: "ws", type: "none", host: host, 
            path: "/vmess", tls: "tls", sni: host 
        };
        const vmess = `vmess://${Buffer.from(JSON.stringify(vmessConfig)).toString('base64')}`;
        const subContent = Buffer.from(`${vless}\n${vmess}`).toString('base64');
        
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(200).send(subContent);
    }

    // 2. Xray Binary Setup and Execution
    try {
        if (!fs.existsSync(xrayPath)) {
            console.log("Downloading Xray binary...");
            const downloadUrl = "https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-64.zip";
            
            // Download, Unzip, and Set Permissions
            execSync(`curl -L -o ${zipPath} ${downloadUrl}`);
            execSync(`unzip -o ${zipPath} -d /tmp`);
            execSync(`chmod +x ${xrayPath}`);
            console.log("Xray binary is ready.");
        }

        // Sync config.json from root to /tmp
        const localConfig = path.join(process.cwd(), 'config.json');
        if (fs.existsSync(localConfig)) {
            const configData = fs.readFileSync(localConfig, 'utf8');
            fs.writeFileSync(configPath, configData);
        }

        // Run Xray process
        const xray = spawn(xrayPath, ['-config', configPath]);

        xray.stdout.on('data', (data) => console.log(`stdout: ${data}`));
        xray.stderr.on('data', (data) => console.error(`stderr: ${data}`));

    } catch (err) {
        console.error("Execution Error:", err.message);
    }

    // 3. Response for Browser
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
        <html>
            <head><title>Vercel Xray Node</title></head>
            <body style="font-family:sans-serif; text-align:center; padding-top:50px;">
                <h1 style="color:#0070f3;">Xray Node is Running</h1>
                <p>Status: <span style="color:green;">Online</span></p>
                <p>Subscription: <a href="/sub">/sub</a></p>
            </body>
        </html>
    `);
};
