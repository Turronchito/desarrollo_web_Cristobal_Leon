const validateName = (name) => {
  if (!name) return false;
  return name.trim().length >= 5;
};

const validateFiles = (files) => {
  if (!files || files.length === 0) return false;
  let typeValid = true;

  for (const file of files) {
    let fileFamily = file.type.split("/")[0];
    typeValid &&= fileFamily === "image" || file.type === "application/pdf";
  }
  return typeValid;
};

const validateDate = (dateString) => {
  if (!dateString) return false;
  let inputDate = new Date(dateString);
  let now = new Date();
  return inputDate <= now;
};

const validateForm = () => {
  let myForm = document.forms["myForm"];
  let files = myForm["Image"].files;
  let bname = myForm["BirdName"].value;
  let tipo = myForm["BirdType"].value;
  let time = myForm["time"].value;
  let place = myForm["place"].value;

  let invalidInputs = [];
  let isValid = true;

  const setInvalidInput = (inputName) => {
    invalidInputs.push(inputName);
    isValid &&= false;
  }; 
  
  if (!validateName(tipo)) {
    setInvalidInput("Tipo de Ave");
  }
  if (!validateName(bname)) {
    setInvalidInput("Nombre del Ave");
  }
  if (!validateFiles(files)) {
    setInvalidInput("Fotos");
  }
  if (!validateDate(time)) {
    setInvalidInput("Fecha y Hora");
  }
  if (!validateName(place)) {
    setInvalidInput("Lugar");
  }

  let validationBox = document.getElementById("val-box");
  let validationMessageElem = document.getElementById("val-msg");
  let validationListElem = document.getElementById("val-list");

  if (!isValid) {
    validationListElem.textContent = "";
    
    // CORREGIDO: Agregado 'let' antes de 'input'
    for (let input of invalidInputs) { 
      let listElement = document.createElement("li");
      listElement.innerText = input;
      validationListElem.append(listElement);
    }
    validationMessageElem.innerText = "Los siguientes campos son inválidos:";
    validationBox.style.backgroundColor = "#ffdddd";
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
      alert("Informe realizado");
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
      window.location.href = "inicio.html";
    });

    validationListElem.appendChild(submitButton);
    validationListElem.appendChild(backButton);
    validationListElem.appendChild(startButton);

    validationBox.hidden = false;
  }
};

let submitBtn = document.getElementById("submit-btn");
submitBtn.addEventListener("click", validateForm);
