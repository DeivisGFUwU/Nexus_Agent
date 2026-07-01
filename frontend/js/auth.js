/**
 * Controlador de Autenticación y Enrutamiento Inicial (NexusSync AI)
 * Conexión directa con el motor de Supabase - VERSIÓN 2.0 (Telemetría Activa)
 */

const AuthController = {
    init() {
        // Indicador de versión para confirmar que el caché ha sido purgado
        console.log("🔒 [V2.0] Escudo de Seguridad Activado. Esperando ignición de credenciales...");
        const form = document.getElementById('form-login');
        if (form) {
            form.addEventListener('submit', (e) => this.procesarLogin(e));
        }
    },

    async procesarLogin(evento) {
        evento.preventDefault();
        
        const email = document.getElementById('input-email').value.toLowerCase();
        const password = document.getElementById('input-password').value;
        const btn = document.getElementById('btn-submit');
        const errorBox = document.getElementById('login-error');
        const errorMsg = document.getElementById('error-msg');

        // Reset visual del ecosistema
        errorBox.classList.add('hidden');
        const btnOriginalText = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Estableciendo conexión con Supabase...`;
        btn.disabled = true;

        try {
            // 1. IGNICIÓN SUPABASE
            // Ahora utilizamos supabaseClient en lugar de supabase
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error;

            console.log("✅ Fusión completada. Acesso Concedido.");

            // 2. EXTRACCIÓN DE METADATOS
            const usuario = data.user;
            const rol = usuario.user_metadata?.rol || 'miembro'; 
            
            localStorage.setItem('nexus_session', JSON.stringify({ 
                email: usuario.email, 
                rol: rol,
                token: data.session.access_token
            }));

            // 3. ENRUTAMIENTO TERMODINÁMICO
            const mapaRutas = {
                'admin': '/dashboard/admin',
                'empresa': '/dashboard/admin', 
                'lider': '/dashboard/lider',
                'miembro': '/dashboard/miembro'
            };

            const rutaDestino = mapaRutas[rol] || '/dashboard/miembro';
            
            // Telemetría final antes del salto cuántico
            console.log(`🚀 Iniciando salto hiperespacial hacia la ruta lógica: ${rutaDestino}`);
            
            // Usamos window.location.origin para asegurar una ruta absoluta impecable
            window.location.href = window.location.origin + rutaDestino;

        } catch (error) {
            console.error("❌ Anomalía térmica:", error.message);
            errorMsg.innerText = "Error de validación: " + (error.message || "Credenciales incorrectas.");
            errorBox.classList.remove('hidden');
            btn.innerHTML = btnOriginalText;
            btn.disabled = false;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AuthController.init();
});