from sqlalchemy import create_engine, Column, Integer, BigInteger, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from datetime import datetime

DB_NAME = "tarea2"
DB_USERNAME = "cc5002"
DB_PASSWORD = "programacionweb"
DB_HOST = "localhost"
DB_PORT = 3306

DATABASE_URL = f"mysql+pymysql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()

class Region(Base):
    __tablename__ = 'region'

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(200), nullable=False)

class Comuna(Base):
    __tablename__ = 'comuna'

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(200), nullable=False)
    region_id = Column(Integer, ForeignKey('region.id'), nullable=False)

class Voluntario(Base):
    __tablename__ = 'voluntario'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    nombre = Column(String(255), nullable=False)
    email = Column(String(80), nullable=False)
    telefono = Column(String(15), nullable=False)
    fecha_registro = Column(DateTime, nullable=False)
    comuna_id = Column(Integer, ForeignKey('comuna.id'), nullable=False)

class Ave(Base):
    __tablename__ = 'ave'

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(80), nullable=False)

class Avistamiento(Base):
    __tablename__ = 'avistamiento'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    voluntario_id = Column(Integer, ForeignKey('voluntario.id'), nullable=False)
    ave_id = Column(Integer, ForeignKey('ave.id'), nullable=False)
    fecha_hora = Column(DateTime, nullable=False)
    lugar = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=True)

    registros = relationship("Registro", back_populates="avistamiento", cascade="all, delete")

class Registro(Base):
    __tablename__ = 'registro'

    id = Column(Integer, primary_key=True, autoincrement=True)
    ruta_archivo = Column(String(300), nullable=False)
    nombre_archivo = Column(String(300), nullable=False)
    avistamiento_id = Column(Integer, ForeignKey('avistamiento.id'), nullable=False)

    avistamiento = relationship("Avistamiento", back_populates="registros")

class Comentario(Base):
    __tablename__ = 'comentario'

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(80), nullable=False)
    texto = Column(String(300), nullable=False)
    fecha = Column(DateTime, nullable=False)
    avistamiento_id = Column(Integer, ForeignKey('avistamiento.id'), nullable=False)

def get_regiones():
    session = SessionLocal()
    regiones = session.query(Region).order_by(Region.id).all()
    session.close()
    return regiones

def get_comunas():
    session = SessionLocal()
    comunas = session.query(Comuna).order_by(Comuna.nombre).all()
    session.close()
    return comunas

def get_comuna_by_id(id):
    session = SessionLocal()
    comuna = session.query(Comuna).filter_by(id=id).first()
    session.close()
    return comuna

def get_region_by_id(id):
    session = SessionLocal()
    region = session.query(Region).filter_by(id=id).first()
    session.close()
    return region

def get_voluntario_by_id(id):
    session = SessionLocal()
    voluntario = session.query(Voluntario).filter_by(id=id).first()
    session.close()
    return voluntario

def get_voluntario_by_email(email):
    session = SessionLocal()
    voluntario = session.query(Voluntario).filter_by(email=email).first()
    session.close()
    return voluntario

def create_voluntario(nombre, email, telefono, comuna_id):
    session = SessionLocal()
    new_voluntario = Voluntario(nombre=nombre, email=email, telefono=telefono,
                                fecha_registro=datetime.now(), comuna_id=comuna_id)
    session.add(new_voluntario)
    session.commit()
    voluntario_id = new_voluntario.id
    session.close()
    return voluntario_id

def register_voluntario(nombre, email, telefono, region_id, comuna_id):
    comuna = get_comuna_by_id(comuna_id)
    if comuna is None or comuna.region_id != region_id:
        return False, "La comuna no pertenece a la región seleccionada."

    if get_voluntario_by_email(email) is not None:
        return False, "El correo electrónico ya se encuentra registrado."

    voluntario_id = create_voluntario(nombre, email, telefono, comuna_id)
    return True, voluntario_id

def get_ave_by_id(id):
    session = SessionLocal()
    ave = session.query(Ave).filter_by(id=id).first()
    session.close()
    return ave

def get_ave_by_nombre(nombre):
    session = SessionLocal()
    ave = session.query(Ave).filter_by(nombre=nombre).first()
    session.close()
    return ave

def create_ave(nombre):
    session = SessionLocal()
    new_ave = Ave(nombre=nombre)
    session.add(new_ave)
    session.commit()
    ave_id = new_ave.id
    session.close()
    return ave_id

def get_avistamientos():
    session = SessionLocal()
    avistamientos = session.query(Avistamiento).order_by(Avistamiento.fecha_hora.desc()).all()
    session.close()
    return avistamientos

def get_ultimos_avistamientos(page_size):
    session = SessionLocal()
    avistamientos = session.query(Avistamiento).order_by(Avistamiento.id.desc()).limit(page_size).all()
    session.close()
    return avistamientos

def get_avistamiento_by_id(id):
    session = SessionLocal()
    avistamiento = session.query(Avistamiento).filter_by(id=id).first()
    session.close()
    return avistamiento

def get_registros_by_avistamiento(avistamiento_id):
    session = SessionLocal()
    registros = session.query(Registro).filter_by(avistamiento_id=avistamiento_id).order_by(Registro.id).all()
    session.close()
    return registros

def create_avistamiento(voluntario_id, ave_id, fecha_hora, lugar, descripcion, archivos):
    session = SessionLocal()
    new_avistamiento = Avistamiento(voluntario_id=voluntario_id, ave_id=ave_id,
                                    fecha_hora=fecha_hora, lugar=lugar, descripcion=descripcion)
    for ruta_archivo, nombre_archivo in archivos:
        new_avistamiento.registros.append(Registro(ruta_archivo=ruta_archivo, nombre_archivo=nombre_archivo))
    session.add(new_avistamiento)
    session.commit()
    session.close()

def create_comentario(nombre, texto, avistamiento_id, fecha):
    session = SessionLocal()
    new_comentario = Comentario(nombre=nombre, texto=texto, fecha=fecha,
                                avistamiento_id=avistamiento_id)
    session.add(new_comentario)
    session.commit()
    session.close()

def get_comentarios_by_avistamiento(avistamiento_id):
    session = SessionLocal()
    comentarios = session.query(Comentario).filter_by(avistamiento_id=avistamiento_id).order_by(Comentario.fecha.desc(), Comentario.id.desc()).all()
    session.close()
    return comentarios


def get_avistamientos_por_dia():
    session = SessionLocal()
    cursor = session.query(Avistamiento.fecha_hora).all()
    dias = {}
    for (fecha_hora,) in cursor:
        dia = fecha_hora.strftime("%Y-%m-%d")
        if dia not in dias:
            dias[dia] = 0
        dias[dia] += 1
    session.close()
    return dias

def get_avistamientos_por_tipo():
    session = SessionLocal()
    cursor = session.query(Avistamiento.descripcion).all()
    tipos = {}
    for (tipo,) in cursor:
        tipo = tipo.strip() if tipo else "Sin tipo"
        if tipo not in tipos:
            tipos[tipo] = 0
        tipos[tipo] += 1
    session.close()
    return tipos

def get_voluntarios_por_comuna():
    session = SessionLocal()
    cursor = session.query(Voluntario.comuna_id).all()
    comunas = {}
    for (comuna_id,) in cursor:
        if comuna_id not in comunas:
            comunas[comuna_id] = 0
        comunas[comuna_id] += 1
    session.close()
    return comunas
