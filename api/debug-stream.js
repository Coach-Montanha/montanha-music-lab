export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const logs = [];
  try {
    logs.push('1. Iniciando teste');
    logs.push('Node version: ' + process.version);
    
    logs.push('2. Importando @distube/ytdl-core');
    const { Ytdl } = await import('@distube/ytdl-core');
    logs.push('3. Ytdl importado com sucesso');

    const client = new Ytdl();
    logs.push('4. Ytdl instanciado com sucesso');

    logs.push('5. Chamando getInfo para 6rL4em-Xv5o');
    const info = await client.getInfo('6rL4em-Xv5o');
    logs.push('6. getInfo sucesso, formatos: ' + info.formats.length);

    return res.status(200).json({ success: true, logs });
  } catch (err) {
    logs.push('ERRO: ' + (err?.stack || err?.message || String(err)));
    return res.status(200).json({ success: false, logs });
  }
}
