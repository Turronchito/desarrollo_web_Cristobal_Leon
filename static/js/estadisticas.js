Highcharts.setOptions({ accessibility: { enabled: false } });

const limpiar = (texto) => String(texto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const getChart = (id) => Highcharts.charts.find((chart) => chart && chart.renderTo.id === id);

const sinDatos = (id, titulo) => {
  let mensaje = document.createElement('p');
  mensaje.innerText = titulo + ': aún no hay datos.';
  document.getElementById(id).append(mensaje);
};

Highcharts.chart('grafico-dia', {
  chart: {
    type: 'line'
  },
  title: {
    text: 'Avistamientos por día'
  },
  xAxis: {
    categories: [],
    title: {
      text: 'Día'
    }
  },
  yAxis: {
    min: 0,
    title: {
      text: 'Cantidad de avistamientos'
    },
    allowDecimals: false
  },
  tooltip: {
    pointFormat: '<b>{point.y}</b> avistamientos'
  },
  series: [{
    name: 'Avistamientos',
    data: []
  }]
});

fetch(`${window.origin}/get-stats-dia`)
  .then((response) => response.json())
  .then((data) => {
    if (data.length === 0) {
      sinDatos('grafico-dia', 'Avistamientos por día');
      return;
    }

    getChart('grafico-dia').update({
      xAxis: {
        categories: data.map((item) => item.date.split('-').reverse().join('-'))
      },
      series: [{
        data: data.map((item) => item.count)
      }]
    });
  })
  .catch((error) => console.error('Error:', error));

Highcharts.chart('grafico-tipo', {
  chart: {
    type: 'pie'
  },
  title: {
    text: 'Avistamientos por tipo de ave'
  },
  tooltip: {
    pointFormat: '<b>{point.y}</b> avistamientos ({point.percentage:.1f}%)'
  },
  plotOptions: {
    pie: {
      allowPointSelect: true,
      cursor: 'pointer',
      dataLabels: {
        enabled: true,
        format: '{point.name}: {point.percentage:.1f}%'
      },
      showInLegend: true
    }
  },
  series: [{
    name: 'Avistamientos',
    colorByPoint: true,
    data: []
  }]
});

fetch(`${window.origin}/get-stats-tipo`)
  .then((response) => response.json())
  .then((data) => {
    if (data.length === 0) {
      sinDatos('grafico-tipo', 'Avistamientos por tipo de ave');
      return;
    }

    getChart('grafico-tipo').update({
      series: [{
        data: data.map((item) => ({ name: limpiar(item.tipo), y: item.count }))
      }]
    });
  })
  .catch((error) => console.error('Error:', error));

Highcharts.chart('grafico-comuna', {
  chart: {
    type: 'column'
  },
  title: {
    text: 'Voluntarios registrados por comuna'
  },
  xAxis: {
    categories: [],
    title: {
      text: 'Comuna'
    }
  },
  yAxis: {
    min: 0,
    title: {
      text: 'Total de voluntarios'
    },
    allowDecimals: false
  },
  tooltip: {
    pointFormat: '<b>{point.y}</b> voluntarios'
  },
  series: [{
    name: 'Voluntarios',
    data: []
  }]
});

fetch(`${window.origin}/get-stats-comuna`)
  .then((response) => response.json())
  .then((data) => {
    if (data.length === 0) {
      sinDatos('grafico-comuna', 'Voluntarios por comuna');
      return;
    }

    getChart('grafico-comuna').update({
      xAxis: {
        categories: data.map((item) => limpiar(item.comuna))
      },
      series: [{
        data: data.map((item) => item.count)
      }]
    });
  })
  .catch((error) => console.error('Error:', error));
