let data_type = {
    Deaths: 'Mortes',
    Recovered: 'Recuperados',
    Confirmed: 'Confirmados'
}

let lineChart;

!(async () => {
    // Adiciona manipulador de filtro
    document.getElementById('filtro').addEventListener('click', handlerFilter);
    
    // Fetch de dados para KPIs e gráfico de linha
    let response = await Promise.allSettled([
        axios.get('https://api.covid19api.com/countries'),
        axios.get(`https://api.covid19api.com/country/Brazil?from=${new Date(2022, 7, 1, -3, 0, 0).toISOString()}&to=${new Date(2022, 7, 11, -3, 0, 0).toISOString()}`),
        axios.get(`https://api.covid19api.com/country/Brazil?from=${new Date(2022, 6, 31, -3, 0, 0).toISOString()}&to=${new Date(2022, 7, 10, -3, 0, 0).toISOString()}`),
    ]);

    console.log(response);

    if (response[0].status === 'fulfilled') {
        loadComboCountries(response[0].value.data);
    }

    if (response[1].status === 'fulfilled' && response[2].status === 'fulfilled') {
        loadKPI(response[1].value.data);
        loadLineChart(response[1].value.data, response[2].value.data, 'Deaths');
    }
})();

// Lógica para popular a combo de países
function loadComboCountries(json) {
    let combo = document.getElementById('cmbCountry');

    let sortedCountries = _.orderBy(json, 'Country', 'asc');

    for (let country of sortedCountries) {
        combo.options[combo.options.length] = new Option(country.Country, country.Slug, country.Country === 'Brazil', country.Country === 'Brazil');
    }
}

// Lógica para preencher os KPIs
function loadKPI(json) {
    document.getElementById('kpiconfirmed').textContent = _.last(json).Confirmed.toLocaleString('pt-BR');
    document.getElementById('kpideaths').textContent = _.last(json).Deaths.toLocaleString('pt-BR');
    document.getElementById('kpirecovered').textContent = _.last(json).Recovered.toLocaleString('pt-BR');
}

// Lógica para preencher o gráfico de linhas
function loadLineChart(json, jsonDelta, dataType) {
    let dates = _.map(json, 'Date');
    let values = _.map(json, dataType);
    let valuesDelta = _.map(jsonDelta, dataType);

    values = _.forEach(values, (value, key) => {
        values[key] = values[key] - valuesDelta[key];
    });

    let avg = _.times(dates.length, _.constant(_.mean(values)));

    lineChart = new Chart(document.getElementById('linhas'), {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    data: values,
                    label: `Número de ${data_type[dataType]}`,
                    borderColor: 'rgb(255, 140, 13)'
                },
                {
                    data: avg,
                    label: `Média de ${data_type[dataType]}`,
                    borderColor: 'rgb(255, 0, 0)'
                }
            ]
        },
        option: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Bla',
                    font: {
                        size: 20
                    }
                }
            }
        }
    });
}

async function handlerFilter() {
    const country = document.getElementById('cmbCountry').value;
    const typeData = document.getElementById('cmbData').value;
    let startDate = new Date(document.getElementById('date_start').value);
    let endDate = new Date(document.getElementById('date_end').value);

    startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1, -3, 0, 0);
    endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1, -3, 0, 1);

    let startDateDelta = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), -3, 0, 0);
    let endDateDelta = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), -3, 0, 1);

    let response = await Promise.allSettled([
        axios.get(`https://api.covid19api.com/country/${country}?from=${startDate.toISOString()}&to=${endDate.toISOString()}`),
        axios.get(`https://api.covid19api.com/country/${country}?from=${startDateDelta.toISOString()}&to=${endDateDelta.toISOString()}`),
    ]);

    if (response[0].status === 'fulfilled' && response[1].status === 'fulfilled') {
        loadKPI(response[0].value.data);
        lineChart.destroy();
        loadLineChart(response[0].value.data, response[1].value.data, typeData);
    }

}