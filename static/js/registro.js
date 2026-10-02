const validateName = (name) => {
  if (!name) return false;
  return name.trim().length >= 5;
};

const validateEmail = (email) => {
  if (!email) return false;
  let lengthValid = email.length >= 10;
  let re = /^[\w.]+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
  let formatValid = re.test(email);
  return lengthValid && formatValid;
};

const validateSelect = (select) => {
  if (!select) return false;
  return select.trim() !== "";
};

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
};

const validateForm = () => {
  let myForm = document.forms["myForm"];
  let email = myForm["email"].value;
  let name = myForm["nombre"].value;
  let rut = myForm["rut"].value;
  let phone = myForm["phone"].value;
  let region = myForm["region-select"].value;
  let comuna = myForm["comuna-select"].value;

  let invalidInputs = [];
  let isValid = true;

  const setInvalidInput = (inputName) => {
    invalidInputs.push(inputName);
    isValid &&= false;
  };

  if (!validateName(name)) {
    setInvalidInput("Nombre (Mínimo 5 caracteres)");
  }

  if (!validateEmail(email)) {
    setInvalidInput("Email (Formato válido y mínimo 10 caracteres)");
  }

  if (!validateRut(rut)) {
    setInvalidInput("RUT (Formato ej: 12345678-k)");
  }

  if (!validatePhoneNumber(phone)) {
    setInvalidInput("Número de teléfono (Solo números, mín. 8 dígitos)");
  }

  if (!validateSelect(region)) {
    setInvalidInput("Región");
  }

  if (!validateSelect(comuna)) {
    setInvalidInput("Comuna");
  }

  let validationBox = document.getElementById("val-box");
  let validationMessageElem = document.getElementById("val-msg");
  let validationListElem = document.getElementById("val-list");

  if (!isValid) {
    validationListElem.textContent = "";
    for (let input of invalidInputs) {
      let listElement = document.createElement("li");
      listElement.style.color = "red";
      listElement.innerText = input;
      validationListElem.append(listElement);
    }
    validationMessageElem.innerText = "Los siguientes campos son inválidos:";
    validationBox.hidden = false;
  } else {
    myForm.style.display = "none";
    validationMessageElem.innerText = "¿Desea enviar el registro o volver?";
    validationListElem.textContent = "";

    let submitButton = document.createElement("button");
    submitButton.innerText = "Enviar";
    submitButton.style.marginRight = "10px";
    submitButton.type = "button";
    submitButton.addEventListener("click", () => {
      myForm.submit();
    });

    let backButton = document.createElement("button");
    backButton.innerText = "Volver";
    backButton.style.marginRight = "10px";
    backButton.type = "button";
    backButton.addEventListener("click", () => {
      myForm.style.display = "block";
      validationBox.hidden = true;
    });

    let startButton = document.createElement("button");
    startButton.innerText = "Volver a inicio";
    startButton.type = "button";
    startButton.addEventListener("click", () => {
      window.location.href = "/";
    });

    validationListElem.appendChild(submitButton);
    validationListElem.appendChild(backButton);
    validationListElem.appendChild(startButton);

    validationBox.hidden = false;
  }
};

let submitBtn = document.getElementById("submit-btn");
if (submitBtn) {
  submitBtn.type = "button";
  submitBtn.addEventListener("click", validateForm);
}