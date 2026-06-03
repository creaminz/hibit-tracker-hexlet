// JSON.parse -- распаковщик (задача взять привычку - строку и преобразовать ее в массив JavaScript); || [] -- это подстраховка (т.е если localStprage вернул null, то JSON.parse не даст массива, т.е если левая часть вернула null то habits === [])
const habits = JSON.parse(localStorage.getItem('myHabits')) || []; //localStorage -- обращаемся к локальному хранилищю браузера (просим дать что лежит под ключом myHabits)

// находим элеметы из index.html и сохраняем их в константы
const habitForm = document.querySelector('#habit-form'); 
const habitInput = document.querySelector('#habit-input')
const list = document.querySelector('#habits-list');

const render = () => {

    list.innerHTML = ''; // отчищаем контейнер (т.е присваиваем пустую строку) перед новой сортировкой
    
    habits.forEach((habit, index) => { //проходим по каждому элементу массива
        const habitElement = `
            <div class="habit-item">
                <div class="habit-left">
                    <input type="checkbox"
                        class="status-checkbox"
                        data-index="${index}"
                        ${habit.completed ? 'checked' : ''}>
                    <span class="${habit.completed ? 'completed' : ''}">${habit.text}</span>
                </div>
                <button class="delete-btn" data-index="${index}">Удалить</button>
            </div>
        `;

        list.insertAdjacentHTML('beforeend', habitElement)
    })
}

render();

habitForm.addEventListener('submit', (event) => {
    // фиксируем момент нажатия кнопки
    event.preventDefault(); // говорим браузеру не вздумай перезагружать страницу
    
    const text = habitInput.value;

    if (text !== '') {
        habits.push({
            text: text,
            completed: false
        });
        saveToLocalStorage();
        habitInput.value = ''; // отчищаем поле ввода после добавления привычки

        console.log('Текущий список привычек:', habits);
        render();
    }
});

list.addEventListener('click', (event) => {
    if(event.target.classList.contains('delete-btn')) { //проверка кликнули ли по кнопке удаления
        const index = event.target.dataset.index; //достаем индекс из атрибута data-index

        habits.splice(index, 1) //удаляем один элемент по индексу
        saveToLocalStorage()

        render();
    }

});

const saveToLocalStorage = () => {
    localStorage.setItem('myHabits', JSON.stringify(habits)); // localStorage - втроенный в браузере хранилище данных (Данные в нем не стираются даже после закрытия браузера или перезагрузки компьютера.)
    // .setItem('myHabits', ...) -- Это команда «положить в сейф». ; 'myHabits' - ключ (который можно обозвать как угодно)
    // JSON.stringify(habits) - habits (мой массив);  JSON.stringify() -- упаковщик (преобразует массив habbits в одну длинную строку текста)
}

list.addEventListener('change', (event) => {
    if (event.target.classList.contains('status-checkbox')) {
        const index = event.target.dataset.index;

        habits[index].completed = event.target.checked;

        saveToLocalStorage();
        render();
    }
})