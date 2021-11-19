var realImage = [];
var colorBase = [];
var chartData = null;
var theBest = [];
const numberTriagles = 100;
const populationSize = 100;
const eliteSize = 10;
const epochs = (100 * 1000);
const plotChart = 100;
const mutationRate = 0.01;

//declarando elementos
const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');

const canvas2 = document.getElementById("canvas2");
const context2 = canvas2.getContext('2d');

const chartCanvas = document.getElementById('chart');
const chartCtx = chartCanvas.getContext('2d');

const text = document.getElementById("infor");

//capturando o tamanho do canvas
const width = canvas.width;
const height = canvas.height;

window.onload = function () {

    //desesenhando imagem no canvas
    const image = document.getElementById("image");
    context.drawImage(image, 0, 0, width, height);

    // context2.beginPath();
    // context2.fillStyle = "rgba(100,25,2,0.5)";
    // context2.arc(100, 100, 50, 0, 2 * Math.PI);
    // context2.fill();

    //pegando o shape da image data do canvas [12,121,12,212,121...]1
    realImage = context.getImageData(0, 0, width, height);
    // let temp = trasnformCanal(realImage.data);
    // colorBase = mediaCanal(temp);

    //inicializa chart
    chartData = new Chart(chartCtx, {
        type: "line",
        data: [],
        options: {
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Fitness'
                }
            }
        }
    })

    genalg(epochs);
    // test();

}


function createIdividual(size = numberTriagles) {

    var data = [];

    for (let i = 0; i < size; i++) {

        let temp = []

        //vertices
        for (let j = 0; j < 3; j++) {
            let vx = Math.random() * (width - 1);
            let vy = Math.random() * (height - 1);
            temp.push(vx, vy)
        }

        //cor rgba
        let red = Math.random() * (255 - 1);
        let green = Math.random() * (255 - 1);
        let blue = Math.random() * (255 - 1);
        let aplha = Math.random();

        temp.push(red);
        temp.push(green);
        temp.push(blue);
        temp.push(aplha);

        data.push(temp);
    }

    return data;

}

function create_population(size = populationSize) {

    var data = [];

    for (let i = 0; i < size; i++) {
        let temp = createIdividual();
        data.push([temp, 0]);
    }

    return data;

}

function crossover(individuo1, individuo2) {

    var children1 = [];
    var children2 = [];
    var childrens = [];

    let length = individuo1.length;

    //reprodução de dois pontos
    var idx1 = Math.round(Math.random() * (length - 1));
    var idx2 = Math.round(Math.random() * (length - 1));

    if (idx1 > idx2) {
        let temp = idx1;
        idx1 = idx2;
        idx2 = temp;
    }


    for (let i = 0; i < length; i++) {
        if (i <= idx1) {
            children1.push(individuo1[i]);
            children2.push(individuo2[i]);
        } else if ((i > idx1) && (i <= idx2)) {
            children1.push(individuo2[i]);
            children2.push(individuo1[i]);
        } else {
            children1.push(individuo1[i]);
            children2.push(individuo2[i]);
        }
    }

    childrens.push(children1);
    childrens.push(children2);

    //retorna um filho
    return childrens;

}

function mutation(individuo) {

    var length = individuo.length;
    var idxIndividuo = Math.round(Math.random() * (length - 1));
    var chromosome = individuo[idxIndividuo];

    p = length * mutationRate;
    var tot = Math.round(Math.random() * (p));

    if (tot < 0) {
        tot = 0;
    } else if (tot > length) {
        tot = 1;
    }

    for (let i = 0; i < tot; i++) {

        let idx = Math.round(Math.random() * (length - 1));
        //represeta as coordenadas 0 a 5
        if (idx % 10 < 6) {
            if (idx % 2) {
                chromosome[idx] = Math.random() * (width - 1);
            } else {
                chromosome[idx] = Math.random() * (height - 1);
            }
        } else if (idx % 10 < 9) {
            //cores
            chromosome[idx] = Math.random() * (255 - 1);
        } else {
            //alpha
            chromosome[idx] = Math.random();
        }

        individuo[idxIndividuo] = chromosome;
    }

    return individuo;

}

//subtrai shape original por newImage e multiplica ao quadrado
function fitness(originalShape, newShape) {

    var length = originalShape.data.length;

    //subtract
    var fitnessValue = 0;
    for (let i = 0; i < length; i++) {
        //subtrair nova imagem por imagem real
        let value = newShape.data[i] - originalShape.data[i];
        //multiplica ap quadrado
        value = value * value;
        //guardar informação
        fitnessValue += value;
    }

    fitnessValue = (fitnessValue) / length;

    return fitnessValue;

}

