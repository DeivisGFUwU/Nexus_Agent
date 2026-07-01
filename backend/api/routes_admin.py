from fastapi import APIRouter, HTTPException
from db import supabase # Importamos nuestro centro de distribución

router_admin = APIRouter(prefix="/api/v1/admin", tags=["Administración Global"])

@router_admin.get("/directory")
async def leer_directorio():
    """CRUD: READ - Obtiene los altos mandos desde la base de datos real."""
    try:
        # Consulta SQL a través del ORM de Supabase: SELECT * FROM profiles WHERE global_role = 'empresa'
        respuesta = supabase.table("profiles").select("*").eq("global_role", "empresa").execute()
        admins_db = respuesta.data
        
        # Mapeamos los datos de la BD al formato que espera nuestro Frontend
        resultado_formateado = []
        for admin in admins_db:
            resultado_formateado.append({
                "id": admin["id"],
                "nombre": admin["full_name"],
                "email": admin["email"],
                "estado": admin["estado"] if "estado" in admin else "Activo"
            })
            
        return resultado_formateado
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fallo en lectura de BD: {str(e)}")

@router_admin.get("/teams")
async def obtener_equipos():
    """CRUD: READ - Lee los nodos de trabajo desde Supabase."""
    try:
        respuesta = supabase.table("teams").select("*").execute()
        equipos_db = respuesta.data
        
        resultado = []
        for eq in equipos_db:
            resultado.append({
                "id": eq["id"],
                "nombre": eq["name"],
                "lider": "Líder de Nodo", # En el futuro haremos un JOIN con team_members
                "integrantes": 1, 
                "color": "blue"
            })
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fallo en lectura de BD: {str(e)}")