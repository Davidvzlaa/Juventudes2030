import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export default function ModalCambioPassword() {
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Extraemos los datos del usuario logueado
  const { usuarioDatos } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (nuevaPassword.length < 8) {
      return setError('La contraseña debe tener al menos 8 caracteres.');
    }
    if (nuevaPassword !== confirmarPassword) {
      return setError('Las contraseñas no coinciden.');
    }

    setLoading(true);

    try {
      // 1. Actualizamos la contraseña en Supabase Auth
      const { error: errAuth } = await supabase.auth.updateUser({
        password: nuevaPassword
      });

      if (errAuth) throw errAuth;

      // 2. Actualizamos la bandera en tu tabla pública 'usuarios'
      const { error: errTabla } = await supabase
        .from('usuarios')
        .update({ requiere_cambio_password: false })
        .eq('id', usuarioDatos?.id);

      if (errTabla) throw errTabla;

      alert("¡Contraseña actualizada con éxito!");
      
    } catch (err: any) {
      setError(err.message || 'Hubo un problema al actualizar la contraseña.');
      setLoading(false);
    }
  };

  return (
    // Overlay oscuro con desenfoque (backdrop-blur) que bloquea toda la pantalla
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      
      {/* Contenedor del Modal */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Actualiza tu contraseña</h2>
          <p className="text-sm text-gray-500 mb-6">
            Por seguridad, es obligatorio cambiar la contraseña temporal asignada por el administrador antes de acceder a tu panel.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
              <input 
                type="password" 
                required 
                className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
              <input 
                type="password" 
                required 
                className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white p-2.5 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Actualizando...' : 'Guardar y Entrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
    </div>
  );
}