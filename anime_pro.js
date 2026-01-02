(function () {
    'use strict';

    function AnimePro() {
        this.create = function () {
            var html = $('<div class="empty">Загрузка аниме…</div>');

            // Глобальный поиск — его подхватывают bwa.to / rc / Online Mod
            setTimeout(function () {
                Lampa.Search.open({
                    query: 'аниме',
                    type: 'tv'
                });
            }, 100);

            return html;
        };

        this.destroy = function () {};
    }

    // Регистрируем компонент
    Lampa.Component.add('anime_pro', AnimePro);

    // Добавляем пункт в боковое меню
    function inject() {
        if ($('.menu [data-action="anime_pro"]').length) return;

        var list = $('.menu .menu__list');
        if (!list.length) return;

        var item = $(
            '<div class="menu__item selector" data-action="anime_pro">' +
                '<div class="menu__ico">🎌</div>' +
                '<div class="menu__text">Аниме</div>' +
            '</div>'
        );

        item.on('click', function () {
            Lampa.Activity.push({
                title: 'Аниме',
                component: 'anime_pro'
            });
        });

        list.append(item);
    }

    // Lampa часто перерисовывает меню — контролируем
    setInterval(inject, 1000);

})();