function compute_fitness(population) {

    let newPopulation = [];

    //calcular score de cada individuo
    for (let i = 0; i < population.length; i++) {

        //redesenhando nova imagem
        draw(population[i][0], context2);
        //mostrando nova imgagem = individuo
        let newImage = context2.getImageData(0, 0, width, height);
        //calculando fitness
        score = fitness(realImage, newImage);

        newPopulation.push([population[i][0], score]);

    }

    newPopulation.sort(function compare(a, b) {
        if (a[1] < b[1]) return -1;
        if (a[1] > b[1]) return 1;
        return 0;
    });

    //mostrando o melhor
    // draw(theBest[0][0], context);

    return newPopulation;

}

function draw(data, ctx) {

    //limpando contexto
    ctx.clearRect(0, 0, width, height);
    // context2.fillStyle = `rgba(${colorBase[0]},${colorBase[1]},${colorBase[2]},${colorBase[3]})`;
    // context2.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < data.length; i++) {
        var img = data[i];
        var path = new Path2D();
        ctx.fillStyle = `rgba(${img[6]},${img[7]},${img[8]},${img[9]})`
        path.moveTo(img[0], img[1]);
        path.lineTo(img[2], img[3]);
        path.lineTo(img[4], img[5]);
        ctx.fill(path);
    }

}

function roulete(population) {

    var fitnessTotal = 0;
    var subtotal = 0;
    var idx = 0;
    var length = (population.length / 2);

    //calcular soma de fitness
    for (let i = 0; i < length; i++) {
        fitnessTotal += population[i][1];
    }

    var choice = Math.random() * (fitnessTotal);

    //escolha
    for (let i = 0; i < population.length; i++) {
        subtotal += population[i][1];
        if (subtotal >= choice) {
            return idx;
        }
        idx++;
    }

    return idx;

}

function new_generation(population) {

    var newPopulation = [];

    let length = populationSize - eliteSize;
    var count = 0;

    do {

        let individuo1 = population[roulete(population)][0]
        let individuo2 = population[roulete(population)][0]

        let childrens = crossover(individuo1, individuo2);

        newIndividuo1 = mutation(childrens[0]);
        newIndividuo2 = mutation(childrens[1]);

        newPopulation.push([childrens[0], 0]);
        newPopulation.push([childrens[1], 0]);

        count += 2;
    } while (count < length)

    return newPopulation;

}

function test() {
    var elite = [];
    var population = create_population();
    population = compute_fitness(population);
    for (let j = 0; j < eliteSize; j++) {
        elite.push(population[j][0])
    }
    population = new_generation(population);
    for (let j = 0; j < elite.length; j++) {
        population.push([elite[j], 0]);
    }
    console.log(population);
    population = compute_fitness(population);
    console.log(population);
}

function genalg(epochs) {

    var population = create_population();
    var bestFitnessScore = [];
    var fitnessAtual = [];
    var fitnessChart = [];
    var generationChart = [];

    //redesenhando nova imagem
    // draw(population[0][0]);

    for (let i = 0; i < epochs; i++) {

        sleep(1000).then(() => {

            var elite = [];

            population = compute_fitness(population);
            fitnessAtual = population[0][1];

            for (let j = 0; j < eliteSize; j++) {
                elite.push(population[j][0])
            }

            if (i == 0) {
                bestFitnessScore = population[0][1];
                draw(population[0][0], context);
            } else if (bestFitnessScore > population[0][1]) {
                bestFitnessScore = population[0][1];
                draw(population[0][0], context);
            }

            population = new_generation(population);

            for (let j = 0; j < elite.length; j++) {
                population.push([elite[j], 0]);
            }

            text.innerText = `Geração: ${(i + 1)} \n`;
            text.innerText += `Fitness: ${Math.round(fitnessAtual)} \n`;
            text.innerText += `Melhor Fitness: ${Math.round(bestFitnessScore)} \n`;


            //plotar grafico x vezes na tela com os dados da fitness
            if (i % (epochs / plotChart) == 0) {
                fitnessChart.push((fitnessAtual).toFixed(1));
                generationChart.push(i);
                drawChart(fitnessChart, generationChart);
            }

        });

    }

}

function drawChart(fitnessList, generationList) {

    chartData.config.data = {
        labels: generationList,
        datasets: [{
            label: 'Fitness',
            data: fitnessList,
            borderWidth: 1
        }]
    };

    chartData.update();

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function trasnformCanal(data) {
    var newData = [];

    for (let i = 0; i < data.length; i += 4) {
        let red = data[i];
        let green = data[i + 1];
        let blue = data[i + 2];
        let aplha = data[i + 3];
        let shape = [red, green, blue, aplha];
        newData.push(shape);
    }

    return newData;
}

function mediaCanal(data) {
    var newData = [];

    var red = 0;
    var green = 0;
    var blue = 0;
    var alpha = 0;

    for (let i = 0; i < data.length; i++) {
        red += data[i][0];
        green += data[i][1];
        blue += data[i][2];
        alpha += data[i][3];
    }

    newData.push(red / (data.length + 1));
    newData.push(green / (data.length + 1));
    newData.push(blue / (data.length + 1));
    newData.push(alpha / (data.length + 1));

    return newData;
}