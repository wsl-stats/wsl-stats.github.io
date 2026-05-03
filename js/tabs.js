(function () {
    // Найти все кнопки табов и все панели
    const tabs = document.querySelectorAll('.tablink');
    const panels = document.querySelectorAll('.tabpanel');

    // Функция переключения
    function switchTab(tabId) {
        // Скрыть все панели
        panels.forEach(panel => {
            panel.classList.remove('active');
            panel.style.display = 'none';
        });
        // Показать выбранную панель
        const activePanel = document.getElementById(`tab${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
        if (activePanel) {
            activePanel.style.display = 'block';
            activePanel.classList.add('active');
        }
        // Обновить активный класс на кнопках
        tabs.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('active');
            }
        });
    }

    // Навесить обработчики на кнопки
    tabs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // По умолчанию показать первую вкладку (chest)
    const defaultTab = document.querySelector('.tablink.active')?.getAttribute('data-tab') || 'chest';
    switchTab(defaultTab);
})();