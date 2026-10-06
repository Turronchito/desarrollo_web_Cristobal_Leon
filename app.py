from flask import Flask, request, render_template, redirect, url_for, session
from validations import validate_register_voluntario, validate_informe
from tarea2 import db
from werkzeug.utils import secure_filename
from datetime import datetime
import hashlib
import filetype
import time
import os

UPLOAD_FOLDER = 'static/uploads'

app = Flask(__name__)

app.secret_key = "s3cr3t_k3y"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1000 * 1000

@app.route("/", methods=["GET"])
def index():
    mensaje = session.pop("mensaje", None)
    data = []
    for avis in db.get_ultimos_avistamientos(page_size=2):
        ave = db.get_ave_by_id(avis.ave_id)
        voluntario = db.get_voluntario_by_id(avis.voluntario_id)
        data.append({
            "ave": ave.nombre,
            "tipo": avis.descripcion,
            "fecha": avis.fecha_hora.strftime("%Y-%m-%d %H:%M"),
            "lugar": avis.lugar,
            "voluntario": voluntario.nombre
        })
    return render_template("inicio.html", data=data, mensaje=mensaje)

@app.route("/registro", methods=["GET", "POST"])
def registro():
    if request.method == "POST":
        nombre = request.form.get("nombre")
        rut = request.form.get("rut")
        email = request.form.get("email")
        phone = request.form.get("phone")
        region = request.form.get("region-select")
        comuna = request.form.get("comuna-select")
        errores = validate_register_voluntario(nombre, rut, email, phone, region, comuna)
        if len(errores) == 0:
            # try to register voluntario
            status, msg = db.register_voluntario(nombre.strip(), email, phone, int(region), int(comuna))
            if status:
                session["voluntario_id"] = msg
                session["registro_exitoso"] = True
                return redirect(url_for("registro"))
            errores.append(msg)

        return render_template("registro.html", errores=errores, valores=request.form,
                               regiones=db.get_regiones(), comunas=db.get_comunas())

    elif request.method == "GET":
        exito = session.pop("registro_exitoso", False)
        return render_template("registro.html", exito=exito, valores={},
                               regiones=db.get_regiones(), comunas=db.get_comunas())

@app.route("/informe", methods=["GET", "POST"])
def informe():
    voluntario = None
    if "voluntario_id" in session:
        voluntario = db.get_voluntario_by_id(session["voluntario_id"])

    if voluntario is None:
        return render_template("informe.html", voluntario=None)

    if request.method == "POST":
        bname = request.form.get("BirdName")
        tipo = request.form.get("BirdType")
        place = request.form.get("place")
        time_str = request.form.get("time")
        archivos = [a for a in request.files.getlist("Image") if a.filename != ""]

        errores = validate_informe(bname, tipo, time_str, place, archivos)

        if len(errores) == 0:
            ave = db.get_ave_by_nombre(bname.strip())
            if ave is None:
                ave_id = db.create_ave(bname.strip())

            else:
                ave_id = ave.id

            registros = []
            for archivo in archivos:
                _filename = hashlib.sha256(
                    (secure_filename(archivo.filename) + str(time.time()))
                    .encode("utf-8")
                    ).hexdigest()
                _extension = filetype.guess(archivo).extension
                filename = f"{_filename}.{_extension}"
                archivo.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
                registros.append((f"uploads/{filename}", secure_filename(archivo.filename)))

            db.create_avistamiento(voluntario.id, ave_id, datetime.strptime(time_str, "%Y-%m-%dT%H:%M"),
                                   place.strip(), tipo.strip(), registros)

            session["mensaje"] = "¡Avistamiento registrado exitosamente!"
            return redirect(url_for("index"))

        return render_template("informe.html", errores=errores, valores=request.form,
                               voluntario=voluntario)

    elif request.method == "GET":
        return render_template("informe.html", voluntario=voluntario, valores={})

@app.route("/listado", methods=["GET"])
def listado():
    data = []
    tipos = []
    for avis in db.get_avistamientos():
        ave = db.get_ave_by_id(avis.ave_id)
        data.append({
            "id": avis.id,
            "ave": ave.nombre,
            "tipo": avis.descripcion,
            "fecha": avis.fecha_hora.strftime("%Y-%m-%d %H:%M"),
            "lugar": avis.lugar
        })
        if avis.descripcion not in tipos:
            tipos.append(avis.descripcion)

    detalle = None
    avis_id = request.args.get("id", "")
    if avis_id.isdigit():
        avis = db.get_avistamiento_by_id(int(avis_id))
        if avis is not None:
            ave = db.get_ave_by_id(avis.ave_id)
            voluntario = db.get_voluntario_by_id(avis.voluntario_id)
            comuna = db.get_comuna_by_id(voluntario.comuna_id)
            region = db.get_region_by_id(comuna.region_id)

            archivos = []
            for registro in db.get_registros_by_avistamiento(avis.id):
                es_video = registro.ruta_archivo.endswith((".mp4", ".webm"))
                archivos.append({
                    "path": url_for("static", filename=registro.ruta_archivo),
                    "es_video": es_video
                })

            detalle = {
                "ave": ave.nombre,
                "tipo": avis.descripcion,
                "fecha": avis.fecha_hora.strftime("%Y-%m-%d %H:%M"),
                "lugar": avis.lugar,
                "voluntario": voluntario.nombre,
                "email": voluntario.email,
                "telefono": voluntario.telefono,
                "comuna": comuna.nombre.strip(),
                "region": region.nombre.strip(),
                "archivos": archivos
            }

    return render_template("listado.html", data=data, tipos=tipos, detalle=detalle)

@app.route("/estadisticas", methods=["GET"])
def estadisticas():
    return render_template("estadisticas.html")


if __name__ == "__main__":
    app.run(debug=True)
