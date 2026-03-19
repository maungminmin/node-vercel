const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

module.exports = (req, res) => {
    const host = req.headers.host;
    const uuid = process.env.UUID || "de04add9-5c68-8bab-950c-08cd5320df18";

    // 1. Subscription Link Logic (/sub)
    if (req.url.endsWith('/sub')) {
        const vless = `vless://${uuid}@${host}:443?encryption=none&security=tls&type=ws&host=${host}&path=%2Fvless#Vercel_VLESS`;
        
        const vmessConfig = {
            v: "2", ps: "Vercel_VMess", add: host, port: "443", id: uuid, 
            aid: "0", scy: "auto", net: "ws", type: "none", host: host, 
            path: "/vmess", tls: "tls", sni: host
        };
        const vmess = `vmess://${Buffer.from(JSON.stringify(vmessConfig)).toString('base64')}`;
        
        const trojan = `trojan://${uuid}@${host}:443?security=tls&type=ws&host=${host}&path=%2Ftrojan#Vercel_Trojan`;
        
        // Combine and Encode to Base64
        const subContent = Buffer.from(`${vless}\n${vmess}\n${trojan}`).toString('base64');
        
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(200).send(subContent);
    }

    // 2. Default Status Page
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
        <html>
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1>Xray Node is Running</h1>
                <p>Status: <span style="color: green;">Online</span></p>
                <p>Subscription Link: <a href="/sub">/sub</a></p>
                <hr>
                <p style="color: gray;">UUID: ${uuid}</p>
            </body>
        </html>
    `);
};
