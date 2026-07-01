from fastapi import APIRouter, HTTPException
from db import supabase
from agents.rag_engine import NexusAgent

router_miembro = APIRouter(prefix="/api/v1/dev", tags=["Desarrollador Junior"])
agente_nexus = NexusAgent()

# ... (Tu código de /telemetry se queda igual) ...

@router_miembro.get("/onboarding/{team_id}")
async def obtener_mensaje_proactivo(team_id: str):
    """CRUD: READ - Consume Gemini inyectando datos RAG REALES de Supabase."""
    try:
        # 1. Extraemos los últimos eventos REALES del equipo
        respuesta = supabase.table("event_logs").select("*").eq("team_id", team_id).order("created_at", desc=True).limit(5).execute()
        eventos_db = respuesta.data
        
        # 2. Si no hay eventos, le damos un contexto vacío pero real
        if not eventos_db:
            contexto_real = "El repositorio acaba de ser inicializado. No hay commits recientes."
        else:
            # 3. Concatenamos los eventos en un bloque de texto (El verdadero RAG)
            lista_eventos = [f"- {ev['source']} ({ev['event_type']}): {ev['description']} por {ev['author_id']}" for ev in eventos_db]
            contexto_real = "\n".join(lista_eventos)
        
        # 4. Llamada al motor con el combustible real
        mensaje_ia = agente_nexus.generar_onboarding_junior(contexto_real)
        
        return {
            "status": "success",
            "agent_message": mensaje_ia
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fallo en el núcleo IA: {str(e)}")
    
@router_miembro.post("/webhook/github")
async def recibir_webhook_github(request: Request):
    """El Receptor de Señales: Atrapa los commits de GitHub y los guarda en Supabase."""
    try:
        # 1. Capturar el paquete de datos crudo de GitHub
        payload = await request.json()
        
        # 2. Analizar la anatomía del payload buscando el evento 'push'
        if "commits" in payload:
            repo_name = payload["repository"]["name"]
            commits = payload["commits"]
            
            for commit in commits:
                mensaje = commit["message"]
                # GitHub envía el autor de dos formas posibles, aseguramos capturar una
                autor = commit["author"].get("username", commit["author"].get("name", "Desconocido"))
                
                # 3. Forjamos el registro para Supabase
                # Usamos el team_id quemado temporalmente para el MVP
                team_id_mvp = "25de8a3a-08dc-49a7-b93c-63096581b853" 
                
                datos_evento = {
                    "team_id": team_id_mvp,
                    "source": f"GitHub ({repo_name})",
                    "event_type": "commit",
                    "description": mensaje,
                    "author_id": autor
                }
                
                # 4. Inyectamos en el núcleo de la base de datos
                supabase.table("event_logs").insert(datos_evento).execute()
                print(f"📡 [Webhook] Señal recibida y guardada: '{mensaje}' por {autor}")
        
        return {"status": "Señal procesada termodinámicamente"}
    
    except Exception as e:
        print(f"❌ [Webhook] Fallo en la matriz de recepción: {e}")
        return {"status": "Error", "detail": str(e)}