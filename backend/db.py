import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Ignición del entorno
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("¡Alerta Termodinámica! Faltan las llaves de Supabase en el archivo .env")

# Instanciamos el cliente global de Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("🔗 [Base de Datos] Conexión al núcleo de Supabase establecida con éxito.")