const canvas = document.getElementById('zodiacCanvas');
const ctx = canvas.getContext('2d');
const metronomeSound = document.getElementById('metronomeSound');

let angle = 0;
let rotationSpeed = 0.1;
let rotating = false;
let planetPositions = {};

// Загрузка эфемерид
let ephemerisData = [];

// Функция для загрузки эфемерид из файла
function loadEphemeris() {
    fetch('data.js')
        .then(response => response.text())
        .then(text => {
            eval(text);
            ephemerisData = data; // Теперь ephemerisData содержит ваши эфемериды
            console.log("Эфемериды загружены:", ephemerisData);
        })
        .catch(error => console.error('Ошибка при загрузке эфемерид:', error));
}

// Рисуем круг зодиака
function drawZodiacCircle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(200, 200, 150, 0, 2 * Math.PI);
    ctx.stroke();

    for (let i = 0; i < 12; i++) {
        const angleRad = (i * 30) * (Math.PI / 180); // 30 градусов на сектор
        const x = 200 + 130 * Math.cos(angleRad);
        const y = 200 + 130 * Math.sin(angleRad);
        ctx.fillText(i + 1, x, y);
    }

    // Рисуем точки планет
    drawPlanetPositions();
}

// Рисуем координаты планет
function drawPlanetPositions() {
    for (const [planet, coordinate] of Object.entries(planetPositions)) {
        const angleRad = (coordinate * Math.PI) / 180; // Преобразуем в радианы
        const x = 200 + 150 * Math.cos(angleRad); // радиус 150 для точки
        const y = 200 + 150 * Math.sin(angleRad);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI); // Рисуем круг диаметром 3px
        ctx.fillStyle = "blue"; // Цвет точек
        ctx.fill();
    }
}

// Устанавливаем координаты по дате рождения
function calculateCoordinates() {
    const birthDateInput = document.getElementById('birthDate').value;
    const formattedDate = formatDate(birthDateInput); // Преобразуем дату в нужный формат

    // Логируем дату для отладки
    console.log("Ищем дату:", formattedDate);
    console.log("Доступные даты:", ephemerisData.map(entry => entry.date));

    const foundData = ephemerisData.find(entry => entry.date === formattedDate);

    if (foundData) {
        planetPositions = {
            "Солнце": foundData.sun,
            "Луна": foundData.moon,
            "Меркурий": foundData.mercury,
            "Венера": foundData.venus,
            "Марс": foundData.mars,
            "Юпитер": foundData.jupiter,
            "Сатурн": foundData.saturn,
            "Уран": foundData.uranus,
            "Нептун": foundData.neptune,
            "Плутон": foundData.pluto
        };
        alert(`Координаты для ${birthDateInput} установлены.`);
        drawZodiacCircle(); // Обновляем круг с координатами
    } else {
        alert("Дата не найдена!");
    }
}

// Функция для форматирования даты в нужный формат (ДД.ММ.YYYY)
function formatDate(dateString) {
    const [year, month, day] = dateString.split('-'); // Здесь подразумевается формат YYYY-MM-DD
    return `${day}.${month}.${year}`; // Преобразуем в DD.MM.YYYY
}

// Запускаем вращение стрелки
function startRotation() {
    rotating = true;
    requestAnimationFrame(rotateArrow);
}

// Останавливаем вращение
function stopRotation() {
    rotating = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawZodiacCircle();
}

// Вращаем стрелку
function rotateArrow() {
    if (rotating) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawZodiacCircle();

        const angleRad = angle * (Math.PI / 180);
        const x1 = 200 + 100 * Math.cos(angleRad);
        const y1 = 200 + 100 * Math.sin(angleRad);
        const x2 = 200 + 130 * Math.cos(angleRad);
        const y2 = 200 + 130 * Math.sin(angleRad);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = "red";
        ctx.stroke();

        // Проверка на совпадения угла с координатами планет
        for (const [planet, coordinate] of Object.entries(planetPositions)) {
            if (Math.abs(coordinate - (angle % 360)) < 1) { // Проверка на совпадение с некоторым допуском
                metronomeSound.play();
            }
        }

        angle += rotationSpeed;
        angle %= 360;

        requestAnimationFrame(rotateArrow);
    }
}

// Изменение скорости вращения
function changeSpeed() {
    const inputSpeed = prompt("Введите скорость вращения (градусы за такт):", rotationSpeed);
    if (inputSpeed) {
        rotationSpeed = parseFloat(inputSpeed);
    }
}

// Закрыть программу
function closeProgram() {
    window.close();
}

// Назначаем обработчики событий
document.getElementById('submit').addEventListener('click', setCoordinates); // Устарело, "Сохранить" теперь не требуется
document.getElementById('calculate').addEventListener('click', calculateCoordinates); // Обработчик для "Рассчитать"
document.getElementById('rotate').addEventListener('click', startRotation);
document.getElementById('stop').addEventListener('click', stopRotation);
document.getElementById('setSpeed').addEventListener('click', changeSpeed);
document.getElementById('close').addEventListener('click', closeProgram);

// Загрузка эфемерид при инициализации
loadEphemeris();

// Initial draw
drawZodiacCircle();
