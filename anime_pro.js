(function () {
    'use strict';

    function AnimePro() {

        this.create = function () {
            var html = $('<div class="empty">Загрузка аниме…</div>');

            // Даём Lampa отрисоваться
            setTimeout(function () {
                Lampa.Search.open({
                    query: 'аниме',
                    type: 'tv'
                });
            }, 200);

            return html;
        };

        this.destroy = function () {};
    }

    // Регистрируем компонент
    Lampa.Component.add('anime_pro', AnimePro);

    // Вставка в меню
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

    setInterval(inject, 1000);

})();
