# 📈 Revenues Digital — Real-Time Revenue Dashboard

[![Live Site](https://img.shields.io/badge/Live-Site-14b8a6?logo=google-chrome&logoColor=white)](https://revenues.digital)

A real time revenue tracking platform for one of my projects, built on an AWS EC2 free-tier instance. The dashboard streams live sales data over WebSockets, renders rich interactive charts, and lets team-mates jump into a peer-to-peer voice room — all inside the browser.

---

## Feature Highlights

| Category | Details |
| :------- | :------ |
| **Real-Time Data** | Live sales & visitor metrics delivered via **Socket.IO WebSockets** (`wss://ws.yourdomain.com:2087`) with automatic re-connect and exponential back-off. |
| **Interactive Charts** | Three responsive **Chart.js** visualizations (Revenue 30 days, Visitors 30 days, Visitors 24 h) that update in place without page reload. |
| **Voice Collaboration** | **PeerJS with WebRTC** voice channel (`https://webrtc.yourdomain.com:2096`) with STUN fallback, mute/unmute, speaking indicators, and peer auto-discovery. |
| **SSL** | Automated SSL via **Certbot** on Ubuntu 22.04, running on an **AWS t2.micro** (free-tier) instance behind Nginx reverse proxy. |

---

## Deploy Guide

This guide outlines how to deploy the real-time revenue dashboard on an Ubuntu 22.04 EC2 instance (or similar VPS) with Apache, Node.js, and SSL.

### 1. Open Required Ports

Ensure the following ports are open in your hosting provider’s firewall or AWS Security Group:

* `80` (HTTP)
* `443` (HTTPS)
* `2087` (WebSocket server)
* `2096` (WebRTC signaling server)

```bash
sudo apt update
sudo apt install ufw
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 2087
sudo ufw allow 2096
```

### 2. Install System Dependencies

SSH into your server and install the required packages:

```bash
sudo apt update
sudo apt install -y apache2 npm certbot python3-certbot-nginx
sudo npm install -g pm2
```

### 3. Set Up Frontend

Move your frontend files to Apache's root directory:

```bash
sudo mv website /var/www/html/
```

Update the following files inside `/var/www/html/website/` to use your domain name or public IP:

* `socket.js`
* `peer.js`

Edit the first line of each to match your server address:

```js
const SOCKET_URL = "wss://yourdomain.com:2087";

const PEER_HOST = "https://webrtc.yourdomain.com:2096";
```

### 4. Start WebRTC Signaling Server

Navigate to the signaling server directory:

```bash
cd webrtc-signaling
npm install
```

Start the server using `pm2` to keep it running in the background:

```bash
pm2 start server.js --name peerjs
```

You can check logs and manage the service with:

```bash
pm2 logs peerjs
pm2 restart peerjs
```

![PeerServer](https://i.ibb.co/qFLnv2cM/image.png)


### 5. Set Up SSL with Certbot

Ensure DNS A records for both your main domain and subdomain (`yourdomain.com`, `webrtc.yourdomain.com`) point to your server.

Run Certbot to provision and configure SSL certificates:

```bash
sudo certbot --nginx -d www.yourdomain.com -d yourdomain.com -d webrtc.yourdomain.com
```

Follow the interactive prompts to install and auto-renew certificates.


When doing sudo certbot certificates you should get:


![Certbot issuing certificates](https://i.ibb.co/7JCgmScJ/image.png)



### 6. Verify Apache Configuration

Make sure Apache2 is running:

```bash
sudo systemctl enable apache2
sudo systemctl start apache2
```

Apache will serve the frontend from `/var/www/html/website/`. SSL termination is handled via Nginx if configured, or directly by Certbot via Apache.


### Deployment Checklist

* [ ] Required ports are open (`80`, `443`, `2087`, `2096`)
* [ ] Frontend deployed to `/var/www/html/website/`
* [ ] `socket.js` and `peer.js` updated with correct hostnames
* [ ] Signaling server running with `pm2`
* [ ] SSL certificates installed for both domains
* [ ] Apache2 is enabled and running

<br><br>
---
<br><br>

# 🖼️ Project Screenshots


### 🔑 Login Screen

The default login are the following (you can edit them in auth.js):

**Username:** Visitor

**Password:** Test

![Login page](https://i.ibb.co/CpSGGyt1/image.png)


---

## 📊 Charts in Action

The dashboard integrates **Chart.js** accordingly to the documentation below:

* [ChartJS basic documentation](https://www.chartjs.org/docs/latest/getting-started/usage.html)
* [ChartJS chart update documentation](https://www.chartjs.org/docs/latest/developers/updates.html)

Real-time packets (`revenue_update`, `connection_update`, `stats`) patch the datasets and call `chart.update('none')` for buttery-smooth transitions.

---

## 🎙️ Voice Chat Details

* **PeerJS 1.5.2**: high-level WebRTC wrapper.
* **Signalling**: hosted at `https://webrtc.yourdomain.com:2096`.
* **Auto discovery**: `GET /peerjs/peers`

---

## ☁️ Infrastructure Choice

| Hosting Option         | Pros ✅                                                                                                                                | Cons ❌                                                                         |
| :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| **AWS EC2 (t2.micro)** | • Full customization / root access<br>• Real-time services, custom runtimes, any database<br>• Separate **frontend + backend** possible | • Requires setup, monitoring, Linux knowledge<br>• Higher learning curve        |
| **Wix.com**            | • Rapid site building, maintenance-free<br>• Built-in global CDN & 24/7 support                                                         | • **Cannot host custom back-end**<br>• Limited personalization beyond templates |

> **Verdict:** With WebSocket, PeerJS, custom ports, and automated SSL on the requirements list, **Amazon EC2** was the clear winner despite its steeper learning curve.

---

## 📚 References

[![Chart.js](https://img.shields.io/badge/Chart.js-Docs-orange?logo=chartdotjs&logoColor=white)](https://www.chartjs.org/docs/latest/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Website-black?logo=socket.io&logoColor=white)](https://socket.io/)
[![PeerJS](https://img.shields.io/badge/PeerJS-GitHub-blue?logo=github&logoColor=white)](https://github.com/peers/peerjs)
[![CountUp.js](https://img.shields.io/badge/CountUp.js-GitHub-green?logo=github&logoColor=white)](https://github.com/inorganik/CountUp.js)
[![Certbot](https://img.shields.io/badge/Certbot-Website-3b873c?logo=letsencrypt&logoColor=white)](https://certbot.eff.org/)
