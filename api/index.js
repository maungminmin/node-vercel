const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

module.exports = async (req, res) => {
    const host = req.headers.host;
    const uuid = process.env.UUID || "de04add9-5c68-8bab-950c-08cd5320df18";
    const xrayPath = path.join('/tmp', 'xray');
    const configPath = path.join('/tmp', 'config.json');
    const zipPath = path.join('/tmp', 'xray.zip');

    // 1. Full Subscription Logic (/sub)
    if (req.url.endsWith('/sub')) {
        // VLESS
        const vless = `vless://${uuid}@${host}:443?encryption=none&security=tls&type=ws&host=${host}&path=%2Fvless#Vercel_VLESS`;
        
        // VMess
        const vmessConfig = { 
            v: "2", ps: "Vercel_VMess", add: host, port: "443", id: uuid, 
            aid: "0", scy: "auto", net: "ws", type: "none", host: host, 
            path: "/vmess", tls: "tls", sni: host 
        };
        const vmess = `vmess://${Buffer.from(JSON.stringify(vmessConfig)).toString('base64')}`;
        
        // Trojan
        const trojan = `trojan://${uuid}@${host}:443?security=tls&type=ws&host=${host}&path=%2Ftrojan#Vercel_Trojan`;
        
        // Shadowsocks (SS) - Using AEAD-256-GCM (Password is UUID)
        const ssInfo = Buffer.from(`aes-256-gcm:${uuid}`).toString('base64');
        const ss = `ss://${ssInfo}@${host}:443?plugin=v2ray-plugin%3Bmode%3Dwebsocket%3Bpath%3D%2Fss%3Bhost%3D${host}%3Btls#Vercel_SS`;

        // Combine all and encode to Base64
        const subContent = Buffer.from(`${vless}\n${vmess}\n${trojan}\n${ss}`).toString('base64');
        
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(200).send(subContent);
    }

    // 2. Binary Execution Logic
    try {
        if (!fs.existsSync(xrayPath)) {
            const downloadUrl = "https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-64.zip";
            execSync(`curl -L -o ${zipPath} ${downloadUrl} && unzip -o ${zipPath} -d /tmp && chmod +x ${xrayPath}`);
        }

        const localConfig = path.join(process.cwd(), 'config.json');
        if (fs.existsSync(localConfig)) {
            const configData = fs.readFileSync(localConfig, 'utf8');
            fs.writeFileSync(configPath, configData);
        }

        spawn(xrayPath, ['-config', configPath]);
    } catch (err) {
        console.error("Error:", err.message);
    }

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`<h1>Xray Multi-Protocol Node</h1><p>Subscription: <a href="/sub">/sub</a></p>`);
};
