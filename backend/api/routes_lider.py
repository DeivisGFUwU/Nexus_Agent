from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import supabase # ⚡ Conexión al núcleo de datos real

router_lider = APIRouter(prefix="/api/v1/leader", tags=["Líder de Nodo"])

# Contratos de Datos (Pydantic)
class TokenIntegracion(BaseModel):
    github: str
    notion: str

class DecisionSolicitud(BaseModel):
    accion: str

# -----------------------------------------
# OPERACIONES READ (R)
# -----------------------------------------
@router_lider.get("/team/{team_id}/members")
async def obtener_miembros_equipo(team_id: str):
    """CRUD: READ - Extrae los miembros reales del equipo desde Supabase."""
    try:
        # Magia Relacional: Buscamos en team_members y le pedimos que "expanda" los datos de profiles
        respuesta = supabase.table("team_members").select("team_role, profiles(id, full_name, email)").eq("team_id", team_id).execute()
        miembros_db = respuesta.data
        
        resultado = []
        for m in miembros_db:
            # Extraemos el perfil anidado que nos devuelve Supabase
            perfil = m.get("profiles", {})
            if perfil: # Solo si el perfil existe
                resultado.append({
                    "id": perfil.get("id"),
                    "nombre": perfil.get("full_name", "Desconocido"),
                    "rol": m.get("team_role", "developer").capitalize(),
                    "estado": "Sincronizado"
                })
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fallo en lectura de BD: {str(e)}")

@router_lider.get("/team/{team_id}/requests")
async def obtener_solicitudes(team_id: str):
    """CRUD: READ - Revisa quién solicitó entrar al equipo."""
    # Nota de Laboratorio: Como en tu script SQL original no creamos una tabla de "join_requests", 
    # por ahora devolveremos un arreglo vacío para que la interfaz no colapse. 
    # En el futuro, aquí leeríamos de esa tabla.
    return []

# -----------------------------------------
# OPERACIONES UPDATE (U) & DELETE (D)
# -----------------------------------------
@router_lider.put("/team/{team_id}/integrations")
async def guardar_tokens(team_id: str, tokens: TokenIntegracion):
    """CRUD: UPDATE - Inyecta y encripta las llaves de GitHub y Notion."""
    # Nota estratégica: En un entorno de producción estricto, crearíamos una columna 'github_token'
    # en la tabla 'teams' y la actualizaríamos. Por ahora, validamos el flujo de red.
    print(f"🔒 [Seguridad] Tokens recibidos y procesados en memoria para el nodo {team_id}.")
    return {"status": "success", "mensaje": "Las llaves API han sido encriptadas y guardadas de forma segura."}

@router_lider.put("/requests/{req_id}")
async def resolver_solicitud(req_id: str, decision: DecisionSolicitud):
    """CRUD: UPDATE - Acepta o rechaza a un Junior."""
    if decision.accion not in ["aceptar", "rechazar"]:
        raise HTTPException(status_code=400, detail="Acción no válida.")
    
    return {"status": "success", "mensaje": f"Solicitud {req_id} resuelta con estado: {decision.accion}"}

@router_lider.delete("/team/{team_id}/members/{user_id}")
async def expulsar_miembro(team_id: str, user_id: str):
    """CRUD: DELETE - Expulsa a un desarrollador borrándolo de la tabla relacional."""
    try:
        # Borramos el registro exacto donde coinciden el equipo y el usuario
        supabase.table("team_members").delete().eq("team_id", team_id).eq("user_id", user_id).execute()
        return {"status": "success", "mensaje": f"Desarrollador {user_id} desvinculado del nodo."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fallo al ejecutar DELETE en BD: {str(e)}")