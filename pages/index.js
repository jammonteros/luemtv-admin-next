import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// 🔧 Configura tus credenciales de Supabase
const SUPABASE_URL = "https://pqnqpuagsfsfarcslhcw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxbnFwdWFnc2ZzZmFyY3NsaGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzODU0OTEsImV4cCI6MjA2Mzk2MTQ5MX0.2-ogc9T26xEFyL_fW5Zt7vj0Q0ZowYNyHmj7AyS5Ieo";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState(null);
  const [nombre, setNombre] = useState("");
  const [url, setUrl] = useState("");
  const [canales, setCanales] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (session) {
      supabase
        .from("canales")
        .select("*")
        .then(({ data, error }) => {
          if (error) {
            console.error("Error al cargar canales:", error);
          } else {
            setCanales(data);
          }
        });
    }
  }, [session]);

  const signIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert("Login fallido");
      console.error(error);
    } else {
      setSession(data.session);
    }
  };

  const agregarCanal = async () => {
    if (!nombre || !url) {
      alert("Faltan datos");
      return;
    }

    const { error, data } = await supabase
      .from("canales")
      .insert([{ nombre, url }])
      .select();

    if (error) {
      console.error("Error al agregar canal:", error);
      alert("Error al guardar canal");
      return;
    }

    setCanales([...canales, ...data]);
    setNombre("");
    setUrl("");
  };

  if (!session) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Iniciar sesión</h2>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={signIn}>Entrar</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Panel LUEMTV (usuario autenticado)</h2>
      <div>
        <input
          type="text"
          placeholder="Nombre del canal"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="text"
          placeholder="URL del canal"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button onClick={agregarCanal}>Agregar canal</button>
      </div>
      <h3>Lista de canales</h3>
      <ul>
        {canales.map((canal) => (
          <li key={canal.id}>
            <strong>{canal.nombre}</strong>: {canal.url}
          </li>
        ))}
      </ul>
    </div>
  );
}