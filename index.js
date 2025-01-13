const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Instanciamos o Express para criar a API
const app = express();
const port = 3000;

// Cria uma instância do cliente do WhatsApp
const client = new Client({
  authStrategy: new LocalAuth()
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
// Exemplo de requisição: GET http://localhost:3000/profile-pic/5511999999999
app.get('/profile-pic/:number', async (req, res) => {
  try {
    // Resgata o número do parâmetro (route param)
    const { number } = req.params;

    // Formato exigido pelo WhatsApp: 5511999999999@c.us
    const whatsappNumber = `${number}@c.us`;

    // Solicita a URL da foto de perfil
    const profilePicUrl = await client.getProfilePicUrl(whatsappNumber);

    if (profilePicUrl) {
      // Retorna a URL em formato JSON
      res.json({
        number,
        profilePicUrl
      });
    } else {
      // Se não puder obter a foto de perfil (ex: privacidade restrita), retorna erro 404
      res.status(404).json({
        message: 'Não foi possível obter a foto de perfil.'
      });
    }
  } catch (error) {
    console.error('Erro ao obter a foto de perfil:', error);
    // Em caso de erro no processo, retorna 500
    res.status(500).json({
      message: 'Erro interno ao obter a foto de perfil.',
      error: error.toString()
    });
  }
});

// Inicia o servidor Express
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
