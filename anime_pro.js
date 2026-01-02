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

            // Берем настройки прокси прямо из системы, как в online_mod
            var proxy = Lampa.Storage.get('tmdb_proxy', 'https://api.themoviedb.org/3/');
            var api_key = Lampa.Storage.get('tmdb_api_key', '4ef0d35509cc14c9ef8952448ca32757');
            
            // Формируем URL по шаблону Lampac
            var url = proxy + 'discover/tv?api_key=' + api_key + '&with_genres=16&with_original_language=ja&language=ru-RU&sort_by=popularity.desc';

            // Используем silent-метод из Lampa.Network для обхода CORS
            network.silent(url, function (json) {
                Lampa.Loading.stop();
                if (json && json.results && json.results.length) {
                    _this.build(json.results);
                } else {
                    _this.empty('TMDB: Список пуст (Проверьте настройки прокси)');
                }
            }, function () {
                Lampa.Loading.stop();
                _this.empty('Ошибка сети: Lampac заблокировал запрос.');
            });
        };

        this.build = function (results) {
            html.empty();
            results.forEach(function (item) {
                if (!item.poster_path) return;

                // Используем системный метод отрисовки картинок, чтобы не было пустых квадратов
                var card = new Lampa.Card({
                    title: item.name || item.original_name,
                    img: Lampa.TMDB.image(item.poster_path),
                    year: item.first_air_date ? item.first_air_date.split('-')[0] : ''
                });

                card.create();
                card.on('click', function () {
                    // Переход в карточку (логика Lampac)
                    Lampa.Activity.push({
                        url: '',
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
            html.html('<div style="text-align:center; margin-top:100px; color:#fff; font-size:1.2em;">' + msg + '</div>');
        };

        this.render = function () { return scroll.render(); };
        this.destroy = function () { network.clear(); if(scroll) scroll.destroy(); };
    }

    // Регистрация в стиле Lampac
    Lampa.Component.add('anime_hybrid', AnimeComponent);

    function injectMenu() {
        if ($('.menu [data-action="anime_hybrid"]').length) return;
        
        var list = $('.menu .menu__list, .menu__list');
        if (list.length) {
            var item = $(`
                <div class="menu__item selector" data-action="anime_hybrid">
                    <div class="menu__ico">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                    </div>
                    <div class="menu__text">Аниме</div>
                </div>
            `);

            item.on('click', function () {
                Lampa.Activity.push({ title: 'Аниме Онлайн', component: 'anime_hybrid' });
            });

            // Вставляем после Сериалов
            var tv = list.find('[data-action="tv"]');
            if (tv.length) tv.after(item);
            else list.append(item);
        }
    }

    // Запускаем мониторинг как в online_mod
    setInterval(injectMenu, 1000);

})();
