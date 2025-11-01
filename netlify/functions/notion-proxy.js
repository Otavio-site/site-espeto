const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    console.log('🔧 FUNÇÃO NOTION-PROXY INICIADA');
    
    // DEBUG: Log das variáveis de ambiente
    console.log('📋 Variáveis de ambiente disponíveis:');
    console.log('NOTION_API_KEY:', process.env.NOTION_API_KEY ? '✅ CONFIGURADA' : '❌ NÃO CONFIGURADA');
    console.log('NOTION_DATABASE_ID:', process.env.NOTION_DATABASE_ID ? '✅ CONFIGURADA' : '❌ NÃO CONFIGURADA');
    
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Método não permitido' })
        };
    }

    try {
        const NOTION_API_KEY = process.env.NOTION_API_KEY;
        const DATABASE_ID = process.env.NOTION_DATABASE_ID;

        // DEBUG mais detalhado
        if (!NOTION_API_KEY) {
            console.error('❌ NOTION_API_KEY está vazia ou indefinida');
            return {
                statusCode: 500,
                body: JSON.stringify({ 
                    error: 'NOTION_API_KEY não configurada - Verifique as variáveis de ambiente no Netlify' 
                })
            };
        }

        if (!DATABASE_ID) {
            console.error('❌ NOTION_DATABASE_ID está vazia ou indefinida');
            return {
                statusCode: 500,
                body: JSON.stringify({ 
                    error: 'NOTION_DATABASE_ID não configurada - Verifique as variáveis de ambiente no Netlify' 
                })
            };
        }

        console.log('✅ Todas as variáveis de ambiente estão configuradas');
        console.log('📦 Recebendo dados do pedido...');

        const requestData = JSON.parse(event.body);
        console.log('📝 Dados do pedido recebidos:', JSON.stringify(requestData, null, 2));
        
        const response = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            body: JSON.stringify(requestData)
        });

        console.log('📡 Resposta do Notion:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro do Notion API:', response.status, errorText);
            return {
                statusCode: response.status,
                body: errorText
            };
        }

        const result = await response.json();
        console.log('✅ Pedido criado com sucesso no Notion');
        
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };

    } catch (error) {
        console.error('❌ Erro na função notion-proxy:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Erro interno: ' + error.message 
            })
        };
    }
};