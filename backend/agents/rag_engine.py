import os
import google.generativeai as genai
from dotenv import load_dotenv

# Ignición del entorno
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise Exception("¡Fallo en el reactor! GEMINI_API_KEY no encontrada.")

# Configuración del motor de Inteligencia Artificial
genai.configure(api_key=GEMINI_API_KEY)

class NexusAgent:
    def __init__(self):
        # ¡Calibración exacta al modelo solicitado!
        self.modelo_ia = "gemini-3.1-flash-lite"
        self.system_instruction = (
            "Eres NexusAgent, un asistente IA proactivo para desarrolladores. "
            "Tu objetivo es resumir de forma técnica y concisa las actualizaciones de código "
            "(commits, PRs) y asignar tareas basadas en el contexto del proyecto LarvaDev."
        )
        
        self.llm = genai.GenerativeModel(
            model_name=self.modelo_ia,
            system_instruction=self.system_instruction
        )
        print(f"🧠 [NexusAgent] Núcleo {self.modelo_ia} inicializado y estable.")

    def generar_onboarding_junior(self, contexto_github: str) -> str:
        """
        Inyecta el contexto de GitHub y devuelve un resumen proactivo para Jhunnior.
        """
        prompt_termodinamico = f"""
        Analiza este registro de actividad reciente del equipo:
        {contexto_github}
        
        Redacta un mensaje de bienvenida de máximo 3 líneas indicando en qué fase 
        está el proyecto y cuál es la tarea prioritaria actual.
        """
        respuesta = self.llm.generate_content(prompt_termodinamico)
        return respuesta.text