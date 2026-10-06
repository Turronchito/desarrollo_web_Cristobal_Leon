import re
import filetype
from datetime import datetime

def validate_nombre(value):
    return bool(value) and len(value.strip()) >= 5

def validate_email(value):
    if not value:
        return False
    return len(value) > 15 and bool(re.match(r"^[\w.]+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$", value))

def validate_rut(value):
    if not value:
        return False
    return len(value) >= 8 and bool(re.match(r"^0*(\d{1,3}(\.?\d{3}){2})\-([\dkK])$", value))

def validate_phone(value):
    if not value:
        return False
    return len(value) >= 8 and bool(re.match(r"^[0-9]+$", value))

def validate_select(value):
    return bool(value) and value.isdecimal()

def validate_fecha(value):
    try:
        fecha = datetime.strptime(value, "%Y-%m-%dT%H:%M")
    except (TypeError, ValueError):
        return False
    return fecha <= datetime.now()

def validate_archivo(archivo):
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "mp4", "webm"}
    ALLOWED_MIMETYPES = {"image/jpeg", "image/png", "image/gif", "video/mp4", "video/webm"}

    if archivo is None or archivo.filename == "":
        return False

    ftype_guess = filetype.guess(archivo)
    if ftype_guess is None:
        return False
    if ftype_guess.extension not in ALLOWED_EXTENSIONS:
        return False
    if ftype_guess.mime not in ALLOWED_MIMETYPES:
        return False
    return True

def validate_archivos(archivos):
    if len(archivos) == 0 or len(archivos) > 5:
        return False
    for archivo in archivos:
        if not validate_archivo(archivo):
            return False
    return True

def validate_register_voluntario(nombre, rut, email, phone, region, comuna):
    errores = []
    if not validate_nombre(nombre):
        errores.append("Nombre")
    if not validate_email(email):
        errores.append("Email")
    if not validate_rut(rut):
        errores.append("Rut")
    if not validate_phone(phone):
        errores.append("Numero de teléfono")
    if not validate_select(region):
        errores.append("Region")
    if not validate_select(comuna):
        errores.append("Comuna")
    return errores

def validate_informe(bname, tipo, time, place, archivos):
    errores = []
    if not validate_nombre(tipo):
        errores.append("Tipo de Ave")
    if not validate_nombre(bname):
        errores.append("Nombre del Ave")
    if not validate_archivos(archivos):
        errores.append("Fotos")
    if not validate_fecha(time):
        errores.append("Fecha y Hora")
    if not validate_nombre(place):
        errores.append("Lugar")
    return errores