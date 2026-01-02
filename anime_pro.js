(function () {
    'use strict';

    function AnimeTMDB() {
        var network = new Lampa.Request();
        var scroll, html;

        this.create = function () {
            html = $('<div class="category-full"></div>');
            scroll = new Lampa.Scroll({
                mask: true,
                over: true,
                controller: 'content' // 🔥 КЛЮЧ
            });

            scroll.append(html);
            this.load();

            return scroll.render();
        };

        this.load = function () {
            var _this = this;
            Lampa.Loading.start();

            var url = 'discover/tv' +
                '?with_genres=16' +
                '&with_original_language=ja' +
                '&language=ru-RU' +
                '&sort_by=popularity.desc';

            network.api(url, function (json) {
                Lampa.Loading.stop();
                if (json && Array.isArray(json.results)) {
                    _this.build(json.results);
                } else {
                    Lampa.Noty.show('Аниме: пусто');
                }
            }, function () {
                Lampa.Loading.stop();
                Lampa.Noty.show('Аниме: ошибка сети');
            });
        };

        this.build = function (results) {
            html.empty();

            results.forEach(function (item) {
                if (!item.poster_path) return;

                var title = item.name || item.original_name;
                if (!title) return;

                var card = new Lampa.Card({
                    title: title,
                    img: 'https://image.tmdb.org/t/p/w500' + item.poster_path,
                    year: item.first_air_date ? item.first_air_date.split('-')[0] : ''
                });

                card.create();
                var el = card.render();

                el.addClass('selector'); // 🔥 ОБЯЗАТЕЛЬНО

                el.on('click', function () {
                    Lampa.Search.open({ query: title });
                });

                html.append(el);
            });

            Lampa.Controller.enable('content'); // 🔥
        };

        this.destroy = function () {
            network.clear();
            scroll.destroy();
            html.remove();
        };
    }

    function startPlugin() {
        Lampa.Component.add('anime_tmdb', AnimeTMDB);

        Lampa.Menu.add({
            id: 'anime_tmdb',
            title: 'Аниме Онлайн',
            onSelect: function () {
                Lampa.Activity.push({
                    title: 'Аниме',
                    component: 'anime_tmdb'
                });
            }
        });
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') startPlugin();
    });
})();
