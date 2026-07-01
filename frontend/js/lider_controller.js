/**
 * Controlador SPA - Rol: Líder de Nodo (Team Lead)
 * Conexión Asíncrona (Fetch) hacia la API REST de FastAPI
 */

const LiderAPI = {
    BASE_URL: 'http://localhost:8000/api/v1/leader',
    // Simulamos la obtención del ID de equipo desde el JWT del usuario
    getTeamId: () => '262e7ed8-d179-4b60-948a-3d9097a8f40c' 
};

const LiderController = {
    async init() {
        console.log("🧪 Iniciando calibración del nodo de Líder (Conexión Real Backend)...");
        this.bindEvents();
        
        // Peticiones paralelas para mayor eficiencia de carga
        await Promise.all([
            this.cargarDashboardMetricas(),
            this.cargarSolicitudes(),
            this.cargarMiembros()
        ]);
    },

    bindEvents() {
        document.getElementById('form-integraciones').addEventListener('submit', (e) => this.guardarTokens(e));
    },

    // --- ENRUTADOR SPA ---
    cambiarVista(vistaDestino) {
        console.log(`🔄 Conmutando a interfaz: ${vistaDestino}`);
        
        ['modulo-resumen', 'modulo-nodos', 'modulo-auditoria'].forEach(id => {
            document.getElementById(id).classList.add('hidden');
        });

        ['nav-resumen', 'nav-nodos', 'nav-auditoria'].forEach(id => {
            document.getElementById(id).className = "flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/30 dark:hover:text-white rounded-lg transition relative group";
        });

        const activeClass = "flex items-center gap-3 px-3 py-2.5 bg-slate-100 text-slate-900 dark:bg-zinc-800/50 dark:text-white rounded-lg border border-slate-200 dark:border-border transition-colors relative group";

        document.getElementById(`modulo-${vistaDestino}`).classList.remove('hidden');
        document.getElementById(`nav-${vistaDestino}`).className = activeClass;

        if(vistaDestino === 'auditoria') this.cargarTelemetria(); // Lazy Loading
    },

    // --- VISTA 1: DASHBOARD Y CRUD DE MIEMBROS ---
    async cargarDashboardMetricas() {
        // En un entorno 100% real, esto también vendría de un fetch
        document.getElementById('metric-ahorro').innerHTML = `42<span class="text-sm text-slate-400 font-normal ml-1">h /mes</span>`;
        document.getElementById('metric-vectores').innerText = '15,402';
    },

    async cargarSolicitudes() {
        const teamId = LiderAPI.getTeamId();
        const contenedor = document.getElementById('lista-solicitudes');
        
        console.log(`📡 [GET] ${LiderAPI.BASE_URL}/team/${teamId}/requests - Buscando solicitudes...`);

        try {
            const respuesta = await fetch(`${LiderAPI.BASE_URL}/team/${teamId}/requests`);
            if (!respuesta.ok) throw new Error("Fallo en la red");
            
            const solicitudes = await respuesta.json();
            document.getElementById('contador-solicitudes').innerText = solicitudes.length;
            contenedor.innerHTML = '';

            if(solicitudes.length === 0) {
                contenedor.innerHTML = `<div class="text-center text-xs text-slate-400 py-4">No hay solicitudes pendientes.</div>`;
                return;
            }

            solicitudes.forEach(req => {
                contenedor.insertAdjacentHTML('beforeend', `
                    <div id="${req.id}" class="p-3 bg-white border border-slate-200 dark:bg-base dark:border-border rounded-xl flex justify-between items-center transition-colors">
                        <div><p class="text-sm font-bold text-slate-900 dark:text-white">${req.email}</p><p class="text-xs text-slate-500 dark:text-zinc-500">${req.tiempo}</p></div>
                        <div class="flex gap-2">
                            <button onclick="LiderController.resolverSolicitud('${req.id}', '${req.email}', 'aceptar')" class="px-3 py-1 bg-slate-900 text-white dark:bg-cyan dark:text-base rounded-md text-xs font-bold hover:opacity-90">Aceptar</button>
                            <button onclick="LiderController.resolverSolicitud('${req.id}', '${req.email}', 'rechazar')" class="px-3 py-1 bg-slate-100 text-slate-700 hover:text-red-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:text-red-400 rounded-md text-xs font-bold transition">Rechazar</button>
                        </div>
                    </div>
                `);
            });
        } catch (error) {
            console.error("❌ Fallo crítico al cargar solicitudes:", error);
            contenedor.innerHTML = `<div class="text-center text-xs text-red-500 py-4">Error de conexión al servidor (localhost:8000)</div>`;
        }
    },

    async resolverSolicitud(reqId, email, accion) {
        console.log(`🚀 [PUT] ${LiderAPI.BASE_URL}/requests/${reqId} - Ejecutando acción: ${accion}`);
        
        try {
            const respuesta = await fetch(`${LiderAPI.BASE_URL}/requests/${reqId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accion: accion })
            });

            if (!respuesta.ok) throw new Error("Fallo en la resolución");

            document.getElementById(reqId).remove();
            let count = parseInt(document.getElementById('contador-solicitudes').innerText);
            document.getElementById('contador-solicitudes').innerText = Math.max(0, count - 1);

            if (accion === 'aceptar') {
                mostrarToast("Acesso Concedido", `NexusAgent ha enviado el Onboarding a ${email}.`);
                this.cargarMiembros(); // Recargar la matriz para ver al nuevo miembro
            } else {
                mostrarToast("Solicitud Rechazada", `Se denegó el acceso al nodo.`);
            }
        } catch (error) {
            console.error("❌ Error al resolver solicitud:", error);
            mostrarToast("Error Térmico", "No se pudo completar la operación.");
        }
    },

    async cargarMiembros() {
        const teamId = LiderAPI.getTeamId();
        const tbody = document.getElementById('tabla-miembros');
        
        console.log(`📡 [GET] ${LiderAPI.BASE_URL}/team/${teamId}/members - Extrayendo matriz...`);

        try {
            const respuesta = await fetch(`${LiderAPI.BASE_URL}/team/${teamId}/members`);
            if (!respuesta.ok) throw new Error("Fallo en la red");
            
            const miembros = await respuesta.json();
            tbody.innerHTML = '';
            
            miembros.forEach(m => {
                const icono = m.estado === 'Sincronizado' ? 'fa-check text-emerald-500' : 'fa-circle-notch fa-spin text-blue-500';
                tbody.insertAdjacentHTML('beforeend', `
                    <tr class="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition group">
                        <td class="px-6 py-4 font-bold text-slate-900 dark:text-white">${m.nombre}</td>
                        <td class="px-6 py-4 font-mono text-xs text-blue-600 dark:text-cyan">${m.rol}</td>
                        <td class="px-6 py-4"><span class="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400"><i class="fa-solid ${icono}"></i> ${m.estado}</span></td>
                        <td class="px-6 py-4 text-right">
                            <button onclick="LiderController.eliminarMiembro('${m.id}', '${m.nombre}')" class="text-xs text-slate-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-500 px-2 py-1 transition">Revocar</button>
                        </td>
                    </tr>
                `);
            });
        } catch (error) {
            console.error("❌ Fallo crítico al cargar miembros:", error);
            tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-red-500 font-mono text-xs">Error de conexión al servidor Backend.</td></tr>`;
        }
    },

    async eliminarMiembro(userId, nombre) {
        if(!confirm(`⚠️ ¿Desvincular a ${nombre} del nodo? Perderá acceso al Agente RAG.`)) return;

        const teamId = LiderAPI.getTeamId();
        console.log(`🛑 [DELETE] ${LiderAPI.BASE_URL}/team/${teamId}/members/${userId} - Revocando acceso...`);

        try {
            const respuesta = await fetch(`${LiderAPI.BASE_URL}/team/${teamId}/members/${userId}`, { method: 'DELETE' });
            if (!respuesta.ok) throw new Error("Error en la eliminación");
            
            mostrarToast("Acceso Revocado", "El usuario ha sido expulsado del nodo.");
            this.cargarMiembros(); 
        } catch (error) {
            console.error("❌ Error al revocar acceso:", error);
            mostrarToast("Error Térmico", "La operación de borrado falló.");
        }
    },

    // --- VISTA 2: CONFIGURACIÓN DE INTEGRACIONES (CRUD) ---
    async guardarTokens(evento) {
        evento.preventDefault();
        const btn = evento.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Encriptando...`;
        btn.disabled = true;
        
        const payload = {
            github: document.getElementById('token-github').value,
            notion: document.getElementById('token-notion').value
        };

        const teamId = LiderAPI.getTeamId();
        console.log(`🔒 [PUT] ${LiderAPI.BASE_URL}/team/${teamId}/integrations - Inyectando tokens...`);

        try {
            const respuesta = await fetch(`${LiderAPI.BASE_URL}/team/${teamId}/integrations`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!respuesta.ok) throw new Error("Fallo al guardar");

            mostrarToast("Nodos Conectados", "Las llaves API han sido encriptadas y guardadas. Ingesta iniciada.");
            evento.target.reset();
        } catch (error) {
            console.error("❌ Error en la encriptación:", error);
            mostrarToast("Error Térmico", "No se pudieron conectar las fuentes de verdad.");
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    },

    // --- VISTA 3: AUDITORÍA (TELEMETRÍA) ---
    async cargarTelemetria() {
        const tbody = document.getElementById('tabla-telemetria');
        
        // En esta vista el Líder consume el mismo endpoint que el Desarrollador (routes_miembro.py) 
        // ya que la tabla de telemetría es compartida por todo el nodo.
        const endpoint = `http://localhost:8000/api/v1/dev/telemetry/${LiderAPI.getTeamId()}`;
        console.log(`📡 [GET] ${endpoint} - Escaneando radar...`);

        try {
            const respuesta = await fetch(endpoint);
            if (!respuesta.ok) throw new Error("Fallo en la lectura RAG");
            
            const eventos = await respuesta.json();
            tbody.innerHTML = '';

            if (eventos.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-slate-500">No hay inyección de datos aún.</td></tr>`;
                return;
            }

            eventos.forEach(ev => {
                const icono = ev.origen === 'GitHub' ? 'fa-brands fa-github' : 'fa-solid fa-book-bookmark';
                const color = ev.origen === 'GitHub' ? 'emerald' : 'blue';
                const bgClass = color === 'emerald' ? 'bg-emerald-100 text-emerald-700 dark:bg-lime/20 dark:text-lime border-emerald-200 dark:border-lime/30' : 'bg-blue-100 text-blue-700 dark:bg-cyan/20 dark:text-cyan border-blue-200 dark:border-cyan/30';
                
                tbody.insertAdjacentHTML('beforeend', `
                    <tr class="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition fade-in">
                        <td class="px-6 py-4 text-slate-500 dark:text-zinc-500">${ev.tiempo}</td>
                        <td class="px-6 py-4"><span class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-2 w-max ${bgClass}"><i class="${icono}"></i> ${ev.origen}</span></td>
                        <td class="px-6 py-4 text-slate-700 dark:text-zinc-300 font-medium">${ev.evento}</td>
                        <td class="px-6 py-4 text-right text-slate-500 dark:text-zinc-400 font-mono text-xs">${ev.autor}</td>
                    </tr>
                `);
            });
        } catch (error) {
            console.error("❌ Fallo en la lectura del radar:", error);
            tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-red-500 font-mono text-xs">Radar offline. Conexión a localhost:8000 fallida.</td></tr>`;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => { LiderController.init(); });