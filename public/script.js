document.addEventListener('DOMContentLoaded', () => {
    const apiUrlInput = document.getElementById('api-url');
    const btnFetch = document.getElementById('btn-fetch');
    const consoleOutput = document.getElementById('console-output');
    const statusBadge = document.getElementById('status-badge');
    
    const cpuValue = document.getElementById('cpu-value');
    const cpuBar = document.getElementById('cpu-bar');
    const ramValue = document.getElementById('ram-value');
    const ramBar = document.getElementById('ram-bar');
    
    const statLatency = document.getElementById('stat-latency');
    const statUptime = document.getElementById('stat-uptime');
    const statRequests = document.getElementById('stat-requests');

    let requestCount = 0;
    let startTime = Date.now();

    // Recupera URL salva no localStorage ou usa o padrão local
    const savedUrl = localStorage.getItem('dashops_api_url');
    if (savedUrl) {
        apiUrlInput.value = savedUrl;
    }

    // Salva a URL no localStorage ao digitar
    apiUrlInput.addEventListener('input', () => {
        localStorage.setItem('dashops_api_url', apiUrlInput.value.trim());
    });

    // Função para formatar JSON com cores básicas (Highlighting)
    function syntaxHighlight(json) {
        if (typeof json !== 'string') {
            json = JSON.stringify(json, undefined, 2);
        }
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
            let cls = 'json-value';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json-key';
                } else {
                    cls = 'json-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'json-value';
            } else if (/null/.test(match)) {
                cls = 'json-value';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    // Função principal para chamar a API
    async function chamarAPI() {
        let url = apiUrlInput.value.trim();
        
        // Garante que a URL não termine com barra para evitar barra dupla na rota
        if (url.endsWith('/')) {
            url = url.slice(0, -1);
        }
        
        const endpoint = `${url}/v1`;
        
        // Início da medição de latência
        const t0 = performance.now();
        consoleOutput.innerHTML = `<span style="color: var(--text-secondary)">Enviando requisição GET para ${endpoint}...</span>`;
        
        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            const t1 = performance.now();
            const latency = Math.round(t1 - t0);
            
            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }

            const dados = await response.json();
            
            // Incrementa requisições com sucesso
            requestCount++;
            statRequests.textContent = requestCount;
            statLatency.textContent = `${latency} ms`;

            // Atualiza status para Online
            statusBadge.textContent = "Online";
            statusBadge.className = "badge badge-online";

            // Imprime JSON formatado no console
            consoleOutput.innerHTML = syntaxHighlight(dados);

        } catch (error) {
            const t1 = performance.now();
            const latency = Math.round(t1 - t0);

            // Atualiza status para Offline
            statusBadge.textContent = "Offline";
            statusBadge.className = "badge badge-offline";
            statLatency.textContent = `-- ms`;

            consoleOutput.innerHTML = `<span style="color: var(--danger-red)">[ERRO DE CONEXÃO]
Não foi possível conectar à API.
URL tentada: ${endpoint}

Detalhes do erro:
- Latência medida: ${latency}ms
- Descrição: ${error.message}

Verifique se:
1. O container da API do back-end está ativo na porta mapeada (ex: 5000).
2. O CORS está permitindo a chamada da origem atual.
3. Se estiver usando o Render, o cold start pode demorar cerca de 1 minuto para subir a instância.</span>`;
        }
    }

    // Listener do Botão
    btnFetch.addEventListener('click', chamarAPI);

    // --- SIMULAÇÃO EM TEMPO REAL ---

    // 1. Simulação do Uptime
    setInterval(() => {
        const diffMs = Date.now() - startTime;
        const diffSecs = Math.floor(diffMs / 1000);
        const hours = String(Math.floor(diffSecs / 3600)).padStart(2, '0');
        const mins = String(Math.floor((diffSecs % 3600) / 60)).padStart(2, '0');
        const secs = String(diffSecs % 60).padStart(2, '0');
        statUptime.textContent = `${hours}h ${mins}m ${secs}s`;
    }, 1000);

    // 2. Simulação de oscilações de CPU e RAM
    function oscilarMetricas() {
        // CPU oscila entre 8% e 32%
        const cpuPercent = Math.floor(Math.random() * (32 - 8 + 1)) + 8;
        cpuValue.textContent = `${cpuPercent}%`;
        cpuBar.style.width = `${cpuPercent}%`;

        // RAM oscila entre 44% e 48%
        const ramPercent = Math.floor(Math.random() * (48 - 44 + 1)) + 44;
        ramValue.textContent = `${ramPercent}%`;
        ramBar.style.width = `${ramPercent}%`;
    }

    oscilarMetricas();
    setInterval(oscilarMetricas, 3000);
});
// atualizacao v1.0.1 
