// JSON.parse -- распаковщик (задача взять привычку - строку и преобразовать ее в массив JavaScript); || [] -- это подстраховка (т.е если localStprage вернул null, то JSON.parse не даст массива, т.е если левая часть вернула null то habits === [])
const habits = JSON.parse(localStorage.getItem('myHabits')) || []; //localStorage -- обращаемся к локальному хранилищю браузера (просим дать что лежит под ключом myHabits)

// находим элеметы из index.html и сохраняем их в константы
const habitForm = document.querySelector('#habit-form'); 
const habitInput = document.querySelector('#habit-input')
const list = document.querySelector('#habits-list');
const totalCount = document.querySelector('#total-count');
const completedCount = document.querySelector('#completed-count');
const progressBar = document.querySelector(`#progress-bar`);
const progressText = document.querySelector(`#progress-text`);
const clearAllBtn = document.querySelector('#clear-all-btn');
const weekProgress = document.querySelector('#week-progress');
const monthProgress = document.querySelector('#month-progress');
const topHabitsList = document.querySelector('#top-habits-list');

const getToday = () => {
    return new Date().toISOString().split('T')[0];
};

const getLast7Days = () => {

    const days = [];

    for (let i = 6; i >= 0; i--) {

        const date = new Date();

        date.setDate(date.getDate() - i);

        days.push({
            date: date.toISOString().split('T')[0],
            dayName: date.toLocaleDateString('ru-RU', {
                weekday: 'short'
            })
        });
    }

    return days;
};

