// Fetch das informações globais
(async () => {
    let response = await axios.get('https://api.covid19api.com/summary');

    if (response.status === 200) {
        loadKPI(response.data.Global);
        loadBarChart(response.data.Countries);
        loadPieChart(response.data.Global);
        // console.log(response.data);
    }
})();

// Lógica para o preenchimento dos KPIs
function loadKPI(json) {
    document.getElementById('confirmed').textContent = json.TotalConfirmed.toLocaleString('pt-BR');
    document.getElementById('death').textContent = json.TotalDeaths.toLocaleString('pt-BR');
    document.getElementById('recovered').textContent = json.TotalRecovered.toLocaleString('pt-BR');

    let dataDados = new Date(json.Date);
    document.getElementById('date').textContent = `Data de atualização: ${dataDados.getDate()}/${dataDados.getMonth()+1}/${dataDados.getFullYear()}`;
}

// Lógica para confecção do gráfico de barras
function loadBarChart(json) {
    let sortedCountries = _.orderBy(json, ['TotalDeaths', 'Country'], ['desc', 'asc']);
    let slicedCountries = _.slice(sortedCountries, 0, 10);

    let countriesMapped = _.map(slicedCountries, 'Country');
    let totalDeathsMapped = _.map(slicedCountries, 'TotalDeaths');

    let bar = new Chart(document.getElementById('barras'), {
        type: 'bar',
        data: {
            labels: countriesMapped,
            datasets: [
                {
                    label: 'Total de mortes',
                    data: totalDeathsMapped,
                    backgroundColor: 'rgb(153, 102, 255)'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Top 10 número de mortes por país',
                    font: {
                        size: 20
                    }
                }
            }
        }
    });
}

// Lógica para confecção do gráfico de setores
function loadPieChart(json) {
    let totalData = [json.NewConfirmed, json.NewDeaths, json.NewRecovered];

    let pie = new Chart(document.getElementById('pizza'), {
        type: 'pie',
        data: {
            labels: ['Confirmados', 'Mortes', 'Recuperados'],
            datasets: [
                {
                    data: totalData,
                    backgroundColor: [
                        'rgb(255, 99, 132)',
                        'rgb(54, 162, 235)',
                        'rgb(255, 205, 86)'
                    ]
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Distribuição de novos casos',
                    font: {
                        size: 20
                    }
                }
            }
        }
    });
}