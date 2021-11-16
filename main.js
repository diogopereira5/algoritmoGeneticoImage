var realImage = [];
var mediaAplhaImageReal = [];
var mediaAplhaNewImage = [];
const numberTriagles = 100;
const populationSize = 100;

window.onload = function () {

    //declarando elementos
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext('2d');

    const canvas2 = document.getElementById("canvas2");
    const context2 = canvas2.getContext('2d');

    //capturando o tamanho do canvas
    const width = canvas.width;
    const height = canvas.height;

    //desesenhando imagem no canvas
    const image = document.getElementById("image");
    context.drawImage(image, 0, 0, width, height);

    //pegando o shape da image data do canvas [12,121,12,212,121...]1
    //tranformando em array de rgba = [[255,225,12,255],...]
    //tirando as medias de cores da imagem real RGBA
    realImage = context.getImageData(0, 0, width, height);
    // realImage = trasnformCanal(shapeImage.data);
    // mediaAplhaImageReal = mediaCanal(realImage);

    //criando individuo inicial teste
    // var individuo = createIdividual(width, height);

    //redesenhando nova imagem
    // drawTriagle(individuo, context2);

    //mostrando nova imgagem = individuo
    // const newImage = context2.getImageData(0, 0, width, height);
    // var shapeArray = trasnformCanal(newShapeImage.data);
    // mediaAplhaNewImage = mediaCanal(newImage);

    //calcular fitness da nova imagem
    // console.log(fitness(realImage, newImage));

    //criando população
    var population = createPopulation(width, height);
    population = compute_fitness(population, context2, width, height);
    // console.log(population[0]);
    // console.log(roulete(population));
    // crossover(population[0][0], population[1][0])

    population = new_generation(population, width, height);
    population = compute_fitness(population, context2, width, height);

    // context2.putImageData(data, 0, 0);

}

function createIdividual(width, height, size = numberTriagles) {

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

function createPopulation(width, height, size = populationSize) {

    var data = [];

    for (let i = 0; i < size; i++) {
        let temp = createIdividual(width, height);
        data.push([temp, 0]);
    }

    return data;

}

function crossover(chromosome1, chromosome2) {

    var children = [];

    let individuo1 = chromosome1[0];
    let individuo2 = chromosome2[0];
    let length = chromosome1[0].length;

    //reprodução de um ponto
    var idx = Math.round(Math.random() * (length));

    for (let i = 0; i < length; i++) {
        if (i <= idx) {
            children.push(individuo1[i])
        } else {
            children.push(individuo2[i])
        }
    }

    //retorna os dois filhos
    return children;

}

function mutation(chromosome, width, height) {

    var length = chromosome.length;
    var idx = Math.round(Math.random() * (length - 1));

    //represeta as coordenadas 0 a 5
    if (idx % 10 < 6) {
        if (idx % 2) {
            chromosome[idx] = Math.round(Math.random() * (width - 1));
        } else {
            chromosome[idx] = Math.round(Math.random() * (height - 1));
        }
    } else if (idx % 10 < 9) {
        //cores
        chromosome[idx] = Math.round(Math.random() * (255 - 1));
    } else {
        //alpha
        chromosome[idx] = Math.random();
    }

    return chromosome;

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
        //divide por length
        value = value / length
        //guardar informação
        fitnessValue += value;
    }

    return fitnessValue;

}

function compute_fitness(population, context, width, height) {

    let newPopulation = [];

    //calcular score de cada individuo
    for (let i = 0; i < population.length; i++) {
        //limpando contexto
        context.clearRect(0, 0, width, height);
        //redesenhando nova imagem
        drawTriagle(population[i][0], context);
        //mostrando nova imgagem = individuo
        let newImage = context.getImageData(0, 0, width, height);
        //calculando fitness
        score = fitness(realImage, newImage)

        newPopulation.push([population[i], score]);
    }

    newPopulation.sort(function compare(a, b) {
        if (a[1] < b[1]) return 1;
        if (a[1] > b[1]) return -1;
        return 0;
    });

    // console.log("population", population[0]);

    //mostrando o melhor
    //limpando contexto
    context.clearRect(0, 0, width, height);
    //redesenhando nova imagem
    drawTriagle(population[0][0], context);

    return newPopulation;

}

function drawTriagle(data, context) {

    for (let i = 0; i < data.length; i++) {
        var img = data[i];
        var path = new Path2D();
        context.fillStyle = `rgba(${img[6]},${img[7]},${img[8]},${img[9]})`
        path.moveTo(img[0], img[1]);
        path.lineTo(img[2], img[3]);
        path.lineTo(img[4], img[5]);
        context.fill(path);
    }

}

function roulete(population) {

    var fitnessTotal = 0;
    var subtotal = 0;
    var idx = 0;

    //calcular soma de fitness
    for (let i = 0; i < population.length; i++) {
        fitnessTotal += population[i][1];
    }

    var choice = Math.random() * (fitnessTotal)

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

function new_generation(population, width, height) {

    var newPopulation = [];

    for (let i = 0; i < populationSize; i++) {
        let individuo1 = population[roulete(population)][0]
        let individuo2 = population[roulete(population)][0]
        let newIndividuo = crossover(individuo1, individuo2);
        newIndividuo = mutation(newIndividuo, width, height);
        newPopulation.push([newIndividuo, 0]);
    }

    return newPopulation;

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