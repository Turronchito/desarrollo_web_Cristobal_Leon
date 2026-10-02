from flask import Flask, request, render_template, redirect, url_for, flash, jsonify
from datetime import datetime
import os
import uuid
from werkzeug.utils import secure_filename

from tarea2.db import (
    SessionLocal, Avistamiento, Region, Comuna, Voluntario, Ave, Registro,
    get_voluntary_by_email, create_voluntary
)

UPLOAD_FOLDER = 'static/uploads'

app = Flask(__name__)
app.secret_key = "s3cr3t_k3y"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route('/get_regiones', methods=['GET'])
def get_regiones():
    with SessionLocal() as session:
        regiones = session.query(Region).order_by(Region.id).all()
        return jsonify([{"id": r.id, "nombre": r.nombre.strip()} for r in regiones])


@app.route('/get_comunas/<int:region_id>', methods=['GET'])
def get_comunas(region_id):
    with SessionLocal() as session:
        comunas = session.query(Comuna).filter_by(region_id=region_id).order_by(Comuna.nombre).all()
        return jsonify([{"id": c.id, "nombre": c.nombre.strip()} for c in comunas])


@app.route('/')
def inicio():
    with SessionLocal() as session:
        ultimosAvistamientos = session.query(Avistamiento)\
            .order_by(Avistamiento.id.desc())\
            .limit(2)\
            .all()
        return render_template('inicio.html', avistamientos=ultimosAvistamientos)



@app.route("/registro", methods=["GET", "POST"])
@app.route("/voluntario", methods=["GET", "POST"])
def voluntario():
    if request.method == "POST":
        nombre = request.form.get("nombre")
        email = request.form.get("email")
        telefono = request.form.get("phone")
        comuna_id = request.form.get("comuna-select")

        if not nombre or not email or not comuna_id or not telefono:
            return render_template("registro.html", errores=["Todos los campos son obligatorios."])

        if get_voluntary_by_email(email):
            return render_template("registro.html", errores=["El correo electrónico ya se encuentra registrado."])

        nuevo_voluntario = create_voluntary(
            nombre=nombre,
            email=email,
            telefono=telefono,
            fecha_registro=datetime.now(),
            comuna_id=int(comuna_id)
        )

        return render_template("registro.html", exito=True, voluntario_id=nuevo_voluntario.id)

    return render_template("registro.html")


@app.route('/informe', methods=['GET', 'POST'])
def informe():
    if request.method == 'GET':
        return render_template('informe.html', voluntario_id=request.args.get('voluntario_id', ''))

    f = request.form
    v_id = f.get('voluntario_id')
    b_name = f.get('BirdName', '').strip()
    b_type = f.get('BirdType', '').strip()
    place = f.get('place', '').strip()
    dt_str = f.get('time', '').strip()
    imgs = request.files.getlist('Image')
    
    errores = []

    if not v_id or v_id == 'None' or v_id == '':
        errores.append("No se ha especificado un voluntario válido.")

    if len(b_name) < 4 or len(b_type) < 4 or len(place) < 4:
        errores.append("Los campos de texto deben tener al menos 4 caracteres.")
    
    dt = None
    try:
        dt = datetime.strptime(dt_str, "%Y-%m-%dT%H:%M")
        if dt > datetime.now():
            errores.append("La fecha no puede ser futura.")
    except ValueError:
        errores.append("Formato de fecha inválido.")

    if not imgs or not imgs[0].filename:
        errores.append("Debe incluir al menos un archivo.")

    if errores:
        return render_template('informe.html', errores=errores, form_data=f, voluntario_id=v_id)

    with SessionLocal() as session:
        ave = session.query(Ave).filter_by(nombre=b_name).first()
        if not ave:
            ave = Ave(nombre=b_name)
            session.add(ave)
            session.flush()

        avis = Avistamiento(
            voluntario_id=int(v_id),
            ave_id=ave.id,
            fecha_hora=dt,
            lugar=place,
            descripcion=f"Tipo: {b_type}"
        )
        session.add(avis)
        session.flush()

        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        for img in imgs:
            if img and img.filename:
                orig_name = secure_filename(img.filename)
                hash_name = f"{uuid.uuid4().hex}{os.path.splitext(orig_name)[1]}"
                img.save(os.path.join(app.config['UPLOAD_FOLDER'], hash_name))
                
                session.add(Registro(
                    avistamiento_id=avis.id,
                    ruta_archivo=hash_name,
                    nombre_archivo=orig_name
                ))

        session.commit()
        flash("¡Avistamiento registrado exitosamente!", "success")
        return redirect(url_for('inicio'))

@app.route('/listado')
def listado():
    with SessionLocal() as session:
        avistamientos_bd = session.query(Avistamiento)\
            .order_by(Avistamiento.fecha_hora.desc())\
            .all()

        lista_avistamientos = []
        for a in avistamientos_bd:
            
            tipo = "Otro"
            if a.descripcion and "Tipo:" in a.descripcion:
                partes = a.descripcion.split("Tipo:")
                if len(partes) > 1:
                    tipo = partes[1].strip()

            lista_avistamientos.append({
                "id": a.id,
                "bname": a.ave.nombre if a.ave else "Desconocida",
                "tipo": tipo,
                "time": a.fecha_hora.strftime('%Y-%m-%d %H:%M') if a.fecha_hora else "",
                "place": a.lugar
            })

        return render_template('listado.html', avistamientos_json=lista_avistamientos)


@app.route('/avistamiento/<int:id>')
def detalle_avistamiento(id):
    with SessionLocal() as session:
        avistamiento_obj = session.query(Avistamiento).filter_by(id=id).first()
        if not avistamiento_obj:
            return "Avistamiento no encontrado", 404
        return render_template('detalleAvistamiento.html', avistamiento=avistamiento_obj)

if __name__ == "__main__":
    app.run(debug=True, port=5000)