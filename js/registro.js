const validateName = (name) => {
  if(!name) return false;
  let lengthValid = name.trim().length >= 5;
  return lengthValid;
}

const validateEmail = (email) => {
  if (!email) return false;
  let lengthValid = email.length > 15;
  let re = /^[\w.]+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
  let formatValid = re.test(email);
  return lengthValid && formatValid;
};

const validateSelect = (select) => {
  if(!select) return false;
  return true
}

const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return false;
  let lengthValid = phoneNumber.length >= 8;
  let re = /^[0-9]+$/;
  let formatValid = re.test(phoneNumber);
  return lengthValid && formatValid;
};

const validateRut = (rut) => {
  if (!rut) return false;
  let lengthValid = rut.length >= 8;
  let Rut = /^0*(\d{1,3}(\.?\d{3}){2})\-([\dkK])$/;
  let formatValid = Rut.test(rut);
  return lengthValid && formatValid;
}

const validateForm = () => {
  let myForm = document.forms["myForm"];
  let email = myForm["email"].value;
  let name = myForm["nombre"].value;
  let rut = myForm["rut"].value
  let phone = myForm["phone"].value
  let region = myForm["region"].value;
  let comuna = myForm["comuna"].value;

  let invalidInputs = [];
  let isValid = true;
  const setInvalidInput = (inputName) => {
    invalidInputs.push(inputName);
    isValid &&= false;
  };
  if (!validateName(name)) {
    setInvalidInput("Nombre");
  }

  if (!validateEmail(email)) {
    setInvalidInput("Email");
  }

  if (!validateRut(rut)) {
    setInvalidInput("Rut");
  }

  if (!validatePhoneNumber(phone)) {
    setInvalidInput("Numero de teléfono");
  }
  
  if (!validateSelect(region)) {
    setInvalidInput("Region");
  }

  if (!validateSelect(comuna)) {
    setInvalidInput("Comuna");
  }

  let validationBox = document.getElementById("val-box");
  let validationMessageElem = document.getElementById("val-msg");
  let validationListElem = document.getElementById("val-list");
  let formContainer = document.querySelector(".main-container");

  if (!isValid) {
    validationListElem.textContent = "";
    for (input of invalidInputs) {
      let listElement = document.createElement("li");
      listElement.innerText = input;
      validationListElem.append(listElement);
    }
    validationMessageElem.innerText = "Los siguientes campos son inválidos:";

    validationBox.style.backgroundColor = "#ffdddd00";

    validationBox.hidden = false;
  } else {

    myForm.style.display = "none";

    validationMessageElem.innerText = "¿Desea enviarlo, volver, o volver al inicio?";
    validationListElem.textContent = "";

    validationBox.style.backgroundColor = "#10e6db70";

    let submitButton = document.createElement("button");
    submitButton.innerText = "Enviar";
    submitButton.style.marginRight = "10px";
    submitButton.addEventListener("click", () => {
      myForm.style.display = "block";
      validationBox.hidden = true;
      myForm.reset();
      alert("Registro realizado");
    });

    let backButton = document.createElement("button");
    backButton.innerText = "Volver";
    backButton.style.marginRight = "10px";
    backButton.addEventListener("click", () => {
      myForm.style.display = "block";
      validationBox.hidden = true;
    });

    let startButton = document.createElement("button");
    startButton.innerText = "Volver a inicio";
    startButton.addEventListener("click", () => {
      window.location.href = "inicio.html"
    });
    validationListElem.appendChild(submitButton);
    validationListElem.appendChild(backButton);
    validationListElem.appendChild(startButton);

    validationBox.hidden = false;
  }
};


let submitBtn = document.getElementById("submit-btn");
submitBtn.addEventListener("click", validateForm);
