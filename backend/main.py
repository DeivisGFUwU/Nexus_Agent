import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

# Importación de los módulos ruteadores
from api.routes_admin import router_admin
from api.routes_lider import router_lider
from api.routes_miembro import router_miembro

# Ignición del entorno
load_dotenv()

app = FastAPI(title="NexusSync AI Backend")

# Configuración de Rutas a las carpetas del Frontend
# Usamos os.path para asegurar que las rutas funcionen sin importar dónde ejecutes el comando
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

# Montaje de archivos estáticos (CSS y JS)
app.mount("/css", StaticFiles(directory=os.path.join(FRONTEND_DIR, "css")), name="css")
app.mount("/js", StaticFiles(directory=os.path.join(FRONTEND_DIR, "js")), name="js")

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Acoplamiento de los módulos a la matriz principal
app.include_router(router_admin)
app.include_router(router_lider)
app.include_router(router_miembro)

# --- NUEVA ESTRUCTURA DE ENRUTAMIENTO (Sincronizada con auth.js) ---

@app.get("/api/status")
def estado_sistema():
    """Estado del sistema: Telemetría de diagnóstico"""
    return {"status": "Reactor Termodinámico En Línea. Todos los CRUD operativos."}

# 1. EL LOBBY PRINCIPAL (Punto Cero)
@app.get("/")
def get_index():
    """Ruta raíz: Sirve el portal de acceso (index.html) desde la raíz de frontend"""
    # Nota científica: Aseguramos que busque directamente en FRONTEND_DIR, no en "views"
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

# 2. LAS COMPUERTAS DE LOS DASHBOARDS
@app.get("/dashboard/admin")
def get_dashboard_admin():
    """Sirve la interfaz de control del administrador"""
    return FileResponse(os.path.join(FRONTEND_DIR, "views", "admin_dashboard.html"))

@app.get("/dashboard/lider")
def get_dashboard_lider():
    """Sirve la interfaz táctica del líder"""
    return FileResponse(os.path.join(FRONTEND_DIR, "views", "lider_dashboard.html"))

@app.get("/dashboard/miembro")
def get_dashboard_miembro():
    """Sirve la interfaz del ecosistema del desarrollador/miembro"""
    return FileResponse(os.path.join(FRONTEND_DIR, "views", "miembro_dashboard.html"))