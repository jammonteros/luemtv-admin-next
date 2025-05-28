// Simulamos una base de datos en memoria
let canales = [];

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(canales);
  } else if (req.method === 'POST') {
    const nuevoCanal = req.body;
    canales.push(nuevoCanal);
    res.status(201).json(nuevoCanal);
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
} 