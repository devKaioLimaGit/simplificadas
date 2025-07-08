async function getAddress(cep) {

    cep = cep.replace(/\D/g, ""); // Remove non-numeric characters
    if (cep != "") {
      var validateCep = /^[0-9]{8}$/; // CEP format validation
      if (validateCep.test(cep)) {
        try {
          const response = await fetch(
            `https://viacep.com.br/ws/${cep}/json/`
          );
          const data = await response.json();

          if (!data.erro) {
            // Verifica se os dados esperados existem antes de atribuí-los aos campos
            document.getElementById("address").value =
              data.logradouro || "";
            document.getElementById("city").value = data.localidade || "";
            document.getElementById("neighborhood").value = data.bairro  || "";
          } else {
            // Caso o CEP não seja encontrado, limpa os campos
            alert("CEP não encontrado.");
            document.getElementById("address").value = "";
            document.getElementById("city").value = "";
            document.getElementById("neighborhood").value = "";
          }
        } catch (error) {
          // Em caso de erro de rede, limpa os campos
          alert("Erro ao consultar o CEP.");
          document.getElementById("address").value = "";
          document.getElementById("city").value = "";
          document.getElementById("neighborhood").value = "";
        }
      } else {
        alert("Formato de CEP inválido.");
        // Limpa os campos caso o CEP não tenha o formato correto
        document.getElementById("address").value = "";
        document.getElementById("city").value = "";
        document.getElementById("neighborhood").value = "";
      }
    }
  }