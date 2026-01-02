(function () {
    'use strict';

    function AnimeTMDB() {
        var network = new Lampa.Request();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var html    = $('<div class="category-full"></div>');

        this.create = function () {
            scroll.append(html);
            this.load();
            return scroll.render();
        };

        this.load = function () {
            var _this = this;
            Lampa.Loading.start();

            // Используем универсальный метод формирования ссылки через TMDB-прокси Lampa
            // Это обходит блокировку "Пустая страница" в 99% случаев
            var url = 'discover/tv?with_genres=16&with_original_language=ja&language=ru-RU&sort_by=popularity.desc';

            // Вызываем через API Lampa, который сам подставит ключ и прокси из настроек
            network.api(url, function (json) {
                Lampa.Loading.stop();
                if (json && json.results && json.results.length) {
                    _this.build(json.results);
                } else {
                    Lampa.Noty.show('TMDB: список пуст');
                }
            }, function () {
                Lampa.Loading.stop();
                Lampa.Noty.show('TMDB: ошибка сети (проверьте настройки прокси)');
            });
        };

        this.build = function (results) {
            html.empty();
            results.forEach(function (item) {
                if (!item.poster_path) return;

                var title = item.name || item.original_name;
                var card = new Lampa.Card({
                    title: title,
                    img: 'https://image.tmdb.org/t/p/w500' + item.poster_path,
                    year: item.first_air_date ? item.first_air_date.split('-')[0] : ''
                });

                card.create();
                var card_html = card.render();

                card_html.on('click', function () {
                    // Это запустит поиск видео через ваш bwa.to/rc
                    Lampa.Search.open({ query: title });
                });

                html.append(card_html);
            });

            Lampa.Controller.enable('content');
        };

        this.render = function () { return scroll.render(); };
        this.destroy = function () { network.clear(); scroll.destroy(); html.remove(); };
    }

    function startPlugin() {
        Lampa.Component.add('anime_tmdb', AnimeTMDB);

        Lampa.Menu.add({
            id: 'anime_tmdb',
            title: 'Аниме Онлайн',
            icon: '<svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M21 7L9 19L3.5 13.5L4.91 12.09L9 16.17L19.59 5.59L21 7Z" fill="white"/></svg>',
            onSelect: function () {
                Lampa.Activity.push({
                    title: 'Аниме',
                    component: 'anime_tmdb'
                });
            }
        });
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') startPlugin(); });
})();
