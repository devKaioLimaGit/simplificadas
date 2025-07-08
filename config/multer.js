const crypto = require('crypto');
const multer = require('multer');
const { extname, resolve } = require('path');

module.exports = {
  upload(folder) {
    return {
      storage: multer.diskStorage({
        destination: resolve(__dirname, '..', folder),
        filename: (request, file, callback) => {
          const cpf = request.body.cpf; // Obtém o CPF da requisição
          const fileExtension = extname(file.originalname); // Extensão do arquivo
          const newFileName = `${cpf}${fileExtension}`; // Usa o CPF como nome do arquivo

          callback(null, newFileName); // Define o novo nome do arquivo
        }
      })
    };
  }
};
