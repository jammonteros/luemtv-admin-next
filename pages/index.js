import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

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
    fetch(`${SUPABASE_URL}/rest/v1/canales?select=*`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCanales(data))
      .catch((err) => console.error("Error al cargar canales:", err));
  }, []);

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
    const token = session?.access_token;
    const userId = session?.user?.id;
    if (!token || !userId) {
      alert("No autenticado correctamente");
      return;
    }

    const nuevoCanal = {
      nombre,
      url,
      user_id: userId
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/canales`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(nuevoCanal),
    });

    const data = await res.json();
    console.log("Respuesta POST:", data);
    if (!res.ok) {
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