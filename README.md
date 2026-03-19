# Vercel Xray Node

This repository is a lightweight implementation of **Xray-core** on **Vercel** using Node.js Serverless Functions. It supports VLESS, VMess, Trojan, and Shadowsocks protocols over WebSocket (WS).

## 🚀 Features
- **Multi-protocol:** VLESS, VMess, Trojan, Shadowsocks.
- **Platform:** Optimized for Vercel Serverless environment.
- **Transport:** WebSocket (WS) + TLS (Port 443).
- **Security:** Fully encrypted with TLS.

## 🛠️ Deployment
1. Click the **Deploy** button on Vercel.
2. Import this GitHub repository.
3. Configure your environment variables if necessary.
4. Hit **Deploy**.

## 📱 Client Configuration
To connect to your node, use the following settings in your V2Ray client:

| Setting | Value |
| :--- | :--- |
| **Address** | `your-project.vercel.app` |
| **Port** | `443` |
| **UUID** | `de04add9-5c68-8bab-950c-08cd5320df18` |
| **Transport** | `ws` (WebSocket) |
| **TLS** | `On` |

### Paths:
- **VLESS:** `/vless`
- **VMess:** `/vmess`
- **Trojan:** `/trojan`
- **Shadowsocks:** `/shadowsocks`

## ⚖️ License
This project is licensed under the MIT License.