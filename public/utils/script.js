// document.querySelector(".form").addEventListener("submit", (event) => {
//   const formInputs = {
//     name: document.querySelector("#name"),
//     cpf: document.querySelector("#cpf"),
//     birth: document.querySelector("#birth"),
//     age: document.querySelector("#ageinyears"),
//     rg: document.querySelector("#rg"),
//     organ: document.querySelector("#organ"),
//     title: document.querySelector("#title"),
//     pis: document.querySelector("#pis"),
//     mother: document.querySelector("#mother"),
//     nationality: document.querySelector("#nationality"),
//     cityofbirth: document.querySelector("#cityofbirth"),
//     email: document.querySelector("#email"),
//     phone: document.querySelector("#teç"),
//     zip: document.querySelector("#zip"),
//     address: document.querySelector("#address"),
//     housenumber: document.querySelector("#housenumber"),
//     complement: document.querySelector("#complement"),
//     neighborhood: document.querySelector("#neighborhood"),
//     city: document.querySelector("#city"),
//     advice: document.querySelector("#advice"),
//     registrationCouncil: document.querySelector("#registrationCouncil"),
//     file: document.querySelector("#file"),
//   };

//   let hasError = false;

//   function validateInput(input, regex, message) {
//     if (input) {
//       const value = input.value.trim();
//       input.setCustomValidity("");
//       if (!regex.test(value)) {
//         input.setCustomValidity(message);
//         hasError = true;
//       }
//     }
//   }

//   validateInput(formInputs.name, /^[a-zA-Záàãâäéèêëíìîïóòôöúùûüç\s]+$/, "Nome inválido! Apenas letras e espaços são permitidos.");
//   validateInput(formInputs.cpf, /^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})$/, "CPF inválido! Digite 11 números, com ou sem pontos e hífen.");
//   validateInput(formInputs.rg, /^\d+$/, "RG inválido! Apenas números são permitidos.");
//   validateInput(formInputs.organ, /^[a-zA-Z\s]+$/, "Órgão emissor inválido!");
//   validateInput(formInputs.title, /^\d{15}$/, "Título de eleitor inválido! Digite 15 números.");
//   validateInput(formInputs.pis, /^\d{11}$/, "PIS inválido! Digite 11 números.");
//   validateInput(formInputs.mother, /^[a-zA-Záàãâäéèêëíìîïóòôöúùûüç\s]+$/, "Nome inválido! Apenas letras e espaços são permitidos.");
//   validateInput(formInputs.nationality, /^[a-zA-Z\s]+$/, "Nacionalidade inválida!");
//   validateInput(formInputs.cityofbirth, /^[a-zA-Z\s]+$/, "Naturalidade inválida!");
//   validateInput(formInputs.email, /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/, "E-mail inválido!");
//   validateInput(formInputs.phone, /^\d{10,11}$/, "Telefone inválido! Formato correto: DDD + Número.");
//   validateInput(formInputs.zip, /^\d{8}$/, "CEP inválido! Digite 8 números, sem pontos ou hífen.");
//   validateInput(formInputs.housenumber, /^\d+$/, "Número da casa inválido! Apenas números são permitidos.");
//   validateInput(formInputs.advice, /^[a-zA-Z\s]+$/, "Nome do conselho inválido!");
//   validateInput(formInputs.registrationCouncil, /^\d+$/, "Número do registro inválido! Apenas números são permitidos.");

//   // Validação de idade a partir da data de nascimento
//   if (formInputs.birth.value) {
//     const birthDate = new Date(formInputs.birth.value);
//     const today = new Date();
//     const age = today.getFullYear() - birthDate.getFullYear();
//     const monthDiff = today.getMonth() - birthDate.getMonth();
//     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//       age--;
//     }
//     if (age < 18) {
//       formInputs.birth.setCustomValidity("Você deve ter pelo menos 18 anos.");
//       hasError = true;
//     } else {
//       formInputs.birth.setCustomValidity("");
//       formInputs.age.value = age; // Define automaticamente a idade
//     }
//   }

