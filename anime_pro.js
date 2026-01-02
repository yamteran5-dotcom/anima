(function () {
    'use strict';

    function AnimeSearch() {
        this.create = function () {
            var html = $('<div class="empty">Загрузка аниме…</div>');

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

    Lampa.Component.add('anime_search', AnimeSearch);

    function inject() {
        if ($('.menu [data-action="anime_search"]').length) return;

        var list = $('.menu .menu__list');
        if (!list.length) return;

        var item = $('<div class="menu__item selector" data-action="anime_search">' +
            '<div class="menu__ico">🎌</div>' +
            '<div class="menu__text">Аниме</div>' +
        '</div>');

        item.on('click', function () {
            Lampa.Activity.push({
                title: 'Аниме',
                component: 'anime_search'
            });
        });

        list.append(item);
    }

    setInterval(inject, 1000);
})();
