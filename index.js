const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const port = 3000;

const client = new Client({
  authStrategy: new LocalAuth(),
  // Adicione abaixo as opções de puppeteer
  puppeteer: {
    headless: true,
    executablePath: '/usr/bin/chromium-browser', 
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  }
});

// Evento disparado quando o QR code é gerado
client.on('qr', (qr) => {
  console.log('QR Code gerado! Escaneie com o WhatsApp:');
  qrcode.generate(qr, { small: true });
});

// Evento disparado quando o cliente está pronto
client.on('ready', () => {
  console.log('WhatsApp conectado com sucesso!');
});

// Inicializa a conexão WhatsApp
client.initialize();

// Endpoint GET para obter a URL da foto de perfil
app.get('/profile-pic/:number', async (req, res) => {
  try {
    const { number } = req.params;
    const whatsappNumber = `${number}@c.us`;
    const profilePicUrl = await client.getProfilePicUrl(whatsappNumber);

    if (profilePicUrl) {
      res.json({ number, profilePicUrl });
    } else {
      res.status(404).json({
        message: 'Não foi possível obter a foto de perfil.'
      });
    }
  } catch (error) {
    console.error('Erro ao obter a foto de perfil:', error);
    res.status(500).json({
      message: 'Erro interno ao obter a foto de perfil.',
      error: error.toString()
    });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