const createCalendarView = (habit) => {

    return getLast7Days()
        .map(day => {

            const completed =
                habit.dates.includes(day.date);

            return `
            <div class="calendar-cell">
                <span class="calendar-weekday">
                    ${day.dayName}
                </span>

                <span class="${completed ? 'calendar-done' : 'calendar-missed'}">
                    ${completed ? '✓' : '✗'}
                </span>
            </div>
            `;
        })
        .join('');
};
const calculateStreak = (dates) => {

    if (dates.length === 0) {
        return 0;
    }

    const sortedDates = [...dates].sort().reverse();

    let streak = 1;

    for (let i = 0; i < sortedDates.length - 1; i++) {

        const current = new Date(sortedDates[i]);
        const previous = new Date(sortedDates[i + 1]);

        const difference =
            (current - previous) / (1000 * 60 * 60 * 24);

        if (difference === 1) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
};

const updateTopHabits = () => {

    const habitsWithPercent = habits.map(habit => {

        const percent = Math.round(
            (habit.dates.length / 30) * 100
        );

        return {
            text: habit.text,
            percent: percent
        };

    });

    const topHabits = habitsWithPercent
        .sort((a, b) => b.percent - a.percent)
        .slice(0, 3);

    topHabitsList.innerHTML = '';

    topHabits.forEach((habit, index) => {

        topHabitsList.insertAdjacentHTML(
            'beforeend',

            `
            <div class="top-item">
                ${index + 1}. ${habit.text} — ${habit.percent}%
            </div>
            `
        );

    });

};

const calculatePeriodStats = () => {

    const today = new Date();

    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setMonth(today.getMonth() - 1);

    let weekCompleted = 0;
    let monthCompleted = 0;

    habits.forEach(habit => {

        habit.dates.forEach(date => {

            const completedDate = new Date(date);

            if (completedDate >= weekAgo) {
                weekCompleted++;
            }

            if (completedDate >= monthAgo) {
                monthCompleted++;
            }

        });

    });

    const maxWeek = habits.length * 7;
    const maxMonth = habits.length * 30;

    const weekPercent =
        maxWeek === 0
            ? 0
            : Math.round((weekCompleted / maxWeek) * 100);

    const monthPercent =
        maxMonth === 0
            ? 0
            : Math.round((monthCompleted / maxMonth) * 100);

    weekProgress.textContent =
        `За неделю: ${weekPercent}%`;

    monthProgress.textContent =
        `За месяц: ${monthPercent}%`;
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
};

const updateStats = () => {
    const completed = habits.filter(
    habit => habit.dates.includes(getToday())
).length;

    totalCount.textContent = `Всего: ${habits.length}`;
    completedCount.textContent = `Выполнено: ${completed}`;

    const percentage = 
        habits.length === 0
            ? 0
            : Math.round((completed / habits.length) * 100);

    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `Прогресс: ${percentage}%`;
};

const render = () => {

    list.innerHTML = '';

    habits.forEach((habit, index) => {

        const isCompletedToday =
            habit.dates.includes(getToday());

        const history = habit.dates
        .slice(-7)
        .reverse()
        .map(date => formatDate(date))
        .join(' • ');

        const streak = calculateStreak(habit.dates);

        const calendar = createCalendarView(habit);

        const habitElement = `
            <div class="habit-item">
                <div class="habit-left">
                    <input type="checkbox"
                        class="status-checkbox"
                        data-index="${index}"
                        ${isCompletedToday ? 'checked' : ''}>

                    <div class="habit-info">
                        <span class="${isCompletedToday ? 'completed' : ''}">
                            ${habit.text}
                        </span>

                        <small class="habit-history">
                            ${history || 'Не выполнено'}
                        </small>

                        <div class="calendar-view">
                            ${calendar}
                        </div>

                        <small class="habit-streak">
                            🔥 ${streak} дн.
                        </small>
                    </div>
                </div>

               <div class="habit-actions">
                    <button class="edit-btn" data-index="${index}">
                        Изменить
                    </button>

                    <button class="delete-btn" data-index="${index}">
                        Удалить
                    </button>
                </div>
            </div>
        `;

        list.insertAdjacentHTML('beforeend', habitElement);
    });

    updateStats();
    calculatePeriodStats();
    updateTopHabits();
};

render();

habitForm.addEventListener('submit', (event) => {
    // фиксируем момент нажатия кнопки
    event.preventDefault(); // говорим браузеру не вздумай перезагружать страницу
    
    const text = habitInput.value.trim();

    if (text !== '') {
        habits.push({
            text: text,
            dates: []
        });
        saveToLocalStorage();
        habitInput.value = ''; // отчищаем поле ввода после добавления привычки

        console.log('Текущий список привычек:', habits);
        render();
    }
});

list.addEventListener('click', (event) => {
    if (event.target.classList.contains('edit-btn')) {

        const index = event.target.dataset.index;

        const newText = prompt(
            'Введите новое название привычки:',
            habits[index].text
        );

        if (newText && newText.trim() !== '') {

            habits[index].text = newText.trim();

            saveToLocalStorage();
            render();
        }

    } else if (event.target.classList.contains('delete-btn')) {

        const index = event.target.dataset.index;

        habits.splice(index, 1);

        saveToLocalStorage();
        render();
    }
});

const saveToLocalStorage = () => {
    localStorage.setItem('myHabits', JSON.stringify(habits)); // localStorage - втроенный в браузере хранилище данных (Данные в нем не стираются даже после закрытия браузера или перезагрузки компьютера.)
    // .setItem('myHabits', ...) -- Это команда «положить в сейф». ; 'myHabits' - ключ (который можно обозвать как угодно)
    // JSON.stringify(habits) - habits (мой массив);  JSON.stringify() -- упаковщик (преобразует массив habbits в одну длинную строку текста)
};

list.addEventListener('change', (event) => {
    if (event.target.classList.contains('status-checkbox')) {

        const index = event.target.dataset.index;
        const today = getToday();

        if (event.target.checked) {

            if (!habits[index].dates.includes(today)) {
                habits[index].dates.push(today);
            }

        } else {

            habits[index].dates =
                habits[index].dates.filter(date => date !== today);

        }

        saveToLocalStorage();
        render();
    }
});

clearAllBtn.addEventListener('click', () => {
    if (habits.length === 0) {
        alert('Список привычек пуст.');
        return;
    }

    const confirmed = confirm(
        'Вы уверены, что хотите удалить все привычки?'
    );

    if (confirmed) {
        habits.length = 0;

        saveToLocalStorage();
        render();
    }
});