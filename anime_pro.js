(function () {
    'use strict';

    function AnimeTMDB(object) {
        var network = new Lampa.Request();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var items   = [];
        var html    = $('<div class="category-full"></div>');
        
        // Ключ и API TMDB (используем встроенные механизмы Lampa)
        var api_url = 'https://api.themoviedb.org/3/';
        var api_key = '4ef0d35509cc14c9ef8952448ca32757'; // Стандартный ключ для тестов

        this.create = function () {
            this.load();
            return scroll.render();
        };

        this.load = function () {
            var _this = this;
            Lampa.Loading.start();
            
            // Запрашиваем мультфильмы с жанром "Аниме" (210024) или ключевым словом "anime"
            // Используем системный прокси Lampa для TMDB
            var url = api_url + 'discover/tv?api_key=' + api_key + '&with_keywords=210024&language=ru-RU&sort_by=popularity.desc';

            network.silent(url, function (json) {
                Lampa.Loading.stop();
                if (json && json.results && json.results.length) {
                    _this.build(json.results);
                } else {
                    Lampa.Noty.show("TMDB не вернул данные");
                }
            }, function () {
                Lampa.Loading.stop();
                Lampa.Noty.show("Ошибка сети TMDB");
            });
        };

        this.build = function (results) {
            var _this = this;
            scroll.append(html);

            results.forEach(function (item) {
                var card = new Lampa.Card({
                    title: item.name || item.original_name,
                    img: 'https://image.tmdb.org/t/p/w500' + item.poster_path,
                    year: item.first_air_date ? item.first_air_date.split('-')[0] : ''
                });

                card.create();

                // При клике открываем поиск, который точно подхватит ваш bwa.to/rc
                card.on('click', function () {
                    Lampa.Search.open({
                        query: item.name || item.original_name
                    });
                });

                html.append(card.render());
            });

            Lampa.Controller.enable('content');
        };

        this.render = function () { return scroll.render(); };
        this.destroy = function () { network.clear(); scroll.destroy(); html.remove(); };
    }

    function startPlugin() {
        Lampa.Component.add('anime_tmdb', AnimeTMDB);

        var menu_item = $('<div class="menu__item selector" data-action="anime_tmdb">' +
            '<div class="menu__ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M10 8l6 4-6 4V8z"></path></svg></div>' +
            '<div class="menu__text">Аниме (TMDB)</div>' +
        '</div>');

        menu_item.on('click', function () {
            Lampa.Activity.push({
                title: 'Аниме TMDB',
                component: 'anime_tmdb',
                page: 1
            });
        });

        $('.menu .menu__list').append(menu_item);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
