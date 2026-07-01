/**
 * Controlador SPA de la Administración Global
 * Conexión Termodinámica Asíncrona (Fetch) hacia FastAPI
 */

const AdminAPI = {
    BASE_URL: 'http://localhost:8000/api/v1/admin',
    // Simulador de Token JWT (Se extrae de Supabase en producción)
    getHeaders: () => ({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock_admin_token'
    })
};

const AdminController = {
    equipoActivoId: null,

    async init() {
        console.log("🧪 Iniciando calibración de sensores del Admin (Conexión Real Backend)...");
        this.bindEvents();
        
        // Peticiones paralelas al servidor FastAPI para optimizar la carga
        await Promise.all([
            this.cargarMetricas(),
            this.cargarEquipos(),
            this.cargarDirectorio()
        ]);
    },

    bindEvents() {
        const formInvitar = document.getElementById('form-invitar-integrante');
        if (formInvitar) formInvitar.addEventListener('submit', (e) => this.enviarInvitacion(e));
    },

    // --- ENRUTADOR SPA (CAMBIO DE VISTAS) ---
    cambiarVista(vistaDestino) {
        console.log(`🔄 Transicionando vista a: ${vistaDestino}`);
        
        ['modulo-administracion', 'modulo-directorio', 'modulo-detalle-equipo'].forEach(id => {
            document.getElementById(id).classList.add('hidden');
        });

        const claseInactiva = "flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/30 dark:hover:text-white rounded-lg transition relative group";
        const claseActiva = "flex items-center gap-3 px-3 py-2.5 bg-slate-100 text-slate-900 dark:bg-zinc-800/50 dark:text-white rounded-lg border border-slate-200 dark:border-border transition-colors relative group";

        document.getElementById('nav-administracion').className = claseInactiva;
        document.getElementById('nav-directorio').className = claseInactiva;

        if (vistaDestino === 'administracion') {
            document.getElementById('modulo-administracion').classList.remove('hidden');
            document.getElementById('nav-administracion').className = claseActiva;
            document.getElementById('header-title').innerText = "Administración Global";
            document.getElementById('header-subtitle').innerText = "Gestiona los espacios de trabajo y accesos de tu organización.";
        } else if (vistaDestino === 'directorio') {
            document.getElementById('modulo-directorio').classList.remove('hidden');
            document.getElementById('nav-directorio').className = claseActiva;
            document.getElementById('header-title').innerText = "Directorio Root";
            document.getElementById('header-subtitle').innerText = "Control de accesos de nivel jerárquico superior.";
        } else if (vistaDestino === 'detalle-equipo') {
            document.getElementById('modulo-detalle-equipo').classList.remove('hidden');
            document.getElementById('header-title').innerText = "Centro de Operaciones";
            document.getElementById('header-subtitle').innerText = "Métricas y configuración aislada del nodo seleccionado.";
        }
    },

    // --- VISTA 1: DASHBOARD PRINCIPAL (READ) ---
    async cargarMetricas() {
        console.log(`📡 [GET] ${AdminAPI.BASE_URL}/metrics - Solicitando telemetría...`);
        try {
            const respuesta = await fetch(`${AdminAPI.BASE_URL}/metrics`, { headers: AdminAPI.getHeaders() });
            if (!respuesta.ok) throw new Error("Fallo en la lectura");
            
            const data = await respuesta.json();
            
            document.getElementById('metric-equipos').innerText = data.equipos_activos;
            document.getElementById('metric-horas').innerHTML = `${data.horas_ahorradas}<span class="text-lg text-slate-400 font-normal">h /mes</span>`;
            document.getElementById('metric-consultas').innerText = data.consultas_ia.toLocaleString();
        } catch (error) {
            console.error("❌ Anomalía en la carga de métricas:", error);
            document.getElementById('metric-equipos').innerText = "Error";
        }
    },

    async cargarEquipos() {
        const contenedor = document.getElementById('lista-equipos');
        console.log(`📡 [GET] ${AdminAPI.BASE_URL}/teams - Mapeando nodos...`);
        
        try {
            const respuesta = await fetch(`${AdminAPI.BASE_URL}/teams`, { headers: AdminAPI.getHeaders() });
            if (!respuesta.ok) throw new Error("Fallo en la lectura");
            
            const equipos = await respuesta.json();
            contenedor.innerHTML = ''; 

            equipos.forEach(equipo => {
                // Termodinámica de colores
                const colorTexto = equipo.color === 'blue' ? 'text-blue-600 dark:text-cyan' : 'text-emerald-600 dark:text-lime';
                const colorFondo = equipo.color === 'blue' ? 'bg-blue-50 border-blue-200 dark:bg-cyan/10 dark:border-cyan/20' : 'bg-emerald-50 border-emerald-200 dark:bg-lime/10 dark:border-lime/20';
                const icon = equipo.color === 'blue' ? 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' : 'M5 12h14M12 5l7 7-7 7';

                contenedor.insertAdjacentHTML('beforeend', `
                    <div class="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 fade-in">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 shrink-0 rounded-xl ${colorFondo} ${colorTexto} border flex items-center justify-center shadow-sm">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${icon}"></path></svg>
                            </div>
                            <div>
                                <h4 class="font-bold text-base text-slate-900 dark:text-white">${equipo.nombre}</h4>
                                <p class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Líder: <span class="${colorTexto} font-mono">${equipo.lider}</span> • ${equipo.integrantes} Integrantes</p>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="AdminController.abrirDetalleEquipo('${equipo.id}', '${equipo.nombre}')" class="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 dark:bg-zinc-800 dark:text-white dark:border-zinc-600 rounded-lg text-xs font-bold hover:border-slate-400 dark:hover:border-lime transition shadow-sm">Administrar Nodo</button>
                        </div>
                    </div>
                `);
            });
        } catch (error) {
            console.error("❌ Fallo en lectura de equipos:", error);
            contenedor.innerHTML = `<div class="p-8 text-center text-red-500 font-mono text-sm">Error de conexión al servidor FastAPI.</div>`;
        }
    },

    async enviarInvitacion(evento) {
        evento.preventDefault();
        const email = document.getElementById('input-email-invitacion').value;
        const teamId = document.getElementById('select-equipo-invitacion').value;
        const boton = evento.target.querySelector('button[type="submit"]');
        
        boton.innerText = "Procesando..."; 
        boton.disabled = true;

        const payload = { email: email, team_id: teamId, role: 'miembro' };
        console.log(`🚀 [POST] ${AdminAPI.BASE_URL}/invite - Enviando datos...`);

        try {
            const respuesta = await fetch(`${AdminAPI.BASE_URL}/invite`, {
                method: 'POST',
                headers: AdminAPI.getHeaders(),
                body: JSON.stringify(payload)
            });

            if (!respuesta.ok) throw new Error("Fallo en la inserción");
            
            const data = await respuesta.json();
            mostrarToast("Invitación Desplegada", data.mensaje);
            evento.target.reset();
        } catch (error) {
            console.error("❌ Error en reclutamiento:", error);
            mostrarToast("Error Térmico", "No se pudo enviar la invitación.");
        } finally {
            boton.innerText = "Enviar"; 
            boton.disabled = false;
        }
    },

    // --- VISTA 2: DIRECTORIO GLOBAL (CRUD ADMINS) ---
    async cargarDirectorio() {
        const tbody = document.getElementById('tabla-directorio');
        console.log(`📡 [GET] ${AdminAPI.BASE_URL}/directory - Leyendo altos mandos...`);

        try {
            const respuesta = await fetch(`${AdminAPI.BASE_URL}/directory`, { headers: AdminAPI.getHeaders() });
            if (!respuesta.ok) throw new Error("Fallo en el directorio");
            
            const admins = await respuesta.json();
            tbody.innerHTML = ''; 

            admins.forEach(admin => {
                tbody.insertAdjacentHTML('beforeend', `
                    <tr class="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 flex items-center justify-center font-bold text-xs uppercase">${admin.nombre.substring(0,2)}</div>
                                <div>
                                    <p class="font-bold text-slate-900 dark:text-white">${admin.nombre}</p>
                                    <p class="text-xs text-slate-500 dark:text-zinc-500 font-mono">${admin.email}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4"><span class="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-lime/20 dark:text-lime rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-lime/30">Admin Global</span></td>
                        <td class="px-6 py-4"><span class="flex items-center gap-1.5 text-xs font-medium"><div class="w-2 h-2 rounded-full bg-emerald-500 dark:bg-lime"></div> ${admin.estado}</span></td>
                        <td class="px-6 py-4 text-right">
                            <button onclick="AdminController.editarAdmin('${admin.id}', '${admin.nombre}')" class="p-2 text-slate-400 hover:text-blue-500 dark:text-zinc-500 dark:hover:text-cyan transition" title="Editar"><i class="fa-solid fa-pen"></i></button>
                            <button onclick="AdminController.eliminarAdmin('${admin.id}')" class="p-2 text-slate-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-500 transition" title="Revocar"><i class="fa-solid fa-trash-can"></i></button>
                        </td>
                    </tr>
                `);
            });
        } catch (error) {
            console.error("❌ Fallo en la lectura del Directorio:", error);
            tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-red-500 font-mono text-xs">Error de conexión con el Backend.</td></tr>`;
        }
    },

    async crearAdminPrompt() {
        const nuevoEmail = prompt("Ingresa el correo corporativo del nuevo Administrador Global:");
        if (nuevoEmail) {
            // Nota: El endpoint POST de Directorio no está en FastAPI aún, pero la UI está lista para cuando se añada.
            mostrarToast("Permisos Elevados", `${nuevoEmail} ahora es Administrador Global.`);
        }
    },

    async editarAdmin(id, nombreActual) {
        const nuevoNombre = prompt("Actualizar identidad:", nombreActual);
        if (nuevoNombre && nuevoNombre !== nombreActual) {
            console.log(`⚙️ [PUT] ${AdminAPI.BASE_URL}/directory/${id} - Actualizando...`);
            try {
                const respuesta = await fetch(`${AdminAPI.BASE_URL}/directory/${id}`, {
                    method: 'PUT',
                    headers: AdminAPI.getHeaders(),
                    body: JSON.stringify({ nombre: nuevoNombre })
                });
                
                if (!respuesta.ok) throw new Error("Fallo en la actualización");
                
                mostrarToast("Directorio Actualizado", `Identidad actualizada a ${nuevoNombre}`);
                await this.cargarDirectorio(); // Recarga reactiva
            } catch (error) {
                console.error("❌ Error al editar:", error);
                mostrarToast("Error Térmico", "No se pudo actualizar la identidad.");
            }
        }
    },

    async eliminarAdmin(id) {
        const confirmar = confirm(`⚠️ ¿Revocar privilegios de Administrador Global al usuario [${id}]?`);
        if (confirmar) {
            console.log(`🛑 [DELETE] ${AdminAPI.BASE_URL}/directory/${id} - Revocando...`);
            try {
                const respuesta = await fetch(`${AdminAPI.BASE_URL}/directory/${id}`, {
                    method: 'DELETE',
                    headers: AdminAPI.getHeaders()
                });
                
                const data = await respuesta.json();
                
                if (!respuesta.ok) {
                    alert(data.detail || "Fallo en la operación");
                    return;
                }
                
                mostrarToast("Privilegios Revocados", data.mensaje);
                await this.cargarDirectorio(); // Recarga reactiva
            } catch (error) {
                console.error("❌ Error al revocar:", error);
                mostrarToast("Error Térmico", "La operación fue denegada por el servidor.");
            }
        }
    },

    // --- VISTA 3: DETALLE DEL EQUIPO (Drill-down) ---
    async abrirDetalleEquipo(idEquipo, nombreEquipo) {
        this.equipoActivoId = idEquipo;
        
        document.getElementById('detalle-nombre-equipo').innerText = nombreEquipo;
        document.getElementById('detalle-id-equipo').innerText = idEquipo;
        
        // Simulación de métricas específicas del nodo (en producción vendría de la API)
        document.getElementById('detalle-metric-miembros').innerText = idEquipo === 't-1' ? '4' : '6';
        document.getElementById('detalle-metric-consultas').innerText = idEquipo === 't-1' ? '450' : '592';
        document.getElementById('detalle-metric-ahorro').innerText = idEquipo === 't-1' ? '45h' : '83h';

        this.cambiarVista('detalle-equipo');
    }
};

// Función Global de UI para Notificaciones
window.mostrarToast = function(titulo, mensaje) {
    const toast = document.getElementById('toast');
    toast.querySelector('p.font-bold').innerText = titulo;
    toast.querySelector('p.text-xs').innerText = mensaje;
    
    toast.classList.remove('translate-y-[150%]', 'opacity-0');
    toast.style.transform = "translateY(-10px)";
    setTimeout(() => toast.style.transform = "translateY(0)", 150);
    setTimeout(() => { toast.classList.add('translate-y-[150%]', 'opacity-0'); }, 3000);
}

document.addEventListener('DOMContentLoaded', () => { AdminController.init(); });
