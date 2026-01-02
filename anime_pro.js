(function () {
    'use strict';

    function AnimeTMDB() {
        var network = new Lampa.Request();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var html    = $('<div class="category-full"></div>');

        this.create = function () {
            this.load();
            return scroll.render();
        };

        this.load = function () {
            var _this = this;
            Lampa.Loading.start();
            // Используем нативный метод API Лампы
            var url = 'discover/tv?with_genres=16&with_original_language=ja&language=ru-RU&sort_by=popularity.desc';

            network.api(url, function (json) {
                Lampa.Loading.stop();
                if (json && json.results) {
                    _this.build(json.results);
                } else {
                    Lampa.Noty.show('Список пуст');
                }
            }, function () {
                Lampa.Loading.stop();
                Lampa.Noty.show('Ошибка сети');
            });
        };

        this.build = function (results) {
            var _this = this;
            scroll.append(html);
            html.empty();

            results.forEach(function (item) {
                if (!item.poster_path) return;

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

        this.render = function () { return scroll.render(); };
        this.destroy = function () { network.clear(); scroll.destroy(); html.remove(); };
    }

    function startPlugin() {
        // Регистрируем компонент
        Lampa.Component.add('anime_tmdb', AnimeTMDB);

        // Добавляем пункт меню (простой и надежный способ)
        var item = {
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

        // Официальный метод добавления
        Lampa.Menu.add(item);
    }

    // Запуск без лишних вложений
    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') startPlugin();
    });

})();
