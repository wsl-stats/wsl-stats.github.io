
(function () {
    // Ждём, пока дашборд отрисуется
    function waitForDashboard() {
        return new Promise(resolve => {
            const check = setInterval(() => {
                if (document.getElementById('cyclesDashboard')) {
                    clearInterval(check);
                    resolve();
                }
            }, 100);
        });
    }

    async function setupTabs() {
        await waitForDashboard();

        // 1. Находим оригинальные блоки
        const chestSection = document.querySelector('.events-section');
        const tableWrap = document.querySelector('#TableWrap');
        const containerDiv = document.querySelector('.container');
        const dashboard = document.getElementById('cyclesDashboard');

        // Внутри Dashboard:
        const tinmanCard = dashboard.querySelector('.double-card2 .card:first-child');
        const ratingCard = dashboard.querySelector('.double-card2 .card:last-child');
        const darkCard = dashboard.querySelector('.double-card2:last-of-type .card:first-child');
        const olimpusCard = dashboard.querySelector('.double-card2:last-of-type .card:last-child');
        const rareEpicBlock = dashboard.querySelector('.double-card');

        // 2. Перемещаем КОПИИ? НЕТ! Просто переносим оригиналы в нужные табы.
        // Но перенос сломает refreshAll, который ищет их в #cyclesDashboard.
        // Поэтому мы не переносим, а дублируем? Тоже плохо.

        // Лучше: просто переключаем видимость оригинальных блоков, а табы используем как навигацию.
        // Но нужно, чтобы табы скрывали/показывали эти блоки, не перемещая их.

        // Сделаем так: добавим каждому блоку ID или класс, а табы будут просто скрывать ненужные блоки.

        // Уже существующие блоки:
        // - chest блок: .events-section, #TableWrap, .container – обернём их в один контейнер
        const chestWrapper = document.createElement('div');
        chestWrapper.id = 'chestWrapper';
        chestWrapper.style.display = 'block';
        if (chestSection) chestWrapper.appendChild(chestSection);
        if (tableWrap) chestWrapper.appendChild(tableWrap);
        if (containerDiv) chestWrapper.appendChild(containerDiv);
        dashboard.insertBefore(chestWrapper, dashboard.firstChild);

        // - tinman блок: обернём карточку Tinman + рейтинг в один контейнер
        const tinmanWrapper = document.createElement('div');
        tinmanWrapper.id = 'tinmanWrapper';
        if (tinmanCard && ratingCard) {
            tinmanWrapper.appendChild(tinmanCard);
            tinmanWrapper.appendChild(ratingCard);
            dashboard.insertBefore(tinmanWrapper, darkCard?.parentNode);
        }

        // - events блок: карточки Dark и Olimpus
        const eventsWrapper = document.createElement('div');
        eventsWrapper.id = 'eventsWrapper';
        if (darkCard && olimpusCard) {
            const container = document.createElement('div');
            container.className = 'double-card2';
            container.appendChild(darkCard);
            container.appendChild(olimpusCard);
            eventsWrapper.appendChild(container);
            dashboard.insertBefore(eventsWrapper, rareEpicBlock);
        }

        // - cycles блок: rare/epic
        const cyclesWrapper = document.createElement('div');
        cyclesWrapper.id = 'cyclesWrapper';
        if (rareEpicBlock) {
            cyclesWrapper.appendChild(rareEpicBlock);
            dashboard.appendChild(cyclesWrapper);
        }

        // Скрываем все обёртки, кроме Chest
        const wrappers = {
            chest: document.getElementById('chestWrapper'),
            tinman: document.getElementById('tinmanWrapper'),
            events: document.getElementById('eventsWrapper'),
            cycles: document.getElementById('cyclesWrapper')
        };

        function showTab(tabId) {
            for (let [key, el] of Object.entries(wrappers)) {
                if (el) el.style.display = 'none';
            }
            if (wrappers[tabId]) wrappers[tabId].style.display = 'block';

            // Обновляем активную кнопку
            document.querySelectorAll('.tablink').forEach(btn => btn.classList.remove('active'));
            document.querySelector(`.tablink[data-tab="${tabId}"]`).classList.add('active');
        }

        // Показываем chest по умолчанию
        showTab('chest');

        // Вешаем обработчики на кнопки
        document.querySelectorAll('.tablink').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                showTab(tab);
                // Небольшая задержка для перерисовки графиков
                setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupTabs);
    } else {
        setupTabs();
    }
})();