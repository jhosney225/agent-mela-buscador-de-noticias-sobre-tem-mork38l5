```javascript
#!/usr/bin/env node

const https = require('https');
const readline = require('readline');

// Configuración
const NEWS_API_KEY = 'demo'; // Usar NewsAPI.org
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

// Interfaz de línea de comandos
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para hacer peticiones HTTP
function fetchNews(query, language = 'es') {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      q: query,
      language: language,
      sortBy: 'publishedAt',
      pageSize: 10,
      apiKey: NEWS_API_KEY
    });

    const url = `${NEWS_API_URL}?${params.toString()}`;

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.articles) {
            resolve(result.articles);
          } else {
            reject(new Error('No se encontraron artículos'));
          }
        } catch (error) {
          reject(new Error('Error al procesar respuesta: ' + error.message));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Función para mostrar noticias formateadas
function displayNews(articles) {
  if (!articles || articles.length === 0) {
    console.log('\n❌ No se encontraron noticias para esta búsqueda.\n');
    return;
  }

  console.log(`\n📰 Se encontraron ${articles.length} noticias:\n`);
  console.log('═'.repeat(80));

  articles.forEach((article, index) => {
    console.log(`\n[${index + 1}] ${article.title}`);
    console.log(`Fuente: ${article.source.name}`);
    console.log(`Fecha: ${new Date(article.publishedAt).toLocaleDateString('es-ES')}`);
    console.log(`Descripción: ${article.description || 'No disponible'}`);
    console.log(`URL: ${article.url}`);
    console.log('─'.repeat(80));
  });
}

// Función para mostrar menú principal
function showMenu() {
  console.log('\n' + '═'.repeat(80));
  console.log('🔍 BUSCADOR DE NOTICIAS - Gestor de Temas de Interés');
  console.log('═'.repeat(80));
  console.log('\nOpciones:');
  console.log('1. Buscar noticias por tema');
  console.log('2. Ver temas guardados');
  console.log('3. Guardar tema de interés');
  console.log('4. Buscar en tema guardado');
  console.log('5. Eliminar tema guardado');
  console.log('6. Salir');
  console.log('─'.repeat(80));
}

// Almacenamiento en memoria de temas
const savedTopics = [
  { name: 'Tecnología', keywords: 'tecnología AI inteligencia artificial' },
  { name: 'Economía', keywords: 'economía finanzas mercado' },
  { name: 'Deportes', keywords: 'deportes fútbol' }
];

// Función principal
async function main() {
  console.clear();
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(15) + '🌐 BUSCADOR INTELIGENTE DE NOTICIAS 📰' + ' '.repeat(23) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');

  let running = true;

  while (running) {
    showMenu();

    const choice = await question('\nSelecciona una opción (1-6): ');

    switch (choice.trim()) {
      case '1': {
        const query = await question('\nIngresa el tema a buscar: ');
        if (query.trim()) {
          console.log('\n⏳ Buscando noticias...');
          try {
            const articles = await fetchNews(query.trim());
            displayNews(articles);
          } catch (error) {
            console.log(`\n❌ Error: ${error.message}`);
            console.log('ℹ️  Nota: Utiliza un API key válido de NewsAPI.org para búsquedas reales.');
          }
        } else {
          console.log('\n⚠️  Por favor ingresa un tema válido.');
        }
        break;
      }

      case '2': {
        console.log('\n📌 Temas guardados:');
        console.log('─'.repeat(80));
        if (savedTopics.length === 0) {
          console.log('No hay temas guardados.');
        } else {
          savedTopics.forEach((topic, index) => {
            console.log(`${index + 1}. ${topic.name}`);
            console.log(`   Palabras clave: ${topic.keywords}`);
          });
        }
        console.log('─'.repeat(80));
        break;
      }

      case '3': {
        const topicName = await question('\nNombre del tema: ');
        const keywords = await question('Palabras clave (separadas por espacios): ');

        if (topicName.trim() && keywords.trim()) {
          savedTopics.push({
            name: topicName.trim(),
            keywords: keywords.trim()
          });
          console.log(`\