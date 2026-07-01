from fastapi import APIRouter, HTTPException, Request
from db import supabase
from agents.rag_engine import NexusAgent

router_miembro = APIRouter(prefix="/api/v1/dev", tags=["Desarrollador Junior"])
agente_nexus = NexusAgent()

# 1. RUTA DE LECTURA DE TELEMETRÍA (La que daba 404)
@router_miembro.get("/telemetry/{team_id}")
async def obtener_telemetria(team_id: str):
    """CRUD: READ - Extrae el historial RAG real del equipo desde Supabase."""
    try:
        respuesta = supabase.table("event_logs").select("*").eq("team_id", team_id).order("created_at", desc=True).limit(10).execute()
        eventos_db = respuesta.data
        
        resultado = []
        for ev in eventos_db:
            fecha_cruda = ev.get("created_at", "")
            resultado.append({
                "tiempo": fecha_cruda[:10] if fecha_cruda else "Reciente",
                "origen": ev["source"],
                "evento": f"{ev['event_type'].capitalize()}: {ev['description']}",
                "autor": ev["author_id"]
            })
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fallo en BD: {str(e)}")

# 2. RUTA DEL AGENTE RAG (La que daba 500)
@router_miembro.get("/onboarding/{team_id}")
async def obtener_mensaje_proactivo(team_id: str):
    """CRUD: READ - Consume Gemini inyectando datos RAG REALES de Supabase."""
    try:
        respuesta = supabase.table("event_logs").select("*").eq("team_id", team_id).order("created_at", desc=True).limit(5).execute()
        eventos_db = respuesta.data
        
        if not eventos_db:
            contexto_real = "El repositorio acaba de ser inicializado. No hay commits recientes."
        else:
            lista_eventos = [f"- {ev['source']} ({ev['event_type']}): {ev['description']} por {ev['author_id']}" for ev in eventos_db]
            contexto_real = "\n".join(lista_eventos)
        
        mensaje_ia = agente_nexus.generar_onboarding_junior(contexto_real)
        
        return {
            "status": "success",
            "agent_message": mensaje_ia
        }
    except Exception as e:
        print(f"Error interno en IA: {e}")
        raise HTTPException(status_code=500, detail=f"Fallo en el núcleo IA: {str(e)}")

# 3. RUTA DEL WEBHOOK DE GITHUB
@router_miembro.post("/webhook/github")
async def recibir_webhook_github(request: Request):
    """El Receptor de Señales: Atrapa los commits de GitHub y los guarda en Supabase."""
    try:
        payload = await request.json()
        
        if "commits" in payload:
            repo_name = payload["repository"]["name"]
            commits = payload["commits"]
            
            for commit in commits:
                mensaje = commit["message"]
                autor = commit["author"].get("username", commit["author"].get("name", "Desconocido"))
                
                # Usamos el team_id quemado temporalmente para el MVP
                team_id_mvp = "25de8a3a-08dc-49a7-b93c-63096581b853" 
                
                datos_evento = {
                    "team_id": team_id_mvp,
                    "source": f"GitHub ({repo_name})",
                    "event_type": "commit",
                    "description": mensaje,
                    "author_id": autor
                }
                
                supabase.table("event_logs").insert(datos_evento).execute()
                print(f"📡 [Webhook] Señal guardada: '{mensaje}' por {autor}")
        
        return {"status": "Señal procesada termodinámicamente"}
    
    except Exception as e:
        print(f"❌ [Webhook] Fallo en recepción: {e}")
        return {"status": "Error", "detail": str(e)}