//   // Validação de arquivo (PDF até 10MB)
//   if (formInputs.file.files.length > 0) {
//     if (formInputs.file.files[0].size > 10 * 1024 * 1024) {
//       formInputs.file.setCustomValidity("O arquivo deve ter no máximo 10MB.");
//       hasError = true;
//     } else {
//       formInputs.file.setCustomValidity("");
//     }
//   }

//   if (hasError) {
//     event.preventDefault();
//   }
// });

let cpfValido = false; // Variável global para armazenar a validade do CPF

function validarCPF(input) {
  let cpf = input.value.replace(/\D/g, '').slice(0, 11);
  input.value = cpf; // Atualiza o campo sem caracteres inválidos

  if (cpf.length === 11) {
    if (checarCPFValido(cpf)) {
      cpfValido = true;
      document.getElementById("cpfErro").style.display = "none"; // Esconde erro
    } else {
      cpfValido = false;
      document.getElementById("cpfErro").style.display = "inline"; // Mostra erro
    }
  } else {
    cpfValido = false;
    document.getElementById("cpfErro").style.display = "none"; // Esconde erro se incompleto
  }
}

function checarCPFValido(cpf) {
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0, resto;

  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[10])) return false;

  return true;
}

function validarFormulario() {
  if (!cpfValido) {
    alert("Por favor, insira um CPF válido antes de enviar o formulário.");
    return false; // Impede o envio do formulário
  }
  return true; // Permite o envio do formulário
}

function checkFileSize() {
  const fileInput = document.getElementById("file");
  const errorText = document.getElementById("fileSizeError");

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB em bytes

    if (file.size > maxSize) {
      alert("O arquivo é maior que 10MB e não pode ser anexado.");
      errorText.style.display = "inline"; // Mostra a mensagem de erro
      fileInput.value = ""; // Reseta o campo de upload
    } else {
      errorText.style.display = "none"; // Esconde a mensagem de erro se o tamanho for válido
    }
  }
}

document.addEventListener("keydown", function (event) {
  // Detectando F12
  if (event.keyCode === 123) {
    event.preventDefault();
    return
  }

  // Detectando Ctrl + Shift + I
  if (event.ctrlKey && event.shiftKey && event.keyCode === 73) {
    event.preventDefault();
    return
  }

  // Detectando Ctrl + Shift + J
  if (event.ctrlKey && event.shiftKey && event.keyCode === 74) {
    event.preventDefault();
    return
  }
});

document.addEventListener("contextmenu", function (event) {
  event.preventDefault();  // Impede o menu de contexto padrão
  return
});

// Função para gerar uma pergunta CAPTCHA aleatória
function generateCaptcha() {
  // Gerando dois números aleatórios entre 1 e 10
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  // Criando uma pergunta de soma
  const question = `${num1} + ${num2} = ?`;
  // Definindo a pergunta no HTML
  document.getElementById('captchaQuestion').innerText = question;
  // Salvando a resposta correta em um atributo de data no campo
  document.getElementById('captchaAnswer').dataset.correctAnswer = num1 + num2;
}

// Função para validar a resposta do CAPTCHA
function validateCaptcha() {
  const userAnswer = document.getElementById('captchaAnswer').value;
  const correctAnswer = document.getElementById('captchaAnswer').dataset.correctAnswer;

  // Verificando se a resposta do usuário é correta
  if (userAnswer != correctAnswer) {
    document.getElementById('captchaError').style.display = 'inline';
    return false;
  }
  document.getElementById('captchaError').style.display = 'none';
  return true;
}

// Gerar uma nova pergunta ao carregar a página
window.onload = generateCaptcha;

// Adiciona a validação no evento de envio do formulário
document.querySelector('form').onsubmit = function(event) {
  if (!validateCaptcha()) {
    event.preventDefault();
  }
};