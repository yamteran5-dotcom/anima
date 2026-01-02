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

            // Пытаемся сформировать URL через системные прокси Lampa
            // Если network.api в вашей сборке Lampac пустой, используем прямую ссылку
            var url = 'https://api.themoviedb.org/3/discover/tv?api_key=4ef0d35509cc14c9ef8952448ca32757&with_genres=16&with_original_language=ja&language=ru-RU&sort_by=popularity.desc';

            // Используем стандартный network.silent для обхода внутренних фильтров
            network.silent(url, function (json) {
                Lampa.Loading.stop();
                if (json && json.results && json.results.length) {
                    _this.build(json.results);
                } else {
                    _this.empty('TMDB не вернул данные. Попробуйте сменить прокси в настройках.');
                }
            }, function () {
                Lampa.Loading.stop();
                _this.empty('Ошибка сети: Lampac блокирует прямой запрос к TMDB.');
            });
        };

        this.build = function (results) {
            var _this = this;
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

        this.empty = function(msg) {
            html.html('<div style="text-align:center; margin-top:100px; color:#fff; font-size:1.5em; padding:20px;">' + msg + '</div>');
        };

        this.render = function () { return scroll.render(); };
        this.destroy = function () { network.clear(); if(scroll) scroll.destroy(); html.remove(); };
    }

    // Регистрация компонента
    Lampa.Component.add('anime_final_v42', AnimeComponent);

    // Функция вставки в меню
    function inject() {
        if ($('.menu [data-action="anime_v42"]').length) return;
        var menuList = $('.menu .menu__list, .menu__list');
        if (menuList.length) {
            var menu_item = $(`
                <div class="menu__item selector" data-action="anime_v42">
                    <div class="menu__ico">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                    </div>
                    <div class="menu__text">Аниме</div>
                </div>
            `);

            menu_item.on('click', function () {
                Lampa.Activity.push({
                    title: 'Аниме Онлайн',
                    component: 'anime_final_v42'
                });
            });

            var tv = menuList.find('[data-action="tv"]');
            if (tv.length) tv.after(menu_item);
            else menuList.append(menu_item);
        }
    }

    // Постоянный контроль меню
    setInterval(inject, 1500);

})();
