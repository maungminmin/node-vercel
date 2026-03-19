const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

module.exports = async (req, res) => {
    const host = req.headers.host;
    const uuid = process.env.UUID || "de04add9-5c68-8bab-950c-08cd5320df18";
    const xrayPath = path.join('/tmp', 'xray');
    const configPath = path.join('/tmp', 'config.json');

    // 1. Subscription Logic
    if (req.url.endsWith('/sub')) {
        const vless = `vless://${uuid}@${host}:443?encryption=none&security=tls&type=ws&host=${host}&path=%2Fvless#Vercel_VLESS`;
        const vmessConfig = { v: "2", ps: "Vercel_VMess", add: host, port: "443", id: uuid, aid: "0", scy: "auto", net: "ws", type: "none", host: host, path: "/vmess", tls: "tls", sni: host };
        const vmess = `vmess://${Buffer.from(JSON.stringify(vmessConfig)).toString('base64')}`;
        const trojan = `trojan://${uuid}@${host}:443?security=tls&type=ws&host=${host}&path=%2Ftrojan#Vercel_Trojan`;
        const ssInfo = Buffer.from(`aes-256-gcm:${uuid}`).toString('base64');
        const ss = `ss://${ssInfo}@${host}:443?plugin=v2ray-plugin%3Bmode%3Dwebsocket%3Bpath%3D%2Fss%3Bhost%3D${host}%3Btls#Vercel_SS`;

        const subContent = Buffer.from(`${vless}\n${vmess}\n${trojan}\n${ss}`).toString('base64');
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(200).send(subContent);
    }

    // 2. Xray Runtime Setup
    try {
        if (!fs.existsSync(xrayPath)) {
            const downloadUrl = "https://raw.githubusercontent.com/eooce/Xray-core/main/xray";
            execSync(`curl -L -o ${xrayPath} ${downloadUrl} && chmod +x ${xrayPath}`);
        }

        const localConfig = path.join(process.cwd(), 'config.json');
        if (fs.existsSync(localConfig)) {
            const configData = fs.readFileSync(localConfig, 'utf8');
            fs.writeFileSync(configPath, configData);
        }

        // Start Xray process in background
        const xray = spawn(xrayPath, ['-config', configPath]);

        xray.stdout.on('data', (data) => console.log(`stdout: ${data}`));
        xray.stderr.on('data', (data) => console.error(`stderr: ${data}`));

    } catch (err) {
        console.error("Runtime Error:", err.message);
    }

    // 3. Status Response
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
        <html>
            <body style="font-family:sans-serif;text-align:center;padding:50px;">
                <h1 style="color:#0070f3;">Xray Multi-Protocol Node</h1>
                <p>Status: Online</p>
                <p>Subscription Link: <a href="/sub">/sub</a></p>
            </body>
        </html>
    `);
};
