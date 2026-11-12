export function errorHandler(err, _req, res, _next) {
  console.error(err);
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'El código ya existe' });
  }
  res.status(500).json({ error: 'Ocurrió un error interno en el servidor' });
}
