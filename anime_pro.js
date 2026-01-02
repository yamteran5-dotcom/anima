(function () {
    'use strict';

    // 1. Сам компонент каталога
    function AnimeComponent() {
        var network = new Lampa.Request();
        var scroll, html;

        this.create = function () {
            scroll = new Lampa.Scroll({mask: true, over: true});
            html = $('<div class="category-full"></div>');
            scroll.append(html);
            this.load();
            return scroll.render();
        };

        this.load = function () {
            var _this = this;
            Lampa.Loading.start();
            // Нативный запрос через API Lampac/TMDB
            network.api('discover/tv?with_genres=16&with_original_language=ja&language=ru-RU', function (json) {
                Lampa.Loading.stop();
                if (json && json.results) _this.build(json.results);
            }, function () {
                Lampa.Loading.stop();
                Lampa.Noty.show('Ошибка загрузки');
            });
        };

        this.build = function (results) {
            html.empty();
            results.forEach(function (item) {
                var card = new Lampa.Card({
                    title: item.name || item.original_name,
                    img: 'https://image.tmdb.org/t/p/w500' + item.poster_path,
                    year: item.first_air_date ? item.first_air_date.split('-')[0] : ''
                });
                card.create();
                card.on('click', function () {
                    Lampa.Search.open({ query: item.name || item.original_name });
                });
                html.append(card.render());
            });
        };

        this.render = function () { return scroll ? scroll.render() : ''; };
        this.destroy = function () { network.clear(); if(scroll) scroll.destroy(); };
    }

    // 2. Регистрация плагина (Lampac Method)
    Lampa.Plugins.add('anime_plugin', function() {
        // Регистрируем компонент внутри плагина
        Lampa.Component.add('anime_comp', AnimeComponent);

        // Функция добавления в меню
        var add = function() {
            if ($('.menu [data-id="anime_comp"]').length) return;

            Lampa.Menu.add({
                id: 'anime_comp',
                title: 'Аниме Онлайн',
                icon: '<svg height="36" viewBox="0 0 24 24" width="36" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
                onSelect: function () {
                    Lampa.Activity.push({
                        title: 'Аниме',
                        component: 'anime_comp'
                    });
                }
            });
        };

        // Запускаем только если приложение готово
        if (window.appready) add();
        else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') add(); });
    });

})();
