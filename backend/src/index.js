const restify = require('restify');
const { Pool } = require('pg');

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres', // Usuário do banco de dados
    host: process.env.POSTGRES_HOST || 'db', // Este é o nome do serviço do banco de dados no Docker Compose
    database: process.env.POSTGRES_DB || 'animais',
    password: process.env.POSTGRES_PASSWORD || 'password', // Senha do banco de dados
    port: process.env.POSTGRES_PORT || 5432,
  });

// iniciar o servidor
var server = restify.createServer({
    name: 'pratica-4',
});

// Iniciando o banco de dados
async function initDatabase() {
    try {
        await pool.query('DROP TABLE IF EXISTS animais');
        await pool.query('CREATE TABLE IF NOT EXISTS animais (id SERIAL PRIMARY KEY, nome VARCHAR(255) NOT NULL, especie VARCHAR(255) NOT NULL, sexo VARCHAR(255) NOT NULL, raca VARCHAR(255) NOT NULL, cor VARCHAR(255) NOT NULL, nascimento VARCHAR(255) NOT NULL, microchip VARCHAR(255) NOT NULL)');
        console.log('Banco de dados inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao iniciar o banco de dados, tentando novamente em 5 segundos:', error);
        setTimeout(initDatabase, 5000);
    }
}
// Middleware para permitir o parsing do corpo da requisição
server.use(restify.plugins.bodyParser());

// Endpoint para inserir um novo animal
server.post('/api/v1/animal/inserir', async (req, res, next) => {
    const { nome, especie, sexo, raca, cor, nascimento, microchip } = req.body;

    try {
        const result = await pool.query(
          'INSERT INTO animais (nome, especie, sexo, raca, cor, nascimento, microchip) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [nome, especie, sexo, raca, cor, nascimento, microchip]
        );
        res.send(201, result.rows[0]);
        console.log('Animal inserido com sucesso:', result.rows[0]);
      } catch (error) {
        console.error('Erro ao inserir animal:', error);
        res.send(500, { message: 'Erro ao inserir animal' });
      }
    return next();
});

// Endpoint para listar todos os animais
server.get('/api/v1/animal/listar', async (req, res, next) => {
    try {
      const result = await pool.query('SELECT * FROM animais');
      res.send(result.rows);
      console.log('animais encontrados:', result.rows);
    } catch (error) {
      console.error('Erro ao listar animais:', error);
      res.send(500, { message: 'Erro ao listar animais' });
    }
    return next();
  });

// Endpoint para atualizar um animal existente
server.post('/api/v1/animal/atualizar', async (req, res, next) => {
    const { id, nome, especie, sexo, raca, cor, nascimento, microchip } = req.body;
  
    try {
      const result = await pool.query(
        'UPDATE animais SET nome = $1, especie = $2, sexo = $3, raca = $4, cor = $5, nascimento = $6, microchip = $7 WHERE id = $8 RETURNING *',
        [nome, especie, sexo, raca, cor, nascimento, microchip, id]
      );
      if (result.rowCount === 0) {
        res.send(404, { message: 'Animal não encontrado' });
      } else {
        res.send(200, result.rows[0]);
        console.log('Animal atualizado com sucesso:', result.rows[0]);
      }
    } catch (error) {
      console.error('Erro ao atualizar animal:', error);
      res.send(500, { message: 'Erro ao atualizar animal' });
    }
  
    return next();
  });

// Endpoint para excluir um animal pelo ID
server.post('/api/v1/animal/excluir', async (req, res, next) => {
    const { id } = req.body;
  
    try {
      const result = await pool.query('DELETE FROM animais WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        res.send(404, { message: 'Animal não encontrado' });
      } else {
        res.send(200, { message: 'Animal excluído com sucesso' });
        console.log('Animal excluído com sucesso');
      }
    } catch (error) {
      console.error('Erro ao excluir animal:', error);
      res.send(500, { message: 'Erro ao excluir animal' });
    }
  
    return next();
});
// endpoint para resetar o banco de dados
server.del('/api/v1/database/reset', async (req, res, next) => {
    try {
      await pool.query('DROP TABLE IF EXISTS animais');
      await pool.query('CREATE TABLE animais (id SERIAL PRIMARY KEY, nome VARCHAR(255) NOT NULL, especie VARCHAR(255) NOT NULL, sexo VARCHAR(255) NOT NULL, raca VARCHAR(255) NOT NULL, cor VARCHAR(255) NOT NULL, nascimento VARCHAR(255) NOT NULL, microchip VARCHAR(255) NOT NULL)');
      res.send(200, { message: 'Banco de dados resetado com sucesso' });
      console.log('Banco de dados resetado com sucesso');
    } catch (error) {
      console.error('Erro ao resetar o banco de dados:', error);
      res.send(500, { message: 'Erro ao resetar o banco de dados' });
    }
  
    return next();
});
// iniciar o servidor
var port = process.env.PORT || 5000;
// configurando o CORS
server.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Content-Length, X-Requested-With'
    );
    if (req.method === 'OPTIONS') {
        res.send(200);
    } else {
        next();
    }
});
server.listen(port, function() {
    console.log('Servidor iniciado', server.name, ' na url http://localhost:' + port);
    // Iniciando o banco de dados
    console.log('Iniciando o banco de dados');
    initDatabase();
});
