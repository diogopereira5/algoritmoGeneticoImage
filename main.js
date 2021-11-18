var realImage = [];
var mediaAplhaImageReal = [];
var mediaAplhaNewImage = [];
const numberTriagles = 100;
const populationSize = 100;
const eliteSize = 2;
const epochs = (0.001 * 1000);

//declarando elementos
const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');

const canvas2 = document.getElementById("canvas2");
const context2 = canvas2.getContext('2d');

const text = document.getElementById("infor");

//capturando o tamanho do canvas
const width = canvas.width;
const height = canvas.height;

window.onload = function () {

    //desesenhando imagem no canvas
    const image = document.getElementById("image");
    context.drawImage(image, 0, 0, width, height);

    //pegando o shape da image data do canvas [12,121,12,212,121...]1
    realImage = context.getImageData(0, 0, width, height);

    genalg(epochs);

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

    let length = individuo1[0].length;

    //reprodução de dois pontos
    var idx1 = Math.round(Math.random() * (length - 1));
    var idx2 = Math.round(Math.random() * (length - 1));

    if(idx1 > idx2){
        let temp = idx1;
        idx1 = idx2;
        idx2 = temp;
    }

    for (let i = 0; i < length; i++) {
        if (i <= idx1) {
            children1.push(individuo1[0][i]);
            children2.push(individuo2[0][i]);
        } else if((i > idx1) && (i<= idx2)) {
            children1.push(individuo2[0][i]);
            children2.push(individuo1[0][i]);
        }else{
            children1.push(individuo1[0][i]);
            children2.push(individuo2[0][i]);
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

    length = chromosome.length;
    var idx = Math.round(Math.random() * (length - 1));


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
        // //divide por length
        value = value / length
        //guardar informação
        fitnessValue += value;
    }

    return fitnessValue;

}

function compute_fitness(population) {

    let newPopulation = [];

    //calcular score de cada individuo
    for (let i = 0; i < population.length; i++) {
        
            //limpando contexto
            context2.clearRect(0, 0, width, height);
            //redesenhando nova imagem
            drawTriagle(population[i][0], context2);
            //mostrando nova imgagem = individuo
            let newImage = context2.getImageData(0, 0, width, height);
            //calculando fitness
            score = fitness(realImage, newImage);

            newPopulation.push([population[i], score]);
        
    }

    newPopulation.sort(function compare(a, b) {
        if (a[1] < b[1]) return -1;
        if (a[1] > b[1]) return 1;
        return 0;
    });

    // console.log("population", population[0]);

    //mostrando o melhor
    //limpando contexto
    context2.clearRect(0, 0, width, height);
    //redesenhando nova imagem
    drawTriagle(population[0][0]);


    return newPopulation;

}

function drawTriagle(data) {

    for (let i = 0; i < data.length; i++) {
        var img = data[i];
        var path = new Path2D();
        context2.fillStyle = `rgba(${img[6]},${img[7]},${img[8]},${img[9]})`
        path.moveTo(img[0], img[1]);
        path.lineTo(img[2], img[3]);
        path.lineTo(img[4], img[5]);
        context2.fill(path);
    }

}

function roulete(population) {

    var fitnessTotal = 0;
    var subtotal = 0;
    var idx = 0;
    var length = (population.length) / 2

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

    for (let i = 0; i < length; i++) {
        let individuo1 = population[roulete(population)][0]
        let individuo2 = population[roulete(population)][0]
        let childrens = crossover(individuo1, individuo2);

        newIndividuo1 = childrens[0];
        newIndividuo2 = childrens[1];

        newIndividuo1 = mutation(newIndividuo1);
        newIndividuo2 = mutation(newIndividuo2);

        newPopulation.push([newIndividuo1, 0]);
        newPopulation.push([newIndividuo2, 0]);
    }

    return newPopulation;

}

function genalg(epochs) {

    var population = create_population();

    //limpando contexto
    context2.clearRect(0, 0, width, height);
    //redesenhando nova imagem
    drawTriagle(population[0][0]);

    for (let i = 0; i < epochs; i++) {

        sleep(1000).then(() => {

            var elite = [];

            population = compute_fitness(population);

            for (let j = 0; j < eliteSize; j++) {
                elite.push(population[j])
            }

            // console.log(elite[0][1]);

            population = new_generation(population);

            for (let j = 0; j < elite.length; j++) {
                population.push(elite[j]);
            }

            //console.log(elite[0][1]);

            text.innerText = `Geração: ${(i + 1)} \n`;
            text.innerText += `Fitness: ${Math.round(elite[0][1])} \n`;

        });

    }

    // //mostrando o melhor
    // context2.clearRect(0, 0, width, height);
    // drawTriagle(population[0][0]);

    // console.log(population[0][0]);

    // console.log("aqui");

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// function trasnformCanal(data) {
//     var newData = [];

//     for (let i = 0; i < data.length; i += 4) {
//         let red = data[i];
//         let green = data[i + 1];
//         let blue = data[i + 2];
//         let aplha = data[i + 3];
//         let shape = [red, green, blue, aplha];
//         newData.push(shape);
//     }

//     return newData;
// }

// function mediaCanal(data) {
//     var newData = [];

//     var red = 0;
//     var green = 0;
//     var blue = 0;
//     var alpha = 0;

//     for (let i = 0; i < data.length; i++) {
//         red += data[i][0];
//         green += data[i][1];
//         blue += data[i][2];
//         alpha += data[i][3];
//     }

//     newData.push(red / (data.length + 1));
//     newData.push(green / (data.length + 1));
//     newData.push(blue / (data.length + 1));
//     newData.push(alpha / (data.length + 1));

//     return newData;
// }