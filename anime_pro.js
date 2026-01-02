(function () {
    'use strict';

    function AnimeComponent() {
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

            // Берем настройки напрямую из ядра, как это делает Lampac
            var proxy = Lampa.Storage.get('tmdb_proxy', 'https://api.themoviedb.org/3/');
            var api_key = Lampa.Storage.get('tmdb_api_key', '4ef0d35509cc14c9ef8952448ca32757');
            var url = proxy + 'discover/tv?api_key=' + api_key + '&with_genres=16&with_original_language=ja&language=ru-RU&sort_by=popularity.desc';

            network.silent(url, function (json) {
                Lampa.Loading.stop();
                if (json && json.results && json.results.length) _this.build(json.results);
                else _this.empty('TMDB не вернул данных (проверьте прокси)');
            }, function () {
                Lampa.Loading.stop();
                _this.empty('Ошибка сети (заблокировано провайдером или CORS)');
            });
        };

        this.build = function (results) {
            html.empty();
            results.forEach(function (item) {
                if (!item.poster_path) return;
                var card = new Lampa.Card({
                    title: item.name || item.original_name,
                    img: Lampa.TMDB.image(item.poster_path),
                    year: item.first_air_date ? item.first_air_date.split('-')[0] : ''
                });
                card.create();
                card.on('click', function () {
                    Lampa.Activity.push({
                        title: item.name || item.original_name,
                        component: 'full',
                        id: item.id,
                        method: 'tv',
                        card: item
                    });
                });
                html.append(card.render());
            });
            Lampa.Controller.enable('content');
        };

        this.empty = function(msg) {
            html.html('<div style="text-align:center; margin-top:100px; color:#fff;">' + msg + '</div>');
        };

        this.render = function () { return scroll.render(); };
        this.destroy = function () { network.clear(); if(scroll) scroll.destroy(); };
    }

    // 1. Регистрация компонента
    Lampa.Component.add('anime_final', AnimeComponent);

    // 2. Метод вставки в стиле Online Mod
    function addMenu() {
        if ($('.menu [data-action="anime_final"]').length) return;

        var list = $('.menu .menu__list, .menu__list');
        if (list.length) {
            var item = $(`
                <div class="menu__item selector" data-action="anime_final">
                    <div class="menu__ico">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                    </div>
                    <div class="menu__text">Аниме</div>
                </div>
            `);

            item.on('click', function () {
                Lampa.Activity.push({ title: 'Аниме', component: 'anime_final' });
            });

            var tv = list.find('[data-action="tv"]');
            if (tv.length) tv.after(item);
            else list.append(item);
        }
    }

    // 3. Тройной запуск для надежности (Lampac-style)
    // Слушаем приложение
    Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') addMenu();
    });

    // Постоянно проверяем (раз в 500мс), чтобы кнопка не исчезала при перерисовке
    setInterval(addMenu, 500);

    // Добавляем принудительно, если скрипт загружен позже ядра
    if (window.appready) addMenu();
})();
