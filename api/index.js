const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

module.exports = (req, res) => {
    const configPath = path.join(process.cwd(), 'config.json');
  
    res.status(200).send("Xray node is running on Vercel.");
};
