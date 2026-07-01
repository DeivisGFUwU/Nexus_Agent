/**
 * Controlador SPA del Desarrollador (Miembro)
 * Ejecuta conexiones asíncronas reales contra el Backend de FastAPI
 */

const DevAPI = {
    // La dirección termodinámica de tu servidor FastAPI
    BASE_URL: 'http://localhost:8000/api/v1/dev',
    // Simulamos la obtención de parámetros del usuario logueado
    getCurrentTeam: () => '262e7ed8-d179-4b60-948a-3d9097a8f40c',
    getCurrentUser: () => 'dev-01'
};

const MiembroController = {
    // 🧠 Nueva variable para almacenar la firma del último commit
    ultimoEvento: null,
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

    // 🧠 El Traductor Universal (Markdown -> HTML Tailwind) BLINDADO
    formatearMensajeIA(texto) {
        if (!texto) return '';
        
        let html = texto;
        
        // 1. Limpiar la basura espacial: Múltiples saltos de línea seguidos se reducen a máximo dos
        html = html.replace(/\n{3,}/g, '\n\n');
        
        // 2. Negritas (Usamos [\s\S] para que no se rompa si Gemini mete un salto de línea dentro)
        html = html.replace(/\*\*([\s\S]*?)\*\*/g, '<strong class="text-slate-900 dark:text-white">$1</strong>');
        
        // 3. Títulos (###)
        html = html.replace(/### (.*)/g, '<h3 class="text-lg font-bold mt-4 mb-2 text-slate-900 dark:text-cyan">$1</h3>');
        
        // 4. Listas numeradas (Ej: 1. texto)
        html = html.replace(/(?:^|\n)(\d+)\.\s+(.*)/g, '\n<div class="ml-4 mb-1 flex items-start gap-2"><span class="font-bold text-blue-500 dark:text-cyan shrink-0">$1.</span><span>$2</span></div>');
        
        // 5. Listas con viñetas (* texto)
        html = html.replace(/(?:^|\n)\*\s+(.*)/g, '\n<div class="ml-4 mb-1 flex items-start gap-2"><i class="fa-solid fa-circle text-[6px] mt-2.5 text-blue-500 dark:text-cyan shrink-0"></i><span>$1</span></div>');
        
        // 6. Código en línea (`código`) - inline-block evita que se expanda a toda la pantalla
        html = html.replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-zinc-800 text-pink-500 dark:text-pink-400 px-1.5 py-0.5 rounded text-xs font-mono inline-block">$1</code>');
        
        // 7. Líneas divisorias
        html = html.replace(/---/g, '<hr class="border-slate-200 dark:border-border my-4">');

        // 8. Convertir los saltos de línea restantes en <br>
        html = html.replace(/\n/g, '<br>');
        
        // 9. Pulido final: quitar <br> generados inútilmente alrededor de bloques <div> o <h3>
        html = html.replace(/<br><div/g, '<div');
        html = html.replace(/<\/div><br>/g, '</div>');
        html = html.replace(/<\/h3><br>/g, '</h3>');
        html = html.replace(/<br>{2,}/g, '<br><br>'); // Máximo dos saltos visuales

        return html;
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
            // ⚡ RECALIBRACIÓN FÍSICA DEL CONTENEDOR ⚡
            // 1. Destruimos la alineación horizontal que aplasta el texto
            contenedorMensaje.classList.remove('flex', 'items-center', 'gap-3');
            // 2. Aplicamos gravedad vertical para que los párrafos fluyan hacia abajo
            contenedorMensaje.classList.add('flex', 'flex-col', 'gap-2');
            // Pasamos el texto crudo por nuestro decodificador antes de inyectarlo
            contenedorMensaje.innerHTML = this.formatearMensajeIA(data.agent_message);
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

            // Renderizamos los datos reales
            eventos.forEach(ev => {
                ev.color = ev.origen.toLowerCase().includes('github') ? 'emerald' : 'blue';
                this.inyectarFila(ev, false);
            });
            
            // ⚡ LÓGICA DE DETECCIÓN DE ANOMALÍAS (El nuevo cerebro del radar)
            const eventoMasReciente = eventos[0];
            // Creamos una firma única combinando el tiempo y el texto del evento
            const firmaActual = eventoMasReciente.tiempo + eventoMasReciente.evento;

            if (this.ultimoEvento === null) {
                // Primera carga: Solo guardamos la firma en la memoria sin llamar a la IA de nuevo
                this.ultimoEvento = firmaActual;
            } else if (this.ultimoEvento !== firmaActual) {
                // ¡FÍSICA APLICADA! El último evento es distinto al que recordábamos.
                console.log("⚡ ¡Nuevo pulso detectado en la matriz! Recalibrando el núcleo IA...");
                this.ultimoEvento = firmaActual;
                
                // Ponemos el contenedor en estado de carga visualmente
                document.getElementById('mensaje-onboarding').innerHTML = `
                    <i class="fa-solid fa-circle-notch fa-spin text-blue-500 dark:text-cyan"></i>
                    <span class="animate-pulse font-mono ml-2">Analizando nuevo commit con Gemini...</span>
                `;
                
                // Despertamos a Gemini para que genere el nuevo resumen
                this.cargarMensajeProactivo();
            }

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

        // El HTML inyectado ahora tiene un contenedor interactivo (onclick) y límites de ancho (max-w)
        const filaHtml = `
            <tr class="${esNueva ? 'bg-emerald-50 dark:bg-lime/5 transition-colors duration-1000 fade-in' : 'hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition'}">
                <td class="px-6 py-4 text-slate-500 dark:text-zinc-500 whitespace-nowrap">${ev.tiempo}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1.5 rounded text-xs font-bold border flex items-center gap-2 w-max ${bgClass}">
                        <i class="${icono}"></i> ${ev.origen}
                    </span>
                </td>
                <td class="px-6 py-4 text-slate-700 dark:text-zinc-300 font-medium max-w-[200px] md:max-w-sm lg:max-w-md w-full">
                    <div class="truncate cursor-pointer group" onclick="this.classList.toggle('truncate'); this.classList.toggle('whitespace-normal');" title="Clic para expandir o contraer el mensaje">
                        <span class="font-bold ${ev.color === 'emerald' ? 'text-emerald-600 dark:text-lime' : 'text-blue-600 dark:text-cyan'}">${tipoEvento}${descripcionEvento ? ':' : ''}</span> 
                        <span class="font-normal text-sm group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                            ${descripcionEvento}
                        </span>
                    </div>
                </td>
                <td class="px-6 py-4 text-right text-slate-500 dark:text-zinc-400 font-mono text-xs truncate max-w-[100px] md:max-w-[150px]" title="${ev.autor}">
                    ${ev.autor}
                </td>
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