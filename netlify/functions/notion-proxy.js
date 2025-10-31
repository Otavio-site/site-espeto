export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido" };
  }

  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const DATABASE_ID = process.env.DATABASE_ID;

  if (!NOTION_API_KEY || !DATABASE_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Variáveis de ambiente não configuradas." }),
    };
  }

  try {
    const data = JSON.parse(event.body);

    // Aqui usamos o fetch nativo do Node 18+ (sem import)
    const notionResponse = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_API_KEY}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: { database_id: DATABASE_ID },
        properties: data.properties,
      }),
    });

    const result = await notionResponse.json();

    if (!notionResponse.ok) {
      console.error("Erro ao enviar para Notion:", result);
      return {
        statusCode: notionResponse.status,
        body: JSON.stringify(result),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("Erro interno:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
