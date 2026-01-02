(function () {
    'use strict';

    // 1. Описываем сам компонент (каталог аниме)
    function AnimeTMDB() {
        var network = new Lampa.Request();
        var scroll;
        var html = $('<div class="category-full"></div>');

        this.create = function () {
            scroll = new Lampa.Scroll({mask: true, over: true});
            scroll.append(html);
            this.load();
            return scroll.render();
        };

        this.load = function () {
            var _this = this;
            Lampa.Loading.start();
            // Запрос через встроенный метод API
            network.api('discover/tv?with_genres=16&with_original_language=ja&language=ru-RU&sort_by=popularity.desc', function (json) {
                Lampa.Loading.stop();
                if (json && json.results) _this.build(json.results);
            }, function () {
                Lampa.Loading.stop();
                Lampa.Noty.show('Ошибка загрузки данных');
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
            Lampa.Controller.enable('content');
        };

        this.render = function () { return scroll ? scroll.render() : $('<div></div>'); };
        this.destroy = function () { network.clear(); if(scroll) scroll.destroy(); };
    }

    // 2. Функция инициализации
    function startPlugin() {
        // Регистрация компонента
        Lampa.Component.add('anime_tmdb', AnimeTMDB);

        // Регистрация в меню через официальный метод
        var menu_item = {
            id: 'anime_tmdb',
            title: 'Аниме Онлайн',
            icon: '<svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M21 7L9 19L3.5 13.5L4.91 12.09L9 16.17L19.59 5.59L21 7Z" fill="white"/></svg>',
            onSelect: function () {
                Lampa.Activity.push({
                    title: 'Аниме',
                    component: 'anime_tmdb'
                });
            }
        };
        
        // Добавляем пункт в меню
        Lampa.Menu.add(menu_item);
    }

    // 3. Правильный запуск без создания "зависаний"
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') startPlugin();
        });
    }
})();
