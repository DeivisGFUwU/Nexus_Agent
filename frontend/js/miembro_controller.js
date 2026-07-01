/**
 * Controlador SPA del Desarrollador (Miembro)
 * Ejecuta conexiones asíncronas reales contra el Backend de FastAPI
 */

const DevAPI = {
    // La dirección termodinámica de tu servidor FastAPI
    BASE_URL: 'http://localhost:8000/api/v1/dev',
    // Simulamos la obtención de parámetros del usuario logueado
    getCurrentTeam: () => '25de8a3a-08dc-49a7-b93c-63096581b853',
    getCurrentUser: () => 'dev-01'
};

const MiembroController = {
    async init() {
        console.log("🧪 Iniciando calibración del ecosistema del Desarrollador...");
        
        this.cargarPerfil();
        
        // Lanzamos las peticiones HTTP en paralelo para maximizar la velocidad de carga
        await Promise.all([
            this.cargarMensajeProactivo(),
            this.cargarTelemetriaHistorica()
        ]);
        
        // Reemplaza this.simularWebhookRealTime(); por esto:
        this.iniciarRadarTermodinamico();
    },

    cargarPerfil() {
        const session = JSON.parse(localStorage.getItem('nexus_session')) || { email: 'dev@empresa.com' };
        const nombreBase = session.email.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        
        document.getElementById('user-nombre').innerText = nombreBase;
        document.getElementById('avatar-iniciales').innerText = nombreBase.substring(0,2).toUpperCase();
    },

    // 1. PETICIÓN REAL: Consumo de la IA Gemini
    async cargarMensajeProactivo() {
        const contenedorMensaje = document.getElementById('mensaje-onboarding');
        const teamId = DevAPI.getCurrentTeam(); // <--- Usamos el teamId

        console.log(`📡 [GET] ${DevAPI.BASE_URL}/onboarding/${teamId} - Solicitando contexto a la IA...`);

        try {
            const respuesta = await fetch(`${DevAPI.BASE_URL}/onboarding/${teamId}`);
            if (!respuesta.ok) throw new Error(`HTTP Error: ${respuesta.status}`);
            
            const data = await respuesta.json();

            // Inyección del texto procesado por Gemini 3.1 Flash Lite en el DOM
            contenedorMensaje.innerHTML = data.agent_message;
            console.log("✅ [NexusAgent] Mensaje de Onboarding inyectado exitosamente.");

        } catch (error) {
            console.error("❌ Fallo en la comunicación con la IA:", error);
            // Mensaje de respaldo de seguridad por si el servidor backend está apagado
            contenedorMensaje.innerHTML = `
                <span class="text-red-500 flex items-center gap-2">
                    <i class="fa-solid fa-triangle-exclamation"></i> 
                    El servidor FastAPI está desconectado. Levanta el reactor backend para conectar con Gemini.
                </span>
            `;
        }
    },

    // 2. PETICIÓN REAL: Lectura del Historial de Supabase
    async cargarTelemetriaHistorica() {
        const tbody = document.getElementById('tabla-telemetria');
        const teamId = DevAPI.getCurrentTeam();

        console.log(`📡 [GET] ${DevAPI.BASE_URL}/telemetry/${teamId} - Extrayendo vectores RAG...`);

        try {
            const respuesta = await fetch(`${DevAPI.BASE_URL}/telemetry/${teamId}`);
            if (!respuesta.ok) throw new Error(`HTTP Error: ${respuesta.status}`);
            
            const eventos = await respuesta.json();
            
            tbody.innerHTML = ''; // Limpiamos el loader

            if(eventos.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-slate-500">No hay actividad registrada en este nodo.</td></tr>`;
                return;
            }

            // Renderizamos los datos reales provenientes de la API
            eventos.forEach(ev => {
                // Asignamos colores según origen para mantener la termodinámica visual
                ev.color = ev.origen.toLowerCase().includes('github') ? 'emerald' : 'blue';
                this.inyectarFila(ev, false);
            });
            
            console.log("✅ [Telemetría] Historial renderizado exitosamente.");

        } catch (error) {
            console.error("❌ Fallo en la extracción de telemetría:", error);
            tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-red-500 font-mono text-xs">Error de conexión con el Backend</td></tr>`;
        }
    },

    // 3. INYECCIÓN DEL DOM Y ESTILO VISUAL
    inyectarFila(ev, esNueva = true) {
        const tbody = document.getElementById('tabla-telemetria');
        const icono = ev.color === 'emerald' ? 'fa-brands fa-github' : 'fa-solid fa-book-bookmark';
        const bgClass = ev.color === 'emerald' ? 'bg-emerald-100 text-emerald-700 dark:bg-lime/20 dark:text-lime border-emerald-200 dark:border-lime/30' : 'bg-blue-100 text-blue-700 dark:bg-cyan/20 dark:text-cyan border-blue-200 dark:border-cyan/30';
        
        // Separamos el "tipo de evento" de la "descripción" si vienen juntos con ":"
        let partesEvento = ev.evento.split(':');
        let tipoEvento = partesEvento[0];
        let descripcionEvento = partesEvento.slice(1).join(':') || '';

        const filaHtml = `
            <tr class="${esNueva ? 'bg-emerald-50 dark:bg-lime/5 transition-colors duration-1000 fade-in' : 'hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition'}">
                <td class="px-6 py-4 text-slate-500 dark:text-zinc-500">${ev.tiempo}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1.5 rounded text-xs font-bold border flex items-center gap-2 w-max ${bgClass}">
                        <i class="${icono}"></i> ${ev.origen}
                    </span>
                </td>
                <td class="px-6 py-4 text-slate-700 dark:text-zinc-300 font-medium">
                    <span class="font-bold ${ev.color === 'emerald' ? 'text-emerald-600 dark:text-lime' : 'text-blue-600 dark:text-cyan'}">${tipoEvento}${descripcionEvento ? ':' : ''}</span> 
                    ${descripcionEvento}
                </td>
                <td class="px-6 py-4 text-right text-slate-500 dark:text-zinc-400 font-mono text-xs">${ev.autor}</td>
            </tr>
        `;

        if (esNueva) {
            tbody.insertAdjacentHTML('afterbegin', filaHtml);
            
            // Efecto térmico de decaimiento: Remover la clase de resaltado después de 2 segundos
            setTimeout(() => {
                const nuevaFila = tbody.firstElementChild;
                if(nuevaFila) {
                    nuevaFila.classList.remove('bg-emerald-50', 'dark:bg-lime/5');
                    nuevaFila.classList.add('hover:bg-slate-50', 'dark:hover:bg-zinc-800/30');
                }
            }, 2000);
        } else {
            tbody.insertAdjacentHTML('beforeend', filaHtml);
        }
    },

    // El nuevo Radar Termodinámico que hace sondeos a la BD real
    iniciarRadarTermodinamico() {
        console.log("⚡ [Radar] Iniciando escaneo de la matriz cada 10 segundos...");
        
        setInterval(() => {
            // Actualiza la tabla silenciosamente buscando nuevos eventos del webhook
            this.cargarTelemetriaHistorica();
            
            // Nota opcional: Podríamos llamar a cargarMensajeProactivo() aquí también
            // pero consumiríamos mucha API de Gemini. Mejor solo actualizar la tabla por ahora.
        }, 10000); // 10,000 milisegundos = 10 segundos
    }
};

document.addEventListener('DOMContentLoaded', () => { MiembroController.init(); });